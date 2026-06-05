import { Calendar, CheckCircle, Clock, Filter, Loader2, RefreshCw, Search, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { getConsultations } from '../services/consultationsService';
import './AdminPages.css';

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
    COMPLETED: { bg: '#d1fae5', text: '#065f46', label: 'Completed' },
    COMPLETED_NO_PRESCRIPTION: { bg: '#a7f3d0', text: '#065f46', label: 'Completed (No Rx)' },
    IN_PROGRESS: { bg: '#dbeafe', text: '#1e40af', label: 'In Progress' },
    CONFIRMED: { bg: '#fef3c7', text: '#92400e', label: 'Confirmed' },
    AWAITING_PAYMENT: { bg: '#ede9fe', text: '#5b21b6', label: 'Awaiting Payment' },
    PENDING: { bg: '#fef3c7', text: '#92400e', label: 'Pending' },
    CANCELLED: { bg: '#fee2e2', text: '#991b1b', label: 'Cancelled' },
    REJECTED: { bg: '#fee2e2', text: '#991b1b', label: 'Rejected' },
    NO_SHOW: { bg: '#fde8d8', text: '#7c2d12', label: 'No Show' },
    NO_SHOW_VET: { bg: '#fde8d8', text: '#7c2d12', label: 'No Show (Vet)' },
    NO_SHOW_FARMER: { bg: '#fde8d8', text: '#7c2d12', label: 'No Show (Farmer)' },
};

const getTypeLabel = (type: string, category?: string) => {
    const lowerCat = (category || '').toLowerCase();
    const lowerType = (type || '').toLowerCase();
    if (lowerCat.includes('ai') || lowerCat.includes('artificial')) return { label: 'AI / Insemination', icon: '🔬', color: '#7c3aed' };
    if (lowerCat.includes('vaccin')) return { label: 'Vaccination', icon: '💉', color: '#059669' };
    if (lowerType.includes('video') || lowerType.includes('phone') || lowerType.includes('online')) return { label: 'Online', icon: '📹', color: '#2563eb' };
    return { label: 'In-Person Visit', icon: '🏥', color: '#d97706' };
};

