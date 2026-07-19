import React, { useEffect, useMemo, useState } from 'react';
import KpiCard from '../../components/admin-v2/KpiCard';
import RevenueTrendsChart from '../../components/admin-v2/RevenueTrendsChart';
import StatusDonutChart from '../../components/admin-v2/StatusDonutChart';
import PaymentMethodsChart from '../../components/admin-v2/PaymentMethodsChart';
import TransactionsTable from '../../components/admin-v2/TransactionsTable';
import { IndianRupee, FileText, CheckCircle, XCircle, RotateCcw, Percent, Loader2, RefreshCw } from 'lucide-react';
import { getAdminStats, getPayments } from '../../services/adminService';

const TransactionsScreen = () => {
  const [stats, setStats] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [statsData, paymentsData] = await Promise.all([
        getAdminStats(),
        getPayments()
      ]);
      setStats(statsData);
      setPayments(Array.isArray(paymentsData) ? paymentsData : []);
    } catch (err) {
      console.error('Error fetching transactions data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);
  const handleRefresh = () => { setRefreshing(true); fetchData(); };

  const finStats = useMemo(() => {
    const totalTransactions = payments.length;
    const successful = payments.filter(p => p.status === 'COMPLETED' || p.status === 'SUCCESS').length;
    const failed = payments.filter(p => p.status === 'FAILED').length;
    const refunded = payments.filter(p => (p.type || '').toLowerCase().includes('refund')).length;
    
    const successRate = totalTransactions > 0 ? ((successful / totalTransactions) * 100).toFixed(2) : '0.00';
    const totalValue = payments.reduce((s, p) => s + (p.amount || 0), 0);

    return {
      totalTransactions,
      successful,
      failed,
      refunded,
      successRate,
      totalValue
    };
  }, [payments]);

  // Status Donut
  const statusData = useMemo(() => {
    if (!finStats) return undefined;
    const total = finStats.totalTransactions || 1;
    const pending = total - (finStats.successful + finStats.failed + finStats.refunded);
    
    return [
      { name: 'Successful', value: Math.round((finStats.successful/total)*100), count: finStats.successful, color: '#10b981' },
      { name: 'Failed', value: Math.round((finStats.failed/total)*100), count: finStats.failed, color: '#ef4444' },
      { name: 'Refunded', value: Math.round((finStats.refunded/total)*100), count: finStats.refunded, color: '#6b7280' },
      { name: 'Pending', value: Math.round((pending/total)*100), count: pending, color: '#f59e0b' },
    ];
  }, [finStats]);

  // Payment Methods Donut (Reusing the default one, or computing if we have methods in API)
  const methodData = useMemo(() => {
    if (payments.length === 0) return undefined; // Will fallback to default in PaymentMethodsChart
    const counts: Record<string, { count: number; amount: number }> = {};
    payments.forEach(p => {
      const method = p.payment_method || p.method || 'UPI';
      if (!counts[method]) counts[method] = { count: 0, amount: 0 };
      counts[method].count += 1;
      counts[method].amount += (p.amount || 0);
    });
    
    const total = payments.length || 1;
    const colors: Record<string, string> = { 'UPI': '#10b981', 'Card': '#3b82f6', 'Cards': '#3b82f6', 'Net Banking': '#8b5cf6', 'Wallet': '#f59e0b' };
    
    return Object.entries(counts).map(([name, data]) => ({
      name,
      value: Math.round((data.count / total) * 100),
      count: data.count,
      amount: data.amount,
      color: colors[name] || '#6b7280'
    }));
  }, [payments]);

  // Trend Data
  const trendData = useMemo(() => {
    if (!stats) return [];
    const rev = stats.revenue || {};
    return [
      { name: 'Today', revenue: rev.today?.total || 0 },
      { name: '7 Days', revenue: rev.last_7d?.total || 0 },
      { name: '30 Days', revenue: rev.last_30d?.total || 0 },
      { name: 'All Time', revenue: rev.all_time?.total || 0 },
    ];
  }, [stats]);


  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', gap: 12, color: 'var(--text-secondary)' }}>
      <Loader2 size={36} style={{ animation: 'spin 1s linear infinite' }} />
      <p>Loading transactions...</p>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Transactions</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: '0.9rem' }}>
            All payment transactions across the platform
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <KpiCard title="Total Transactions" value={finStats?.totalTransactions.toLocaleString() ?? '—'} icon={<FileText />} highlightColor="#3b82f6" />
        <KpiCard title="Successful" value={finStats?.successful.toLocaleString() ?? '—'} icon={<CheckCircle />} highlightColor="#10b981" />
        <KpiCard title="Failed" value={finStats?.failed.toLocaleString() ?? '—'} icon={<XCircle />} highlightColor="#ef4444" />
        <KpiCard title="Refunded" value={finStats?.refunded.toLocaleString() ?? '—'} icon={<RotateCcw />} highlightColor="#f59e0b" />
        <KpiCard title="Success Rate" value={finStats ? `${finStats.successRate}%` : '—'} icon={<Percent />} highlightColor="#10b981" />
        <KpiCard title="Total Value" value={finStats ? `₹${finStats.totalValue.toLocaleString()}` : '—'} icon={<IndianRupee />} highlightColor="#14b8a6" />
      </div>

      {/* Middle Row: Trend | Methods | Statuses */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        <div style={{ '& > div': { height: '380px' } } as any}>
          {/* Reusing RevenueTrendsChart */}
          <RevenueTrendsChart data={trendData} />
        </div>
        <PaymentMethodsChart data={methodData} />
        <StatusDonutChart title="Transactions by Status" data={statusData} />
      </div>

      {/* Table */}
      <TransactionsTable data={payments} />
    </div>
  );
};

export default TransactionsScreen;
