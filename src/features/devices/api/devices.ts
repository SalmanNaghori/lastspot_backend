import { supabase } from '@/core/supabase/client';
import { generateRequestId, logDiagnostic } from '@/core/utils/diagnosticLogger';

export interface UserDevice {
  id: string;
  user_id: string;
  device_identifier?: string;
  platform: string;
  device_model: string | null;
  os_version: string | null;
  app_version: string | null;
  build_number: string | number | null;
  last_active_at: string | null;
  created_at?: string;
  updated_at?: string;
  is_active: boolean;
  logged_out_at?: string | null;
  last_token_synced_at?: string | null;
  has_fcm_token: boolean;
  profiles?: {
    full_name: string | null;
    email: string | null;
    avatar_url?: string | null;
  } | null;
}

export interface UserDevicesSummary {
  total: number;
  active: number;
  inactive: number;
}

export interface UserDevicesResponse {
  devices: UserDevice[];
  summary: UserDevicesSummary;
  telemetry?: {
    requestId: string;
    durationMs: number;
    source: 'rpc' | 'edge_function' | 'direct_table';
  };
}

export type DeviceErrorCategory = 'permission_denied' | 'rpc_not_found' | 'general';

export class DeviceFetchError extends Error {
  category: DeviceErrorCategory;
  code?: string;

  constructor(message: string, category: DeviceErrorCategory = 'general', code?: string) {
    super(message);
    this.name = 'DeviceFetchError';
    this.category = category;
    this.code = code;
  }
}

/**
 * Fetch device records for a specific user with multi-tier fallback and safe diagnostic telemetry.
 * 
 * Strategy:
 * 1. Attempts secure RPC 'get_user_devices_for_admin' (Primary, SECURITY DEFINER, is_admin check).
 * 2. Fallback to server-side Edge Function 'get-user-devices'.
 * 3. Fallback to direct sanitized table query on public.user_devices.
 */
