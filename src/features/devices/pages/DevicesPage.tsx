import React, { useState, useEffect } from 'react';
import { adminRepo } from '@/lib/adminRepo';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, RefreshCw, XCircle } from 'lucide-react';
import { AppStrings } from '@/core/constants/app_strings';

export function DevicesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get('search') || '';
  const platformFilter = searchParams.get('platform') || 'all';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [data, setData] = useState({ devices: [] as any[], total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    adminRepo.getDevices({ search, platformFilter, page, pageSize: 15 }).then((res) => {
      if (!ignore) {
        setData(res);
        setLoading(false);
      }
    });
    return () => {
      ignore = true;
    };
  }, [search, platformFilter, page]);

  const updateParam = (key: string, value: string | null) => {
    setLoading(true);
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    if (key !== 'page') newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setLoading(true);
    setSearchParams(new URLSearchParams());
  };
  const hasFilters = search !== '' || platformFilter !== 'all';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">{AppStrings.Devices.title}</h1>
          <p className="text-xs text-slate-400 mt-0.5">{AppStrings.Devices.subtitle}</p>
        </div>
        {hasFilters && (
          <button 
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg transition-colors border border-rose-500/20"
          >
            <XCircle className="w-3.5 h-3.5" /> {AppStrings.Common.clearFilters}
          </button>
        )}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => updateParam('search', e.target.value)}
            placeholder={AppStrings.Devices.searchPlaceholder}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
          {['all', 'Android', 'iOS', 'Web'].map((filter) => (
            <button
              key={filter}
              onClick={() => updateParam('platform', filter === 'all' ? null : filter)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-all shadow-sm ${
                (platformFilter.toLowerCase() === filter.toLowerCase())
                  ? 'bg-indigo-600 text-white border-transparent'
                  : 'bg-slate-950 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-sm font-medium text-slate-400 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" /> 
            {AppStrings.Devices.loading}
          </div>
        ) : data.devices.length === 0 ? (
          <div className="p-16 text-center text-sm font-medium text-slate-400">
            <p className="text-slate-300 mb-1">{AppStrings.Devices.noData}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B1121] border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-4">{AppStrings.Devices.tableHeaders.user}</th>
                  <th className="px-5 py-4">{AppStrings.Devices.tableHeaders.model}</th>
                  <th className="px-5 py-4">{AppStrings.Devices.tableHeaders.platform}</th>
                  <th className="px-5 py-4">{AppStrings.Devices.tableHeaders.version}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data.devices.map((d) => (
                  <tr 
                    key={d.id} 
                    onClick={() => navigate(`/users/${d.user_id}`)}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-4 text-emerald-400 font-semibold">{d.user_name}</td>
                    <td className="px-5 py-4 text-slate-200">{d.device_model}</td>
                    <td className="px-5 py-4 text-slate-300">
                      <span className="px-2 py-1 rounded bg-slate-950 border border-slate-700 text-[10px] font-mono">
                        {d.platform}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-400 font-mono">v{d.app_version}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {data.totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-xs text-slate-400 font-medium">
            {AppStrings.Common.pagination.showingPage} {page} {AppStrings.Common.pagination.of} {data.totalPages} ({data.total} {AppStrings.Common.pagination.total})
          </p>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => updateParam('page', (page - 1).toString())}
              className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800"
            >
              {AppStrings.Common.pagination.previous}
            </button>
            <button
              disabled={page >= data.totalPages}
              onClick={() => updateParam('page', (page + 1).toString())}
              className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800"
            >
              {AppStrings.Common.pagination.next}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
