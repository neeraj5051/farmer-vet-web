import { Edit2, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { FeeConfig } from '../services/adminFeesService';
import { createFee, deleteFee, getFees, updateFee } from '../services/adminFeesService';
import './AdminPages.css';

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

    if (loading) return (
        <div className="ap-loading">
            <div className="ap-spin">⏳</div>
            <p>Loading fees...</p>
        </div>
    );

    return (
        <div className="ap-page">
            <div className="ap-header">
                <div>
                    <h1 className="ap-title">Fee Configuration</h1>
                    <p className="ap-subtitle">Manage platform fees, commissions, and taxes.</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="ap-add-btn"
                >
                    <Plus size={16} />
                    Add Fee Config
                </button>
            </div>

            <div className="ap-table-wrap">
                <table className="ap-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Type</th>
                            <th>Category</th>
                            <th>Value</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {fees.map((fee) => (
                            <tr key={fee.id} className="ap-row">
                                <td className="ap-cell-bold">
                                    {fee.name}
                                    {fee.description && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'normal', marginTop: '0.2rem' }}>{fee.description}</div>}
                                </td>
                                <td>
                                    <span className="ap-badge" style={{
                                        backgroundColor: fee.fee_type === 'PERCENTAGE' ? 'rgba(37, 99, 235, 0.12)' : 'rgba(139, 92, 246, 0.12)',
                                        color: fee.fee_type === 'PERCENTAGE' ? '#93c5fd' : '#c084fc',
                                        border: fee.fee_type === 'PERCENTAGE' ? '1px solid rgba(37, 99, 235, 0.2)' : '1px solid rgba(139, 92, 246, 0.2)'
                                    }}>
                                        {fee.fee_type}
                                    </span>
                                </td>
                                <td style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{fee.category.replace('_', ' ')}</td>
                                <td className="ap-cell-bold" style={{ color: 'var(--text-primary)' }}>
                                    {fee.fee_type === 'PERCENTAGE' ? `${fee.value}%` : `₹${fee.value}`}
                                </td>
                                <td>
                                    <span className="ap-badge" style={{
                                        backgroundColor: fee.is_active ? 'var(--accent-green-glow)' : 'rgba(255, 255, 255, 0.05)',
                                        color: fee.is_active ? 'var(--accent-green)' : 'var(--text-secondary)',
                                        border: fee.is_active ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid var(--border-glass)'
                                    }}>
                                        {fee.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                        <button
                                            onClick={() => openEditModal(fee)}
                                            className="ap-btn-sm ap-btn-outline"
                                            style={{ padding: '0.35rem 0.6rem' }}
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(fee.id)}
                                            className="ap-btn-sm ap-btn-danger"
                                            style={{ padding: '0.35rem 0.6rem' }}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {fees.length === 0 && (
                            <tr>
                                <td colSpan={6} className="ap-empty">
                                    No fee configurations found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="ap-modal-backdrop" onClick={() => setIsModalOpen(false)}>
                    <div className="ap-modal" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
                        <div className="ap-modal-header">
                            <h2>{editingFee ? 'Edit Fee Config' : 'Add New Fee'}</h2>
                            <button className="ap-modal-close" onClick={() => setIsModalOpen(false)}>
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="ap-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div className="ap-form-group" style={{ marginBottom: 0 }}>
                                    <label className="ap-label">Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="ap-input"
                                        placeholder="e.g. Platform Commission"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="ap-form-group" style={{ marginBottom: 0 }}>
                                        <label className="ap-label">Type</label>
                                        <select
                                            className="ap-form-select"
                                            value={formData.fee_type}
                                            onChange={(e) => setFormData({ ...formData, fee_type: e.target.value })}
                                        >
                                            <option value="PERCENTAGE">Percentage (%)</option>
                                            <option value="FIXED">Fixed Amount (₹)</option>
                                        </select>
                                    </div>
                                    <div className="ap-form-group" style={{ marginBottom: 0 }}>
                                        <label className="ap-label">Category</label>
                                        <select
                                            className="ap-form-select"
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        >
                                            <option value="SERVICE_FEE">Service Fee</option>
                                            <option value="TAX">Tax</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="ap-form-group" style={{ marginBottom: 0 }}>
                                    <label className="ap-label">Value</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        className="ap-input"
                                        placeholder="0.00"
                                        value={formData.value}
                                        onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>

                                <div className="ap-form-group" style={{ marginBottom: 0 }}>
                                    <label className="ap-label">Description</label>
                                    <textarea
                                        className="ap-textarea"
                                        rows={3}
                                        placeholder="Optional description..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                <div className="ap-switch-row">
                                    <span className="ap-label" style={{ marginBottom: 0 }}>Active</span>
                                    <label className="ap-switch">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_active}
                                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                        />
                                        <span className="ap-switch-slider" />
                                    </label>
                                </div>
                            </div>

                            <div className="ap-modal-footer">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="ap-btn-sm ap-btn-outline"
                                    style={{ padding: '0.5rem 1rem' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="ap-btn-sm ap-btn-primary"
                                    style={{ padding: '0.5rem 1.25rem' }}
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
