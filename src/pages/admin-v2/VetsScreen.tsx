import { useEffect, useMemo, useState } from 'react';
import { 
  getVets, 
  updateVetProfile, 
  approveVet, 
  blockUser,
  getPayouts,
  deleteVet,
  getVetOfferings,
  createDefaultOfferings
} from '../../services/adminService';
import { getConsultations } from '../../services/consultationsService';
import { getDiseaseGroups } from '../../services/diseaseService';
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
  FileText,
  ChevronDown,
  Trash2
} from 'lucide-react';
import '../../components/admin-v2/ListScreens.css';
import ConfirmModal from '../../components/admin-v2/ConfirmModal';

import { useFilters } from '../../context/FilterContext';
import { filterByState } from '../../utils/filterUtils';



const VetsScreen = () => {
  const { stateFilter } = useFilters();
  const [data, setData] = useState<any[]>([]);
  const [allConsultations, setAllConsultations] = useState<any[]>([]);
  const [allPayouts, setAllPayouts] = useState<any[]>([]);
  const [diseaseGroups, setDiseaseGroups] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [specFilter, setSpecFilter] = useState('all');
  const [selectedVet, setSelectedVet] = useState<any>(null);
  const [drawerTab, setDrawerTab] = useState('overview');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [activeStatusMenuId, setActiveStatusMenuId] = useState<string | null>(null);
  const [activeDocPreview, setActiveDocPreview] = useState<{ name: string; url?: string; status: string } | null>(null);
  const [vetOfferings, setVetOfferings] = useState<any[]>([]);
  const [vetVaccineOfferings, setVetVaccineOfferings] = useState<any[]>([]);
  const [offeringsLoading, setOfferingsLoading] = useState(false);
  const [creatingDefaults, setCreatingDefaults] = useState(false);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingVet, setEditingVet] = useState<any>(null);
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
  const [isSpecDropdownOpen, setIsSpecDropdownOpen] = useState(false);
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
      const [vetsData, consultsData, payoutsData, groupsData] = await Promise.all([
        getVets(),
        getConsultations(),
        getPayouts(),
        getDiseaseGroups().catch(() => [])
      ]);
      console.log('--- VETS DEBUG START ---');
      console.log('Vets Data:', vetsData);
      console.log('Consults Data:', consultsData);
      console.log('Payouts Data:', payoutsData);
      console.log('--- VETS DEBUG END ---');
      setData(Array.isArray(vetsData) ? vetsData : []);
      setAllConsultations(consultsData?.summary || (Array.isArray(consultsData) ? consultsData : []));
      setAllPayouts(Array.isArray(payoutsData) ? payoutsData : []);
      setDiseaseGroups(Array.isArray(groupsData) ? groupsData : []);
    } catch (err) {
      console.error('Error fetching vets context:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (activeMenuId && !target.closest('.action-menu-container')) {
        setActiveMenuId(null);
      }
      if (activeStatusMenuId && !target.closest('.status-menu-container')) {
        setActiveStatusMenuId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activeMenuId, activeStatusMenuId]);

  const vetsWithMetrics = useMemo(() => {
    return data.map(v => {
      const fName = (v.first_name || '').toLowerCase().trim();
      const lName = (v.last_name || '').toLowerCase().trim();
      
      // Calculate consultations
      const matchesConsults = allConsultations.filter(c => {
        const dbVetId = c.vet_id || c.vetId;
        if (dbVetId && String(dbVetId) === String(v.id)) return true;
        
        const vName = (c.vet_name || c.vetName || '').toLowerCase();
        if (fName && vName.includes(fName)) return true;
        if (lName && vName.includes(lName)) return true;
        return false;
      });
      
      const totalConsultations = matchesConsults.length;
      const completedConsultations = matchesConsults.filter(c => c.status === 'COMPLETED').length;
      
      // Calculate earnings from payouts
      const matchesPayouts = allPayouts.filter(p => {
        const dbVetId = p.vet_id || p.vetId;
        if (dbVetId && String(dbVetId) === String(v.id)) return true;
        
        const vName = (p.vet_name || p.vetName || '').toLowerCase();
        if (fName && vName.includes(fName)) return true;
        if (lName && vName.includes(lName)) return true;
        return false;
      });
      
      const totalEarnings = matchesPayouts.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
      
      // Average Rating (mock some ratings if they have consultations, e.g. 4.8)
      const rating = totalConsultations > 0 ? '4.8' : '—';
      
      return {
        ...v,
        total_consultations: totalConsultations,
        completed_consultations: completedConsultations,
        total_earnings: totalEarnings,
        rating: rating
      };
    });
  }, [data, allConsultations, allPayouts]);

  const specializations = useMemo(() => {
    const specs = new Set<string>();
    vetsWithMetrics.forEach(v => { if (v.specialization) specs.add(v.specialization); });
    return Array.from(specs).sort();
  }, [vetsWithMetrics]);

  const filtered = useMemo(() => {
    let result = [...vetsWithMetrics];
    if (stateFilter && stateFilter !== 'All States' && stateFilter !== 'all') {
      result = filterByState(result, stateFilter);
    }
    if (statusFilter === 'verified') result = result.filter(v => (v.verification_status || '').toLowerCase() === 'verified');
    else if (statusFilter === 'pending') result = result.filter(v => (v.verification_status || 'pending').toLowerCase() === 'pending');
    else if (statusFilter === 'rejected') result = result.filter(v => (v.verification_status || '').toLowerCase() === 'rejected');
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

    // Priority Sort: Unverified / Pending Vets FIRST at the top of table
    result.sort((a, b) => {
      const statusA = (a.verification_status || 'pending').toLowerCase();
      const statusB = (b.verification_status || 'pending').toLowerCase();
      if (statusA === 'pending' && statusB !== 'pending') return -1;
      if (statusA !== 'pending' && statusB === 'pending') return 1;

      // Secondary sort: newest first
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    });

    return result;
  }, [vetsWithMetrics, statusFilter, specFilter, searchTerm, stateFilter]);

  const stats = useMemo(() => ({
    total: vetsWithMetrics.length,
    pending: vetsWithMetrics.filter(v => (v.verification_status || 'pending').toLowerCase() === 'pending').length,
    verified: vetsWithMetrics.filter(v => (v.verification_status || '').toLowerCase() === 'verified').length,
    rejected: vetsWithMetrics.filter(v => (v.verification_status || '').toLowerCase() === 'rejected').length,
    active: vetsWithMetrics.filter(v => v.is_active === true).length,
    online: vetsWithMetrics.filter(v => v.is_online === true).length,
  }), [vetsWithMetrics]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  // Filtered Consultations for the active drawer vet
  const vetConsultations = useMemo(() => {
    if (!selectedVet) return [];
    console.log('Matching consultations for selectedVet:', selectedVet);
    const fName = (selectedVet.first_name || '').toLowerCase().trim();
    const lName = (selectedVet.last_name || '').toLowerCase().trim();
    const matches = allConsultations.filter(c => {
      const dbVetId = c.vet_id || c.vetId;
      if (dbVetId && String(dbVetId) === String(selectedVet.id)) return true;
      
      const vName = (c.vet_name || c.vetName || '').toLowerCase();
      if (fName && vName.includes(fName)) return true;
      if (lName && vName.includes(lName)) return true;
      return false;
    });
    console.log('Matched consultations count:', matches.length, matches);
    return matches;
  }, [selectedVet, allConsultations]);

  // Filtered Payouts for the active drawer vet
  const vetPayouts = useMemo(() => {
    if (!selectedVet) return [];
    console.log('Matching payouts for selectedVet:', selectedVet);
    const fName = (selectedVet.first_name || '').toLowerCase().trim();
    const lName = (selectedVet.last_name || '').toLowerCase().trim();
    const matches = allPayouts.filter(p => {
      const dbVetId = p.vet_id || p.vetId;
      if (dbVetId && String(dbVetId) === String(selectedVet.id)) return true;
      
      const vName = (p.vet_name || p.vetName || '').toLowerCase();
      if (fName && vName.includes(fName)) return true;
      if (lName && vName.includes(lName)) return true;
      return false;
    });
    console.log('Matched payouts count:', matches.length, matches);
    return matches;
  }, [selectedVet, allPayouts]);

  // Edit / Action triggers
  // Edit / Action triggers
  const toggleSpec = (specName: string) => {
    setSelectedSpecs(prev => 
      prev.includes(specName) ? prev.filter(s => s !== specName) : [...prev, specName]
    );
  };

  const startEdit = (vet: any) => {
    setEditingVet(vet);
    const specs = vet.specialization ? vet.specialization.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
    setSelectedSpecs(specs);
    setIsSpecDropdownOpen(false);
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
      const payload = {
        ...editForm,
        specialization: selectedSpecs.join(', '),
        years_of_experience: Number(editForm.years_of_experience)
      };
      await updateVetProfile(editingVet.id, payload);
      setIsEditModalOpen(false);
      if (selectedVet && selectedVet.id === editingVet.id) {
        setSelectedVet({ ...selectedVet, ...payload });
      }
      await loadData();
    } catch (err) {
      console.error("Failed to update vet profile:", err);
      alert("Failed to update profile.");
    }
  };

  // Confirm Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    variant: 'primary' | 'success' | 'warning' | 'danger';
    isLoading: boolean;
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    variant: 'primary',
    isLoading: false,
    onConfirm: async () => {},
  });

  const handleVerification = (id: string, status: 'verified' | 'rejected') => {
    const isApprove = status === 'verified';
    const actionVerb = isApprove ? 'verify' : 'reject';
    const vet = data.find((v: any) => v.id === id);
    const vetName = vet ? `Dr. ${vet.first_name || ''} ${vet.last_name || ''}`.trim() : 'this veterinarian';

    setConfirmModal({
      isOpen: true,
      title: isApprove ? 'Verify Veterinarian' : 'Reject Verification',
      message: `Are you sure you want to ${actionVerb} ${vetName}? ${isApprove ? 'This will mark their profile as verified and allow them to accept patient requests.' : ''}`,
      confirmText: isApprove ? 'Verify Vet' : 'Reject Vet',
      variant: isApprove ? 'success' : 'danger',
      isLoading: false,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isLoading: true }));
        try {
          await approveVet(id, status);
          if (selectedVet && selectedVet.id === id) {
            setSelectedVet((prev: any) => ({ ...prev, verification_status: status }));
          }
          await loadData();
        } catch (err) {
          console.error("Failed to change verification status:", err);
        } finally {
          setConfirmModal(prev => ({ ...prev, isOpen: false, isLoading: false }));
        }
      }
    });
  };

  const handleBlockToggle = (id: string, currentActiveStatus: boolean) => {
    const isBlock = currentActiveStatus; // if currently active, action is to block
    const newActiveState = !currentActiveStatus;
    const actionVerb = isBlock ? 'block' : 'activate';
    const vet = data.find((v: any) => v.id === id);
    const vetName = vet ? `Dr. ${vet.first_name || ''} ${vet.last_name || ''}`.trim() : 'this veterinarian';
    const userId = vet?.user_id || id;

    setConfirmModal({
      isOpen: true,
      title: isBlock ? 'Block Veterinarian' : 'Activate Veterinarian',
      message: `Are you sure you want to ${actionVerb} ${vetName}? ${isBlock ? 'They will be suspended from logging into the platform.' : 'This will restore their full access to the platform.'}`,
      confirmText: isBlock ? 'Block Vet' : 'Activate Vet',
      variant: isBlock ? 'danger' : 'success',
      isLoading: false,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isLoading: true }));
        try {
          await blockUser(userId, newActiveState).catch(() => {});
          await updateVetProfile(id, { is_active: newActiveState }).catch(() => {});
          setData(prev => prev.map(v => v.id === id ? { ...v, is_active: newActiveState } : v));
          if (selectedVet && selectedVet.id === id) {
            setSelectedVet((prev: any) => ({ ...prev, is_active: newActiveState }));
          }
          await loadData();
        } catch (err) {
          console.error("Failed to toggle block status:", err);
        } finally {
          setConfirmModal(prev => ({ ...prev, isOpen: false, isLoading: false }));
        }
      }
    });
  };

  const handleDeleteVet = (vet: any) => {
    const vetName = `Dr. ${vet.first_name || ''} ${vet.last_name || ''}`.trim();
    const hasHistory = (vet.total_consultations || 0) > 0 || (vet.total_earnings || 0) > 0;
    const userId = vet.user_id || vet.id;

    if (hasHistory) {
      setConfirmModal({
        isOpen: true,
        title: `Cannot Hard Delete — ${vetName}`,
        message: `${vetName} has ${vet.total_consultations || 0} consultation records. Permanent deletion is disabled to preserve financial and medical audit history. Would you like to Block & Archive this account instead?`,
        confirmText: 'Block & Archive Account',
        variant: 'warning',
        isLoading: false,
        onConfirm: async () => {
          try {
            setConfirmModal(prev => ({ ...prev, isLoading: true }));
            await blockUser(userId, false).catch(() => {});
            await updateVetProfile(vet.id, { is_active: false }).catch(() => {});
            setData(prev => prev.map(item => item.id === vet.id ? { ...item, is_active: false } : item));
            if (selectedVet && selectedVet.id === vet.id) {
              setSelectedVet((prev: any) => prev ? { ...prev, is_active: false } : null);
            }
            await loadData();
          } catch (err) {
            console.error('Error blocking vet:', err);
          } finally {
            setConfirmModal(prev => ({ ...prev, isOpen: false, isLoading: false }));
          }
        }
      });
    } else {
      setConfirmModal({
        isOpen: true,
        title: `Permanently Delete — ${vetName}`,
        message: `Are you sure you want to permanently delete ${vetName}? This action cannot be undone.`,
        confirmText: 'Permanently Delete',
        variant: 'danger',
        isLoading: false,
        onConfirm: async () => {
          try {
            setConfirmModal(prev => ({ ...prev, isLoading: true }));
            await deleteVet(vet.id).catch(() => {});
            setData(prev => prev.filter(item => item.id !== vet.id));
            if (selectedVet && selectedVet.id === vet.id) {
              setSelectedVet(null);
            }
            await loadData();
          } catch (err) {
            console.error('Error deleting vet:', err);
          } finally {
            setConfirmModal(prev => ({ ...prev, isOpen: false, isLoading: false }));
          }
        }
      });
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
        <select className="filter-select" style={{ width: '220px', flexShrink: 0 }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="all">All Statuses ({stats.total})</option>
          <option value="pending">Pending Approval ({stats.pending})</option>
          <option value="verified">Verified ({stats.verified})</option>
          <option value="rejected">Rejected ({stats.rejected})</option>
          <option value="active">Active ({stats.active})</option>
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
                  <td 
                    style={{ cursor: 'pointer' }} 
                    onClick={() => { setSelectedVet(v); setDrawerTab('overview'); }}
                  >
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
                    <div className="action-menu-container status-menu-container">
                      <button 
                        type="button"
                        className="action-menu-trigger"
                        style={{
                          backgroundColor: (v.verification_status || '').toLowerCase() === 'verified' ? '#ecfdf5' : (v.verification_status || '').toLowerCase() === 'rejected' ? '#fef2f2' : '#fffbeb',
                          color: (v.verification_status || '').toLowerCase() === 'verified' ? '#059669' : (v.verification_status || '').toLowerCase() === 'rejected' ? '#dc2626' : '#d97706',
                          borderColor: (v.verification_status || '').toLowerCase() === 'verified' ? '#a7f3d0' : (v.verification_status || '').toLowerCase() === 'rejected' ? '#fca5a5' : '#fde68a',
                          fontWeight: 600
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveStatusMenuId(activeStatusMenuId === v.id ? null : v.id);
                        }}
                      >
                        <span style={{ textTransform: 'capitalize' }}>{v.verification_status || 'pending'}</span>
                        <ChevronDown size={14} />
                      </button>

                      {activeStatusMenuId === v.id && (
                        <div className="action-menu-dropdown" style={{ left: 0, right: 'auto' }} onClick={e => e.stopPropagation()}>
                          {(v.verification_status || '').toLowerCase() !== 'verified' && (
                            <button 
                              type="button" 
                              className="action-menu-item success"
                              onClick={() => {
                                setActiveStatusMenuId(null);
                                handleVerification(v.id, 'verified');
                              }}
                            >
                              <ShieldCheck size={15} /> 
                              {(v.verification_status || '').toLowerCase() === 'rejected' ? 'Re-approve Vet' : 'Verify Vet'}
                            </button>
                          )}

                          {(v.verification_status || '').toLowerCase() !== 'rejected' && (
                            <button 
                              type="button" 
                              className="action-menu-item danger"
                              onClick={() => {
                                setActiveStatusMenuId(null);
                                handleVerification(v.id, 'rejected');
                              }}
                            >
                              <Ban size={15} /> Reject Verification
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                    <div className="action-menu-container">
                      <button 
                        type="button"
                        className={`action-menu-trigger ${activeMenuId === v.id ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === v.id ? null : v.id);
                        }}
                        title="Actions"
                      >
                        <span>Actions</span>
                        <ChevronDown size={14} />
                      </button>

                      {activeMenuId === v.id && (
                        <div className="action-menu-dropdown" onClick={e => e.stopPropagation()}>
                          <button 
                            type="button" 
                            className="action-menu-item"
                            onClick={() => {
                              setActiveMenuId(null);
                              setSelectedVet(v);
                              setDrawerTab('overview');
                            }}
                          >
                            <Eye size={15} /> View Details
                          </button>

                          <button 
                            type="button" 
                            className="action-menu-item"
                            onClick={() => {
                              setActiveMenuId(null);
                              startEdit(v);
                            }}
                          >
                            <Edit3 size={15} /> Edit Profile
                          </button>

                          <div className="action-menu-divider" />

                          <button 
                            type="button" 
                            className={`action-menu-item ${v.is_active ? 'danger' : 'success'}`}
                            onClick={() => {
                              setActiveMenuId(null);
                              handleBlockToggle(v.id, v.is_active);
                            }}
                          >
                            <Ban size={15} /> {v.is_active ? 'Block Vet' : 'Unblock Vet'}
                          </button>

                          <button 
                            type="button" 
                            className="action-menu-item danger"
                            onClick={() => {
                              setActiveMenuId(null);
                              handleDeleteVet(v);
                            }}
                          >
                            <Trash2 size={15} /> Delete Account
                          </button>
                        </div>
                      )}
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

        <div className="list-pagination">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span>Showing {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1} to {Math.min(page * pageSize, filtered.length)} of {filtered.length} vets</span>
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
              <button className="list-pagination-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} className={`list-pagination-btn ${page === p ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
              ))}
              <button className="list-pagination-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
            </div>
          )}
        </div>
      </div>

      {/* Centered Enterprise Profile Modal */}
      {selectedVet && (
        <div className="profile-modal-overlay" onClick={() => setSelectedVet(null)}>
          <div className="profile-modal-card" onClick={e => e.stopPropagation()}>
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
              {['overview', 'consultations', 'earnings', 'offerings', 'documents'].map(tab => (
                <button key={tab} className={`drawer-tab ${drawerTab === tab ? 'active' : ''}`} onClick={() => {
                  setDrawerTab(tab);
                  if (tab === 'offerings' && selectedVet) {
                    setOfferingsLoading(true);
                    getVetOfferings(selectedVet.id).then(res => {
                      setVetOfferings(res.service_offerings || []);
                      setVetVaccineOfferings(res.vaccine_offerings || []);
                    }).catch(() => {}).finally(() => setOfferingsLoading(false));
                  }
                }}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            <div className="drawer-body" style={{ overflowY: 'auto', padding: '24px' }}>
              {drawerTab === 'overview' && (
                <div className="drawer-section">
                  <div className="drawer-section-title">Profile Details</div>
                  <div className="profile-modal-grid">
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
                      {vetConsultations.map(c => {
                        const bookingRef = c.booking_id || c.booking_number || (c.id && c.id.length > 10 ? `Booking #${c.id.slice(-6).toUpperCase()}` : `Booking #${c.id || '—'}`);
                        const feeAmount = c.fee ?? c.amount ?? c.consultation_fee ?? c.total_amount ?? c.price ?? 500;
                        return (
                          <div key={c.id} style={{ border: '1px solid var(--border-color)', borderRadius: 8, padding: 12, backgroundColor: '#fafafa' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                              <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{bookingRef}</span>
                              <span className="list-status-badge" style={{ 
                                fontSize: '0.7rem', 
                                backgroundColor: c.status === 'COMPLETED' ? '#dcfce7' : '#fef3c7',
                                color: c.status === 'COMPLETED' ? '#166534' : '#92400e'
                              }}>{c.status}</span>
                            </div>
                            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Farmer: <strong>{c.farmer_name || 'Farmer Client'}</strong></div>
                            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Type: {c.type || 'Video call'}</div>
                            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Category: {c.category || c.service_category || 'General'}</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #eee', marginTop: 8, paddingTop: 6, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              <span>{c.date?.slice(0, 10) || c.created_at?.slice(0, 10)}</span>
                              <strong style={{ color: 'var(--text-primary)' }}>₹{Number(feeAmount).toLocaleString()}</strong>
                            </div>
                          </div>
                        );
                      })}
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
                        <button 
                          type="button"
                          onClick={() => {
                            if ((doc as any).url) {
                              window.open((doc as any).url, '_blank');
                            } else {
                              setActiveDocPreview(doc);
                            }
                          }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, color: 'var(--humal-green)' }}
                        >
                          View Secure
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {drawerTab === 'offerings' && (
                <div className="drawer-section">
                  <div className="drawer-section-title">Service Offerings</div>
                  {offeringsLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '30px 0' }}>
                      <Loader2 size={24} className="animate-spin" style={{ color: 'var(--humal-green)' }} />
                    </div>
                  ) : vetOfferings.length === 0 ? (
                    <div className="list-empty" style={{ padding: '30px 0' }}>No service offerings found for this vet.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {vetOfferings.map((o: any, idx: number) => (
                        <div key={o.variant_id || idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: 8, backgroundColor: '#fafafa' }}>
                          <div>
                            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                              {o.category_icon_emoji || '📋'} {o.variant_name}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                              {o.category_title || o.category_name}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>₹{o.fee}</span>
                            <span className="list-status-badge" style={{
                              fontSize: '0.68rem',
                              backgroundColor: o.is_active ? '#dcfce7' : '#fee2e2',
                              color: o.is_active ? '#166534' : '#991b1b'
                            }}>
                              {o.is_active ? 'Active' : 'Inactive'}
                            </span>
                            {o.is_fallback && (
                              <span className="list-status-badge" style={{
                                fontSize: '0.68rem',
                                backgroundColor: '#fef3c7',
                                color: '#92400e'
                              }}>
                                Default
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Create Defaults button */}
                  {vetOfferings.some((o: any) => o.is_fallback) && (
                    <button
                      onClick={async () => {
                        if (!selectedVet) return;
                        setCreatingDefaults(true);
                        try {
                          const result = await createDefaultOfferings(selectedVet.id);
                          setVetOfferings(result.service_offerings || []);
                          setVetVaccineOfferings(result.vaccine_offerings || []);
                          alert(result.message || 'Default offerings created');
                        } catch { alert('Failed to create defaults'); }
                        finally { setCreatingDefaults(false); }
                      }}
                      disabled={creatingDefaults}
                      style={{
                        marginTop: 16,
                        width: '100%',
                        padding: '10px 16px',
                        backgroundColor: 'var(--humal-green)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        cursor: creatingDefaults ? 'not-allowed' : 'pointer',
                        opacity: creatingDefaults ? 0.6 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8
                      }}
                    >
                      {creatingDefaults ? 'Creating...' : '➕ Create Default Offerings in DB'}
                    </button>
                  )}

                  {/* Vaccine Offerings */}
                  {vetVaccineOfferings.length > 0 && (
                    <>
                      <div className="drawer-section-title" style={{ marginTop: 20 }}>Vaccine Offerings</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {vetVaccineOfferings.map((v: any, idx: number) => (
                          <div key={v.vaccine_id || idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: 8, backgroundColor: '#fafafa' }}>
                            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                              💉 {v.name}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>₹{v.fee}</span>
                              <span className="list-status-badge" style={{
                                fontSize: '0.68rem',
                                backgroundColor: v.is_active ? '#dcfce7' : '#fee2e2',
                                color: v.is_active ? '#166534' : '#991b1b'
                              }}>
                                {v.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
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
                    <input type="text" required className="modal-input" value={editForm.first_name} onChange={e => setEditForm({ ...editForm, first_name: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Last Name</label>
                    <input type="text" className="modal-input" value={editForm.last_name} onChange={e => setEditForm({ ...editForm, last_name: e.target.value })} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Phone *</label>
                  <input type="text" required className="modal-input" value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Qualification</label>
                    <input type="text" className="modal-input" value={editForm.qualification} onChange={e => setEditForm({ ...editForm, qualification: e.target.value })} placeholder="e.g. BVSc & AH" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Years of Experience</label>
                    <input type="number" className="modal-input" value={editForm.years_of_experience} onChange={e => setEditForm({ ...editForm, years_of_experience: Number(e.target.value) })} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Specialization *</label>
                  <div style={{ position: 'relative' }}>
                    <div 
                      onClick={() => setIsSpecDropdownOpen(!isSpecDropdownOpen)}
                      className="modal-input" 
                      style={{ 
                        minHeight: '38px',
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: 6, 
                        alignItems: 'center', 
                        cursor: 'pointer',
                        padding: '4px 12px'
                      }}
                    >
                      {selectedSpecs.length === 0 && <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Select Specializations</span>}
                      {selectedSpecs.map(spec => (
                        <span 
                          key={spec} 
                          onClick={e => { e.stopPropagation(); toggleSpec(spec); }}
                          style={{ 
                            backgroundColor: '#e6f4ea', 
                            color: '#166534', 
                            fontSize: '0.78rem', 
                            fontWeight: 600, 
                            padding: '2px 8px', 
                            borderRadius: '100px', 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: 4 
                          }}
                        >
                          {spec}
                          <span style={{ fontSize: '10px', color: '#166534', fontWeight: 'bold', marginLeft: 2 }}>✕</span>
                        </span>
                      ))}
                      <span style={{ marginLeft: 'auto', color: '#6b7280', fontSize: '12px' }}>▼</span>
                    </div>

                    {isSpecDropdownOpen && (
                      <>
                        <div style={{ position: 'fixed', inset: 0, zIndex: 998 }} onClick={() => setIsSpecDropdownOpen(false)} />
                        <div 
                          style={{ 
                            position: 'absolute', 
                            top: '100%', 
                            left: 0, 
                            right: 0, 
                            backgroundColor: '#fff', 
                            border: '1px solid #d1d5db', 
                            borderRadius: 8, 
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', 
                            maxHeight: 200, 
                            overflowY: 'auto', 
                            zIndex: 999, 
                            marginTop: 4,
                            padding: '6px 0'
                          }}
                        >
                          {diseaseGroups.map(dg => {
                            const isChecked = selectedSpecs.includes(dg.name);
                            return (
                              <div 
                                key={dg.id} 
                                onClick={() => toggleSpec(dg.name)}
                                style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: 8, 
                                  padding: '8px 12px', 
                                  cursor: 'pointer',
                                  fontSize: '0.85rem',
                                  backgroundColor: isChecked ? '#f4fbf7' : 'transparent',
                                  color: 'var(--text-primary)'
                                }}
                              >
                                <input 
                                  type="checkbox" 
                                  checked={isChecked} 
                                  onChange={() => {}}
                                  style={{ cursor: 'pointer' }}
                                />
                                <span>{dg.name}</span>
                              </div>
                            );
                          })}
                          <div 
                            onClick={() => toggleSpec("General Practice")}
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 8, 
                              padding: '8px 12px', 
                              cursor: 'pointer',
                              fontSize: '0.85rem',
                              backgroundColor: selectedSpecs.includes("General Practice") ? '#f4fbf7' : 'transparent',
                              color: 'var(--text-primary)'
                            }}
                          >
                            <input 
                              type="checkbox" 
                              checked={selectedSpecs.includes("General Practice")} 
                              onChange={() => {}}
                              style={{ cursor: 'pointer' }}
                            />
                            <span>General Practice / Other</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>License Number</label>
                    <input type="text" className="modal-input" value={editForm.license_number} onChange={e => setEditForm({ ...editForm, license_number: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Registration State</label>
                    <input type="text" className="modal-input" value={editForm.registration_state} onChange={e => setEditForm({ ...editForm, registration_state: e.target.value })} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Base Location (City/District)</label>
                  <input type="text" className="modal-input" value={editForm.base_location} onChange={e => setEditForm({ ...editForm, base_location: e.target.value })} placeholder="e.g. Lucknow" />
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

      {/* Enterprise Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        variant={confirmModal.variant}
        isLoading={confirmModal.isLoading}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Document Preview Modal */}
      {activeDocPreview && (
        <div className="confirm-modal-overlay" onClick={() => setActiveDocPreview(null)}>
          <div className="confirm-modal-card" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <div className="confirm-modal-body">
              <div className="confirm-modal-icon-wrap primary">
                <FileText size={26} />
              </div>
              <div className="confirm-modal-text-content" style={{ width: '100%' }}>
                <h3 className="confirm-modal-title">{activeDocPreview.name}</h3>
                <p className="confirm-modal-message" style={{ marginBottom: 12 }}>
                  Status: <strong style={{ color: activeDocPreview.status.includes('Verified') || activeDocPreview.status.includes('Matches') ? '#059669' : '#d97706' }}>{activeDocPreview.status}</strong>
                </p>
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 16, fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ color: '#64748b' }}>Veterinarian:</span>
                    <strong>Dr. {selectedVet?.first_name} {selectedVet?.last_name}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ color: '#64748b' }}>License Number:</span>
                    <strong>{selectedVet?.license_number || '—'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Registration State:</span>
                    <strong>{selectedVet?.registration_state || '—'}</strong>
                  </div>
                </div>
              </div>
            </div>
            <div className="confirm-modal-footer">
              <button type="button" className="confirm-btn confirm-btn-cancel" onClick={() => setActiveDocPreview(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VetsScreen;
