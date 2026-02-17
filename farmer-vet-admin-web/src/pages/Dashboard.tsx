import { Activity, AlertTriangle, ArrowUpRight, DollarSign, MessageSquare, Users, Video } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getAdminStats } from '../services/adminService';

// Interfaces (same as before)
interface MetricBreakdown { total: number; video: number; phone: number; visit: number; }
interface PeriodStats { today: MetricBreakdown; last_7d: MetricBreakdown; last_30d: MetricBreakdown; all_time: MetricBreakdown; }
interface UserStats {
    total_farmers: number; total_vets: number; total_admins: number; active_today: number;
    active_last_7d: number; active_last_30d: number; pending_vets: number;
    active_farmers_last_7d: number; active_farmers_last_30d: number;
    active_vets_last_7d: number; active_vets_last_30d: number;
    verified_vets: number; unverified_vets: number; blocked_users: number; new_registrations: PeriodStats;
}
interface ConsultationMetrics { total: number; completed: number; cancelled: number; ongoing: number; avg_duration_minutes: number; repeat_consultation_rate: number; }
interface RevenueMetrics { total_revenue: number; revenue_this_month: number; admin_commission_earned: number; vet_payout_pending: number; failed_payments: number; avg_revenue_per_consultation: number; }
interface AnalyticsItem { name: string; value: number; }
interface FarmerAnalytics { top_states: AnalyticsItem[]; common_issues: AnalyticsItem[]; avg_spend_per_farmer: number; consultation_frequency: number; farmer_retention_rate: number; }
interface VetPerformance { id: string; name: string; completed_bookings: number; earnings: number; rating: number; }
interface VetAnalytics { top_vets: VetPerformance[]; avg_vet_rating: number; total_vet_earnings: number; consultation_success_rate: number; no_show_percentage: number; }
interface CallChatMetrics { total_consults_logged: number; chat_messages_count: number; refund_requests_count: number; }
interface ReviewMetrics { platform_rating: number; negative_reviews_count: number; reported_users_count: number; }
interface MarketingMetrics { conversion_rate: number; downloads: number; cac: number; roi: number; }
interface SystemHealth { api_status: string; db_latency_ms: number; error_rate_24h: number; }

interface AdminStatsResponse {
    revenue: PeriodStats; consults: PeriodStats; users: UserStats; consultation_metrics: ConsultationMetrics;
    revenue_metrics: RevenueMetrics; farmer_analytics: FarmerAnalytics; vet_analytics: VetAnalytics;
    call_chat_metrics: CallChatMetrics; review_metrics: ReviewMetrics; marketing_metrics: MarketingMetrics; system_health: SystemHealth;
}

