import { Calendar, CheckCircle, Loader2, RefreshCw, Search, Shield, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { getConsultations } from '../services/consultationsService';
import './AdminPages.css';

const VaccinationPage = () => {
    const [consults, setConsults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedConsult, setSelectedConsult] = useState<any>(null);

    const fetchData = async () => {
        try {
            const data = await getConsultations();
            const all = data?.summary || (Array.isArray(data) ? data : []);
            // Filter only vaccination type consultations
            const vacc = all.filter((c: any) => {
                const cat = (c.category || '').toLowerCase();
                const type = (c.type || c.consultation_type || '').toLowerCase();
                return cat.includes('vaccin') || cat.includes('vacc') || type.includes('vaccin');
            });
            setConsults(vacc);
        } catch (err) {
            console.error('Error fetching vaccinations:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleRefresh = () => { setRefreshing(true); fetchData(); };

    const filtered = useMemo(() => {
        let result = [...consults];
        if (statusFilter !== 'all') {
            if (statusFilter === 'completed') result = result.filter(c => ['COMPLETED', 'COMPLETED_NO_PRESCRIPTION'].includes(c.status));
            else if (statusFilter === 'pending') result = result.filter(c => ['PENDING', 'CONFIRMED'].includes(c.status));
            else if (statusFilter === 'cancelled') result = result.filter(c => ['CANCELLED', 'REJECTED'].includes(c.status));
        }
        if (searchTerm.trim()) {
            const q = searchTerm.toLowerCase();
            result = result.filter(c =>
                c.vet_name?.toLowerCase().includes(q) ||
                c.farmer_name?.toLowerCase().includes(q)
            );
        }
        return result;
    }, [consults, statusFilter, searchTerm]);

    const stats = useMemo(() => ({
        total: consults.length,
        completed: consults.filter(c => ['COMPLETED', 'COMPLETED_NO_PRESCRIPTION'].includes(c.status)).length,
        pending: consults.filter(c => ['PENDING', 'CONFIRMED'].includes(c.status)).length,
        cancelled: consults.filter(c => ['CANCELLED', 'REJECTED'].includes(c.status)).length,
        revenue: consults.reduce((s, c) => s + (c.total_paid || c.amount || 0), 0),
    }), [consults]);

    const getStatusStyle = (status: string) => {
        if (['COMPLETED', 'COMPLETED_NO_PRESCRIPTION'].includes(status)) return { bg: '#d1fae5', text: '#065f46', label: 'Completed' };
        if (['PENDING', 'CONFIRMED'].includes(status)) return { bg: '#fef3c7', text: '#92400e', label: status };
        if (['CANCELLED', 'REJECTED'].includes(status)) return { bg: '#fee2e2', text: '#991b1b', label: status };
        return { bg: '#f3f4f6', text: '#374151', label: status };
    };

    if (loading) return (
        <div className="ap-loading">
            <Loader2 className="ap-spin" size={36} color="#16a34a" />
            <p>Loading vaccination data...</p>
        </div>
    );

    return (
        <div className="ap-page">
            <div className="ap-header">
                <div>
                    <h1 className="ap-title">Vaccination Management</h1>
                    <p className="ap-subtitle">{filtered.length} of {consults.length} vaccination consultations</p>
                </div>
                <button className="ap-refresh-btn" onClick={handleRefresh} disabled={refreshing}>
                    <RefreshCw size={16} className={refreshing ? 'ap-spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* Stats */}
            <div className="ap-stats-grid">
                <div className="ap-stat-card">
                    <div className="ap-stat-icon" style={{ background: '#d1fae5' }}><Shield size={20} color="#059669" /></div>
                    <div><div className="ap-stat-value">{stats.total}</div><div className="ap-stat-label">Total</div></div>
                </div>
                <div className="ap-stat-card">
                    <div className="ap-stat-icon" style={{ background: '#d1fae5' }}><CheckCircle size={20} color="#059669" /></div>
                    <div><div className="ap-stat-value">{stats.completed}</div><div className="ap-stat-label">Completed</div></div>
                </div>
                <div className="ap-stat-card">
                    <div className="ap-stat-icon" style={{ background: '#fef3c7' }}><Calendar size={20} color="#d97706" /></div>
                    <div><div className="ap-stat-value">{stats.pending}</div><div className="ap-stat-label">Upcoming</div></div>
                </div>
                <div className="ap-stat-card">
                    <div className="ap-stat-icon" style={{ background: '#fee2e2' }}><XCircle size={20} color="#dc2626" /></div>
                    <div><div className="ap-stat-value">{stats.cancelled}</div><div className="ap-stat-label">Cancelled</div></div>
                </div>
                <div className="ap-stat-card">
                    <div className="ap-stat-icon" style={{ background: '#d1fae5' }}><span style={{ fontSize: 18 }}>₹</span></div>
                    <div><div className="ap-stat-value">₹{stats.revenue.toLocaleString()}</div><div className="ap-stat-label">Revenue</div></div>
                </div>
            </div>

            {/* Filters */}
            <div className="ap-filters-bar">
                <div className="ap-search-wrap">
                    <Search size={16} color="#9ca3af" />
                    <input
                        type="text"
                        placeholder="Search vet or farmer..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="ap-search-input"
                    />
                </div>
                <div className="ap-filter-group">
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="ap-select">
                        <option value="all">All Status</option>
                        <option value="pending">Upcoming / Pending</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="ap-table-wrap">
                <table className="ap-table">
                    <thead>
                        <tr>
                            <th>Vet</th>
                            <th>Farmer</th>
                            <th>Category</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Status</th>
                            <th>Amount</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan={8} className="ap-empty">No vaccination consultations found</td></tr>
                        ) : filtered.map(c => {
                            const s = getStatusStyle(c.status);
                            return (
                                <tr key={c.id} className="ap-row">
                                    <td className="ap-cell-bold">Dr. {c.vet_name || '—'}</td>
                                    <td>{c.farmer_name || '—'}</td>
                                    <td>
                                        <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 600 }}>
                                            💉 {c.category || 'Vaccination'}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: '0.85rem' }}>{c.date || '—'}</td>
                                    <td style={{ fontSize: '0.85rem', color: '#6b7280' }}>{c.time?.substring(0, 5) || '—'}</td>
                                    <td><span className="ap-badge" style={{ background: s.bg, color: s.text }}>{s.label}</span></td>
                                    <td className="ap-cell-money">₹{c.total_paid || c.amount || 0}</td>
                                    <td>
                                        <button className="ap-btn-sm ap-btn-primary" onClick={() => setSelectedConsult(c)}>View</button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Detail Modal */}
            {selectedConsult && (
                <div className="ap-modal-backdrop" onClick={() => setSelectedConsult(null)}>
                    <div className="ap-modal" onClick={e => e.stopPropagation()}>
                        <div className="ap-modal-header">
                            <h2>💉 Vaccination Details</h2>
                            <button className="ap-modal-close" onClick={() => setSelectedConsult(null)}>✕</button>
                        </div>
                        <div className="ap-modal-body">
                            {(() => {
                                const c = selectedConsult;
                                const s = getStatusStyle(c.status);
                                return (
                                    <div className="ap-detail-grid">
                                        <div className="ap-detail-row"><span>Status</span><span className="ap-badge" style={{ background: s.bg, color: s.text }}>{s.label}</span></div>
                                        <div className="ap-detail-row"><span>Vet</span><strong>Dr. {c.vet_name}</strong></div>
                                        <div className="ap-detail-row"><span>Farmer</span><strong>{c.farmer_name}</strong></div>
                                        <div className="ap-detail-row"><span>Category</span><strong>{c.category || 'Vaccination'}</strong></div>
                                        <div className="ap-detail-row"><span>Date</span><strong>{c.date}</strong></div>
                                        <div className="ap-detail-row"><span>Time</span><strong>{c.time?.substring(0, 5)}</strong></div>
                                        <div className="ap-detail-row"><span>Amount Paid</span><strong style={{ color: '#059669' }}>₹{c.total_paid || c.amount || 0}</strong></div>
                                        <div className="ap-detail-row"><span>Vet Earnings</span><strong>₹{c.vet_earnings || 0}</strong></div>
                                        <div className="ap-detail-row"><span>Platform Revenue</span><strong style={{ color: '#7c3aed' }}>₹{c.platform_revenue || 0}</strong></div>
                                        {c.id && <div className="ap-detail-row"><span>Consult ID</span><code style={{ fontSize: '0.72rem' }}>{c.id}</code></div>}
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VaccinationPage;
