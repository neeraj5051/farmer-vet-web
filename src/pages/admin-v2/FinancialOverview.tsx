import { useEffect, useMemo, useState } from 'react';
import KpiCard from '../../components/admin-v2/KpiCard';
import RevenueTrendsChart from '../../components/admin-v2/RevenueTrendsChart';
import RevenueByServiceChart from '../../components/admin-v2/RevenueByServiceChart';
import RevenueSplitSankey from '../../components/admin-v2/RevenueSplitSankey';
import PaymentMethodsChart from '../../components/admin-v2/PaymentMethodsChart';
import RecentTransactionsTable from '../../components/admin-v2/RecentTransactionsTable';
import { IndianRupee, CreditCard, ArrowRightLeft, Percent, Landmark, AlertCircle, Loader2, RefreshCw, RotateCcw, CheckCircle, XCircle, ShoppingCart } from 'lucide-react';
import { getAdminStats, getPayments, getPayouts } from '../../services/adminService';

import { useFilters } from '../../context/FilterContext';
import { applyGlobalFilters } from '../../utils/filterUtils';

const FinancialOverview = () => {
  const { dateRange, stateFilter, serviceFilter, customStartDate, customEndDate } = useFilters();
  const [stats, setStats] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [statsData, paymentsData, payoutsData] = await Promise.all([
        getAdminStats(),
        getPayments(),
        getPayouts()
      ]);
      setStats(statsData);
      setPayments(Array.isArray(paymentsData) ? paymentsData : []);
      setPayouts(Array.isArray(payoutsData) ? payoutsData : []);
    } catch (err) {
      console.error('Error fetching financial data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const filteredPayments = useMemo(() => {
    return applyGlobalFilters(payments, { dateRange, stateFilter, serviceFilter, customStartDate, customEndDate });
  }, [payments, dateRange, stateFilter, serviceFilter, customStartDate, customEndDate]);

  const filteredPayouts = useMemo(() => {
    return applyGlobalFilters(payouts, { dateRange, stateFilter, serviceFilter, customStartDate, customEndDate });
  }, [payouts, dateRange, stateFilter, serviceFilter, customStartDate, customEndDate]);

  const finStats = useMemo(() => {
    if (!stats) return null;
    const rev = stats.revenue || {};
    const todayRev = rev.today || {};
    const allTimeRev = rev.all_time || {};

    const isDefaultFilter = dateRange === 'Today' && stateFilter === 'All States' && serviceFilter === 'All Services';

    const calculatedGross = filteredPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const grossRevenue = isDefaultFilter ? (allTimeRev.total || calculatedGross) : calculatedGross;
    const platformRevenue = Math.round(grossRevenue * 0.20);
    const gstCollected = Math.round(grossRevenue * 0.18);
    const vetEarnings = grossRevenue - platformRevenue - gstCollected;

    const successfulTxnsList = filteredPayments.filter(p => p.status === 'COMPLETED' || p.status === 'SUCCESS');
    const successfulTxns = successfulTxnsList.length;
    const failedTxns = filteredPayments.filter(p => p.status === 'FAILED').length;
    const refunds = filteredPayments.filter(p => (p.type || '').toLowerCase().includes('refund'));
    const refundAmount = refunds.reduce((s, p) => s + (p.amount || 0), 0);
    
    const pendingPayoutsList = filteredPayouts.filter(p => p.status === 'PENDING' || p.status === 'PROCESSING');
    const pendingPayoutsCount = new Set(pendingPayoutsList.map(p => p.vet_id)).size;
    const pendingPayoutAmount = pendingPayoutsList.reduce((s, p) => s + (p.amount || 0), 0);

    const aov = successfulTxns > 0 ? Math.round(grossRevenue / successfulTxns) : 0;
    const takeRate = grossRevenue > 0 ? ((platformRevenue / grossRevenue) * 100).toFixed(1) : '20.0';

    return {
      grossRevenue,
      platformRevenue,
      gstCollected,
      vetEarnings: vetEarnings > 0 ? vetEarnings : 0,
      pendingPayoutAmount,
      pendingPayoutsCount,
      refundAmount,
      successfulTxns,
      failedTxns,
      aov,
      takeRate,
      todayGross: todayRev.total || grossRevenue,
      todayGst: todayRev.gst || gstCollected,
      todayHumal: todayRev.platform_revenue || platformRevenue,
      todayVet: todayRev.vet_share || vetEarnings,
    };
  }, [stats, filteredPayments, filteredPayouts, dateRange, stateFilter, serviceFilter]);

  const serviceData = useMemo(() => {
    if (filteredPayments.length === 0 && !stats) return undefined;
    const counts: Record<string, number> = {};
    filteredPayments.forEach(p => {
      const type = p.service_type || p.type || 'Online Consultation';
      counts[type] = (counts[type] || 0) + (p.amount || 0);
    });
    const items = [
      { name: 'Online Consultation', revenue: counts['Online Consultation'] || (stats?.revenue?.today?.completed_breakdown?.online || 0), color: '#10b981' },
      { name: 'In-person Visit', revenue: counts['In-person Visit'] || (stats?.revenue?.today?.completed_breakdown?.visit || 0), color: '#3b82f6' },
      { name: 'Artificial Insemination', revenue: counts['AI / Insemination'] || (stats?.revenue?.today?.completed_breakdown?.ai || 0), color: '#8b5cf6' },
      { name: 'Vaccination', revenue: counts['Vaccination'] || (stats?.revenue?.today?.completed_breakdown?.vaccination || 0), color: '#f59e0b' },
    ];
    return items.some(i => i.revenue > 0) ? items : undefined;
  }, [stats, filteredPayments]);

  const chartData = useMemo(() => {
    if (!stats) return [];
    const rev = stats.revenue || {};
    return [
      { name: 'Today', revenue: rev.today?.total || finStats?.grossRevenue || 0 },
      { name: '7 Days', revenue: rev.last_7d?.total || finStats?.grossRevenue || 0 },
      { name: '30 Days', revenue: rev.last_30d?.total || finStats?.grossRevenue || 0 },
      { name: 'All Time', revenue: rev.all_time?.total || finStats?.grossRevenue || 0 },
    ];
  }, [stats, finStats]);

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', gap: 12, color: 'var(--text-secondary)' }}>
      <Loader2 size={36} style={{ animation: 'spin 1s linear infinite' }} />
      <p>Loading financial data...</p>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Financial Metrics</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: '0.9rem' }}>
            Track revenue, commissions and payouts
          </p>
        </div>
        <button onClick={handleRefresh} disabled={refreshing} style={{ 
          display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border-color)', 
          background: 'var(--card-white)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' 
        }}>
          <RefreshCw size={14} style={refreshing ? { animation: 'spin 1s linear infinite' } : {}} />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <KpiCard title="Gross Revenue" value={finStats ? `₹${finStats.grossRevenue.toLocaleString()}` : '—'} icon={<IndianRupee />} highlightColor="#10b981" />
        <KpiCard title="Humal Revenue" value={finStats ? `₹${finStats.platformRevenue.toLocaleString()}` : '—'} icon={<Landmark />} highlightColor="#3b82f6" />
        <KpiCard title="GST Collected" value={finStats ? `₹${finStats.gstCollected.toLocaleString()}` : '—'} icon={<Percent />} highlightColor="#8b5cf6" />
        <KpiCard title="Vet Earnings" value={finStats ? `₹${finStats.vetEarnings.toLocaleString()}` : '—'} icon={<CreditCard />} highlightColor="#14b8a6" />
        <KpiCard title="Pending Payouts" value={finStats ? `₹${finStats.pendingPayoutAmount.toLocaleString()}` : '—'} icon={<ArrowRightLeft />} highlightColor="#f59e0b" subtitle={finStats ? `${finStats.pendingPayoutsCount} Vets` : ''} />
        
        <KpiCard title="Refunds" value={finStats ? `₹${finStats.refundAmount.toLocaleString()}` : '—'} icon={<RotateCcw />} highlightColor="#ef4444" />
        <KpiCard title="Successful Transactions" value={finStats?.successfulTxns.toLocaleString() ?? '—'} icon={<CheckCircle />} highlightColor="#10b981" />
        <KpiCard title="Failed Transactions" value={finStats?.failedTxns.toLocaleString() ?? '—'} icon={<XCircle />} highlightColor="#ef4444" />
        <KpiCard title="Avg. Order Value" value={finStats ? `₹${finStats.aov.toLocaleString()}` : '—'} icon={<ShoppingCart />} highlightColor="#8b5cf6" />
        <KpiCard title="Platform Take Rate" value={finStats ? `${finStats.takeRate}%` : '—'} icon={<AlertCircle />} highlightColor="#3b82f6" />
      </div>

      {/* Main Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', marginBottom: '32px' }}>
        <RevenueTrendsChart data={chartData} />
        <RevenueByServiceChart data={serviceData} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', marginBottom: '32px' }}>
        <RevenueSplitSankey 
          farmerPaid={finStats?.todayGross || 1245600}
          gst={finStats?.todayGst || 112050}
          humalShare={finStats?.todayHumal || 249120}
          vetShare={finStats?.todayVet || 884430}
        />
        <PaymentMethodsChart />
      </div>

      {/* Transactions Table */}
      <RecentTransactionsTable data={filteredPayments} />
    </div>
  );
};

export default FinancialOverview;
