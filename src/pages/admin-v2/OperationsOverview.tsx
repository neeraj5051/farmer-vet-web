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
        const tState = (t.state || '').toLowerCase();
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
    const ticketsWithResponse = filteredTickets.filter(t => 
      t.response_time_seconds !== null && t.response_time_seconds !== undefined
    );
    
    let avgRespSeconds = 0;
    if (ticketsWithResponse.length > 0) {
      const totalDiff = ticketsWithResponse.reduce((sum, t) => sum + Number(t.response_time_seconds), 0);
      avgRespSeconds = totalDiff / ticketsWithResponse.length;
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

  // Generate dynamic chronological trends data based on filters
  const trendsData = useMemo(() => {
    if (!filteredConsults) return [];

    interface ChartBin {
      name: string;
      dateStr: string;
      bookings: number;
      completed: number;
      live: number;
      cancelled: number;
      noShow: number;
      rescheduled: number;
      online: number;
      ai: number;
      vaccination: number;
      inPerson: number;
      [key: string]: string | number; // index signature for category accesses
    }

    let bins: ChartBin[] = [];

    const getLocalDateStr = (rawDateStr: any) => {
      if (!rawDateStr) return '';
      const d = new Date(rawDateStr);
      if (isNaN(d.getTime())) return '';
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // Helper to get status category
    const getStatusCategory = (status: string) => {
      const s = (status || '').toUpperCase();
      if (['COMPLETED', 'COMPLETED_NO_PRESCRIPTION'].includes(s)) return 'completed';
      if (['AWAITING_PAYMENT', 'PENDING', 'CONFIRMED', 'IN_PROGRESS'].includes(s)) return 'live';
      if (['CANCELLED', 'REJECTED'].includes(s)) return 'cancelled';
      if (['NO_SHOW', 'NO_SHOW_VET', 'NO_SHOW_FARMER'].includes(s)) return 'noShow';
      if (s.includes('RESCHEDULED') || s.includes('RESCHEDULE')) return 'rescheduled';
      return 'unknown';
    };

    // Helper to get service key
    const getServiceKey = (c: any) => {
      const cat = (c.category || '').toLowerCase();
      const t = (c.type || c.consultation_type || '').toLowerCase();
      if (cat.includes('ai') || cat.includes('artificial')) return 'ai';
      if (cat.includes('vaccin')) return 'vaccination';
      if (t.includes('video') || t.includes('phone') || t.includes('online')) return 'online';
      return 'inPerson';
    };

    const initBin = (name: string, dateStr: string): ChartBin => ({
      name,
      dateStr,
      bookings: 0,
      completed: 0,
      live: 0,
      cancelled: 0,
      noShow: 0,
      rescheduled: 0,
      online: 0,
      ai: 0,
      vaccination: 0,
      inPerson: 0,
    });

    // 1. "Today" or "Yesterday" - Hourly/4-hour intervals
    if (dateRange === 'Today' || dateRange === 'Yesterday') {
      const slots = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'];
      bins = slots.map(slot => initBin(slot, slot));

      filteredConsults.forEach(c => {
        const d = new Date(c.date || c.created_at);
        const hour = d.getHours();
        let slot = '20:00';
        if (hour < 4) slot = '00:00';
        else if (hour < 8) slot = '04:00';
        else if (hour < 12) slot = '08:00';
        else if (hour < 16) slot = '12:00';
        else if (hour < 20) slot = '16:00';

        const bin = bins.find(b => b.name === slot);
        if (bin) {
          bin.bookings += 1;
          const statusCat = getStatusCategory(c.status);
          bin[statusCat] = (bin[statusCat] as number || 0) + 1;
          const serviceKey = getServiceKey(c);
          bin[serviceKey] = (bin[serviceKey] as number || 0) + 1;
        }
      });
    }
    // 2. "Last 7 Days" / "This Week" or default All Time / other ranges
    else if (dateRange === 'Last 7 Days' || dateRange === 'This Week' || dateRange === 'all' || dateRange === 'All Time' || !dateRange) {
      let useMonthly = false;
      let rangeDays = 7;

      if (dateRange === 'All Time' || dateRange === 'all') {
        if (filteredConsults.length > 0) {
          const dates = filteredConsults.map(c => new Date(c.date || c.created_at).getTime());
          const minDate = Math.min(...dates);
          const maxDate = Math.max(...dates);
          const diffDays = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24));
          if (diffDays > 45) {
            useMonthly = true;
          } else {
            rangeDays = Math.max(7, diffDays);
          }
        } else {
          rangeDays = 7;
        }
      }

      if (useMonthly) {
        // Group by month
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth() - 5, 1); // last 6 months
        const current = new Date(start);
        while (current <= now) {
          const monthLabel = current.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
          const key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
          bins.push(initBin(monthLabel, key));
          current.setMonth(current.getMonth() + 1);
        }

        filteredConsults.forEach(c => {
          const d = new Date(c.date || c.created_at);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          const bin = bins.find(b => b.dateStr === key);
          if (bin) {
            bin.bookings += 1;
            const statusCat = getStatusCategory(c.status);
            bin[statusCat] = (bin[statusCat] as number || 0) + 1;
            const serviceKey = getServiceKey(c);
            bin[serviceKey] = (bin[serviceKey] as number || 0) + 1;
          }
        });
      } else {
        // Daily bins for last N days
        const daysCount = dateRange === 'Last 7 Days' || dateRange === 'This Week' ? 7 : rangeDays;
        for (let i = daysCount - 1; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dayLabel = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
          bins.push(initBin(dayLabel, getLocalDateStr(d)));
        }

        filteredConsults.forEach(c => {
          const cDateStr = getLocalDateStr(c.date || c.created_at);
          const bin = bins.find(b => b.dateStr === cDateStr);
          if (bin) {
            bin.bookings += 1;
            const statusCat = getStatusCategory(c.status);
            bin[statusCat] = (bin[statusCat] as number || 0) + 1;
            const serviceKey = getServiceKey(c);
            bin[serviceKey] = (bin[serviceKey] as number || 0) + 1;
          }
        });
      }
    }
    // 3. "Last 30 Days" / "This Month" / "Last Month"
    else if (dateRange === 'Last 30 Days' || dateRange === 'This Month' || dateRange === 'Last Month') {
      let start = new Date();
      let end = new Date();

      if (dateRange === 'Last Month') {
        const now = new Date();
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
      } else {
        const daysCount = 30;
        start.setDate(start.getDate() - (daysCount - 1));
      }

      const current = new Date(start);
      while (current <= end) {
        const dayLabel = current.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
        bins.push(initBin(dayLabel, getLocalDateStr(current)));
        current.setDate(current.getDate() + 1);
      }

      filteredConsults.forEach(c => {
        const cDateStr = getLocalDateStr(c.date || c.created_at);
        const bin = bins.find(b => b.dateStr === cDateStr);
        if (bin) {
          bin.bookings += 1;
          const statusCat = getStatusCategory(c.status);
          bin[statusCat] = (bin[statusCat] as number || 0) + 1;
          const serviceKey = getServiceKey(c);
          bin[serviceKey] = (bin[serviceKey] as number || 0) + 1;
        }
      });
    }
    // 4. "Custom" date range
    else if (dateRange === 'Custom') {
      const start = customStartDate ? new Date(customStartDate) : new Date();
      const end = customEndDate ? new Date(customEndDate) : new Date();

      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 60) {
        const current = new Date(start);
        while (current <= end) {
          const dayLabel = current.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
          bins.push(initBin(dayLabel, getLocalDateStr(current)));
          current.setDate(current.getDate() + 1);
        }

        filteredConsults.forEach(c => {
          const cDateStr = getLocalDateStr(c.date || c.created_at);
          const bin = bins.find(b => b.dateStr === cDateStr);
          if (bin) {
            bin.bookings += 1;
            const statusCat = getStatusCategory(c.status);
            bin[statusCat] = (bin[statusCat] as number || 0) + 1;
            const serviceKey = getServiceKey(c);
            bin[serviceKey] = (bin[serviceKey] as number || 0) + 1;
          }
        });
      } else {
        const current = new Date(start);
        while (current <= end) {
          const monthLabel = current.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
          const key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
          if (!bins.some(b => b.dateStr === key)) {
            bins.push(initBin(monthLabel, key));
          }
          current.setMonth(current.getMonth() + 1);
        }

        filteredConsults.forEach(c => {
          const d = new Date(c.date || c.created_at);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          const bin = bins.find(b => b.dateStr === key);
          if (bin) {
            bin.bookings += 1;
            const statusCat = getStatusCategory(c.status);
            bin[statusCat] = (bin[statusCat] as number || 0) + 1;
            const serviceKey = getServiceKey(c);
            bin[serviceKey] = (bin[serviceKey] as number || 0) + 1;
          }
        });
      }
    }

    return bins;
  }, [filteredConsults, dateRange, customStartDate, customEndDate]);

  // Bookings by service donut data - derived directly from trendsData to guarantee 100% matching totals
  const serviceData = useMemo(() => {
    const categories = [
      { name: 'Online Consultation', key: 'online', color: '#10b981' },
      { name: 'AI / Insemination', key: 'ai', color: '#8b5cf6' },
      { name: 'Vaccination', key: 'vaccination', color: '#f59e0b' },
      { name: 'In-person Visit', key: 'inPerson', color: '#3b82f6' },
    ];

    const onlineCount = trendsData.reduce((sum, b) => sum + (Number(b.online) || 0), 0);
    const aiCount = trendsData.reduce((sum, b) => sum + (Number(b.ai) || 0), 0);
    const vaccinationCount = trendsData.reduce((sum, b) => sum + (Number(b.vaccination) || 0), 0);
    const inPersonCount = trendsData.reduce((sum, b) => sum + (Number(b.inPerson) || 0), 0);

    const total = onlineCount + aiCount + vaccinationCount + inPersonCount;

    const counts: Record<string, number> = {
      online: onlineCount,
      ai: aiCount,
      vaccination: vaccinationCount,
      inPerson: inPersonCount,
    };

    return categories.map(cat => {
      const count = counts[cat.key] || 0;
      return {
        name: cat.name,
        count,
        value: total > 0 ? Math.round((count / total) * 100) : 0,
        color: cat.color,
      };
    });
  }, [trendsData]);

  // Top districts data
  const districtsData = useMemo(() => {
    const counts: Record<string, number> = {};

    const extractDistrict = (c: any) => {
      if (!c) return null;
      
      if (c.district && c.district !== 'Unknown' && c.district !== 'null' && c.district !== 'undefined') {
        return c.district;
      }
      return null;
    };

    filteredConsults.forEach(c => {
      const dist = extractDistrict(c);
      if (dist) {
        counts[dist] = (counts[dist] || 0) + 1;
      }
    });

    return Object.entries(counts)
      .map(([dist, count]) => ({ district: dist, count }))
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
        <BookingTrendsChart data={trendsData} />
        <BookingsByServiceChart data={serviceData} />
      </div>

      {/* Row 4: Consultation Status + Top Districts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        <ConsultationStatusChart data={trendsData} />
        <TopCitiesList data={districtsData} />
      </div>

      {/* Row 5: Recent Bookings Table */}
      <RecentBookingsTable data={filteredConsults} />
    </div>
  );
};

export default OperationsOverview;
