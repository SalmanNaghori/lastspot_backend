import React, { useState } from 'react';
import { adminRepo } from '@/lib/adminRepo';
import { AppStrings } from '@/core/constants/app_strings';
import { Loader2 } from 'lucide-react';

interface CreateAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  showToast: (msg: string, type: string) => void;
}

export function CreateAdminModal({ isOpen, onClose, onCreated, showToast }: CreateAdminModalProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'super_admin' | 'admin' | 'moderator'>('moderator');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password || !role) {
      showToast('Please fill in all fields.', 'warning');
      return;
    }
    
    if (password.length < 6) {
      showToast('Password must be at least 6 characters.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      await adminRepo.createAdminUser({
        full_name: fullName,
        email,
        password,
        role
      });
      showToast(AppStrings.AdminRoles.alerts.created, 'success');
      onCreated();
      onClose();
      // Reset form
      setFullName('');
      setEmail('');
      setPassword('');
      setRole('moderator');
    } catch (err: any) {
      showToast(err.message || AppStrings.AdminRoles.alerts.createError, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <h3 className="font-bold text-lg">{AppStrings.AdminRoles.createModal.title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-300 mb-2 font-semibold">
              {AppStrings.AdminRoles.createModal.nameLabel}
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={AppStrings.AdminRoles.createModal.namePlaceholder}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-2 font-semibold">
              {AppStrings.AdminRoles.createModal.emailLabel}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={AppStrings.AdminRoles.createModal.emailPlaceholder}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-2 font-semibold">
              {AppStrings.AdminRoles.createModal.passwordLabel}
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={AppStrings.AdminRoles.createModal.passwordPlaceholder}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-2 font-semibold">
              {AppStrings.AdminRoles.createModal.roleLabel}
            </label>
            <div className="grid grid-cols-3 gap-3">
              <label className={`flex items-center justify-center py-3 border rounded-xl cursor-pointer transition-colors text-xs ${role === 'super_admin' ? 'bg-amber-500/10 border-amber-500/50 text-amber-400 font-bold' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
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
              <label className={`flex items-center justify-center py-3 border rounded-xl cursor-pointer transition-colors text-xs ${role === 'admin' ? 'bg-purple-500/10 border-purple-500/50 text-purple-400 font-bold' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
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
              <label className={`flex items-center justify-center py-3 border rounded-xl cursor-pointer transition-colors text-xs ${role === 'moderator' ? 'bg-blue-500/10 border-blue-500/50 text-blue-400 font-bold' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
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

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-colors"
            >
              {AppStrings.AdminRoles.createModal.cancelBtn}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-emerald-900/20"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {AppStrings.AdminRoles.createModal.createBtn}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
