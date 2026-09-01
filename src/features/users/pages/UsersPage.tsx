import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, XCircle } from 'lucide-react';
import { adminRepo } from '@/lib/adminRepo';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppStrings } from '@/core/constants/app_strings';

export function UsersPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read URL params
  const search = searchParams.get('search') || '';
  const statusFilter = searchParams.get('status') || 'all';
  const deletedFilter = searchParams.get('deleted') === 'true';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [data, setData] = useState({ users: [] as any[], total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    // Transform deletedFilter into statusFilter for adminRepo logic, or update adminRepo to accept it explicitly.
    // In our adminRepo, if statusFilter === 'deleted', it checks deleted_at.
    // To strictly support separate ?deleted=true, we pass it down.
    const effectiveStatus = deletedFilter ? 'deleted' : statusFilter;

    adminRepo.getUsers({ search, statusFilter: effectiveStatus, page, pageSize: 8 }).then((res) => {
      if (!ignore) {
        setData(res);
        setLoading(false);
      }
    });
    return () => {
      ignore = true;
    };
  }, [search, statusFilter, deletedFilter, page]);

  const updateParam = (key: string, value: string | null) => {
    setLoading(true);
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    // Reset page on filter change
    if (key !== 'page') {
      newParams.set('page', '1');
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setLoading(true);
    setSearchParams(new URLSearchParams());
  };

  const hasFilters = search !== '' || statusFilter !== 'all' || deletedFilter;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">{AppStrings.Users.title}</h1>
          <p className="text-xs text-slate-400 mt-0.5">{AppStrings.Users.subtitle}</p>
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
            placeholder={AppStrings.Users.searchPlaceholder}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
          {['all', 'active', 'suspended', 'banned'].map((filter) => (
            <button
              key={filter}
              onClick={() => {
                updateParam('status', filter === 'all' ? null : filter);
                updateParam('deleted', null); // Reset deleted if picking a status
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-all shadow-sm ${
                statusFilter === filter && !deletedFilter
                  ? 'bg-emerald-600 text-white border-transparent'
                  : 'bg-slate-950 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500'
              }`}
            >
              {filter}
            </button>
          ))}
          <div className="w-px h-6 bg-slate-700 mx-1 hidden md:block"></div>
          <button
            onClick={() => {
              updateParam('deleted', 'true');
              updateParam('status', null);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-all shadow-sm ${
              deletedFilter
                ? 'bg-rose-600 text-white border-transparent'
                : 'bg-slate-950 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500'
            }`}
          >
            {AppStrings.Users.filters.deleted}
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-sm font-medium text-slate-400 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" /> 
            {AppStrings.Users.loading}
          </div>
        ) : data.users.length === 0 ? (
          <div className="p-16 text-center text-sm font-medium text-slate-400">
            <p className="text-slate-300 mb-1">{AppStrings.Users.noData}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B1121] border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-4">{AppStrings.Users.tableHeaders.user}</th>
                  <th className="px-5 py-4">{AppStrings.Users.tableHeaders.status}</th>
                  <th className="px-5 py-4">{AppStrings.Users.tableHeaders.softDelete}</th>
                  <th className="px-5 py-4 text-right">{AppStrings.Users.tableHeaders.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data.users.map((u) => (
                  <tr 
                    key={u.id} 
                    onClick={() => navigate(`/users/${u.id}`)}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <img src={u.avatar_url || 'https://via.placeholder.com/40'} alt="" className="w-9 h-9 rounded-full object-cover bg-slate-800 border border-slate-700" />
                        <div>
                          <p className="font-bold text-slate-200 text-sm">{u.full_name || 'Anonymous'}</p>
                          <p className="text-[10px] font-mono text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border
                        ${u.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : ''}
                        ${u.status === 'suspended' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : ''}
                        ${u.status === 'banned' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : ''}
                      `}>
                        {u.status || AppStrings.Users.status.unknown}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[11px] font-medium">
                      {u.deleted_at ? (
                        <span className="text-rose-400">{AppStrings.Users.status.deleted}</span>
                      ) : (
                        <span className="text-slate-500">{AppStrings.Users.status.notDeleted}</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/users/${u.id}`); }}
                        className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-bold border border-slate-700 hover:border-slate-500 transition-colors"
                      >
                        {AppStrings.Users.actions.inspect}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-xs text-slate-400 font-medium">
            {AppStrings.Common.pagination.showingPage} {page} {AppStrings.Common.pagination.of} {data.totalPages} ({data.total} {AppStrings.Common.pagination.total})
          </p>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => updateParam('page', (page - 1).toString())}
              className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
            >
              {AppStrings.Common.pagination.previous}
            </button>
            <button
              disabled={page >= data.totalPages}
              onClick={() => updateParam('page', (page + 1).toString())}
              className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
            >
              {AppStrings.Common.pagination.next}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
