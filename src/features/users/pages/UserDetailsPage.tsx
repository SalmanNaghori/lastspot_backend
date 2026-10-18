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
    hour12: true
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
    user: any 
  }>({
    isOpen: false,
    type: null,
    user: null
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
      adminRepo.getUserDevices(id)
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
      <div className="p-16 text-center text-sm font-medium text-slate-400 flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" /> 
        Loading user profile and connected devices...
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-16 text-center text-sm font-medium text-slate-400 flex flex-col items-center justify-center gap-3">
        <AlertTriangle className="w-8 h-8 text-rose-500" />
        <h3 className="text-slate-200 font-bold text-base">{error || 'User not found'}</h3>
        <p className="text-xs text-slate-400 max-w-sm">
          The requested user record could not be loaded from Supabase. Verify the user ID or try again.
        </p>
        <div className="flex items-center gap-3 mt-4">
          <button 
            onClick={() => loadUser()} 
            className="px-4 py-2 bg-emerald-600 text-white font-semibold text-xs rounded-xl hover:bg-emerald-500 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry Profile Load
          </button>
          <button 
            onClick={() => navigate('/users')} 
            className="px-4 py-2 bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl hover:bg-slate-700 transition-colors"
          >
            Return to Users List
          </button>
        </div>
      </div>
    );
  }

  const summary = devicesData?.summary || {
    total: devicesData?.devices?.length || 0,
    active: devicesData?.devices?.filter(d => d.is_active).length || 0,
    inactive: (devicesData?.devices?.length || 0) - (devicesData?.devices?.filter(d => d.is_active).length || 0)
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-emerald-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Users
      </button>

      {/* HEADER SECTION */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-5">
          <img 
            src={user.avatar_url || 'https://via.placeholder.com/150'} 
            alt="Avatar" 
            className="w-20 h-20 rounded-2xl object-cover border border-slate-700 bg-slate-950" 
          />
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-slate-100 tracking-tight">{user.full_name || 'Anonymous User'}</h1>
              {user.role && user.role !== 'user' && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {user.role}
                </span>
              )}
            </div>
            
            <p className="text-sm text-slate-400 mt-1 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                {user.email || <span className="text-slate-500 italic">No email provided</span>}
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                {user.phone || <span className="text-slate-500 italic">No phone provided</span>}
              </span>
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-3">
              <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border
                ${user.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : ''}
                ${user.status === 'suspended' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : ''}
                ${user.status === 'banned' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : ''}
              `}>
                {user.status || 'unknown'}
              </span>

              {user.deleted_at && (
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border bg-rose-500/10 text-rose-400 border-rose-500/20 flex items-center gap-1.5">
                  <UserX className="w-3 h-3" /> Soft Deleted
                </span>
              )}

              {user.is_profile_completed ? (
                <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Profile Completed
                </span>
              ) : (
                <span className="text-[10px] font-bold text-amber-500/90 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Onboarding Incomplete
                </span>
              )}

              {user.rating !== null && user.rating !== undefined && (
                <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                  <Star className="w-3 h-3 fill-amber-400" /> {Number(user.rating).toFixed(1)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {user.status !== 'active' && (
            <button onClick={handleActivate} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 transition-colors text-white rounded-xl text-xs font-bold shadow-sm">
              Activate
            </button>
          )}
          {user.status !== 'suspended' && (
            <button onClick={handleSuspend} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 transition-colors text-white rounded-xl text-xs font-bold shadow-sm">
              Suspend
            </button>
          )}
          {user.status !== 'banned' && (
            <button onClick={handleBan} className="px-4 py-2 bg-rose-600 hover:bg-rose-500 transition-colors text-white rounded-xl text-xs font-bold shadow-sm">
              Ban User
            </button>
          )}
          <button 
            onClick={() => setConfirmDialog({ isOpen: true, type: user.deleted_at ? 'reactivate' : 'softDelete', user: user })} 
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 transition-colors text-slate-200 border border-slate-700 rounded-xl text-xs font-bold shadow-sm"
          >
            {user.deleted_at ? 'Restore User' : 'Soft Delete'}
          </button>
        </div>
      </div>

      {/* DETAILED PROFILE SPECIFICATIONS CARD */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
        <h3 className="font-bold text-slate-200 uppercase tracking-widest text-xs mb-5 flex items-center gap-2 border-b border-slate-800 pb-3">
          <Shield className="w-4 h-4 text-emerald-400" /> Comprehensive Profile Specifications
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {/* User ID */}
          <div className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-xl">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>User ID</span>
              <button 
                onClick={() => copyToClipboard(user.id, 'User ID')} 
                className="text-slate-500 hover:text-slate-300 transition-colors"
                title="Copy User ID"
              >
                {copiedField === 'User ID' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </p>
            <p className="text-xs text-slate-200 font-mono break-all">{user.id}</p>
          </div>

          {/* Email */}
          <div className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-xl">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Email Address</span>
              {user.email && (
                <button 
                  onClick={() => copyToClipboard(user.email, 'Email')} 
                  className="text-slate-500 hover:text-slate-300 transition-colors"
                  title="Copy Email"
                >
                  {copiedField === 'Email' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              )}
            </p>
            <p className="text-xs text-slate-200 font-mono break-all">
              {user.email || <span className="text-slate-500 italic">Not provided</span>}
            </p>
          </div>

          {/* Phone */}
          <div className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-xl">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Phone Number</span>
              {user.phone && (
                <button 
                  onClick={() => copyToClipboard(user.phone, 'Phone')} 
                  className="text-slate-500 hover:text-slate-300 transition-colors"
                  title="Copy Phone"
                >
                  {copiedField === 'Phone' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              )}
            </p>
            <p className="text-xs text-slate-200 font-mono">
              {user.phone || <span className="text-slate-500 italic">Not provided</span>}
            </p>
          </div>

          {/* Location */}
          <div className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-xl">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-500" /> Location / City
            </p>
            <p className="text-xs text-slate-200">
              {user.city ? (
                <span>
                  {user.city}{user.state ? `, ${user.state}` : ''}{user.country ? ` (${user.country})` : ''}
                </span>
              ) : (
                <span className="text-slate-500 italic">Not provided</span>
              )}
            </p>
          </div>

          {/* Account Status */}
          <div className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-xl">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Account Status</p>
            <p className="text-xs font-semibold capitalize text-slate-200">
              {user.status || <span className="text-slate-500 italic">Active</span>}
            </p>
          </div>

          {/* Onboarding State */}
          <div className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-xl">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Profile Onboarding</p>
            <p className="text-xs text-slate-200">
              {user.is_profile_completed ? '100% Completed' : 'Pending completion'}
            </p>
          </div>

          {/* Registered At */}
          <div className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-xl">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Registered On</p>
            <p className="text-xs text-slate-200">{formatDateTime(user.created_at)}</p>
          </div>

          {/* Last Updated */}
          <div className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-xl">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Last Profile Update</p>
            <p className="text-xs text-slate-200">{formatDateTime(user.updated_at)}</p>
          </div>
        </div>

        {/* Bio row if available */}
        {user.bio && (
          <div className="mt-4 pt-4 border-t border-slate-800/60">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <FileText className="w-3 h-3 text-slate-500" /> User Biography
            </p>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
              {user.bio}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: LIFECYCLE & MODERATION */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
            <h3 className="font-bold text-slate-200 uppercase tracking-widest text-xs mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">
              <Calendar className="w-4 h-4 text-emerald-400" /> Account Lifecycle
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Role Permission</p>
                <p className="text-xs text-slate-300 capitalize">{user.role || 'user'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Registration Timestamp</p>
                <p className="text-xs text-slate-300">{formatDateTime(user.created_at)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Last Profile Modification</p>
                <p className="text-xs text-slate-300">{formatDateTime(user.updated_at)}</p>
              </div>
              {user.deleted_at && (
                <div>
                  <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider mb-0.5">Soft Deleted At</p>
                  <p className="text-xs text-rose-400 font-semibold">{formatDateTime(user.deleted_at)}</p>
                </div>
              )}
            </div>
          </div>

          {(user.status === 'suspended' || user.status === 'banned') && (
            <div className="bg-rose-950/20 border border-rose-900/30 rounded-2xl p-6 shadow-md">
              <h3 className="font-bold text-rose-400 uppercase tracking-widest text-xs mb-4 flex items-center gap-2 border-b border-rose-900/30 pb-2">
                <ShieldAlert className="w-4 h-4" /> Moderation Details
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-bold text-rose-500/80 uppercase tracking-wider mb-0.5">Reason</p>
                  <p className="text-xs text-rose-200">{user.status_reason || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-rose-500/80 uppercase tracking-wider mb-0.5">Message to User</p>
                  <p className="text-xs text-rose-200">{user.status_message || 'Not provided'}</p>
                </div>
                {user.status_expires_at && (
                  <div>
                    <p className="text-[10px] font-bold text-rose-500/80 uppercase tracking-wider mb-0.5">Expires At</p>
                    <p className="text-xs text-rose-200">{formatDateTime(user.status_expires_at)}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: CONNECTED DEVICES */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
            
            {/* Devices Card Header with Summary Counters */}
            <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-200 uppercase tracking-widest text-xs flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-400" /> Connected Devices
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Complete device registration history, sessions, and push token telemetry
                </p>
              </div>

              {/* Summary Badges: Total, Active, Inactive */}
              {!devicesLoading && !devicesError && (
                <div className="flex flex-wrap items-center gap-2">
                  <div className="px-3 py-1 rounded-xl bg-slate-800/90 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                    <span className="text-slate-400 text-[11px]">Total:</span>
                    <span className="font-bold text-white font-mono">{summary.total}</span>
                  </div>
                  <div className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-[11px]">Active:</span>
                    <span className="font-bold font-mono">{summary.active}</span>
                  </div>
                  <div className="px-3 py-1 rounded-xl bg-slate-800/60 border border-slate-700/80 text-slate-400 text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                    <span className="text-[11px]">Inactive:</span>
                    <span className="font-bold text-slate-300 font-mono">{summary.inactive}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Loading Skeleton */}
            {devicesLoading ? (
              <div className="p-6 space-y-4 animate-pulse">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
                  <div className="h-4 w-36 bg-slate-800 rounded"></div>
                  <div className="h-5 w-24 bg-slate-800 rounded"></div>
                </div>
                <div className="space-y-4 pt-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="p-5 rounded-xl border border-slate-800/80 bg-slate-950/40 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="h-4 w-44 bg-slate-800 rounded"></div>
                        <div className="h-4 w-20 bg-slate-800 rounded"></div>
                      </div>
                      <div className="grid grid-cols-4 gap-4">
                        <div className="h-3 w-20 bg-slate-800/50 rounded"></div>
                        <div className="h-3 w-20 bg-slate-800/50 rounded"></div>
                        <div className="h-3 w-28 bg-slate-800/50 rounded"></div>
                        <div className="h-3 w-28 bg-slate-800/50 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : devicesError ? (
              /* API Failure State with Retry button — never show 0 devices simply due to error */
              <div className="p-10 text-center flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shadow-lg">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="max-w-md">
                  <h4 className="text-sm font-bold text-slate-200">Unable to load connected devices</h4>
                  <p className="text-xs text-rose-400/90 mt-1 break-words">{devicesError}</p>
                </div>
                <button
                  onClick={() => loadDevices()}
                  className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors shadow-sm"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Retry Device Load
                </button>
              </div>
            ) : (!devicesData?.devices || devicesData.devices.length === 0) ? (
              /* Success with Zero Records State */
              <div className="p-12 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
                <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-600 mb-1">
                  <Smartphone className="w-6 h-6" />
                </div>
                <p className="font-semibold text-slate-300">No registered devices found.</p>
                <p className="text-[11px] text-slate-500">This user does not currently have any registered devices in history.</p>
              </div>
            ) : (
              /* Device Records List (Most recently active first) */
              <div className="divide-y divide-slate-800/60">
                {devicesData.devices.map((d: UserDevice) => (
                  <div key={d.id} className="p-6 hover:bg-slate-800/20 transition-colors">
                    
                    {/* Top Row: Device Model, Platform Badge, and Status Badges */}
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2.5">
                          <h4 className="font-bold text-slate-100 text-sm tracking-tight">
                            {d.device_model || 'Unknown Device Model'}
                          </h4>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono uppercase tracking-wider font-semibold border ${
                            d.platform?.toLowerCase() === 'android'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : d.platform?.toLowerCase() === 'ios'
                              ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                              : 'bg-slate-950 text-slate-300 border-slate-800'
                          }`}>
                            {d.platform || 'Unknown'}
                          </span>
                        </div>
                        
                        {/* Status Tags */}
                        <div className="flex flex-wrap items-center gap-2 mt-2.5">
                          {d.is_active ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide bg-slate-800/90 text-slate-400 border border-slate-700">
                              <LogOut className="w-3 h-3 text-slate-400" /> Inactive / Logged out
                            </span>
                          )}

                          {d.has_fcm_token ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                              <Bell className="w-3 h-3 text-cyan-400" /> FCM Token Present
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              <BellOff className="w-3 h-3 text-amber-400" /> FCM Token Missing
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Last Active Timestamp Indicator */}
                      <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 shrink-0">
                        <Clock className="w-3.5 h-3.5" /> 
                        <span className="text-[11px] font-mono">{formatDateTime(d.last_active_at)}</span>
                      </div>
                    </div>
                    
                    {/* Device Details Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-4 border-t border-slate-800/60 text-xs">
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">OS Version</p>
                        <p className="text-slate-300 font-mono text-[11px]">{d.os_version || 'Unknown'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">App Version</p>
                        <p className="text-slate-300 font-mono text-[11px]">v{d.app_version || '1.0.0'} (Build {d.build_number || '1'})</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Registration Date</p>
                        <p className="text-slate-300 text-[11px]">{formatDateTime(d.created_at)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                          {d.is_active ? 'Token Synced' : 'Logged Out At'}
                        </p>
                        <p className="text-slate-300 text-[11px]">
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
