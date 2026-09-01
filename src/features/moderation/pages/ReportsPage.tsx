import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { adminRepo } from '@/lib/adminRepo';
import { AppStrings } from '@/core/constants/app_strings';
import { useToast } from '@/app/providers/ToastProvider';

export function ReportsPage() {
  const { showToast } = useToast();
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ reports: [] as any[], total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const loadReports = async () => {
    setLoading(true);
    const res = await adminRepo.getReports({ status, page, pageSize: 8 });
    setData(res);
    setLoading(false);
  };

  useEffect(() => {
    let ignore = false;
    adminRepo.getReports({ status, page, pageSize: 8 }).then((res) => {
      if (!ignore) {
        setData(res);
        setLoading(false);
      }
    });
    return () => {
      ignore = true;
    };
  }, [status, page]);

  const handleDismiss = async (id: string) => {
    await adminRepo.dismissReport(id);
    showToast('Report dismissed after review.', 'info');
    loadReports();
  };

  const handleResolve = async (id: string) => {
    await adminRepo.resolveReport(id, 'Resolved by Admin after taking appropriate action.');
    showToast('Report marked as resolved!', 'success');
    loadReports();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">{AppStrings.Reports.title}</h1>
        <p className="text-xs text-slate-400 mt-0.5">{AppStrings.Reports.subtitle}</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex gap-2">
        {['all', 'open', 'resolved', 'dismissed'].map((st) => (
          <button
            key={st}
            onClick={() => { setLoading(true); setStatus(st); setPage(1); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all ${
              status === st
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" /> {AppStrings.Reports.loading}
          </div>
        ) : data.reports.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">{AppStrings.Reports.noData}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">{AppStrings.Reports.tableHeaders.reporter}</th>
                  <th className="px-4 py-3">{AppStrings.Reports.tableHeaders.targetContent}</th>
                  <th className="px-4 py-3">{AppStrings.Reports.tableHeaders.reason}</th>
                  <th className="px-4 py-3">{AppStrings.Reports.tableHeaders.description}</th>
                  <th className="px-4 py-3">{AppStrings.Reports.tableHeaders.status}</th>
                  <th className="px-4 py-3 text-right">{AppStrings.Reports.tableHeaders.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data.reports.map((rep) => (
                  <tr key={rep.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-200">{rep.reporter_name}</td>
                    <td className="px-4 py-3 text-slate-300 font-medium">{rep.target_info}</td>
                    <td className="px-4 py-3 capitalize text-rose-400 font-mono text-[11px]">{rep.reason}</td>
                    <td className="px-4 py-3 text-slate-400 text-[11px] max-w-xs truncate">{rep.description}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          rep.status === 'open'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {rep.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      {rep.status === 'open' && (
                        <>
                          <button
                            onClick={() => handleResolve(rep.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px]"
                          >
                            {AppStrings.Reports.actions.resolve}
                          </button>
                          <button
                            onClick={() => handleDismiss(rep.id)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px]"
                          >
                            {AppStrings.Reports.actions.dismiss}
                          </button>
                        </>
                      )}
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
