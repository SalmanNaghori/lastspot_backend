import React, { useState, useEffect } from 'react';
import { ChevronDown, UserPlus } from 'lucide-react';
import { adminRepo } from '@/lib/adminRepo';
import { AppStrings } from '@/core/constants/app_strings';
import { 
  AdminPageHeader, AdminSearchBar, AdminStatusBadge, 
  AdminDataTable, type Column 
} from '@/components/brand';

export function JoinRequestsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ joinRequests: [] as any[], total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    adminRepo.getJoinRequests({ search, status, page, pageSize: 8 }).then((res) => {
      if (!ignore) {
        setData(res);
        setLoading(false);
      }
    });
    return () => {
      ignore = true;
    };
  }, [search, status, page]);

  const columns: Column<any>[] = [
    {
      header: AppStrings.JoinRequests.tableHeaders.applicant,
      accessor: (j) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#F46A35]/10 border border-[#F46A35]/20 flex items-center justify-center font-bold text-xs text-[#F46A35] shrink-0">
            <UserPlus className="w-4 h-4" />
          </div>
          <span className="font-bold text-[var(--kb-text)] text-xs sm:text-sm">
            {j.applicant_name || 'Member'}
          </span>
        </div>
      ),
    },
    {
      header: AppStrings.JoinRequests.tableHeaders.targetPost,
      accessor: (j) => (
        <span className="font-semibold text-[var(--kb-text)] max-w-xs truncate block">
          {j.request_title || 'Untitled Activity'}
        </span>
      ),
    },
    {
      header: AppStrings.JoinRequests.tableHeaders.postOwner,
      accessor: (j) => (
        <span className="text-xs text-[var(--kb-muted)]">
          {j.owner_name || 'System Admin'}
        </span>
      ),
    },
    {
      header: AppStrings.JoinRequests.tableHeaders.note,
      accessor: (j) => (
        <span className="text-xs text-[var(--kb-muted)] max-w-xs truncate block italic">
          {j.note || 'No note attached'}
        </span>
      ),
    },
    {
      header: AppStrings.JoinRequests.tableHeaders.status,
      accessor: (j) => (
        <AdminStatusBadge status={j.status || 'pending'} size="sm" />
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <AdminPageHeader
        title={AppStrings.JoinRequests.title}
        subtitle={AppStrings.JoinRequests.subtitle}
      />

      {/* Filter and Search Container */}
      <div className="p-4 rounded-2xl bg-[var(--kb-surface)] border border-[var(--kb-border)] flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between shadow-xs">
        <AdminSearchBar
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder={AppStrings.JoinRequests.searchPlaceholder}
          className="flex-1"
        />

        <div className="relative shrink-0">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-auto appearance-none bg-[var(--kb-surface-subtle)] border border-[var(--kb-border)] rounded-xl pl-3.5 pr-9 py-2.5 text-xs sm:text-sm text-[var(--kb-text)] focus:outline-none focus:border-[#F46A35] cursor-pointer font-semibold"
          >
            <option value="all">{AppStrings.JoinRequests.filters.all}</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
          <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[var(--kb-muted)] pointer-events-none" />
        </div>
      </div>

      {/* Data Table */}
      <AdminDataTable
        columns={columns}
        data={data.joinRequests}
        keyExtractor={(j) => j.id}
        loading={loading}
        emptyType="empty_activities"
        emptyTitle={AppStrings.JoinRequests.noData}
        emptyDescription="No join applications match your filter."
        pagination={{
          currentPage: page,
          totalPages: data.totalPages,
          totalItems: data.total,
          pageSize: 8,
          onPageChange: (newPage) => setPage(newPage),
        }}
      />
    </div>
  );
}
