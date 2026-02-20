import { Ban, Check, Loader2, UserCheck, Users, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { approveVet, blockUser, getFarmers, getVets } from '../services/adminService';

const UsersPage = () => {
    const [activeTab, setActiveTab] = useState<'vets' | 'farmers'>('vets');
    const [vets, setVets] = useState<any[]>([]);
    const [farmers, setFarmers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<any>(null);

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
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: activeTab === id ? '#dcfce7' : 'transparent',
                color: activeTab === id ? '#166534' : '#6b7280',
                borderBottom: activeTab === id ? '2px solid #16a34a' : '2px solid transparent',
                borderRadius: '0.5rem 0.5rem 0 0',
                fontWeight: 600
            }}
        >
            <Icon size={18} />
            {label}
        </button>
    );

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 className="text-2xl font-bold text-gray-800" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>User Management</h1>
                <input
                    type="text"
                    placeholder="Search by name or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '0.375rem',
                        border: '1px solid #d1d5db',
                        width: '300px'
                    }}
                />
            </div>

            <div style={{ borderBottom: '1px solid #e5e7eb', display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <TabButton id="vets" label="Veterinarians" icon={UserCheck} />
                <TabButton id="farmers" label="Farmers" icon={Users} />
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                    <Loader2 className="animate-spin" size={32} color="#16a34a" />
                </div>
            ) : (
                <div style={{ background: 'white', borderRadius: '0.5rem', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                            <tr>
                                <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Name</th>
                                <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Phone</th>
                                <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Status</th>
                                <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#111827', fontWeight: 500 }}>
                                        {user.first_name} {user.last_name}
                                    </td>
                                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                                        {user.phone}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        {activeTab === 'vets' ? (
                                            <span style={{
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '9999px',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                backgroundColor: user.verification_status === 'verified' ? '#d1fae5' : user.verification_status === 'rejected' ? '#fee2e2' : '#fef3c7',
                                                color: user.verification_status === 'verified' ? '#065f46' : user.verification_status === 'rejected' ? '#991b1b' : '#92400e'
                                            }}>
                                                {user.verification_status}
                                            </span>
                                        ) : (
                                            <span style={{
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '9999px',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                backgroundColor: user.is_active ? '#d1fae5' : '#fee2e2',
                                                color: user.is_active ? '#065f46' : '#991b1b'
                                            }}>
                                                {user.is_active ? 'Active' : 'Blocked'}
                                            </span>
                                        )}
                                    </td>
                                    <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => setSelectedUser(user)} style={{ padding: '0.25rem 0.5rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px' }} title="View Details">
                                            Info
                                        </button>
                                        {activeTab === 'vets' && user.verification_status === 'pending' && (
                                            <>
                                                <button onClick={() => handleApprove(user.id, 'verified')} style={{ padding: '0.25rem 0.5rem', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '4px' }} title="Approve">
                                                    <Check size={16} />
                                                </button>
                                                <button onClick={() => handleApprove(user.id, 'rejected')} style={{ padding: '0.25rem 0.5rem', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '4px' }} title="Reject">
                                                    <X size={16} />
                                                </button>
                                            </>
                                        )}
                                        <button onClick={() => handleBlock(user.id, user.is_active)} style={{ padding: '0.25rem 0.5rem', backgroundColor: user.is_active ? '#ef4444' : '#22c55e', color: 'white', border: 'none', borderRadius: '4px' }} title={user.is_active ? "Block" : "Activate"}>
                                            <Ban size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>
                                        No users found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedUser && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '0.5rem', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>User Details</h2>
                            <button onClick={() => setSelectedUser(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                                <X size={24} color="#6b7280" />
                            </button>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <strong>ID:</strong> <span style={{ color: '#4b5563', fontSize: '0.875rem' }}>{selectedUser.id}</span>
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <strong>Name:</strong> {selectedUser.first_name} {selectedUser.last_name}
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <strong>Phone:</strong> {selectedUser.phone}
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <strong>Joined:</strong> {new Date(selectedUser.created_at).toLocaleDateString()}
                        </div>

                        {activeTab === 'vets' && (
                            <>
                                <div style={{ borderTop: '1px solid #e5e7eb', margin: '1rem 0' }}></div>
                                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Profile</h3>
                                <div style={{ marginBottom: '0.5rem' }}><strong>Qualification:</strong> {selectedUser.qualification || 'N/A'}</div>
                                <div style={{ marginBottom: '0.5rem' }}><strong>Specialization:</strong> {selectedUser.specialization || 'N/A'}</div>
                                <div style={{ marginBottom: '0.5rem' }}><strong>Experience:</strong> {selectedUser.years_of_experience || 0} years</div>
                                <div style={{ marginBottom: '0.5rem' }}><strong>License:</strong> {selectedUser.license_number || 'N/A'}</div>
                                <div style={{ marginBottom: '0.5rem' }}><strong>Location:</strong> {selectedUser.base_location || 'N/A'}</div>
                                <div style={{ marginBottom: '0.5rem' }}><strong>Commission:</strong> {selectedUser.commission_rate}%</div>
                            </>
                        )}

                        {activeTab === 'farmers' && (
                            <>
                                <div style={{ borderTop: '1px solid #e5e7eb', margin: '1rem 0' }}></div>
                                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Farm Details</h3>
                                <div style={{ marginBottom: '0.5rem' }}><strong>Village:</strong> {selectedUser.village || 'N/A'}</div>
                                <div style={{ marginBottom: '0.5rem' }}><strong>District:</strong> {selectedUser.district || 'N/A'}</div>
                                <div style={{ marginBottom: '0.5rem' }}><strong>State:</strong> {selectedUser.state || 'N/A'}</div>
                                <div style={{ marginBottom: '0.5rem' }}><strong>Pincode:</strong> {selectedUser.pincode || 'N/A'}</div>
                                <div style={{ marginBottom: '0.5rem' }}><strong>Language:</strong> {selectedUser.preferred_language || 'N/A'}</div>
                            </>
                        )}

                        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                            <button onClick={() => setSelectedUser(null)} style={{ padding: '0.5rem 1rem', backgroundColor: '#e5e7eb', borderRadius: '0.25rem', border: 'none', fontWeight: 500 }}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersPage;
