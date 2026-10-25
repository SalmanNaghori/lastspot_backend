import React, { useState, useEffect } from 'react';
import { adminRepo } from '@/lib/adminRepo';
import { AppStrings } from '@/core/constants/app_strings';
import { Shield, ShieldAlert, Key, Users, Trash2, UserPlus } from 'lucide-react';
import { AssignRoleModal } from '../components/AssignRoleModal';
import { CreateAdminModal } from '../components/CreateAdminModal';
import { useToast } from '@/app/providers/ToastProvider';
import { useRBAC } from '@/app/providers/useRBAC';
import { AdminPageHeader, AdminStatCard, AdminDataTable, type Column } from '@/components/brand';

export function AdminRolesPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { showToast } = useToast();
  const { isSuperAdmin } = useRBAC();

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

  const adminCount = roles.filter(r => r.role === 'admin' || r.role === 'super_admin').length;
  const modCount = roles.filter(r => r.role === 'moderator').length;
  const totalStaff = roles.length;

  const columns: Column<any>[] = [
    {
      header: AppStrings.AdminRoles.tableHeaders.user,
      accessor: (r: any) => (
        <div className="flex items-center gap-3">
          <img 
            src={r.user?.avatar_url || 'https://via.placeholder.com/40'} 
            alt="" 
            className="w-10 h-10 rounded-full object-cover bg-[var(--kb-subtle)] border border-[var(--kb-border)]"
          />
          <div>
            <p className="font-semibold text-[var(--kb-text)]">{r.user?.full_name || 'Admin User'}</p>
            <p className="text-xs text-[var(--kb-muted)]">{r.user?.email || 'No email recorded'}</p>
          </div>
        </div>
      )
    },
    {
      header: AppStrings.AdminRoles.tableHeaders.role,
      accessor: (r: any) => {
        if (r.role === 'super_admin') {
          return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#F46A35]/15 text-[#F46A35] border border-[#F46A35]/30">
              <ShieldAlert className="w-3.5 h-3.5" />
              Super Admin
            </span>
          );
        }
        if (r.role === 'admin') {
          return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FFB45E]/20 text-[#DC5425] border border-[#FFB45E]/40">
              <ShieldAlert className="w-3.5 h-3.5" />
              {AppStrings.AdminRoles.roles.admin}
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
            <Shield className="w-3.5 h-3.5" />
            {AppStrings.AdminRoles.roles.moderator}
          </span>
        );
      }
    },
    {
      header: AppStrings.AdminRoles.tableHeaders.assignedDate,
      accessor: (r: any) => (
        <span className="text-xs text-[var(--kb-muted)] font-medium">
          {r.assigned_at ? new Date(r.assigned_at).toLocaleDateString() : '—'}
        </span>
      )
    },
    {
      header: AppStrings.AdminRoles.tableHeaders.actions,
      className: 'text-right',
      accessor: (r: any) => isSuperAdmin ? (
        <button
          onClick={() => handleRevoke(r.user?.id, r.role)}
          className="p-2 text-[var(--kb-muted)] hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors inline-flex"
          title={AppStrings.AdminRoles.actions.revoke}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ) : null
    }
  ];

  return (
    <div className="space-y-6">
      {/* HEADER & ACTIONS */}
      <AdminPageHeader
        title={AppStrings.AdminRoles.title}
        subtitle={AppStrings.AdminRoles.subtitle}
        badge={`${totalStaff} Active Staff`}
        actions={
          isSuperAdmin ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-[var(--kb-surface)] border border-[var(--kb-border)] hover:bg-[var(--kb-subtle)] text-[var(--kb-text)] px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
              >
                <UserPlus className="w-4 h-4 text-[#F46A35]" />
                Create New Admin
              </button>
              <button
                onClick={() => setIsAssignModalOpen(true)}
                className="bg-gradient-to-r from-[#F46A35] to-[#FFB45E] hover:opacity-95 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-md shadow-[#F46A35]/20"
              >
                <Key className="w-4 h-4" />
                {AppStrings.AdminRoles.assignRoleBtn}
              </button>
            </div>
          ) : undefined
        }
      />

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AdminStatCard
          title={AppStrings.AdminRoles.cards.superAdmins}
          value={adminCount}
          icon={ShieldAlert}
          subtitle="Full admin privileges"
        />
        <AdminStatCard
          title={AppStrings.AdminRoles.cards.moderators}
          value={modCount}
          icon={Shield}
          subtitle="Content moderation scope"
        />
        <AdminStatCard
          title={AppStrings.AdminRoles.cards.totalStaff}
          value={totalStaff}
          icon={Users}
          subtitle="All platform managers"
        />
      </div>

      {/* DATA TABLE */}
      <AdminDataTable
        columns={columns}
        data={roles}
        loading={loading}
        keyExtractor={(r: any) => r.id}
        emptyType="empty_users"
        emptyTitle="No roles assigned yet"
        emptyDescription="Platform administrators and moderators will appear here once designated."
      />

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