export const fetchUserDevices = async (userId: string): Promise<UserDevicesResponse> => {
  if (!userId) {
    throw new DeviceFetchError('User ID is required to fetch device records', 'general');
  }

  const cleanUserId = userId.trim().toLowerCase();
  const requestId = generateRequestId();
  const startTime = performance.now();
  const environment = import.meta.env.MODE || 'production';

  let rawList: any[] | null = null;
  let dataSource: 'rpc' | 'edge_function' | 'direct_table' = 'rpc';
  let lastError: any = null;

  // 1. Primary Strategy: Secure RPC function (SECURITY DEFINER with is_admin check)
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_user_devices_for_admin', {
      target_user_id: cleanUserId
    });

    if (rpcError) {
      lastError = rpcError;
      logDiagnostic({
        requestId,
        selectedUserId: cleanUserId,
        endpoint: 'rpc:get_user_devices_for_admin',
        httpStatus: (rpcError as any)?.code || 'PGRST_ERROR',
        errorCode: rpcError.code,
        errorMessage: rpcError.message,
        durationMs: Math.round(performance.now() - startTime),
        environment
      });

      // If unauthorized, do not attempt fallbacks
      const msg = rpcError.message || '';
      if (
        rpcError.code === '42501' ||
        msg.toLowerCase().includes('unauthorized') ||
        msg.toLowerCase().includes('forbidden') ||
        msg.toLowerCase().includes('privileges required')
      ) {
        throw new DeviceFetchError(
          msg || 'Unauthorized: Administrator privileges required to view device history',
          'permission_denied',
          rpcError.code || '42501'
        );
      }
    } else if (Array.isArray(rpcData)) {
      rawList = rpcData;
      dataSource = 'rpc';
      logDiagnostic({
        requestId,
        selectedUserId: cleanUserId,
        endpoint: 'rpc:get_user_devices_for_admin',
        httpStatus: 200,
        queryResultCount: rpcData.length,
        durationMs: Math.round(performance.now() - startTime),
        environment
      });
    }
  } catch (err: any) {
    if (err instanceof DeviceFetchError) {
      throw err;
    }
    lastError = err;
  }

  // 2. Secondary Strategy: Server-side Edge Function 'get-user-devices'
  if (rawList === null) {
    try {
      const { data: efData, error: efError } = await supabase.functions.invoke('get-user-devices', {
        body: { userId: cleanUserId }
      });

      if (efError) {
        lastError = efError;
        logDiagnostic({
          requestId,
          selectedUserId: cleanUserId,
          endpoint: 'edge_function:get-user-devices',
          httpStatus: (efError as any)?.context?.status || 500,
          errorCode: efError.name || 'EF_ERROR',
          errorMessage: efError.message,
          durationMs: Math.round(performance.now() - startTime),
          environment
        });

        if (
          (efError as any)?.context?.status === 401 ||
          (efError as any)?.context?.status === 403 ||
          efError.message?.toLowerCase().includes('forbidden') ||
          efError.message?.toLowerCase().includes('unauthorized')
        ) {
          throw new DeviceFetchError(
            'Unauthorized: Administrator privileges required to view device history',
            'permission_denied',
            '403'
          );
        }
      } else if (efData && Array.isArray(efData.devices)) {
        dataSource = 'edge_function';
        const devices = efData.devices as UserDevice[];
        const summary: UserDevicesSummary = efData.summary || {
          total: devices.length,
          active: devices.filter(d => d.is_active).length,
          inactive: devices.filter(d => !d.is_active).length
        };

        logDiagnostic({
          requestId,
          selectedUserId: cleanUserId,
          endpoint: 'edge_function:get-user-devices',
          httpStatus: 200,
          queryResultCount: devices.length,
          durationMs: Math.round(performance.now() - startTime),
          environment
        });

        return {
          devices,
          summary,
          telemetry: {
            requestId,
            durationMs: Math.round(performance.now() - startTime),
            source: dataSource
          }
        };
      }
    } catch (err: any) {
      if (err instanceof DeviceFetchError) throw err;
      lastError = err;
    }
  }

  // 3. Tertiary Strategy: Direct sanitized PostgREST query on public.user_devices
  if (rawList === null) {
    try {
      const { data: tableData, error: tableError } = await supabase
        .from('user_devices')
        .select(`
          id,
          user_id,
          platform,
          device_model,
          os_version,
          app_version,
          build_number,
          last_active_at,
          created_at,
          updated_at,
          is_active,
          logged_out_at,
          last_token_synced_at,
          fcm_token
        `)
        .eq('user_id', cleanUserId)
        .order('last_active_at', { ascending: false, nullsFirst: false });

      if (tableError) {
        lastError = tableError;
        logDiagnostic({
          requestId,
          selectedUserId: cleanUserId,
          endpoint: 'postgrest:user_devices',
          httpStatus: tableError.code,
          errorCode: tableError.code,
          errorMessage: tableError.message,
          durationMs: Math.round(performance.now() - startTime),
          environment
        });

        if (tableError.code === '42501') {
          throw new DeviceFetchError(
            'Unauthorized: Administrator privileges required to view device history',
            'permission_denied',
            '42501'
          );
        }
      } else if (Array.isArray(tableData)) {
        rawList = tableData;
        dataSource = 'direct_table';
        logDiagnostic({
          requestId,
          selectedUserId: cleanUserId,
          endpoint: 'postgrest:user_devices',
          httpStatus: 200,
          queryResultCount: tableData.length,
          durationMs: Math.round(performance.now() - startTime),
          environment
        });
      }
    } catch (err: any) {
      if (err instanceof DeviceFetchError) throw err;
      lastError = err;
    }
  }

  // If no strategy succeeded and an explicit error occurred, classify and throw
  if (rawList === null && lastError) {
    const errorMsg = lastError.message || 'Failed to retrieve user devices from database';
    const code = lastError.code || (lastError as any)?.context?.status;
    const isRpcNotFound = code === 'PGRST202' ||
      errorMsg.includes('schema cache') ||
      errorMsg.includes('get_user_devices_for_admin') ||
      (errorMsg.toLowerCase().includes('function') && errorMsg.toLowerCase().includes('not found'));

    if (isRpcNotFound) {
      throw new DeviceFetchError(
        errorMsg,
        'rpc_not_found',
        code || 'PGRST202'
      );
    }

    const isUnauthorized = code === '42501' ||
      errorMsg.toLowerCase().includes('unauthorized') ||
      errorMsg.toLowerCase().includes('forbidden') ||
      errorMsg.toLowerCase().includes('privileges required');

    if (isUnauthorized) {
      throw new DeviceFetchError(
        errorMsg,
        'permission_denied',
        code || '42501'
      );
    }

    throw new DeviceFetchError(errorMsg, 'general', code);
  }

  const rawDevices = rawList || [];

  // Map and sanitize fields
  const devices: UserDevice[] = rawDevices.map((d: any) => ({
    id: d.id,
    user_id: d.user_id,
    device_identifier: d.device_identifier || undefined,
    platform: d.platform || 'Unknown',
    device_model: d.device_model || 'Unknown Device',
    os_version: d.os_version || 'Unknown',
    app_version: d.app_version || '1.0.0',
    build_number: d.build_number ? String(d.build_number) : '1',
    last_active_at: d.last_active_at || d.updated_at || null,
    created_at: d.created_at || new Date().toISOString(),
    updated_at: d.updated_at || new Date().toISOString(),
    is_active: Boolean(d.is_active),
    logged_out_at: d.logged_out_at || null,
    last_token_synced_at: d.last_token_synced_at || null,
    // Strictly derived boolean without exposing sensitive FCM token string
    has_fcm_token: typeof d.has_fcm_token === 'boolean'
      ? d.has_fcm_token
      : Boolean(d.fcm_token && String(d.fcm_token).trim().length > 0)
  }));

  // Sort: most recently active device first
  devices.sort((a, b) => {
    const timeA = a.last_active_at ? new Date(a.last_active_at).getTime() : 0;
    const timeB = b.last_active_at ? new Date(b.last_active_at).getTime() : 0;
    return timeB - timeA;
  });

  const total = devices.length;
  const active = devices.filter(d => d.is_active).length;
  const inactive = total - active;

  return {
    devices,
    summary: {
      total,
      active,
      inactive
    },
    telemetry: {
      requestId,
      durationMs: Math.round(performance.now() - startTime),
      source: dataSource
    }
  };
};

export interface FetchAllDevicesParams {
  page: number;
  perPage: number;
  platform?: string;
}

export const fetchAllDevices = async ({ page, perPage, platform }: FetchAllDevicesParams) => {
  let query = supabase.from('user_devices').select('id, user_id, device_identifier, platform, device_model, os_version, app_version, build_number, last_active_at, is_active, created_at, updated_at, profiles(full_name, avatar_url, email)', { count: 'exact' });


  if (platform && platform !== 'all') {
    query = query.ilike('platform', `%${platform}%`);
  }

  const from = (page - 1) * perPage;
  const to = from + perPage - 1;


  query = query.range(from, to).order('last_active_at', { ascending: false, nullsFirst: false });

  const { data, count, error } = await query;

  if (error) throw error;
  return { data, count: count || 0 };
};
