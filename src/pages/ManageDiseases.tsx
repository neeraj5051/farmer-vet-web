import { Edit2, Plus, Trash2, X, Stethoscope, Search, Globe, CheckCircle, AlertCircle, Info, BookOpen, Layers } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { 
    createDisease, 
    deleteDisease, 
    getDiseases, 
    updateDisease, 
    getDiseaseGroups, 
    createDiseaseGroup, 
    deleteDiseaseGroup, 
    updateDiseaseGroup 
} from '../services/diseaseService';
import type { Disease, DiseaseGroup } from '../services/diseaseService';
import { uploadAdminImage } from '../services/uploadService';
import './AdminPages.css';

const ManageDiseases = () => {
    // Navigation / Listing states
    const [activeTab, setActiveTab] = useState<'diseases' | 'groups'>('diseases');
    const [diseases, setDiseases] = useState<Disease[]>([]);
    const [groups, setGroups] = useState<DiseaseGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [diseaseSearch, setDiseaseSearch] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadingGroupImage, setUploadingGroupImage] = useState(false);

    // Modals visibility
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [viewingDisease, setViewingDisease] = useState<Disease | null>(null);

    // Editing targets
    const [editingDisease, setEditingDisease] = useState<Disease | null>(null);
    const [editingGroup, setEditingGroup] = useState<DiseaseGroup | null>(null);

    // Modal internal tabs (Bilingual toggling)
    const [modalTab, setModalTab] = useState<'en' | 'hi'>('en');
    const [groupModalTab, setGroupModalTab] = useState<'en' | 'hi'>('en');
    const [detailLang, setDetailLang] = useState<'en' | 'hi'>('en');

    // Forms Form States
    const [formData, setFormData] = useState({
        name: '',
        name_hi: '',
        category: 'Viral',
        description: '',
        description_hi: '',
        body_system: 'Respiratory',
        disease_type: 'Infectious',
        species: 'Cattle',
        symptoms: '', 
        symptoms_hi: '',
        causes: '',
        causes_hi: '',
        treatments: '',
        treatments_hi: '',
        pathogen_type: 'Virus',
        pathogen_name: '',
        severity_level: 1,
        image_path: '',
        group_id: ''
    });

    const [groupFormData, setGroupFormData] = useState({
        name: '',
        name_hi: '',
        description: '',
        description_hi: '',
        icon_emoji: '',
        image_path: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [diseasesData, groupsData] = await Promise.all([
                getDiseases(),
                getDiseaseGroups()
            ]);
            setDiseases(diseasesData || []);
            setGroups(groupsData || []);
        } catch (error) {
            console.error("Failed to load disease data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDiseaseSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Convert comma-separated string entries to trimmed arrays
        const payload = {
            name: formData.name,
            name_hi: formData.name_hi || undefined,
            category: formData.category,
            description: formData.description,
            description_hi: formData.description_hi || undefined,
            body_system: formData.body_system,
            disease_type: formData.disease_type,
            species: formData.species,
            symptoms: formData.symptoms.split(',').map(s => s.trim()).filter(Boolean),
            symptoms_hi: formData.symptoms_hi ? formData.symptoms_hi.split(',').map(s => s.trim()).filter(Boolean) : undefined,
            causes: formData.causes.split(',').map(s => s.trim()).filter(Boolean),
            causes_hi: formData.causes_hi ? formData.causes_hi.split(',').map(s => s.trim()).filter(Boolean) : undefined,
            treatments: formData.treatments.split(',').map(s => s.trim()).filter(Boolean),
            treatments_hi: formData.treatments_hi ? formData.treatments_hi.split(',').map(s => s.trim()).filter(Boolean) : undefined,
            pathogen_type: formData.pathogen_type,
            pathogen_name: formData.pathogen_name,
            severity_level: Number(formData.severity_level),
            image_path: formData.image_path || undefined,
            group_id: formData.group_id || undefined
        };

        try {
            if (editingDisease) {
                await updateDisease(editingDisease.id, payload);
            } else {
                await createDisease(payload);
            }
            setIsModalOpen(false);
            loadData();
            resetForm();
        } catch (error) {
            console.error("Failed to save disease:", error);
            alert("Failed to save disease details. Make sure all required fields are complete.");
        }
    };

    const handleGroupSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            name: groupFormData.name,
            name_hi: groupFormData.name_hi || undefined,
            description: groupFormData.description || undefined,
            description_hi: groupFormData.description_hi || undefined,
            icon_emoji: groupFormData.icon_emoji || undefined,
            image_path: groupFormData.image_path || undefined
        };

        try {
            if (editingGroup) {
                await updateDiseaseGroup(editingGroup.id, payload);
            } else {
                await createDiseaseGroup(payload);
            }
            setIsGroupModalOpen(false);
            loadData();
            resetGroupForm();
        } catch (error) {
            console.error("Failed to save disease group:", error);
            alert("Failed to save disease category.");
        }
    };

    const handleDiseaseImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            setUploadingImage(true);
            const url = await uploadAdminImage(file, 'diseases');
            setFormData(prev => ({ ...prev, image_path: url }));
        } catch (err: any) {
            alert(err?.response?.data?.detail || 'Failed to upload image');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleGroupImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            setUploadingGroupImage(true);
            const url = await uploadAdminImage(file, 'diseases_groups');
            setGroupFormData(prev => ({ ...prev, image_path: url }));
        } catch (err: any) {
            alert(err?.response?.data?.detail || 'Failed to upload image');
        } finally {
            setUploadingGroupImage(false);
        }
    };

    const handleDeleteDisease = async (id: string) => {
        if (!confirm("Are you sure you want to delete this disease condition? This action cannot be undone.")) return;
        try {
            await deleteDisease(id);
            loadData();
        } catch (error) {
            console.error("Failed to delete disease:", error);
            alert("Failed to delete disease.");
        }
    };

    const handleDeleteGroup = async (id: string) => {
        if (!confirm("Are you sure you want to delete this category group? (Diseases inside it will not be deleted but will lose their category association).")) return;
        try {
            await deleteDiseaseGroup(id);
            loadData();
        } catch (error) {
            console.error("Failed to delete disease group:", error);
            alert("Failed to delete disease group.");
        }
    };

    const openEditDiseaseModal = (disease: Disease) => {
        setEditingDisease(disease);
        setFormData({
            name: disease.name,
            name_hi: disease.name_hi || '',
            category: disease.category || 'Viral',
            description: disease.description || '',
            description_hi: disease.description_hi || '',
            body_system: disease.body_system || '',
            disease_type: disease.disease_type || '',
            species: disease.species || '',
            symptoms: (disease.symptoms || []).join(', '),
            symptoms_hi: (disease.symptoms_hi || []).join(', '),
            causes: (disease.causes || []).join(', '),
            causes_hi: (disease.causes_hi || []).join(', '),
            treatments: (disease.treatments || []).join(', '),
            treatments_hi: (disease.treatments_hi || []).join(', '),
            pathogen_type: disease.pathogen_type || 'Virus',
            pathogen_name: disease.pathogen_name || '',
            severity_level: disease.severity_level || 1,
            image_path: disease.image_path || '',
            group_id: disease.group_id || ''
        });
        setModalTab('en');
        setIsModalOpen(true);
    };

    const openEditGroupModal = (group: DiseaseGroup) => {
        setEditingGroup(group);
        setGroupFormData({
            name: group.name,
            name_hi: group.name_hi || '',
            description: group.description || '',
            description_hi: group.description_hi || '',
            icon_emoji: group.icon_emoji || '',
            image_path: group.image_path || ''
        });
        setGroupModalTab('en');
        setIsGroupModalOpen(true);
    };

    const resetForm = () => {
        setEditingDisease(null);
        setFormData({
            name: '',
            name_hi: '',
            category: 'Viral',
            description: '',
            description_hi: '',
            body_system: 'Respiratory',
            disease_type: 'Infectious',
            species: 'Cattle',
            symptoms: '',
            symptoms_hi: '',
            causes: '',
            causes_hi: '',
            treatments: '',
            treatments_hi: '',
            pathogen_type: 'Virus',
            pathogen_name: '',
            severity_level: 1,
            image_path: '',
            group_id: ''
        });
    };

    const resetGroupForm = () => {
        setEditingGroup(null);
        setGroupFormData({
            name: '',
            name_hi: '',
            description: '',
            description_hi: '',
            icon_emoji: '',
            image_path: ''
        });
    };

    const getPathogenColor = (type: string) => {
        switch ((type || '').toLowerCase()) {
            case 'virus':
            case 'viral':
                return 'bg-red-50 text-red-700 border-red-100';
            case 'bacteria':
            case 'bacterial':
                return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'fungi':
            case 'fungal':
                return 'bg-amber-50 text-amber-700 border-amber-100';
            case 'parasite':
            case 'parasitic':
                return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-100';
        }
    };

    // Filter diseases list based on search query
    const filteredDiseases = diseases.filter(d => {
        const query = diseaseSearch.toLowerCase().trim();
        if (!query) return true;
        return (
            d.name.toLowerCase().includes(query) ||
            (d.name_hi && d.name_hi.includes(query)) ||
            (d.pathogen_name && d.pathogen_name.toLowerCase().includes(query)) ||
            (d.category && d.category.toLowerCase().includes(query)) ||
            (d.species && d.species.toLowerCase().includes(query))
        );
    });

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
                <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
                <span className="text-gray-500 font-medium">Loading Disease Directory...</span>
            </div>
        );
    }

    return (
        <div className="ap-page p-8 min-h-screen">
            {/* Page Header */}
            <div className="ap-header">
                <div>
                    <h1 className="ap-title">Disease Directory</h1>
                    <p className="ap-subtitle">Manage clinical conditions, categories, symptoms, and treatments for livestock.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => { resetGroupForm(); setGroupModalTab('en'); setIsGroupModalOpen(true); }}
                        className="ap-add-btn" style={{ background: 'transparent', color: 'var(--accent-green)', border: '1px solid var(--accent-green)' }}
                    >
                        <Plus size={18} className="mr-2" />
                        New Category Group
                    </button>
                    <button
                        onClick={() => { resetForm(); setModalTab('en'); setIsModalOpen(true); }}
                        className="ap-add-btn"
                    >
                        <Plus size={18} className="mr-2" />
                        Add Condition
                    </button>
                </div>
            </div>

            {/* Top Navigation Tabs */}
            <div className="ap-tabs">
                <button
                    onClick={() => setActiveTab('diseases')}
                    className={`ap-tab ${activeTab === 'diseases' ? 'active' : ''}`}
                >
                    <BookOpen size={16} className="mr-2 inline" />
                    Diseases ({diseases.length})
                </button>
                <button
                    onClick={() => setActiveTab('groups')}
                    className={`ap-tab ${activeTab === 'groups' ? 'active' : ''}`}
                >
                    <Layers size={16} className="mr-2 inline" />
                    Category Groups ({groups.length})
                </button>
            </div>

            {/* DISEASES TAB CONTENT */}
            {activeTab === 'diseases' && (
                <div className="space-y-4">
                    {/* Search bar */}
                    <div className="ap-filters-bar">
                        <div className="ap-search-wrap">
                            <Search size={18} color="#9ca3af" />
                            <input
                                type="text"
                                placeholder="Search by name, pathogen, category..."
                                value={diseaseSearch}
                                onChange={(e) => setDiseaseSearch(e.target.value)}
                                className="ap-search-input"
                            />
                        </div>
                    </div>

                    {/* Diseases Table */}
                    <div className="ap-table-wrap">
                        <table className="ap-table">
                            <thead>
                                <tr>
                                    <th>Disease Name</th>
                                    <th>Category Group</th>
                                    <th>Pathogen Type</th>
                                    <th>Bilingual Status</th>
                                    <th>Severity</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredDiseases.map((disease) => (
                                    <tr
                                        key={disease.id}
                                        className="ap-row cursor-pointer"
                                        onClick={() => {
                                            setViewingDisease(disease);
                                            setDetailLang(disease.description_hi && !disease.description ? 'hi' : 'en');
                                        }}
                                    >
                                        <td>
                                            <div className="ap-cell-bold">{disease.name}</div>
                                            {disease.name_hi && (
                                                <div className="text-xs text-gray-400 font-medium">{disease.name_hi}</div>
                                            )}
                                        </td>
                                        <td>
                                            {disease.group?.name ? (
                                                <span className="ap-badge" style={{ background: '#d1fae5', color: '#065f46', whiteSpace: 'nowrap' }}>
                                                    {disease.group.name}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 italic text-xs">Unassociated</span>
                                            )}
                                        </td>
                                        <td>
                                            {disease.pathogen_type ? (
                                                <span className="ap-badge" style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)' }}>
                                                    {disease.pathogen_type}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 italic text-xs">-</span>
                                            )}
                                            {disease.pathogen_name && (
                                                <div className="text-xs text-gray-400 font-medium italic mt-1">{disease.pathogen_name}</div>
                                            )}
                                        </td>
                                        <td>
                                            <div className="flex gap-1.5">
                                                <span className="ap-badge" style={{ background: '#d1fae5', color: '#065f46' }}>EN</span>
                                                {disease.description_hi ? (
                                                    <span className="ap-badge" style={{ background: '#d1fae5', color: '#065f46' }}>HI</span>
                                                ) : (
                                                    <span className="ap-badge" style={{ background: '#fef3c7', color: '#92400e' }} title="Hindi description missing">HI Missing</span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex">
                                                {[...Array(5)].map((_, i) => (
                                                    <div key={i} className={`w-2 h-2 rounded-full mx-0.5 ${i < disease.severity_level ? 'bg-red-500' : 'bg-gray-600'}`} />
                                                ))}
                                            </div>
                                        </td>
                                        <td className="text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={() => openEditDiseaseModal(disease)}
                                                className="ap-btn-sm ap-btn-outline"
                                                title="Edit Disease"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteDisease(disease.id)}
                                                className="ap-btn-sm ap-btn-danger"
                                                title="Delete Disease"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredDiseases.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="ap-empty">
                                            No disease conditions found matching "{diseaseSearch}".
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* GROUPS TAB CONTENT */}
            {activeTab === 'groups' && (
                <div className="ap-stats-grid">
                    {groups.map((group) => {
                        const associatedCount = diseases.filter(d => d.group_id === group.id).length;
                        return (
                            <div key={group.id} className="ap-expand-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div>
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-xl shrink-0" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                                {group.icon_emoji || '🐄'}
                                            </div>
                                            <div>
                                                <h4 className="ap-cell-bold">{group.name}</h4>
                                                {group.name_hi && (
                                                    <span className="text-xs text-gray-400 font-medium block">{group.name_hi}</span>
                                                )}
                                            </div>
                                        </div>
                                        <span className="ap-badge" style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)' }}>
                                            {associatedCount} {associatedCount === 1 ? 'Condition' : 'Conditions'}
                                        </span>
                                    </div>
                                    <p className="text-sm line-clamp-2 mt-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                        {group.description || 'No description provided.'}
                                    </p>
                                    {group.description_hi && (
                                        <p className="text-xs italic line-clamp-1 mt-1 font-medium" style={{ color: 'var(--text-secondary)', opacity: 0.7 }}>
                                            {group.description_hi}
                                        </p>
                                    )}
                                </div>
                                <div className="flex justify-end gap-3 pt-4 mt-4" style={{ borderTop: '1px solid var(--border-glass)' }}>
                                    <button
                                        onClick={() => openEditGroupModal(group)}
                                        className="ap-btn-sm ap-btn-outline"
                                    >
                                        <Edit2 size={14} />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteGroup(group.id)}
                                        className="ap-btn-sm ap-btn-danger"
                                    >
                                        <Trash2 size={14} />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                    {groups.length === 0 && (
                        <div className="col-span-full ap-empty ap-expand-card">
                            No category groups defined yet.
                        </div>
                    )}
                </div>
            )}

            {/* DISEASE CREATE/EDIT MODAL */}
            {isModalOpen && (
                <div className="ap-modal-backdrop">
                    <div className="ap-modal w-full max-w-2xl" style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                        {/* Modal Header */}
                        <div className="ap-modal-header border-b" style={{ borderColor: 'var(--border-glass)' }}>
                            <h3 className="ap-title text-lg">
                                {editingDisease ? 'Edit Disease Condition' : 'Add New Disease Condition'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="ap-modal-close">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Internal Language Pills (Tabs) */}
                        <div className="flex border-b px-6" style={{ background: 'rgba(0,0,0,0.2)', borderColor: 'var(--border-glass)' }}>
                            <button
                                type="button"
                                onClick={() => setModalTab('en')}
                                className={`px-4 py-2 text-sm font-semibold border-b-2 cursor-pointer transition-all ${
                                    modalTab === 'en' 
                                        ? 'border-emerald-600 text-emerald-600' 
                                        : 'border-transparent text-gray-500'
                                }`}
                            >
                                <Globe size={14} className="inline mr-1" />
                                English Details
                            </button>
                            <button
                                type="button"
                                onClick={() => setModalTab('hi')}
                                className={`px-4 py-2 text-sm font-semibold border-b-2 cursor-pointer transition-all ${
                                    modalTab === 'hi' 
                                        ? 'border-emerald-600 text-emerald-600' 
                                        : 'border-transparent text-gray-500'
                                }`}
                            >
                                <Globe size={14} className="inline mr-1" />
                                Hindi Translation (हिंदी अनुवाद)
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleDiseaseSubmit} className="ap-modal-body space-y-4 overflow-y-auto">
                            {/* TAB 1: ENGLISH DETAILS */}
                            {modalTab === 'en' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Name (English) *</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. Foot and Mouth Disease"
                                                className="ap-input"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Category Group *</label>
                                            <select
                                                required
                                                className="ap-input"
                                                value={formData.group_id}
                                                onChange={(e) => setFormData({ ...formData, group_id: e.target.value })}
                                            >
                                                <option value="">Select Category Group</option>
                                                {groups.map(g => (
                                                    <option key={g.id} value={g.id}>{g.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Species *</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. Cattle, Buffalo"
                                                className="ap-input"
                                                value={formData.species}
                                                onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Body System Affected</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Respiratory, Integumentary"
                                                className="ap-input"
                                                value={formData.body_system}
                                                onChange={(e) => setFormData({ ...formData, body_system: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Disease Type</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Infectious, Zoonotic"
                                                className="ap-input"
                                                value={formData.disease_type}
                                                onChange={(e) => setFormData({ ...formData, disease_type: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Pathogen Type *</label>
                                            <select
                                                className="ap-input"
                                                value={formData.pathogen_type}
                                                onChange={(e) => setFormData({ ...formData, pathogen_type: e.target.value })}
                                            >
                                                <option value="Virus">Virus</option>
                                                <option value="Bacteria">Bacteria</option>
                                                <option value="Fungi">Fungi</option>
                                                <option value="Parasite">Parasite</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Pathogen Name</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Aphthovirus, Brucella abortus"
                                                className="ap-input"
                                                value={formData.pathogen_name}
                                                onChange={(e) => setFormData({ ...formData, pathogen_name: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Severity Level (1-5)</label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="5"
                                                className="ap-input"
                                                value={formData.severity_level}
                                                onChange={(e) => setFormData({ ...formData, severity_level: Number(e.target.value) })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Image Upload</label>
                                            <div className="flex items-center gap-3">
                                                <input 
                                                    type="file" 
                                                    accept="image/*" 
                                                    onChange={handleDiseaseImageUpload} 
                                                    style={{ display: 'none' }} 
                                                    id="disease-image-upload" 
                                                    disabled={uploadingImage}
                                                />
                                                <label htmlFor="disease-image-upload" className="px-3 py-2 border border-emerald-600 text-emerald-600 font-medium rounded-lg hover:bg-emerald-50 transition-all cursor-pointer text-sm">
                                                    {uploadingImage ? 'Uploading...' : 'Choose Image'}
                                                </label>
                                                {formData.image_path && (
                                                    <div className="relative">
                                                        <img src={formData.image_path} alt="Preview" className="w-10 h-10 rounded object-cover border border-gray-300" />
                                                        <button 
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, image_path: '' })}
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs border-none cursor-pointer"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Description (English) *</label>
                                        <textarea
                                            required
                                            rows={3}
                                            placeholder="Write clinical description in English..."
                                            className="ap-textarea"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Symptoms (English, comma-separated) *</label>
                                        <textarea
                                            required
                                            rows={2}
                                            placeholder="High fever, drooling, blisters on hooves"
                                            className="ap-textarea"
                                            value={formData.symptoms}
                                            onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Causes & Transmission (English, comma-separated) *</label>
                                        <textarea
                                            required
                                            rows={2}
                                            placeholder="Direct contact, contaminated water, airborne droplets"
                                            className="ap-textarea"
                                            value={formData.causes}
                                            onChange={(e) => setFormData({ ...formData, causes: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Treatments & Management (English, comma-separated) *</label>
                                        <textarea
                                            required
                                            rows={2}
                                            placeholder="Supportive therapy, clean water, isolate animal"
                                            className="ap-textarea"
                                            value={formData.treatments}
                                            onChange={(e) => setFormData({ ...formData, treatments: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* TAB 2: HINDI TRANSLATION DETAILS */}
                            {modalTab === 'hi' && (
                                <div className="space-y-4">
                                    <div className="bg-emerald-50 text-emerald-800 p-4 rounded-lg border border-emerald-100 flex gap-2">
                                        <Info size={20} className="shrink-0 mt-0.5 text-emerald-600" />
                                        <p className="text-xs leading-relaxed">
                                            Providing translations ensures that farmers using the Hindi app layout can view disease details accurately in their native language. Leave fields blank if translations are not available yet.
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Name (Hindi / हिंदी)</label>
                                        <input
                                            type="text"
                                            placeholder="खुरपका और मुंहपका रोग"
                                            className="ap-input"
                                            value={formData.name_hi}
                                            onChange={(e) => setFormData({ ...formData, name_hi: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Description (Hindi / हिंदी)</label>
                                        <textarea
                                            rows={3}
                                            placeholder="इस रोग का मुख्य कारण अति संक्रामक विषाणु है जो पशुओं में तेजी से फैलता है..."
                                            className="ap-textarea"
                                            value={formData.description_hi}
                                            onChange={(e) => setFormData({ ...formData, description_hi: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Symptoms (Hindi, comma-separated)</label>
                                        <textarea
                                            rows={2}
                                            placeholder="तेज बुखार, मुंह से लार टपकना, थन और खुरों पर छाले"
                                            className="ap-textarea"
                                            value={formData.symptoms_hi}
                                            onChange={(e) => setFormData({ ...formData, symptoms_hi: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Causes & Transmission (Hindi, comma-separated)</label>
                                        <textarea
                                            rows={2}
                                            placeholder="प्रत्यक्ष संपर्क, दूषित पानी और हवा, संक्रमित पशु के संपर्क में आना"
                                            className="ap-textarea"
                                            value={formData.causes_hi}
                                            onChange={(e) => setFormData({ ...formData, causes_hi: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Treatments (Hindi, comma-separated)</label>
                                        <textarea
                                            rows={2}
                                            placeholder="संक्रमित पशु को अलग रखना, खुरों को एंटीसेप्टिक से धोना, सहायक चिकित्सा"
                                            className="ap-textarea"
                                            value={formData.treatments_hi}
                                            onChange={(e) => setFormData({ ...formData, treatments_hi: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Form CTAs */}
                            <div className="ap-modal-footer mt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="ap-btn-sm ap-btn-outline"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="ap-btn-sm ap-btn-primary"
                                >
                                    {editingDisease ? 'Update Disease' : 'Create Disease'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* DISEASE DETAIL VIEW MODAL */}
            {viewingDisease && (
                <div className="ap-modal-backdrop">
                    <div className="ap-modal w-full max-w-3xl" style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                        {/* Detail Header */}
                        <div className="ap-modal-header border-b" style={{ borderColor: 'var(--border-glass)' }}>
                            <div>
                                <h3 className="ap-title text-xl mb-2">
                                    {detailLang === 'hi' && viewingDisease.name_hi 
                                        ? viewingDisease.name_hi 
                                        : viewingDisease.name}
                                </h3>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    <span className="ap-badge" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd' }}>
                                        {viewingDisease.category}
                                    </span>
                                    <span className="ap-badge" style={{ background: 'rgba(255, 255, 255, 0.1)', color: 'var(--text-primary)' }}>
                                        {viewingDisease.species}
                                    </span>
                                    {viewingDisease.group && (
                                        <span className="ap-badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7' }}>
                                            {viewingDisease.group.name}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {/* Language toggle in detail view */}
                                {(viewingDisease.description_hi || viewingDisease.symptoms_hi || viewingDisease.treatments_hi) && (
                                    <div className="flex p-0.5 rounded-lg border" style={{ background: 'rgba(0,0,0,0.2)', borderColor: 'var(--border-glass)' }}>
                                        <button 
                                            onClick={() => setDetailLang('en')}
                                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${detailLang === 'en' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
                                        >
                                            English
                                        </button>
                                        <button 
                                            onClick={() => setDetailLang('hi')}
                                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${detailLang === 'hi' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
                                        >
                                            हिंदी
                                        </button>
                                    </div>
                                )}
                                <button 
                                    onClick={() => setViewingDisease(null)} 
                                    className="ap-modal-close"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Detail Content */}
                        <div className="ap-modal-body p-8 space-y-6 overflow-y-auto">
                            {/* Excerpt/Description */}
                            <section>
                                <h4 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Description</h4>
                                <p className="leading-relaxed text-sm" style={{ color: 'var(--text-primary)' }}>
                                    {detailLang === 'hi' && viewingDisease.description_hi 
                                        ? viewingDisease.description_hi 
                                        : viewingDisease.description}
                                </p>
                            </section>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Details Card */}
                                <section className="p-5 rounded-xl border" style={{ background: 'rgba(0,0,0,0.2)', borderColor: 'var(--border-glass)' }}>
                                    <h4 className="text-xs font-bold uppercase tracking-wider mb-3.5" style={{ color: 'var(--text-secondary)' }}>Core Specifications</h4>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex flex-col sm:flex-row justify-between border-b pb-2 gap-2" style={{ borderColor: 'var(--border-glass)' }}>
                                            <span style={{ color: 'var(--text-secondary)' }}>Affected Body System</span>
                                            <span className="font-semibold text-right" style={{ color: 'var(--text-primary)' }}>{viewingDisease.body_system || '-'}</span>
                                        </div>
                                        <div className="flex flex-col sm:flex-row justify-between border-b pb-2 gap-2" style={{ borderColor: 'var(--border-glass)' }}>
                                            <span style={{ color: 'var(--text-secondary)' }}>Classification Type</span>
                                            <span className="font-semibold text-right" style={{ color: 'var(--text-primary)' }}>{viewingDisease.disease_type || '-'}</span>
                                        </div>
                                        <div className="flex flex-col sm:flex-row justify-between border-b pb-2 gap-2" style={{ borderColor: 'var(--border-glass)' }}>
                                            <span style={{ color: 'var(--text-secondary)' }}>Pathogen Agent</span>
                                            <span className="font-semibold text-right" style={{ color: 'var(--text-primary)' }}>
                                                {viewingDisease.pathogen_name || '-'} {viewingDisease.pathogen_type && `(${viewingDisease.pathogen_type})`}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center pt-1">
                                            <span style={{ color: 'var(--text-secondary)' }}>Severity Rating</span>
                                            <div className="flex space-x-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className={`w-2.5 h-2.5 rounded-full ${i < viewingDisease.severity_level ? 'bg-red-500' : 'bg-gray-600'}`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Symptoms Column */}
                                <section className="p-5 rounded-xl border" style={{ background: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
                                    <h4 className="text-xs font-bold uppercase tracking-wider mb-3.5 flex items-center" style={{ color: '#34d399' }}>
                                        <CheckCircle size={14} className="mr-1.5" />
                                        Symptoms & Clinical Signs
                                    </h4>
                                    <ul className="space-y-2 text-sm">
                                        {((detailLang === 'hi' && viewingDisease.symptoms_hi ? viewingDisease.symptoms_hi : viewingDisease.symptoms) || []).map((s, i) => (
                                            <li key={i} className="flex items-start" style={{ color: '#a7f3d0' }}>
                                                <span className="mr-2 font-bold" style={{ color: '#10b981' }}>•</span>
                                                <span>{s}</span>
                                            </li>
                                        ))}
                                        {(!viewingDisease.symptoms || viewingDisease.symptoms.length === 0) && (
                                            <li className="italic" style={{ color: 'var(--text-secondary)' }}>No symptoms specified.</li>
                                        )}
                                    </ul>
                                </section>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Causes Column */}
                                <section className="p-5 rounded-xl border" style={{ background: 'rgba(245, 158, 11, 0.05)', borderColor: 'rgba(245, 158, 11, 0.2)' }}>
                                    <h4 className="text-xs font-bold uppercase tracking-wider mb-3.5 flex items-center" style={{ color: '#fbbf24' }}>
                                        <AlertCircle size={14} className="mr-1.5" />
                                        Causes & Transmission
                                    </h4>
                                    <ul className="space-y-2 text-sm">
                                        {((detailLang === 'hi' && viewingDisease.causes_hi ? viewingDisease.causes_hi : viewingDisease.causes) || []).map((c, i) => (
                                            <li key={i} className="flex items-start" style={{ color: '#fde68a' }}>
                                                <span className="mr-2 font-bold" style={{ color: '#f59e0b' }}>•</span>
                                                <span>{c}</span>
                                            </li>
                                        ))}
                                        {(!viewingDisease.causes || viewingDisease.causes.length === 0) && (
                                            <li className="italic" style={{ color: 'var(--text-secondary)' }}>No cause details specified.</li>
                                        )}
                                    </ul>
                                </section>

                                {/* Treatments Column */}
                                <section className="p-5 rounded-xl border" style={{ background: 'rgba(59, 130, 246, 0.05)', borderColor: 'rgba(59, 130, 246, 0.2)' }}>
                                    <h4 className="text-xs font-bold uppercase tracking-wider mb-3.5 flex items-center" style={{ color: '#60a5fa' }}>
                                        <Stethoscope size={14} className="mr-1.5" />
                                        Treatments & Control
                                    </h4>
                                    <ul className="space-y-2 text-sm">
                                        {((detailLang === 'hi' && viewingDisease.treatments_hi ? viewingDisease.treatments_hi : viewingDisease.treatments) || []).map((t, i) => (
                                            <li key={i} className="flex items-start" style={{ color: '#bfdbfe' }}>
                                                <span className="mr-2 font-bold" style={{ color: '#3b82f6' }}>•</span>
                                                <span>{t}</span>
                                            </li>
                                        ))}
                                        {(!viewingDisease.treatments || viewingDisease.treatments.length === 0) && (
                                            <li className="italic" style={{ color: 'var(--text-secondary)' }}>No treatments specified.</li>
                                        )}
                                    </ul>
                                </section>
                            </div>
                        </div>

                        <div className="ap-modal-footer flex justify-end">
                            <button
                                onClick={() => setViewingDisease(null)}
                                className="ap-btn-sm ap-btn-outline"
                            >
                                Close Details
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* DISEASE GROUP / CATEGORY EDIT/CREATE MODAL */}
            {isGroupModalOpen && (
                <div className="ap-modal-backdrop">
                    <div className="ap-modal w-full max-w-md">
                        {/* Group Modal Header */}
                        <div className="ap-modal-header border-b" style={{ borderColor: 'var(--border-glass)' }}>
                            <h3 className="ap-title text-lg">
                                {editingGroup ? 'Edit Category Group' : 'Add Category Group'}
                            </h3>
                            <button onClick={() => setIsGroupModalOpen(false)} className="ap-modal-close">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Internal Language Pills */}
                        <div className="flex border-b px-6" style={{ background: 'rgba(0,0,0,0.2)', borderColor: 'var(--border-glass)' }}>
                            <button
                                type="button"
                                onClick={() => setGroupModalTab('en')}
                                className={`px-4 py-2 text-sm font-semibold border-b-2 cursor-pointer transition-all ${
                                    groupModalTab === 'en' 
                                        ? 'border-emerald-600 text-emerald-600' 
                                        : 'border-transparent text-gray-500'
                                }`}
                            >
                                English Details
                            </button>
                            <button
                                type="button"
                                onClick={() => setGroupModalTab('hi')}
                                className={`px-4 py-2 text-sm font-semibold border-b-2 cursor-pointer transition-all ${
                                    groupModalTab === 'hi' 
                                        ? 'border-emerald-600 text-emerald-600' 
                                        : 'border-transparent text-gray-500'
                                }`}
                            >
                                Hindi Translation (हिंदी)
                            </button>
                        </div>

                        <form onSubmit={handleGroupSubmit} className="ap-modal-body space-y-4">
                            {/* TAB 1: GROUP ENGLISH DETAILS */}
                            {groupModalTab === 'en' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Group Name (English) *</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Digestive Disorders"
                                            className="ap-input"
                                            value={groupFormData.name}
                                            onChange={(e) => setGroupFormData({ ...groupFormData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Icon Emoji</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. 🥛, 🦠, 🦵"
                                                className="ap-input text-center text-lg"
                                                value={groupFormData.icon_emoji}
                                                onChange={(e) => setGroupFormData({ ...groupFormData, icon_emoji: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Image Upload</label>
                                            <div className="flex items-center gap-3">
                                                <input 
                                                    type="file" 
                                                    accept="image/*" 
                                                    onChange={handleGroupImageUpload} 
                                                    style={{ display: 'none' }} 
                                                    id="group-image-upload" 
                                                    disabled={uploadingGroupImage}
                                                />
                                                <label htmlFor="group-image-upload" className="px-3 py-2 border border-emerald-600 text-emerald-600 font-medium rounded-lg hover:bg-emerald-50 transition-all cursor-pointer text-sm">
                                                    {uploadingGroupImage ? 'Uploading...' : 'Choose Image'}
                                                </label>
                                                {groupFormData.image_path && (
                                                    <div className="relative">
                                                        <img src={groupFormData.image_path} alt="Preview" className="w-10 h-10 rounded object-cover border border-gray-300" />
                                                        <button 
                                                            type="button"
                                                            onClick={() => setGroupFormData({ ...groupFormData, image_path: '' })}
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs border-none cursor-pointer"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Description (English)</label>
                                        <textarea
                                            rows={3}
                                            placeholder="Description of the category..."
                                            className="ap-textarea"
                                            value={groupFormData.description}
                                            onChange={(e) => setGroupFormData({ ...groupFormData, description: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* TAB 2: GROUP HINDI DETAILS */}
                            {groupModalTab === 'hi' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Group Name (Hindi / हिंदी)</label>
                                        <input
                                            type="text"
                                            placeholder="पाचन संबंधी विकार"
                                            className="ap-input"
                                            value={groupFormData.name_hi}
                                            onChange={(e) => setGroupFormData({ ...groupFormData, name_hi: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Description (Hindi / हिंदी)</label>
                                        <textarea
                                            rows={3}
                                            placeholder="इस श्रेणी में पशुओं के पाचन तंत्र से जुड़े रोगों की जानकारी है..."
                                            className="ap-textarea"
                                            value={groupFormData.description_hi}
                                            onChange={(e) => setGroupFormData({ ...groupFormData, description_hi: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Group Modal CTAs */}
                            <div className="ap-modal-footer mt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsGroupModalOpen(false)}
                                    className="ap-btn-sm ap-btn-outline"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="ap-btn-sm ap-btn-primary"
                                >
                                    {editingGroup ? 'Update Category' : 'Create Category'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageDiseases;