const StatCard = ({ title, value, trend, icon: Icon, color, subtext }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-lg ${color} bg-opacity-10 text-opacity-100`}>
                <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} color={color} />
            </div>
            {trend && (
                <span className="flex items-center text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                    <ArrowUpRight className="w-3 h-3 mr-1" />
                    {trend}
                </span>
            )}
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-1">{value}</h3>
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        {subtext && <p className="text-xs text-gray-400 mt-2">{subtext}</p>}
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = useState<AdminStatsResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getAdminStats();
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
    );

    if (!stats) return <div className="p-8 text-center text-red-500">Failed to load dashboard data.</div>;

    // Prepare Chart Data
    const consultationData = [
        { name: 'Today', consults: stats.consults.today.total, revenue: stats.revenue.today.total },
        { name: '7 Days', consults: stats.consults.last_7d.total, revenue: stats.revenue.last_7d.total },
        { name: '30 Days', consults: stats.consults.last_30d.total, revenue: stats.revenue.last_30d.total },
    ];

    const chatData = [
        { name: 'Consultations', value: stats.call_chat_metrics.total_consults_logged, fill: '#4f46e5' },
        { name: 'Chat Messages', value: stats.call_chat_metrics.chat_messages_count, fill: '#ec4899' },
    ];

    const userGrowthData = [
        { name: 'Today', users: stats.users.new_registrations.today.total },
        { name: '7 Days', users: stats.users.new_registrations.last_7d.total },
        { name: '30 Days', users: stats.users.new_registrations.last_30d.total },
    ];

    const statusData = [
        { name: 'Completed', value: stats.consultation_metrics.completed, color: '#10b981' },
        { name: 'Cancelled', value: stats.consultation_metrics.cancelled, color: '#ef4444' },
        { name: 'Ongoing', value: stats.consultation_metrics.ongoing, color: '#f59e0b' },
    ];

    return (
        <div className="p-8 bg-gray-50 min-h-screen font-sans">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
                <p className="text-gray-500 mt-1">Welcome back, here's what's happening today.</p>
            </div>

            {/* Key Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Revenue"
                    value={`₹${stats.revenue_metrics.total_revenue.toLocaleString()}`}
                    trend="+12%" // Mock trend
                    icon={DollarSign}
                    color="#10b981" // emerald-500
                    subtext={`₹${stats.revenue_metrics.revenue_this_month.toLocaleString()} this month`}
                />
                <StatCard
                    title="Active Consultations"
                    value={stats.consultation_metrics.ongoing}
                    icon={Video}
                    color="#f59e0b" // amber-500
                    subtext="Live sessions now"
                />
                <StatCard
                    title="Total Users"
                    value={stats.users.total_farmers + stats.users.total_vets}
                    trend={`+${stats.users.new_registrations.today.total} today`}
                    icon={Users}
                    color="#3b82f6" // blue-500
                    subtext={`${stats.users.total_farmers} Farmers, ${stats.users.total_vets} Vets`}
                />
                <StatCard
                    title="System Health"
                    value={stats.system_health.api_status === 'operational' ? 'Healthy' : 'Issues'}
                    icon={Activity}
                    color={stats.system_health.api_status === 'operational' ? '#10b981' : '#ef4444'}
                    subtext={`Latency: ${stats.system_health.db_latency_ms.toFixed(0)}ms`}
                />
            </div>

            {/* Main Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Revenue & Consult Trends */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 col-span-2">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Revenue & Consultation Trends</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={consultationData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
                                <YAxis yAxisId="left" orientation="left" stroke="#10b981" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} prefix="₹" />
                                <YAxis yAxisId="right" orientation="right" stroke="#6366f1" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Legend />
                                <Bar yAxisId="left" dataKey="revenue" name="Revenue (₹)" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                                <Bar yAxisId="right" dataKey="consults" name="Consultations" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Chat vs Consult Visualization */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                        <MessageSquare className="w-5 h-5 mr-2 text-indigo-500" />
                        Engagement
                    </h3>
                    <div className="h-48 mb-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chatData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} stroke="#f3f4f6" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12, fill: '#4b5563' }} />
                                <Tooltip />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={30}>
                                    {chatData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-600">Avg Consult Duration</span>
                            <span className="font-bold text-gray-800">{stats.consultation_metrics.avg_duration_minutes.toFixed(1)} min</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-600">Conversion Rate</span>
                            <span className="font-bold text-gray-800">{stats.marketing_metrics.conversion_rate.toFixed(1)}%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Consultation Status Pie */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Consultation Status</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Vets Table */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 col-span-2">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-800">Top Performing Veterinarians</h3>
                        <span className="text-sm text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full font-medium">Top 5</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                                    <th className="pb-3 font-medium text-gray-400 uppercase tracking-wider">Name</th>
                                    <th className="pb-3 font-medium text-gray-400 uppercase tracking-wider">Consultations</th>
                                    <th className="pb-3 font-medium text-gray-400 uppercase tracking-wider">Rating</th>
                                    <th className="pb-3 font-medium text-gray-400 uppercase tracking-wider text-right">Earnings</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {stats.vet_analytics.top_vets.map((vet) => (
                                    <tr key={vet.id} className="group hover:bg-gray-50 transition-colors">
                                        <td className="py-4 font-medium text-gray-800">{vet.name}</td>
                                        <td className="py-4 text-gray-600">{vet.completed_bookings}</td>
                                        <td className="py-4 font-medium text-amber-500">★ {vet.rating.toFixed(1)}</td>
                                        <td className="py-4 font-bold text-emerald-600 text-right">₹{vet.earnings.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* System Alerts Row */}
            {(stats.revenue_metrics.failed_payments > 0 || stats.review_metrics.negative_reviews_count > 0) && (
                <div className="mt-8 bg-red-50 border border-red-100 rounded-xl p-4 flex items-start space-x-4">
                    <AlertTriangle className="text-red-500 flex-shrink-0" />
                    <div>
                        <h4 className="font-bold text-red-700">Attention Required</h4>
                        <ul className="mt-2 text-sm text-red-600 space-y-1">
                            {stats.revenue_metrics.failed_payments > 0 && <li>• {stats.revenue_metrics.failed_payments} failed payments detected.</li>}
                            {stats.review_metrics.negative_reviews_count > 0 && <li>• {stats.review_metrics.negative_reviews_count} negative reviews received.</li>}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;

