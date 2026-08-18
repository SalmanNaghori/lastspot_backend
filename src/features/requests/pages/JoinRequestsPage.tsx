import React, { useState, useEffect } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import { adminRepo } from '@/lib/adminRepo';
import { AppStrings } from '@/core/constants/app_strings';

export function JoinRequestsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ joinRequests: [] as any[], total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminRepo.getJoinRequests({ search, status, page, pageSize: 8 }).then((res) => {
      setData(res);
      setLoading(false);
    });
  }, [search, status, page]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">{AppStrings.JoinRequests.title}</h1>
        <p className="text-xs text-slate-400 mt-0.5">{AppStrings.JoinRequests.subtitle}</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder={AppStrings.JoinRequests.searchPlaceholder}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
        >
          <option value="all">{AppStrings.JoinRequests.filters.all}</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" /> {AppStrings.JoinRequests.loading}
          </div>
        ) : data.joinRequests.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">{AppStrings.JoinRequests.noData}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">{AppStrings.JoinRequests.tableHeaders.applicant}</th>
                  <th className="px-4 py-3">{AppStrings.JoinRequests.tableHeaders.targetPost}</th>
                  <th className="px-4 py-3">{AppStrings.JoinRequests.tableHeaders.postOwner}</th>
                  <th className="px-4 py-3">{AppStrings.JoinRequests.tableHeaders.note}</th>
                  <th className="px-4 py-3">{AppStrings.JoinRequests.tableHeaders.status}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data.joinRequests.map((j) => (
                  <tr key={j.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-200">{j.applicant_name}</td>
                    <td className="px-4 py-3 text-slate-300">{j.request_title}</td>
                    <td className="px-4 py-3 text-slate-400">{j.owner_name}</td>
                    <td className="px-4 py-3 text-slate-400 text-[11px] max-w-xs truncate">{j.note || 'None'}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-emerald-400 border border-slate-700">
                        {j.status}
                      </span>
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
