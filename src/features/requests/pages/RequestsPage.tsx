import React, { useState, useEffect } from 'react';
import { Search, Plus, RefreshCw, ChevronDown } from 'lucide-react';
import { adminRepo } from '@/lib/adminRepo';
import { useNavigate } from 'react-router-dom';
import { AppStrings } from '@/core/constants/app_strings';
import { useToast } from '@/app/providers/ToastProvider';

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
    notification_audience: 'all'
  });

  const loadRequests = async () => {
    setLoading(true);
    const res = await adminRepo.getRequests({ search, categoryId: categoryFilter, status: statusFilter, cityId: cityFilter, page, pageSize: 6 });
    setData(res);
    setLoading(false);
  };

  useEffect(() => {
    adminRepo.getCategories().then(setCategories);
    adminRepo.getCities({ status: 'active', page: 1, pageSize: 100 }).then(res => setCities(res.cities || []));
  }, []);

  useEffect(() => {
    let ignore = false;
    adminRepo.getRequests({ search, categoryId: categoryFilter, status: statusFilter, cityId: cityFilter, page, pageSize: 6 }).then((res) => {
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">{AppStrings.Requests.title}</h1>
          <p className="text-xs text-slate-400 mt-0.5">{AppStrings.Requests.subtitle}</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{AppStrings.Requests.createBtn}</span>
        </button>
      </div>

      {/* FILTERS */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setLoading(true); setSearch(e.target.value); setPage(1); }}
            placeholder={AppStrings.Requests.searchPlaceholder}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="relative">
          <select
            value={categoryFilter}
            onChange={(e) => { setLoading(true); setCategoryFilter(e.target.value); setPage(1); }}
            className="w-full sm:w-auto appearance-none bg-slate-950 border border-slate-800 rounded-xl pl-3 pr-9 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">{AppStrings.Requests.filters.allCategories}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={cityFilter}
            onChange={(e) => { setLoading(true); setCityFilter(e.target.value); setPage(1); }}
            className="w-full sm:w-auto appearance-none bg-slate-950 border border-slate-800 rounded-xl pl-3 pr-9 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">All Cities</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => { setLoading(true); setStatusFilter(e.target.value); setPage(1); }}
            className="w-full sm:w-auto appearance-none bg-slate-950 border border-slate-800 rounded-xl pl-3 pr-9 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">{AppStrings.Requests.filters.allStatuses}</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="full">Full</option>
            <option value="closed">Closed</option>
            <option value="reported">Reported</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" /> {AppStrings.Requests.loading}
          </div>
        ) : data.requests.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">{AppStrings.Requests.noData}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">{AppStrings.Requests.tableHeaders.titleCategory}</th>
                  <th className="px-4 py-3">{AppStrings.Requests.tableHeaders.createdBy}</th>
                  <th className="px-4 py-3">{AppStrings.Requests.tableHeaders.location}</th>
                  <th className="px-4 py-3">{AppStrings.Requests.tableHeaders.peopleNeeded}</th>
                  <th className="px-4 py-3">{AppStrings.Requests.tableHeaders.status}</th>
                  <th className="px-4 py-3 text-right">{AppStrings.Requests.tableHeaders.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data.requests.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <button
                        onClick={() => navigate(`/requests/${r.id}`)}
                        className="font-bold text-slate-200 hover:text-emerald-400 text-left block max-w-xs truncate"
                      >
                        {r.title}
                      </button>
                      <span className="text-[10px] text-emerald-400 font-mono">{r.category_name}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-300 font-medium">{r.creator_name}</td>
                    <td className="px-4 py-3 text-slate-400 text-[11px] max-w-xs truncate">{r.location}</td>
                    <td className="px-4 py-3 text-slate-300 font-mono text-[11px]">{r.required_people} Person(s)</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                          r.status === 'published'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : r.status === 'closed'
                            ? 'bg-slate-800 text-slate-400 border-slate-700'
                            : r.status === 'reported'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => navigate(`/requests/${r.id}`)}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px]"
                      >
                        {AppStrings.Requests.actions.inspect}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE REQUEST MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl text-slate-100 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-lg">{AppStrings.Requests.modal.createTitle}</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-200">✕</button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">{AppStrings.Requests.modal.titleLabel}</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder={AppStrings.Requests.modal.titlePlaceholder}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">{AppStrings.Requests.modal.categoryLabel}</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">{AppStrings.Requests.modal.descLabel}</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={AppStrings.Requests.modal.descPlaceholder}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">{AppStrings.Requests.modal.locationLabel}</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder={AppStrings.Requests.modal.locationPlaceholder}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">{AppStrings.Requests.modal.dateLabel}</label>
                  <input
                    type="datetime-local"
                    value={formData.event_date_time}
                    onChange={(e) => setFormData({ ...formData, event_date_time: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">{AppStrings.Requests.modal.peopleLabel}</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.required_people}
                    onChange={(e) => setFormData({ ...formData, required_people: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">{AppStrings.Requests.modal.costLabel}</label>
                  <input
                    type="number"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">{AppStrings.Requests.modal.currencyLabel}</label>
                  <input
                    type="text"
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  {AppStrings.Common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                >
                  {AppStrings.Requests.modal.publishBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
