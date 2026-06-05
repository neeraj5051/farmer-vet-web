import { Ban, Check, Loader2, UserCheck, Users, X, Edit } from 'lucide-react';
import { useEffect, useState } from 'react';
import { approveVet, blockUser, getFarmers, getVets, updateVetProfile, updateFarmerProfile } from '../services/adminService';
import './AdminPages.css';

const UsersPage = () => {
    const [activeTab, setActiveTab] = useState<'vets' | 'farmers'>('vets');
    const [vets, setVets] = useState<any[]>([]);
    const [farmers, setFarmers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [editForm, setEditForm] = useState<any>({});
    const [saving, setSaving] = useState(false);

    const startEdit = (user: any) => {
        setEditingUser(user);
        if (activeTab === 'vets') {
            setEditForm({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                phone: user.phone || '',
                qualification: user.qualification || '',
                specialization: user.specialization || '',
                years_of_experience: user.years_of_experience || 0,
                license_number: user.license_number || '',
                registration_state: user.registration_state || '',
                base_location: user.base_location || '',
                is_active: user.is_active ?? true
            });
        } else {
            setEditForm({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                phone: user.phone || '',
                alternate_phone: user.alternate_phone || '',
                preferred_language: user.preferred_language || 'en',
                village: user.village || '',
                district: user.district || '',
                state: user.state || '',
                pincode: user.pincode || '',
                is_active: user.is_active ?? true
            });
        }
    };

    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editForm.first_name?.trim()) {
            alert('First Name is required');
            return;
        }
        setSaving(true);
        try {
            if (activeTab === 'vets') {
                await updateVetProfile(editingUser.id, {
                    ...editForm,
                    years_of_experience: Number(editForm.years_of_experience)
                });
            } else {
                await updateFarmerProfile(editingUser.id, editForm);
            }
            alert('Profile updated successfully');
            setEditingUser(null);
            fetchData();
        } catch (error: any) {
            alert(error?.response?.data?.detail || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [vetsData, farmersData] = await Promise.all([
                getVets(),
                getFarmers()
            ]);
            setVets(vetsData);
            setFarmers(farmersData);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleApprove = async (id: string, status: 'verified' | 'rejected') => {
        if (!window.confirm(`Are you sure you want to ${status} this vet?`)) return;
        try {
            await approveVet(id, status);
            fetchData();
        } catch (error) {
            alert('Action failed');
        }
    };

    const handleBlock = async (id: string, currentStatus: boolean) => {
        if (!window.confirm(`Are you sure you want to ${currentStatus ? 'block' : 'activate'} this user?`)) return;
        try {
            await blockUser(id, !currentStatus);
            fetchData();
        } catch (error) {
            alert('Action failed');
        }
    };

    const filteredUsers = (activeTab === 'vets' ? vets : farmers).filter(user =>
        user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.includes(searchTerm)
    );

    const TabButton = ({ id, label, icon: Icon }: any) => (
        <button
            onClick={() => { setActiveTab(id); setSearchTerm(''); }}
            className={`ap-tab ${activeTab === id ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}
        >
            <Icon size={18} />
            {label}
        </button>
    );

    return (
        <div className="ap-page">
            <div className="ap-header">
                <div>
                    <h1 className="ap-title">User Management</h1>
                    <p className="ap-subtitle">Manage and verify platform veterinarians and farmers.</p>
                </div>
                <div className="ap-search-wrap" style={{ maxWidth: '300px' }}>
                    <input
                        type="text"
                        placeholder="Search by name or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="ap-search-input"
                    />
                </div>
            </div>

            <div className="ap-tabs">
                <TabButton id="vets" label="Veterinarians" icon={UserCheck} />
                <TabButton id="farmers" label="Farmers" icon={Users} />
            </div>

            {loading ? (
                <div className="ap-loading">
                    <Loader2 className="ap-spin" size={32} color="#16a34a" />
                    <p>Loading users...</p>
                </div>
            ) : (
                <div className="ap-table-wrap">
                    <table className="ap-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Phone</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="ap-row">
                                    <td className="ap-cell-bold">
                                        {user.first_name} {user.last_name}
                                    </td>
                                    <td style={{ color: 'var(--text-secondary)' }}>
                                        {user.phone}
                                    </td>
                                    <td>
                                        {activeTab === 'vets' ? (
                                            <span className="ap-badge" style={{
                                                backgroundColor: user.verification_status === 'verified' ? 'var(--accent-green-glow)' : user.verification_status === 'rejected' ? 'rgba(220, 38, 38, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                                                color: user.verification_status === 'verified' ? 'var(--accent-green)' : user.verification_status === 'rejected' ? '#f87171' : '#fde68a',
                                                border: user.verification_status === 'verified' ? '1px solid rgba(16, 185, 129, 0.2)' : user.verification_status === 'rejected' ? '1px solid rgba(220, 38, 38, 0.2)' : '1px solid rgba(245, 158, 11, 0.2)'
                                            }}>
                                                {user.verification_status}
                                            </span>
                                        ) : (
                                            <span className="ap-badge" style={{
                                                backgroundColor: user.is_active ? 'var(--accent-green-glow)' : 'rgba(220, 38, 38, 0.12)',
                                                color: user.is_active ? 'var(--accent-green)' : '#f87171',
                                                border: user.is_active ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(220, 38, 38, 0.2)'
                                            }}>
                                                {user.is_active ? 'Active' : 'Blocked'}
                                            </span>
                                        )}
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                            <button onClick={() => setSelectedUser(user)} className="ap-btn-sm ap-btn-info" title="View Details">
                                                Info
                                            </button>
                                            <button onClick={() => startEdit(user)} className="ap-btn-sm ap-btn-warning" title="Edit Profile">
                                                <Edit size={14} /> Edit
                                            </button>
                                            {activeTab === 'vets' && user.verification_status === 'pending' && (
                                                <>
                                                    <button onClick={() => handleApprove(user.id, 'verified')} className="ap-btn-sm ap-btn-primary" title="Approve">
                                                        <Check size={16} />
                                                    </button>
                                                    <button onClick={() => handleApprove(user.id, 'rejected')} className="ap-btn-sm ap-btn-danger" title="Reject">
                                                        <X size={16} />
                                                    </button>
                                                </>
                                            )}
                                            <button onClick={() => handleBlock(user.id, user.is_active)} className="ap-btn-sm ap-btn-outline" style={{ color: user.is_active ? '#f87171' : 'var(--accent-green)' }} title={user.is_active ? "Block" : "Activate"}>
                                                <Ban size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="ap-empty">
                                        No users found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Info Modal */}
            {selectedUser && (
                <div className="ap-modal-backdrop" onClick={() => setSelectedUser(null)}>
                    <div className="ap-modal" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
                        <div className="ap-modal-header">
                            <h2>User Details</h2>
                            <button className="ap-modal-close" onClick={() => setSelectedUser(null)}>
                                <X size={16} />
                            </button>
                        </div>
                        <div className="ap-modal-body">
                            <div className="ap-detail-grid">
                                <div className="ap-detail-row">
                                    <span>ID</span>
                                    <strong style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>{selectedUser.id}</strong>
                                </div>
                                <div className="ap-detail-row">
                                    <span>Name</span>
                                    <strong>{selectedUser.first_name} {selectedUser.last_name}</strong>
                                </div>
                                <div className="ap-detail-row">
                                    <span>Phone</span>
                                    <strong>{selectedUser.phone}</strong>
                                </div>
                                <div className="ap-detail-row">
                                    <span>Joined</span>
                                    <strong>{new Date(selectedUser.created_at).toLocaleDateString()}</strong>
                                </div>

                                {activeTab === 'vets' && (
                                    <>
                                        <div className="ap-detail-row"><span>Qualification</span><strong>{selectedUser.qualification || 'N/A'}</strong></div>
                                        <div className="ap-detail-row"><span>Specialization</span><strong>{selectedUser.specialization || 'N/A'}</strong></div>
                                        <div className="ap-detail-row"><span>Experience</span><strong>{selectedUser.years_of_experience || 0} years</strong></div>
                                        <div className="ap-detail-row"><span>License</span><strong>{selectedUser.license_number || 'N/A'}</strong></div>
                                        <div className="ap-detail-row"><span>Location</span><strong>{selectedUser.base_location || 'N/A'}</strong></div>
                                        <div className="ap-detail-row"><span>Commission</span><strong>{selectedUser.commission_rate}%</strong></div>
                                    </>
                                )}

                                {activeTab === 'farmers' && (
                                    <>
                                        <div className="ap-detail-row"><span>Village</span><strong>{selectedUser.village || 'N/A'}</strong></div>
                                        <div className="ap-detail-row"><span>District</span><strong>{selectedUser.district || 'N/A'}</strong></div>
                                        <div className="ap-detail-row"><span>State</span><strong>{selectedUser.state || 'N/A'}</strong></div>
                                        <div className="ap-detail-row"><span>Pincode</span><strong>{selectedUser.pincode || 'N/A'}</strong></div>
                                        <div className="ap-detail-row"><span>Language</span><strong>{selectedUser.preferred_language || 'N/A'}</strong></div>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="ap-modal-footer">
                            <button onClick={() => setSelectedUser(null)} className="ap-btn-sm ap-btn-outline" style={{ padding: '0.5rem 1.25rem' }}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editingUser && (
                <div className="ap-modal-backdrop" onClick={() => setEditingUser(null)}>
                    <div className="ap-modal" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
                        <div className="ap-modal-header">
                            <h2>Edit {activeTab === 'vets' ? 'Veterinarian' : 'Farmer'} Profile</h2>
                            <button className="ap-modal-close" onClick={() => setEditingUser(null)}><X size={16} /></button>
                        </div>
                        <form onSubmit={handleSaveEdit}>
                            <div className="ap-modal-body">
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                    <div className="ap-form-group" style={{ marginBottom: 0 }}>
                                        <label className="ap-label">First Name *</label>
                                        <input
                                            className="ap-input"
                                            required
                                            value={editForm.first_name || ''}
                                            onChange={e => setEditForm({ ...editForm, first_name: e.target.value })}
                                        />
                                    </div>
                                    <div className="ap-form-group" style={{ marginBottom: 0 }}>
                                        <label className="ap-label">Last Name</label>
                                        <input
                                            className="ap-input"
                                            value={editForm.last_name || ''}
                                            onChange={e => setEditForm({ ...editForm, last_name: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="ap-form-group">
                                    <label className="ap-label">Phone *</label>
                                    <input
                                        className="ap-input"
                                        required
                                        value={editForm.phone || ''}
                                        onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                                    />
                                </div>

                                {activeTab === 'vets' ? (
                                    <>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                            <div className="ap-form-group" style={{ marginBottom: 0 }}>
                                                <label className="ap-label">Qualification</label>
                                                <input
                                                    className="ap-input"
                                                    value={editForm.qualification || ''}
                                                    onChange={e => setEditForm({ ...editForm, qualification: e.target.value })}
                                                    placeholder="e.g. BVSc & AH"
                                                />
                                            </div>
                                            <div className="ap-form-group" style={{ marginBottom: 0 }}>
                                                <label className="ap-label">Specialization</label>
                                                <input
                                                    className="ap-input"
                                                    value={editForm.specialization || ''}
                                                    onChange={e => setEditForm({ ...editForm, specialization: e.target.value })}
                                                    placeholder="e.g. Surgery, General"
                                                />
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                            <div className="ap-form-group" style={{ marginBottom: 0 }}>
                                                <label className="ap-label">Years of Experience</label>
                                                <input
                                                    type="number"
                                                    className="ap-input"
                                                    value={editForm.years_of_experience ?? 0}
                                                    onChange={e => setEditForm({ ...editForm, years_of_experience: parseInt(e.target.value) || 0 })}
                                                />
                                            </div>
                                            <div className="ap-form-group" style={{ marginBottom: 0 }}>
                                                <label className="ap-label">License Number</label>
                                                <input
                                                    className="ap-input"
                                                    value={editForm.license_number || ''}
                                                    onChange={e => setEditForm({ ...editForm, license_number: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                            <div className="ap-form-group" style={{ marginBottom: 0 }}>
                                                <label className="ap-label">Registration State</label>
                                                <input
                                                    className="ap-input"
                                                    value={editForm.registration_state || ''}
                                                    onChange={e => setEditForm({ ...editForm, registration_state: e.target.value })}
                                                />
                                            </div>
                                            <div className="ap-form-group" style={{ marginBottom: 0 }}>
                                                <label className="ap-label">Base Location</label>
                                                <input
                                                    className="ap-input"
                                                    value={editForm.base_location || ''}
                                                    onChange={e => setEditForm({ ...editForm, base_location: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                            <div className="ap-form-group" style={{ marginBottom: 0 }}>
                                                <label className="ap-label">Alternate Phone</label>
                                                <input
                                                    className="ap-input"
                                                    value={editForm.alternate_phone || ''}
                                                    onChange={e => setEditForm({ ...editForm, alternate_phone: e.target.value })}
                                                />
                                            </div>
                                            <div className="ap-form-group" style={{ marginBottom: 0 }}>
                                                <label className="ap-label">Preferred Language</label>
                                                <select
                                                    className="ap-form-select"
                                                    value={editForm.preferred_language || 'en'}
                                                    onChange={e => setEditForm({ ...editForm, preferred_language: e.target.value })}
                                                >
                                                    <option value="en">English</option>
                                                    <option value="hi">Hindi</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                            <div className="ap-form-group" style={{ marginBottom: 0 }}>
                                                <label className="ap-label">Village</label>
                                                <input
                                                    className="ap-input"
                                                    value={editForm.village || ''}
                                                    onChange={e => setEditForm({ ...editForm, village: e.target.value })}
                                                />
                                            </div>
                                            <div className="ap-form-group" style={{ marginBottom: 0 }}>
                                                <label className="ap-label">District</label>
                                                <input
                                                    className="ap-input"
                                                    value={editForm.district || ''}
                                                    onChange={e => setEditForm({ ...editForm, district: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                            <div className="ap-form-group" style={{ marginBottom: 0 }}>
                                                <label className="ap-label">State</label>
                                                <input
                                                    className="ap-input"
                                                    value={editForm.state || ''}
                                                    onChange={e => setEditForm({ ...editForm, state: e.target.value })}
                                                />
                                            </div>
                                            <div className="ap-form-group" style={{ marginBottom: 0 }}>
                                                <label className="ap-label">Pincode</label>
                                                <input
                                                    className="ap-input"
                                                    value={editForm.pincode || ''}
                                                    onChange={e => setEditForm({ ...editForm, pincode: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="ap-switch-row" style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '1rem', marginTop: '1rem' }}>
                                    <span className="ap-label" style={{ marginBottom: 0 }}>Account Active / Enabled</span>
                                    <label className="ap-switch">
                                        <input
                                            type="checkbox"
                                            checked={editForm.is_active ?? true}
                                            onChange={e => setEditForm({ ...editForm, is_active: e.target.checked })}
                                        />
                                        <span className="ap-switch-slider" />
                                    </label>
                                </div>
                            </div>
                            <div className="ap-modal-footer">
                                <button type="button" className="ap-btn-sm ap-btn-outline" onClick={() => setEditingUser(null)}>
                                    Cancel
                                </button>
                                <button type="submit" className="ap-btn-sm ap-btn-primary" disabled={saving}>
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersPage;
