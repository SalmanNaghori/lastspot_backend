import React, { useState, useEffect } from 'react';
import { Search, Plus, RefreshCw } from 'lucide-react';
import { adminRepo } from '@/lib/adminRepo';
import { AppStrings } from '@/core/constants/app_strings';
import { useToast } from '@/app/providers/ToastProvider';
import { AlertDialog } from '@/components/common/AlertDialog';

export function CitiesPage() {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, inactive
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
      adminRepo.getCities({ search, status: statusFilter, page, pageSize: 20 }),
      adminRepo.getCitiesStats()
    ]);
    setData(citiesRes);
    setStats(statsRes);
    setLoading(false);
  };

  useEffect(() => {
    let ignore = false;
    Promise.all([
      adminRepo.getCities({ search, status: statusFilter, page, pageSize: 20 }),
      adminRepo.getCitiesStats()
    ]).then(([citiesRes, statsRes]) => {
      if (!ignore) {
        setData(citiesRes);
        setStats(statsRes);
        setLoading(false);
      }
    });
    return () => { ignore = true; };
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
      action: city.is_active ? 'deactivate' : 'activate'
    });
  };

  const confirmToggleStatus = async () => {
    if (!confirmDialog.city) return;
    
    const city = confirmDialog.city;
    const newStatus = !city.is_active;
    
    // Optimistic UI update
    setData(prev => ({
      ...prev,
      cities: prev.cities.map(c => c.id === city.id ? { ...c, is_active: newStatus } : c)
    }));
    setConfirmDialog({ isOpen: false, city: null, action: null });
    
    await adminRepo.toggleCityStatus(city.id, newStatus);
    showToast(AppStrings.Cities.alerts.statusUpdated, 'info');
    
    loadData(); // Re-fetch to get correct stats
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">{AppStrings.Cities.title}</h1>
          <p className="text-xs text-slate-400 mt-0.5">{AppStrings.Cities.subtitle}</p>
        </div>
        <button
          onClick={() => openModal()}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{AppStrings.Cities.addCity}</span>
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-center">
          <span className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">{AppStrings.Cities.stats.total}</span>
          <span className="text-2xl font-black text-slate-200 mt-1">{stats.total}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-center">
          <span className="text-emerald-500 text-[11px] font-bold uppercase tracking-wider">{AppStrings.Cities.stats.active}</span>
          <span className="text-2xl font-black text-emerald-400 mt-1">{stats.active}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-center">
          <span className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">{AppStrings.Cities.stats.inactive}</span>
          <span className="text-2xl font-black text-slate-400 mt-1">{stats.inactive}</span>
        </div>
      </div>

      {/* FILTERS & SEARCH */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex bg-slate-950 p-1 rounded-xl w-full md:w-auto">
          {['all', 'active', 'inactive'].map((tab) => (
            <button
              key={tab}
              onClick={() => { setLoading(true); setStatusFilter(tab); setPage(1); }}
              className={`flex-1 md:flex-none px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-colors ${
                statusFilter === tab 
                  ? 'bg-slate-800 text-emerald-400 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {AppStrings.Cities.tabs[tab as keyof typeof AppStrings.Cities.tabs]}
            </button>
          ))}
        </div>
        
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setLoading(true); setSearch(e.target.value); setPage(1); }}
            placeholder={AppStrings.Cities.searchPlaceholder}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" /> {AppStrings.Cities.loading}
          </div>
        ) : data.cities.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center">
            <p className="text-slate-500 text-xs mb-4">
              {search ? AppStrings.Cities.noSearchResults : AppStrings.Cities.noData}
            </p>
            {!search && (
              <button
                onClick={() => openModal()}
                className="px-4 py-2 bg-emerald-600/10 text-emerald-500 border border-emerald-600/20 hover:bg-emerald-600/20 rounded-lg text-xs font-semibold transition-colors"
              >
                {AppStrings.Cities.addFirstCity}
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">{AppStrings.Cities.tableHeaders.order}</th>
                  <th className="px-4 py-3">{AppStrings.Cities.tableHeaders.city}</th>
                  <th className="px-4 py-3">{AppStrings.Cities.tableHeaders.state}</th>
                  <th className="px-4 py-3">{AppStrings.Cities.tableHeaders.status}</th>
                  <th className="px-4 py-3">{AppStrings.Cities.tableHeaders.created}</th>
                  <th className="px-4 py-3 text-right">{AppStrings.Cities.tableHeaders.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data.cities.map((city) => (
                  <tr key={city.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">
                      #{city.display_order}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-200">
                      {city.name}
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {city.state || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                        city.is_active 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {city.is_active ? AppStrings.Cities.status.active : AppStrings.Cities.status.inactive}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-mono text-[10px]">
                      {new Date(city.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right space-x-3">
                      <button
                        onClick={() => openModal(city)}
                        className="text-emerald-500 hover:text-emerald-400 font-semibold text-[11px] transition-colors"
                      >
                        {AppStrings.Cities.actions.edit}
                      </button>
                      <button
                        onClick={() => promptToggleStatus(city)}
                        className={`${city.is_active ? 'text-rose-500 hover:text-rose-400' : 'text-emerald-500 hover:text-emerald-400'} font-semibold text-[11px] transition-colors`}
                      >
                        {city.is_active ? AppStrings.Cities.actions.deactivate : AppStrings.Cities.actions.activate}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PAGINATION */}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <button
            onClick={() => { setLoading(true); setPage(p => Math.max(1, p - 1)); }}
            disabled={page === 1}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span>Page {page} of {data.totalPages}</span>
          <button
            onClick={() => { setLoading(true); setPage(p => Math.min(data.totalPages, p + 1)); }}
            disabled={page === data.totalPages}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl text-slate-100 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <h2 className="text-lg font-bold">
                {editingCity ? AppStrings.Cities.modal.editTitle : AppStrings.Cities.modal.createTitle}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200">✕</button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">{AppStrings.Cities.modal.nameLabel}</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={AppStrings.Cities.modal.namePlaceholder}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5">{AppStrings.Cities.modal.stateLabel}</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder={AppStrings.Cities.modal.statePlaceholder}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5">{AppStrings.Cities.modal.orderLabel}</label>
                <input
                  type="number"
                  min="1"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 999 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none ${
                    formData.is_active ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-300 ease-in-out ${
                      formData.is_active ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className="text-sm font-medium text-slate-300">{AppStrings.Cities.modal.isActiveLabel}</span>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {AppStrings.Cities.modal.cancelBtn}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition-colors"
                >
                  {editingCity ? AppStrings.Cities.modal.updateBtn : AppStrings.Cities.modal.createBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
