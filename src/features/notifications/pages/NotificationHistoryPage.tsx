import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { adminRepo } from '@/lib/adminRepo';
import { AppStrings } from '@/core/constants/app_strings';

export function NotificationHistoryPage() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminRepo.getNotifications().then((res) => {
      setList(res);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">{AppStrings.Notifications.history.title}</h1>
        <p className="text-xs text-slate-400 mt-0.5">{AppStrings.Notifications.history.subtitle}</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" /> {AppStrings.Notifications.history.loading}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">{AppStrings.Notifications.history.tableHeaders.titleMessage}</th>
                  <th className="px-4 py-3">{AppStrings.Notifications.history.tableHeaders.audience}</th>
                  <th className="px-4 py-3">{AppStrings.Notifications.history.tableHeaders.count}</th>
                  <th className="px-4 py-3">{AppStrings.Notifications.history.tableHeaders.status}</th>
                  <th className="px-4 py-3">{AppStrings.Notifications.history.tableHeaders.sentAt}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {list.map((n) => (
                  <tr key={n.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-200">{n.title}</p>
                      <p className="text-[10px] text-slate-400 max-w-xs truncate">{n.message}</p>
                    </td>
                    <td className="px-4 py-3 capitalize text-slate-300 font-mono text-[11px]">{n.target_audience}</td>
                    <td className="px-4 py-3 text-emerald-400 font-mono font-bold text-[11px]">{n.sent_count}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {n.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-[11px]">
                      {new Date(n.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
