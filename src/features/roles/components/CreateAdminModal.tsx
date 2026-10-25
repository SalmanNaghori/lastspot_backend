import React, { useState } from 'react';
import { adminRepo } from '@/lib/adminRepo';
import { AppStrings } from '@/core/constants/app_strings';
import { Loader2 } from 'lucide-react';
import { AdminModal } from '@/components/brand/AdminModal';

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

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={AppStrings.AdminRoles.createModal.title}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-[var(--kb-text)] mb-2 font-semibold">
            {AppStrings.AdminRoles.createModal.nameLabel}
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder={AppStrings.AdminRoles.createModal.namePlaceholder}
            className="w-full bg-[var(--kb-subtle)] border border-[var(--kb-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--kb-text)] placeholder-[var(--kb-muted)] focus:outline-none focus:border-[#F46A35]"
          />
        </div>

        <div>
          <label className="block text-xs text-[var(--kb-text)] mb-2 font-semibold">
            {AppStrings.AdminRoles.createModal.emailLabel}
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={AppStrings.AdminRoles.createModal.emailPlaceholder}
            className="w-full bg-[var(--kb-subtle)] border border-[var(--kb-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--kb-text)] placeholder-[var(--kb-muted)] focus:outline-none focus:border-[#F46A35]"
          />
        </div>

        <div>
          <label className="block text-xs text-[var(--kb-text)] mb-2 font-semibold">
            {AppStrings.AdminRoles.createModal.passwordLabel}
          </label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={AppStrings.AdminRoles.createModal.passwordPlaceholder}
            className="w-full bg-[var(--kb-subtle)] border border-[var(--kb-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--kb-text)] placeholder-[var(--kb-muted)] focus:outline-none focus:border-[#F46A35]"
          />
        </div>

        <div>
          <label className="block text-xs text-[var(--kb-text)] mb-2 font-semibold">
            {AppStrings.AdminRoles.createModal.roleLabel}
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

        <div className="flex justify-end gap-3 pt-4 border-t border-[var(--kb-border)] mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[var(--kb-subtle)] hover:bg-[var(--kb-border)] text-[var(--kb-text)] text-sm font-semibold transition-colors border border-[var(--kb-border)]"
          >
            {AppStrings.AdminRoles.createModal.cancelBtn}
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#F46A35] to-[#FFB45E] hover:opacity-95 text-white text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md shadow-[#F46A35]/20"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {AppStrings.AdminRoles.createModal.createBtn}
          </button>
        </div>
      </form>
    </AdminModal>
  );
}
