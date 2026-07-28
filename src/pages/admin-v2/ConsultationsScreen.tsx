import { useEffect, useMemo, useState } from 'react';
import { getConsultations, getConsultationDetail } from '../../services/consultationsService';
import { markConsultationNoShow } from '../../services/adminService';
import { Search, Download, Loader2, Eye, X, Video, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
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

const ConsultationsScreen = () => {
  const { dateRange, stateFilter, serviceFilter: globalServiceFilter } = useFilters();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [selectedConsult, setSelectedConsult] = useState<any>(null);
  const [, setConsultDetail] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [drawerTab, setDrawerTab] = useState('overview');
  const [page, setPage] = useState(1);

  const fetchData = async () => {
    try {
      const result = await getConsultations();
      const list = result?.summary || (Array.isArray(result) ? result : []);
      setData(list);
    } catch (err) {
      console.error('Error fetching consultations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = useMemo(() => {
    let result = applyGlobalFilters(data, { dateRange, stateFilter, serviceFilter: globalServiceFilter });
    if (statusFilter === 'live') result = result.filter(c => ['AWAITING_PAYMENT', 'PENDING', 'CONFIRMED', 'IN_PROGRESS'].includes(c.status));
    else if (statusFilter === 'completed') result = result.filter(c => ['COMPLETED', 'COMPLETED_NO_PRESCRIPTION'].includes(c.status));
    else if (statusFilter === 'noshow') result = result.filter(c => ['NO_SHOW', 'NO_SHOW_VET', 'NO_SHOW_FARMER'].includes(c.status));
    else if (statusFilter === 'cancelled') result = result.filter(c => ['CANCELLED', 'REJECTED'].includes(c.status));

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
        c.public_id?.toLowerCase().includes(q) ||
        c.id?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [data, statusFilter, serviceFilter, searchTerm, dateRange, stateFilter, globalServiceFilter]);

  const stats = useMemo(() => ({
    total: data.length,
    live: data.filter(c => ['AWAITING_PAYMENT', 'PENDING', 'CONFIRMED', 'IN_PROGRESS'].includes(c.status)).length,
    completed: data.filter(c => ['COMPLETED', 'COMPLETED_NO_PRESCRIPTION'].includes(c.status)).length,
    noshow: data.filter(c => ['NO_SHOW', 'NO_SHOW_VET', 'NO_SHOW_FARMER'].includes(c.status)).length,
    cancelled: data.filter(c => ['CANCELLED', 'REJECTED'].includes(c.status)).length,
  }), [data]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleView = async (consult: any) => {
    setSelectedConsult(consult);
    setConsultDetail(null);
    setDrawerTab('overview');
    setLoadingDetail(true);
    try {
      const detail = await getConsultationDetail(consult.id);
      setConsultDetail(detail);
    } catch { /* ignore */ } finally {
      setLoadingDetail(false);
    }
  };

  const handleMarkNoShow = async (target: 'farmer' | 'vet') => {
    if (!selectedConsult) return;
    const reason = prompt(`Enter reason for marking as ${target} no-show:`);
    if (!reason) return;
    try {
      await markConsultationNoShow(selectedConsult.id, target, reason);
      alert(`Successfully marked as ${target} no-show.`);
      setSelectedConsult(null);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to mark no-show');
    }
  };

  if (loading) return (
    <div className="loading-spinner">
      <Loader2 size={36} />
      <p>Loading consultations...</p>
    </div>
  );

  return (
    <div>
      <div className="list-screen-header">
        <div>
          <h1 className="list-screen-title">Consultations</h1>
          <p className="list-screen-subtitle">Track all consultations and their status</p>
        </div>
        <button className="export-btn"><Download size={16} /> Export CSV</button>
      </div>

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
          <input className="filter-search" style={{ paddingLeft: 36 }} placeholder="Search by ID, farmer or vet..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setPage(1); }} />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="list-kpi-row">
        {[
          { key: 'all', label: 'Total Consultations', value: stats.total, icon: <Video size={16} />, bg: '#dbeafe', color: '#3b82f6' },
          { key: 'live', label: 'Live', value: stats.live, icon: <Clock size={16} />, bg: '#fef3c7', color: '#f59e0b' },
          { key: 'completed', label: 'Completed', value: stats.completed, icon: <CheckCircle size={16} />, bg: '#dcfce7', color: '#10b981' },
          { key: 'noshow', label: 'No Show', value: stats.noshow, icon: <AlertTriangle size={16} />, bg: '#fde8d8', color: '#ea580c' },
          { key: 'cancelled', label: 'Cancelled', value: stats.cancelled, icon: <XCircle size={16} />, bg: '#fee2e2', color: '#ef4444' },
        ].map(kpi => (
          <div key={kpi.key} className={`list-kpi-card ${statusFilter === kpi.key ? 'active' : ''}`} onClick={() => { setStatusFilter(kpi.key === 'all' ? 'all' : kpi.key); setPage(1); }}>
            <div className="list-kpi-icon" style={{ backgroundColor: kpi.bg, color: kpi.color }}>
              {kpi.icon}
              {kpi.key === 'live' && stats.live > 0 && <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981', position: 'absolute', top: 8, right: 8, animation: 'pulse 2s infinite' }} />}
            </div>
            <div className="list-kpi-value">{kpi.value}</div>
            <div className="list-kpi-label">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="list-table-card">
        <div className="list-tabs">
          {['all', 'live', 'completed', 'noshow', 'cancelled'].map(tab => (
            <button key={tab} className={`list-tab ${statusFilter === tab ? 'active' : ''}`} onClick={() => { setStatusFilter(tab); setPage(1); }}>
              {tab === 'all' ? 'All Consultations' : tab === 'noshow' ? 'No Show' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="list-table">
            <thead>
              <tr>
                <th>Consultation ID</th>
                <th>Farmer</th>
                <th>Vet</th>
                <th>Service</th>
                <th>Date</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(c => {
                const s = STATUS_MAP[c.status] || { bg: '#f3f4f6', text: '#6b7280', label: c.status };
                return (
                  <tr key={c.id} onClick={() => handleView(c)}>
                    <td style={{ fontWeight: 600, color: '#0a4f32', fontFamily: 'monospace', fontSize: '0.85rem' }}>{c.public_id || c.id?.slice(0, 13) || '—'}</td>
                    <td>
                      <div className="list-cell-name">
                        <div className="list-cell-avatar" style={{ backgroundColor: '#dcfce7', color: '#166534' }}>
                          {(c.farmer_name || 'F')[0]}
                        </div>
                        {c.farmer_name || '—'}
                      </div>
                    </td>
                    <td>
                      <div className="list-cell-name">
                        <div className="list-cell-avatar" style={{ backgroundColor: '#dbeafe', color: '#1e40af' }}>
                          {(c.vet_name || 'V')[0]}
                        </div>
                        {c.vet_name || '—'}
                      </div>
                    </td>
                    <td>{getServiceLabel(c.type || c.consultation_type || '', c.category)}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{c.date || '—'}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{c.duration ? `${c.duration} min` : '—'}</td>
                    <td><span className="list-status-badge" style={{ backgroundColor: s.bg, color: s.text }}>{s.label}</span></td>
                    <td style={{ fontWeight: 600 }}>{c.total_paid ? `₹${c.total_paid}` : '—'}</td>
                    <td>
                      <button onClick={e => { e.stopPropagation(); handleView(c); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {paginated.length === 0 && (
                <tr><td colSpan={9} className="list-empty">No consultations found matching your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="list-pagination">
            <span>Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} consultations</span>
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
      {selectedConsult && (
        <>
          <div className="profile-drawer-overlay" onClick={() => setSelectedConsult(null)} />
          <div className="profile-drawer">
            <div className="drawer-header">
              <div className="drawer-profile">
                <div className="drawer-avatar">{(selectedConsult.vet_name || 'C')[0]}</div>
                <div>
                  <div className="drawer-name">Dr. {selectedConsult.vet_name || 'Unknown'}</div>
                  <div className="drawer-meta">{selectedConsult.id?.slice(0, 13)}</div>
                </div>
              </div>
              <button className="drawer-close" onClick={() => setSelectedConsult(null)}><X size={20} /></button>
            </div>
            <div className="drawer-tabs">
              {['overview', 'actions'].map(tab => (
                <button key={tab} className={`drawer-tab ${drawerTab === tab ? 'active' : ''}`} onClick={() => setDrawerTab(tab)}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            <div className="drawer-body">
              {loadingDetail ? (
                <div className="loading-spinner"><Loader2 size={24} /><p>Loading...</p></div>
              ) : drawerTab === 'overview' ? (
                <div className="drawer-section">
                  <div className="drawer-section-title">Consultation Details</div>
                  {[
                    ['Farmer', selectedConsult.farmer_name],
                    ['Vet', selectedConsult.vet_name],
                    ['Service', getServiceLabel(selectedConsult.type || selectedConsult.consultation_type || '', selectedConsult.category)],
                    ['Date', selectedConsult.date],
                    ['Status', STATUS_MAP[selectedConsult.status]?.label || selectedConsult.status],
                    ['Duration', selectedConsult.duration ? `${selectedConsult.duration} min` : '—'],
                    ['Amount', selectedConsult.total_paid ? `₹${selectedConsult.total_paid}` : '—'],
                    ['Platform Revenue', selectedConsult.platform_revenue ? `₹${selectedConsult.platform_revenue}` : '—'],
                  ].map(([label, value]) => (
                    <div key={label as string} className="drawer-detail-row">
                      <span className="drawer-detail-label">{label}</span>
                      <span className="drawer-detail-value">{value || '—'}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="drawer-section">
                  <div className="drawer-section-title">Actions</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <button onClick={() => handleMarkNoShow('farmer')} style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid #fee2e2', background: '#fff5f5', color: '#dc2626', fontWeight: 600, cursor: 'pointer' }}>
                      Mark Farmer No Show
                    </button>
                    <button onClick={() => handleMarkNoShow('vet')} style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid #fee2e2', background: '#fff5f5', color: '#dc2626', fontWeight: 600, cursor: 'pointer' }}>
                      Mark Vet No Show
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ConsultationsScreen;
