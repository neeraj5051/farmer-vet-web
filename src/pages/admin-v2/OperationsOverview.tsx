import { useEffect, useMemo, useState } from 'react';
import KpiCard from '../../components/admin-v2/KpiCard';
import BookingTrendsChart from '../../components/admin-v2/BookingTrendsChart';
import BookingsByServiceChart from '../../components/admin-v2/BookingsByServiceChart';
import ConsultationStatusChart from '../../components/admin-v2/ConsultationStatusChart';
import TopCitiesList from '../../components/admin-v2/TopCitiesList';
import RecentBookingsTable from '../../components/admin-v2/RecentBookingsTable';
import { FileText, CheckCircle, Video, UserSquare2, XCircle, Clock, Users, Timer, AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { getAdminStats, getFarmers, getSupportTickets } from '../../services/adminService';
import { getConsultations } from '../../services/consultationsService';

import { useFilters } from '../../context/FilterContext';
import { applyGlobalFilters } from '../../utils/filterUtils';

const OperationsOverview = () => {
  const { dateRange, stateFilter, serviceFilter, customStartDate, customEndDate } = useFilters();
  const [stats, setStats] = useState<any>(null);
  const [consults, setConsults] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [farmerCount, setFarmerCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [statsData, consultsData, farmersData, ticketsData] = await Promise.all([
        getAdminStats(),
        getConsultations(),
        getFarmers(),
        getSupportTickets().catch(() => [])
      ]);
      setStats(statsData);
      const list = consultsData?.summary || (Array.isArray(consultsData) ? consultsData : []);
      setConsults(list);
      setFarmerCount(Array.isArray(farmersData) ? farmersData.length : 0);
      setTickets(Array.isArray(ticketsData) ? ticketsData : []);
    } catch (err) {
      console.error('Error fetching operations data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);
  const handleRefresh = () => { setRefreshing(true); fetchData(); };

  // Apply global filters from Topbar
  const filteredConsults = useMemo(() => {
    return applyGlobalFilters(consults, { dateRange, stateFilter, serviceFilter, customStartDate, customEndDate });
  }, [consults, dateRange, stateFilter, serviceFilter, customStartDate, customEndDate]);

  // Apply global filters to support tickets
  const filteredTickets = useMemo(() => {
    let result = [...tickets];
    
    // Filter by state if stateFilter is active
    if (stateFilter && stateFilter !== 'All States' && stateFilter !== 'all') {
      result = result.filter(t => {
        const tState = (t.state || t.user?.state || '').toLowerCase();
        return tState === stateFilter.toLowerCase();
      });
    }
    
    // Filter by date range
    if (dateRange && dateRange !== 'All Time' && dateRange !== 'all') {
      const now = new Date();
      let startDate = new Date(0);
      if (dateRange === 'Today') {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else if (dateRange === 'Yesterday') {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        result = result.filter(t => {
          const d = new Date(t.created_at);
          return d >= startDate && d < endDate;
        });
        return result;
      } else if (dateRange === 'Last 7 Days') {
        startDate = new Date(now.getTime() - 7 * 86400000);
      } else if (dateRange === 'Last 30 Days') {
        startDate = new Date(now.getTime() - 30 * 86400000);
      } else if (dateRange === 'This Month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      } else if (dateRange === 'Custom' && customStartDate) {
        startDate = new Date(customStartDate);
      }
      
      result = result.filter(t => new Date(t.created_at) >= startDate);
    }
    
    return result;
  }, [tickets, dateRange, stateFilter, customStartDate]);

  const opStats = useMemo(() => {
    if (!stats) return null;
    const u = stats.users || {};

    const totalCount = filteredConsults.length;
    const completedCount = filteredConsults.filter(c => ['COMPLETED', 'COMPLETED_NO_PRESCRIPTION'].includes(c.status)).length;
    const liveCount = filteredConsults.filter(c => ['AWAITING_PAYMENT', 'PENDING', 'CONFIRMED', 'IN_PROGRESS'].includes(c.status)).length;
    const cancelledCount = filteredConsults.filter(c => ['CANCELLED', 'REJECTED'].includes(c.status)).length;
    const noShowCount = filteredConsults.filter(c => ['NO_SHOW', 'NO_SHOW_VET', 'NO_SHOW_FARMER'].includes(c.status)).length;

    // Dynamically calculate average consultation duration from completed records with positive duration
    const completedWithDuration = filteredConsults.filter(c => 
      ['COMPLETED', 'COMPLETED_NO_PRESCRIPTION'].includes(c.status) && 
      (Number(c.duration) || Number(c.duration_minutes) || 0) > 0
    );

    let avgDurationMins = 0;
    if (completedWithDuration.length > 0) {
      const sumDuration = completedWithDuration.reduce((s, c) => s + (Number(c.duration) || Number(c.duration_minutes) || 0), 0);
      avgDurationMins = sumDuration / completedWithDuration.length;
    }

    const finalDurationStr = avgDurationMins > 0 
      ? `${Math.floor(avgDurationMins)}m ${Math.round((avgDurationMins % 1) * 60)}s` 
      : '—';

    // Calculate response time from filtered tickets
    const respondedTickets = filteredTickets.filter(t => 
      t.status?.toLowerCase() !== 'open' && t.status?.toLowerCase() !== 'pending'
    );
    
    let avgRespSeconds = 0;
    if (respondedTickets.length > 0) {
      const totalDiff = respondedTickets.reduce((sum, t) => {
        const created = new Date(t.created_at).getTime();
        const updated = new Date(t.updated_at || t.resolved_at || Date.now()).getTime();
        return sum + Math.max(0, (updated - created) / 1000);
      }, 0);
      avgRespSeconds = totalDiff / respondedTickets.length;
    } else {
      // Fallback to database-wide stats response seconds if no tickets in active filter window
      avgRespSeconds = stats.call_chat_metrics?.avg_response_seconds || 0;
    }

    let finalResponseTimeStr = '—';
    if (avgRespSeconds > 0) {
      const totalSeconds = Math.round(avgRespSeconds);
      if (totalSeconds < 60) {
        finalResponseTimeStr = `${totalSeconds}s`;
      } else {
        finalResponseTimeStr = `${Math.floor(totalSeconds / 60)}m ${totalSeconds % 60}s`;
      }
    }

    return {
      todayBookings: totalCount,
      completed: completedCount,
      live: liveCount,
      cancelled: cancelledCount,
      noShow: noShowCount,
      avgResponseTime: finalResponseTimeStr,
      avgDuration: finalDurationStr,
      activeVets: u.active_vets || u.total_vets || 0,
      activeFarmers: farmerCount,
      completionRate: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
    };
  }, [stats, filteredConsults, farmerCount]);

  // Booking trends chart data
  const chartData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: 'Today', bookings: filteredConsults.filter(c => {
          const d = c.date || (c.created_at ? c.created_at.slice(0, 10) : '');
          return d === new Date().toISOString().slice(0, 10);
        }).length || stats.consults?.today?.total || 0 },
      { name: '7 Days', bookings: stats.consults?.last_7d?.total || filteredConsults.length },
      { name: '30 Days', bookings: stats.consults?.last_30d?.total || filteredConsults.length },
      { name: 'All Time', bookings: stats.consults?.all_time?.total || consults.length },
    ];
  }, [stats, filteredConsults, consults]);

  // Bookings by service donut data
  const serviceData = useMemo(() => {
    if (filteredConsults.length === 0) return undefined;
    const getType = (c: any) => {
      const cat = (c.category || '').toLowerCase();
      const t = (c.type || c.consultation_type || '').toLowerCase();
      if (cat.includes('ai') || cat.includes('artificial')) return 'AI / Insemination';
      if (cat.includes('vaccin')) return 'Vaccination';
      if (t.includes('video') || t.includes('phone') || t.includes('online')) return 'Online Consultation';
      return 'In-person Visit';
    };
    const counts: Record<string, number> = {};
    filteredConsults.forEach(c => { const t = getType(c); counts[t] = (counts[t] || 0) + 1; });
    const total = filteredConsults.length;
    const colors: Record<string, string> = {
      'Online Consultation': '#10b981',
      'In-person Visit': '#3b82f6',
      'AI / Insemination': '#8b5cf6',
      'Vaccination': '#f59e0b',
    };
    return Object.entries(counts).map(([name, count]) => ({
      name,
      value: Math.round((count / total) * 100),
      count,
      color: colors[name] || '#6b7280',
    }));
  }, [filteredConsults]);

  // Top cities data
  const citiesData = useMemo(() => {
    if (filteredConsults.length === 0) return undefined;
    const counts: Record<string, number> = {};
    filteredConsults.forEach(c => {
      const city = c.city || c.district || c.location || 'Unknown';
      if (city && city !== 'Unknown') counts[city] = (counts[city] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [filteredConsults]);

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', gap: 12, color: 'var(--text-secondary)' }}>
      <Loader2 size={36} style={{ animation: 'spin 1s linear infinite' }} />
      <p>Loading operations data...</p>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Operations Metrics</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: '0.9rem' }}>
            Real-time overview of platform operations
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
      
      {/* Row 1: Primary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        <KpiCard 
          title="Total Bookings" 
          value={opStats?.todayBookings ?? '—'} 
          icon={<FileText />} 
          highlightColor="#3b82f6" 
        />
        <KpiCard title="Completed Consultations" value={opStats?.completed ?? '—'} icon={<CheckCircle />} highlightColor="#10b981" />
        <KpiCard title="Live Consultations" value={opStats?.live ?? '—'} icon={<Video />} subtitle="● Live" highlightColor="#f59e0b" />
        <KpiCard title="Cancelled" value={opStats?.cancelled ?? '—'} icon={<XCircle />} highlightColor="#ef4444" />
        <KpiCard title="No Show" value={opStats?.noShow ?? '—'} icon={<AlertTriangle />} highlightColor="#ea580c" />
      </div>

      {/* Row 2: Secondary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <KpiCard 
          title="Avg. Response Time" 
          value={typeof opStats?.avgResponseTime === 'number' ? `${Math.floor(opStats.avgResponseTime / 60)}m ${opStats.avgResponseTime % 60}s` : opStats?.avgResponseTime ?? '—'} 
          icon={<Clock />} 
          highlightColor="#8b5cf6" 
        />
        <KpiCard 
          title="Avg. Consultation Duration" 
          value={typeof opStats?.avgDuration === 'number' ? `${Math.floor(opStats.avgDuration / 60)}m ${opStats.avgDuration % 60}s` : opStats?.avgDuration ?? '—'} 
          icon={<Timer />} 
          highlightColor="#14b8a6" 
        />
        <KpiCard title="Active Vets" value={opStats?.activeVets ?? '—'} icon={<UserSquare2 />} highlightColor="#3b82f6" />
        <KpiCard title="Active Farmers" value={opStats?.activeFarmers ?? '—'} icon={<Users />} highlightColor="#10b981" />
      </div>

      {/* Row 3: Bookings Trend + Bookings by Service */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        <BookingTrendsChart data={chartData} />
        <BookingsByServiceChart data={serviceData} />
      </div>

      {/* Row 4: Consultation Status + Top Cities */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        <ConsultationStatusChart />
        <TopCitiesList data={citiesData} />
      </div>

      {/* Row 5: Recent Bookings Table */}
      <RecentBookingsTable data={filteredConsults} />
    </div>
  );
};

export default OperationsOverview;