const Consultations = () => {
    const [consults, setConsults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [periodFilter, setPeriodFilter] = useState<string>('last_30d');
    const [selectedConsult, setSelectedConsult] = useState<any>(null);

    const fetchData = async () => {
        try {
            const data = await getConsultations();
            const list = data?.summary || (Array.isArray(data) ? data : []);
            setConsults(list);
        } catch (err) {
            console.error('Error fetching consultations:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleRefresh = () => { setRefreshing(true); fetchData(); };

    const filtered = useMemo(() => {
        let result = [...consults];
        const now = new Date();

        // Period filter
        if (periodFilter !== 'all') {
            result = result.filter(c => {
                const d = new Date(c.date || c.created_at || c.scheduled_at);
                if (periodFilter === 'today') return c.date === new Date().toISOString().split('T')[0];
                if (periodFilter === 'last_7d') return d >= new Date(now.getTime() - 7 * 86400000);
                if (periodFilter === 'last_30d') return d >= new Date(now.getTime() - 30 * 86400000);
                return true;
            });
        }

        // Status filter
        if (statusFilter !== 'all') {
            if (statusFilter === 'live') {
                result = result.filter(c => ['AWAITING_PAYMENT', 'PENDING', 'CONFIRMED', 'IN_PROGRESS'].includes(c.status));
            } else if (statusFilter === 'completed') {
                result = result.filter(c => ['COMPLETED', 'COMPLETED_NO_PRESCRIPTION'].includes(c.status));
            } else if (statusFilter === 'cancelled') {
                result = result.filter(c => ['CANCELLED', 'REJECTED'].includes(c.status));
            } else if (statusFilter === 'noshow') {
                result = result.filter(c => ['NO_SHOW', 'NO_SHOW_VET', 'NO_SHOW_FARMER'].includes(c.status));
            }
        }

        // Type filter
        if (typeFilter !== 'all') {
            result = result.filter(c => {
                const lowerCat = (c.category || '').toLowerCase();
                const lowerType = (c.type || c.consultation_type || '').toLowerCase();
                if (typeFilter === 'ai') return lowerCat.includes('ai') || lowerCat.includes('artificial');
                if (typeFilter === 'vaccination') return lowerCat.includes('vaccin');
                if (typeFilter === 'online') return lowerType.includes('video') || lowerType.includes('phone') || lowerType.includes('online');
                if (typeFilter === 'visit') return lowerType.includes('visit') && !lowerCat.includes('ai') && !lowerCat.includes('vaccin');
                return true;
            });
        }

        // Search
        if (searchTerm.trim()) {
            const q = searchTerm.toLowerCase();
            result = result.filter(c =>
                c.vet_name?.toLowerCase().includes(q) ||
                c.farmer_name?.toLowerCase().includes(q)
            );
        }

        return result;
    }, [consults, statusFilter, typeFilter, periodFilter, searchTerm]);

    const stats = useMemo(() => ({
        total: consults.length,
        live: consults.filter(c => ['AWAITING_PAYMENT', 'PENDING', 'CONFIRMED', 'IN_PROGRESS'].includes(c.status)).length,
        completed: consults.filter(c => ['COMPLETED', 'COMPLETED_NO_PRESCRIPTION'].includes(c.status)).length,
        cancelled: consults.filter(c => ['CANCELLED', 'REJECTED'].includes(c.status)).length,
        revenue: consults.reduce((sum, c) => sum + (c.total_paid || c.amount || 0), 0),
        platform: consults.reduce((sum, c) => sum + (c.platform_revenue || 0), 0),
    }), [consults]);

    if (loading) return (
        <div className="ap-loading">
            <Loader2 className="ap-spin" size={36} color="#16a34a" />
            <p>Loading consultations...</p>
        </div>
    );

    return (
        <div className="ap-page">
            {/* Header */}
            <div className="ap-header">
                <div>
                    <h1 className="ap-title">Consultation Management</h1>
                    <p className="ap-subtitle">{filtered.length} of {consults.length} consultations</p>
                </div>
                <button className="ap-refresh-btn" onClick={handleRefresh} disabled={refreshing}>
                    <RefreshCw size={16} className={refreshing ? 'ap-spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* Stats Row */}
            <div className="ap-stats-grid">
                <div className="ap-stat-card">
                    <div className="ap-stat-icon" style={{ background: '#dbeafe' }}><Calendar size={20} color="#2563eb" /></div>
                    <div><div className="ap-stat-value">{stats.total}</div><div className="ap-stat-label">Total</div></div>
                </div>
                <div className="ap-stat-card">
                    <div className="ap-stat-icon" style={{ background: '#fef3c7' }}><Clock size={20} color="#d97706" /></div>
                    <div><div className="ap-stat-value">{stats.live}</div><div className="ap-stat-label">Active</div></div>
                </div>
                <div className="ap-stat-card">
                    <div className="ap-stat-icon" style={{ background: '#d1fae5' }}><CheckCircle size={20} color="#059669" /></div>
                    <div><div className="ap-stat-value">{stats.completed}</div><div className="ap-stat-label">Completed</div></div>
                </div>
                <div className="ap-stat-card">
                    <div className="ap-stat-icon" style={{ background: '#fee2e2' }}><XCircle size={20} color="#dc2626" /></div>
                    <div><div className="ap-stat-value">{stats.cancelled}</div><div className="ap-stat-label">Cancelled</div></div>
                </div>
                <div className="ap-stat-card">
                    <div className="ap-stat-icon" style={{ background: '#d1fae5' }}><span style={{ fontSize: 18 }}>₹</span></div>
                    <div><div className="ap-stat-value">₹{stats.revenue.toLocaleString()}</div><div className="ap-stat-label">Total Revenue</div></div>
                </div>
                <div className="ap-stat-card">
                    <div className="ap-stat-icon" style={{ background: '#ede9fe' }}><span style={{ fontSize: 18 }}>📊</span></div>
                    <div><div className="ap-stat-value">₹{stats.platform.toLocaleString()}</div><div className="ap-stat-label">Platform Share</div></div>
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
                    <Filter size={14} color="#6b7280" />
                    <select value={periodFilter} onChange={e => setPeriodFilter(e.target.value)} className="ap-select">
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="last_7d">Last 7 Days</option>
                        <option value="last_30d">Last 30 Days</option>
                    </select>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="ap-select">
                        <option value="all">All Status</option>
                        <option value="live">Active</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="noshow">No Show</option>
                    </select>
                    <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="ap-select">
                        <option value="all">All Types</option>
                        <option value="online">Online</option>
                        <option value="visit">In-Person</option>
                        <option value="vaccination">Vaccination</option>
                        <option value="ai">AI / Insemination</option>
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
                            <th>Type</th>
                            <th>Date & Time</th>
                            <th>Status</th>
                            <th>Amount</th>
                            <th>Platform</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan={8} className="ap-empty">No consultations found</td></tr>
                        ) : filtered.map(c => {
                            const statusStyle = STATUS_COLORS[c.status] || { bg: '#f3f4f6', text: '#374151', label: c.status };
                            const typeInfo = getTypeLabel(c.consultation_type || c.type, c.category);
                            return (
                                <tr key={c.id} className="ap-row">
                                    <td className="ap-cell-bold">Dr. {c.vet_name || '—'}</td>
                                    <td>{c.farmer_name || '—'}</td>
                                    <td>
                                        <span className="ap-type-badge" style={{ color: typeInfo.color }}>
                                            {typeInfo.icon} {typeInfo.label}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.8rem' }}>{c.date || '—'}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{c.time?.substring(0, 5)}</div>
                                    </td>
                                    <td>
                                        <span className="ap-badge" style={{ background: statusStyle.bg, color: statusStyle.text }}>
                                            {statusStyle.label}
                                        </span>
                                    </td>
                                    <td className="ap-cell-money">₹{c.total_paid || c.amount || 0}</td>
                                    <td className="ap-cell-money" style={{ color: '#7c3aed' }}>₹{c.platform_revenue || 0}</td>
                                    <td>
                                        <button className="ap-btn-sm ap-btn-primary" onClick={() => setSelectedConsult(c)}>
                                            View
                                        </button>
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
                            <h2>Consultation Details</h2>
                            <button className="ap-modal-close" onClick={() => setSelectedConsult(null)}>✕</button>
                        </div>
                        <div className="ap-modal-body">
                            {(() => {
                                const c = selectedConsult;
                                const statusStyle = STATUS_COLORS[c.status] || { bg: '#f3f4f6', text: '#374151', label: c.status };
                                const typeInfo = getTypeLabel(c.consultation_type || c.type, c.category);
                                return (
                                    <>
                                        <div className="ap-detail-badge-row">
                                            <span className="ap-badge" style={{ background: statusStyle.bg, color: statusStyle.text }}>{statusStyle.label}</span>
                                            <span className="ap-type-badge" style={{ color: typeInfo.color }}>{typeInfo.icon} {typeInfo.label}</span>
                                        </div>
                                        <div className="ap-detail-grid">
                                            <div className="ap-detail-row"><span>Vet</span><strong>Dr. {c.vet_name}</strong></div>
                                            <div className="ap-detail-row"><span>Farmer</span><strong>{c.farmer_name}</strong></div>
                                            <div className="ap-detail-row"><span>Date</span><strong>{c.date}</strong></div>
                                            <div className="ap-detail-row"><span>Time</span><strong>{c.time?.substring(0, 5)}</strong></div>
                                            <div className="ap-detail-row"><span>Amount Paid</span><strong style={{ color: '#059669' }}>₹{c.total_paid || c.amount || 0}</strong></div>
                                            <div className="ap-detail-row"><span>Vet Earnings</span><strong>₹{c.vet_earnings || 0}</strong></div>
                                            <div className="ap-detail-row"><span>Platform Revenue</span><strong style={{ color: '#7c3aed' }}>₹{c.platform_revenue || 0}</strong></div>
                                            {c.id && <div className="ap-detail-row"><span>Consult ID</span><code style={{ fontSize: '0.75rem' }}>{c.id}</code></div>}
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Consultations;
