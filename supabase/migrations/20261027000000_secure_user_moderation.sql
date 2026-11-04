-- ============================================================================
-- Migration: Secure User Moderation, Audit Logging & Mutation Protection
-- Target: KhelBhai Production Supabase Database
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. AUDIT LOGGING TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    target_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN ('suspend', 'ban', 'soft_delete', 'reactivate', 'restore')),
    reason TEXT NOT NULL,
    message TEXT,
    expires_at TIMESTAMPTZ,
    previous_status TEXT NOT NULL,
    new_status TEXT NOT NULL,
    previous_deleted_at TIMESTAMPTZ,
    new_deleted_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Audit records are strictly read-only for admins; immutable (no INSERT/UPDATE/DELETE via client)
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins can view audit logs"
ON public.admin_audit_logs FOR SELECT
TO authenticated
USING (public.is_admin());

REVOKE ALL ON TABLE public.admin_audit_logs FROM PUBLIC;
GRANT SELECT ON TABLE public.admin_audit_logs TO authenticated;

-- ----------------------------------------------------------------------------
-- 2. HELPER FUNCTION: ACCOUNT ACTIVE STATUS EVALUATION
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_account_active(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_status TEXT;
    v_deleted_at TIMESTAMPTZ;
    v_expires_at TIMESTAMPTZ;
BEGIN
    SELECT status, deleted_at, status_expires_at
    INTO v_status, v_deleted_at, v_expires_at
    FROM public.profiles
    WHERE id = p_user_id;

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    -- Soft-deleted accounts are never active
    IF v_deleted_at IS NOT NULL THEN
        RETURN FALSE;
    END IF;

    -- Banned accounts are never active
    IF v_status = 'banned' THEN
        RETURN FALSE;
    END IF;

    -- Suspended accounts: active ONLY if suspension has expired
    IF v_status = 'suspended' THEN
        IF v_expires_at IS NOT NULL AND v_expires_at <= timezone('utc'::text, now()) THEN
            RETURN TRUE;
        END IF;
        RETURN FALSE;
    END IF;

    RETURN (v_status = 'active');
END;
$$;

REVOKE ALL ON FUNCTION public.is_account_active(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_account_active(UUID) TO authenticated;

-- ----------------------------------------------------------------------------
-- 3. SECURE MODERATION RPC: admin_moderate_user
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_moderate_user(
    p_target_user_id UUID,
    p_action TEXT,
    p_reason TEXT,
    p_message TEXT DEFAULT NULL,
    p_expires_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_actor_id UUID;
    v_prev_status TEXT;
    v_prev_deleted_at TIMESTAMPTZ;
    v_new_status TEXT;
    v_new_deleted_at TIMESTAMPTZ;
    v_result JSONB;
BEGIN
    -- 1. Authenticate caller
    v_actor_id := auth.uid();
    IF v_actor_id IS NULL THEN
        RAISE EXCEPTION 'Unauthorized: User is not authenticated' USING ERRCODE = '42501';
    END IF;

    -- 2. Verify admin role using existing role model
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Forbidden: Administrator privileges required' USING ERRCODE = '42501';
    END IF;

    -- 3. Prevent self-moderation
    IF v_actor_id = p_target_user_id THEN
        RAISE EXCEPTION 'Bad Request: Administrators cannot moderate their own account' USING ERRCODE = '22023';
    END IF;

    -- 4. Row locking & fetch target profile state
    SELECT status, deleted_at INTO v_prev_status, v_prev_deleted_at
    FROM public.profiles
    WHERE id = p_target_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Not Found: Target user profile does not exist' USING ERRCODE = 'P0002';
    END IF;

    -- 5. Prevent moderating super admins
    IF EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = p_target_user_id AND role = 'super_admin'
    ) THEN
        RAISE EXCEPTION 'Forbidden: Target account is a protected super_admin' USING ERRCODE = '42501';
    END IF;

    -- 6. State transitions
    IF p_action = 'suspend' THEN
        IF p_reason IS NULL OR trim(p_reason) = '' THEN
            RAISE EXCEPTION 'Bad Request: Suspension reason is mandatory' USING ERRCODE = '22023';
        END IF;
        IF p_expires_at IS NOT NULL AND p_expires_at <= timezone('utc'::text, now()) THEN
            RAISE EXCEPTION 'Bad Request: Suspension expiration must be in the future' USING ERRCODE = '22023';
        END IF;

        v_new_status := 'suspended';
        v_new_deleted_at := v_prev_deleted_at;

        UPDATE public.profiles
        SET status = 'suspended',
            status_reason = trim(p_reason),
            status_message = p_message,
            status_expires_at = p_expires_at,
            updated_at = timezone('utc'::text, now())
        WHERE id = p_target_user_id;

    ELSIF p_action = 'ban' THEN
        IF p_reason IS NULL OR trim(p_reason) = '' THEN
            RAISE EXCEPTION 'Bad Request: Ban reason is mandatory' USING ERRCODE = '22023';
        END IF;

        v_new_status := 'banned';
        v_new_deleted_at := v_prev_deleted_at;

        UPDATE public.profiles
        SET status = 'banned',
            status_reason = trim(p_reason),
            status_message = p_message,
            status_expires_at = NULL,
            updated_at = timezone('utc'::text, now())
        WHERE id = p_target_user_id;

    ELSIF p_action = 'soft_delete' THEN
        v_new_status := v_prev_status;
        v_new_deleted_at := timezone('utc'::text, now());

        UPDATE public.profiles
        SET deleted_at = v_new_deleted_at,
            updated_at = timezone('utc'::text, now())
        WHERE id = p_target_user_id;

    ELSIF p_action = 'reactivate' THEN
        -- Clears suspension or ban, restores status to active
        v_new_status := 'active';
        v_new_deleted_at := v_prev_deleted_at;

        UPDATE public.profiles
        SET status = 'active',
            status_reason = NULL,
            status_message = NULL,
            status_expires_at = NULL,
            updated_at = timezone('utc'::text, now())
        WHERE id = p_target_user_id;

    ELSIF p_action = 'restore' THEN
        -- Restores soft-deleted account by setting deleted_at = NULL
        -- Retains underlying status (e.g. if account was also banned, ban remains)
        v_new_status := v_prev_status;
        v_new_deleted_at := NULL;

        UPDATE public.profiles
        SET deleted_at = NULL,
            updated_at = timezone('utc'::text, now())
        WHERE id = p_target_user_id;

    ELSE
        RAISE EXCEPTION 'Bad Request: Invalid moderation action "%"', p_action USING ERRCODE = '22023';
    END IF;

    -- 7. Transaction-safe audit log
    INSERT INTO public.admin_audit_logs (
        actor_id, target_user_id, action, reason, message, expires_at,
        previous_status, new_status, previous_deleted_at, new_deleted_at
    ) VALUES (
        v_actor_id, p_target_user_id, p_action, coalesce(trim(p_reason), 'Account restored'),
        p_message, p_expires_at, v_prev_status, v_new_status, v_prev_deleted_at, v_new_deleted_at
    );

    -- 8. Return updated state
    SELECT jsonb_build_object(
        'id', id,
        'status', status,
        'status_reason', status_reason,
        'status_message', status_message,
        'status_expires_at', status_expires_at,
        'deleted_at', deleted_at,
        'updated_at', updated_at
    ) INTO v_result
    FROM public.profiles
    WHERE id = p_target_user_id;

    RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_moderate_user(UUID, TEXT, TEXT, TEXT, TIMESTAMPTZ) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_moderate_user(UUID, TEXT, TEXT, TEXT, TIMESTAMPTZ) TO authenticated;

-- ----------------------------------------------------------------------------
-- 4. SERVER-SIDE MUTATION PROTECTION (PRODUCTION ENTRY POINTS)
-- ----------------------------------------------------------------------------

-- A. Activity Creation (public.requests)
DROP POLICY IF EXISTS "Active users can insert requests" ON public.requests;
CREATE POLICY "Active users can insert requests"
ON public.requests
FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = user_id 
    AND public.is_account_active(auth.uid())
);

-- B. Join Request Creation RPC (public.create_join_request)
CREATE OR REPLACE FUNCTION public.create_join_request(
    p_request_id UUID,
    p_message TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_user_id UUID;
    v_host_id UUID;
    v_status TEXT;
    v_join_request_id UUID;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Unauthorized: User is not authenticated' USING ERRCODE = '42501';
    END IF;

    -- Enforce active account check
    IF NOT public.is_account_active(v_user_id) THEN
        RAISE EXCEPTION 'Account restricted: suspended, banned, or deleted accounts cannot join activities' USING ERRCODE = '42501';
    END IF;

    -- Check request existence and status
    SELECT user_id, status INTO v_host_id, v_status
    FROM public.requests
    WHERE id = p_request_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Not Found: Activity request does not exist' USING ERRCODE = 'P0002';
    END IF;

    -- Cannot join own activity
    IF v_host_id = v_user_id THEN
        RAISE EXCEPTION 'Bad Request: Cannot join your own activity' USING ERRCODE = '22023';
    END IF;

    -- Activity must be open
    IF v_status NOT IN ('open', 'active') THEN
        RAISE EXCEPTION 'Bad Request: Activity is not open for new join requests' USING ERRCODE = '22023';
    END IF;

    -- Check duplicate pending or accepted request
    IF EXISTS (
        SELECT 1 FROM public.join_requests
        WHERE request_id = p_request_id
          AND user_id = v_user_id
          AND status IN ('pending', 'accepted')
    ) THEN
        RAISE EXCEPTION 'Bad Request: You have already requested to join or are already participating' USING ERRCODE = '23505';
    END IF;

    INSERT INTO public.join_requests (request_id, user_id, message, status)
    VALUES (p_request_id, v_user_id, p_message, 'pending')
    RETURNING id INTO v_join_request_id;

    RETURN v_join_request_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_join_request(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_join_request(UUID, TEXT) TO authenticated;

-- C. Accept Join Request RPC (public.accept_join_request)
CREATE OR REPLACE FUNCTION public.accept_join_request(p_join_request_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_host_id UUID;
    v_request_id UUID;
    v_applicant_id UUID;
    v_request_status TEXT;
    v_max_participants INT;
    v_current_participants INT;
BEGIN
    IF NOT public.is_account_active(auth.uid()) THEN
        RAISE EXCEPTION 'Account restricted: cannot perform host actions' USING ERRCODE = '42501';
    END IF;

    -- Fetch join request
    SELECT request_id, user_id INTO v_request_id, v_applicant_id
    FROM public.join_requests
    WHERE id = p_join_request_id AND status = 'pending'
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Join request not found or already processed' USING ERRCODE = 'P0002';
    END IF;

    -- Ensure applicant is active
    IF NOT public.is_account_active(v_applicant_id) THEN
        RAISE EXCEPTION 'Cannot accept applicant: account is restricted or deleted' USING ERRCODE = '42501';
    END IF;

    -- Fetch activity & lock
    SELECT user_id, status, coalesce(max_participants, 0), coalesce(current_participants, 0)
    INTO v_host_id, v_request_status, v_max_participants, v_current_participants
    FROM public.requests
    WHERE id = v_request_id
    FOR UPDATE;

    IF v_host_id != auth.uid() THEN
        RAISE EXCEPTION 'Unauthorized: Only the host can accept join requests' USING ERRCODE = '42501';
    END IF;

    IF v_max_participants > 0 AND v_current_participants >= v_max_participants THEN
        RAISE EXCEPTION 'Activity is already full' USING ERRCODE = '22023';
    END IF;

    -- Update join request
    UPDATE public.join_requests 
    SET status = 'accepted', updated_at = now() 
    WHERE id = p_join_request_id;

    -- Insert participant if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'request_participants') THEN
        INSERT INTO public.request_participants (request_id, user_id, join_request_id)
        VALUES (v_request_id, v_applicant_id, p_join_request_id)
        ON CONFLICT DO NOTHING;
    END IF;

    -- Update request participant counts
    UPDATE public.requests
    SET current_participants = current_participants + 1,
        status = CASE 
            WHEN max_participants > 0 AND current_participants + 1 >= max_participants THEN 'full'
            ELSE status
        END,
        updated_at = now()
    WHERE id = v_request_id;
END;
$$;

REVOKE ALL ON FUNCTION public.accept_join_request(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.accept_join_request(UUID) TO authenticated;

-- D. Reject Join Request RPC (public.reject_join_request)
CREATE OR REPLACE FUNCTION public.reject_join_request(p_join_request_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_host_id UUID;
BEGIN
    IF NOT public.is_account_active(auth.uid()) THEN
        RAISE EXCEPTION 'Account restricted: cannot perform host actions' USING ERRCODE = '42501';
    END IF;

    SELECT r.user_id INTO v_host_id
    FROM public.join_requests jr
    JOIN public.requests r ON r.id = jr.request_id
    WHERE jr.id = p_join_request_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Join request not found' USING ERRCODE = 'P0002';
    END IF;

    IF v_host_id != auth.uid() THEN
        RAISE EXCEPTION 'Unauthorized: Only the host can reject join requests' USING ERRCODE = '42501';
    END IF;

    UPDATE public.join_requests
    SET status = 'rejected', updated_at = now()
    WHERE id = p_join_request_id;
END;
$$;

REVOKE ALL ON FUNCTION public.reject_join_request(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reject_join_request(UUID) TO authenticated;

-- E. Cancel Join Request RPC (public.cancel_join_request)
CREATE OR REPLACE FUNCTION public.cancel_join_request(p_join_request_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
    UPDATE public.join_requests
    SET status = 'cancelled', updated_at = now()
    WHERE id = p_join_request_id AND user_id = auth.uid() AND status = 'pending';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Join request not found or cannot be cancelled' USING ERRCODE = 'P0002';
    END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.cancel_join_request(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cancel_join_request(UUID) TO authenticated;

-- F. Direct Join Requests Insert Policy (Fallback Protection)
DROP POLICY IF EXISTS "Active users can insert join requests" ON public.join_requests;
CREATE POLICY "Active users can insert join requests"
ON public.join_requests
FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = user_id 
    AND public.is_account_active(auth.uid())
);

-- G. Chat Messages (public.spot_messages)
DROP POLICY IF EXISTS "spot members send messages" ON public.spot_messages;
CREATE POLICY "spot members send messages"
ON public.spot_messages
FOR INSERT
TO authenticated
WITH CHECK (
    sender_id = auth.uid()
    AND public.is_account_active(auth.uid())
);
