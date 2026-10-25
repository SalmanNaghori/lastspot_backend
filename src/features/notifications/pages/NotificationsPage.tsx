import React, { useState } from 'react';
import { Send, Info, ChevronDown, History } from 'lucide-react';
import { adminRepo } from '@/lib/adminRepo';
import { useNavigate } from 'react-router-dom';
import { AppStrings } from '@/core/constants/app_strings';
import { useToast } from '@/app/providers/ToastProvider';
import { AdminPageHeader, AdminFormField } from '@/components/brand';

export function NotificationsPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState('all');
  const [schedule, setSchedule] = useState('');

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const { showToast } = useToast();

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) {
      showToast('Title and Message are required!', 'error');
      return;
    }
    
    if (schedule) {
      const selectedTime = new Date(schedule).getTime();
      const currentTime = new Date().getTime();
      if (selectedTime < currentTime) {
        showToast(AppStrings.Notifications.alerts.pastDateError, 'error');
        return;
      }
    }
    await adminRepo.createNotification({
      title,
      message,
      target_audience: targetAudience,
      status: schedule ? 'scheduled' : 'sent',
      scheduled_at: schedule || null,
    });
    showToast(schedule ? 'Notification scheduled successfully!' : 'Broadcast notification sent!', 'success');
    setTitle('');
    setMessage('');
    navigate('/notifications-history');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <AdminPageHeader
        title={AppStrings.Notifications.title}
        subtitle={AppStrings.Notifications.subtitle}
        actions={
          <button
            onClick={() => navigate('/notifications-history')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-[var(--kb-text)] bg-[var(--kb-surface-subtle)] border border-[var(--kb-border)] hover:border-[#F46A35] hover:text-[#F46A35] transition-colors"
          >
            <History className="w-4 h-4" />
            <span>View Logs</span>
          </button>
        }
      />

      <form onSubmit={handleSend} className="bg-[var(--kb-surface)] border border-[var(--kb-border)] rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
        <AdminFormField label={AppStrings.Notifications.form.titleLabel} required>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={AppStrings.Notifications.form.titlePlaceholder}
            className="w-full bg-[var(--kb-surface-subtle)] border border-[var(--kb-border)] rounded-xl p-3.5 text-xs sm:text-sm text-[var(--kb-text)] placeholder-[var(--kb-muted)] focus:outline-none focus:border-[#F46A35] font-semibold"
          />
        </AdminFormField>

        <AdminFormField label={AppStrings.Notifications.form.messageLabel} required>
          <textarea
            rows={4}
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={AppStrings.Notifications.form.messagePlaceholder}
            className="w-full bg-[var(--kb-surface-subtle)] border border-[var(--kb-border)] rounded-xl p-3.5 text-xs sm:text-sm text-[var(--kb-text)] placeholder-[var(--kb-muted)] focus:outline-none focus:border-[#F46A35]"
          />
        </AdminFormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <AdminFormField label={AppStrings.Notifications.form.audienceLabel}>
            <div className="relative">
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full appearance-none bg-[var(--kb-surface-subtle)] border border-[var(--kb-border)] rounded-xl p-3.5 pr-9 text-xs sm:text-sm text-[var(--kb-text)] cursor-pointer focus:outline-none focus:border-[#F46A35] font-semibold"
              >
                <option value="all">{AppStrings.Notifications.audiences.all}</option>
                <option value="category">{AppStrings.Notifications.audiences.category}</option>
                <option value="location">{AppStrings.Notifications.audiences.location}</option>
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--kb-muted)] pointer-events-none" />
            </div>
          </AdminFormField>

          <AdminFormField label={AppStrings.Notifications.form.scheduleLabel}>
            <input
              type="datetime-local"
              value={schedule}
              min={getMinDateTime()}
              onChange={(e) => setSchedule(e.target.value)}
              className="w-full bg-[var(--kb-surface-subtle)] border border-[var(--kb-border)] rounded-xl p-3 text-xs sm:text-sm text-[var(--kb-text)] focus:outline-none focus:border-[#F46A35]"
            />
          </AdminFormField>
        </div>

        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-700 dark:text-amber-300 text-xs flex items-center gap-2.5">
          <Info className="w-4 h-4 shrink-0 text-amber-500" />
          <span>{AppStrings.Notifications.form.infoBox}</span>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="px-6 py-3.5 bg-[#F46A35] hover:bg-[#DC5425] text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-[#F46A35]/20 transition-all flex items-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
          >
            <Send className="w-4 h-4" />
            <span>{schedule ? AppStrings.Notifications.form.scheduleBtn : AppStrings.Notifications.form.sendBtn}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
