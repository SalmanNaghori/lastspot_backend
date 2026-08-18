import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ToggleRight, ToggleLeft, RefreshCw } from 'lucide-react';
import { adminRepo } from '@/lib/adminRepo';
import { AppStrings } from '@/core/constants/app_strings';
import { useToast } from '@/app/providers/ToastProvider';

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

  const { showToast } = useToast();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      showToast('Category name is required', 'error');
      return;
    }
    
    await adminRepo.saveCategory({
      ...formData,
      id: editingCategory?.id,
      display_order: parseInt(formData.display_order as any)
    });
    
    showToast('Category saved successfully!', 'success');
    setIsModalOpen(false);
    loadCats();
  };

  const handleToggleActive = async (category: any) => {
    // Optimistic UI update to prevent flickering
    setCategories(prev => prev.map(c => c.id === category.id ? { ...c, is_active: !c.is_active } : c));
    
    await adminRepo.toggleCategoryActive(category.id);
    showToast('Category status updated', 'info');
    
    // Silent reload to ensure data sync without global loading spinner
    adminRepo.getCategories().then((res) => {
      setCategories(res);
    });
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

      {loading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" /> {AppStrings.Categories.loading}
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-xs">
          {AppStrings.Categories.noData}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-[#111827] border border-slate-800/80 rounded-2xl p-6 flex flex-col hover:border-slate-700 transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex gap-4 items-start">
                  <span className="text-2xl leading-none pt-0.5">{cat.icon}</span>
                  <div>
                    <h3 className="text-[15px] font-bold text-slate-100 leading-tight">{cat.name}</h3>
                    <p className="text-emerald-400 font-mono text-[12px] mt-1.5">/{cat.slug}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleToggleActive(cat)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none ${
                    cat.is_active ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-300 ease-in-out ${
                      cat.is_active ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              
              <p className="text-slate-400 text-[13px] mt-5 flex-1 line-clamp-2">
                {cat.description || '—'}
              </p>
              
              <div className="h-px bg-slate-800/60 my-5 w-full" />
              
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-mono text-[12px] tracking-wide">
                  Order: #{cat.display_order}
                </span>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => handleDelete(cat.id)} 
                    className="text-slate-500 hover:text-rose-400 font-semibold text-[13px] transition-colors"
                  >
                    {AppStrings.Categories.actions.delete}
                  </button>
                  <button 
                    onClick={() => openModal(cat)} 
                    className="text-emerald-500 hover:text-emerald-400 font-semibold text-[13px] transition-colors"
                  >
                    {AppStrings.Categories.actions.edit}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
