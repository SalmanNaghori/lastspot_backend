import React, { useState, useEffect } from 'react';
import { Send, Users } from 'lucide-react';
import { adminRepo } from '@/lib/adminRepo';
import { useNavigate } from 'react-router-dom';
import { AppStrings } from '@/core/constants/app_strings';
import { 
  AdminPageHeader, AdminDataTable, AdminStatusBadge, type Column 
} from '@/components/brand';

export function NotificationHistoryPage() {
  const navigate = useNavigate();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminRepo.getNotifications().then((res) => {
      setList(res);
      setLoading(false);
    });
  }, []);

  const columns: Column<any>[] = [
    {
      header: AppStrings.Notifications.history.tableHeaders.titleMessage,
      accessor: (n) => (
        <div>
          <p className="font-bold text-[var(--kb-text)] text-xs sm:text-sm">
            {n.title}
          </p>
          <p className="text-xs text-[var(--kb-muted)] max-w-sm truncate mt-0.5">
            {n.message}
          </p>
        </div>
      ),
    },
    {
      header: AppStrings.Notifications.history.tableHeaders.audience,
      accessor: (n) => (
        <span className="capitalize text-[var(--kb-text)] font-semibold text-xs font-mono">
          {n.target_audience}
        </span>
      ),
    },
    {
      header: AppStrings.Notifications.history.tableHeaders.count,
      accessor: (n) => (
        <span className="inline-flex items-center gap-1 font-mono font-bold text-[#F46A35] text-xs">
          <Users className="w-3.5 h-3.5" />
          <span>{n.sent_count ?? 0}</span>
        </span>
      ),
    },
    {
      header: AppStrings.Notifications.history.tableHeaders.status,
      accessor: (n) => (
        <AdminStatusBadge status={n.status || 'sent'} size="sm" />
      ),
    },
    {
      header: AppStrings.Notifications.history.tableHeaders.sentAt,
      accessor: (n) => (
        <span className="text-xs text-[var(--kb-muted)] font-mono">
          {new Date(n.created_at).toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <AdminPageHeader
        title={AppStrings.Notifications.history.title}
        subtitle={AppStrings.Notifications.history.subtitle}
        actions={
          <button
            onClick={() => navigate('/notifications')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#F46A35] hover:bg-[#DC5425] shadow-md shadow-[#F46A35]/20 transition-all hover:-translate-y-0.5"
          >
            <Send className="w-4 h-4" />
            <span>Send New Broadcast</span>
          </button>
        }
      />

      <AdminDataTable
        columns={columns}
        data={list}
        keyExtractor={(n) => n.id}
        loading={loading}
        emptyType="empty_notifications"
        emptyTitle="No notification logs"
        emptyDescription="Broadcast announcements to players will be logged here."
        emptyAction={{
          label: 'Send Broadcast',
          onClick: () => navigate('/notifications'),
        }}
      />
    </div>
  );
}
