import React, { useState, useEffect } from 'react';
import { Plus, ChevronDown, Eye } from 'lucide-react';
import { adminRepo } from '@/lib/adminRepo';
import { useNavigate } from 'react-router-dom';
import { AppStrings } from '@/core/constants/app_strings';
import { useToast } from '@/app/providers/ToastProvider';
import { 
  AdminPageHeader, AdminSearchBar, AdminStatusBadge, 
  AdminDataTable, AdminModal, AdminFormField, type Column 
} from '@/components/brand';

export function RequestsPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ requests: [] as any[], total: 0, totalPages: 1 });
  const [categories, setCategories] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: 'cat-1',
    location: '',
    event_date_time: '',
    required_people: 2,
    available_seats: 0,
    cost: 0,
    currency: 'INR',
    expiry_date_time: '',
    status: 'published',
    visibility: 'public',
    notification_audience: 'all',
  });

  const loadRequests = async () => {
    setLoading(true);
    const res = await adminRepo.getRequests({
      search,
      categoryId: categoryFilter,
      status: statusFilter,
      cityId: cityFilter,
      page,
      pageSize: 8,
    });
    setData(res);
    setLoading(false);
  };

  useEffect(() => {
    adminRepo.getCategories().then(setCategories);
    adminRepo.getCities({ status: 'active', page: 1, pageSize: 100 }).then((res) => setCities(res.cities || []));
  }, []);

  useEffect(() => {
    let ignore = false;
    adminRepo
      .getRequests({ search, categoryId: categoryFilter, status: statusFilter, cityId: cityFilter, page, pageSize: 8 })
      .then((res) => {
        if (!ignore) {
          setData(res);
          setLoading(false);
        }
      });
    return () => {
      ignore = true;
    };
  }, [search, categoryFilter, statusFilter, cityFilter, page]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.location) {
      showToast('Title and Location are required!', 'error');
      return;
    }
    await adminRepo.saveRequest(formData);
    showToast('Activity Request / Post published successfully!', 'success');
    setIsCreateOpen(false);
    loadRequests();
  };

  const columns: Column<any>[] = [
    {
      header: AppStrings.Requests.tableHeaders.titleCategory,
      accessor: (r) => (
        <div>
          <button
            type="button"
            onClick={() => navigate(`/requests/${r.id}`)}
            className="font-bold text-[var(--kb-text)] hover:text-[#F46A35] text-left block max-w-xs truncate transition-colors"
          >
            {r.title}
          </button>
          <span className="text-[11px] font-mono text-[#F46A35] font-semibold">
            {r.category_name}
          </span>
        </div>
      ),
    },
    {
      header: AppStrings.Requests.tableHeaders.createdBy,
      accessor: (r) => (
        <span className="font-semibold text-[var(--kb-text)]">
          {r.creator_name || 'Member'}
        </span>
      ),
    },
    {
      header: AppStrings.Requests.tableHeaders.location,
      accessor: (r) => (
        <span className="text-xs text-[var(--kb-muted)] max-w-xs truncate block">
          {r.location || 'Venue TBD'}
        </span>
      ),
    },
    {
      header: AppStrings.Requests.tableHeaders.peopleNeeded,
      accessor: (r) => (
        <span className="text-xs font-semibold text-[var(--kb-text)] font-mono">
          {r.required_people} Player(s)
        </span>
      ),
    },
    {
      header: AppStrings.Requests.tableHeaders.status,
      accessor: (r) => (
        <AdminStatusBadge status={r.status || 'open'} size="sm" />
      ),
    },
    {
      header: AppStrings.Requests.tableHeaders.actions,
      headerClassName: 'text-right',
      className: 'text-right',
      accessor: (r) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/requests/${r.id}`);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[var(--kb-surface-subtle)] text-[var(--kb-text)] border border-[var(--kb-border)] hover:border-[#F46A35] hover:text-[#F46A35] transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{AppStrings.Requests.actions.inspect}</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <AdminPageHeader
        title={AppStrings.Requests.title}
        subtitle={AppStrings.Requests.subtitle}
        actions={
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#F46A35] hover:bg-[#DC5425] shadow-md shadow-[#F46A35]/20 transition-all hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>{AppStrings.Requests.createBtn}</span>
          </button>
        }
      />

      {/* Search & Filters */}
      <div className="p-4 rounded-2xl bg-[var(--kb-surface)] border border-[var(--kb-border)] flex flex-col md:flex-row gap-3 items-stretch md:items-center shadow-xs">
        <AdminSearchBar
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder={AppStrings.Requests.searchPlaceholder}
          className="flex-1"
        />

        <div className="relative shrink-0">
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-auto appearance-none bg-[var(--kb-surface-subtle)] border border-[var(--kb-border)] rounded-xl pl-3 pr-9 py-2.5 text-xs sm:text-sm text-[var(--kb-text)] focus:outline-none focus:border-[#F46A35] cursor-pointer font-semibold"
          >
            <option value="all">{AppStrings.Requests.filters.allCategories}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[var(--kb-muted)] pointer-events-none" />
        </div>

        <div className="relative shrink-0">
          <select
            value={cityFilter}
            onChange={(e) => {
              setCityFilter(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-auto appearance-none bg-[var(--kb-surface-subtle)] border border-[var(--kb-border)] rounded-xl pl-3 pr-9 py-2.5 text-xs sm:text-sm text-[var(--kb-text)] focus:outline-none focus:border-[#F46A35] cursor-pointer font-semibold"
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

        <div className="relative shrink-0">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-auto appearance-none bg-[var(--kb-surface-subtle)] border border-[var(--kb-border)] rounded-xl pl-3 pr-9 py-2.5 text-xs sm:text-sm text-[var(--kb-text)] focus:outline-none focus:border-[#F46A35] cursor-pointer font-semibold"
          >
            <option value="all">{AppStrings.Requests.filters.allStatuses}</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="full">Full</option>
            <option value="closed">Closed</option>
            <option value="reported">Reported</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[var(--kb-muted)] pointer-events-none" />
        </div>
      </div>

      {/* Data Table */}
      <AdminDataTable
        columns={columns}
        data={data.requests}
        keyExtractor={(r) => r.id}
        loading={loading}
        emptyType="empty_activities"
        emptyTitle={AppStrings.Requests.noData}
        emptyDescription="No activity requests found matching the current search, category, or status."
        emptyAction={{
          label: 'Create Activity Post',
          onClick: () => setIsCreateOpen(true),
        }}
        pagination={{
          currentPage: page,
          totalPages: data.totalPages,
          totalItems: data.total,
          pageSize: 8,
          onPageChange: (newPage) => setPage(newPage),
        }}
        onRowClick={(r) => navigate(`/requests/${r.id}`)}
      />

      {/* Branded Create Request Modal */}
      <AdminModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title={AppStrings.Requests.modal.createTitle}
        subtitle="Publish a sports match, training session, or activity for community members."
        maxWidth="xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminFormField label={AppStrings.Requests.modal.titleLabel} required>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder={AppStrings.Requests.modal.titlePlaceholder}
                className="w-full bg-[var(--kb-surface-subtle)] border border-[var(--kb-border)] rounded-xl p-3 text-xs sm:text-sm text-[var(--kb-text)] focus:outline-none focus:border-[#F46A35]"
              />
            </AdminFormField>

            <AdminFormField label={AppStrings.Requests.modal.categoryLabel} required>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full bg-[var(--kb-surface-subtle)] border border-[var(--kb-border)] rounded-xl p-3 text-xs sm:text-sm text-[var(--kb-text)] focus:outline-none focus:border-[#F46A35] font-semibold"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </AdminFormField>
          </div>

          <AdminFormField label={AppStrings.Requests.modal.descLabel}>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={AppStrings.Requests.modal.descPlaceholder}
              className="w-full bg-[var(--kb-surface-subtle)] border border-[var(--kb-border)] rounded-xl p-3 text-xs sm:text-sm text-[var(--kb-text)] focus:outline-none focus:border-[#F46A35]"
            />
          </AdminFormField>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminFormField label={AppStrings.Requests.modal.locationLabel} required>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder={AppStrings.Requests.modal.locationPlaceholder}
                className="w-full bg-[var(--kb-surface-subtle)] border border-[var(--kb-border)] rounded-xl p-3 text-xs sm:text-sm text-[var(--kb-text)] focus:outline-none focus:border-[#F46A35]"
              />
            </AdminFormField>

            <AdminFormField label={AppStrings.Requests.modal.dateLabel}>
              <input
                type="datetime-local"
                value={formData.event_date_time}
                onChange={(e) => setFormData({ ...formData, event_date_time: e.target.value })}
                className="w-full bg-[var(--kb-surface-subtle)] border border-[var(--kb-border)] rounded-xl p-3 text-xs sm:text-sm text-[var(--kb-text)] focus:outline-none focus:border-[#F46A35]"
              />
            </AdminFormField>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <AdminFormField label={AppStrings.Requests.modal.peopleLabel}>
              <input
                type="number"
                min="1"
                value={formData.required_people}
                onChange={(e) => setFormData({ ...formData, required_people: parseInt(e.target.value, 10) || 1 })}
                className="w-full bg-[var(--kb-surface-subtle)] border border-[var(--kb-border)] rounded-xl p-3 text-xs sm:text-sm text-[var(--kb-text)]"
              />
            </AdminFormField>

            <AdminFormField label={AppStrings.Requests.modal.costLabel}>
              <input
                type="number"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: parseInt(e.target.value, 10) || 0 })}
                className="w-full bg-[var(--kb-surface-subtle)] border border-[var(--kb-border)] rounded-xl p-3 text-xs sm:text-sm text-[var(--kb-text)]"
              />
            </AdminFormField>

            <AdminFormField label={AppStrings.Requests.modal.currencyLabel}>
              <input
                type="text"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full bg-[var(--kb-surface-subtle)] border border-[var(--kb-border)] rounded-xl p-3 text-xs sm:text-sm text-[var(--kb-text)]"
              />
            </AdminFormField>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--kb-border)]">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-[var(--kb-border)] text-xs font-semibold text-[var(--kb-muted)] hover:bg-[var(--kb-surface-subtle)] transition-colors"
            >
              {AppStrings.Common.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#F46A35] hover:bg-[#DC5425] text-white text-xs font-bold shadow-md shadow-[#F46A35]/20 transition-all hover:-translate-y-0.5"
            >
              {AppStrings.Requests.modal.publishBtn}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
