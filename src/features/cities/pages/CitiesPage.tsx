import React, { useState, useEffect } from 'react';
import { Plus, Edit2, MapPin, Power, MapPinOff } from 'lucide-react';
import { adminRepo } from '@/lib/adminRepo';
import { AppStrings } from '@/core/constants/app_strings';
import { useToast } from '@/app/providers/ToastProvider';
import { AlertDialog } from '@/components/common/AlertDialog';
import { 
  AdminPageHeader, AdminSearchBar, AdminStatCard, 
  AdminDataTable, AdminModal, AdminFormField, AdminStatusBadge, type Column 
} from '@/components/brand';

export function CitiesPage() {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ cities: [] as any[], total: 0, totalPages: 1 });
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    state: '',
    display_order: 999,
    is_active: true,
  });

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    city: any;
    action: 'activate' | 'deactivate' | null;
  }>({ isOpen: false, city: null, action: null });

  const loadData = async () => {
    setLoading(true);
    const [citiesRes, statsRes] = await Promise.all([
      adminRepo.getCities({ search, status: statusFilter, page, pageSize: 12 }),
      adminRepo.getCitiesStats(),
    ]);
    setData(citiesRes);
    setStats(statsRes);
    setLoading(false);
  };

  useEffect(() => {
    let ignore = false;
    Promise.all([
      adminRepo.getCities({ search, status: statusFilter, page, pageSize: 12 }),
      adminRepo.getCitiesStats(),
    ]).then(([citiesRes, statsRes]) => {
      if (!ignore) {
        setData(citiesRes);
        setStats(statsRes);
        setLoading(false);
      }
    });
    return () => {
      ignore = true;
    };
  }, [search, statusFilter, page]);

  const openModal = (city: any = null) => {
    if (city) {
      setEditingCity(city);
      setFormData({
        name: city.name,
        state: city.state || '',
        display_order: city.display_order || 999,
        is_active: city.is_active,
      });
    } else {
      setEditingCity(null);
      setFormData({
        name: '',
        state: '',
        display_order: data.cities.length + 1,
        is_active: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast(AppStrings.Cities.alerts.nameRequired, 'error');
      return;
    }
    
    await adminRepo.saveCity({
      ...formData,
      name: formData.name.trim(),
      state: formData.state.trim(),
      id: editingCity?.id,
    });
    
    showToast(AppStrings.Cities.alerts.saveSuccess, 'success');
    setIsModalOpen(false);
    loadData();
  };

  const promptToggleStatus = (city: any) => {
    setConfirmDialog({
      isOpen: true,
      city,
      action: city.is_active ? 'deactivate' : 'activate',
    });
  };

  const confirmToggleStatus = async () => {
    if (!confirmDialog.city) return;
    
    const city = confirmDialog.city;
    const newStatus = !city.is_active;
    
    setData((prev) => ({
      ...prev,
      cities: prev.cities.map((c) => (c.id === city.id ? { ...c, is_active: newStatus } : c)),
    }));
    setConfirmDialog({ isOpen: false, city: null, action: null });
    
    await adminRepo.toggleCityStatus(city.id, newStatus);
    showToast(AppStrings.Cities.alerts.statusUpdated, 'info');
    loadData();
  };

  const columns: Column<any>[] = [
    {
      header: AppStrings.Cities.tableHeaders.order,
      accessor: (city) => (
        <span className="font-mono text-xs text-[var(--kb-muted)]">
          #{city.display_order}
        </span>
      ),
    },
    {
      header: AppStrings.Cities.tableHeaders.city,
      accessor: (city) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#F46A35]/10 border border-[#F46A35]/20 flex items-center justify-center text-[#F46A35]">
            <MapPin className="w-4 h-4" />
          </div>
          <span className="font-bold text-[var(--kb-text)] text-xs sm:text-sm">
            {city.name}
          </span>
        </div>
      ),
    },
    {
      header: AppStrings.Cities.tableHeaders.state,
      accessor: (city) => (
        <span className="text-xs text-[var(--kb-muted)] font-medium">
          {city.state || '—'}
        </span>
      ),
    },
    {
      header: AppStrings.Cities.tableHeaders.status,
      accessor: (city) => (
        <AdminStatusBadge status={city.is_active ? 'active' : 'disabled'} size="sm" />
      ),
    },
    {
      header: AppStrings.Cities.tableHeaders.created,
      accessor: (city) => (
        <span className="font-mono text-[11px] text-[var(--kb-muted)]">
          {new Date(city.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: AppStrings.Cities.tableHeaders.actions,
      headerClassName: 'text-right',
      className: 'text-right',
      accessor: (city) => (
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => openModal(city)}
            className="p-1.5 rounded-xl text-[var(--kb-muted)] hover:text-[#F46A35] hover:bg-[#F46A35]/10 transition-colors"
            title="Edit City"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => promptToggleStatus(city)}
            className={`p-1.5 rounded-xl transition-colors ${
              city.is_active
                ? 'text-rose-500 hover:bg-rose-500/10'
                : 'text-emerald-500 hover:bg-emerald-500/10'
            }`}
            title={city.is_active ? 'Deactivate City' : 'Activate City'}
          >
            <Power className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <AdminPageHeader
        title={AppStrings.Cities.title}
        subtitle={AppStrings.Cities.subtitle}
        actions={
          <button
            onClick={() => openModal()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#F46A35] hover:bg-[#DC5425] shadow-md shadow-[#F46A35]/20 transition-all hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>{AppStrings.Cities.addCity}</span>
          </button>
        }
      />

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AdminStatCard
          title={AppStrings.Cities.stats.total}
          value={stats.total}
          subtitle="All configured cities"
          icon={MapPin}
          iconColor="text-[#F46A35]"
        />
        <AdminStatCard
          title={AppStrings.Cities.stats.active}
          value={stats.active}
          subtitle="Available for registration"
          icon={MapPin}
          iconColor="text-emerald-500"
        />
        <AdminStatCard
          title={AppStrings.Cities.stats.inactive}
          value={stats.inactive}
          subtitle="Disabled for new activities"
          icon={MapPinOff}
          iconColor="text-slate-400"
        />
      </div>

      {/* SEARCH & STATUS TABS */}
      <div className="p-4 rounded-2xl bg-[var(--kb-surface)] border border-[var(--kb-border)] flex flex-col md:flex-row justify-between items-center gap-4 shadow-xs">
        <AdminSearchBar
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder={AppStrings.Cities.searchPlaceholder}
          className="w-full md:max-w-xs"
        />

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--kb-surface-subtle)] border border-[var(--kb-border)] w-full md:w-auto overflow-x-auto no-scrollbar">
          {['all', 'active', 'inactive'].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setStatusFilter(tab);
                setPage(1);
              }}
              className={`flex-1 md:flex-none px-4 py-1.5 text-xs font-bold capitalize rounded-lg transition-all ${
                statusFilter === tab
                  ? 'bg-[#F46A35] text-white shadow-sm'
                  : 'text-[var(--kb-muted)] hover:text-[var(--kb-text)] hover:bg-[var(--kb-surface)]'
              }`}
            >
              {AppStrings.Cities.tabs[tab as keyof typeof AppStrings.Cities.tabs]}
            </button>
          ))}
        </div>
      </div>

      {/* DATA TABLE */}
      <AdminDataTable
        columns={columns}
        data={data.cities}
        keyExtractor={(c) => c.id}
        loading={loading}
        emptyType="empty_activities"
        emptyTitle={search ? AppStrings.Cities.noSearchResults : AppStrings.Cities.noData}
        emptyDescription="Add cities across India to let players connect in their local sports spaces."
        emptyAction={{
          label: AppStrings.Cities.addCity,
          onClick: () => openModal(),
        }}
        pagination={{
          currentPage: page,
          totalPages: data.totalPages,
          totalItems: data.total,
          pageSize: 12,
          onPageChange: (newPage) => setPage(newPage),
        }}
      />

      {/* CREATE / EDIT MODAL */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCity ? AppStrings.Cities.modal.editTitle : AppStrings.Cities.modal.createTitle}
        subtitle="Manage city name, state, and active presence in KhelBhai mobile app."
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <AdminFormField label={AppStrings.Cities.modal.nameLabel} required>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={AppStrings.Cities.modal.namePlaceholder}
              className="w-full bg-[var(--kb-surface-subtle)] border border-[var(--kb-border)] rounded-xl p-3 text-xs sm:text-sm text-[var(--kb-text)] focus:outline-none focus:border-[#F46A35] font-semibold"
            />
          </AdminFormField>

          <AdminFormField label={AppStrings.Cities.modal.stateLabel}>
            <input
              type="text"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              placeholder={AppStrings.Cities.modal.statePlaceholder}
              className="w-full bg-[var(--kb-surface-subtle)] border border-[var(--kb-border)] rounded-xl p-3 text-xs sm:text-sm text-[var(--kb-text)] focus:outline-none focus:border-[#F46A35]"
            />
          </AdminFormField>

          <AdminFormField label={AppStrings.Cities.modal.orderLabel}>
            <input
              type="number"
              min="1"
              value={formData.display_order}
              onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value, 10) || 999 })}
              className="w-full bg-[var(--kb-surface-subtle)] border border-[var(--kb-border)] rounded-xl p-3 text-xs sm:text-sm text-[var(--kb-text)] focus:outline-none focus:border-[#F46A35] font-mono font-semibold"
            />
          </AdminFormField>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="city_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="rounded text-[#F46A35] accent-[#F46A35] w-4 h-4 cursor-pointer"
            />
            <label htmlFor="city_active" className="text-xs sm:text-sm font-bold text-[var(--kb-text)] cursor-pointer select-none">
              {AppStrings.Cities.modal.isActiveLabel}
            </label>
          </div>

          <div className="pt-4 border-t border-[var(--kb-border)] flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-[var(--kb-muted)] hover:bg-[var(--kb-surface-subtle)] rounded-xl transition-colors"
            >
              {AppStrings.Cities.modal.cancelBtn}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#F46A35] hover:bg-[#DC5425] text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-[#F46A35]/20 transition-all hover:-translate-y-0.5"
            >
              {editingCity ? AppStrings.Cities.modal.updateBtn : AppStrings.Cities.modal.createBtn}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* CONFIRM DIALOG */}
      <AlertDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.action === 'activate' ? AppStrings.Cities.confirmActivate.title : AppStrings.Cities.confirmDeactivate.title}
        description={
          confirmDialog.action === 'activate' 
            ? AppStrings.Cities.confirmActivate.message(confirmDialog.city?.name || '')
            : AppStrings.Cities.confirmDeactivate.message(confirmDialog.city?.name || '')
        }
        cancelText={AppStrings.Cities.confirmActivate.cancelBtn}
        confirmText={
          confirmDialog.action === 'activate'
            ? AppStrings.Cities.confirmActivate.confirmBtn
            : AppStrings.Cities.confirmDeactivate.confirmBtn
        }
        onClose={() => setConfirmDialog({ isOpen: false, city: null, action: null })}
        onConfirm={confirmToggleStatus}
        variant={confirmDialog.action === 'deactivate' ? 'danger' : 'success'}
      />
    </div>
  );
}
