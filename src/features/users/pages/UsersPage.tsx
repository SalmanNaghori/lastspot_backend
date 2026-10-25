import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle, ChevronDown, Eye } from 'lucide-react';
import { adminRepo } from '@/lib/adminRepo';
import { AppStrings } from '@/core/constants/app_strings';
import { 
  AdminPageHeader, AdminSearchBar, AdminStatusBadge, 
  AdminDataTable, type Column 
} from '@/components/brand';

export function UsersPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read URL params
  const search = searchParams.get('search') || '';
  const statusFilter = searchParams.get('status') || 'all';
  const cityFilter = searchParams.get('city') || 'all';
  const deletedFilter = searchParams.get('deleted') === 'true';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [data, setData] = useState({ users: [] as any[], total: 0, totalPages: 1 });
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminRepo.getCities({ status: 'active', page: 1, pageSize: 100 }).then((res) => {
      setCities(res.cities || []);
    });
  }, []);

  useEffect(() => {
    let ignore = false;
    const effectiveStatus = deletedFilter ? 'deleted' : statusFilter;

    adminRepo
      .getUsers({ search, statusFilter: effectiveStatus, cityId: cityFilter, page, pageSize: 8 })
      .then((res) => {
        if (!ignore) {
          setData(res);
          setLoading(false);
        }
      });
    return () => {
      ignore = true;
    };
  }, [search, statusFilter, deletedFilter, cityFilter, page]);

  const updateParam = (key: string, value: string | null) => {
    setLoading(true);
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    if (key !== 'page') {
      newParams.set('page', '1');
    }
    setSearchParams(newParams);
  };

  const hasFilters = search !== '' || statusFilter !== 'all' || deletedFilter || cityFilter !== 'all';

  const clearFilters = () => {
    setLoading(true);
    setSearchParams(new URLSearchParams());
  };

  const filterTabs = [
    { id: 'all', label: 'All Users' },
    { id: 'active', label: 'Active' },
    { id: 'suspended', label: 'Suspended' },
    { id: 'banned', label: 'Banned' },
    { id: 'deleted', label: 'Deleted' },
  ];

  const currentTab = deletedFilter ? 'deleted' : statusFilter;

  const handleTabSelect = (tabId: string) => {
    if (tabId === 'deleted') {
      updateParam('deleted', 'true');
      updateParam('status', null);
    } else {
      updateParam('status', tabId === 'all' ? null : tabId);
      updateParam('deleted', null);
    }
  };

  const columns: Column<any>[] = [
    {
      header: AppStrings.Users.tableHeaders.user,
      accessor: (u) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#F46A35]/10 border border-[#F46A35]/20 flex items-center justify-center font-bold text-sm text-[#F46A35] shrink-0 overflow-hidden">
            {u.avatar_url ? (
              <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              (u.full_name?.charAt(0) || u.email?.charAt(0) || 'U').toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-[var(--kb-text)] text-sm truncate">
              {u.full_name || 'Anonymous User'}
            </p>
            <p className="text-xs text-[var(--kb-muted)] truncate font-mono mt-0.5">
              {u.email || u.phone || <span className="italic">No contact provided</span>}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: AppStrings.Users.tableHeaders.status,
      accessor: (u) => (
        <AdminStatusBadge status={u.status || 'active'} size="sm" />
      ),
    },
    {
      header: AppStrings.Users.tableHeaders.softDelete,
      accessor: (u) => (
        u.deleted_at ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">
            {AppStrings.Users.status.deleted}
          </span>
        ) : (
          <span className="text-[var(--kb-muted)] text-xs">Active Account</span>
        )
      ),
    },
    {
      header: AppStrings.Users.tableHeaders.actions,
      headerClassName: 'text-right',
      className: 'text-right',
      accessor: (u) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/users/${u.id}`);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[var(--kb-surface-subtle)] text-[var(--kb-text)] border border-[var(--kb-border)] hover:border-[#F46A35] hover:text-[#F46A35] transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{AppStrings.Users.actions.inspect}</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <AdminPageHeader
        title={AppStrings.Users.title}
        subtitle={AppStrings.Users.subtitle}
        actions={
          hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl transition-colors border border-rose-500/20"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>{AppStrings.Common.clearFilters}</span>
            </button>
          )
        }
      />

      {/* Filter and Search Bar Container */}
      <div className="p-4 rounded-2xl bg-[var(--kb-surface)] border border-[var(--kb-border)] flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between shadow-xs">
        {/* Search */}
        <AdminSearchBar
          value={search}
          onChange={(val) => updateParam('search', val || null)}
          placeholder={AppStrings.Users.searchPlaceholder}
          className="flex-1"
        />

        {/* City Filter */}
        <div className="relative shrink-0">
          <select
            value={cityFilter}
            onChange={(e) => updateParam('city', e.target.value === 'all' ? null : e.target.value)}
            className="w-full sm:w-auto appearance-none bg-[var(--kb-surface-subtle)] border border-[var(--kb-border)] rounded-xl pl-3.5 pr-9 py-2.5 text-xs sm:text-sm text-[var(--kb-text)] focus:outline-none focus:border-[#F46A35] focus:ring-2 focus:ring-[#F46A35]/20 cursor-pointer font-semibold"
          >
            <option value="all">All Cities</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[var(--kb-muted)] pointer-events-none" />
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1 rounded-xl bg-[var(--kb-surface-subtle)] border border-[var(--kb-border)]">
          {filterTabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabSelect(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#F46A35] text-white shadow-sm'
                    : 'text-[var(--kb-muted)] hover:text-[var(--kb-text)] hover:bg-[var(--kb-surface)]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Users Data Table */}
      <AdminDataTable
        columns={columns}
        data={data.users}
        keyExtractor={(u) => u.id}
        loading={loading}
        emptyType="empty_users"
        emptyTitle={AppStrings.Users.noData}
        emptyDescription="Try adjusting your search criteria or resetting status filters."
        emptyAction={
          hasFilters
            ? {
                label: 'Reset Filters',
                onClick: clearFilters,
              }
            : undefined
        }
        pagination={{
          currentPage: page,
          totalPages: data.totalPages,
          totalItems: data.total,
          pageSize: 8,
          onPageChange: (newPage) => updateParam('page', newPage.toString()),
        }}
        onRowClick={(u) => navigate(`/users/${u.id}`)}
      />
    </div>
  );
}
