import { BarChart2, Loader2, RefreshCw, TrendingDown, TrendingUp } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { getConsultations } from '../services/consultationsService';
import { getPayments, getPayouts } from '../services/adminService';
import './AdminPages.css';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const ReportsPage = () => {
    const [consults, setConsults] = useState<any[]>([]);
    const [payments, setPayments] = useState<any[]>([]);
    const [payouts, setPayouts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

    const fetchData = async () => {
        try {
            const [consultData, paymentData, payoutData] = await Promise.all([
                getConsultations(),
                getPayments(),
                getPayouts(),
            ]);
            const list = consultData?.summary || (Array.isArray(consultData) ? consultData : []);
            setConsults(list);
            setPayments(Array.isArray(paymentData) ? paymentData : []);
            setPayouts(Array.isArray(payoutData) ? payoutData : []);
        } catch (err) {
            console.error('Error fetching report data:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleRefresh = () => { setRefreshing(true); fetchData(); };

    const periodMs: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90, 'all': 99999 };

    const filteredData = useMemo(() => {
        const cutoff = new Date(Date.now() - periodMs[period] * 86400000);
        const fc = consults.filter(c => new Date(c.created_at || c.date || 0) >= cutoff);
        const fp = payments.filter(p => new Date(p.created_at || 0) >= cutoff);
        const fpo = payouts.filter(p => new Date(p.created_at || 0) >= cutoff);
        return { consults: fc, payments: fp, payouts: fpo };
    }, [consults, payments, payouts, period]);

    const summary = useMemo(() => {
        const fc = filteredData.consults;
        const fp = filteredData.payments;
        const fpo = filteredData.payouts;

        return {
            totalConsults: fc.length,
            completedConsults: fc.filter(c => ['COMPLETED', 'COMPLETED_NO_PRESCRIPTION'].includes(c.status)).length,
            cancelledConsults: fc.filter(c => ['CANCELLED', 'REJECTED'].includes(c.status)).length,
            totalRevenue: fp.reduce((s, p) => s + (p.amount || 0), 0),
            platformRevenue: fp.reduce((s, p) => s + (p.platform_share || 0), 0),
            vetPayouts: fpo.reduce((s, p) => s + (p.amount || 0), 0),
            onlineConsults: fc.filter(c => {
                const t = (c.type || c.consultation_type || '').toLowerCase();
                return t.includes('video') || t.includes('phone') || t.includes('online');
            }).length,
            visitConsults: fc.filter(c => {
                const t = (c.type || c.consultation_type || '').toLowerCase();
                const cat = (c.category || '').toLowerCase();
                return t.includes('visit') && !cat.includes('vaccin');
            }).length,
            vaccConsults: fc.filter(c => (c.category || '').toLowerCase().includes('vaccin')).length,
            aiConsults: fc.filter(c => {
                const cat = (c.category || '').toLowerCase();
                return cat.includes('ai') || cat.includes('artificial');
            }).length,
        };
    }, [filteredData]);

    // Monthly breakdown
    const monthlyData = useMemo(() => {
        const byMonth: Record<string, { revenue: number; consults: number }> = {};
        filteredData.payments.forEach(p => {
            const d = new Date(p.created_at || 0);
            const key = `${d.getFullYear()}-${d.getMonth()}`;
            if (!byMonth[key]) byMonth[key] = { revenue: 0, consults: 0 };
            byMonth[key].revenue += p.amount || 0;
        });
        filteredData.consults.forEach(c => {
            const d = new Date(c.created_at || c.date || 0);
            const key = `${d.getFullYear()}-${d.getMonth()}`;
            if (!byMonth[key]) byMonth[key] = { revenue: 0, consults: 0 };
            byMonth[key].consults += 1;
        });
        return Object.entries(byMonth)
            .sort(([a], [b]) => a.localeCompare(b))
            .slice(-12)
            .map(([key, val]) => {
                const [year, month] = key.split('-').map(Number);
                return { label: `${MONTHS[month]} ${year}`, ...val };
            });
    }, [filteredData]);

    const maxRevenue = Math.max(...monthlyData.map(m => m.revenue), 1);
    const maxConsults = Math.max(...monthlyData.map(m => m.consults), 1);

    const completionRate = summary.totalConsults > 0 ? Math.round((summary.completedConsults / summary.totalConsults) * 100) : 0;

    if (loading) return (
        <div className="ap-loading">
            <Loader2 className="ap-spin" size={36} color="#16a34a" />
            <p>Loading report data...</p>
        </div>
    );

    return (
        <div className="ap-page">
            <div className="ap-header">
                <div>
                    <h1 className="ap-title">Reports & Analytics</h1>
                    <p className="ap-subtitle">Platform performance overview</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="ap-refresh-btn" onClick={handleRefresh} disabled={refreshing}>
                        <RefreshCw size={16} className={refreshing ? 'ap-spin' : ''} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Period Filter */}
            <div className="ap-tabs">
                {(['7d', '30d', '90d', 'all'] as const).map(p => (
                    <button key={p} className={`ap-tab ${period === p ? 'active' : ''}`} onClick={() => setPeriod(p)}>
                        {p === '7d' ? 'Last 7 Days' : p === '30d' ? 'Last 30 Days' : p === '90d' ? 'Last 90 Days' : 'All Time'}
                    </button>
                ))}
            </div>

            {/* KPI Cards */}
            <div className="ap-stats-grid">
                <div className="ap-stat-card">
                    <div className="ap-stat-icon" style={{ background: '#dbeafe' }}><BarChart2 size={20} color="#2563eb" /></div>
                    <div><div className="ap-stat-value">{summary.totalConsults}</div><div className="ap-stat-label">Total Consultations</div></div>
                </div>
                <div className="ap-stat-card">
                    <div className="ap-stat-icon" style={{ background: '#d1fae5' }}><TrendingUp size={20} color="#059669" /></div>
                    <div><div className="ap-stat-value">{completionRate}%</div><div className="ap-stat-label">Completion Rate</div></div>
                </div>
                <div className="ap-stat-card">
                    <div className="ap-stat-icon" style={{ background: '#d1fae5' }}><span style={{ fontSize: 18 }}>₹</span></div>
                    <div><div className="ap-stat-value">₹{summary.totalRevenue.toLocaleString()}</div><div className="ap-stat-label">Total Revenue</div></div>
                </div>
                <div className="ap-stat-card">
                    <div className="ap-stat-icon" style={{ background: '#ede9fe' }}><span style={{ fontSize: 18 }}>🏛️</span></div>
                    <div><div className="ap-stat-value">₹{summary.platformRevenue.toLocaleString()}</div><div className="ap-stat-label">Platform Earnings</div></div>
                </div>
                <div className="ap-stat-card">
                    <div className="ap-stat-icon" style={{ background: '#fef3c7' }}><span style={{ fontSize: 18 }}>👨‍⚕️</span></div>
                    <div><div className="ap-stat-value">₹{summary.vetPayouts.toLocaleString()}</div><div className="ap-stat-label">Vet Payouts</div></div>
                </div>
                <div className="ap-stat-card">
                    <div className="ap-stat-icon" style={{ background: '#fee2e2' }}><TrendingDown size={20} color="#dc2626" /></div>
                    <div><div className="ap-stat-value">{summary.cancelledConsults}</div><div className="ap-stat-label">Cancellations</div></div>
                </div>
            </div>

            {/* Consultation Breakdown */}
            <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 14, padding: '1.5rem', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1rem', fontWeight: 700, color: '#111827' }}>Consultation Type Breakdown</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                    {[
                        { label: 'Online', value: summary.onlineConsults, emoji: '📹', color: '#2563eb', bg: '#dbeafe' },
                        { label: 'In-Person Visit', value: summary.visitConsults, emoji: '🏥', color: '#d97706', bg: '#fef3c7' },
                        { label: 'Vaccination', value: summary.vaccConsults, emoji: '💉', color: '#059669', bg: '#d1fae5' },
                        { label: 'AI / Insemination', value: summary.aiConsults, emoji: '🔬', color: '#7c3aed', bg: '#ede9fe' },
                    ].map(item => (
                        <div key={item.label} style={{ background: item.bg, borderRadius: 12, padding: '1rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{item.emoji}</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: item.color }}>{item.value}</div>
                            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: item.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{item.label}</div>
                            {summary.totalConsults > 0 && (
                                <div style={{ fontSize: '0.75rem', color: item.color, opacity: 0.7, marginTop: '0.25rem' }}>
                                    {Math.round((item.value / summary.totalConsults) * 100)}%
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Monthly Chart */}
            {monthlyData.length > 0 && (
                <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 14, padding: '1.5rem', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1rem', fontWeight: 700, color: '#111827' }}>Monthly Revenue & Consultations</h3>
                    <div style={{ overflowX: 'auto' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', minWidth: monthlyData.length * 80, height: 200, paddingBottom: '2.5rem', position: 'relative' }}>
                            {monthlyData.map((m, i) => (
                                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: 70, gap: '0.25rem' }}>
                                    {/* Revenue bar */}
                                    <div style={{ position: 'relative', width: '100%', display: 'flex', gap: '4px', alignItems: 'flex-end', flex: 1 }}>
                                        <div
                                            style={{
                                                flex: 1,
                                                height: `${Math.max((m.revenue / maxRevenue) * 140, 4)}px`,
                                                background: 'linear-gradient(to top, #059669, #34d399)',
                                                borderRadius: '4px 4px 0 0',
                                                position: 'relative',
                                            }}
                                            title={`Revenue: ₹${m.revenue.toLocaleString()}`}
                                        />
                                        <div
                                            style={{
                                                flex: 1,
                                                height: `${Math.max((m.consults / maxConsults) * 140, 4)}px`,
                                                background: 'linear-gradient(to top, #2563eb, #60a5fa)',
                                                borderRadius: '4px 4px 0 0',
                                            }}
                                            title={`Consults: ${m.consults}`}
                                        />
                                    </div>
                                    <div style={{ fontSize: '0.65rem', color: '#9ca3af', textAlign: 'center', lineHeight: 1.2 }}>{m.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.78rem', color: '#6b7280' }}>
                            <div style={{ width: 12, height: 12, background: '#059669', borderRadius: 2 }} /> Revenue
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.78rem', color: '#6b7280' }}>
                            <div style={{ width: 12, height: 12, background: '#2563eb', borderRadius: 2 }} /> Consultations
                        </div>
                    </div>
                </div>
            )}

            {/* Summary Table */}
            <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 14, overflow: 'hidden' }}>
                <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#111827' }}>Monthly Summary</h3>
                </div>
                <table className="ap-table">
                    <thead>
                        <tr>
                            <th>Month</th>
                            <th>Consultations</th>
                            <th>Revenue</th>
                        </tr>
                    </thead>
                    <tbody>
                        {monthlyData.length === 0 ? (
                            <tr><td colSpan={3} className="ap-empty">No data available for this period</td></tr>
                        ) : [...monthlyData].reverse().map((m, i) => (
                            <tr key={i} className="ap-row">
                                <td style={{ fontWeight: 600 }}>{m.label}</td>
                                <td>{m.consults}</td>
                                <td className="ap-cell-money">₹{m.revenue.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ReportsPage;
