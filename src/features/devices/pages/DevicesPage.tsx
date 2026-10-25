import React, { useState, useEffect } from 'react';
import { adminRepo } from '@/lib/adminRepo';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle, Smartphone } from 'lucide-react';
import { AppStrings } from '@/core/constants/app_strings';
import { 
  AdminPageHeader, AdminSearchBar, AdminDataTable, type Column 
} from '@/components/brand';

function formatRelativeTime(dateString: string) {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return 'Yesterday';
  
  return `${diffInDays} days ago`;
}

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
    adminRepo.getDevices({ search, platformFilter, page, pageSize: 12 }).then((res) => {
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

  const filterTabs = [
    { id: 'all', label: 'All Platforms' },
    { id: 'Android', label: 'Android' },
    { id: 'iOS', label: 'iOS' },
    { id: 'Web', label: 'Web / Desktop' },
  ];

  const columns: Column<any>[] = [
    {
      header: AppStrings.Devices.tableHeaders.user,
      accessor: (d) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#F46A35]/10 border border-[#F46A35]/20 flex items-center justify-center font-bold text-xs text-[#F46A35] shrink-0">
            <Smartphone className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-[var(--kb-text)] text-xs sm:text-sm truncate">
              {d.user_name || 'Member'}
            </p>
            <p className="text-[11px] text-[var(--kb-muted)] truncate font-mono">
              {d.user_email || 'No email'}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: AppStrings.Devices.tableHeaders.model,
      accessor: (d) => (
        <span className="font-semibold text-[var(--kb-text)] text-xs sm:text-sm">
          {d.device_model || 'Unknown Device'}
        </span>
      ),
    },
    {
      header: AppStrings.Devices.tableHeaders.platform,
      accessor: (d) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[var(--kb-surface-subtle)] border border-[var(--kb-border)] text-[var(--kb-text)]">
          {d.platform === 'android' ? 'Android' : d.platform === 'ios' ? 'iOS' : d.platform === 'web' ? 'Web' : d.platform}
        </span>
      ),
    },
    {
      header: AppStrings.Devices.tableHeaders.osVersion,
      accessor: (d) => (
        <span className="font-mono text-xs text-[var(--kb-muted)]">
          {d.os_version || '-'}
        </span>
      ),
    },
    {
      header: AppStrings.Devices.tableHeaders.appVersion,
      accessor: (d) => (
        <span className="font-mono text-xs text-[var(--kb-text)] font-semibold">
          {d.app_version ? `v${d.app_version}` : '-'}
        </span>
      ),
    },
    {
      header: AppStrings.Devices.tableHeaders.lastActive,
      accessor: (d) => (
        <span className="text-xs text-[var(--kb-muted)]">
          {d.last_active_at ? formatRelativeTime(d.last_active_at) : 'Never'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <AdminPageHeader
        title={AppStrings.Devices.title}
        subtitle={AppStrings.Devices.subtitle}
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

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-[var(--kb-surface)] border border-[var(--kb-border)] flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between shadow-xs">
        <AdminSearchBar
          value={search}
          onChange={(val) => updateParam('search', val || null)}
          placeholder={AppStrings.Devices.searchPlaceholder}
          className="flex-1"
        />

        {/* Platform Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1 rounded-xl bg-[var(--kb-surface-subtle)] border border-[var(--kb-border)]">
          {filterTabs.map((tab) => {
            const isActive = platformFilter.toLowerCase() === tab.id.toLowerCase();
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => updateParam('platform', tab.id === 'all' ? null : tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
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

      {/* Devices Data Table */}
      <AdminDataTable
        columns={columns}
        data={data.devices}
        keyExtractor={(d) => d.id}
        loading={loading}
        emptyType="empty_devices"
        emptyTitle={AppStrings.Devices.noData}
        emptyDescription="No registered devices match the selected platform filter or search query."
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
          pageSize: 12,
          onPageChange: (newPage) => updateParam('page', newPage.toString()),
        }}
        onRowClick={(d) => navigate(`/users/${d.user_id}`)}
      />
    </div>
  );
}
