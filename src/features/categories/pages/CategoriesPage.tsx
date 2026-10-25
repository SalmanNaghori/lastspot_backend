import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Tag } from 'lucide-react';
import { adminRepo } from '@/lib/adminRepo';
import { AppStrings } from '@/core/constants/app_strings';
import { useToast } from '@/app/providers/ToastProvider';
import { 
  AdminPageHeader, AdminModal, AdminFormField, 
  AdminLoadingSkeleton, AdminEmptyState, AdminStatusBadge 
} from '@/components/brand';

export function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const { showToast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '🎯',
    display_order: 1,
    is_active: true,
  });

  const loadCats = async () => {
    setLoading(true);
    const res = await adminRepo.getCategories();
    setCategories(res);
    setLoading(false);
  };

  useEffect(() => {
    let ignore = false;
    adminRepo.getCategories().then((res) => {
      if (!ignore) {
        setCategories(res);
        setLoading(false);
      }
    });
    return () => {
      ignore = true;
    };
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
        icon: '🏏',
        display_order: categories.length + 1,
        is_active: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      showToast('Category name is required', 'error');
      return;
    }
    
    await adminRepo.saveCategory({
      ...formData,
      id: editingCategory?.id,
      display_order: parseInt(formData.display_order as any, 10),
    });
    
    showToast('Category saved successfully!', 'success');
    setIsModalOpen(false);
    loadCats();
  };

  const handleToggleActive = async (category: any) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === category.id ? { ...c, is_active: !c.is_active } : c))
    );
    
    await adminRepo.toggleCategoryActive(category.id);
    showToast('Category status updated', 'info');
    
    adminRepo.getCategories().then((res) => {
      setCategories(res);
    });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(AppStrings.Categories.confirmDelete)) {
      await adminRepo.deleteCategory(id);
      showToast('Category removed.', 'info');
      loadCats();
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <AdminPageHeader
        title={AppStrings.Categories.title}
        subtitle={AppStrings.Categories.subtitle}
        actions={
          <button
            onClick={() => openModal()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#F46A35] hover:bg-[#DC5425] shadow-md shadow-[#F46A35]/20 transition-all hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>{AppStrings.Categories.addCategory}</span>
          </button>
        }
      />

      {loading ? (
        <AdminLoadingSkeleton variant="cards" />
      ) : categories.length === 0 ? (
        <AdminEmptyState
          type="empty_activities"
          title={AppStrings.Categories.noData}
          description="Create your first sports category to allow mobile app users to organize activities."
          action={{
            label: AppStrings.Categories.addCategory,
            onClick: () => openModal(),
            icon: Plus,
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-[var(--kb-surface)] border border-[var(--kb-border)] rounded-3xl p-6 flex flex-col justify-between hover:border-[#F46A35]/40 hover:shadow-lg hover:shadow-[#F46A35]/5 transition-all"
            >
              <div>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-3.5">
                    <span className="w-12 h-12 rounded-2xl bg-[#F46A35]/10 border border-[#F46A35]/20 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                      {cat.icon || '🏏'}
                    </span>
                    <div>
                      <h3 className="text-base font-black text-[var(--kb-text)] leading-tight">
                        {cat.name}
                      </h3>
                      <p className="text-[#F46A35] font-mono text-xs font-semibold mt-0.5">
                        /{cat.slug}
                      </p>
                    </div>
                  </div>

                  {/* Switch */}
                  <button 
                    onClick={() => handleToggleActive(cat)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      cat.is_active ? 'bg-[#F46A35]' : 'bg-[var(--kb-border)]'
                    }`}
                    title={cat.is_active ? 'Active category' : 'Disabled category'}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        cat.is_active ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                
                <p className="text-[var(--kb-muted)] text-xs sm:text-sm mt-4 line-clamp-2 leading-relaxed">
                  {cat.description || 'No description provided for this sport category.'}
                </p>
              </div>

              <div className="pt-5 mt-5 border-t border-[var(--kb-border)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-[var(--kb-surface-subtle)] border border-[var(--kb-border)] text-[var(--kb-muted)]">
                    Order #{cat.display_order}
                  </span>
                  <AdminStatusBadge status={cat.is_active ? 'active' : 'disabled'} size="sm" />
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => openModal(cat)} 
                    className="p-1.5 rounded-xl text-[var(--kb-muted)] hover:text-[#F46A35] hover:bg-[#F46A35]/10 transition-colors"
                    title={AppStrings.Categories.actions.edit}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(cat.id)} 
                    className="p-1.5 rounded-xl text-[var(--kb-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                    title={AppStrings.Categories.actions.delete}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Branded Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? AppStrings.Categories.modal.editTitle : AppStrings.Categories.modal.createTitle}
        subtitle="Configure the sport name, icon, and display order for mobile feeds."
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <AdminFormField label={AppStrings.Categories.modal.nameLabel} required>
            <input
              type="text"
              required
              value={formData.name}
              onChange={handleNameChange}
              className="w-full bg-[var(--kb-surface-subtle)] border border-[var(--kb-border)] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[var(--kb-text)] focus:outline-none focus:border-[#F46A35] font-semibold"
              placeholder={AppStrings.Categories.modal.namePlaceholder}
            />
          </AdminFormField>

          <AdminFormField label={AppStrings.Categories.modal.slugLabel} required>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full bg-[var(--kb-surface-subtle)] border border-[var(--kb-border)] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[var(--kb-text)] font-mono focus:outline-none focus:border-[#F46A35]"
              placeholder={AppStrings.Categories.modal.slugPlaceholder}
            />
          </AdminFormField>

          <div className="grid grid-cols-2 gap-4">
            <AdminFormField label={AppStrings.Categories.modal.iconLabel}>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full bg-[var(--kb-surface-subtle)] border border-[var(--kb-border)] rounded-xl px-4 py-2.5 text-center text-lg text-[var(--kb-text)] focus:outline-none focus:border-[#F46A35]"
                placeholder={AppStrings.Categories.modal.iconPlaceholder}
              />
            </AdminFormField>

            <AdminFormField label={AppStrings.Categories.modal.orderLabel}>
              <input
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value as any, 10) || 1 })}
                className="w-full bg-[var(--kb-surface-subtle)] border border-[var(--kb-border)] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[var(--kb-text)] focus:outline-none focus:border-[#F46A35] font-mono font-semibold"
              />
            </AdminFormField>
          </div>

          <AdminFormField label={AppStrings.Categories.modal.descLabel}>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-[var(--kb-surface-subtle)] border border-[var(--kb-border)] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[var(--kb-text)] focus:outline-none focus:border-[#F46A35]"
              placeholder={AppStrings.Categories.modal.descPlaceholder}
            />
          </AdminFormField>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="rounded text-[#F46A35] accent-[#F46A35] w-4 h-4 cursor-pointer"
            />
            <label htmlFor="is_active" className="text-xs sm:text-sm font-bold text-[var(--kb-text)] cursor-pointer select-none">
              {AppStrings.Categories.modal.isActiveLabel}
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-5 border-t border-[var(--kb-border)]">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 text-xs sm:text-sm text-[var(--kb-muted)] hover:bg-[var(--kb-surface-subtle)] rounded-xl transition-colors font-semibold"
            >
              {AppStrings.Categories.modal.cancelBtn}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs sm:text-sm bg-[#F46A35] hover:bg-[#DC5425] text-white rounded-xl font-bold shadow-md shadow-[#F46A35]/20 transition-all hover:-translate-y-0.5"
            >
              {editingCategory ? AppStrings.Categories.modal.updateBtn : AppStrings.Categories.modal.createBtn}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
