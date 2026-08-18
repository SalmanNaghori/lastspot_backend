import React, { useState } from 'react';
import { AppStrings } from '@/core/constants/app_strings';

export function SettingsPage() {
  const [flags, setFlags] = useState({
    chat: true,
    travel: true,
    sports: true,
  });

  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert(AppStrings.Settings.alerts.saved);
    }, 600);
  };

  return (
    <div className="max-w-5xl text-slate-100">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-white mb-1">{AppStrings.Settings.title}</h1>
        <p className="text-sm text-slate-400">{AppStrings.Settings.subtitle}</p>
      </div>

      <div className="bg-[#111827]/80 backdrop-blur-md border border-slate-800/80 rounded-[20px] p-8">
        <h3 className="text-base font-bold text-white mb-6">{AppStrings.Settings.flagsHeader}</h3>

        <div className="space-y-4 mb-8">
          
          <div className="flex items-center justify-between px-5 py-4 bg-[#0B1121]/50 border border-slate-800/60 rounded-xl">
            <span className="text-sm font-medium text-slate-200">{AppStrings.Settings.flags.chat}</span>
            <button 
              onClick={() => setFlags({ ...flags, chat: !flags.chat })}
              className={`text-sm font-bold transition-colors ${flags.chat ? 'text-emerald-400' : 'text-slate-500'}`}
            >
              {flags.chat ? AppStrings.Common.enabled : AppStrings.Common.disabled}
            </button>
          </div>

          <div className="flex items-center justify-between px-5 py-4 bg-[#0B1121]/50 border border-slate-800/60 rounded-xl">
            <span className="text-sm font-medium text-slate-200">{AppStrings.Settings.flags.travel}</span>
            <button 
              onClick={() => setFlags({ ...flags, travel: !flags.travel })}
              className={`text-sm font-bold transition-colors ${flags.travel ? 'text-emerald-400' : 'text-slate-500'}`}
            >
              {flags.travel ? AppStrings.Common.enabled : AppStrings.Common.disabled}
            </button>
          </div>

          <div className="flex items-center justify-between px-5 py-4 bg-[#0B1121]/50 border border-slate-800/60 rounded-xl">
            <span className="text-sm font-medium text-slate-200">{AppStrings.Settings.flags.sports}</span>
            <button 
              onClick={() => setFlags({ ...flags, sports: !flags.sports })}
              className={`text-sm font-bold transition-colors ${flags.sports ? 'text-emerald-400' : 'text-slate-500'}`}
            >
              {flags.sports ? AppStrings.Common.enabled : AppStrings.Common.disabled}
            </button>
          </div>

        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-[#059669] hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-70 shadow-lg shadow-emerald-900/20"
        >
          {saving ? 'Saving...' : AppStrings.Settings.saveBtn}
        </button>
      </div>
    </div>
  );
}
