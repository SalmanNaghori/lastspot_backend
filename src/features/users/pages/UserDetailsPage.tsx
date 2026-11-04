import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  UserX,
  RefreshCw,
  ArrowLeft,
  ShieldAlert,
  CheckCircle,
  Smartphone,
  AlertTriangle,
  Clock,
  Calendar,
  CheckCircle2,
  LogOut,
  Bell,
  BellOff,
  Mail,
  Phone,
  MapPin,
  Shield,
  Star,
  FileText,
  Copy,
  Check,
  Database
} from 'lucide-react';
import { adminRepo } from '@/lib/adminRepo';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/app/providers/ToastProvider';
import { useAuth } from '@/app/providers/AuthProvider';
import { AdminStatusBadge, AdminErrorState, AdminLoadingSkeleton } from '@/components/brand';
import { AppStrings } from '@/core/constants/app_strings';
import { ModerationDialog } from '@/features/users/components/ModerationDialog';
import type { ModerationValues } from '@/features/users/components/ModerationDialog';
import type { ModerationAction, ModerationCapabilities } from '@/features/users/types/moderation';
import { type UserDevice, type UserDevicesResponse, DeviceFetchError } from '@/features/devices/api/devices';

interface DeviceErrorInfo {
  type: 'permission_denied' | 'rpc_not_found' | 'general';
  message: string;
  code?: string;
}

const parseDeviceError = (err: any): DeviceErrorInfo => {
  if (err instanceof DeviceFetchError) {
    return {
      type: err.category,
      message: err.message,
      code: err.code
    };
  }
  const msg = err?.message || String(err) || 'Failed to retrieve connected devices';
  const code = err?.code || (err as any)?.context?.status;

  if (
    code === '42501' ||
    code === 401 ||
    code === 403 ||
    msg.toLowerCase().includes('unauthorized') ||
    msg.toLowerCase().includes('forbidden') ||
    msg.toLowerCase().includes('privileges required')
  ) {
    return {
      type: 'permission_denied',
      message: 'Administrator or Super Admin privileges are required to view connected device telemetry.',
      code: code ? String(code) : '42501'
    };
  }

  if (
    code === 'PGRST202' ||
    msg.includes('schema cache') ||
    msg.includes('get_user_devices_for_admin') ||
    (msg.toLowerCase().includes('function') && msg.toLowerCase().includes('not found'))
  ) {
    return {
      type: 'rpc_not_found',
      message: 'Could not find the function public.get_user_devices_for_admin(target_user_id) in the schema cache.',
      code: code ? String(code) : 'PGRST202'
    };
  }

  return {
    type: 'general',
    message: msg,
    code: code ? String(code) : undefined
  };
};

/**
 * Format timestamp with accurate, consistent localized date & time representation
 */
const formatDateTime = (timestamp: string | null | undefined): string => {
  if (!timestamp) return 'Never';
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return 'Invalid date';
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
};

