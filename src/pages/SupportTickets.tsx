import { AlertCircle, CheckCircle, Clock, Loader2, MessageSquare, RefreshCw, Search, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { SupportTicket } from '../services/supportService';
import { getAllTickets, updateTicket } from '../services/supportService';
import './AdminPages.css';

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string; icon: any }> = {
    OPEN: { bg: '#fef3c7', text: '#92400e', label: 'Open', icon: AlertCircle },
    IN_PROGRESS: { bg: '#dbeafe', text: '#1e40af', label: 'In Progress', icon: Clock },
    RESOLVED: { bg: '#d1fae5', text: '#065f46', label: 'Resolved', icon: CheckCircle },
    CLOSED: { bg: '#f3f4f6', text: '#6b7280', label: 'Closed', icon: XCircle },
};

const SupportTickets = () => {
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [updating, setUpdating] = useState(false);
    const [updateStatus, setUpdateStatus] = useState('');
    const [resolutionNotes, setResolutionNotes] = useState('');

    const fetchData = async () => {
        try {
            const data = await getAllTickets();
            setTickets(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error fetching tickets:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleRefresh = () => { setRefreshing(true); fetchData(); };

    const openDetail = (ticket: SupportTicket) => {
        setSelectedTicket(ticket);
        setUpdateStatus(ticket.status);
        setResolutionNotes(ticket.resolution_notes || '');
    };

    const handleUpdate = async () => {
        if (!selectedTicket) return;
        setUpdating(true);
        try {
            await updateTicket(selectedTicket.id, {
                status: updateStatus,
                resolution_notes: resolutionNotes,
            });
            setSelectedTicket(null);
            fetchData();
        } catch (err) {
            alert('Failed to update ticket');
        } finally {
            setUpdating(false);
        }
    };

    const filtered = useMemo(() => {
        let result = [...tickets];
        if (statusFilter !== 'all') {
            result = result.filter(t => t.status === statusFilter);
        }
        if (searchTerm.trim()) {
            const q = searchTerm.toLowerCase();
            result = result.filter(t =>
                t.subject?.toLowerCase().includes(q) ||
                t.description?.toLowerCase().includes(q) ||
                t.user?.full_name?.toLowerCase().includes(q)
            );
        }
        return result;
    }, [tickets, statusFilter, searchTerm]);

    const stats = useMemo(() => ({
        open: tickets.filter(t => t.status === 'OPEN').length,
        inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
        resolved: tickets.filter(t => t.status === 'RESOLVED').length,
        closed: tickets.filter(t => t.status === 'CLOSED').length,
    }), [tickets]);

    if (loading) return (
        <div className="ap-loading">
            <Loader2 className="ap-spin" size={36} color="#16a34a" />
            <p>Loading support tickets...</p>
        </div>
    );

    return (
        <div className="ap-page">
            <div className="ap-header">
                <div>
                    <h1 className="ap-title">Support Tickets</h1>
                    <p className="ap-subtitle">{filtered.length} of {tickets.length} tickets</p>
                </div>
                <button className="ap-refresh-btn" onClick={handleRefresh} disabled={refreshing}>
                    <RefreshCw size={16} className={refreshing ? 'ap-spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* Stats */}
            <div className="ap-stats-grid">
                <div className="ap-stat-card">
                    <div className="ap-stat-icon" style={{ background: '#fef3c7' }}><AlertCircle size={20} color="#d97706" /></div>
                    <div><div className="ap-stat-value">{stats.open}</div><div className="ap-stat-label">Open</div></div>
                </div>
                <div className="ap-stat-card">
                    <div className="ap-stat-icon" style={{ background: '#dbeafe' }}><Clock size={20} color="#2563eb" /></div>
                    <div><div className="ap-stat-value">{stats.inProgress}</div><div className="ap-stat-label">In Progress</div></div>
                </div>
                <div className="ap-stat-card">
                    <div className="ap-stat-icon" style={{ background: '#d1fae5' }}><CheckCircle size={20} color="#059669" /></div>
                    <div><div className="ap-stat-value">{stats.resolved}</div><div className="ap-stat-label">Resolved</div></div>
                </div>
                <div className="ap-stat-card">
                    <div className="ap-stat-icon" style={{ background: '#f3f4f6' }}><XCircle size={20} color="#6b7280" /></div>
                    <div><div className="ap-stat-value">{stats.closed}</div><div className="ap-stat-label">Closed</div></div>
                </div>
                <div className="ap-stat-card">
                    <div className="ap-stat-icon" style={{ background: '#dbeafe' }}><MessageSquare size={20} color="#2563eb" /></div>
                    <div><div className="ap-stat-value">{tickets.length}</div><div className="ap-stat-label">Total Tickets</div></div>
                </div>
            </div>

            {/* Filters */}
            <div className="ap-filters-bar">
                <div className="ap-search-wrap">
                    <Search size={16} color="#9ca3af" />
                    <input
                        type="text"
                        placeholder="Search by subject, description or user..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="ap-search-input"
                    />
                </div>
                <div className="ap-filter-group">
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="ap-select">
                        <option value="all">All Status</option>
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="CLOSED">Closed</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="ap-table-wrap">
                <table className="ap-table">
                    <thead>
                        <tr>
                            <th>Subject</th>
                            <th>User</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Created</th>
                            <th>Booking ID</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan={7} className="ap-empty">No tickets found</td></tr>
                        ) : filtered.map(t => {
                            const sc = STATUS_CONFIG[t.status] || { bg: '#f3f4f6', text: '#374151', label: t.status };
                            return (
                                <tr key={t.id} className="ap-row">
                                    <td>
                                        <div className="ap-cell-bold" style={{ maxWidth: 240 }}>{t.subject}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: 2, maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {t.description}
                                        </div>
                                    </td>
                                    <td>{t.user?.full_name || '—'}</td>
                                    <td>
                                        <span className="ap-badge" style={{ background: t.user?.role_name === 'VET' ? '#dbeafe' : '#d1fae5', color: t.user?.role_name === 'VET' ? '#1e40af' : '#065f46' }}>
                                            {t.user?.role_name || '—'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="ap-badge" style={{ background: sc.bg, color: sc.text }}>
                                            {sc.label}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: '0.78rem', color: '#6b7280' }}>
                                        {new Date(t.created_at).toLocaleDateString()}
                                    </td>
                                    <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#9ca3af' }}>
                                        {t.booking_id ? t.booking_id.substring(0, 8) + '...' : '—'}
                                    </td>
                                    <td>
                                        <button className="ap-btn-sm ap-btn-primary" onClick={() => openDetail(t)}>
                                            Manage
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Detail / Update Modal */}
            {selectedTicket && (
                <div className="ap-modal-backdrop" onClick={() => setSelectedTicket(null)}>
                    <div className="ap-modal" onClick={e => e.stopPropagation()}>
                        <div className="ap-modal-header">
                            <h2>Manage Ticket</h2>
                            <button className="ap-modal-close" onClick={() => setSelectedTicket(null)}>✕</button>
                        </div>
                        <div className="ap-modal-body">
                            <div className="ap-detail-grid" style={{ marginBottom: '1.25rem' }}>
                                <div className="ap-detail-row"><span>Subject</span><strong>{selectedTicket.subject}</strong></div>
                                <div className="ap-detail-row"><span>User</span><strong>{selectedTicket.user?.full_name || '—'} ({selectedTicket.user?.role_name})</strong></div>
                                <div className="ap-detail-row"><span>Phone</span><strong>{selectedTicket.user?.phone || '—'}</strong></div>
                                <div className="ap-detail-row"><span>Created</span><strong>{new Date(selectedTicket.created_at).toLocaleString()}</strong></div>
                                {selectedTicket.booking_id && (
                                    <div className="ap-detail-row"><span>Booking ID</span><code style={{ fontSize: '0.75rem' }}>{selectedTicket.booking_id}</code></div>
                                )}
                            </div>

                            <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: '1rem', marginBottom: '1.25rem' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Description</div>
                                <p style={{ margin: 0, fontSize: '0.875rem', color: '#374151', lineHeight: 1.6 }}>{selectedTicket.description}</p>
                            </div>

                            <div className="ap-form-group">
                                <label className="ap-label">Update Status</label>
                                <select
                                    value={updateStatus}
                                    onChange={e => setUpdateStatus(e.target.value)}
                                    className="ap-form-select"
                                >
                                    <option value="OPEN">Open</option>
                                    <option value="IN_PROGRESS">In Progress</option>
                                    <option value="RESOLVED">Resolved</option>
                                    <option value="CLOSED">Closed</option>
                                </select>
                            </div>

                            <div className="ap-form-group">
                                <label className="ap-label">Resolution Notes</label>
                                <textarea
                                    className="ap-textarea"
                                    value={resolutionNotes}
                                    onChange={e => setResolutionNotes(e.target.value)}
                                    placeholder="Add resolution notes or follow-up message..."
                                    rows={4}
                                />
                            </div>

                            <button className="ap-save-btn" onClick={handleUpdate} disabled={updating}>
                                {updating ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupportTickets;
