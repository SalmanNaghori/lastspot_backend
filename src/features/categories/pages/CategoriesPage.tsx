import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { adminRepo } from '@/lib/adminRepo';
import { AppStrings } from '@/core/constants/app_strings';

export function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '🎯',
    display_order: 1,
    is_active: true,
  });

  const loadCats = () => {
    setLoading(true);
    adminRepo.getCategories().then((res) => {
      setCategories(res);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadCats();
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    setFormData((prev) => ({
      ...prev,
      name,
      slug: editingCategory ? prev.slug : slug,
    }));
  };

  const openModal = (category: any = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData(category);
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        icon: '🎯',
        display_order: categories.length + 1,
        is_active: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    
    await adminRepo.saveCategory({
      ...formData,
      id: editingCategory?.id,
      display_order: parseInt(formData.display_order as any)
    });
    
    setIsModalOpen(false);
    loadCats();
  };

  const handleToggleActive = async (category: any) => {
    await adminRepo.toggleCategoryActive(category.id);
    loadCats();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(AppStrings.Categories.confirmDelete)) {
      await adminRepo.deleteCategory(id);
      loadCats();
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">{AppStrings.Categories.title}</h1>
          <p className="text-xs text-slate-400 mt-0.5">{AppStrings.Categories.subtitle}</p>
        </div>
        <button
          onClick={() => openModal()}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{AppStrings.Categories.addCategory}</span>
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col hide-scrollbar">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-950/50 border-b border-slate-800 text-[11px] uppercase text-slate-400 font-semibold tracking-wider">
              <tr>
                <th className="py-4 px-6 whitespace-nowrap">{AppStrings.Categories.tableHeaders.order}</th>
                <th className="py-4 px-6 whitespace-nowrap">{AppStrings.Categories.tableHeaders.iconName}</th>
                <th className="py-4 px-6 whitespace-nowrap">{AppStrings.Categories.tableHeaders.slug}</th>
                <th className="py-4 px-6 whitespace-nowrap">{AppStrings.Categories.tableHeaders.description}</th>
                <th className="py-4 px-6 whitespace-nowrap">{AppStrings.Categories.tableHeaders.status}</th>
                <th className="py-4 px-6 whitespace-nowrap text-right">{AppStrings.Categories.tableHeaders.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500">{AppStrings.Categories.loading}</td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500">{AppStrings.Categories.noData}</td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-4 px-6 font-mono text-slate-500">#{cat.display_order}</td>
                    <td className="py-4 px-6 flex items-center gap-3">
                      <span className="text-xl bg-slate-950 p-2 rounded-lg border border-slate-800 flex items-center justify-center w-10 h-10">{cat.icon}</span>
                      <span className="font-semibold text-slate-200">{cat.name}</span>
                    </td>
                    <td className="py-4 px-6 text-slate-400 font-mono text-xs">{cat.slug}</td>
                    <td className="py-4 px-6 text-slate-400 truncate max-w-xs">{cat.description || '—'}</td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleToggleActive(cat)}
                        className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full ${
                          cat.is_active
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                        }`}
                      >
                        {cat.is_active ? AppStrings.Categories.status.active : AppStrings.Categories.status.disabled}
                      </button>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => openModal(cat)}
                          className="text-indigo-400 hover:text-indigo-300 font-medium text-xs flex items-center gap-1 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> {AppStrings.Categories.actions.edit}
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="text-rose-500 hover:text-rose-400 font-medium text-xs flex items-center gap-1 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> {AppStrings.Categories.actions.delete}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <h2 className="text-lg font-bold">
                {editingCategory ? AppStrings.Categories.modal.editTitle : AppStrings.Categories.modal.createTitle}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200">✕</button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">{AppStrings.Categories.modal.nameLabel}</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleNameChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder={AppStrings.Categories.modal.namePlaceholder}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">{AppStrings.Categories.modal.slugLabel}</label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 font-mono focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder={AppStrings.Categories.modal.slugPlaceholder}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">{AppStrings.Categories.modal.iconLabel}</label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 text-center focus:outline-none focus:border-indigo-500 transition-colors"
                    placeholder={AppStrings.Categories.modal.iconPlaceholder}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">{AppStrings.Categories.modal.orderLabel}</label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value as any) || 1 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">{AppStrings.Categories.modal.descLabel}</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder={AppStrings.Categories.modal.descPlaceholder}
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded text-emerald-600 bg-slate-950 border-slate-800 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-slate-300 cursor-pointer">{AppStrings.Categories.modal.isActiveLabel}</label>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-sm text-slate-300 hover:bg-slate-800 rounded-xl transition-colors font-medium"
                >
                  {AppStrings.Categories.modal.cancelBtn}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 font-semibold shadow-lg transition-colors"
                >
                  {editingCategory ? AppStrings.Categories.modal.updateBtn : AppStrings.Categories.modal.createBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
