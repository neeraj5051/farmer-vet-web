import { AlertCircle, CheckCircle, Clock, Loader2, MessageSquare, RefreshCw, Search, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { SupportTicket, SupportMessage } from '../services/supportService';
import { getAllTickets, updateTicket, getBookingContext, getSupportMessages, sendSupportMessage } from '../services/supportService';
import './AdminPages.css';

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string; icon: any }> = {
    OPEN: { bg: '#fef3c7', text: '#92400e', label: 'Open', icon: AlertCircle },
    IN_PROGRESS: { bg: '#dbeafe', text: '#1e40af', label: 'In Progress', icon: Clock },
    RESOLVED: { bg: '#d1fae5', text: '#065f46', label: 'Resolved', icon: CheckCircle },
    CLOSED: { bg: '#f3f4f6', text: '#6b7280', label: 'Closed', icon: XCircle },
};

const getBookingTypeInfo = (category?: string, type?: string) => {
    const lowerCat = (category || '').toLowerCase();
    const lowerType = (type || '').toLowerCase();
    if (lowerCat.includes('ai') || lowerCat.includes('artificial')) {
        return { label: 'AI / Insemination', icon: '🔬', color: '#7c3aed', bg: 'rgba(124, 58, 237, 0.15)' };
    }
    if (lowerCat.includes('vaccin') || lowerCat.includes('vacc')) {
        return { label: 'Vaccination', icon: '💉', color: '#059669', bg: 'rgba(5, 150, 105, 0.15)' };
    }
    if (lowerType.includes('video') || lowerType.includes('phone') || lowerType.includes('online')) {
        return { label: 'Online Consultation', icon: '📹', color: '#2563eb', bg: 'rgba(37, 99, 235, 0.15)' };
    }
    return { label: 'In-Person Visit', icon: '🏥', color: '#d97706', bg: 'rgba(217, 119, 6, 0.15)' };
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
    const [viewMode, setViewMode] = useState<'ticket' | 'context'>('ticket');
    const [bookingContext, setBookingContext] = useState<any>(null);
    const [loadingContext, setLoadingContext] = useState(false);
    const [messages, setMessages] = useState<SupportMessage[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [sendingChat, setSendingChat] = useState(false);

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
        setViewMode('ticket');
        setBookingContext(null);
        setMessages([]);
        fetchMessages(ticket.id);
    };

    const fetchMessages = async (ticketId: string) => {
        try {
            const msgs = await getSupportMessages(ticketId);
            setMessages(msgs);
        } catch (err) {
            console.error('Error fetching messages:', err);
        }
    };

    const handleSendChat = async () => {
        if (!selectedTicket || !chatInput.trim()) return;
        setSendingChat(true);
        try {
            const newMsg = await sendSupportMessage(selectedTicket.id, chatInput);
            setMessages(prev => [...prev, newMsg]);
            setChatInput('');
        } catch (err) {
            alert('Failed to send message');
        } finally {
            setSendingChat(false);
        }
    };

    const handleViewContext = async () => {
        if (!selectedTicket?.booking_id) return;
        setViewMode('context');
        setLoadingContext(true);
        try {
            const data = await getBookingContext(selectedTicket.booking_id);
            setBookingContext(data);
        } catch (err) {
            console.error(err);
            alert('Failed to load booking context.');
            setViewMode('ticket');
        } finally {
            setLoadingContext(false);
        }
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
                t.user?.full_name?.toLowerCase().includes(q) ||
                t.booking_id?.toLowerCase().includes(q)
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
                            <h2>{viewMode === 'ticket' ? 'Manage Ticket' : 'Booking Context'}</h2>
                            <button className="ap-modal-close" onClick={() => setSelectedTicket(null)}>✕</button>
                        </div>
                        <div className="ap-modal-body">
                            {viewMode === 'ticket' ? (
                                <>
                                    <div className="ap-detail-grid" style={{ marginBottom: '1.25rem' }}>
                                        <div className="ap-detail-row"><span>Subject</span><strong>{selectedTicket.subject}</strong></div>
                                        <div className="ap-detail-row"><span>User</span><strong>{selectedTicket.user?.full_name || '—'} ({selectedTicket.user?.role_name})</strong></div>
                                        <div className="ap-detail-row"><span>Phone</span><strong>{selectedTicket.user?.phone || '—'}</strong></div>
                                        <div className="ap-detail-row"><span>Created</span><strong>{new Date(selectedTicket.created_at).toLocaleString()}</strong></div>
                                        {selectedTicket.booking_id && (
                                            <div className="ap-detail-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span>Booking ID</span>
                                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                    <code style={{ fontSize: '0.75rem' }}>{selectedTicket.booking_id}</code>
                                                    <button 
                                                        className="ap-btn-sm" 
                                                        style={{ background: '#e0e7ff', color: '#4338ca', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
                                                        onClick={handleViewContext}
                                                    >
                                                        View Context
                                                    </button>
                                                </div>
                                            </div>
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
                                        <label className="ap-label">Live Chat with User</label>
                                        <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '1rem', marginBottom: '1rem', height: 250, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {messages.length === 0 ? (
                                                <div style={{ margin: 'auto', color: '#9ca3af', fontSize: '0.875rem' }}>No messages yet.</div>
                                            ) : (
                                                messages.map(msg => {
                                                    const isAdmin = msg.sender_role === 'admin' || msg.sender_role === 'support_executive';
                                                    return (
                                                        <div key={msg.id} style={{ 
                                                            alignSelf: isAdmin ? 'flex-end' : 'flex-start',
                                                            background: isAdmin ? '#dbeafe' : 'white',
                                                            border: '1px solid',
                                                            borderColor: isAdmin ? '#bfdbfe' : '#e5e7eb',
                                                            padding: '8px 12px',
                                                            borderRadius: '8px',
                                                            maxWidth: '85%'
                                                        }}>
                                                            <div style={{ fontSize: '0.7rem', color: '#6b7280', marginBottom: 4 }}>
                                                                {isAdmin ? msg.sender_name : 'Customer'} • {new Date(msg.created_at).toLocaleTimeString()}
                                                            </div>
                                                            <div style={{ fontSize: '0.875rem', color: '#111827' }}>
                                                                {msg.message_type === 'TEXT' ? msg.content : `[${msg.message_type} Attachment]` }
                                                            </div>
                                                        </div>
                                                    )
                                                })
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <input 
                                                type="text" 
                                                className="ap-search-input" 
                                                style={{ flex: 1 }} 
                                                placeholder="Type your reply..."
                                                value={chatInput}
                                                onChange={e => setChatInput(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && handleSendChat()}
                                            />
                                            <button className="ap-btn-primary ap-btn-sm" onClick={handleSendChat} disabled={sendingChat || !chatInput.trim()}>
                                                {sendingChat ? 'Sending...' : 'Send'}
                                            </button>
                                        </div>
                                    </div>

                                    <button className="ap-save-btn" onClick={handleUpdate} disabled={updating}>
                                        {updating ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </>
                            ) : (
                                <div className="ap-context-view">
                                    <button 
                                        onClick={() => setViewMode('ticket')} 
                                        style={{ background: 'transparent', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '6px 12px', fontSize: '0.875rem', cursor: 'pointer', marginBottom: '15px' }}
                                    >
                                        ← Back to Ticket
                                    </button>
                                    {loadingContext ? (
                                        <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>Loading Context...</div>
                                    ) : bookingContext ? (
                                        <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '10px' }}>
                                            <h3 style={{ fontSize: '1rem', marginTop: 0, marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span>Booking Details</span>
                                                <span style={{
                                                    fontSize: '0.75rem',
                                                    padding: '4px 10px',
                                                    borderRadius: '12px',
                                                    background: bookingContext.booking.status === 'COMPLETED' ? '#d1fae5' : bookingContext.booking.status === 'CONFIRMED' ? '#fef3c7' : '#fee2e2',
                                                    color: bookingContext.booking.status === 'COMPLETED' ? '#065f46' : bookingContext.booking.status === 'CONFIRMED' ? '#92400e' : '#991b1b',
                                                    fontWeight: 700,
                                                    textTransform: 'uppercase'
                                                }}>
                                                    {bookingContext.booking.status.toLowerCase().replace('_', ' ')}
                                                </span>
                                            </h3>
                                            {(() => {
                                                const typeInfo = getBookingTypeInfo(bookingContext.booking.service_category, bookingContext.booking.consultation_type);
                                                const formatDuration = (mins: number) => {
                                                    if (!mins || mins <= 0) return '0s';
                                                    const m = Math.floor(mins);
                                                    const s = Math.round((mins % 1) * 60);
                                                    return `${m}m ${s}s`;
                                                };
                                                const isVaccine = bookingContext.booking.service_category === 'VACCINATION';
                                                const isAI = bookingContext.booking.service_category === 'AI';
                                                const subName = bookingContext.booking.vaccine_name || bookingContext.booking.variant_name || bookingContext.booking.disease_name;

                                                return (
                                                    <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '12px', marginBottom: '20px', fontSize: '0.875rem', border: '1px solid #e5e7eb', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                                        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: typeInfo.bg, color: typeInfo.color, padding: '4px 10px', borderRadius: '8px', fontWeight: 600, fontSize: '0.78rem' }}>
                                                                {typeInfo.icon} {typeInfo.label}
                                                            </span>
                                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: bookingContext.booking.consultation_type === 'visit' ? 'rgba(217, 119, 6, 0.1)' : 'rgba(37, 99, 235, 0.1)', color: bookingContext.booking.consultation_type === 'visit' ? '#d97706' : '#2563eb', padding: '4px 10px', borderRadius: '8px', fontWeight: 600, fontSize: '0.78rem' }}>
                                                                {bookingContext.booking.consultation_type === 'visit' ? '🏥 In-Person' : '📹 Online'}
                                                            </span>
                                                        </div>

                                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #f3f4f6' }}>
                                                            <div>
                                                                <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', marginBottom: '2px' }}>Scheduled Date</div>
                                                                <div style={{ fontWeight: 700, color: '#111827' }}>{bookingContext.booking.booking_date}</div>
                                                            </div>
                                                            <div>
                                                                <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', marginBottom: '2px' }}>Scheduled Time</div>
                                                                <div style={{ fontWeight: 700, color: '#111827' }}>{bookingContext.booking.booking_time?.substring(0, 5)} {bookingContext.booking.slot_duration ? `(${bookingContext.booking.slot_duration}m slot)` : ''}</div>
                                                            </div>
                                                        </div>

                                                        {subName && (
                                                            <div style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #f3f4f6' }}>
                                                                <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', marginBottom: '2px' }}>
                                                                    {isVaccine ? '💉 Vaccine Name' : isAI ? '🔬 Breed / Variant' : '🩺 Condition'}
                                                                </div>
                                                                <div style={{ fontWeight: 700, color: typeInfo.color, fontSize: '0.95rem' }}>{subName}</div>
                                                            </div>
                                                        )}

                                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #f3f4f6' }}>
                                                            <div>
                                                                <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', marginBottom: '2px' }}>Vet Arrival / Start</div>
                                                                <div style={{ fontWeight: 700, color: '#111827' }}>
                                                                    {bookingContext.booking.arrived_at ? new Date(bookingContext.booking.arrived_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', marginBottom: '2px' }}>Session Duration</div>
                                                                <div style={{ fontWeight: 700, color: '#111827' }}>{formatDuration(bookingContext.booking.duration_minutes)}</div>
                                                            </div>
                                                        </div>

                                                        <div style={{ marginBottom: '12px' }}>
                                                            <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>Participants</div>
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                    <span>👨‍🌾 <strong>Farmer:</strong> {bookingContext.booking.farmer_name} <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>({bookingContext.booking.farmer_phone || 'No phone'})</span></span>
                                                                    {bookingContext.booking.is_farmer_joined ? (
                                                                        <span style={{ color: '#10b981', background: '#d1fae5', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700 }}>JOINED</span>
                                                                    ) : (
                                                                        <span style={{ color: '#ef4444', background: '#fee2e2', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700 }}>ABSENT</span>
                                                                    )}
                                                                </div>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                    <span>🩺 <strong>Vet:</strong> {bookingContext.booking.vet_name} <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>({bookingContext.booking.vet_phone || 'No phone'})</span></span>
                                                                    {bookingContext.booking.is_vet_joined ? (
                                                                        <span style={{ color: '#10b981', background: '#d1fae5', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700 }}>JOINED</span>
                                                                    ) : (
                                                                        <span style={{ color: '#ef4444', background: '#fee2e2', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700 }}>ABSENT</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {bookingContext.booking.consultation_type === 'visit' && bookingContext.booking.village && (
                                                            <div style={{ marginTop: '12px', padding: '10px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                                                                <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>📍 Visit Location / Address</div>
                                                                {bookingContext.booking.address_text && (
                                                                    <div style={{ fontSize: '0.85rem', marginBottom: '4px' }}>
                                                                        <strong>Address:</strong> {bookingContext.booking.address_text}
                                                                    </div>
                                                                )}
                                                                <div style={{ fontSize: '0.85rem', marginBottom: '4px' }}>
                                                                    <strong>Village / Area:</strong> {bookingContext.booking.village}
                                                                </div>
                                                                {bookingContext.booking.landmark && (
                                                                    <div style={{ fontSize: '0.85rem', marginBottom: '4px' }}>
                                                                        <strong>Landmark:</strong> {bookingContext.booking.landmark}
                                                                    </div>
                                                                )}
                                                                {bookingContext.booking.pincode && (
                                                                    <div style={{ fontSize: '0.85rem', marginBottom: '4px' }}>
                                                                        <strong>Pincode:</strong> {bookingContext.booking.pincode}
                                                                    </div>
                                                                )}
                                                                {(bookingContext.booking.district || bookingContext.booking.state) && (
                                                                    <div style={{ fontSize: '0.85rem' }}>
                                                                        <strong>Region:</strong> {[bookingContext.booking.district, bookingContext.booking.state].filter(Boolean).join(', ')}
                                                                    </div>
                                                                )}
                                                                {bookingContext.booking.latitude && bookingContext.booking.longitude && (
                                                                    <div style={{ marginTop: '6px', fontSize: '0.75rem', color: '#4b5563' }}>
                                                                        <strong>GPS:</strong> {bookingContext.booking.latitude.toFixed(6)}, {bookingContext.booking.longitude.toFixed(6)}
                                                                        {' '}(<a href={`https://www.google.com/maps/search/?api=1&query=${bookingContext.booking.latitude},${bookingContext.booking.longitude}`} target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'underline' }}>Open Map</a>)
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {bookingContext.booking.problem_description && (
                                                            <div style={{ marginTop: 12, padding: '10px', background: 'rgba(0,0,0,0.02)', borderRadius: '8px', borderLeft: `3px solid ${typeInfo.color}`, fontStyle: 'italic', color: '#4b5563' }}>
                                                                "{bookingContext.booking.problem_description}"
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })()}

                                            <h3 style={{ fontSize: '1rem', marginTop: 0, marginBottom: '10px' }}>Payment Info</h3>
                                            <div style={{ background: '#f9fafb', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.875rem', border: '1px solid #e5e7eb' }}>
                                                {bookingContext.payment ? (
                                                    <>
                                                        <div style={{ marginBottom: 6 }}><strong>Amount:</strong> ₹{bookingContext.payment.amount}</div>
                                                        <div style={{ marginBottom: 6 }}><strong>Status:</strong> {bookingContext.payment.status}</div>
                                                        <div><strong>Method:</strong> {bookingContext.payment.payment_method}</div>
                                                    </>
                                                ) : (
                                                    <div style={{ color: '#6b7280' }}>No payment record found.</div>
                                                )}
                                            </div>

                                            <h3 style={{ fontSize: '1rem', marginTop: '15px', marginBottom: '10px' }}>Ticket History ({bookingContext.tickets?.length || 0})</h3>
                                            <div style={{ background: '#f9fafb', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '20px' }}>
                                                {bookingContext.tickets && bookingContext.tickets.length > 0 ? (
                                                    bookingContext.tickets.map((t: any) => (
                                                        <div key={t.id} style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: t.id !== bookingContext.tickets[bookingContext.tickets.length - 1].id ? '1px solid #e5e7eb' : 'none' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                                                <strong style={{ fontSize: '0.875rem', color: '#111827' }}>{t.subject}</strong>
                                                                <span style={{
                                                                    fontSize: '0.7rem',
                                                                    padding: '2px 8px',
                                                                    borderRadius: '8px',
                                                                    background: t.status === 'RESOLVED' ? '#d1fae5' : t.status === 'CLOSED' ? '#f3f4f6' : '#fef3c7',
                                                                    color: t.status === 'RESOLVED' ? '#065f46' : t.status === 'CLOSED' ? '#6b7280' : '#92400e',
                                                                    fontWeight: 700
                                                                }}>
                                                                    {t.status}
                                                                </span>
                                                            </div>
                                                            <div style={{ fontSize: '0.8rem', color: '#4b5563', marginBottom: '4px' }}>{t.description}</div>
                                                            <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                                                                Created: {new Date(t.created_at).toLocaleString()}
                                                            </div>
                                                            {t.resolution_notes && (
                                                                <div style={{ marginTop: '4px', fontSize: '0.78rem', color: '#059669', background: 'rgba(5, 150, 105, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>
                                                                    <strong>Resolution:</strong> {t.resolution_notes}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div style={{ fontSize: '0.875rem', color: '#6b7280', textAlign: 'center', padding: '10px' }}>No other tickets for this booking.</div>
                                                )}
                                            </div>

                                            <h3 style={{ fontSize: '1rem', marginTop: 0, marginBottom: '10px' }}>Chat Log ({bookingContext.chat_messages.length})</h3>
                                            <div style={{ background: '#f3f4f6', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                                                {bookingContext.chat_messages.map((msg: any) => (
                                                    <div key={msg.id} style={{ marginBottom: '10px', padding: '10px', background: 'white', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                                                        <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '4px', fontWeight: 600 }}>
                                                            {msg.sender_id === bookingContext.booking.farmer_id ? 'Farmer' : 'Vet'} <span style={{ fontWeight: 400 }}>• {new Date(msg.created_at).toLocaleString()}</span>
                                                        </div>
                                                        <div style={{ fontSize: '0.875rem', color: '#111827' }}>
                                                            {msg.message_type === 'TEXT' ? msg.content : <span style={{ fontStyle: 'italic', color: '#6b7280' }}>[{msg.message_type} Attachment: {msg.content}]</span>}
                                                        </div>
                                                    </div>
                                                ))}
                                                {bookingContext.chat_messages.length === 0 && <div style={{ fontSize: '0.875rem', color: '#6b7280', textAlign: 'center', padding: '10px' }}>No messages exchanged.</div>}
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ color: '#ef4444', textAlign: 'center', padding: '1rem' }}>Failed to load context data.</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupportTickets;
