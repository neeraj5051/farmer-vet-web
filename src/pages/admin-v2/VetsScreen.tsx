import { useEffect, useMemo, useState } from 'react';
import { getVets } from '../../services/adminService';
import { Search, Download, Loader2, Eye, X, UserSquare2, ShieldCheck, Wifi, Star } from 'lucide-react';
import '../../components/admin-v2/ListScreens.css';

import { useFilters } from '../../context/FilterContext';
import { applyGlobalFilters } from '../../utils/filterUtils';

const PAGE_SIZE = 10;

const VetsScreen = () => {
  const { dateRange, stateFilter, serviceFilter } = useFilters();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [specFilter, setSpecFilter] = useState('all');
  const [selectedVet, setSelectedVet] = useState<any>(null);
  const [drawerTab, setDrawerTab] = useState('overview');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getVets();
        setData(Array.isArray(result) ? result : []);
      } catch (err) {
        console.error('Error fetching vets:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const specializations = useMemo(() => {
    const specs = new Set<string>();
    data.forEach(v => { if (v.specialization) specs.add(v.specialization); });
    return Array.from(specs).sort();
  }, [data]);

  const filtered = useMemo(() => {
    let result = applyGlobalFilters(data, { dateRange, stateFilter, serviceFilter });
    if (statusFilter === 'verified') result = result.filter(v => v.verification_status === 'verified');
    else if (statusFilter === 'pending') result = result.filter(v => v.verification_status === 'pending');
    else if (statusFilter === 'active') result = result.filter(v => v.is_active === true);

    if (specFilter !== 'all') {
      result = result.filter(v => v.specialization === specFilter);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(v =>
        v.first_name?.toLowerCase().includes(q) ||
        v.last_name?.toLowerCase().includes(q) ||
        v.phone?.includes(q) ||
        v.specialization?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [data, statusFilter, specFilter, searchTerm, dateRange, stateFilter, serviceFilter]);

  const stats = useMemo(() => ({
    total: data.length,
    verified: data.filter(v => v.verification_status === 'verified').length,
    active: data.filter(v => v.is_active === true).length,
    online: data.filter(v => v.is_online === true).length,
  }), [data]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) return (
    <div className="loading-spinner">
      <Loader2 size={36} />
      <p>Loading veterinarians...</p>
    </div>
  );

  return (
    <div>
      <div className="list-screen-header">
        <div>
          <h1 className="list-screen-title">Vets</h1>
          <p className="list-screen-subtitle">Manage veterinarian profiles and performance</p>
        </div>
        <button className="export-btn"><Download size={16} /> Export CSV</button>
      </div>

      <div className="list-filter-bar">
        <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input className="filter-search" style={{ paddingLeft: 36 }} placeholder="Search by name or phone..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setPage(1); }} />
        </div>
        <select className="filter-select" value={specFilter} onChange={e => { setSpecFilter(e.target.value); setPage(1); }}>
          <option value="all">All Specializations</option>
          {specializations.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="filter-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="all">All Statuses</option>
          <option value="verified">Verified</option>
          <option value="pending">Pending Verification</option>
          <option value="active">Active</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="list-kpi-row">
        {[
          { label: 'Total Vets', value: stats.total, icon: <UserSquare2 size={16} />, bg: '#dbeafe', color: '#3b82f6' },
          { label: 'Verified Vets', value: stats.verified, icon: <ShieldCheck size={16} />, bg: '#dcfce7', color: '#10b981' },
          { label: 'Active Vets', value: stats.active, icon: <Star size={16} />, bg: '#fef3c7', color: '#f59e0b' },
          { label: 'Online Now', value: stats.online, icon: <Wifi size={16} />, bg: '#ede9fe', color: '#8b5cf6' },
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
                <th>Vet</th>
                <th>Specialization</th>
                <th>City</th>
                <th>Total Consultations</th>
                <th>Completed</th>
                <th>Rating</th>
                <th>Earnings</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(v => (
                <tr key={v.id} onClick={() => { setSelectedVet(v); setDrawerTab('overview'); }}>
                  <td>
                    <div className="list-cell-name">
                      <div className="list-cell-avatar" style={{ backgroundColor: '#dbeafe', color: '#1e40af' }}>
                        {(v.first_name || 'V')[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500 }}>Dr. {v.first_name} {v.last_name}</div>
                      </div>
                    </div>
                  </td>
                  <td>{v.specialization || '—'}</td>
                  <td>{v.base_location || v.registration_state || '—'}</td>
                  <td style={{ fontWeight: 600 }}>{v.total_consultations || 0}</td>
                  <td>{v.completed_consultations || 0}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Star size={14} color="#f59e0b" fill="#f59e0b" />
                      <span style={{ fontWeight: 600 }}>{v.rating || '—'}</span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{v.total_earnings ? `₹${v.total_earnings.toLocaleString()}` : '—'}</td>
                  <td>
                    <span className="list-status-badge" style={{
                      backgroundColor: v.verification_status === 'verified' ? '#dcfce7' : v.verification_status === 'rejected' ? '#fee2e2' : '#fef3c7',
                      color: v.verification_status === 'verified' ? '#166534' : v.verification_status === 'rejected' ? '#991b1b' : '#92400e'
                    }}>
                      {v.verification_status || 'Pending'}
                    </span>
                  </td>
                  <td>
                    <button onClick={e => { e.stopPropagation(); setSelectedVet(v); setDrawerTab('overview'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr><td colSpan={9} className="list-empty">No vets found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="list-pagination">
            <span>Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} vets</span>
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

      {/* Vet Profile Drawer */}
      {selectedVet && (
        <>
          <div className="profile-drawer-overlay" onClick={() => setSelectedVet(null)} />
          <div className="profile-drawer">
            <div className="drawer-header">
              <div className="drawer-profile">
                <div className="drawer-avatar" style={{ backgroundColor: '#dbeafe', color: '#1e40af' }}>{(selectedVet.first_name || 'V')[0]}</div>
                <div>
                  <div className="drawer-name">Dr. {selectedVet.first_name} {selectedVet.last_name}</div>
                  <div className="drawer-meta">{selectedVet.phone} · {selectedVet.base_location || '—'}</div>
                </div>
              </div>
              <button className="drawer-close" onClick={() => setSelectedVet(null)}><X size={20} /></button>
            </div>
            <div className="drawer-tabs">
              {['overview', 'consultations', 'earnings', 'documents'].map(tab => (
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
                    ['Specialization', selectedVet.specialization || '—'],
                    ['Qualification', selectedVet.qualification || '—'],
                    ['Experience', selectedVet.years_of_experience ? `${selectedVet.years_of_experience} years` : '—'],
                    ['License Number', selectedVet.license_number || '—'],
                    ['Registration State', selectedVet.registration_state || '—'],
                    ['Join Date', selectedVet.created_at?.slice(0, 10) || '—'],
                    ['Total Consultations', selectedVet.total_consultations || 0],
                    ['Completed', selectedVet.completed_consultations || 0],
                    ['Average Rating', selectedVet.rating || '—'],
                    ['Total Earnings', selectedVet.total_earnings ? `₹${selectedVet.total_earnings.toLocaleString()}` : '—'],
                    ['Verification', selectedVet.verification_status || 'Pending'],
                    ['Active', selectedVet.is_active ? 'Yes' : 'No'],
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

export default VetsScreen;
