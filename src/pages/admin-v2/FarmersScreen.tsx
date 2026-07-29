import { useEffect, useMemo, useState } from 'react';
import { getFarmers, updateFarmerProfile } from '../../services/adminService';
import { getConsultations } from '../../services/consultationsService';
import { 
  Search, 
  Download, 
  Loader2, 
  Eye, 
  X, 
  Users, 
  UserPlus, 
  UserCheck, 
  Repeat,
  Edit3
} from 'lucide-react';
import '../../components/admin-v2/ListScreens.css';

import { useFilters } from '../../context/FilterContext';
import { filterByState } from '../../utils/filterUtils';



const FarmersScreen = () => {
  const { stateFilter } = useFilters();
  const [data, setData] = useState<any[]>([]);
  const [allConsultations, setAllConsultations] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedFarmer, setSelectedFarmer] = useState<any>(null);
  const [drawerTab, setDrawerTab] = useState('overview');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingFarmer, setEditingFarmer] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    village: '',
    district: '',
    state: '',
    pincode: '',
    preferred_language: 'en',
    is_active: true
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [farmersData, consultsData] = await Promise.all([
        getFarmers(),
        getConsultations()
      ]);
      setData(Array.isArray(farmersData) ? farmersData : []);
      setAllConsultations(consultsData?.summary || (Array.isArray(consultsData) ? consultsData : []));
    } catch (err) {
      console.error('Error fetching farmers:', err);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (farmer: any) => {
    setEditingFarmer(farmer);
    setEditForm({
      first_name: farmer.first_name || '',
      last_name: farmer.last_name || '',
      phone: farmer.phone || '',
      village: farmer.village || '',
      district: farmer.district || '',
      state: farmer.state || '',
      pincode: farmer.pincode || '',
      preferred_language: farmer.preferred_language || 'en',
      is_active: farmer.is_active !== undefined ? farmer.is_active : true
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.first_name.trim()) return;
    try {
      await updateFarmerProfile(editingFarmer.id, editForm);
      setIsEditModalOpen(false);
      if (selectedFarmer && selectedFarmer.id === editingFarmer.id) {
        setSelectedFarmer({ ...selectedFarmer, ...editForm });
      }
      fetchData();
    } catch (err) {
      console.error('Error updating farmer profile:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute dynamic farmer metrics
  const farmersWithMetrics = useMemo(() => {
    return data.map(f => {
      const fName = (f.first_name || '').toLowerCase().trim();
      const lName = (f.last_name || '').toLowerCase().trim();
      
      const matches = allConsultations.filter(c => {
        const dbFarmerId = c.farmer_id || c.farmerId;
        if (dbFarmerId && String(dbFarmerId) === String(f.id)) return true;
        
        const farmerName = (c.farmer_name || c.farmerName || '').toLowerCase();
        if (fName && farmerName.includes(fName)) return true;
        if (lName && farmerName.includes(lName)) return true;
        return false;
      });
      
      const totalBookings = matches.length;
      const totalSpent = matches.reduce((sum, c) => sum + (Number(c.fee) || 0), 0);
      
      let lastBookingDate = '—';
      if (matches.length > 0) {
        const sorted = [...matches].sort((a, b) => new Date(b.date || b.created_at).getTime() - new Date(a.date || a.created_at).getTime());
        lastBookingDate = sorted[0].date?.slice(0, 10) || sorted[0].created_at?.slice(0, 10) || '—';
      }
      
      return {
        ...f,
        total_bookings: totalBookings,
        total_spent: totalSpent,
        last_booking_date: lastBookingDate
      };
    });
  }, [data, allConsultations]);

  const filtered = useMemo(() => {
    let result = [...farmersWithMetrics];

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
  }, [farmersWithMetrics, statusFilter, searchTerm, stateFilter]);

  const stats = useMemo(() => {
    const now = new Date();
    const monthAgo = new Date(now.getTime() - 30 * 86400000);
    return {
      total: farmersWithMetrics.length,
      newThisMonth: farmersWithMetrics.filter(f => new Date(f.created_at || '') >= monthAgo).length,
      active: farmersWithMetrics.filter(f => f.is_active === true).length,
      repeat: farmersWithMetrics.filter(f => f.total_bookings > 1).length,
    };
  }, [farmersWithMetrics]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  // Filtered consultations for the active drawer farmer
  const farmerConsultations = useMemo(() => {
    if (!selectedFarmer) return [];
    const fName = (selectedFarmer.first_name || '').toLowerCase().trim();
    const lName = (selectedFarmer.last_name || '').toLowerCase().trim();
    return allConsultations.filter(c => {
      const dbFarmerId = c.farmer_id || c.farmerId;
      if (dbFarmerId && String(dbFarmerId) === String(selectedFarmer.id)) return true;
      
      const farmerName = (c.farmer_name || c.farmerName || '').toLowerCase();
      if (fName && farmerName.includes(fName)) return true;
      if (lName && farmerName.includes(lName)) return true;
      return false;
    });
  }, [selectedFarmer, allConsultations]);

  if (loading && data.length === 0) return (
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

      {/* Horizontal filter bar */}
      <div className="list-filter-bar" style={{ display: 'flex', flexDirection: 'row', gap: '12px', alignItems: 'center', marginBottom: '24px', flexWrap: 'nowrap' }}>
        <div style={{ position: 'relative', width: '280px', flexShrink: 0 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input className="filter-search" style={{ paddingLeft: 36, width: '100%', boxSizing: 'border-box' }} placeholder="Search by name or phone..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setPage(1); }} />
        </div>
        <select className="filter-select" style={{ width: '200px', flexShrink: 0 }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive / Blocked</option>
        </select>
        {(searchTerm || statusFilter !== 'all') && (
          <button 
            type="button" 
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setPage(1);
            }}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#ef4444', 
              fontSize: '0.82rem', 
              fontWeight: 600, 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '6px 12px'
            }}
          >
            Clear Filters
          </button>
        )}
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
                <tr key={f.id}>
                  <td>
                    <div className="list-cell-name">
                      <div className="list-cell-avatar" style={{ backgroundColor: '#dcfce7', color: '#166534' }}>
                        {(f.first_name || 'F')[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{f.first_name} {f.last_name}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ verticalAlign: 'middle', color: 'var(--text-secondary)' }}>{f.phone || '—'}</td>
                  <td style={{ verticalAlign: 'middle' }}>{f.district || f.village || f.state || '—'}</td>
                  <td style={{ verticalAlign: 'middle', fontWeight: 600 }}>{f.total_bookings || 0}</td>
                  <td style={{ verticalAlign: 'middle', fontWeight: 600 }}>{f.total_spent ? `₹${f.total_spent.toLocaleString()}` : '—'}</td>
                  <td style={{ verticalAlign: 'middle', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{f.last_booking_date || '—'}</td>
                  <td style={{ verticalAlign: 'middle' }}>
                    <span className="list-status-badge" style={{
                      backgroundColor: f.is_active ? '#dcfce7' : '#fee2e2',
                      color: f.is_active ? '#166534' : '#991b1b'
                    }}>
                      {f.is_active ? 'Active' : 'Blocked'}
                    </span>
                  </td>
                  <td style={{ verticalAlign: 'middle' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button onClick={e => { e.stopPropagation(); startEdit(f); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--humal-green)' }} title="Edit Profile">
                        <Edit3 size={18} />
                      </button>
                      <button onClick={e => { e.stopPropagation(); setSelectedFarmer(f); setDrawerTab('overview'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }} title="View Profile">
                        <Eye size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr><td colSpan={8} className="list-empty">No farmers found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="list-pagination">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span>Showing {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1} to {Math.min(page * pageSize, filtered.length)} of {filtered.length} farmers</span>
            <select 
              className="list-pagination-select" 
              value={pageSize}
              onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
            >
              <option value="10">10 / page</option>
              <option value="20">20 / page</option>
              <option value="50">50 / page</option>
            </select>
          </div>
          {totalPages > 1 && (
            <div className="list-pagination-buttons">
              <button className="list-pagination-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>←</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                <button key={p} className={`list-pagination-btn ${page === p ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
              ))}
              {totalPages > 5 && <span style={{ padding: '6px 8px' }}>...</span>}
              <button className="list-pagination-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>→</button>
            </div>
          )}
        </div>
      </div>

      {/* Farmer Profile Drawer */}
      {selectedFarmer && (
        <>
          <div className="profile-drawer-overlay" onClick={() => setSelectedFarmer(null)} />
          <div className="profile-drawer">
            <div className="drawer-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="drawer-profile">
                <div className="drawer-avatar">{(selectedFarmer.first_name || 'F')[0]}</div>
                <div>
                  <div className="drawer-name">{selectedFarmer.first_name} {selectedFarmer.last_name}</div>
                  <div className="drawer-meta">{selectedFarmer.phone} · {selectedFarmer.district || selectedFarmer.state || '—'}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button 
                  onClick={() => startEdit(selectedFarmer)} 
                  className="export-btn" 
                  style={{ fontSize: '0.8rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Edit3 size={14} /> Edit Profile
                </button>
                <button className="drawer-close" onClick={() => setSelectedFarmer(null)} style={{ margin: 0 }}><X size={20} /></button>
              </div>
            </div>
            <div className="drawer-tabs">
              {['overview', 'animals', 'bookings', 'payments'].map(tab => (
                <button key={tab} className={`drawer-tab ${drawerTab === tab ? 'active' : ''}`} onClick={() => setDrawerTab(tab)}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            <div className="drawer-body">
              {drawerTab === 'overview' && (
                <div className="drawer-section">
                  <div className="drawer-section-title">Profile Details</div>
                  {[
                    ['Join Date', selectedFarmer.created_at?.slice(0, 10) || '—'],
                    ['Total Bookings', selectedFarmer.total_bookings || 0],
                    ['Total Spent', selectedFarmer.total_spent ? `₹${selectedFarmer.total_spent.toLocaleString()}` : '—'],
                    ['Last Booking', selectedFarmer.last_booking_date || '—'],
                    ['Village', selectedFarmer.village || '—'],
                    ['District', selectedFarmer.district || '—'],
                    ['State', selectedFarmer.state || '—'],
                    ['Pincode', selectedFarmer.pincode || '—'],
                    ['Language', selectedFarmer.preferred_language || 'en'],
                    ['Status', selectedFarmer.is_active ? 'Active' : 'Blocked'],
                  ].map(([label, value]) => (
                    <div key={label as string} className="drawer-detail-row">
                      <span className="drawer-detail-label">{label}</span>
                      <span className="drawer-detail-value">{String(value)}</span>
                    </div>
                  ))}
                </div>
              )}

              {drawerTab === 'animals' && (
                <div className="drawer-section">
                  <div className="drawer-section-title">Registered Animals</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 10 }}>
                    {[
                      { type: 'Cow', breed: 'Sahiwal Cross', count: 2, remarks: 'Daily milk yielding' },
                      { type: 'Buffalo', breed: 'Murrah Grade A', count: 1, remarks: 'Vaccinated for FMD' },
                    ].map((animal, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: 12, padding: 12, border: '1px solid var(--border-color)', borderRadius: 8, backgroundColor: '#fff' }}>
                        <div style={{ width: 36, height: 36, borderRadius: 6, backgroundColor: '#e6f4ea', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#166534', fontWeight: 'bold' }}>
                          🐄
                        </div>
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{animal.type} ({animal.breed})</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Count: {animal.count} · {animal.remarks}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {drawerTab === 'bookings' && (
                <div className="drawer-section">
                  <div className="drawer-section-title">Booking History ({farmerConsultations.length})</div>
                  {farmerConsultations.length === 0 ? (
                    <div className="list-empty" style={{ padding: '30px 0' }}>No bookings found for this farmer.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {farmerConsultations.map(c => (
                        <div key={c.id} style={{ border: '1px solid var(--border-color)', borderRadius: 8, padding: 12, backgroundColor: '#fafafa' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{c.id}</span>
                            <span className="list-status-badge" style={{ 
                              fontSize: '0.7rem', 
                              backgroundColor: c.status === 'COMPLETED' ? '#dcfce7' : '#fef3c7',
                              color: c.status === 'COMPLETED' ? '#166534' : '#92400e'
                            }}>{c.status}</span>
                          </div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Doctor: <strong>{c.vet_name}</strong></div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Service: {c.category || 'General Consultation'}</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #eee', marginTop: 8, paddingTop: 6, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            <span>{c.date?.slice(0, 10) || c.created_at?.slice(0, 10)}</span>
                            <strong style={{ color: 'var(--text-primary)' }}>₹{c.fee}</strong>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {drawerTab === 'payments' && (
                <div className="drawer-section">
                  <div className="drawer-section-title">Payments Log ({farmerConsultations.length})</div>
                  {farmerConsultations.length === 0 ? (
                    <div className="list-empty" style={{ padding: '30px 0' }}>No payment logs found for this farmer.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {farmerConsultations.map((c, idx) => (
                        <div key={idx} style={{ border: '1px solid var(--border-color)', borderRadius: 8, padding: 12, backgroundColor: '#fafafa' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Ref: PAY-{(c.id || idx).slice(-6)}</span>
                            <span className="list-status-badge" style={{ 
                              fontSize: '0.7rem', 
                              backgroundColor: '#dcfce7',
                              color: '#166534'
                            }}>PAID</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                            <span>Consultation Fee ({c.id})</span>
                            <strong style={{ color: 'var(--text-primary)' }}>₹{c.fee}</strong>
                          </div>
                          <div style={{ borderTop: '1px solid #eee', marginTop: 8, paddingTop: 6, display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            <span>Date: {c.date?.slice(0, 10)}</span>
                            <span>Mode: Razorpay Online</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* EDIT FARMER PROFILE MODAL */}
      {isEditModalOpen && (
        <div 
          style={{ 
            position: 'fixed', 
            inset: 0, 
            backgroundColor: 'rgba(15, 23, 42, 0.4)', 
            backdropFilter: 'blur(8px)', 
            zIndex: 9999, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: 24 
          }}
          onClick={() => setIsEditModalOpen(false)}
        >
          <div 
            style={{ 
              backgroundColor: '#fff', 
              borderRadius: 16, 
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', 
              width: '100%', 
              maxWidth: 600, 
              maxHeight: '85vh', 
              display: 'flex', 
              flexDirection: 'column', 
              overflow: 'hidden',
              border: '1px solid var(--border-color)' 
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div 
              style={{ 
                padding: '20px 24px', 
                borderBottom: '1px solid var(--border-color)', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                backgroundColor: '#fafafa'
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Edit Farmer Profile
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Update farmer details, address records, preferred language, and status.
                </p>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(false)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden' }}>
              <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>First Name *</label>
                    <input type="text" required className="modal-input" value={editForm.first_name} onChange={e => setEditForm({ ...editForm, first_name: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Last Name</label>
                    <input type="text" className="modal-input" value={editForm.last_name} onChange={e => setEditForm({ ...editForm, last_name: e.target.value })} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Phone *</label>
                    <input type="text" required className="modal-input" value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Preferred Language</label>
                    <select className="modal-input" value={editForm.preferred_language} onChange={e => setEditForm({ ...editForm, preferred_language: e.target.value })}>
                      <option value="en">English (en)</option>
                      <option value="hi">Hindi (hi)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Village / Area</label>
                    <input type="text" className="modal-input" value={editForm.village} onChange={e => setEditForm({ ...editForm, village: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Pincode</label>
                    <input type="text" className="modal-input" value={editForm.pincode} onChange={e => setEditForm({ ...editForm, pincode: e.target.value })} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>District</label>
                    <input type="text" className="modal-input" value={editForm.district} onChange={e => setEditForm({ ...editForm, district: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>State</label>
                    <input type="text" className="modal-input" value={editForm.state} onChange={e => setEditForm({ ...editForm, state: e.target.value })} />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" id="farmer_is_active" checked={editForm.is_active} onChange={e => setEditForm({ ...editForm, is_active: e.target.checked })} style={{ cursor: 'pointer' }} />
                  <label htmlFor="farmer_is_active" style={{ fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}>Active Farmer Profile</label>
                </div>

              </div>

              {/* Modal Footer */}
              <div 
                style={{ 
                  padding: '16px 24px', 
                  borderTop: '1px solid var(--border-color)', 
                  display: 'flex', 
                  justifyContent: 'flex-end', 
                  gap: 12,
                  backgroundColor: '#fafafa'
                }}
              >
                <button 
                  type="button" 
                  onClick={() => setIsEditModalOpen(false)} 
                  className="export-btn" 
                  style={{ backgroundColor: '#fff', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="export-btn" 
                  style={{ backgroundColor: 'var(--humal-green)', color: '#fff', border: 'none' }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmersScreen;
