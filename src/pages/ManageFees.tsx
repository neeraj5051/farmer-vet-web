import { Edit2, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { FeeConfig } from '../services/adminFeesService';
import { createFee, deleteFee, getFees, updateFee } from '../services/adminFeesService';

const ManageFees = () => {
    const [fees, setFees] = useState<FeeConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFee, setEditingFee] = useState<FeeConfig | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        fee_type: 'PERCENTAGE',
        category: 'SERVICE_FEE',
        value: 0,
        description: '',
        is_active: true
    });

    useEffect(() => {
        fetchFees();
    }, []);

    const fetchFees = async () => {
        try {
            const data = await getFees();
            setFees(data);
        } catch (error) {
            console.error("Failed to fetch fees", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingFee) {
                await updateFee(editingFee.id, {
                    ...formData,
                    fee_type: formData.fee_type as 'PERCENTAGE' | 'FIXED',
                    category: formData.category as 'SERVICE_FEE' | 'TAX'
                });
            } else {
                await createFee({
                    ...formData,
                    fee_type: formData.fee_type as 'PERCENTAGE' | 'FIXED',
                    category: formData.category as 'SERVICE_FEE' | 'TAX'
                });
            }
            setIsModalOpen(false);
            fetchFees();
            resetForm();
        } catch (error) {
            console.error("Failed to save fee", error);
            alert("Failed to save fee configuration");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this fee configuration?")) return;
        try {
            await deleteFee(id);
            fetchFees();
        } catch (error) {
            console.error("Failed to delete fee", error);
        }
    };

    const openEditModal = (fee: FeeConfig) => {
        setEditingFee(fee);
        setFormData({
            name: fee.name,
            fee_type: fee.fee_type,
            category: fee.category,
            value: fee.value,
            description: fee.description || '',
            is_active: fee.is_active
        });
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setEditingFee(null);
        setFormData({
            name: '',
            fee_type: 'PERCENTAGE',
            category: 'SERVICE_FEE',
            value: 0,
            description: '',
            is_active: true
        });
    };

    if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Fee Configuration</h1>
                    <p className="text-gray-500 mt-1">Manage platform fees, commissions, and taxes.</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                    <Plus size={20} className="mr-2" />
                    Add Fee Config
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-gray-700">Name</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Type</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Category</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Value</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {fees.map((fee) => (
                            <tr key={fee.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-800">
                                    {fee.name}
                                    {fee.description && <div className="text-xs text-gray-400 font-normal">{fee.description}</div>}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${fee.fee_type === 'PERCENTAGE' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                                        }`}>
                                        {fee.fee_type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-600 font-medium text-sm">{fee.category.replace('_', ' ')}</td>
                                <td className="px-6 py-4 font-bold text-gray-800">
                                    {fee.fee_type === 'PERCENTAGE' ? `${fee.value}%` : `₹${fee.value}`}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${fee.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {fee.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <button
                                        onClick={() => openEditModal(fee)}
                                        className="text-gray-400 hover:text-emerald-600 transition-colors"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(fee.id)}
                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {fees.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                                    No fee configurations found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800">
                                {editingFee ? 'Edit Fee Config' : 'Add New Fee'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                    placeholder="e.g. Platform Commission"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                    <select
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                        value={formData.fee_type}
                                        onChange={(e) => setFormData({ ...formData, fee_type: e.target.value })}
                                    >
                                        <option value="PERCENTAGE">Percentage (%)</option>
                                        <option value="FIXED">Fixed Amount (₹)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option value="SERVICE_FEE">Service Fee</option>
                                        <option value="TAX">Tax</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                    placeholder="0.00"
                                    value={formData.value}
                                    onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none"
                                    rows={3}
                                    placeholder="Optional description..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                />
                                <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">Active</label>
                            </div>

                            <div className="pt-4 flex justify-end space-x-3">
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
                                    {editingFee ? 'Update Fee' : 'Create Fee'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageFees;
