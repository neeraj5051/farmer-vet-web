import { Edit2, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Disease } from '../services/diseaseService';
import { createDisease, deleteDisease, getDiseases, updateDisease } from '../services/diseaseService';

const ManageDiseases = () => {
    const [diseases, setDiseases] = useState<Disease[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDisease, setEditingDisease] = useState<Disease | null>(null);
    const [viewingDisease, setViewingDisease] = useState<Disease | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        category: 'Viral',
        description: '',
        body_system: 'Respiratory',
        disease_type: 'Infectious',
        species: 'Cattle',
        symptoms: '', // Comma separated for input
        causes: '',
        treatments: '',
        pathogen_type: 'Virus',
        pathogen_name: '',
        severity_level: 1,
        image_path: ''
    });

    useEffect(() => {
        fetchDiseases();
    }, []);

    const fetchDiseases = async () => {
        try {
            const data = await getDiseases();
            setDiseases(data);
        } catch (error) {
            console.error("Failed to fetch diseases", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Convert comma-separated strings to arrays
        const payload = {
            ...formData,
            symptoms: formData.symptoms.split(',').map(s => s.trim()).filter(Boolean),
            causes: formData.causes.split(',').map(s => s.trim()).filter(Boolean),
            treatments: formData.treatments.split(',').map(s => s.trim()).filter(Boolean),
            severity_level: Number(formData.severity_level)
        };

        try {
            if (editingDisease) {
                await updateDisease(editingDisease.id, payload);
            } else {
                await createDisease(payload);
            }
            setIsModalOpen(false);
            fetchDiseases();
            resetForm();
        } catch (error) {
            console.error("Failed to save disease", error);
            alert("Failed to save disease");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this disease?")) return;
        try {
            await deleteDisease(id);
            fetchDiseases();
        } catch (error) {
            console.error("Failed to delete disease", error);
        }
    };

    const openEditModal = (disease: Disease) => {
        setEditingDisease(disease);
        setFormData({
            name: disease.name,
            category: disease.category || 'Viral',
            description: disease.description || '',
            body_system: disease.body_system || '',
            disease_type: disease.disease_type || '',
            species: disease.species || '',
            symptoms: (disease.symptoms || []).join(', '),
            causes: (disease.causes || []).join(', '),
            treatments: (disease.treatments || []).join(', '),
            pathogen_type: disease.pathogen_type || '',
            pathogen_name: disease.pathogen_name || '',
            severity_level: disease.severity_level || 1,
            image_path: disease.image_path || ''
        });
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setEditingDisease(null);
        setFormData({
            name: '',
            category: 'Viral',
            description: '',
            body_system: 'Respiratory',
            disease_type: 'Infectious',
            species: 'Cattle',
            symptoms: '',
            causes: '',
            treatments: '',
            pathogen_type: 'Virus',
            pathogen_name: '',
            severity_level: 1,
            image_path: ''
        });
    };

    if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Disease Management</h1>
                    <p className="text-gray-500 mt-1">Manage veterinary disease database.</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                    <Plus size={20} className="mr-2" />
                    Add Disease
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-gray-700">Name</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Category</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">System</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Pathogen</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Severity</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {diseases.map((disease) => (
                            <tr
                                key={disease.id}
                                className="hover:bg-gray-50 transition-colors cursor-pointer"
                                onClick={() => setViewingDisease(disease)}
                            >
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-800">{disease.name}</div>
                                    <div className="text-xs text-gray-400 line-clamp-1 max-w-xs">{disease.description}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">
                                        {disease.category}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">{disease.body_system}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {disease.pathogen_name}
                                    <span className="text-xs text-gray-400 block">{disease.pathogen_type}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <div key={i} className={`w-2 h-2 rounded-full mx-0.5 ${i < disease.severity_level ? 'bg-red-500' : 'bg-gray-200'}`} />
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); openEditModal(disease); }}
                                        className="text-gray-400 hover:text-emerald-600 transition-colors"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(disease.id); }}
                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {diseases.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                                    No diseases found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                            <h3 className="text-lg font-bold text-gray-800">
                                {editingDisease ? 'Edit Disease' : 'Add New Disease'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Body System</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                        value={formData.body_system}
                                        onChange={(e) => setFormData({ ...formData, body_system: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Species</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                        value={formData.species}
                                        onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Pathogen Type</label>
                                    <select
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Pathogen Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                        value={formData.pathogen_name}
                                        onChange={(e) => setFormData({ ...formData, pathogen_name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Symptoms (comma separated)</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                    placeholder="Fever, Cough, Lethargy"
                                    value={formData.symptoms}
                                    onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Treatments (comma separated)</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                    placeholder="Antibiotics, Rest, Hydration"
                                    value={formData.treatments}
                                    onChange={(e) => setFormData({ ...formData, treatments: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Severity (1-5)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="5"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                    value={formData.severity_level}
                                    onChange={(e) => setFormData({ ...formData, severity_level: parseInt(e.target.value) })}
                                />
                            </div>

                            <div className="pt-4 flex justify-end space-x-3 sticky bottom-0 bg-white border-t border-gray-100 mt-4 py-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
                                >
                                    {editingDisease ? 'Update Disease' : 'Create Disease'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Detail Modal */}
            {viewingDisease && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center px-8 py-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800">{viewingDisease.name}</h3>
                                <div className="flex space-x-2 mt-1">
                                    <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-xs font-bold rounded-full uppercase">
                                        {viewingDisease.category}
                                    </span>
                                    <span className="px-2.5 py-0.5 bg-gray-100 text-gray-800 text-xs font-bold rounded-full uppercase">
                                        {viewingDisease.species}
                                    </span>
                                </div>
                            </div>
                            <button onClick={() => setViewingDisease(null)} className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-8 space-y-8">
                            {/* Description */}
                            <section>
                                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Description</h4>
                                <p className="text-gray-700 leading-relaxed text-lg">{viewingDisease.description}</p>
                                {viewingDisease.description_hi && (
                                    <p className="text-gray-500 mt-2 italic">{viewingDisease.description_hi}</p>
                                )}
                            </section>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Details */}
                                <section className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Core Info</h4>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Body System</span>
                                            <span className="font-semibold text-gray-800">{viewingDisease.body_system}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Disease Type</span>
                                            <span className="font-semibold text-gray-800">{viewingDisease.disease_type}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Pathogen Type</span>
                                            <span className="font-semibold text-gray-800">{viewingDisease.pathogen_type}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Pathogen Name</span>
                                            <span className="font-semibold text-gray-800">{viewingDisease.pathogen_name}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-500">Severity Level</span>
                                            <div className="flex space-x-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className={`w-3 h-3 rounded-full ${i < viewingDisease.severity_level ? 'bg-red-500' : 'bg-gray-200'}`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Symptoms */}
                                <section className="bg-emerald-50 p-6 rounded-xl border border-emerald-100">
                                    <h4 className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-4">Symptoms</h4>
                                    <ul className="space-y-2">
                                        {viewingDisease.symptoms.map((s, i) => (
                                            <li key={i} className="flex items-start text-emerald-800">
                                                <span className="text-emerald-500 mr-2">•</span>
                                                <span>{s}</span>
                                            </li>
                                        ))}
                                        {viewingDisease.symptoms.length === 0 && <li className="text-gray-400 italic">No symptoms listed</li>}
                                    </ul>
                                </section>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Causes */}
                                <section className="bg-orange-50 p-6 rounded-xl border border-orange-100">
                                    <h4 className="text-sm font-bold text-orange-600 uppercase tracking-wider mb-4">Causes</h4>
                                    <ul className="space-y-2">
                                        {viewingDisease.causes.map((c, i) => (
                                            <li key={i} className="flex items-start text-orange-800">
                                                <span className="text-orange-500 mr-2">•</span>
                                                <span>{c}</span>
                                            </li>
                                        ))}
                                        {viewingDisease.causes.length === 0 && <li className="text-gray-400 italic">No causes listed</li>}
                                    </ul>
                                </section>

                                {/* Treatments */}
                                <section className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                                    <h4 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-4">Treatments</h4>
                                    <ul className="space-y-2">
                                        {viewingDisease.treatments.map((t, i) => (
                                            <li key={i} className="flex items-start text-blue-800">
                                                <span className="text-blue-500 mr-2">•</span>
                                                <span>{t}</span>
                                            </li>
                                        ))}
                                        {viewingDisease.treatments.length === 0 && <li className="text-gray-400 italic">No treatments listed</li>}
                                    </ul>
                                </section>
                            </div>
                        </div>

                        <div className="p-8 border-t border-gray-100 flex justify-end bg-gray-50">
                            <button
                                onClick={() => setViewingDisease(null)}
                                className="px-6 py-2 bg-gray-800 text-white font-bold rounded-lg hover:bg-gray-900 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageDiseases;
