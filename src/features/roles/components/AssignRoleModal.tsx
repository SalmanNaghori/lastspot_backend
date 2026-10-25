import React, { useState, useEffect } from 'react';
import { adminRepo } from '@/lib/adminRepo';
import { AppStrings } from '@/core/constants/app_strings';
import { Search, Loader2 } from 'lucide-react';
import { AdminModal } from '@/components/brand/AdminModal';

interface AssignRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssigned: () => void;
  showToast: (msg: string, type: string) => void;
}

export function AssignRoleModal({ isOpen, onClose, onAssigned, showToast }: AssignRoleModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [role, setRole] = useState<'super_admin' | 'admin' | 'moderator'>('moderator');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) {
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      const results = await adminRepo.searchUsers(searchQuery);
      setSearchResults(results);
      setLoading(false);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !role) {
      showToast(AppStrings.AdminRoles.alerts.selectUser, 'warning');
      return;
    }

    setSubmitting(true);
    try {
      await adminRepo.assignRole(selectedUser.id, role);
      showToast(AppStrings.AdminRoles.alerts.assigned, 'success');
      onAssigned();
      onClose();
    } catch {
      showToast('Failed to assign role.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={AppStrings.AdminRoles.modal.title}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs text-[var(--kb-text)] mb-2 font-semibold">
            {AppStrings.AdminRoles.modal.selectUserLabel}
          </label>
          {!selectedUser ? (
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-[var(--kb-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  const q = e.target.value;
                  setSearchQuery(q);
                  if (!q.trim()) setSearchResults([]);
                }}
                placeholder={AppStrings.AdminRoles.modal.searchPlaceholder}
                className="w-full bg-[var(--kb-subtle)] border border-[var(--kb-border)] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[var(--kb-text)] placeholder-[var(--kb-muted)] focus:outline-none focus:border-[#F46A35]"
              />

              {searchQuery && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--kb-surface)] border border-[var(--kb-border)] rounded-xl shadow-xl max-h-48 overflow-y-auto z-10">
                  {loading ? (
                    <div className="p-4 flex justify-center text-[#F46A35]">
                      <Loader2 className="w-5 h-5 animate-spin" />
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="py-2 divide-y divide-[var(--kb-border)]/50">
                      {searchResults.map((u) => (
                        <div
                          key={u.id}
                          onClick={() => setSelectedUser(u)}
                          className="px-4 py-2.5 hover:bg-[var(--kb-subtle)] cursor-pointer flex items-center gap-3 transition-colors"
                        >
                          <img src={u.avatar_url || 'https://via.placeholder.com/40'} alt="" className="w-8 h-8 rounded-full object-cover bg-[var(--kb-subtle)] border border-[var(--kb-border)]" />
                          <div>
                            <p className="text-sm font-semibold text-[var(--kb-text)]">{u.full_name || 'User'}</p>
                            <p className="text-xs text-[var(--kb-muted)]">{u.email || 'No email'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-xs text-[var(--kb-muted)]">
                      {AppStrings.AdminRoles.modal.noUsers}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between bg-[var(--kb-subtle)] border border-[var(--kb-border)] rounded-xl p-3">
              <div className="flex items-center gap-3">
                <img src={selectedUser.avatar_url || 'https://via.placeholder.com/40'} alt="" className="w-10 h-10 rounded-full object-cover bg-[var(--kb-surface)] border border-[var(--kb-border)]" />
                <div>
                  <p className="text-sm font-semibold text-[var(--kb-text)]">{selectedUser.full_name || 'Selected User'}</p>
                  <p className="text-xs text-[var(--kb-muted)]">{selectedUser.email || 'No email'}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setSelectedUser(null); setSearchQuery(''); }}
                className="text-xs text-rose-500 hover:underline font-bold"
              >
                Change
              </button>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs text-[var(--kb-text)] mb-2 font-semibold">
            {AppStrings.AdminRoles.modal.selectRoleLabel}
          </label>
          <div className="grid grid-cols-3 gap-3">
            <label className={`flex items-center justify-center py-3 border rounded-xl cursor-pointer transition-all text-xs ${role === 'super_admin' ? 'bg-[#F46A35]/15 border-[#F46A35] text-[#F46A35] font-bold shadow-sm' : 'bg-[var(--kb-subtle)] border-[var(--kb-border)] text-[var(--kb-muted)] hover:text-[var(--kb-text)]'}`}>
              <input
                type="radio"
                name="role"
                value="super_admin"
                checked={role === 'super_admin'}
                onChange={() => setRole('super_admin')}
                className="hidden"
              />
              Super Admin
            </label>
            <label className={`flex items-center justify-center py-3 border rounded-xl cursor-pointer transition-all text-xs ${role === 'admin' ? 'bg-[#FFB45E]/20 border-[#FFB45E] text-[#DC5425] font-bold shadow-sm' : 'bg-[var(--kb-subtle)] border-[var(--kb-border)] text-[var(--kb-muted)] hover:text-[var(--kb-text)]'}`}>
              <input
                type="radio"
                name="role"
                value="admin"
                checked={role === 'admin'}
                onChange={() => setRole('admin')}
                className="hidden"
              />
              {AppStrings.AdminRoles.roles.admin}
            </label>
            <label className={`flex items-center justify-center py-3 border rounded-xl cursor-pointer transition-all text-xs ${role === 'moderator' ? 'bg-blue-500/15 border-blue-500 text-blue-500 font-bold shadow-sm' : 'bg-[var(--kb-subtle)] border-[var(--kb-border)] text-[var(--kb-muted)] hover:text-[var(--kb-text)]'}`}>
              <input
                type="radio"
                name="role"
                value="moderator"
                checked={role === 'moderator'}
                onChange={() => setRole('moderator')}
                className="hidden"
              />
              {AppStrings.AdminRoles.roles.moderator}
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[var(--kb-border)]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[var(--kb-subtle)] hover:bg-[var(--kb-border)] text-[var(--kb-text)] text-sm font-semibold transition-colors border border-[var(--kb-border)]"
          >
            {AppStrings.AdminRoles.modal.cancelBtn}
          </button>
          <button
            type="submit"
            disabled={submitting || !selectedUser}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#F46A35] to-[#FFB45E] hover:opacity-95 text-white text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md shadow-[#F46A35]/20"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {AppStrings.AdminRoles.modal.assignBtn}
          </button>
        </div>
      </form>
    </AdminModal>
  );
}
