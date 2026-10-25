import React, { useState, useEffect, useCallback } from 'react';
import { 
  RefreshCw, 
  ArrowLeft, 
  ShieldAlert, 
  CheckCircle, 
  Smartphone, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  UserX, 
  Trash2, 
  UserCheck, 
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
  Check
} from 'lucide-react';
import { adminRepo } from '@/lib/adminRepo';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertDialog } from '@/components/common/AlertDialog';
import { useToast } from '@/app/providers/ToastProvider';
import { AdminStatusBadge, AdminErrorState, AdminLoadingSkeleton } from '@/components/brand';
import type { UserDevice, UserDevicesResponse } from '@/features/devices/api/devices';

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

  // User Profile state
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dedicated Connected Devices state
  const [devicesData, setDevicesData] = useState<UserDevicesResponse | null>(null);
  const [devicesLoading, setDevicesLoading] = useState(true);
  const [devicesError, setDevicesError] = useState<string | null>(null);

  // Copy feedback state
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<{ 
    isOpen: boolean; 
    type: 'softDelete' | 'reactivate' | null; 
    user: any; 
  }>({
    isOpen: false,
    type: null,
    user: null,
  });

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
      setDevicesError(err.message || 'Failed to retrieve connected devices');
      setDevicesData(null);
    } finally {
      setDevicesLoading(false);
    }
  }, [id]);

  // Asynchronous user and device retrieval with isolated state handling
  useEffect(() => {
    if (!id) return;
    let ignore = false;

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
        setDevicesError(devicesResult.reason?.message || 'Failed to retrieve connected devices');
        setDevicesData(null);
      }
      setDevicesLoading(false);
    });

    return () => {
      ignore = true;
    };
  }, [id]);

  const handleActivate = async () => {
    if (!window.confirm("Are you sure you want to activate this user?")) return;
    await adminRepo.activateUser(id as string);
    showToast('User status updated to Active.', 'success');
    loadUser();
    loadDevices();
  };

  const handleBan = async () => {
    const reason = window.prompt("Enter ban reason:");
    if (reason === null) return;
    await adminRepo.banUser(id as string, { reason: reason || 'Violated Terms', message: 'Account permanently banned.' });
    showToast('User account permanently banned.', 'error');
    loadUser();
    loadDevices();
  };

  const handleSuspend = async () => {
    const reason = window.prompt("Enter suspension reason:");
    if (reason === null) return;
    await adminRepo.suspendUser(id as string, { reason: reason || 'Suspended pending review', message: 'Account temporarily suspended.' });
    showToast('User account temporarily suspended.', 'warning');
    loadUser();
    loadDevices();
  };

  const handleConfirmAction = async () => {
    if (!confirmDialog.user || !confirmDialog.type) return;
    
    if (confirmDialog.type === 'softDelete') {
      await adminRepo.softDeleteUser(confirmDialog.user.id);
      showToast(`User ${confirmDialog.user.full_name || 'Anonymous'} soft-deleted. Account marked with deleted_at timestamp.`, 'info');
    } else if (confirmDialog.type === 'reactivate') {
      await adminRepo.reactivateUser(confirmDialog.user.id);
      showToast(`User ${confirmDialog.user.full_name || 'Anonymous'} reactivated (deleted_at reset to NULL).`, 'success');
    }
    
    setConfirmDialog({ isOpen: false, type: null, user: null });
    loadUser();
    loadDevices();
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
          {user.status !== 'active' && (
            <button
              onClick={handleActivate}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 transition-colors text-white rounded-xl text-xs font-bold shadow-sm"
            >
              Activate
            </button>
          )}
          {user.status !== 'suspended' && (
            <button
              onClick={handleSuspend}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 transition-colors text-white rounded-xl text-xs font-bold shadow-sm"
            >
              Suspend
            </button>
          )}
          {user.status !== 'banned' && (
            <button
              onClick={handleBan}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 transition-colors text-white rounded-xl text-xs font-bold shadow-sm"
            >
              Ban User
            </button>
          )}
          <button 
            onClick={() => setConfirmDialog({ isOpen: true, type: user.deleted_at ? 'reactivate' : 'softDelete', user: user })} 
            className="px-4 py-2 bg-[var(--kb-surface-subtle)] hover:bg-[var(--kb-border)] text-[var(--kb-text)] border border-[var(--kb-border)] rounded-xl text-xs font-bold transition-colors shadow-sm"
          >
            {user.deleted_at ? 'Restore Account' : 'Soft Delete'}
          </button>
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
            ) : devicesError ? (
              /* API Failure State with Retry button — never show 0 devices simply due to error */
              <div className="p-8 text-center flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shadow-sm">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="max-w-md">
                  <h4 className="text-sm font-bold text-[var(--kb-text)]">Unable to load connected devices</h4>
                  <p className="text-xs text-rose-500 mt-1 break-words">{devicesError}</p>
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

      <AlertDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, type: null, user: null })}
        onConfirm={handleConfirmAction}
        title={
          confirmDialog.type === 'softDelete'
            ? `Soft Delete ${confirmDialog.user?.full_name}?`
            : `Reactivate ${confirmDialog.user?.full_name}?`
        }
        description={
          confirmDialog.type === 'softDelete'
            ? 'This will set the deleted_at timestamp. The user will be hidden from public app feeds, but the row will remain in the database.'
            : 'This will clear the deleted_at timestamp (deleted_at = NULL). Any existing suspension or ban status will remain active.'
        }
        confirmText={confirmDialog.type === 'softDelete' ? 'Soft Delete User' : 'Restore Account'}
        variant={confirmDialog.type === 'softDelete' ? 'danger' : 'success'}
        icon={confirmDialog.type === 'softDelete' ? Trash2 : UserCheck}
      />
    </div>
  );
}
