import React, { useState, useEffect } from 'react';
import { adminRepo } from '@/lib/adminRepo';
import { AppStrings } from '@/core/constants/app_strings';
import { Search, Loader2 } from 'lucide-react';

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
  const [role, setRole] = useState<'admin' | 'moderator'>('moderator');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([]);
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
    } catch (err) {
      showToast('Failed to assign role.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <h3 className="font-bold text-lg">{AppStrings.AdminRoles.modal.title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs text-slate-300 mb-2 font-semibold">
              {AppStrings.AdminRoles.modal.selectUserLabel}
            </label>
            {!selectedUser ? (
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={AppStrings.AdminRoles.modal.searchPlaceholder}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
                />
                
                {searchQuery && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-slate-950 border border-slate-800 rounded-xl shadow-xl max-h-48 overflow-y-auto z-10">
                    {loading ? (
                      <div className="p-4 flex justify-center text-emerald-500">
                        <Loader2 className="w-5 h-5 animate-spin" />
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="py-2">
                        {searchResults.map((u) => (
                          <div 
                            key={u.id}
                            onClick={() => setSelectedUser(u)}
                            className="px-4 py-2 hover:bg-slate-800 cursor-pointer flex items-center gap-3"
                          >
                            <img src={u.avatar_url || 'https://via.placeholder.com/40'} alt="" className="w-8 h-8 rounded-full object-cover bg-slate-800" />
                            <div>
                              <p className="text-sm font-semibold text-slate-200">{u.full_name}</p>
                              <p className="text-[10px] text-slate-500">{u.email}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-xs text-slate-500">
                        {AppStrings.AdminRoles.modal.noUsers}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-xl p-3">
                <div className="flex items-center gap-3">
                  <img src={selectedUser.avatar_url || 'https://via.placeholder.com/40'} alt="" className="w-10 h-10 rounded-full object-cover bg-slate-800" />
                  <div>
                    <p className="text-sm font-semibold text-slate-200">{selectedUser.full_name}</p>
                    <p className="text-xs text-slate-500">{selectedUser.email}</p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => { setSelectedUser(null); setSearchQuery(''); }}
                  className="text-xs text-rose-400 hover:text-rose-300 font-bold"
                >
                  Change
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-2 font-semibold">
              {AppStrings.AdminRoles.modal.selectRoleLabel}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`flex items-center justify-center py-3 border rounded-xl cursor-pointer transition-colors ${role === 'admin' ? 'bg-purple-500/10 border-purple-500/50 text-purple-400 font-bold' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
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
              <label className={`flex items-center justify-center py-3 border rounded-xl cursor-pointer transition-colors ${role === 'moderator' ? 'bg-blue-500/10 border-blue-500/50 text-blue-400 font-bold' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
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

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-colors"
            >
              {AppStrings.AdminRoles.modal.cancelBtn}
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedUser}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {AppStrings.AdminRoles.modal.assignBtn}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
