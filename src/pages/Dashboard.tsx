import {
    Activity,
    AlertTriangle,
    ArrowUpRight,
    BarChart2,
    Clock,
    CreditCard,
    MessageSquare,
    RefreshCw,
    Shield,
    TrendingUp,
    Users,
    Video,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { getAdminStats } from '../services/adminService';
import './Dashboard.css';

/* ─────────────────────────────────── Types ──────────────────────────────── */
interface AdminStatsResponse {
    revenue: any;
    consults: any;
    users: any;
    consultation_metrics: any;
    revenue_metrics: any;
    farmer_analytics: any;
    vet_analytics: any;
    call_chat_metrics: any;
    review_metrics: any;
    marketing_metrics: any;
    system_health: any;
}

/* ─────────────────────────────────── Mini Components ───────────────────── */
const QuickNavCard = ({ title, subtitle, emoji, color, to }: any) => {
    const navigate = useNavigate();
    return (
        <button
            className="db-nav-card"
            style={{ borderLeft: `4px solid ${color}` }}
            onClick={() => navigate(to)}
        >
            <span className="db-nav-icon" style={{ background: color + '18' }}>{emoji}</span>
            <div className="db-nav-text">
                <div className="db-nav-title">{title}</div>
                <div className="db-nav-sub">{subtitle}</div>
            </div>
            <span className="db-nav-arrow">›</span>
        </button>
    );
};

const ServicePill = ({ label, emoji, amount, count, color }: any) => (
    <div className="db-service-pill" style={{ borderColor: color + '30' }}>
        <div className="db-pill-header">
            <span className="db-pill-icon" style={{ background: color + '18', color }}>{emoji}</span>
            <span className="db-pill-label">{label}</span>
        </div>
        <div className="db-pill-amount" style={{ color }}>₹{Number(amount || 0).toLocaleString()}</div>
        <div className="db-pill-count">{count} cases</div>
    </div>
);

const KpiCard = ({ title, value, subtext, trend, icon: Icon, iconBg, iconColor }: any) => (
    <div className="db-kpi-card">
        <div className="db-kpi-top">
            <div className="db-kpi-icon" style={{ background: iconBg }}>
                <Icon size={20} color={iconColor} />
            </div>
            {trend && (
                <span className="db-kpi-trend">
                    <ArrowUpRight size={12} /> {trend}
                </span>
            )}
        </div>
        <div className="db-kpi-value">{value}</div>
        <div className="db-kpi-title">{title}</div>
        {subtext && <div className="db-kpi-sub">{subtext}</div>}
    </div>
);

/* ─────────────────────────────────── Dashboard ──────────────────────────── */
const Dashboard = () => {
    const [stats, setStats] = useState<AdminStatsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchStats = async () => {
        try {
            const data = await getAdminStats();
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch stats', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchStats(); }, []);

    const handleRefresh = () => { setRefreshing(true); fetchStats(); };

    if (loading) return (
        <div className="db-loading">
            <div className="db-spinner" />
            <p>Loading dashboard...</p>
        </div>
    );

    if (!stats) return (
        <div className="db-error">
            <AlertTriangle size={40} color="#ef4444" />
            <p>Failed to load dashboard data.</p>
            <button onClick={fetchStats}>Retry</button>
        </div>
    );

    /* ─── Derived data ─────────────────────────────────────────────────────── */
    const todayRev = stats.revenue?.today || {};
    const completedRev = todayRev.completed_revenue || 0;
    const escrowRev = todayRev.escrow_revenue || 0;
    const totalRev = todayRev.total || (completedRev + escrowRev) || 1;
    const compPct = Math.round((completedRev / totalRev) * 100);
    const escrowPct = Math.round((escrowRev / totalRev) * 100);

    // Consult period bar chart
    const trendData = [
        { name: 'Today', revenue: stats.revenue?.today?.total || 0, consults: stats.consults?.today?.total || 0 },
        { name: '7 Days', revenue: stats.revenue?.last_7d?.total || 0, consults: stats.consults?.last_7d?.total || 0 },
        { name: '30 Days', revenue: stats.revenue?.last_30d?.total || 0, consults: stats.consults?.last_30d?.total || 0 },
        { name: 'All Time', revenue: stats.revenue?.all_time?.total || 0, consults: stats.consults?.all_time?.total || 0 },
    ];

    // Consult type breakdown (from today)
    const todayBreakdown = todayRev.completed_breakdown || {};
    const servicePills = [
        { label: 'Online Consult', emoji: '📹', color: '#2563eb', amount: todayBreakdown.online || 0, count: todayBreakdown.online_count || 0 },
        { label: 'In-Person Visit', emoji: '🏥', color: '#7c3aed', amount: todayBreakdown.visit || 0, count: todayBreakdown.visit_count || 0 },
        { label: 'AI / Insemination', emoji: '🔬', color: '#ea580c', amount: todayBreakdown.ai || 0, count: todayBreakdown.ai_count || 0 },
        { label: 'Vaccination', emoji: '💉', color: '#059669', amount: todayBreakdown.vaccination || 0, count: todayBreakdown.vaccination_count || 0 },
    ];

    // Pie chart: consult status
    const cm = stats.consultation_metrics || {};
    const pieData = [
        { name: 'Completed', value: cm.completed || 0, color: '#10b981' },
        { name: 'Ongoing', value: cm.ongoing || 0, color: '#f59e0b' },
        { name: 'Cancelled', value: cm.cancelled || 0, color: '#ef4444' },
    ].filter(d => d.value > 0);

    // Consult type pie (video/phone/visit from 30d)
    const last30 = stats.consults?.last_30d || {};
    const onlineCount = (last30.online || 0) + (last30.video || 0) + (last30.phone || 0);
    const typePieData = [
        { name: 'Online', value: onlineCount, color: '#2563eb' },
        { name: 'Visit', value: last30.visit || 0, color: '#059669' },
    ].filter(d => d.value > 0);

    // Users
    const u = stats.users || {};
    const pendingVets = u.pending_vets || 0;
    const blockedUsers = u.blocked_users || 0;
    const rm = stats.revenue_metrics || {};
    const sh = stats.system_health || {};
    const va = stats.vet_analytics || {};
    const top5Vets = (va.top_vets || []).slice(0, 5);

    const completionRate = (cm.total || 0) > 0
        ? Math.round(((cm.completed || 0) / cm.total) * 100) : 0;

    return (
        <div className="db-page">
            {/* ─── Header ────────────────────────────────────────────────── */}
            <div className="db-header">
                <div>
                    <h1 className="db-title">Admin Dashboard</h1>
                    <p className="db-subtitle">Welcome back · <span style={{ color: sh.api_status === 'operational' ? '#059669' : '#ef4444' }}>● {sh.api_status === 'operational' ? 'All systems operational' : 'Issues detected'}</span></p>
                </div>
                <button className="db-refresh-btn" onClick={handleRefresh} disabled={refreshing}>
                    <RefreshCw size={15} className={refreshing ? 'db-spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* ─── Alert: Pending Vets ──────────────────────────────────── */}
            {pendingVets > 0 && (
                <div className="db-alert">
                    <AlertTriangle size={18} color="#d97706" />
                    <span><strong>{pendingVets} vet{pendingVets > 1 ? 's' : ''}</strong> awaiting verification.</span>
                    <a href="/admin/users" className="db-alert-link">Review now →</a>
                </div>
            )}

            {/* ─── KPI Cards ───────────────────────────────────────────── */}
            <div className="db-kpi-grid">
                <KpiCard
                    title="Total Revenue"
                    value={`₹${rm.total_revenue?.toLocaleString() || 0}`}
                    subtext={`₹${rm.revenue_this_month?.toLocaleString() || 0} this month`}
                    icon={TrendingUp}
                    iconBg="#d1fae5"
                    iconColor="#059669"
                />
                <KpiCard
                    title="Active Consultations"
                    value={cm.ongoing || 0}
                    subtext="Live sessions right now"
                    icon={Video}
                    iconBg="#fef3c7"
                    iconColor="#d97706"
                />
                <KpiCard
                    title="Total Vets"
                    value={u.total_vets || 0}
                    subtext={`${u.verified_vets || 0} verified · ${pendingVets} pending`}
                    icon={Shield}
                    iconBg="#dbeafe"
                    iconColor="#2563eb"
                    trend={pendingVets > 0 ? `${pendingVets} pending` : undefined}
                />
                <KpiCard
                    title="Total Farmers"
                    value={u.total_farmers || 0}
                    subtext={`${u.active_last_30d || 0} active (30d)`}
                    icon={Users}
                    iconBg="#d1fae5"
                    iconColor="#059669"
                />
                <KpiCard
                    title="Completion Rate"
                    value={`${completionRate}%`}
                    subtext={`${cm.completed || 0} of ${cm.total || 0} consults`}
                    icon={Activity}
                    iconBg="#ede9fe"
                    iconColor="#7c3aed"
                />
                <KpiCard
                    title="Platform Earnings"
                    value={`₹${rm.admin_commission_earned?.toLocaleString() || 0}`}
                    subtext={`₹${rm.vet_payout_pending?.toLocaleString() || 0} payout pending`}
                    icon={BarChart2}
                    iconBg="#fce7f3"
                    iconColor="#db2777"
                />
            </div>

            {/* ─── Revenue Hero + Service Pills ─────────────────────────── */}
            <div className="db-revenue-hero">
                <div className="db-hero-top">
                    <div>
                        <div className="db-hero-label">TODAY'S REVENUE</div>
                        <div className="db-hero-value">₹{totalRev === 1 ? 0 : totalRev?.toLocaleString()}</div>
                    </div>
                    <div className="db-hero-badges">
                        <span className="db-hero-badge db-hero-badge--green">✅ Completed ₹{completedRev.toLocaleString()}</span>
                        <span className="db-hero-badge db-hero-badge--amber">⏳ Escrow ₹{escrowRev.toLocaleString()}</span>
                    </div>
                </div>
                {/* Split progress bar */}
                <div className="db-split-bar">
                    <div className="db-split-seg db-split-seg--green" style={{ width: `${compPct}%` }} title={`Completed: ${compPct}%`} />
                    <div className="db-split-seg db-split-seg--amber" style={{ width: `${escrowPct}%` }} title={`Escrow: ${escrowPct}%`} />
                </div>
                <div className="db-split-legend">
                    <span><span className="db-dot db-dot--green" />Completed {compPct}%</span>
                    <span><span className="db-dot db-dot--amber" />In Escrow {escrowPct}%</span>
                </div>

                {/* Service type pills */}
                <div className="db-section-label" style={{ marginTop: '1.5rem' }}>Revenue by Service Type (Today)</div>
                <div className="db-pills-grid">
                    {servicePills.map(p => (
                        <ServicePill key={p.label} {...p} />
                    ))}
                </div>
            </div>

            {/* ─── Charts Row ───────────────────────────────────────────── */}
            <div className="db-charts-row">
                {/* Revenue & Consult Trend Bar Chart */}
                <div className="db-chart-card db-chart-card--wide">
                    <h3 className="db-chart-title">Revenue & Consultation Trends</h3>
                    <div className="db-chart-body">
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={trendData} barCategoryGap="30%">
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.95}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.25}/>
                                    </linearGradient>
                                    <linearGradient id="colorConsults" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.95}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.25}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.04)" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={v => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
                                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                                <Tooltip
                                    contentStyle={{ 
                                        borderRadius: 12, 
                                        backgroundColor: 'rgba(17, 24, 39, 0.85)', 
                                        backdropFilter: 'blur(8px)',
                                        border: '1px solid rgba(255, 255, 255, 0.08)', 
                                        boxShadow: '0 8px 32px rgba(0,0,0,0.25)', 
                                        fontSize: 13,
                                        color: '#ffffff'
                                    }}
                                    itemStyle={{ color: '#ffffff' }}
                                    labelStyle={{ color: '#9ca3af', fontWeight: 600 }}
                                    formatter={(val: any, name: any) => name === 'Revenue (₹)' ? [`₹${Number(val).toLocaleString()}`, name] : [val, name]}
                                />
                                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                                <Bar yAxisId="left" dataKey="revenue" name="Revenue (₹)" fill="url(#colorRevenue)" radius={[6, 6, 0, 0]} maxBarSize={40} />
                                <Bar yAxisId="right" dataKey="consults" name="Consultations" fill="url(#colorConsults)" radius={[6, 6, 0, 0]} maxBarSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Status Donut */}
                <div className="db-chart-card">
                    <h3 className="db-chart-title">Consultation Status</h3>
                    <div className="db-chart-body">
                        {pieData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                                        {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: 8, border: 'none', fontSize: 12 }} />
                                    <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="db-chart-empty">No data</div>
                        )}
                    </div>
                    <div className="db-donut-stats">
                        <div className="db-donut-stat"><span style={{ color: '#10b981' }}>✔</span> {cm.completed || 0} Completed</div>
                        <div className="db-donut-stat"><span style={{ color: '#f59e0b' }}>●</span> {cm.ongoing || 0} Ongoing</div>
                        <div className="db-donut-stat"><span style={{ color: '#ef4444' }}>✕</span> {cm.cancelled || 0} Cancelled</div>
                    </div>
                </div>
            </div>

            {/* ─── Second Charts Row ─────────────────────────────────────── */}
            <div className="db-charts-row">
                {/* Consultation Type Breakdown (30d) */}
                <div className="db-chart-card">
                    <h3 className="db-chart-title">Consult Types (Last 30 Days)</h3>
                    <div className="db-chart-body">
                        {typePieData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie data={typePieData} cx="50%" cy="50%" outerRadius={80} paddingAngle={3} dataKey="value">
                                        {typePieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: 8, border: 'none', fontSize: 12 }} />
                                    <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="db-chart-empty">No data</div>
                        )}
                    </div>
                    <div className="db-type-stats">
                        {[
                            { label: '📱 Online Consult', val: onlineCount, color: '#2563eb' },
                            { label: '🏥 In-Person Visit', val: last30.visit || 0, color: '#059669' },
                        ].map(s => (
                            <div key={s.label} className="db-type-row">
                                <span>{s.label}</span>
                                <strong style={{ color: s.color }}>{s.val}</strong>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Engagement & Platform Metrics */}
                <div className="db-chart-card db-chart-card--wide">
                    <h3 className="db-chart-title">Platform Metrics</h3>
                    <div className="db-metrics-grid">
                        {[
                            { label: 'Avg. Duration', value: `${(cm.avg_duration_minutes || 0).toFixed(1)} min`, icon: Clock, bg: '#dbeafe', color: '#2563eb' },
                            { label: 'Conversion Rate', value: `${(stats.marketing_metrics?.conversion_rate || 0).toFixed(1)}%`, icon: TrendingUp, bg: '#d1fae5', color: '#059669' },
                            { label: 'Avg Rev/Consult', value: `₹${(rm.avg_revenue_per_consultation || 0).toFixed(0)}`, icon: BarChart2, bg: '#ede9fe', color: '#7c3aed' },
                            { label: 'No-Show Rate', value: `${(va.no_show_percentage || 0).toFixed(1)}%`, icon: AlertTriangle, bg: '#fef3c7', color: '#d97706' },
                            { label: 'Platform Rating', value: `★ ${(stats.review_metrics?.platform_rating || 0).toFixed(1)}`, icon: Activity, bg: '#fce7f3', color: '#db2777' },
                            { label: 'Failed Payments', value: rm.failed_payments || 0, icon: CreditCard, bg: rm.failed_payments > 0 ? '#fee2e2' : '#f3f4f6', color: rm.failed_payments > 0 ? '#dc2626' : '#6b7280' },
                            { label: 'Chat Messages', value: stats.call_chat_metrics?.chat_messages_count || 0, icon: MessageSquare, bg: '#dbeafe', color: '#2563eb' },
                            { label: 'Refund Requests', value: stats.call_chat_metrics?.refund_requests_count || 0, icon: AlertTriangle, bg: '#fee2e2', color: '#dc2626' },
                        ].map(m => (
                            <div key={m.label} className="db-metric-tile">
                                <div className="db-metric-icon" style={{ background: m.bg }}>
                                    <m.icon size={16} color={m.color} />
                                </div>
                                <div className="db-metric-value" style={{ color: m.color }}>{m.value}</div>
                                <div className="db-metric-label">{m.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ─── User Stats Row ────────────────────────────────────────── */}
            <div className="db-user-stats-row">
                <div className="db-user-stat-card" style={{ borderTop: '4px solid #4f46e5' }}>
                    <div className="db-user-stat-num" style={{ color: '#4f46e5' }}>{u.total_vets || 0}</div>
                    <div className="db-user-stat-label">Total Vets</div>
                    <div className="db-user-stat-sub">{u.verified_vets || 0} verified</div>
                </div>
                <div className="db-user-stat-card" style={{ borderTop: '4px solid #ef4444' }}>
                    <div className="db-user-stat-num" style={{ color: '#ef4444' }}>{pendingVets}</div>
                    <div className="db-user-stat-label">Pending Vets</div>
                    <div className="db-user-stat-sub">Awaiting review</div>
                </div>
                <div className="db-user-stat-card" style={{ borderTop: '4px solid #10b981' }}>
                    <div className="db-user-stat-num" style={{ color: '#10b981' }}>{u.total_farmers || 0}</div>
                    <div className="db-user-stat-label">Total Farmers</div>
                    <div className="db-user-stat-sub">{u.active_farmers_last_7d || 0} active (7d)</div>
                </div>
                <div className="db-user-stat-card" style={{ borderTop: '4px solid #6b7280' }}>
                    <div className="db-user-stat-num" style={{ color: '#6b7280' }}>{blockedUsers}</div>
                    <div className="db-user-stat-label">Blocked Users</div>
                    <div className="db-user-stat-sub">Suspended accounts</div>
                </div>
                <div className="db-user-stat-card" style={{ borderTop: '4px solid #2563eb' }}>
                    <div className="db-user-stat-num" style={{ color: '#2563eb' }}>{u.active_today || 0}</div>
                    <div className="db-user-stat-label">Active Today</div>
                    <div className="db-user-stat-sub">{u.active_last_7d || 0} last 7 days</div>
                </div>
                <div className="db-user-stat-card" style={{ borderTop: '4px solid #d97706' }}>
                    <div className="db-user-stat-num" style={{ color: '#d97706' }}>{u.new_registrations?.today?.total || 0}</div>
                    <div className="db-user-stat-label">New Today</div>
                    <div className="db-user-stat-sub">{u.new_registrations?.last_7d?.total || 0} this week</div>
                </div>
            </div>

            {/* ─── Bottom Row: Top Vets + Quick Nav ─────────────────────── */}
            <div className="db-bottom-row">
                {/* Top Vets */}
                <div className="db-card db-card--wide">
                    <div className="db-card-header">
                        <h3 className="db-chart-title" style={{ margin: 0 }}>Top Performing Vets</h3>
                        <span className="db-badge-green">Top 5</span>
                    </div>
                    <table className="db-vet-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Consultations</th>
                                <th>Rating</th>
                                <th>Earnings</th>
                            </tr>
                        </thead>
                        <tbody>
                            {top5Vets.length === 0 ? (
                                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>No data</td></tr>
                            ) : top5Vets.map((vet: any, i: number) => (
                                <tr key={vet.id}>
                                    <td className="db-vet-rank">#{i + 1}</td>
                                    <td className="db-vet-name">{vet.name}</td>
                                    <td>{vet.completed_bookings}</td>
                                    <td><span style={{ color: '#f59e0b', fontWeight: 700 }}>★ {vet.rating?.toFixed(1)}</span></td>
                                    <td className="db-vet-earn">₹{vet.earnings?.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Quick Navigation */}
                <div className="db-card">
                    <h3 className="db-chart-title">Quick Navigation</h3>
                    <div className="db-nav-grid">
                        <QuickNavCard title="Consultations" subtitle="Live monitoring" emoji="📹" color="#f59e0b" to="/admin/consultations" />
                        <QuickNavCard title="Vets & Farmers" subtitle="Manage & verify" emoji="👨‍⚕️" color="#4f46e5" to="/admin/users" />
                        <QuickNavCard title="Payments" subtitle="Financials" emoji="💳" color="#ec4899" to="/admin/payments" />
                        <QuickNavCard title="Diseases" subtitle="Medical library" emoji="🩺" color="#ef4444" to="/admin/diseases" />
                        <QuickNavCard title="Vaccination" subtitle="Vaccine schedules" emoji="💉" color="#059669" to="/admin/vaccination" />
                        <QuickNavCard title="Services" subtitle="Categories & variants" emoji="🔧" color="#0ea5e9" to="/admin/services" />
                        <QuickNavCard title="Manage Fees" subtitle="Config & taxes" emoji="⚙️" color="#8b5cf6" to="/admin/fees" />
                        <QuickNavCard title="Support" subtitle="Help tickets" emoji="🎫" color="#d97706" to="/admin/support" />
                        <QuickNavCard title="Pashu Gyan" subtitle="Manage articles" emoji="📖" color="#f97316" to="/admin/blogs" />
                        <QuickNavCard title="Reports" subtitle="Analytics" emoji="📊" color="#06b6d4" to="/admin/reports" />
                    </div>
                </div>
            </div>

            {/* ─── System Alerts Footer ─────────────────────────────────── */}
            {(rm.failed_payments > 0 || stats.review_metrics?.negative_reviews_count > 0) && (
                <div className="db-system-alert">
                    <AlertTriangle size={18} color="#dc2626" />
                    <div>
                        <strong>Attention Required</strong>
                        <ul>
                            {rm.failed_payments > 0 && <li>{rm.failed_payments} failed payment(s) detected</li>}
                            {stats.review_metrics?.negative_reviews_count > 0 && <li>{stats.review_metrics.negative_reviews_count} negative review(s) received</li>}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
