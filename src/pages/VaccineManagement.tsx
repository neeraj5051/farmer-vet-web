import {
    Loader2,
    PenLine,
    Plus,
    RefreshCw,
    Search,
    Shield,
    Trash2,
    Eye,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { Vaccine } from '../services/vaccineService';
import {
    createVaccine,
    deleteVaccine,
    getVaccines,
    updateVaccine,
} from '../services/vaccineService';
import './AdminPages.css';
import './VaccineManagement.css';

const CATEGORIES = ['Bacterial', 'Viral', 'Parasitic', 'Fungal', 'Mixed', 'Other'];
const ANIMALS = ['Cow', 'Buffalo', 'Goat', 'Sheep', 'Pig', 'Dog', 'Horse', 'Poultry', 'All'];

const emptyForm = (): Partial<Vaccine> => ({
    name: '',
    name_hi: '',
    description: '',
    description_hi: '',
    pathogen_name: '',
    category: '',
    age_of_first_vaccination: '',
    dosage_schedule: '',
    seasonal_timing: '',
    target_animals: '',
    key_notes: '',
    key_notes_hi: '',
    image_url: '',
    price: 0,
    is_active: true,
});

type ModalMode = 'view' | 'edit' | 'add' | null;

const VaccineManagement = () => {
    const [vaccines, setVaccines] = useState<Vaccine[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    const [modalMode, setModalMode] = useState<ModalMode>(null);
    const [selectedVaccine, setSelectedVaccine] = useState<Vaccine | null>(null);
    const [form, setForm] = useState<Partial<Vaccine>>(emptyForm());
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const fetchData = async () => {
        try {
            const data = await getVaccines();
            setVaccines(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error fetching vaccines:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleRefresh = () => { setRefreshing(true); fetchData(); };

    // ── Open modals ────────────────────────────────────────────────────────────
    const openAdd = () => {
        setForm(emptyForm());
        setFormErrors({});
        setSelectedVaccine(null);
        setModalMode('add');
    };

    const openView = (v: Vaccine) => {
        setSelectedVaccine(v);
        setModalMode('view');
    };

    const openEdit = (v: Vaccine) => {
        setSelectedVaccine(v);
        setForm({ ...v });
        setFormErrors({});
        setModalMode('edit');
    };

    const closeModal = () => {
        setModalMode(null);
        setSelectedVaccine(null);
        setForm(emptyForm());
        setFormErrors({});
    };

    // ── Validate ───────────────────────────────────────────────────────────────
    const validate = (): boolean => {
        const errs: Record<string, string> = {};
        if (!form.name?.trim()) errs.name = 'Name is required';
        if (form.price !== undefined && form.price < 0) errs.price = 'Price must be ≥ 0';
        setFormErrors(errs);
        return Object.keys(errs).length === 0;
    };

    // ── Save ───────────────────────────────────────────────────────────────────
    const handleSave = async () => {
        if (!validate()) return;
        setSaving(true);
        try {
            if (modalMode === 'add') {
                await createVaccine(form);
            } else if (modalMode === 'edit' && selectedVaccine) {
                await updateVaccine(selectedVaccine.id, form);
            }
            closeModal();
            fetchData();
        } catch (err: any) {
            alert(err?.response?.data?.detail || 'Failed to save vaccine');
        } finally {
            setSaving(false);
        }
    };

    // ── Delete ─────────────────────────────────────────────────────────────────
    const handleDelete = async (v: Vaccine) => {
        if (!window.confirm(`Delete vaccine "${v.name}"? This cannot be undone.`)) return;
        try {
            await deleteVaccine(v.id);
            fetchData();
        } catch (err: any) {
            alert(err?.response?.data?.detail || 'Failed to delete vaccine');
        }
    };

    // ── Toggle active ──────────────────────────────────────────────────────────
    const handleToggleActive = async (v: Vaccine) => {
        try {
            await updateVaccine(v.id, { is_active: !v.is_active });
            setVaccines(prev => prev.map(x => x.id === v.id ? { ...x, is_active: !x.is_active } : x));
        } catch {
            alert('Failed to update vaccine status');
        }
    };

    // ── Form helpers ───────────────────────────────────────────────────────────
    const setField = (key: keyof Vaccine, value: any) => {
        setForm(f => ({ ...f, [key]: value }));
        if (formErrors[key]) setFormErrors(e => { const n = { ...e }; delete n[key]; return n; });
    };

    // ── Filter ─────────────────────────────────────────────────────────────────
    const filtered = useMemo(() => {
        let result = [...vaccines];
        if (statusFilter === 'active') result = result.filter(v => v.is_active);
        if (statusFilter === 'inactive') result = result.filter(v => !v.is_active);
        if (categoryFilter !== 'all') result = result.filter(v => v.category === categoryFilter);
        if (searchTerm.trim()) {
            const q = searchTerm.toLowerCase();
            result = result.filter(v =>
                v.name.toLowerCase().includes(q) ||
                (v.name_hi || '').includes(q) ||
                (v.target_animals || '').toLowerCase().includes(q) ||
                (v.category || '').toLowerCase().includes(q)
            );
        }
        return result;
    }, [vaccines, statusFilter, categoryFilter, searchTerm]);

    const stats = useMemo(() => ({
        total: vaccines.length,
        active: vaccines.filter(v => v.is_active).length,
        categories: [...new Set(vaccines.map(v => v.category).filter(Boolean))].length,
    }), [vaccines]);

    if (loading) return (
        <div className="ap-loading">
            <Loader2 className="ap-spin" size={36} color="#16a34a" />
            <p>Loading vaccines...</p>
        </div>
    );

    return (
        <div className="ap-page">
            {/* Header */}
            <div className="ap-header">
                <div>
                    <h1 className="ap-title">Vaccine Management</h1>
                    <p className="ap-subtitle">{filtered.length} of {vaccines.length} vaccines</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="ap-refresh-btn" onClick={handleRefresh} disabled={refreshing}>
                        <RefreshCw size={16} className={refreshing ? 'ap-spin' : ''} />
                        Refresh
                    </button>
                    <button className="ap-add-btn" onClick={openAdd}>
                        <Plus size={16} />
                        Add Vaccine
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="ap-stats-grid">
                <div className="ap-stat-card">
                    <div className="ap-stat-icon" style={{ background: '#d1fae5' }}><Shield size={20} color="#059669" /></div>
                    <div><div className="ap-stat-value">{stats.total}</div><div className="ap-stat-label">Total Vaccines</div></div>
                </div>
                <div className="ap-stat-card">
                    <div className="ap-stat-icon" style={{ background: '#dbeafe' }}><span style={{ fontSize: 18 }}>✅</span></div>
                    <div><div className="ap-stat-value">{stats.active}</div><div className="ap-stat-label">Active</div></div>
                </div>
                <div className="ap-stat-card">
                    <div className="ap-stat-icon" style={{ background: '#ede9fe' }}><span style={{ fontSize: 18 }}>🏷️</span></div>
                    <div><div className="ap-stat-value">{stats.categories}</div><div className="ap-stat-label">Categories</div></div>
                </div>
            </div>

            {/* Filters */}
            <div className="ap-filters-bar">
                <div className="ap-search-wrap">
                    <Search size={16} color="#9ca3af" />
                    <input
                        type="text"
                        placeholder="Search by name, animal, category..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="ap-search-input"
                    />
                </div>
                <div className="ap-filter-group">
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="ap-select">
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                    <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="ap-select">
                        <option value="all">All Categories</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>

            {/* Grid of Vaccine Cards */}
            {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#9ca3af' }}>
                    <Shield size={56} color="#e5e7eb" style={{ marginBottom: '1rem' }} />
                    <p style={{ fontSize: '1rem', marginBottom: '1rem' }}>No vaccines found</p>
                    <button className="ap-add-btn" onClick={openAdd} style={{ margin: '0 auto' }}>
                        <Plus size={16} /> Add First Vaccine
                    </button>
                </div>
            ) : (
                <div className="vm-grid">
                    {filtered.map(v => (
                        <div key={v.id} className={`vm-card ${!v.is_active ? 'vm-card--inactive' : ''}`}>
                            {/* Card header */}
                            <div className="vm-card-header">
                                <div className="vm-card-icon">💉</div>
                                <div className="vm-card-title-block">
                                    <h3 className="vm-card-name">{v.name}</h3>
                                    {v.name_hi && <p className="vm-card-name-hi">{v.name_hi}</p>}
                                </div>
                                <div className="vm-card-status">
                                    <label className="ap-switch" title={v.is_active ? 'Deactivate' : 'Activate'}>
                                        <input type="checkbox" checked={v.is_active} onChange={() => handleToggleActive(v)} />
                                        <span className="ap-switch-slider" />
                                    </label>
                                </div>
                            </div>

                            {/* Meta pills */}
                            <div className="vm-pills">
                                {v.category && (
                                    <span className="vm-pill vm-pill--cat">{v.category}</span>
                                )}
                                {v.target_animals && (
                                    <span className="vm-pill vm-pill--animal">🐄 {v.target_animals}</span>
                                )}
                                {v.price > 0 && (
                                    <span className="vm-pill vm-pill--price">₹{v.price}</span>
                                )}
                            </div>

                            {/* Quick info */}
                            {v.dosage_schedule && (
                                <p className="vm-card-meta"><strong>Dosage:</strong> {v.dosage_schedule}</p>
                            )}
                            {v.seasonal_timing && (
                                <p className="vm-card-meta"><strong>Season:</strong> {v.seasonal_timing}</p>
                            )}
                            {v.description && (
                                <p className="vm-card-desc">{v.description}</p>
                            )}

                            {/* Actions */}
                            <div className="vm-card-actions">
                                <button className="ap-btn-sm ap-btn-info vm-action-btn" onClick={() => openView(v)}>
                                    <Eye size={13} /> View
                                </button>
                                <button className="ap-btn-sm ap-btn-primary vm-action-btn" onClick={() => openEdit(v)}>
                                    <PenLine size={13} /> Edit
                                </button>
                                <button className="ap-btn-sm ap-btn-danger vm-action-btn" onClick={() => handleDelete(v)}>
                                    <Trash2 size={13} /> Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── View Modal ────────────────────────────────────────────────────── */}
            {modalMode === 'view' && selectedVaccine && (
                <div className="ap-modal-backdrop" onClick={closeModal}>
                    <div className="ap-modal vm-modal" onClick={e => e.stopPropagation()}>
                        <div className="ap-modal-header">
                            <div>
                                <h2>💉 {selectedVaccine.name}</h2>
                                {selectedVaccine.name_hi && <p style={{ margin: 0, fontSize: '0.85rem', color: '#9ca3af' }}>{selectedVaccine.name_hi}</p>}
                            </div>
                            <button className="ap-modal-close" onClick={closeModal}><X size={16} /></button>
                        </div>
                        <div className="ap-modal-body">
                            {/* Status & pills */}
                            <div className="ap-detail-badge-row" style={{ marginBottom: '1rem' }}>
                                <span className="ap-badge" style={{ background: selectedVaccine.is_active ? '#d1fae5' : '#fee2e2', color: selectedVaccine.is_active ? '#065f46' : '#991b1b' }}>
                                    {selectedVaccine.is_active ? 'Active' : 'Inactive'}
                                </span>
                                {selectedVaccine.category && <span className="vm-pill vm-pill--cat">{selectedVaccine.category}</span>}
                                {selectedVaccine.price > 0 && <span className="vm-pill vm-pill--price">₹{selectedVaccine.price}</span>}
                            </div>

                            <div className="vm-view-sections">
                                {/* Basic */}
                                <div className="vm-section">
                                    <div className="vm-section-title">Basic Information</div>
                                    <div className="ap-detail-grid">
                                        {selectedVaccine.pathogen_name && <div className="ap-detail-row"><span>Pathogen</span><strong>{selectedVaccine.pathogen_name}</strong></div>}
                                        {selectedVaccine.target_animals && <div className="ap-detail-row"><span>Target Animals</span><strong>{selectedVaccine.target_animals}</strong></div>}
                                        {selectedVaccine.price !== undefined && <div className="ap-detail-row"><span>Price</span><strong style={{ color: '#059669' }}>₹{selectedVaccine.price}</strong></div>}
                                    </div>
                                </div>

                                {/* Schedule */}
                                <div className="vm-section">
                                    <div className="vm-section-title">Schedule & Dosage</div>
                                    <div className="ap-detail-grid">
                                        {selectedVaccine.age_of_first_vaccination && <div className="ap-detail-row"><span>First Vaccination</span><strong>{selectedVaccine.age_of_first_vaccination}</strong></div>}
                                        {selectedVaccine.dosage_schedule && <div className="ap-detail-row"><span>Dosage Schedule</span><strong>{selectedVaccine.dosage_schedule}</strong></div>}
                                        {selectedVaccine.seasonal_timing && <div className="ap-detail-row"><span>Seasonal Timing</span><strong>{selectedVaccine.seasonal_timing}</strong></div>}
                                    </div>
                                </div>

                                {/* Description */}
                                {(selectedVaccine.description || selectedVaccine.description_hi) && (
                                    <div className="vm-section">
                                        <div className="vm-section-title">Description</div>
                                        {selectedVaccine.description && <p className="vm-text-block">{selectedVaccine.description}</p>}
                                        {selectedVaccine.description_hi && <p className="vm-text-block vm-text-hi">{selectedVaccine.description_hi}</p>}
                                    </div>
                                )}

                                {/* Key notes */}
                                {(selectedVaccine.key_notes || selectedVaccine.key_notes_hi) && (
                                    <div className="vm-section">
                                        <div className="vm-section-title">Key Notes</div>
                                        {selectedVaccine.key_notes && <p className="vm-text-block">{selectedVaccine.key_notes}</p>}
                                        {selectedVaccine.key_notes_hi && <p className="vm-text-block vm-text-hi">{selectedVaccine.key_notes_hi}</p>}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="ap-modal-footer">
                            <button className="ap-btn-sm ap-btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }} onClick={() => openEdit(selectedVaccine)}>
                                <PenLine size={14} /> Edit Vaccine
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Add / Edit Modal ──────────────────────────────────────────────── */}
            {(modalMode === 'add' || modalMode === 'edit') && (
                <div className="ap-modal-backdrop" onClick={closeModal}>
                    <div className="ap-modal vm-modal" onClick={e => e.stopPropagation()}>
                        <div className="ap-modal-header">
                            <h2>{modalMode === 'add' ? '➕ Add New Vaccine' : `✏️ Edit: ${selectedVaccine?.name}`}</h2>
                            <button className="ap-modal-close" onClick={closeModal}><X size={16} /></button>
                        </div>
                        <div className="ap-modal-body">
                            <div className="vm-form-grid">
                                {/* Basic Info */}
                                <div className="vm-form-section">
                                    <div className="vm-section-title">Basic Information</div>

                                    <div className="vm-form-row">
                                        <div className="ap-form-group">
                                            <label className="ap-label">Name (English) *</label>
                                            <input className={`ap-input ${formErrors.name ? 'ap-input--error' : ''}`} value={form.name || ''} onChange={e => setField('name', e.target.value)} placeholder="e.g. FMD Vaccine" />
                                            {formErrors.name && <span className="vm-error">{formErrors.name}</span>}
                                        </div>
                                        <div className="ap-form-group">
                                            <label className="ap-label">Name (Hindi)</label>
                                            <input className="ap-input" value={form.name_hi || ''} onChange={e => setField('name_hi', e.target.value)} placeholder="हिंदी में नाम" />
                                        </div>
                                    </div>

                                    <div className="vm-form-row">
                                        <div className="ap-form-group">
                                            <label className="ap-label">Category</label>
                                            <select className="ap-form-select" value={form.category || ''} onChange={e => setField('category', e.target.value)}>
                                                <option value="">Select category...</option>
                                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <div className="ap-form-group">
                                            <label className="ap-label">Target Animals</label>
                                            <input className="ap-input" value={form.target_animals || ''} onChange={e => setField('target_animals', e.target.value)} placeholder="e.g. Cow, Buffalo" list="animals-list" />
                                            <datalist id="animals-list">{ANIMALS.map(a => <option key={a} value={a} />)}</datalist>
                                        </div>
                                    </div>

                                    <div className="vm-form-row">
                                        <div className="ap-form-group">
                                            <label className="ap-label">Pathogen Name</label>
                                            <input className="ap-input" value={form.pathogen_name || ''} onChange={e => setField('pathogen_name', e.target.value)} placeholder="e.g. FMDV Type O" />
                                        </div>
                                        <div className="ap-form-group">
                                            <label className="ap-label">Price (₹)</label>
                                            <input className={`ap-input ${formErrors.price ? 'ap-input--error' : ''}`} type="number" min={0} step={0.01} value={form.price ?? 0} onChange={e => setField('price', parseFloat(e.target.value) || 0)} placeholder="0.00" />
                                            {formErrors.price && <span className="vm-error">{formErrors.price}</span>}
                                        </div>
                                    </div>
                                </div>

                                {/* Schedule */}
                                <div className="vm-form-section">
                                    <div className="vm-section-title">Schedule & Dosage</div>

                                    <div className="ap-form-group">
                                        <label className="ap-label">Age of First Vaccination</label>
                                        <input className="ap-input" value={form.age_of_first_vaccination || ''} onChange={e => setField('age_of_first_vaccination', e.target.value)} placeholder="e.g. 4 months" />
                                    </div>
                                    <div className="ap-form-group">
                                        <label className="ap-label">Dosage Schedule</label>
                                        <input className="ap-input" value={form.dosage_schedule || ''} onChange={e => setField('dosage_schedule', e.target.value)} placeholder="e.g. 2 doses, 21 days apart" />
                                    </div>
                                    <div className="ap-form-group">
                                        <label className="ap-label">Seasonal Timing</label>
                                        <input className="ap-input" value={form.seasonal_timing || ''} onChange={e => setField('seasonal_timing', e.target.value)} placeholder="e.g. Before monsoon (June–July)" />
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="vm-form-section">
                                    <div className="vm-section-title">Description</div>
                                    <div className="ap-form-group">
                                        <label className="ap-label">Description (English)</label>
                                        <textarea className="ap-textarea" value={form.description || ''} onChange={e => setField('description', e.target.value)} placeholder="Brief description of this vaccine..." rows={3} />
                                    </div>
                                    <div className="ap-form-group">
                                        <label className="ap-label">Description (Hindi)</label>
                                        <textarea className="ap-textarea" value={form.description_hi || ''} onChange={e => setField('description_hi', e.target.value)} placeholder="हिंदी में विवरण..." rows={3} />
                                    </div>
                                </div>

                                {/* Key Notes */}
                                <div className="vm-form-section">
                                    <div className="vm-section-title">Key Notes</div>
                                    <div className="ap-form-group">
                                        <label className="ap-label">Key Notes (English)</label>
                                        <textarea className="ap-textarea" value={form.key_notes || ''} onChange={e => setField('key_notes', e.target.value)} placeholder="Important notes for vets or farmers..." rows={3} />
                                    </div>
                                    <div className="ap-form-group">
                                        <label className="ap-label">Key Notes (Hindi)</label>
                                        <textarea className="ap-textarea" value={form.key_notes_hi || ''} onChange={e => setField('key_notes_hi', e.target.value)} placeholder="हिंदी में महत्वपूर्ण टिप्पणी..." rows={3} />
                                    </div>
                                    <div className="ap-form-group">
                                        <label className="ap-label">Image URL</label>
                                        <input className="ap-input" value={form.image_url || ''} onChange={e => setField('image_url', e.target.value)} placeholder="https://..." />
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="ap-switch-row">
                                    <span className="ap-label" style={{ marginBottom: 0 }}>Active (visible to farmers & vets)</span>
                                    <label className="ap-switch">
                                        <input type="checkbox" checked={form.is_active ?? true} onChange={e => setField('is_active', e.target.checked)} />
                                        <span className="ap-switch-slider" />
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="ap-modal-footer">
                            <button className="ap-btn-sm ap-btn-outline" style={{ padding: '0.5rem 1.25rem' }} onClick={closeModal}>Cancel</button>
                            <button
                                className="ap-btn-sm ap-btn-primary"
                                style={{ padding: '0.5rem 1.5rem', fontSize: '0.875rem', opacity: saving ? 0.7 : 1 }}
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving ? 'Saving...' : modalMode === 'add' ? 'Create Vaccine' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VaccineManagement;
