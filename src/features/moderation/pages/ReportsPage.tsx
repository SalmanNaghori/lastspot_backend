import React, { useState, useEffect } from 'react';
import { ShieldCheck, Check, Ban } from 'lucide-react';
import { adminRepo } from '@/lib/adminRepo';
import { AppStrings } from '@/core/constants/app_strings';
import { useToast } from '@/app/providers/ToastProvider';
import { 
  AdminPageHeader, AdminDataTable, AdminStatusBadge, type Column 
} from '@/components/brand';

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

  const filterTabs = [
    { id: 'all', label: 'All Reports' },
    { id: 'open', label: 'Open' },
    { id: 'resolved', label: 'Resolved' },
    { id: 'dismissed', label: 'Dismissed' },
  ];

  const columns: Column<any>[] = [
    {
      header: AppStrings.Reports.tableHeaders.reporter,
      accessor: (rep) => (
        <span className="font-bold text-[var(--kb-text)] text-xs sm:text-sm">
          {rep.reporter_name || 'Member'}
        </span>
      ),
    },
    {
      header: AppStrings.Reports.tableHeaders.targetContent,
      accessor: (rep) => (
        <span className="font-semibold text-[var(--kb-text)] text-xs">
          {rep.target_info || 'Activity / User'}
        </span>
      ),
    },
    {
      header: AppStrings.Reports.tableHeaders.reason,
      accessor: (rep) => (
        <span className="capitalize font-mono font-bold text-rose-500 text-xs">
          {rep.reason}
        </span>
      ),
    },
    {
      header: AppStrings.Reports.tableHeaders.description,
      accessor: (rep) => (
        <span className="text-xs text-[var(--kb-muted)] max-w-xs truncate block">
          {rep.description || 'No additional notes provided'}
        </span>
      ),
    },
    {
      header: AppStrings.Reports.tableHeaders.status,
      accessor: (rep) => (
        <AdminStatusBadge status={rep.status} size="sm" />
      ),
    },
    {
      header: AppStrings.Reports.tableHeaders.actions,
      headerClassName: 'text-right',
      className: 'text-right',
      accessor: (rep) => (
        <div className="flex items-center justify-end gap-2">
          {rep.status === 'open' && (
            <>
              <button
                type="button"
                onClick={() => handleResolve(rep.id)}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#F46A35] hover:bg-[#DC5425] text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{AppStrings.Reports.actions.resolve}</span>
              </button>
              <button
                type="button"
                onClick={() => handleDismiss(rep.id)}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-[var(--kb-surface-subtle)] hover:bg-[var(--kb-border)] text-[var(--kb-text)] rounded-xl text-xs font-semibold border border-[var(--kb-border)] transition-colors"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>{AppStrings.Reports.actions.dismiss}</span>
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <AdminPageHeader
        title={AppStrings.Reports.title}
        subtitle={AppStrings.Reports.subtitle}
      />

      {/* Filter Tabs */}
      <div className="p-4 rounded-2xl bg-[var(--kb-surface)] border border-[var(--kb-border)] flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--kb-surface-subtle)] border border-[var(--kb-border)] overflow-x-auto no-scrollbar">
          {filterTabs.map((tab) => {
            const isActive = status === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setStatus(tab.id);
                  setPage(1);
                }}
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

      {/* Reports Table */}
      <AdminDataTable
        columns={columns}
        data={data.reports}
        keyExtractor={(rep) => rep.id}
        loading={loading}
        emptyType="empty_reports"
        emptyTitle={AppStrings.Reports.noData}
        emptyDescription="All sports activities and players adhere to fair-play guidelines."
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
