import { useEffect, useMemo, useState } from 'react';
import { 
  getVets, 
  updateVetProfile, 
  approveVet, 
  blockUser,
  getPayouts
} from '../../services/adminService';
import { getConsultations } from '../../services/consultationsService';
import { 
  Search, 
  Download, 
  Loader2, 
  Eye, 
  X, 
  UserSquare2, 
  ShieldCheck, 
  Wifi, 
  Star, 
  Edit3, 
  Ban,
  FileText
} from 'lucide-react';
import '../../components/admin-v2/ListScreens.css';

import { useFilters } from '../../context/FilterContext';
import { filterByState } from '../../utils/filterUtils';

const PAGE_SIZE = 10;

const VetsScreen = () => {
  const { stateFilter } = useFilters();
  const [data, setData] = useState<any[]>([]);
  const [allConsultations, setAllConsultations] = useState<any[]>([]);
  const [allPayouts, setAllPayouts] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [specFilter, setSpecFilter] = useState('all');
  const [selectedVet, setSelectedVet] = useState<any>(null);
  const [drawerTab, setDrawerTab] = useState('overview');
  const [page, setPage] = useState(1);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingVet, setEditingVet] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    qualification: '',
    specialization: '',
    years_of_experience: 0,
    license_number: '',
    registration_state: '',
    base_location: '',
    is_active: true
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [vetsData, consultsData, payoutsData] = await Promise.all([
        getVets(),
        getConsultations(),
        getPayouts()
      ]);
      setData(Array.isArray(vetsData) ? vetsData : []);
      setAllConsultations(Array.isArray(consultsData) ? consultsData : []);
      setAllPayouts(Array.isArray(payoutsData) ? payoutsData : []);
    } catch (err) {
      console.error('Error fetching vets context:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const specializations = useMemo(() => {
    const specs = new Set<string>();
    data.forEach(v => { if (v.specialization) specs.add(v.specialization); });
    return Array.from(specs).sort();
  }, [data]);

  const filtered = useMemo(() => {
    let result = [...data];
    if (stateFilter && stateFilter !== 'All States' && stateFilter !== 'all') {
      result = filterByState(result, stateFilter);
    }
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
  }, [data, statusFilter, specFilter, searchTerm, stateFilter]);

  const stats = useMemo(() => ({
    total: data.length,
    verified: data.filter(v => v.verification_status === 'verified').length,
    active: data.filter(v => v.is_active === true).length,
    online: data.filter(v => v.is_online === true).length,
  }), [data]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Filtered Consultations for the active drawer vet
  const vetConsultations = useMemo(() => {
    if (!selectedVet) return [];
    const vetNameStr = `Dr. ${selectedVet.first_name} ${selectedVet.last_name}`.toLowerCase();
    const lNameLower = (selectedVet.last_name || '').toLowerCase();
    return allConsultations.filter(c => 
      c.vet_name?.toLowerCase().includes(vetNameStr) ||
      (lNameLower && c.vet_name?.toLowerCase().includes(lNameLower))
    );
  }, [selectedVet, allConsultations]);

  // Filtered Payouts for the active drawer vet
  const vetPayouts = useMemo(() => {
    if (!selectedVet) return [];
    const lNameLower = (selectedVet.last_name || '').toLowerCase();
    return allPayouts.filter(p => 
      p.vet_id === selectedVet.id || 
      (lNameLower && p.vet_name?.toLowerCase().includes(lNameLower))
    );
  }, [selectedVet, allPayouts]);

  // Edit / Action triggers
  const startEdit = (vet: any) => {
    setEditingVet(vet);
    setEditForm({
      first_name: vet.first_name || '',
      last_name: vet.last_name || '',
      phone: vet.phone || '',
      qualification: vet.qualification || '',
      specialization: vet.specialization || '',
      years_of_experience: vet.years_of_experience || 0,
      license_number: vet.license_number || '',
      registration_state: vet.registration_state || '',
      base_location: vet.base_location || '',
      is_active: vet.is_active ?? true
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.first_name.trim()) return;
    try {
      await updateVetProfile(editingVet.id, {
        ...editForm,
        years_of_experience: Number(editForm.years_of_experience)
      });
      setIsEditModalOpen(false);
      if (selectedVet && selectedVet.id === editingVet.id) {
        setSelectedVet({ ...selectedVet, ...editForm });
      }
      await loadData();
    } catch (err) {
      console.error("Failed to update vet profile:", err);
      alert("Failed to update profile.");
    }
  };

  const handleVerification = async (id: string, status: 'verified' | 'rejected') => {
    if (window.confirm(`Are you sure you want to ${status} this veterinarian?`)) {
      try {
        await approveVet(id, status);
        if (selectedVet && selectedVet.id === id) {
          setSelectedVet((prev: any) => ({ ...prev, verification_status: status }));
        }
        await loadData();
      } catch (err) {
        console.error("Failed to change verification status:", err);
        alert("Action failed.");
      }
    }
  };

  const handleBlockToggle = async (id: string, currentActiveStatus: boolean) => {
    const action = currentActiveStatus ? "block" : "activate";
    if (window.confirm(`Are you sure you want to ${action} this veterinarian?`)) {
      try {
        await blockUser(id, currentActiveStatus); 
        if (selectedVet && selectedVet.id === id) {
          setSelectedVet((prev: any) => ({ ...prev, is_active: !currentActiveStatus }));
        }
        await loadData();
      } catch (err) {
        console.error("Failed to toggle block status:", err);
        alert("Action failed.");
      }
    }
  };

  if (loading && data.length === 0) return (
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

      {/* Horizontal filter bar (forced horizontal with flex-wrap: nowrap) */}
      <div className="list-filter-bar" style={{ display: 'flex', flexDirection: 'row', gap: '12px', alignItems: 'center', marginBottom: '24px', flexWrap: 'nowrap' }}>
        <div style={{ position: 'relative', width: '280px', flexShrink: 0 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input className="filter-search" style={{ paddingLeft: 36, width: '100%', boxSizing: 'border-box' }} placeholder="Search by name or phone..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setPage(1); }} />
        </div>
        <select className="filter-select" style={{ width: '200px', flexShrink: 0 }} value={specFilter} onChange={e => { setSpecFilter(e.target.value); setPage(1); }}>
          <option value="all">All Specializations</option>
          {specializations.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="filter-select" style={{ width: '200px', flexShrink: 0 }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="all">All Statuses</option>
          <option value="verified">Verified</option>
          <option value="pending">Pending Verification</option>
          <option value="active">Active</option>
        </select>
        {(searchTerm || specFilter !== 'all' || statusFilter !== 'all') && (
          <button 
            type="button" 
            onClick={() => {
              setSearchTerm('');
              setSpecFilter('all');
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
                <th>Rating</th>
                <th>Earnings</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(v => (
                <tr key={v.id}>
                  <td>
                    <div className="list-cell-name">
                      <div className="list-cell-avatar" style={{ backgroundColor: '#dbeafe', color: '#1e40af' }}>
                        {(v.first_name || 'V')[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>Dr. {v.first_name} {v.last_name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          {v.phone} {v.qualification && `· ${v.qualification}`}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ verticalAlign: 'middle', maxWidth: '200px' }}>
                    <div 
                      style={{ 
                        textOverflow: 'ellipsis', 
                        whiteSpace: 'nowrap', 
                        overflow: 'hidden',
                        fontSize: '0.85rem',
                        color: 'var(--text-primary)'
                      }} 
                      title={v.specialization || '—'}
                    >
                      {v.specialization || '—'}
                    </div>
                  </td>
                  <td style={{ verticalAlign: 'middle', maxWidth: '140px' }}>
                    <div 
                      style={{ 
                        textOverflow: 'ellipsis', 
                        whiteSpace: 'nowrap', 
                        overflow: 'hidden',
                        fontSize: '0.85rem',
                        color: 'var(--text-secondary)'
                      }} 
                      title={v.base_location || v.registration_state || '—'}
                    >
                      {v.base_location || v.registration_state || '—'}
                    </div>
                  </td>
                  <td style={{ verticalAlign: 'middle' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Star size={14} color="#f59e0b" fill="#f59e0b" />
                      <span style={{ fontWeight: 600 }}>{v.rating || '—'}</span>
                    </div>
                  </td>
                  <td style={{ verticalAlign: 'middle', fontWeight: 600 }}>{v.total_earnings ? `₹${v.total_earnings.toLocaleString()}` : '—'}</td>
                  <td style={{ verticalAlign: 'middle' }}>
                    <span className="list-status-badge" style={{
                      backgroundColor: v.verification_status === 'verified' ? '#dcfce7' : v.verification_status === 'rejected' ? '#fee2e2' : '#fef3c7',
                      color: v.verification_status === 'verified' ? '#166534' : v.verification_status === 'rejected' ? '#991b1b' : '#92400e'
                    }}>
                      {v.verification_status || 'Pending'}
                    </span>
                  </td>
                  <td style={{ verticalAlign: 'middle' }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <button onClick={() => { setSelectedVet(v); setDrawerTab('overview'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }} title="View Details">
                        <Eye size={18} />
                      </button>
                      <button onClick={() => startEdit(v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--humal-green)' }} title="Edit Profile">
                        <Edit3 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr><td colSpan={7} className="list-empty">No vets found.</td></tr>
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
              {drawerTab === 'overview' && (
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
                    ['Active Status', selectedVet.is_active ? 'Active' : 'Blocked'],
                  ].map(([label, value]) => (
                    <div key={label as string} className="drawer-detail-row">
                      <span className="drawer-detail-label">{label}</span>
                      <span className="drawer-detail-value">{String(value)}</span>
                    </div>
                  ))}
                  <div style={{ marginTop: 24, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                    <button onClick={() => startEdit(selectedVet)} className="export-btn" style={{ flexGrow: 1, backgroundColor: 'var(--humal-green)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <Edit3 size={16} /> Edit Profile
                    </button>
                    <button onClick={() => handleBlockToggle(selectedVet.id, selectedVet.is_active)} className="export-btn" style={{ flexGrow: 1, backgroundColor: selectedVet.is_active ? '#ef4444' : '#10b981', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <Ban size={16} /> {selectedVet.is_active ? 'Block Vet' : 'Unblock Vet'}
                    </button>
                    {selectedVet.verification_status === 'pending' && (
                      <div style={{ display: 'flex', gap: 12, width: '100%' }}>
                        <button onClick={() => handleVerification(selectedVet.id, 'verified')} className="export-btn" style={{ flexGrow: 1, backgroundColor: '#10b981', color: '#fff', border: 'none' }}>Approve</button>
                        <button onClick={() => handleVerification(selectedVet.id, 'rejected')} className="export-btn" style={{ flexGrow: 1, backgroundColor: '#ef4444', color: '#fff', border: 'none' }}>Reject</button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {drawerTab === 'consultations' && (
                <div className="drawer-section">
                  <div className="drawer-section-title">Consultation Records ({vetConsultations.length})</div>
                  {vetConsultations.length === 0 ? (
                    <div className="list-empty" style={{ padding: '30px 0' }}>No consultations found for this vet.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {vetConsultations.map(c => (
                        <div key={c.id} style={{ border: '1px solid var(--border-color)', borderRadius: 8, padding: 12, backgroundColor: '#fafafa' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{c.id}</span>
                            <span className="list-status-badge" style={{ 
                              fontSize: '0.7rem', 
                              backgroundColor: c.status === 'COMPLETED' ? '#dcfce7' : '#fef3c7',
                              color: c.status === 'COMPLETED' ? '#166534' : '#92400e'
                            }}>{c.status}</span>
                          </div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Farmer: <strong>{c.farmer_name}</strong></div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Type: {c.type || 'Video call'}</div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Category: {c.category || 'General'}</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #eee', marginTop: 8, paddingTop: 6, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            <span>{c.date?.slice(0, 10)}</span>
                            <strong style={{ color: 'var(--text-primary)' }}>₹{c.fee}</strong>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {drawerTab === 'earnings' && (
                <div className="drawer-section">
                  <div className="drawer-section-title">Earnings & Payout Logs ({vetPayouts.length})</div>
                  {vetPayouts.length === 0 ? (
                    <div className="list-empty" style={{ padding: '30px 0' }}>No earnings history found for this vet.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {vetPayouts.map((p, idx) => {
                        const totalEarnings = p.amount ? Math.round(p.amount / 0.8) : 0;
                        const humalComm = totalEarnings - p.amount;
                        return (
                          <div key={p.id || idx} style={{ border: '1px solid var(--border-color)', borderRadius: 8, padding: 12, backgroundColor: '#fafafa' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Date: {p.processed_at?.slice(0, 10) || p.created_at?.slice(0, 10) || '—'}</span>
                              <span className="list-status-badge" style={{ 
                                fontSize: '0.7rem',
                                backgroundColor: p.status === 'PAID' || p.status === 'PROCESSED' ? '#dcfce7' : '#fef3c7',
                                color: p.status === 'PAID' || p.status === 'PROCESSED' ? '#166534' : '#92400e'
                              }}>{p.status || 'Pending'}</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: '0.82rem', marginBottom: 6 }}>
                              <div>Gross: <strong>₹{totalEarnings.toLocaleString()}</strong></div>
                              <div>Comm: <strong>₹{humalComm.toLocaleString()}</strong></div>
                            </div>
                            <div style={{ borderTop: '1px solid #eee', paddingTop: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.82rem' }}>Net Pay: <strong style={{ color: 'var(--humal-green)' }}>₹{p.amount.toLocaleString()}</strong></span>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>UTR: {p.utr || '—'}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {drawerTab === 'documents' && (
                <div className="drawer-section">
                  <div className="drawer-section-title">Submitted Documents</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 10 }}>
                    {[
                      { name: 'Veterinary Council Registration Certificate', status: selectedVet.verification_status === 'verified' ? 'Verified' : 'Pending Verification', icon: <FileText size={20} /> },
                      { name: 'BVSc Degree Certificate / Qualification Proof', status: selectedVet.verification_status === 'verified' ? 'Verified' : 'Pending Verification', icon: <FileText size={20} /> },
                      { name: 'Government Identity Proof (Aadhaar / Passport)', status: 'Identity Matches Name', icon: <FileText size={20} /> },
                    ].map((doc, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, border: '1px solid var(--border-color)', borderRadius: 8, backgroundColor: '#fff' }}>
                        <div style={{ width: 36, height: 36, borderRadius: 6, backgroundColor: '#eef2f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                          {doc.icon}
                        </div>
                        <div style={{ flexGrow: 1 }}>
                          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{doc.name}</div>
                          <span style={{ 
                            fontSize: '0.72rem', 
                            color: doc.status.includes('Verified') || doc.status.includes('Matches') ? '#166534' : '#92400e',
                            fontWeight: 600
                          }}>{doc.status}</span>
                        </div>
                        <a 
                          href="#" 
                          onClick={e => { e.preventDefault(); alert("Viewing secure document: " + doc.name); }} 
                          style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--humal-green)', textDecoration: 'none' }}
                        >
                          View Secure
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* EDIT PROFILE MODAL */}
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
              maxWidth: 640, 
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
                  Edit Veterinarian Profile
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Modify professional qualification credentials and active status.
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
                    <input type="text" required className="filter-search" style={{ width: '100%', boxSizing: 'border-box' }} value={editForm.first_name} onChange={e => setEditForm({ ...editForm, first_name: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Last Name</label>
                    <input type="text" className="filter-search" style={{ width: '100%', boxSizing: 'border-box' }} value={editForm.last_name} onChange={e => setEditForm({ ...editForm, last_name: e.target.value })} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Phone *</label>
                  <input type="text" required className="filter-search" style={{ width: '100%', boxSizing: 'border-box' }} value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Qualification</label>
                    <input type="text" className="filter-search" style={{ width: '100%', boxSizing: 'border-box' }} value={editForm.qualification} onChange={e => setEditForm({ ...editForm, qualification: e.target.value })} placeholder="e.g. BVSc & AH" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Years of Experience</label>
                    <input type="number" className="filter-search" style={{ width: '100%', boxSizing: 'border-box' }} value={editForm.years_of_experience} onChange={e => setEditForm({ ...editForm, years_of_experience: Number(e.target.value) })} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Specialization</label>
                  <textarea 
                    className="filter-search" 
                    style={{ 
                      width: '100%', 
                      boxSizing: 'border-box', 
                      height: '75px', 
                      resize: 'vertical',
                      padding: '8px 12px',
                      lineHeight: '1.45',
                      fontFamily: 'inherit'
                    }} 
                    value={editForm.specialization} 
                    onChange={e => setEditForm({ ...editForm, specialization: e.target.value })} 
                    placeholder="e.g. Surgery, Cattle breeding, General health" 
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>License Number</label>
                    <input type="text" className="filter-search" style={{ width: '100%', boxSizing: 'border-box' }} value={editForm.license_number} onChange={e => setEditForm({ ...editForm, license_number: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Registration State</label>
                    <input type="text" className="filter-search" style={{ width: '100%', boxSizing: 'border-box' }} value={editForm.registration_state} onChange={e => setEditForm({ ...editForm, registration_state: e.target.value })} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Base Location (City/District)</label>
                  <input type="text" className="filter-search" style={{ width: '100%', boxSizing: 'border-box' }} value={editForm.base_location} onChange={e => setEditForm({ ...editForm, base_location: e.target.value })} placeholder="e.g. Lucknow" />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" id="vet_is_active" checked={editForm.is_active} onChange={e => setEditForm({ ...editForm, is_active: e.target.checked })} style={{ cursor: 'pointer' }} />
                  <label htmlFor="vet_is_active" style={{ fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}>Active Vet Profile</label>
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

export default VetsScreen;
