import { ChevronDown, ChevronRight, Layers, Loader2, PenLine, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { ServiceCategory, ServiceVariant } from '../services/servicesService';
import {
    createCategory,
    createVariant,
    deleteCategory,
    deleteVariant,
    getAdminServices,
    updateCategory,
    updateVariant,
} from '../services/servicesService';
import './AdminPages.css';

const ServicesManagement = () => {
    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    // Category modal
    const [showCatModal, setShowCatModal] = useState(false);
    const [editingCat, setEditingCat] = useState<ServiceCategory | null>(null);
    const [catForm, setCatForm] = useState({ name: '', title: '', title_hi: '', description: '', description_hi: '', icon_emoji: '', is_active: true });

    // Variant modal
    const [showVarModal, setShowVarModal] = useState(false);
    const [editingVar, setEditingVar] = useState<ServiceVariant | null>(null);
    const [parentCategoryId, setParentCategoryId] = useState('');
    const [varForm, setVarForm] = useState({ name: '', name_hi: '', description: '', description_hi: '', base_fee_suggestion: '', is_active: true });

    const fetchData = async () => {
        try {
            const data = await getAdminServices();
            setCategories(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error fetching services:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleRefresh = () => { setRefreshing(true); fetchData(); };

    const toggleExpand = (id: string) => {
        setExpandedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    // ── Category CRUD ──────────────────────────────────────────────────────────
    const openAddCategory = () => {
        setEditingCat(null);
        setCatForm({ name: '', title: '', title_hi: '', description: '', description_hi: '', icon_emoji: '', is_active: true });
        setShowCatModal(true);
    };

    const openEditCategory = (cat: ServiceCategory) => {
        setEditingCat(cat);
        setCatForm({
            name: cat.name,
            title: cat.title,
            title_hi: cat.title_hi || '',
            description: cat.description || '',
            description_hi: cat.description_hi || '',
            icon_emoji: cat.icon_emoji || '',
            is_active: cat.is_active,
        });
        setShowCatModal(true);
    };

    const handleSaveCategory = async () => {
        if (!catForm.title.trim()) { alert('Title is required'); return; }
        if (!editingCat && !catForm.name.trim()) { alert('Category key is required'); return; }
        setSaving(true);
        try {
            if (editingCat) {
                await updateCategory(editingCat.id, { ...catForm });
            } else {
                await createCategory({ ...catForm, name: catForm.name.toUpperCase().replace(/\s+/g, '_') });
            }
            setShowCatModal(false);
            fetchData();
        } catch (err: any) {
            alert(err?.response?.data?.detail || 'Failed to save category');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteCategory = async (cat: ServiceCategory) => {
        if (!window.confirm(`Delete "${cat.title}" and ALL its variants? This cannot be undone.`)) return;
        try {
            await deleteCategory(cat.id);
            fetchData();
        } catch (err: any) {
            alert(err?.response?.data?.detail || 'Failed to delete category');
        }
    };

    // ── Variant CRUD ───────────────────────────────────────────────────────────
    const openAddVariant = (categoryId: string) => {
        setEditingVar(null);
        setParentCategoryId(categoryId);
        setVarForm({ name: '', name_hi: '', description: '', description_hi: '', base_fee_suggestion: '', is_active: true });
        setShowVarModal(true);
    };

    const openEditVariant = (v: ServiceVariant) => {
        setEditingVar(v);
        setParentCategoryId(v.category_id);
        setVarForm({
            name: v.name,
            name_hi: v.name_hi || '',
            description: v.description || '',
            description_hi: v.description_hi || '',
            base_fee_suggestion: v.base_fee_suggestion != null ? String(v.base_fee_suggestion) : '',
            is_active: v.is_active,
        });
        setShowVarModal(true);
    };

    const handleSaveVariant = async () => {
        if (!varForm.name.trim()) { alert('Variant name is required'); return; }
        setSaving(true);
        try {
            const payload = {
                category_id: parentCategoryId,
                name: varForm.name,
                name_hi: varForm.name_hi || undefined,
                description: varForm.description || undefined,
                description_hi: varForm.description_hi || undefined,
                base_fee_suggestion: varForm.base_fee_suggestion ? parseFloat(varForm.base_fee_suggestion) : undefined,
                is_active: varForm.is_active,
            };
            if (editingVar) {
                await updateVariant(editingVar.id, payload);
            } else {
                await createVariant(payload);
            }
            setShowVarModal(false);
            fetchData();
        } catch (err: any) {
            alert(err?.response?.data?.detail || 'Failed to save variant');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteVariant = async (v: ServiceVariant) => {
        if (!window.confirm(`Delete variant "${v.name}"?`)) return;
        try {
            await deleteVariant(v.id);
            fetchData();
        } catch (err: any) {
            alert(err?.response?.data?.detail || 'Failed to delete variant');
        }
    };

    const handleToggleVariant = async (v: ServiceVariant) => {
        try {
            await updateVariant(v.id, { is_active: !v.is_active });
            fetchData();
        } catch {
            alert('Failed to update variant');
        }
    };

    const filteredCategories = useMemo(() => {
        if (!searchTerm.trim()) return categories;
        const q = searchTerm.toLowerCase();
        return categories.filter(cat =>
            cat.title.toLowerCase().includes(q) ||
            cat.name.toLowerCase().includes(q) ||
            (cat.title_hi || '').includes(q) ||
            cat.variants.some(v => v.name.toLowerCase().includes(q))
        );
    }, [categories, searchTerm]);

    const totalVariants = categories.reduce((sum, c) => sum + c.variants.length, 0);
    const activeCategories = categories.filter(c => c.is_active).length;

    if (loading) return (
        <div className="ap-loading">
            <Loader2 className="ap-spin" size={36} color="#16a34a" />
            <p>Loading services...</p>
        </div>
    );

    return (
        <div className="ap-page">
            <div className="ap-header">
                <div>
                    <h1 className="ap-title">Service Management</h1>
                    <p className="ap-subtitle">{categories.length} categories · {totalVariants} variants</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="ap-refresh-btn" onClick={handleRefresh} disabled={refreshing}>
                        <RefreshCw size={16} className={refreshing ? 'ap-spin' : ''} />
                        Refresh
                    </button>
                    <button className="ap-add-btn" onClick={openAddCategory}>
                        <Plus size={16} />
                        New Category
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="ap-stats-grid">
                <div className="ap-stat-card">
                    <div className="ap-stat-icon" style={{ background: '#dbeafe' }}><Layers size={20} color="#2563eb" /></div>
                    <div><div className="ap-stat-value">{categories.length}</div><div className="ap-stat-label">Categories</div></div>
                </div>
                <div className="ap-stat-card">
                    <div className="ap-stat-icon" style={{ background: '#d1fae5' }}><span style={{ fontSize: 18 }}>✅</span></div>
                    <div><div className="ap-stat-value">{activeCategories}</div><div className="ap-stat-label">Active</div></div>
                </div>
                <div className="ap-stat-card">
                    <div className="ap-stat-icon" style={{ background: '#ede9fe' }}><span style={{ fontSize: 18 }}>🔧</span></div>
                    <div><div className="ap-stat-value">{totalVariants}</div><div className="ap-stat-label">Total Variants</div></div>
                </div>
            </div>

            {/* Search */}
            <div className="ap-filters-bar">
                <div className="ap-search-wrap" style={{ flex: 1 }}>
                    <Search size={16} color="#9ca3af" />
                    <input
                        type="text"
                        placeholder="Search categories or variants..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="ap-search-input"
                    />
                </div>
            </div>

            {/* Category Cards */}
            <div>
                {filteredCategories.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
                        <Layers size={48} color="#d1d5db" style={{ marginBottom: '1rem' }} />
                        <p>No service categories found.</p>
                        <button className="ap-add-btn" onClick={openAddCategory} style={{ margin: '0.5rem auto' }}>
                            <Plus size={16} /> Create First Category
                        </button>
                    </div>
                ) : filteredCategories.map(cat => {
                    const expanded = expandedIds.has(cat.id);
                    const activeVariants = cat.variants.filter(v => v.is_active).length;
                    return (
                        <div key={cat.id} className="ap-expand-card" style={{ borderColor: cat.is_active ? '#86efac' : '#e5e7eb' }}>
                            <div className="ap-expand-header" onClick={() => toggleExpand(cat.id)}>
                                <span style={{ fontSize: '2rem', lineHeight: 1 }}>{cat.icon_emoji || '🔧'}</span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                                        <strong style={{ fontSize: '1rem', color: '#111827' }}>{cat.title}</strong>
                                        {!cat.is_active && (
                                            <span className="ap-badge" style={{ background: '#fee2e2', color: '#991b1b' }}>Inactive</span>
                                        )}
                                    </div>
                                    {cat.title_hi && <div style={{ fontSize: '0.8rem', color: '#9ca3af', fontStyle: 'italic' }}>{cat.title_hi}</div>}
                                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                                        {cat.name} · {cat.variants.length} variants ({activeVariants} active)
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <button className="ap-btn-sm ap-btn-primary" onClick={e => { e.stopPropagation(); openEditCategory(cat); }}>
                                        <PenLine size={14} />
                                    </button>
                                    <button className="ap-btn-sm ap-btn-danger" onClick={e => { e.stopPropagation(); handleDeleteCategory(cat); }}>
                                        <Trash2 size={14} />
                                    </button>
                                    {expanded ? <ChevronDown size={18} color="#9ca3af" /> : <ChevronRight size={18} color="#9ca3af" />}
                                </div>
                            </div>

                            {expanded && (
                                <div className="ap-expand-body">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                        <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280' }}>Variants</span>
                                        <button className="ap-btn-sm ap-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} onClick={() => openAddVariant(cat.id)}>
                                            <Plus size={13} /> Add Variant
                                        </button>
                                    </div>

                                    {cat.variants.length === 0 ? (
                                        <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.875rem', margin: '1rem 0' }}>
                                            No variants yet. Add one above.
                                        </p>
                                    ) : cat.variants.map(v => (
                                        <div key={v.id} className="ap-variant-row">
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flex: 1 }}>
                                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: v.is_active ? '#059669' : '#d1d5db', marginTop: 5, flexShrink: 0 }} />
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#111827' }}>{v.name}</div>
                                                    {v.name_hi && <div style={{ fontSize: '0.78rem', color: '#9ca3af', fontStyle: 'italic' }}>{v.name_hi}</div>}
                                                    {v.base_fee_suggestion != null && (
                                                        <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 600 }}>₹{v.base_fee_suggestion} suggested</div>
                                                    )}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexShrink: 0 }}>
                                                <label className="ap-switch" title={v.is_active ? 'Deactivate' : 'Activate'}>
                                                    <input type="checkbox" checked={v.is_active} onChange={() => handleToggleVariant(v)} />
                                                    <span className="ap-switch-slider" />
                                                </label>
                                                <button className="ap-btn-sm ap-btn-primary" onClick={() => openEditVariant(v)}><PenLine size={13} /></button>
                                                <button className="ap-btn-sm ap-btn-danger" onClick={() => handleDeleteVariant(v)}><Trash2 size={13} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Category Modal */}
            {showCatModal && (
                <div className="ap-modal-backdrop" onClick={() => setShowCatModal(false)}>
                    <div className="ap-modal" onClick={e => e.stopPropagation()}>
                        <div className="ap-modal-header">
                            <h2>{editingCat ? 'Edit Category' : 'New Category'}</h2>
                            <button className="ap-modal-close" onClick={() => setShowCatModal(false)}>✕</button>
                        </div>
                        <div className="ap-modal-body">
                            {!editingCat && (
                                <div className="ap-form-group">
                                    <label className="ap-label">Category Key * (e.g. CONSULTATION)</label>
                                    <input
                                        className="ap-input"
                                        value={catForm.name}
                                        onChange={e => setCatForm(f => ({ ...f, name: e.target.value.toUpperCase().replace(/[^A-Z_]/g, '') }))}
                                        placeholder="CONSULTATION"
                                    />
                                </div>
                            )}
                            <div className="ap-form-group">
                                <label className="ap-label">Title (English) *</label>
                                <input className="ap-input" value={catForm.title} onChange={e => setCatForm(f => ({ ...f, title: e.target.value }))} placeholder="Veterinary Consultation" />
                            </div>
                            <div className="ap-form-group">
                                <label className="ap-label">Title (Hindi)</label>
                                <input className="ap-input" value={catForm.title_hi} onChange={e => setCatForm(f => ({ ...f, title_hi: e.target.value }))} placeholder="पशु परामर्श" />
                            </div>
                            <div className="ap-form-group">
                                <label className="ap-label">Icon Emoji</label>
                                <input className="ap-input" value={catForm.icon_emoji} onChange={e => setCatForm(f => ({ ...f, icon_emoji: e.target.value }))} placeholder="🩺" />
                            </div>
                            <div className="ap-form-group">
                                <label className="ap-label">Description</label>
                                <textarea className="ap-textarea" value={catForm.description} onChange={e => setCatForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe this service category..." />
                            </div>
                            <div className="ap-form-group">
                                <label className="ap-label">Description (Hindi)</label>
                                <textarea className="ap-textarea" value={catForm.description_hi} onChange={e => setCatForm(f => ({ ...f, description_hi: e.target.value }))} placeholder="हिंदी में विवरण..." />
                            </div>
                            <div className="ap-switch-row">
                                <span className="ap-label" style={{ marginBottom: 0 }}>Active</span>
                                <label className="ap-switch">
                                    <input type="checkbox" checked={catForm.is_active} onChange={e => setCatForm(f => ({ ...f, is_active: e.target.checked }))} />
                                    <span className="ap-switch-slider" />
                                </label>
                            </div>
                            <button className="ap-save-btn" onClick={handleSaveCategory} disabled={saving}>
                                {saving ? 'Saving...' : editingCat ? 'Update Category' : 'Create Category'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Variant Modal */}
            {showVarModal && (
                <div className="ap-modal-backdrop" onClick={() => setShowVarModal(false)}>
                    <div className="ap-modal" onClick={e => e.stopPropagation()}>
                        <div className="ap-modal-header">
                            <h2>{editingVar ? 'Edit Variant' : 'New Variant'}</h2>
                            <button className="ap-modal-close" onClick={() => setShowVarModal(false)}>✕</button>
                        </div>
                        <div className="ap-modal-body">
                            <div className="ap-form-group">
                                <label className="ap-label">Variant Name (English) *</label>
                                <input className="ap-input" value={varForm.name} onChange={e => setVarForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Standard Consultation" />
                            </div>
                            <div className="ap-form-group">
                                <label className="ap-label">Variant Name (Hindi)</label>
                                <input className="ap-input" value={varForm.name_hi} onChange={e => setVarForm(f => ({ ...f, name_hi: e.target.value }))} placeholder="मानक परामर्श" />
                            </div>
                            <div className="ap-form-group">
                                <label className="ap-label">Suggested Base Fee (₹)</label>
                                <input className="ap-input" type="number" value={varForm.base_fee_suggestion} onChange={e => setVarForm(f => ({ ...f, base_fee_suggestion: e.target.value }))} placeholder="0.00" />
                            </div>
                            <div className="ap-form-group">
                                <label className="ap-label">Description</label>
                                <textarea className="ap-textarea" value={varForm.description} onChange={e => setVarForm(f => ({ ...f, description: e.target.value }))} placeholder="What does this variant offer?" />
                            </div>
                            <div className="ap-form-group">
                                <label className="ap-label">Description (Hindi)</label>
                                <textarea className="ap-textarea" value={varForm.description_hi} onChange={e => setVarForm(f => ({ ...f, description_hi: e.target.value }))} placeholder="हिंदी में विवरण..." />
                            </div>
                            <div className="ap-switch-row">
                                <span className="ap-label" style={{ marginBottom: 0 }}>Active</span>
                                <label className="ap-switch">
                                    <input type="checkbox" checked={varForm.is_active} onChange={e => setVarForm(f => ({ ...f, is_active: e.target.checked }))} />
                                    <span className="ap-switch-slider" />
                                </label>
                            </div>
                            <button className="ap-save-btn" onClick={handleSaveVariant} disabled={saving}>
                                {saving ? 'Saving...' : editingVar ? 'Update Variant' : 'Create Variant'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ServicesManagement;
