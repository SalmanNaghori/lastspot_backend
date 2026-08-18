import React, { useState } from 'react';
import { Send, Info } from 'lucide-react';
import { adminRepo } from '@/lib/adminRepo';
import { useNavigate } from 'react-router-dom';
import { AppStrings } from '@/core/constants/app_strings';

export function NotificationsPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState('all');
  const [schedule, setSchedule] = useState('');

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) {
      alert(AppStrings.Notifications.alerts.requiredFields);
      return;
    }
    await adminRepo.createNotification({
      title,
      message,
      target_audience: targetAudience,
      status: schedule ? 'scheduled' : 'sent',
      scheduled_at: schedule || null
    });
    alert(schedule ? AppStrings.Notifications.alerts.scheduled : AppStrings.Notifications.alerts.sent);
    setTitle('');
    setMessage('');
    navigate('/notifications-history');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">{AppStrings.Notifications.title}</h1>
        <p className="text-xs text-slate-400 mt-0.5">{AppStrings.Notifications.subtitle}</p>
      </div>

      <form onSubmit={handleSend} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-xs">
        <div>
          <label className="block text-slate-300 mb-1 font-semibold">{AppStrings.Notifications.form.titleLabel}</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={AppStrings.Notifications.form.titlePlaceholder}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-slate-300 mb-1 font-semibold">{AppStrings.Notifications.form.messageLabel}</label>
          <textarea
            rows={4}
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={AppStrings.Notifications.form.messagePlaceholder}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-300 mb-1 font-semibold">{AppStrings.Notifications.form.audienceLabel}</label>
            <select
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100"
            >
              <option value="all">{AppStrings.Notifications.audiences.all}</option>
              <option value="category">{AppStrings.Notifications.audiences.category}</option>
              <option value="location">{AppStrings.Notifications.audiences.location}</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-semibold">{AppStrings.Notifications.form.scheduleLabel}</label>
            <input
              type="datetime-local"
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100"
            />
          </div>
        </div>

        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-[11px] flex items-center gap-2">
          <Info className="w-4 h-4 shrink-0 text-amber-400" />
          <span>{AppStrings.Notifications.form.infoBox}</span>
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-lg transition-colors flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          <span>{schedule ? AppStrings.Notifications.form.scheduleBtn : AppStrings.Notifications.form.sendBtn}</span>
        </button>
      </form>
    </div>
  );
}
