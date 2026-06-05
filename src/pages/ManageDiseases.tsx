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

const ManageDiseases = () => {
    // Navigation / Listing states
    const [activeTab, setActiveTab] = useState<'diseases' | 'groups'>('diseases');
    const [diseases, setDiseases] = useState<Disease[]>([]);
    const [groups, setGroups] = useState<DiseaseGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [diseaseSearch, setDiseaseSearch] = useState('');

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
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Disease Directory</h1>
                    <p className="text-gray-500 mt-1">Manage clinical conditions, categories, symptoms, and treatments for livestock.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => { resetGroupForm(); setGroupModalTab('en'); setIsGroupModalOpen(true); }}
                        className="flex items-center px-4 py-2 border border-emerald-600 text-emerald-600 font-medium rounded-lg hover:bg-emerald-50 transition-all cursor-pointer"
                    >
                        <Plus size={18} className="mr-2" />
                        New Category Group
                    </button>
                    <button
                        onClick={() => { resetForm(); setModalTab('en'); setIsModalOpen(true); }}
                        className="flex items-center px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 shadow-sm transition-all cursor-pointer"
                    >
                        <Plus size={18} className="mr-2" />
                        Add Condition
                    </button>
                </div>
            </div>

            {/* Top Navigation Tabs */}
            <div className="flex border-b border-gray-200 mb-6 bg-white px-4 pt-2 rounded-t-xl">
                <button
                    onClick={() => setActiveTab('diseases')}
                    className={`flex items-center px-4 py-3 font-semibold text-sm border-b-2 cursor-pointer transition-all ${
                        activeTab === 'diseases' 
                            ? 'border-emerald-600 text-emerald-600' 
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <BookOpen size={16} className="mr-2" />
                    Diseases ({diseases.length})
                </button>
                <button
                    onClick={() => setActiveTab('groups')}
                    className={`flex items-center px-4 py-3 font-semibold text-sm border-b-2 cursor-pointer transition-all ${
                        activeTab === 'groups' 
                            ? 'border-emerald-600 text-emerald-600' 
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <Layers size={16} className="mr-2" />
                    Category Groups ({groups.length})
                </button>
            </div>

            {/* DISEASES TAB CONTENT */}
            {activeTab === 'diseases' && (
                <div className="space-y-4">
                    {/* Search bar */}
                    <div className="flex max-w-md bg-white border border-gray-200 rounded-lg px-3.5 py-2 items-center focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500">
                        <Search size={18} className="text-gray-400 mr-2" />
                        <input
                            type="text"
                            placeholder="Search by name, pathogen, category..."
                            value={diseaseSearch}
                            onChange={(e) => setDiseaseSearch(e.target.value)}
                            className="outline-none w-full text-sm text-gray-700"
                        />
                    </div>

                    {/* Diseases Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-gray-700 text-sm">Disease Name</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700 text-sm">Category Group</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700 text-sm">Pathogen Type</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700 text-sm">Bilingual Status</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700 text-sm">Severity</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700 text-sm text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredDiseases.map((disease) => (
                                    <tr
                                        key={disease.id}
                                        className="hover:bg-gray-50/80 transition-colors cursor-pointer"
                                        onClick={() => {
                                            setViewingDisease(disease);
                                            setDetailLang(disease.description_hi && !disease.description ? 'hi' : 'en');
                                        }}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-800">{disease.name}</div>
                                            {disease.name_hi && (
                                                <div className="text-xs text-gray-500 font-medium">{disease.name_hi}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-600">
                                            {disease.group?.name ? (
                                                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-100 text-xs font-semibold">
                                                    {disease.group.name}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 italic text-xs">Unassociated</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {disease.pathogen_type ? (
                                                <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full border ${getPathogenColor(disease.pathogen_type)}`}>
                                                    {disease.pathogen_type}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 italic text-xs">-</span>
                                            )}
                                            {disease.pathogen_name && (
                                                <div className="text-xs text-gray-400 font-medium italic mt-0.5">{disease.pathogen_name}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-1.5">
                                                <span className="px-1.5 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded text-[10px] font-bold">EN</span>
                                                {disease.description_hi ? (
                                                    <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-bold">HI</span>
                                                ) : (
                                                    <span className="px-1.5 py-0.5 bg-yellow-50 text-yellow-600 border border-yellow-200 rounded text-[10px] font-bold" title="Hindi description missing">HI Missing</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex">
                                                {[...Array(5)].map((_, i) => (
                                                    <div key={i} className={`w-2 h-2 rounded-full mx-0.5 ${i < disease.severity_level ? 'bg-red-500' : 'bg-gray-200'}`} />
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={() => openEditDiseaseModal(disease)}
                                                className="text-gray-400 hover:text-emerald-600 transition-colors p-1"
                                                title="Edit Disease"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteDisease(disease.id)}
                                                className="text-gray-400 hover:text-red-600 transition-colors p-1"
                                                title="Delete Disease"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredDiseases.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groups.map((group) => {
                        const associatedCount = diseases.filter(d => d.group_id === group.id).length;
                        return (
                            <div key={group.id} className="bg-white rounded-xl shadow-sm border border-gray-200/80 p-5 flex flex-col justify-between hover:shadow-md transition-all">
                                <div>
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-xl">
                                                {group.icon_emoji || '🐄'}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-800 text-lg">{group.name}</h4>
                                                {group.name_hi && (
                                                    <span className="text-xs text-gray-500 font-medium block">{group.name_hi}</span>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                                            {associatedCount} {associatedCount === 1 ? 'Condition' : 'Conditions'}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 text-sm line-clamp-2 mt-2 leading-relaxed">
                                        {group.description || 'No description provided.'}
                                    </p>
                                    {group.description_hi && (
                                        <p className="text-gray-400 text-xs italic line-clamp-1 mt-1 font-medium">
                                            {group.description_hi}
                                        </p>
                                    )}
                                </div>
                                <div className="flex justify-end gap-3 border-t border-gray-100 pt-4 mt-4">
                                    <button
                                        onClick={() => openEditGroupModal(group)}
                                        className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                                    >
                                        <Edit2 size={14} />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteGroup(group.id)}
                                        className="text-sm font-semibold text-red-500 hover:text-red-600 flex items-center gap-1.5 transition-colors cursor-pointer"
                                    >
                                        <Trash2 size={14} />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                    {groups.length === 0 && (
                        <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-400">
                            No category groups defined yet.
                        </div>
                    )}
                </div>
            )}

            {/* DISEASE CREATE/EDIT MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 my-8">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800">
                                {editingDisease ? 'Edit Disease Condition' : 'Add New Disease Condition'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Internal Language Pills (Tabs) */}
                        <div className="flex bg-gray-50 border-b border-gray-100 px-6">
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
                        <form onSubmit={handleDiseaseSubmit} className="p-6 space-y-4 max-h-[calc(100vh-220px)] overflow-y-auto">
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
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Category Group *</label>
                                            <select
                                                required
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
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
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                                                value={formData.species}
                                                onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Body System Affected</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Respiratory, Integumentary"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                                                value={formData.body_system}
                                                onChange={(e) => setFormData({ ...formData, body_system: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Disease Type</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Infectious, Zoonotic"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                                                value={formData.disease_type}
                                                onChange={(e) => setFormData({ ...formData, disease_type: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Pathogen Type *</label>
                                            <select
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
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
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
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
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                                                value={formData.severity_level}
                                                onChange={(e) => setFormData({ ...formData, severity_level: Number(e.target.value) })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Image URL / Emoji Icon</label>
                                            <input
                                                type="text"
                                                placeholder="🔴 or https://domain.com/image.jpg"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                                                value={formData.image_path}
                                                onChange={(e) => setFormData({ ...formData, image_path: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Description (English) *</label>
                                        <textarea
                                            required
                                            rows={3}
                                            placeholder="Write clinical description in English..."
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none resize-none focus:ring-2 focus:ring-emerald-500"
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
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none resize-none focus:ring-2 focus:ring-emerald-500"
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
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none resize-none focus:ring-2 focus:ring-emerald-500"
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
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none resize-none focus:ring-2 focus:ring-emerald-500"
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
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                                            value={formData.name_hi}
                                            onChange={(e) => setFormData({ ...formData, name_hi: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Description (Hindi / हिंदी)</label>
                                        <textarea
                                            rows={3}
                                            placeholder="इस रोग का मुख्य कारण अति संक्रामक विषाणु है जो पशुओं में तेजी से फैलता है..."
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none resize-none focus:ring-2 focus:ring-emerald-500"
                                            value={formData.description_hi}
                                            onChange={(e) => setFormData({ ...formData, description_hi: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Symptoms (Hindi, comma-separated)</label>
                                        <textarea
                                            rows={2}
                                            placeholder="तेज बुखार, मुंह से लार टपकना, थन और खुरों पर छाले"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none resize-none focus:ring-2 focus:ring-emerald-500"
                                            value={formData.symptoms_hi}
                                            onChange={(e) => setFormData({ ...formData, symptoms_hi: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Causes & Transmission (Hindi, comma-separated)</label>
                                        <textarea
                                            rows={2}
                                            placeholder="प्रत्यक्ष संपर्क, दूषित पानी और हवा, संक्रमित पशु के संपर्क में आना"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none resize-none focus:ring-2 focus:ring-emerald-500"
                                            value={formData.causes_hi}
                                            onChange={(e) => setFormData({ ...formData, causes_hi: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Treatments (Hindi, comma-separated)</label>
                                        <textarea
                                            rows={2}
                                            placeholder="संक्रमित पशु को अलग रखना, खुरों को एंटीसेप्टिक से धोना, सहायक चिकित्सा"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none resize-none focus:ring-2 focus:ring-emerald-500"
                                            value={formData.treatments_hi}
                                            onChange={(e) => setFormData({ ...formData, treatments_hi: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Form CTAs */}
                            <div className="pt-4 flex justify-end gap-3 sticky bottom-0 bg-white border-t border-gray-100 mt-4 py-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all cursor-pointer font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 shadow-sm transition-all cursor-pointer font-medium"
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in duration-200 my-8">
                        {/* Detail Header */}
                        <div className="flex justify-between items-start p-8 border-b border-gray-100 sticky top-0 bg-white z-10">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800">
                                    {detailLang === 'hi' && viewingDisease.name_hi 
                                        ? viewingDisease.name_hi 
                                        : viewingDisease.name}
                                </h3>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-xs font-bold rounded-full uppercase">
                                        {viewingDisease.category}
                                    </span>
                                    <span className="px-2.5 py-0.5 bg-gray-100 text-gray-800 text-xs font-bold rounded-full uppercase">
                                        {viewingDisease.species}
                                    </span>
                                    {viewingDisease.group && (
                                        <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full uppercase">
                                            {viewingDisease.group.name}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {/* Language toggle in detail view */}
                                {(viewingDisease.description_hi || viewingDisease.symptoms_hi || viewingDisease.treatments_hi) && (
                                    <div className="flex bg-gray-100 p-0.5 rounded-lg border">
                                        <button 
                                            onClick={() => setDetailLang('en')}
                                            className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${detailLang === 'en' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                                        >
                                            English
                                        </button>
                                        <button 
                                            onClick={() => setDetailLang('hi')}
                                            className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${detailLang === 'hi' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                                        >
                                            हिंदी
                                        </button>
                                    </div>
                                )}
                                <button 
                                    onClick={() => setViewingDisease(null)} 
                                    className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full cursor-pointer"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Detail Content */}
                        <div className="p-8 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                            {/* Excerpt/Description */}
                            <section>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Description</h4>
                                <p className="text-gray-700 leading-relaxed text-base">
                                    {detailLang === 'hi' && viewingDisease.description_hi 
                                        ? viewingDisease.description_hi 
                                        : viewingDisease.description}
                                </p>
                            </section>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Details Card */}
                                <section className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3.5">Core Specifications</h4>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between border-b border-gray-200/50 pb-2">
                                            <span className="text-gray-500">Affected Body System</span>
                                            <span className="font-semibold text-gray-800">{viewingDisease.body_system || '-'}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-200/50 pb-2">
                                            <span className="text-gray-500">Classification Type</span>
                                            <span className="font-semibold text-gray-800">{viewingDisease.disease_type || '-'}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-200/50 pb-2">
                                            <span className="text-gray-500">Pathogen Agent</span>
                                            <span className="font-semibold text-gray-800">
                                                {viewingDisease.pathogen_name || '-'} {viewingDisease.pathogen_type && `(${viewingDisease.pathogen_type})`}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center pt-1">
                                            <span className="text-gray-500">Severity Rating</span>
                                            <div className="flex space-x-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className={`w-2.5 h-2.5 rounded-full ${i < viewingDisease.severity_level ? 'bg-red-500' : 'bg-gray-200'}`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Symptoms Column */}
                                <section className="bg-emerald-50/50 p-5 rounded-xl border border-emerald-100">
                                    <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-3.5 flex items-center">
                                        <CheckCircle size={14} className="mr-1.5 text-emerald-600" />
                                        Symptoms & Clinical Signs
                                    </h4>
                                    <ul className="space-y-2 text-sm">
                                        {((detailLang === 'hi' && viewingDisease.symptoms_hi ? viewingDisease.symptoms_hi : viewingDisease.symptoms) || []).map((s, i) => (
                                            <li key={i} className="flex items-start text-emerald-800">
                                                <span className="text-emerald-500 mr-2 font-bold">•</span>
                                                <span>{s}</span>
                                            </li>
                                        ))}
                                        {(!viewingDisease.symptoms || viewingDisease.symptoms.length === 0) && (
                                            <li className="text-gray-400 italic">No symptoms specified.</li>
                                        )}
                                    </ul>
                                </section>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Causes Column */}
                                <section className="bg-orange-50/50 p-5 rounded-xl border border-orange-100">
                                    <h4 className="text-xs font-bold text-orange-700 uppercase tracking-wider mb-3.5 flex items-center">
                                        <AlertCircle size={14} className="mr-1.5 text-orange-600" />
                                        Causes & Transmission
                                    </h4>
                                    <ul className="space-y-2 text-sm">
                                        {((detailLang === 'hi' && viewingDisease.causes_hi ? viewingDisease.causes_hi : viewingDisease.causes) || []).map((c, i) => (
                                            <li key={i} className="flex items-start text-orange-800">
                                                <span className="text-orange-400 mr-2 font-bold">•</span>
                                                <span>{c}</span>
                                            </li>
                                        ))}
                                        {(!viewingDisease.causes || viewingDisease.causes.length === 0) && (
                                            <li className="text-gray-400 italic">No cause details specified.</li>
                                        )}
                                    </ul>
                                </section>

                                {/* Treatments Column */}
                                <section className="bg-blue-50/50 p-5 rounded-xl border border-blue-100">
                                    <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-3.5 flex items-center">
                                        <Stethoscope size={14} className="mr-1.5 text-blue-600" />
                                        Treatments & Control
                                    </h4>
                                    <ul className="space-y-2 text-sm">
                                        {((detailLang === 'hi' && viewingDisease.treatments_hi ? viewingDisease.treatments_hi : viewingDisease.treatments) || []).map((t, i) => (
                                            <li key={i} className="flex items-start text-blue-800">
                                                <span className="text-blue-400 mr-2 font-bold">•</span>
                                                <span>{t}</span>
                                            </li>
                                        ))}
                                        {(!viewingDisease.treatments || viewingDisease.treatments.length === 0) && (
                                            <li className="text-gray-400 italic">No treatments specified.</li>
                                        )}
                                    </ul>
                                </section>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 flex justify-end bg-gray-50">
                            <button
                                onClick={() => setViewingDisease(null)}
                                className="px-6 py-2 bg-gray-800 text-white font-bold rounded-lg hover:bg-gray-900 transition-colors cursor-pointer"
                            >
                                Close Details
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* DISEASE GROUP / CATEGORY EDIT/CREATE MODAL */}
            {isGroupModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        {/* Group Modal Header */}
                        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800">
                                {editingGroup ? 'Edit Category Group' : 'Add Category Group'}
                            </h3>
                            <button onClick={() => setIsGroupModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Internal Language Pills */}
                        <div className="flex bg-gray-50 border-b border-gray-100 px-6">
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

                        <form onSubmit={handleGroupSubmit} className="p-6 space-y-4">
                            {/* TAB 1: GROUP ENGLISH DETAILS */}
                            {groupModalTab === 'en' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Group Name (English) *</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Digestive Disorders"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
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
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-center text-lg"
                                                value={groupFormData.icon_emoji}
                                                onChange={(e) => setGroupFormData({ ...groupFormData, icon_emoji: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Image Path / URL</label>
                                            <input
                                                type="text"
                                                placeholder="/images/hoof.png"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                                                value={groupFormData.image_path}
                                                onChange={(e) => setGroupFormData({ ...groupFormData, image_path: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Description (English)</label>
                                        <textarea
                                            rows={3}
                                            placeholder="Description of the category..."
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none resize-none focus:ring-2 focus:ring-emerald-500"
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
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                                            value={groupFormData.name_hi}
                                            onChange={(e) => setGroupFormData({ ...groupFormData, name_hi: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Description (Hindi / हिंदी)</label>
                                        <textarea
                                            rows={3}
                                            placeholder="इस श्रेणी में पशुओं के पाचन तंत्र से जुड़े रोगों की जानकारी है..."
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none resize-none focus:ring-2 focus:ring-emerald-500"
                                            value={groupFormData.description_hi}
                                            onChange={(e) => setGroupFormData({ ...groupFormData, description_hi: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Group Modal CTAs */}
                            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsGroupModalOpen(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer text-sm font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer text-sm font-medium"
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