export function UserDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user: actingUser } = useAuth();
  const activeUserId = useRef<string | null>(id || null);

  // User Profile state
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dedicated Connected Devices state
  const [devicesData, setDevicesData] = useState<UserDevicesResponse | null>(null);
  const [devicesLoading, setDevicesLoading] = useState(true);
  const [devicesError, setDevicesError] = useState<DeviceErrorInfo | null>(null);

  // Copy feedback state
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [moderationAction, setModerationAction] = useState<ModerationAction | null>(null);
  const [moderationAccess, setModerationAccess] = useState<{
    actorId: string;
    capabilities: ModerationCapabilities | null;
    error: string | null;
  } | null>(null);
  const [refreshWarning, setRefreshWarning] = useState<string | null>(null);

  useEffect(() => {
    if (!actingUser?.id) return;
    let ignore = false;
    const actorId = actingUser.id;
    adminRepo.getModerationCapabilities().then((capabilities) => {
      if (!ignore) setModerationAccess({ actorId, capabilities, error: null });
    }).catch((failure: unknown) => {
      if (ignore) return;
      const backendMessage = failure && typeof failure === 'object' && 'message' in failure
        && typeof failure.message === 'string' ? failure.message : null;
      setModerationAccess({
        actorId,
        capabilities: null,
        error: backendMessage || AppStrings.Users.moderation.permissionError,
      });
    });
    return () => { ignore = true; };
  }, [actingUser?.id]);

  const copyToClipboard = (text: string, fieldName: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    showToast(`Copied ${fieldName} to clipboard`, 'info');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const loadUser = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const u = await adminRepo.getUserById(id);
      if (!u) {
        throw new Error("User record not found in system");
      }
      setUser(u);
    } catch (err: any) {
      console.error('Error fetching user profile:', err);
      setError(err.message || 'Failed to load user profile details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadDevices = useCallback(async () => {
    if (!id) return;
    setDevicesLoading(true);
    setDevicesError(null);
    try {
      const result = await adminRepo.getUserDevices(id);
      setDevicesData(result);
    } catch (err: any) {
      console.error('Error fetching user devices:', err);
      setDevicesError(parseDeviceError(err));
      setDevicesData(null);
    } finally {
      setDevicesLoading(false);
    }
  }, [id]);

  // Asynchronous user and device retrieval with isolated state handling
  useEffect(() => {
    if (!id) return;
    let ignore = false;
    activeUserId.current = id;

    Promise.allSettled([
      adminRepo.getUserById(id),
      adminRepo.getUserDevices(id),
    ]).then(([userResult, devicesResult]) => {
      if (ignore) return;

      if (userResult.status === 'fulfilled') {
        const u = userResult.value;
        if (!u) {
          setError("User record not found in system");
          setUser(null);
        } else {
          setUser(u);
          setError(null);
        }
      } else {
        setError(userResult.reason?.message || 'Failed to load user profile');
        setUser(null);
      }
      setLoading(false);

      if (devicesResult.status === 'fulfilled') {
        setDevicesData(devicesResult.value);
        setDevicesError(null);
      } else {
        setDevicesError(parseDeviceError(devicesResult.reason));
        setDevicesData(null);
      }
      setDevicesLoading(false);
    });

    return () => {
      ignore = true;
      activeUserId.current = null;
    };
  }, [id]);

  const handleModeration = async (values: ModerationValues) => {
    if (!moderationAction || !user) throw new Error(AppStrings.Users.moderation.failed);
    const targetId = user.id;
    const action = moderationAction;
    const updated = await adminRepo.moderateUser({
      targetUserId: targetId,
      action,
      ...values,
      expectedStatus: user.status,
      expectedDeletedAt: user.deleted_at || null,
    });
    if (activeUserId.current !== targetId) return;
    setUser((previous: any) => previous?.id === targetId ? { ...previous, ...updated } : previous);
    setRefreshWarning(null);
    showToast(AppStrings.Users.moderation.actions[action].success, 'success');

    // The RPC has committed. A failed enrichment refresh must not turn this
    // successful moderation into a retry that could apply the action twice.
    try {
      const refreshed = await adminRepo.getUserById(targetId);
      if (activeUserId.current !== targetId) return;
      if (!refreshed) throw new Error(AppStrings.Users.moderation.refreshWarning);
      setUser((previous: any) => previous?.id === targetId ? { ...previous, ...refreshed } : previous);
    } catch {
      if (activeUserId.current === targetId) setRefreshWarning(AppStrings.Users.moderation.refreshWarning);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto pb-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-bold text-[var(--kb-muted)] hover:text-[#F46A35] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Users
        </button>
        <AdminLoadingSkeleton variant="detail" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto pb-12">
        <button
          onClick={() => navigate('/users')}
          className="flex items-center gap-2 text-xs font-bold text-[var(--kb-muted)] hover:text-[#F46A35] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Users
        </button>
        <AdminErrorState
          title={error || 'User not found'}
          message="The requested user record could not be loaded from Supabase. Verify the user ID or try again."
          onRetry={loadUser}
          onBack={() => navigate('/users')}
        />
      </div>
    );
  }

  const summary = devicesData?.summary || {
    total: devicesData?.devices?.length || 0,
    active: devicesData?.devices?.filter((d) => d.is_active).length || 0,
    inactive: (devicesData?.devices?.length || 0) - (devicesData?.devices?.filter((d) => d.is_active).length || 0),
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-bold text-[var(--kb-muted)] hover:text-[#F46A35] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Users</span>
      </button>

      {/* HEADER SECTION */}
      <div className="bg-[var(--kb-surface)] border border-[var(--kb-border)] rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-[#F46A35]/10 border border-[#F46A35]/20 flex items-center justify-center font-black text-2xl text-[#F46A35] shrink-0 overflow-hidden shadow-inner">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              (user.full_name?.charAt(0) || user.email?.charAt(0) || 'U').toUpperCase()
            )}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-black text-[var(--kb-text)] tracking-tight">
                {user.full_name || 'Anonymous User'}
              </h1>
              {user.role && user.role !== 'user' && (
                <AdminStatusBadge status={user.role} size="sm" />
              )}
            </div>

            <p className="text-xs sm:text-sm text-[var(--kb-muted)] flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 font-mono">
                <Mail className="w-3.5 h-3.5 text-[var(--kb-muted)]" />
                {user.email || <span className="italic">No email provided</span>}
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1.5 font-mono">
                <Phone className="w-3.5 h-3.5 text-[var(--kb-muted)]" />
                {user.phone || <span className="italic">No phone provided</span>}
              </span>
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <AdminStatusBadge status={user.status || 'active'} size="sm" />

              {user.deleted_at && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-rose-500/10 text-rose-500 border border-rose-500/20">
                  <UserX className="w-3 h-3" /> Soft Deleted
                </span>
              )}

              {user.is_profile_completed ? (
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Profile Complete
                </span>
              ) : (
                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Onboarding Incomplete
                </span>
              )}

              {user.rating !== null && user.rating !== undefined && (
                <span className="text-[11px] font-bold text-amber-500 flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg">
                  <Star className="w-3 h-3 fill-amber-500" /> {Number(user.rating).toFixed(1)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {moderationAccess?.capabilities?.canReactivate && (user.status !== 'active' || user.deleted_at) && (
            <button
              onClick={() => setModerationAction(user.deleted_at ? 'restore' : 'reactivate')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 transition-colors text-white rounded-xl text-xs font-bold shadow-sm"
            >
              {user.deleted_at ? 'Restore Account' : 'Activate'}
            </button>
          )}
          {moderationAccess?.capabilities?.canSuspend && user.status !== 'suspended' && (
            <button
              onClick={() => setModerationAction('suspend')}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 transition-colors text-white rounded-xl text-xs font-bold shadow-sm"
            >
              Suspend
            </button>
          )}
          {moderationAccess?.capabilities?.canBan && user.status !== 'banned' && (
            <button
              onClick={() => setModerationAction('ban')}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 transition-colors text-white rounded-xl text-xs font-bold shadow-sm"
            >
              Ban User
            </button>
          )}
          {moderationAccess?.capabilities?.canSoftDelete && !user.deleted_at && (
            <button
              onClick={() => setModerationAction('soft_delete')}
              className="px-4 py-2 bg-[var(--kb-surface-subtle)] hover:bg-[var(--kb-border)] text-[var(--kb-text)] border border-[var(--kb-border)] rounded-xl text-xs font-bold transition-colors shadow-sm"
            >
              Soft Delete
            </button>
          )}
        </div>
      </div>

      {/* DETAILED PROFILE SPECIFICATIONS CARD */}
      <div className="bg-[var(--kb-surface)] border border-[var(--kb-border)] rounded-3xl p-6 shadow-sm">
        <h3 className="font-black text-[var(--kb-text)] uppercase tracking-wider text-xs mb-5 flex items-center gap-2 border-b border-[var(--kb-border)] pb-3">
          <Shield className="w-4 h-4 text-[#F46A35]" /> Comprehensive Profile Specifications
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* User ID */}
          <div className="bg-[var(--kb-surface-subtle)] border border-[var(--kb-border)] p-4 rounded-2xl">
            <p className="text-[10px] font-bold text-[var(--kb-muted)] uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>User UUID</span>
              <button
                onClick={() => copyToClipboard(user.id, 'User ID')}
                className="text-[var(--kb-muted)] hover:text-[#F46A35] transition-colors"
                title="Copy User ID"
              >
                {copiedField === 'User ID' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </p>
            <p className="text-xs text-[var(--kb-text)] font-mono break-all font-semibold">{user.id}</p>
          </div>

          {/* Email */}
          <div className="bg-[var(--kb-surface-subtle)] border border-[var(--kb-border)] p-4 rounded-2xl">
            <p className="text-[10px] font-bold text-[var(--kb-muted)] uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Email Address</span>
              {user.email && (
                <button
                  onClick={() => copyToClipboard(user.email, 'Email')}
                  className="text-[var(--kb-muted)] hover:text-[#F46A35] transition-colors"
                  title="Copy Email"
                >
                  {copiedField === 'Email' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              )}
            </p>
            <p className="text-xs text-[var(--kb-text)] font-mono break-all font-semibold">
              {user.email || <span className="text-[var(--kb-muted)] italic">Not provided</span>}
            </p>
          </div>

          {/* Phone */}
          <div className="bg-[var(--kb-surface-subtle)] border border-[var(--kb-border)] p-4 rounded-2xl">
            <p className="text-[10px] font-bold text-[var(--kb-muted)] uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Phone Number</span>
              {user.phone && (
                <button
                  onClick={() => copyToClipboard(user.phone, 'Phone')}
                  className="text-[var(--kb-muted)] hover:text-[#F46A35] transition-colors"
                  title="Copy Phone"
                >
                  {copiedField === 'Phone' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              )}
            </p>
            <p className="text-xs text-[var(--kb-text)] font-mono font-semibold">
              {user.phone || <span className="text-[var(--kb-muted)] italic">Not provided</span>}
            </p>
          </div>

          {/* Location */}
          <div className="bg-[var(--kb-surface-subtle)] border border-[var(--kb-border)] p-4 rounded-2xl">
            <p className="text-[10px] font-bold text-[var(--kb-muted)] uppercase tracking-wider mb-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#F46A35]" /> City / State
            </p>
            <p className="text-xs text-[var(--kb-text)] font-semibold truncate">
              {user.city ? (
                <span>
                  {user.city}{user.state ? `, ${user.state}` : ''}{user.country ? ` (${user.country})` : ''}
                </span>
              ) : (
                <span className="text-[var(--kb-muted)] italic">Not provided</span>
              )}
            </p>
          </div>

          {/* Account Status */}
          <div className="bg-[var(--kb-surface-subtle)] border border-[var(--kb-border)] p-4 rounded-2xl">
            <p className="text-[10px] font-bold text-[var(--kb-muted)] uppercase tracking-wider mb-1">Account Status</p>
            <div className="pt-0.5">
              <AdminStatusBadge status={user.status || 'active'} size="sm" />
            </div>
          </div>

          {/* Onboarding State */}
          <div className="bg-[var(--kb-surface-subtle)] border border-[var(--kb-border)] p-4 rounded-2xl">
            <p className="text-[10px] font-bold text-[var(--kb-muted)] uppercase tracking-wider mb-1">Profile Onboarding</p>
            <p className="text-xs font-semibold text-[var(--kb-text)]">
              {user.is_profile_completed ? '100% Completed' : 'Pending completion'}
            </p>
          </div>

          {/* Registered At */}
          <div className="bg-[var(--kb-surface-subtle)] border border-[var(--kb-border)] p-4 rounded-2xl">
            <p className="text-[10px] font-bold text-[var(--kb-muted)] uppercase tracking-wider mb-1">Registered On</p>
            <p className="text-xs text-[var(--kb-text)] font-medium">{formatDateTime(user.created_at)}</p>
          </div>

          {/* Last Updated */}
          <div className="bg-[var(--kb-surface-subtle)] border border-[var(--kb-border)] p-4 rounded-2xl">
            <p className="text-[10px] font-bold text-[var(--kb-muted)] uppercase tracking-wider mb-1">Last Modification</p>
            <p className="text-xs text-[var(--kb-text)] font-medium">{formatDateTime(user.updated_at)}</p>
          </div>
        </div>

        {/* Bio row if available */}
        {user.bio && (
          <div className="mt-4 pt-4 border-t border-[var(--kb-border)]">
            <p className="text-[10px] font-bold text-[var(--kb-muted)] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3 h-3 text-[#F46A35]" /> User Biography
            </p>
            <p className="text-xs text-[var(--kb-text)] leading-relaxed bg-[var(--kb-surface-subtle)] p-3.5 rounded-xl border border-[var(--kb-border)]">
              {user.bio}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT COLUMN: LIFECYCLE & MODERATION */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[var(--kb-surface)] border border-[var(--kb-border)] rounded-3xl p-6 shadow-sm">
            <h3 className="font-black text-[var(--kb-text)] uppercase tracking-wider text-xs mb-4 flex items-center gap-2 border-b border-[var(--kb-border)] pb-2.5">
              <Calendar className="w-4 h-4 text-[#F46A35]" /> Account Lifecycle
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold text-[var(--kb-muted)] uppercase tracking-wider mb-0.5">Role Permission</p>
                <p className="text-xs text-[var(--kb-text)] capitalize font-semibold">{user.role || 'user'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[var(--kb-muted)] uppercase tracking-wider mb-0.5">Registration Timestamp</p>
                <p className="text-xs text-[var(--kb-text)]">{formatDateTime(user.created_at)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[var(--kb-muted)] uppercase tracking-wider mb-0.5">Last Modification</p>
                <p className="text-xs text-[var(--kb-text)]">{formatDateTime(user.updated_at)}</p>
              </div>
              {user.deleted_at && (
                <div>
                  <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider mb-0.5">Soft Deleted At</p>
                  <p className="text-xs text-rose-500 font-semibold">{formatDateTime(user.deleted_at)}</p>
                </div>
              )}
            </div>
          </div>

          {(user.status === 'suspended' || user.status === 'banned') && (
            <div className="bg-rose-500/5 border border-rose-500/20 rounded-3xl p-6 shadow-sm">
              <h3 className="font-bold text-rose-500 uppercase tracking-wider text-xs mb-4 flex items-center gap-2 border-b border-rose-500/20 pb-2.5">
                <ShieldAlert className="w-4 h-4" /> Moderation Details
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-0.5">Reason</p>
                  <p className="text-xs text-[var(--kb-text)] font-medium">{user.status_reason || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-0.5">Notice to User</p>
                  <p className="text-xs text-[var(--kb-text)] font-medium">{user.status_message || 'Not provided'}</p>
                </div>
                {user.status_expires_at && (
                  <div>
                    <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-0.5">Expires At</p>
                    <p className="text-xs text-[var(--kb-text)]">{formatDateTime(user.status_expires_at)}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: CONNECTED DEVICES */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[var(--kb-surface)] border border-[var(--kb-border)] rounded-3xl overflow-hidden shadow-sm">

            {/* Devices Card Header with Summary Counters */}
            <div className="p-6 border-b border-[var(--kb-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-black text-[var(--kb-text)] uppercase tracking-wider text-xs flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-[#F46A35]" /> Connected Devices
                </h3>
                <p className="text-[11px] text-[var(--kb-muted)] mt-0.5">
                  Complete device registration history, sessions, and push token telemetry
                </p>
              </div>

              {/* Summary Badges: Total, Active, Inactive */}
              {!devicesLoading && !devicesError && (
                <div className="flex flex-wrap items-center gap-2">
                  <div className="px-3 py-1 rounded-xl bg-[var(--kb-surface-subtle)] border border-[var(--kb-border)] text-[var(--kb-text)] text-xs font-semibold flex items-center gap-1.5 shadow-xs">
                    <span className="text-[var(--kb-muted)] text-[11px]">Total:</span>
                    <span className="font-bold font-mono">{summary.total}</span>
                  </div>
                  <div className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1.5 shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[11px]">Active:</span>
                    <span className="font-bold font-mono">{summary.active}</span>
                  </div>
                  <div className="px-3 py-1 rounded-xl bg-[var(--kb-surface-subtle)] border border-[var(--kb-border)] text-[var(--kb-muted)] text-xs font-semibold flex items-center gap-1.5 shadow-xs">
                    <span className="text-[11px]">Inactive:</span>
                    <span className="font-bold text-[var(--kb-text)] font-mono">{summary.inactive}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Loading Skeleton */}
            {devicesLoading ? (
              <div className="p-6 space-y-4">
                <AdminLoadingSkeleton variant="list" rows={2} />
              </div>
            ) : devicesError?.type === 'permission_denied' ? (
              /* State 1: Permission Denied */
              <div className="p-8 text-center flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-sm">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div className="max-w-md">
                  <h4 className="text-sm font-bold text-[var(--kb-text)]">Administrator Access Restricted</h4>
                  <p className="text-xs text-[var(--kb-muted)] mt-1">{devicesError.message}</p>
                  {devicesError.code && (
                    <span className="inline-block mt-2 px-2.5 py-0.5 rounded text-[10px] font-mono bg-[var(--kb-surface-subtle)] border border-[var(--kb-border)] text-[var(--kb-muted)]">
                      Code: {devicesError.code}
                    </span>
                  )}
                </div>
              </div>
            ) : devicesError?.type === 'rpc_not_found' ? (
              /* State 2: RPC Missing / Schema Cache */
              <div className="p-8 text-center flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shadow-sm">
                  <Database className="w-6 h-6" />
                </div>
                <div className="max-w-md">
                  <h4 className="text-sm font-bold text-[var(--kb-text)]">Database Function Not Deployed</h4>
                  <p className="text-xs text-rose-500 dark:text-rose-400 mt-1 break-words">{devicesError.message}</p>
                  <p className="text-[11px] text-[var(--kb-muted)] mt-2">
                    Execute the migration <code className="px-1.5 py-0.5 rounded bg-[var(--kb-surface-subtle)] border border-[var(--kb-border)] font-mono text-[10px]">20261104000000_fix_connected_devices_rpc.sql</code> in the Supabase Cloud SQL Editor, then retry.
                  </p>
                </div>
                <button
                  onClick={() => loadDevices()}
                  className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-[var(--kb-surface-subtle)] hover:bg-[var(--kb-border)] text-[var(--kb-text)] text-xs font-bold rounded-xl border border-[var(--kb-border)] transition-colors shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Re-check Schema Cache
                </button>
              </div>
            ) : devicesError ? (
              /* State 3: General API Failure State with Retry button */
              <div className="p-8 text-center flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shadow-sm">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="max-w-md">
                  <h4 className="text-sm font-bold text-[var(--kb-text)]">Unable to load connected devices</h4>
                  <p className="text-xs text-rose-500 mt-1 break-words">{devicesError.message}</p>
                </div>
                <button
                  onClick={() => loadDevices()}
                  className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-[var(--kb-surface-subtle)] hover:bg-[var(--kb-border)] text-[var(--kb-text)] text-xs font-bold rounded-xl border border-[var(--kb-border)] transition-colors shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Retry Device Load
                </button>
              </div>
            ) : (!devicesData?.devices || devicesData.devices.length === 0) ? (
              /* Success with Zero Records State */
              <div className="p-12 text-center text-xs text-[var(--kb-muted)] flex flex-col items-center justify-center gap-2">
                <div className="w-12 h-12 rounded-2xl bg-[var(--kb-surface-subtle)] border border-[var(--kb-border)] flex items-center justify-center text-[var(--kb-muted)] mb-1">
                  <Smartphone className="w-6 h-6" />
                </div>
                <p className="font-bold text-[var(--kb-text)] text-sm">No registered devices found.</p>
                <p className="text-xs text-[var(--kb-muted)]">This user does not currently have any registered devices in history.</p>
              </div>
            ) : (
              /* Device Records List (Most recently active first) */
              <div className="divide-y divide-[var(--kb-border)]/60">
                {devicesData.devices.map((d: UserDevice) => (
                  <div key={d.id} className="p-6 hover:bg-[var(--kb-surface-subtle)]/40 transition-colors">

                    {/* Top Row: Device Model, Platform Badge, and Status Badges */}
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2.5">
                          <h4 className="font-bold text-[var(--kb-text)] text-sm tracking-tight">
                            {d.device_model || 'Unknown Device Model'}
                          </h4>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono uppercase tracking-wider font-bold border bg-[var(--kb-surface-subtle)] border-[var(--kb-border)] text-[var(--kb-text)]">
                            {d.platform || 'Unknown'}
                          </span>
                        </div>

                        {/* Status Tags */}
                        <div className="flex flex-wrap items-center gap-2 mt-2.5">
                          {d.is_active ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-slate-500/10 text-slate-500 border border-slate-500/20">
                              <LogOut className="w-3 h-3 text-slate-500" /> Inactive / Logged out
                            </span>
                          )}

                          {d.has_fcm_token ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-[#F46A35]/10 text-[#F46A35] border border-[#F46A35]/25">
                              <Bell className="w-3 h-3 text-[#F46A35]" /> FCM Token Present
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                              <BellOff className="w-3 h-3 text-amber-500" /> FCM Token Missing
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Last Active Timestamp Indicator */}
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#F46A35] bg-[#F46A35]/10 px-3 py-1.5 rounded-xl border border-[#F46A35]/20 shrink-0">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-mono">{formatDateTime(d.last_active_at)}</span>
                      </div>
                    </div>

                    {/* Device Details Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-4 border-t border-[var(--kb-border)]/60 text-xs">
                      <div>
                        <p className="text-[10px] font-bold text-[var(--kb-muted)] uppercase tracking-wider mb-0.5">OS Version</p>
                        <p className="text-[var(--kb-text)] font-mono text-[11px] font-medium">{d.os_version || 'Unknown'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-[var(--kb-muted)] uppercase tracking-wider mb-0.5">App Version</p>
                        <p className="text-[var(--kb-text)] font-mono text-[11px] font-medium">v{d.app_version || '1.0.0'} (Build {d.build_number || '1'})</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-[var(--kb-muted)] uppercase tracking-wider mb-0.5">Registration Date</p>
                        <p className="text-[var(--kb-text)] text-[11px]">{formatDateTime(d.created_at)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-[var(--kb-muted)] uppercase tracking-wider mb-0.5">
                          {d.is_active ? 'Token Synced' : 'Logged Out At'}
                        </p>
                        <p className="text-[var(--kb-text)] text-[11px]">
                          {d.is_active
                            ? (d.last_token_synced_at ? formatDateTime(d.last_token_synced_at) : 'N/A')
                            : (d.logged_out_at ? formatDateTime(d.logged_out_at) : 'N/A')}
                        </p>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {moderationAction && (
        <ModerationDialog
          action={moderationAction}
          userName={user.full_name || user.email || 'User'}
          supportsExpiry={moderationAction === 'suspend'}
          onClose={() => setModerationAction(null)}
          onConfirm={handleModeration}
        />
      )}
    </div>
  );
}
