import { ArrowDownCircle, ArrowUpCircle, Loader2, RefreshCw, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { getPayments, getPayouts } from '../services/adminService';
import './AdminPages.css';

const PaymentsPage = () => {
    const [activeTab, setActiveTab] = useState<'payments' | 'payouts'>('payments');
    const [payments, setPayments] = useState<any[]>([]);
    const [payouts, setPayouts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedItem, setSelectedItem] = useState<any>(null);

    const fetchData = async () => {
        try {
            const [p, po] = await Promise.all([getPayments(), getPayouts()]);
            setPayments(Array.isArray(p) ? p : []);
            setPayouts(Array.isArray(po) ? po : []);
        } catch (err) {
            console.error('Error fetching payment data:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleRefresh = () => { setRefreshing(true); fetchData(); };

    const data = activeTab === 'payments' ? payments : payouts;

    const filtered = useMemo(() => {
        let result = [...data];
        if (statusFilter !== 'all') {
            result = result.filter(i => i.status?.toLowerCase() === statusFilter.toLowerCase());
        }
        if (searchTerm.trim()) {
            const q = searchTerm.toLowerCase();
            result = result.filter(i =>
                i.payer_name?.toLowerCase().includes(q) ||
                i.vet_name?.toLowerCase().includes(q) ||
                i.transaction_id?.toLowerCase().includes(q)
            );
        }
        return result;
    }, [data, statusFilter, searchTerm]);

    const paymentStats = useMemo(() => ({
        total: payments.reduce((s, p) => s + (p.amount || 0), 0),
        completed: payments.filter(p => p.status === 'COMPLETED').length,
        pending: payments.filter(p => p.status !== 'COMPLETED').length,
    }), [payments]);

    const payoutStats = useMemo(() => ({
        total: payouts.reduce((s, p) => s + (p.amount || 0), 0),
        processed: payouts.filter(p => p.status === 'PROCESSED').length,
        pending: payouts.filter(p => p.status !== 'PROCESSED').length,
    }), [payouts]);

    if (loading) return (
        <div className="ap-loading">
            <Loader2 className="ap-spin" size={36} color="#16a34a" />
            <p>Loading payment data...</p>
        </div>
    );

    return (
        <div className="ap-page">
            <div className="ap-header">
                <div>
                    <h1 className="ap-title">Payments & Payouts</h1>
                    <p className="ap-subtitle">Track all transactions and vet disbursements</p>
                </div>
                <button className="ap-refresh-btn" onClick={handleRefresh} disabled={refreshing}>
                    <RefreshCw size={16} className={refreshing ? 'ap-spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* Summary Cards */}
            <div className="ap-stats-grid">
                <div className="ap-stat-card">
                    <div className="ap-stat-icon" style={{ background: '#d1fae5' }}>
                        <ArrowDownCircle size={20} color="#059669" />
                    </div>
                    <div>
                        <div className="ap-stat-value">₹{paymentStats.total.toLocaleString()}</div>
                        <div className="ap-stat-label">Total Received</div>
                    </div>
                </div>
                <div className="ap-stat-card">
                    <div className="ap-stat-icon" style={{ background: '#dbeafe' }}>
                        <span style={{ fontSize: 18 }}>✅</span>
                    </div>
                    <div>
                        <div className="ap-stat-value">{paymentStats.completed}</div>
                        <div className="ap-stat-label">Completed Payments</div>
                    </div>
                </div>
                <div className="ap-stat-card">
                    <div className="ap-stat-icon" style={{ background: '#fef3c7' }}>
                        <span style={{ fontSize: 18 }}>⏳</span>
                    </div>
                    <div>
                        <div className="ap-stat-value">{paymentStats.pending}</div>
                        <div className="ap-stat-label">Pending Payments</div>
                    </div>
                </div>
                <div className="ap-stat-card">
                    <div className="ap-stat-icon" style={{ background: '#ede9fe' }}>
                        <ArrowUpCircle size={20} color="#7c3aed" />
                    </div>
                    <div>
                        <div className="ap-stat-value">₹{payoutStats.total.toLocaleString()}</div>
                        <div className="ap-stat-label">Total Paid Out</div>
                    </div>
                </div>
                <div className="ap-stat-card">
                    <div className="ap-stat-icon" style={{ background: '#d1fae5' }}>
                        <span style={{ fontSize: 18 }}>💸</span>
                    </div>
                    <div>
                        <div className="ap-stat-value">{payoutStats.processed}</div>
                        <div className="ap-stat-label">Processed Payouts</div>
                    </div>
                </div>
                <div className="ap-stat-card">
                    <div className="ap-stat-icon" style={{ background: '#fef3c7' }}>
                        <span style={{ fontSize: 18 }}>🕐</span>
                    </div>
                    <div>
                        <div className="ap-stat-value">{payoutStats.pending}</div>
                        <div className="ap-stat-label">Pending Payouts</div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="ap-tabs">
                <button
                    className={`ap-tab ${activeTab === 'payments' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('payments'); setStatusFilter('all'); setSearchTerm(''); }}
                >
                    💰 Received Payments ({payments.length})
                </button>
                <button
                    className={`ap-tab ${activeTab === 'payouts' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('payouts'); setStatusFilter('all'); setSearchTerm(''); }}
                >
                    🏦 Vet Payouts ({payouts.length})
                </button>
            </div>

            {/* Filters */}
            <div className="ap-filters-bar">
                <div className="ap-search-wrap">
                    <Search size={16} color="#9ca3af" />
                    <input
                        type="text"
                        placeholder={activeTab === 'payments' ? "Search payer or vet..." : "Search vet or txn ID..."}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="ap-search-input"
                    />
                </div>
                <div className="ap-filter-group">
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="ap-select">
                        <option value="all">All Status</option>
                        {activeTab === 'payments'
                            ? <><option value="COMPLETED">Completed</option><option value="PENDING">Pending</option><option value="FAILED">Failed</option></>
                            : <><option value="PROCESSED">Processed</option><option value="PENDING">Pending</option></>
                        }
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="ap-table-wrap">
                {activeTab === 'payments' ? (
                    <table className="ap-table">
                        <thead>
                            <tr>
                                <th>Payer</th>
                                <th>Vet</th>
                                <th>Total Amount</th>
                                <th>Vet Share</th>
                                <th>Platform Share</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={8} className="ap-empty">No payments found</td></tr>
                            ) : filtered.map((p: any) => (
                                <tr key={p.id} className="ap-row">
                                    <td className="ap-cell-bold">{p.payer_name || '—'}</td>
                                    <td>Dr. {p.vet_name || '—'}</td>
                                    <td className="ap-cell-money">₹{Number(p.amount || 0).toFixed(2)}</td>
                                    <td style={{ color: '#059669', fontWeight: 600 }}>₹{Number(p.vet_share || 0).toFixed(2)}</td>
                                    <td style={{ color: '#2563eb', fontWeight: 600 }}>₹{Number(p.platform_share || 0).toFixed(2)}</td>
                                    <td>
                                        <span className="ap-badge" style={{
                                            background: p.status === 'COMPLETED' ? '#d1fae5' : '#fef3c7',
                                            color: p.status === 'COMPLETED' ? '#065f46' : '#92400e'
                                        }}>{p.status}</span>
                                    </td>
                                    <td style={{ fontSize: '0.78rem', color: '#6b7280' }}>
                                        {new Date(p.created_at).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <button className="ap-btn-sm ap-btn-primary" onClick={() => setSelectedItem({ ...p, _type: 'payment' })}>
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <table className="ap-table">
                        <thead>
                            <tr>
                                <th>Vet</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Transaction ID</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={6} className="ap-empty">No payouts found</td></tr>
                            ) : filtered.map((p: any) => (
                                <tr key={p.id} className="ap-row">
                                    <td className="ap-cell-bold">Dr. {p.vet_name || '—'}</td>
                                    <td className="ap-cell-money">₹{Number(p.amount || 0).toFixed(2)}</td>
                                    <td>
                                        <span className="ap-badge" style={{
                                            background: p.status === 'PROCESSED' ? '#d1fae5' : '#fef3c7',
                                            color: p.status === 'PROCESSED' ? '#065f46' : '#92400e'
                                        }}>{p.status}</span>
                                    </td>
                                    <td style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#6b7280' }}>
                                        {p.transaction_id || '—'}
                                    </td>
                                    <td style={{ fontSize: '0.78rem', color: '#6b7280' }}>
                                        {new Date(p.created_at).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <button className="ap-btn-sm ap-btn-primary" onClick={() => setSelectedItem({ ...p, _type: 'payout' })}>
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Detail Modal */}
            {selectedItem && (
                <div className="ap-modal-backdrop" onClick={() => setSelectedItem(null)}>
                    <div className="ap-modal" onClick={e => e.stopPropagation()}>
                        <div className="ap-modal-header">
                            <h2>{selectedItem._type === 'payment' ? 'Payment Details' : 'Payout Details'}</h2>
                            <button className="ap-modal-close" onClick={() => setSelectedItem(null)}>✕</button>
                        </div>
                        <div className="ap-modal-body">
                            <div className="ap-detail-grid">
                                {selectedItem._type === 'payment' ? (
                                    <>
                                        <div className="ap-detail-row"><span>Payer</span><strong>{selectedItem.payer_name}</strong></div>
                                        <div className="ap-detail-row"><span>Vet</span><strong>Dr. {selectedItem.vet_name}</strong></div>
                                        <div className="ap-detail-row"><span>Total Amount</span><strong style={{ color: '#059669' }}>₹{Number(selectedItem.amount || 0).toFixed(2)}</strong></div>
                                        <div className="ap-detail-row"><span>Vet Share</span><strong>₹{Number(selectedItem.vet_share || 0).toFixed(2)}</strong></div>
                                        <div className="ap-detail-row"><span>Platform Share</span><strong style={{ color: '#2563eb' }}>₹{Number(selectedItem.platform_share || 0).toFixed(2)}</strong></div>
                                        <div className="ap-detail-row"><span>Status</span><span className="ap-badge" style={{ background: selectedItem.status === 'COMPLETED' ? '#d1fae5' : '#fef3c7', color: selectedItem.status === 'COMPLETED' ? '#065f46' : '#92400e' }}>{selectedItem.status}</span></div>
                                        <div className="ap-detail-row"><span>Date</span><strong>{new Date(selectedItem.created_at).toLocaleString()}</strong></div>
                                    </>
                                ) : (
                                    <>
                                        <div className="ap-detail-row"><span>Vet</span><strong>Dr. {selectedItem.vet_name}</strong></div>
                                        <div className="ap-detail-row"><span>Amount</span><strong style={{ color: '#7c3aed' }}>₹{Number(selectedItem.amount || 0).toFixed(2)}</strong></div>
                                        <div className="ap-detail-row"><span>Status</span><span className="ap-badge" style={{ background: selectedItem.status === 'PROCESSED' ? '#d1fae5' : '#fef3c7', color: selectedItem.status === 'PROCESSED' ? '#065f46' : '#92400e' }}>{selectedItem.status}</span></div>
                                        <div className="ap-detail-row"><span>Transaction ID</span><code style={{ fontSize: '0.75rem' }}>{selectedItem.transaction_id || '—'}</code></div>
                                        <div className="ap-detail-row"><span>Date</span><strong>{new Date(selectedItem.created_at).toLocaleString()}</strong></div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentsPage;
