import { useEffect, useMemo, useState } from 'react';
import { getSupportTickets } from '../../services/adminService';
import { Search, Download, Loader2, Eye, X, Headphones, AlertCircle, CheckCircle2 } from 'lucide-react';
import '../../components/admin-v2/ListScreens.css';

const PAGE_SIZE = 10;

const MOCK_TICKETS = [
  { id: 'TCK-101', user_name: 'Gurpreet Singh', role: 'Farmer', subject: 'Payment deducted but booking not confirmed', priority: 'High', status: 'Open', created_at: '2026-07-27T10:15:00Z' },
  { id: 'TCK-102', user_name: 'Dr. Ramesh Kumar', role: 'Vet', subject: 'Bank account verification pending', priority: 'Medium', status: 'In Progress', created_at: '2026-07-26T14:30:00Z' },
  { id: 'TCK-103', user_name: 'Rajesh Sharma', role: 'Farmer', subject: 'Unable to connect video call', priority: 'Urgent', status: 'Open', created_at: '2026-07-28T08:00:00Z' },
  { id: 'TCK-104', user_name: 'Dharmendra Yadav', role: 'Farmer', subject: 'Refund query for cancelled appointment', priority: 'Low', status: 'Resolved', created_at: '2026-07-24T16:20:00Z' },
];

const SupportTicketsScreen = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getSupportTickets();
        setData(Array.isArray(result) && result.length > 0 ? result : MOCK_TICKETS);
      } catch (err) {
        console.warn('Backend support tickets endpoint offline. Loading defaults.', err);
        setData(MOCK_TICKETS);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    let result = data;
    if (statusFilter !== 'all') {
      result = result.filter(t => t.status?.toLowerCase() === statusFilter);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(t =>
        t.id?.toLowerCase().includes(q) ||
        t.user_name?.toLowerCase().includes(q) ||
        t.subject?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [data, statusFilter, searchTerm]);

  const stats = useMemo(() => ({
    total: data.length,
    open: data.filter(t => t.status === 'Open').length,
    in_progress: data.filter(t => t.status === 'In Progress').length,
    resolved: data.filter(t => t.status === 'Resolved').length,
  }), [data]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) return (
    <div className="loading-spinner">
      <Loader2 size={36} />
      <p>Loading support tickets...</p>
    </div>
  );

  return (
    <div>
      <div className="list-screen-header">
        <div>
          <h1 className="list-screen-title">Support Ticket Inbox</h1>
          <p className="list-screen-subtitle">Customer support queue for farmers and veterinarians</p>
        </div>
        <button className="export-btn"><Download size={16} /> Export CSV</button>
      </div>

      <div className="list-filter-bar">
        <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input className="filter-search" style={{ paddingLeft: 36 }} placeholder="Search ticket ID or name..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setPage(1); }} />
        </div>
        <select className="filter-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="all">All Statuses</option>
          <option value="open">Open</option>
          <option value="in progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="list-kpi-row">
        {[
          { label: 'Total Tickets', value: stats.total, icon: <Headphones size={16} />, bg: '#dbeafe', color: '#3b82f6' },
          { label: 'Open', value: stats.open, icon: <AlertCircle size={16} />, bg: '#fee2e2', color: '#ef4444' },
          { label: 'In Progress', value: stats.in_progress, icon: <Loader2 size={16} />, bg: '#fef3c7', color: '#f59e0b' },
          { label: 'Resolved', value: stats.resolved, icon: <CheckCircle2 size={16} />, bg: '#dcfce7', color: '#10b981' },
        ].map(kpi => (
          <div key={kpi.label} className="list-kpi-card">
            <div className="list-kpi-icon" style={{ backgroundColor: kpi.bg, color: kpi.color }}>{kpi.icon}</div>
            <div className="list-kpi-value">{kpi.value}</div>
            <div className="list-kpi-label">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="list-table-card">
        <div style={{ overflowX: 'auto' }}>
          <table className="list-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>User</th>
                <th>Subject</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(t => (
                <tr key={t.id} onClick={() => setSelectedTicket(t)}>
                  <td style={{ fontWeight: 600 }}>{t.id}</td>
                  <td>
                    <div>
                      <div style={{ fontWeight: 500 }}>{t.user_name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{t.role}</div>
                    </div>
                  </td>
                  <td>{t.subject}</td>
                  <td>
                    <span className="list-status-badge" style={{
                      backgroundColor: t.priority === 'Urgent' || t.priority === 'High' ? '#fee2e2' : '#fef3c7',
                      color: t.priority === 'Urgent' || t.priority === 'High' ? '#991b1b' : '#92400e'
                    }}>
                      {t.priority}
                    </span>
                  </td>
                  <td>
                    <span className="list-status-badge" style={{
                      backgroundColor: t.status === 'Resolved' ? '#dcfce7' : t.status === 'In Progress' ? '#fef3c7' : '#fee2e2',
                      color: t.status === 'Resolved' ? '#166534' : t.status === 'In Progress' ? '#92400e' : '#991b1b'
                    }}>
                      {t.status}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{t.created_at?.slice(0, 10)}</td>
                  <td>
                    <button onClick={e => { e.stopPropagation(); setSelectedTicket(t); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr><td colSpan={7} className="list-empty">No tickets found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer */}
      {selectedTicket && (
        <>
          <div className="profile-drawer-overlay" onClick={() => setSelectedTicket(null)} />
          <div className="profile-drawer">
            <div className="drawer-header">
              <div className="drawer-name">{selectedTicket.id}: {selectedTicket.subject}</div>
              <button className="drawer-close" onClick={() => setSelectedTicket(null)}><X size={20} /></button>
            </div>
            <div className="drawer-body">
              <div className="drawer-section">
                <div className="drawer-section-title">Ticket Information</div>
                {[
                  ['User Name', selectedTicket.user_name],
                  ['User Role', selectedTicket.role],
                  ['Priority', selectedTicket.priority],
                  ['Status', selectedTicket.status],
                  ['Date Created', selectedTicket.created_at?.slice(0, 10)],
                ].map(([l, v]) => (
                  <div key={l} className="drawer-detail-row">
                    <span className="drawer-detail-label">{l}</span>
                    <span className="drawer-detail-value">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SupportTicketsScreen;
