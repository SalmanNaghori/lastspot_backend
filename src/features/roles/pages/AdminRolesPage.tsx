import React, { useState, useEffect } from 'react';
import { adminRepo } from '@/lib/adminRepo';
import { AppStrings } from '@/core/constants/app_strings';
import { Shield, ShieldAlert, Key, Users, Loader2, Trash2, UserPlus } from 'lucide-react';
import { AssignRoleModal } from '../components/AssignRoleModal';
import { CreateAdminModal } from '../components/CreateAdminModal';
import { useToast } from '@/app/providers/ToastProvider';

export function AdminRolesPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { showToast } = useToast();

  const fetchRoles = async () => {
    setLoading(true);
    const data = await adminRepo.getAdminUsers();
    setRoles(data);
    setLoading(false);
  };

  useEffect(() => {
    let ignore = false;
    adminRepo.getAdminUsers().then((data) => {
      if (!ignore) {
        setRoles(data);
        setLoading(false);
      }
    });
    return () => {
      ignore = true;
    };
  }, []);

  const handleRevoke = async (userId: string, role: string) => {
    if (!window.confirm('Are you sure you want to revoke this role?')) return;
    try {
      await adminRepo.revokeRole(userId, role);
      showToast(AppStrings.AdminRoles.alerts.revoked, 'success');
      fetchRoles();
    } catch {
      showToast('Failed to revoke role.', 'error');
    }
  };

  const adminCount = roles.filter(r => r.role === 'admin').length;
  const modCount = roles.filter(r => r.role === 'moderator').length;
  const totalStaff = roles.length;

  return (
    <div className="space-y-6">
      {/* HEADER & ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-purple-500" />
            {AppStrings.AdminRoles.title}
          </h1>
          <p className="text-sm text-slate-400 mt-1">{AppStrings.AdminRoles.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-lg"
          >
            <UserPlus className="w-4 h-4 text-emerald-400" />
            Create New Admin
          </button>
          <button
            onClick={() => setIsAssignModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-emerald-900/20"
          >
            <Key className="w-4 h-4" />
            {AppStrings.AdminRoles.assignRoleBtn}
          </button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 text-purple-500">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium">{AppStrings.AdminRoles.cards.superAdmins}</p>
            <p className="text-2xl font-bold text-slate-100">{adminCount}</p>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-500">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium">{AppStrings.AdminRoles.cards.moderators}</p>
            <p className="text-2xl font-bold text-slate-100">{modCount}</p>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-500">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium">{AppStrings.AdminRoles.cards.totalStaff}</p>
            <p className="text-2xl font-bold text-slate-100">{totalStaff}</p>
          </div>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/50 text-slate-200 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">{AppStrings.AdminRoles.tableHeaders.user}</th>
                <th className="px-6 py-4">{AppStrings.AdminRoles.tableHeaders.role}</th>
                <th className="px-6 py-4">{AppStrings.AdminRoles.tableHeaders.assignedDate}</th>
                <th className="px-6 py-4 text-right">{AppStrings.AdminRoles.tableHeaders.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-500 mx-auto mb-3" />
                    <p className="text-slate-400">{AppStrings.AdminRoles.loading}</p>
                  </td>
                </tr>
              ) : roles.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    No roles assigned yet.
                  </td>
                </tr>
              ) : (
                roles.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={r.user?.avatar_url || 'https://via.placeholder.com/40'} 
                          alt="" 
                          className="w-10 h-10 rounded-full object-cover bg-slate-800"
                        />
                        <div>
                          <p className="font-semibold text-slate-200">{r.user?.full_name}</p>
                          <p className="text-xs text-slate-500">{r.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {r.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          {AppStrings.AdminRoles.roles.admin}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          <Shield className="w-3.5 h-3.5" />
                          {AppStrings.AdminRoles.roles.moderator}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(r.assigned_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleRevoke(r.user?.id, r.role)}
                        className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors inline-flex"
                        title={AppStrings.AdminRoles.actions.revoke}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AssignRoleModal 
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onAssigned={fetchRoles}
        showToast={showToast}
      />

      <CreateAdminModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={fetchRoles}
        showToast={showToast}
      />
    </div>
  );
}
