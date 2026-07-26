import { useEffect, useMemo, useState } from 'react';
import { getConsultations, getConsultationDetail } from '../../services/consultationsService';
import { Search, Download, Loader2, Eye, X, FileText, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import '../../components/admin-v2/ListScreens.css';

const STATUS_MAP: Record<string, { bg: string; text: string; label: string }> = {
  COMPLETED: { bg: '#dcfce7', text: '#166534', label: 'Completed' },
  COMPLETED_NO_PRESCRIPTION: { bg: '#dcfce7', text: '#166534', label: 'Completed' },
  IN_PROGRESS: { bg: '#dbeafe', text: '#1e40af', label: 'In Progress' },
  CONFIRMED: { bg: '#fef3c7', text: '#92400e', label: 'Confirmed' },
  AWAITING_PAYMENT: { bg: '#ede9fe', text: '#5b21b6', label: 'Awaiting Payment' },
  PENDING: { bg: '#fef3c7', text: '#92400e', label: 'Pending' },
  CANCELLED: { bg: '#fee2e2', text: '#991b1b', label: 'Cancelled' },
  REJECTED: { bg: '#fee2e2', text: '#991b1b', label: 'Rejected' },
  NO_SHOW: { bg: '#fde8d8', text: '#7c2d12', label: 'No Show' },
  NO_SHOW_VET: { bg: '#fde8d8', text: '#7c2d12', label: 'No Show (Vet)' },
  NO_SHOW_FARMER: { bg: '#fde8d8', text: '#7c2d12', label: 'No Show (Farmer)' },
};

const PAYMENT_MAP: Record<string, { bg: string; text: string; label: string }> = {
  paid: { bg: '#dcfce7', text: '#166534', label: 'Paid' },
  pending: { bg: '#fef3c7', text: '#92400e', label: 'Pending' },
  refunded: { bg: '#f3f4f6', text: '#6b7280', label: 'Refunded' },
  failed: { bg: '#fee2e2', text: '#991b1b', label: 'Failed' },
};

const getServiceLabel = (type: string, category?: string) => {
  const cat = (category || '').toLowerCase();
  const t = (type || '').toLowerCase();
  if (cat.includes('ai') || cat.includes('artificial')) return 'AI / Insemination';
  if (cat.includes('vaccin')) return 'Vaccination';
  if (t.includes('video') || t.includes('phone') || t.includes('online')) return 'Online Consultation';
  return 'In-Person Visit';
};

import { useFilters } from '../../context/FilterContext';
import { applyGlobalFilters } from '../../utils/filterUtils';

const PAGE_SIZE = 10;

const BookingsScreen = () => {
  const { dateRange, stateFilter, serviceFilter: globalServiceFilter } = useFilters();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [, setBookingDetail] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [drawerTab, setDrawerTab] = useState('overview');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getConsultations();
        const list = result?.summary || (Array.isArray(result) ? result : []);
        setData(list);
      } catch (err) {
        console.error('Error fetching bookings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    let result = applyGlobalFilters(data, { dateRange, stateFilter, serviceFilter: globalServiceFilter });
    if (statusFilter === 'upcoming') result = result.filter(c => ['PENDING', 'CONFIRMED', 'AWAITING_PAYMENT'].includes(c.status));
    else if (statusFilter === 'completed') result = result.filter(c => ['COMPLETED', 'COMPLETED_NO_PRESCRIPTION'].includes(c.status));
    else if (statusFilter === 'cancelled') result = result.filter(c => ['CANCELLED', 'REJECTED'].includes(c.status));
    else if (statusFilter === 'expired') result = result.filter(c => c.status === 'EXPIRED');
    else if (statusFilter === 'pending_assignment') result = result.filter(c => c.status === 'PENDING');

    if (serviceFilter !== 'all') {
      result = result.filter(c => {
        const label = getServiceLabel(c.type || c.consultation_type || '', c.category);
        if (serviceFilter === 'online') return label.includes('Online');
        if (serviceFilter === 'visit') return label.includes('In-Person');
        if (serviceFilter === 'ai') return label.includes('AI');
        if (serviceFilter === 'vaccination') return label.includes('Vaccination');
        return true;
      });
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(c =>
        c.farmer_name?.toLowerCase().includes(q) ||
        c.vet_name?.toLowerCase().includes(q) ||
        c.id?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [data, statusFilter, serviceFilter, searchTerm, dateRange, stateFilter, globalServiceFilter]);

  const stats = useMemo(() => ({
    upcoming: data.filter(c => ['PENDING', 'CONFIRMED', 'AWAITING_PAYMENT'].includes(c.status)).length,
    completed: data.filter(c => ['COMPLETED', 'COMPLETED_NO_PRESCRIPTION'].includes(c.status)).length,
    cancelled: data.filter(c => ['CANCELLED', 'REJECTED'].includes(c.status)).length,
    expired: data.filter(c => c.status === 'EXPIRED').length,
    pending: data.filter(c => c.status === 'PENDING').length,
  }), [data]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleViewBooking = async (booking: any) => {
    setSelectedBooking(booking);
    setBookingDetail(null);
    setDrawerTab('overview');
    setLoadingDetail(true);
    try {
      const detail = await getConsultationDetail(booking.id);
      setBookingDetail(detail);
    } catch { /* ignore */ } finally {
      setLoadingDetail(false);
    }
  };

  if (loading) return (
    <div className="loading-spinner">
      <Loader2 size={36} />
      <p>Loading bookings...</p>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="list-screen-header">
        <div>
          <h1 className="list-screen-title">Bookings</h1>
          <p className="list-screen-subtitle">Manage and track all bookings across the platform</p>
        </div>
        <button className="export-btn"><Download size={16} /> Export CSV</button>
      </div>

      {/* Filter Bar */}
      <div className="list-filter-bar">
        <select className="filter-select" value={serviceFilter} onChange={e => { setServiceFilter(e.target.value); setPage(1); }}>
          <option value="all">All Services</option>
          <option value="online">Online Consultation</option>
          <option value="visit">In-Person Visit</option>
          <option value="ai">AI / Insemination</option>
          <option value="vaccination">Vaccination</option>
        </select>
        <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input className="filter-search" style={{ paddingLeft: 36 }} placeholder="Search booking ID, farmer or vet..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setPage(1); }} />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="list-kpi-row">
        {[
          { key: 'all', label: 'Total Bookings', value: data.length, icon: <FileText size={16} />, bg: '#dbeafe', color: '#3b82f6' },
          { key: 'upcoming', label: 'Upcoming', value: stats.upcoming, icon: <Clock size={16} />, bg: '#fef3c7', color: '#f59e0b' },
          { key: 'completed', label: 'Completed', value: stats.completed, icon: <CheckCircle size={16} />, bg: '#dcfce7', color: '#10b981' },
          { key: 'cancelled', label: 'Cancelled', value: stats.cancelled, icon: <XCircle size={16} />, bg: '#fee2e2', color: '#ef4444' },
          { key: 'pending_assignment', label: 'Pending Assignment', value: stats.pending, icon: <AlertTriangle size={16} />, bg: '#ede9fe', color: '#8b5cf6' },
        ].map(kpi => (
          <div key={kpi.key} className={`list-kpi-card ${statusFilter === kpi.key ? 'active' : ''}`} onClick={() => { setStatusFilter(kpi.key === 'all' ? 'all' : kpi.key); setPage(1); }}>
            <div className="list-kpi-icon" style={{ backgroundColor: kpi.bg, color: kpi.color }}>{kpi.icon}</div>
            <div className="list-kpi-value">{kpi.value}</div>
            <div className="list-kpi-label">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="list-table-card">
        <div className="list-tabs">
          {['all', 'upcoming', 'completed', 'cancelled', 'expired', 'pending_assignment'].map(tab => (
            <button key={tab} className={`list-tab ${statusFilter === tab ? 'active' : ''}`} onClick={() => { setStatusFilter(tab); setPage(1); }}>
              {tab === 'all' ? 'All Bookings' : tab === 'pending_assignment' ? 'Pending Assignment' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="list-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Farmer</th>
                <th>Service</th>
                <th>Vet</th>
                <th>Date & Time</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(b => {
                const s = STATUS_MAP[b.status] || { bg: '#f3f4f6', text: '#6b7280', label: b.status };
                const p = PAYMENT_MAP[(b.payment_status || 'pending').toLowerCase()] || PAYMENT_MAP.pending;
                return (
                  <tr key={b.id} onClick={() => handleViewBooking(b)}>
                    <td style={{ fontWeight: 500, fontFamily: 'monospace', fontSize: '0.82rem' }}>{b.id?.slice(0, 13) || '—'}</td>
                    <td>
                      <div className="list-cell-name">
                        <div className="list-cell-avatar" style={{ backgroundColor: '#dcfce7', color: '#166534' }}>
                          {(b.farmer_name || 'F')[0]}
                        </div>
                        {b.farmer_name || '—'}
                      </div>
                    </td>
                    <td>{getServiceLabel(b.type || b.consultation_type || '', b.category)}</td>
                    <td>{b.vet_name || '—'}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{b.date || b.scheduled_at?.slice(0, 10) || '—'}</td>
                    <td><span className="list-status-badge" style={{ backgroundColor: s.bg, color: s.text }}>{s.label}</span></td>
                    <td><span className="list-status-badge" style={{ backgroundColor: p.bg, color: p.text }}>{p.label}</span></td>
                    <td>
                      <button onClick={e => { e.stopPropagation(); handleViewBooking(b); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {paginated.length === 0 && (
                <tr><td colSpan={8} className="list-empty">No bookings found matching your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="list-pagination">
            <span>Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} bookings</span>
            <div className="list-pagination-buttons">
              <button className="list-pagination-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>←</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                <button key={p} className={`list-pagination-btn ${page === p ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
              ))}
              {totalPages > 5 && <span style={{ padding: '6px 8px' }}>...</span>}
              <button className="list-pagination-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>→</button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      {selectedBooking && (
        <>
          <div className="profile-drawer-overlay" onClick={() => setSelectedBooking(null)} />
          <div className="profile-drawer">
            <div className="drawer-header">
              <div className="drawer-profile">
                <div className="drawer-avatar">{(selectedBooking.farmer_name || 'B')[0]}</div>
                <div>
                  <div className="drawer-name">{selectedBooking.farmer_name || 'Unknown'}</div>
                  <div className="drawer-meta">{selectedBooking.id?.slice(0, 13)}</div>
                </div>
              </div>
              <button className="drawer-close" onClick={() => setSelectedBooking(null)}><X size={20} /></button>
            </div>
            <div className="drawer-tabs">
              {['overview', 'timeline'].map(tab => (
                <button key={tab} className={`drawer-tab ${drawerTab === tab ? 'active' : ''}`} onClick={() => setDrawerTab(tab)}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            <div className="drawer-body">
              {loadingDetail ? (
                <div className="loading-spinner"><Loader2 size={24} /><p>Loading details...</p></div>
              ) : (
                <div className="drawer-section">
                  <div className="drawer-section-title">Booking Details</div>
                  {[
                    ['Farmer', selectedBooking.farmer_name],
                    ['Vet', selectedBooking.vet_name],
                    ['Service', getServiceLabel(selectedBooking.type || selectedBooking.consultation_type || '', selectedBooking.category)],
                    ['Date', selectedBooking.date || selectedBooking.scheduled_at?.slice(0, 10)],
                    ['Status', STATUS_MAP[selectedBooking.status]?.label || selectedBooking.status],
                    ['Amount', selectedBooking.total_paid ? `₹${selectedBooking.total_paid}` : '—'],
                    ['City', selectedBooking.city || selectedBooking.district || '—'],
                  ].map(([label, value]) => (
                    <div key={label as string} className="drawer-detail-row">
                      <span className="drawer-detail-label">{label}</span>
                      <span className="drawer-detail-value">{value || '—'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BookingsScreen;
