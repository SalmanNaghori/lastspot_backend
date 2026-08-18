import React, { useState, useEffect } from 'react';
import { RefreshCw, ArrowLeft, ShieldAlert, CheckCircle, Smartphone, AlertTriangle, Clock, Calendar, UserX, Trash2, UserCheck } from 'lucide-react';
import { adminRepo } from '@/lib/adminRepo';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertDialog } from '@/components/common/AlertDialog';
import { useToast } from '@/app/providers/ToastProvider';

export function UserDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; type: 'softDelete' | 'reactivate' | 'ban' | null; user: any }>({
    isOpen: false,
    type: null,
    user: null
  });

  const { showToast } = useToast();

  const loadUser = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!id) throw new Error("No user ID provided");
      const u = await adminRepo.getUserById(id);
      if (!u) throw new Error("User not found");
      setUser(u);
    } catch (err: any) {
      setError(err.message || 'Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, [id]);

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
        <p className="text-slate-300 font-bold">{error || 'User not found'}</p>
        <button onClick={() => navigate('/users')} className="mt-4 px-4 py-2 bg-slate-800 text-slate-200 rounded-xl hover:bg-slate-700">
          Return to Users List
        </button>
      </div>
    );
  }

  const handleActivate = async () => {
    if (!window.confirm("Are you sure you want to activate this user?")) return;
    await adminRepo.activateUser(id as string);
    showToast('User status updated to Active.', 'success');
    loadUser();
  };

  const handleBan = async () => {
    const reason = window.prompt("Enter ban reason:");
    if (reason === null) return;
    await adminRepo.banUser(id as string, { reason: reason || 'Violated Terms', message: 'Account permanently banned.' });
    showToast('User account permanently banned.', 'error');
    loadUser();
  };

  const handleSuspend = async () => {
    const reason = window.prompt("Enter suspension reason:");
    if (reason === null) return;
    await adminRepo.suspendUser(id as string, { reason: reason || 'Suspended pending review', message: 'Account temporarily suspended.' });
    showToast('User account temporarily suspended.', 'warning');
    loadUser();
  };

  const handleConfirmAction = async () => {
    if (!confirmDialog.user || !confirmDialog.type) return;
    
    if (confirmDialog.type === 'softDelete') {
      await adminRepo.softDeleteUser(confirmDialog.user.id);
      showToast(`User ${confirmDialog.user.full_name || 'Anonymous'} soft-deleted. Account set to deleted_at timestamp.`, 'info');
    } else if (confirmDialog.type === 'reactivate') {
      await adminRepo.reactivateUser(confirmDialog.user.id);
      showToast(`User ${confirmDialog.user.full_name || 'Anonymous'} reactivated (deleted_at reset to NULL).`, 'success');
    }
    
    setConfirmDialog({ isOpen: false, type: null, user: null });
    loadUser();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-emerald-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* HEADER SECTION */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <img 
            src={user.avatar_url || 'https://via.placeholder.com/150'} 
            alt="Avatar" 
            className="w-20 h-20 rounded-2xl object-cover border border-slate-700 bg-slate-950" 
          />
          <div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">{user.full_name || 'Anonymous User'}</h1>
            <p className="text-sm text-slate-400 mt-1">{user.email || 'No email provided'} • {user.phone || 'No phone'}</p>
            <div className="flex items-center gap-3 mt-3">
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
              {user.is_profile_completed && (
                <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Profile Completed
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {user.status !== 'active' && (
            <button onClick={handleActivate} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 transition-colors text-white rounded-xl text-xs font-bold">
              Activate
            </button>
          )}
          {user.status !== 'suspended' && (
            <button onClick={handleSuspend} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 transition-colors text-white rounded-xl text-xs font-bold">
              Suspend
            </button>
          )}
          {user.status !== 'banned' && (
            <button onClick={handleBan} className="px-4 py-2 bg-rose-600 hover:bg-rose-500 transition-colors text-white rounded-xl text-xs font-bold">
              Ban User
            </button>
          )}
          <button 
            onClick={() => setConfirmDialog({ isOpen: true, type: user.deleted_at ? 'reactivate' : 'softDelete', user: user })} 
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 transition-colors text-slate-200 border border-slate-700 rounded-xl text-xs font-bold"
          >
            {user.deleted_at ? 'Restore User' : 'Soft Delete'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: DETAILS */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="font-bold text-slate-200 uppercase tracking-widest text-xs mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">
              <Calendar className="w-4 h-4 text-emerald-400" /> Account Lifecycle
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">User ID</p>
                <p className="text-xs text-slate-300 font-mono break-all">{user.id}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Registered At</p>
                <p className="text-xs text-slate-300">{new Date(user.created_at).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Last Updated</p>
                <p className="text-xs text-slate-300">{new Date(user.updated_at).toLocaleString()}</p>
              </div>
              {user.deleted_at && (
                <div>
                  <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider mb-0.5">Deleted At</p>
                  <p className="text-xs text-rose-400">{new Date(user.deleted_at).toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>

          {(user.status === 'suspended' || user.status === 'banned') && (
            <div className="bg-rose-950/20 border border-rose-900/30 rounded-2xl p-6">
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
                    <p className="text-xs text-rose-200">{new Date(user.status_expires_at).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: DEVICES */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-200 uppercase tracking-widest text-xs flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-indigo-400" /> Connected Devices
              </h3>
              <span className="px-2.5 py-1 bg-slate-800 text-slate-300 text-[10px] font-bold rounded-lg border border-slate-700">
                {user.devices?.length || 0} Devices
              </span>
            </div>
            
            {user.devices?.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No connected devices found for this user.
              </div>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {user.devices?.map((d: any) => (
                  <div key={d.id} className="p-6 hover:bg-slate-800/30 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <h4 className="font-bold text-slate-200 text-sm">{d.device_model || 'Unknown Model'}</h4>
                          <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-700 text-[10px] font-mono text-slate-300 uppercase">
                            {d.platform || 'Unknown'}
                          </span>
                        </div>
                        <p className="text-xs font-mono text-slate-500 mt-1">ID: {d.device_identifier || 'N/A'}</p>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 shrink-0">
                        <Clock className="w-3.5 h-3.5" /> 
                        {d.last_active_at ? new Date(d.last_active_at).toLocaleDateString() : 'Never'}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-5 pt-5 border-t border-slate-800/60">
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">OS Version</p>
                        <p className="text-xs text-slate-300 font-mono">{d.os_version || 'Unknown'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">App Version</p>
                        <p className="text-xs text-slate-300 font-mono">v{d.app_version || 'Unknown'} ({d.build_number || '?'})</p>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Registered At</p>
                        <p className="text-xs text-slate-300">{d.created_at ? new Date(d.created_at).toLocaleDateString() : 'Unknown'}</p>
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
