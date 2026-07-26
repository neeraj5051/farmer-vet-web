import { useEffect, useMemo, useState } from 'react';
import { getFarmers } from '../../services/adminService';
import { Search, Download, Loader2, Eye, X, Users, UserPlus, UserCheck, Repeat } from 'lucide-react';
import '../../components/admin-v2/ListScreens.css';

import { useFilters } from '../../context/FilterContext';
import { filterByState } from '../../utils/filterUtils';

const PAGE_SIZE = 10;

const FarmersScreen = () => {
  const { stateFilter } = useFilters();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedFarmer, setSelectedFarmer] = useState<any>(null);
  const [drawerTab, setDrawerTab] = useState('overview');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getFarmers();
        setData(Array.isArray(result) ? result : []);
      } catch (err) {
        console.error('Error fetching farmers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    let result = [...data];

    if (stateFilter && stateFilter !== 'All States' && stateFilter !== 'all') {
      result = filterByState(result, stateFilter);
    }

    if (statusFilter === 'active') result = result.filter(f => f.is_active !== false);
    else if (statusFilter === 'inactive') result = result.filter(f => f.is_active === false);

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(f =>
        f.first_name?.toLowerCase().includes(q) ||
        f.last_name?.toLowerCase().includes(q) ||
        f.phone?.includes(q) ||
        f.district?.toLowerCase().includes(q) ||
        f.village?.toLowerCase().includes(q) ||
        f.state?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [data, statusFilter, searchTerm, stateFilter]);

  const stats = useMemo(() => {
    const now = new Date();
    const monthAgo = new Date(now.getTime() - 30 * 86400000);
    return {
      total: data.length,
      newThisMonth: data.filter(f => new Date(f.created_at || '') >= monthAgo).length,
      active: data.filter(f => f.is_active === true).length,
      repeat: data.filter(f => (f.total_bookings || 0) > 1).length,
    };
  }, [data]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) return (
    <div className="loading-spinner">
      <Loader2 size={36} />
      <p>Loading farmers...</p>
    </div>
  );

  return (
    <div>
      <div className="list-screen-header">
        <div>
          <h1 className="list-screen-title">Farmers</h1>
          <p className="list-screen-subtitle">Manage farmer profiles and their activity</p>
        </div>
        <button className="export-btn"><Download size={16} /> Export CSV</button>
      </div>

      <div className="list-filter-bar">
        <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input className="filter-search" style={{ paddingLeft: 36 }} placeholder="Search by name or phone number..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setPage(1); }} />
        </div>
        <select className="filter-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive / Blocked</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="list-kpi-row">
        {[
          { key: 'total', label: 'Total Farmers', value: stats.total.toLocaleString(), icon: <Users size={16} />, bg: '#dbeafe', color: '#3b82f6' },
          { key: 'new', label: 'New This Month', value: stats.newThisMonth.toLocaleString(), icon: <UserPlus size={16} />, bg: '#dcfce7', color: '#10b981' },
          { key: 'active', label: 'Active Farmers', value: stats.active.toLocaleString(), icon: <UserCheck size={16} />, bg: '#fef3c7', color: '#f59e0b' },
          { key: 'repeat', label: 'Repeat Customers', value: stats.repeat.toLocaleString(), icon: <Repeat size={16} />, bg: '#ede9fe', color: '#8b5cf6' },
        ].map(kpi => (
          <div key={kpi.key} className="list-kpi-card">
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
                <th>Farmer</th>
                <th>Phone</th>
                <th>City / District</th>
                <th>Total Bookings</th>
                <th>Total Spent</th>
                <th>Last Booking</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(f => (
                <tr key={f.id} onClick={() => { setSelectedFarmer(f); setDrawerTab('overview'); }}>
                  <td>
                    <div className="list-cell-name">
                      <div className="list-cell-avatar" style={{ backgroundColor: '#dcfce7', color: '#166534' }}>
                        {(f.first_name || 'F')[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500 }}>{f.first_name} {f.last_name}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{f.phone || '—'}</td>
                  <td>{f.district || f.village || '—'}</td>
                  <td style={{ fontWeight: 600 }}>{f.total_bookings || 0}</td>
                  <td style={{ fontWeight: 600 }}>{f.total_spent ? `₹${f.total_spent.toLocaleString()}` : '—'}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{f.last_booking_date || '—'}</td>
                  <td>
                    <span className="list-status-badge" style={{
                      backgroundColor: f.is_active ? '#dcfce7' : '#fee2e2',
                      color: f.is_active ? '#166534' : '#991b1b'
                    }}>
                      {f.is_active ? 'Active' : 'Blocked'}
                    </span>
                  </td>
                  <td>
                    <button onClick={e => { e.stopPropagation(); setSelectedFarmer(f); setDrawerTab('overview'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr><td colSpan={8} className="list-empty">No farmers found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="list-pagination">
            <span>Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} farmers</span>
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

      {/* Farmer Profile Drawer */}
      {selectedFarmer && (
        <>
          <div className="profile-drawer-overlay" onClick={() => setSelectedFarmer(null)} />
          <div className="profile-drawer">
            <div className="drawer-header">
              <div className="drawer-profile">
                <div className="drawer-avatar">{(selectedFarmer.first_name || 'F')[0]}</div>
                <div>
                  <div className="drawer-name">{selectedFarmer.first_name} {selectedFarmer.last_name}</div>
                  <div className="drawer-meta">{selectedFarmer.phone} · {selectedFarmer.district || selectedFarmer.state || '—'}</div>
                </div>
              </div>
              <button className="drawer-close" onClick={() => setSelectedFarmer(null)}><X size={20} /></button>
            </div>
            <div className="drawer-tabs">
              {['overview', 'animals', 'bookings', 'payments'].map(tab => (
                <button key={tab} className={`drawer-tab ${drawerTab === tab ? 'active' : ''}`} onClick={() => setDrawerTab(tab)}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            <div className="drawer-body">
              {drawerTab === 'overview' ? (
                <div className="drawer-section">
                  <div className="drawer-section-title">Profile Details</div>
                  {[
                    ['Join Date', selectedFarmer.created_at?.slice(0, 10) || '—'],
                    ['Total Bookings', selectedFarmer.total_bookings || 0],
                    ['Completed Bookings', selectedFarmer.completed_bookings || '—'],
                    ['Total Spent', selectedFarmer.total_spent ? `₹${selectedFarmer.total_spent.toLocaleString()}` : '—'],
                    ['Last Booking', selectedFarmer.last_booking_date || '—'],
                    ['Preferred Service', selectedFarmer.preferred_service || '—'],
                    ['Favourite Vet', selectedFarmer.favourite_vet || '—'],
                    ['Village', selectedFarmer.village || '—'],
                    ['District', selectedFarmer.district || '—'],
                    ['State', selectedFarmer.state || '—'],
                    ['Pincode', selectedFarmer.pincode || '—'],
                    ['Language', selectedFarmer.preferred_language || 'en'],
                  ].map(([label, value]) => (
                    <div key={label as string} className="drawer-detail-row">
                      <span className="drawer-detail-label">{label}</span>
                      <span className="drawer-detail-value">{String(value)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="list-empty" style={{ padding: '40px 0' }}>
                  {drawerTab.charAt(0).toUpperCase() + drawerTab.slice(1)} data will be loaded from the API in a future update.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FarmersScreen;
