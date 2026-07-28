import { useEffect, useMemo, useState } from 'react';
import { 
  getDiseases, 
  getDiseaseGroups, 
  createDisease, 
  updateDisease, 
  deleteDisease, 
  createDiseaseGroup, 
  updateDiseaseGroup, 
  deleteDiseaseGroup,
  type Disease,
  type DiseaseGroup 
} from '../../services/diseaseService';
import { 
  Search, 
  Loader2, 
  Eye, 
  X, 
  Stethoscope, 
  Layers, 
  Plus, 
  Globe, 
  Trash2, 
  Edit3, 
  FolderPlus, 
  Activity 
} from 'lucide-react';
import '../../components/admin-v2/ListScreens.css';
import { getImageVariantUrl } from '../../utils/imageUtils';
import api from '../../services/api';

const PAGE_SIZE = 10;

const DiseasesScreen = () => {
  const [activeTab, setActiveTab] = useState<'diseases' | 'groups'>('diseases');
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [groups, setGroups] = useState<DiseaseGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [groupFilter, setGroupFilter] = useState('all');
  const [selectedDisease, setSelectedDisease] = useState<Disease | null>(null);
  const [page, setPage] = useState(1);

  // Image Uploader & Lightbox States
  const [uploadingDiseaseImage, setUploadingDiseaseImage] = useState(false);
  const [uploadingGroupImage, setUploadingGroupImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const handleImageUpload = async (file: File, type: 'disease' | 'group') => {
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File size exceeds 5MB limit");
      return;
    }
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Only JPG, PNG, and WEBP formats are supported");
      return;
    }

    setUploadError(null);
    if (type === 'disease') setUploadingDiseaseImage(true);
    else setUploadingGroupImage(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', type === 'disease' ? 'diseases' : 'diseases_groups');
      const response = await api.post('/upload/admin-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const serialized = JSON.stringify(response.data.images);
      
      if (type === 'disease') {
        setDiseaseForm(prev => ({ ...prev, image_path: serialized }));
      } else {
        setGroupForm(prev => ({ ...prev, image_path: serialized }));
      }
    } catch (err) {
      console.error("Image upload failed:", err);
      setUploadError("Image upload failed. Please try again.");
    } finally {
      setUploadingDiseaseImage(false);
      setUploadingGroupImage(false);
    }
  };

  const renderImageUploader = (currentPath: string, type: 'disease' | 'group') => {
    const isUploading = type === 'disease' ? uploadingDiseaseImage : uploadingGroupImage;
    const imgUrl = getImageVariantUrl(currentPath, 'medium');

    return (
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Cover Image</label>
        {uploadError && <div style={{ color: '#ef4444', fontSize: '0.78rem', marginBottom: 6 }}>{uploadError}</div>}
        
        {imgUrl ? (
          <div style={{ position: 'relative', width: '100%', height: 160, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
            <img src={imgUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.opacity = '1'} onMouseLeave={e => e.currentTarget.style.opacity = '0'}>
              <div style={{ display: 'flex', gap: 8 }}>
                <label className="export-btn" style={{ padding: '6px 12px', fontSize: '0.75rem', cursor: 'pointer', backgroundColor: '#fff', color: '#333' }}>
                  Replace
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file, type);
                  }} />
                </label>
                <button type="button" className="export-btn" style={{ padding: '6px 12px', fontSize: '0.75rem', backgroundColor: '#ef4444', color: '#fff' }} onClick={() => {
                  if (type === 'disease') setDiseaseForm(prev => ({ ...prev, image_path: '' }));
                  else setGroupForm(prev => ({ ...prev, image_path: '' }));
                }}>
                  Remove
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div 
            style={{ 
              width: '100%', 
              height: 120, 
              border: '2px dashed var(--border-color)', 
              borderRadius: 8, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              cursor: 'pointer',
              backgroundColor: '#fafafa',
              transition: 'all 0.2s'
            }}
            onClick={() => {
              const el = document.getElementById(`file-input-${type}`);
              el?.click();
            }}
            onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--primary-color)'; }}
            onDragLeave={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--border-color)'; }}
            onDrop={e => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (file) handleImageUpload(file, type);
            }}
          >
            {isUploading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Loader2 className="animate-spin" size={24} style={{ color: 'var(--primary-color)', marginBottom: 8 }} />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Uploading image...</span>
              </div>
            ) : (
              <>
                <Plus size={20} style={{ color: 'var(--text-secondary)', marginBottom: 4 }} />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Drag & drop or Click to upload cover image</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Supports JPG, PNG, WEBP up to 5MB</span>
              </>
            )}
            <input type="file" id={`file-input-${type}`} accept="image/*" style={{ display: 'none' }} onChange={e => {
              const file = e.target.files?.[0];
              if (file) handleImageUpload(file, type);
            }} />
          </div>
        )}
      </div>
    );
  };

  // Modals
  const [isDiseaseModalOpen, setIsDiseaseModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingDisease, setEditingDisease] = useState<Disease | null>(null);
  const [editingGroup, setEditingGroup] = useState<DiseaseGroup | null>(null);
  const [modalLang, setModalLang] = useState<'en' | 'hi'>('en');

  // Disease Form
  const [diseaseForm, setDiseaseForm] = useState({
    name: '',
    name_hi: '',
    category: 'Viral',
    description: '',
    description_hi: '',
    species: 'Cattle',
    symptoms: '',
    symptoms_hi: '',
    treatment: '',
    treatment_hi: '',
    severity_level: 1,
    image_path: '',
    group_id: ''
  });

  // Group Form
  const [groupForm, setGroupForm] = useState({
    name: '',
    name_hi: '',
    description: '',
    description_hi: '',
    icon_emoji: '🐄',
    image_path: ''
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [diseasesRes, groupsRes] = await Promise.all([
        getDiseases(),
        getDiseaseGroups()
      ]);
      setDiseases(diseasesRes || []);
      setGroups(groupsRes || []);
    } catch (err) {
      console.error('Error fetching disease directory data:', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = useMemo(() => {
    const set = new Set<string>();
    diseases.forEach(d => { if (d.category) set.add(d.category); });
    return Array.from(set).sort();
  }, [diseases]);

  const filteredDiseases = useMemo(() => {
    let result = diseases;
    if (categoryFilter !== 'all') {
      result = result.filter(d => d.category === categoryFilter);
    }
    if (groupFilter !== 'all') {
      result = result.filter(d => d.group_id === groupFilter);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(d =>
        d.name?.toLowerCase().includes(q) ||
        d.name_hi?.toLowerCase().includes(q) ||
        d.symptoms?.some(s => s.toLowerCase().includes(q))
      );
    }
    return result;
  }, [diseases, categoryFilter, groupFilter, searchTerm]);

  const filteredGroups = useMemo(() => {
    if (!searchTerm.trim()) return groups;
    const q = searchTerm.toLowerCase();
    return groups.filter(g =>
      g.name?.toLowerCase().includes(q) ||
      g.name_hi?.toLowerCase().includes(q)
    );
  }, [groups, searchTerm]);

  const stats = useMemo(() => ({
    totalDiseases: diseases.length,
    totalGroups: groups.length,
    bacterial: diseases.filter(d => d.category === 'Bacterial').length,
    viral: diseases.filter(d => d.category === 'Viral').length,
  }), [diseases, groups]);

  const paginatedDiseases = filteredDiseases.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDiseaseSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: diseaseForm.name,
        name_hi: diseaseForm.name_hi || null,
        category: diseaseForm.category,
        description: diseaseForm.description,
        description_hi: diseaseForm.description_hi || null,
        species: diseaseForm.species,
        symptoms: diseaseForm.symptoms ? diseaseForm.symptoms.split(',').map(s => s.trim()).filter(Boolean) : [],
        symptoms_hi: diseaseForm.symptoms_hi ? diseaseForm.symptoms_hi.split(',').map(s => s.trim()).filter(Boolean) : null,
        causes: [],
        causes_hi: null,
        treatments: diseaseForm.treatment ? [diseaseForm.treatment] : [],
        treatments_hi: diseaseForm.treatment_hi ? [diseaseForm.treatment_hi] : null,
        severity_level: Number(diseaseForm.severity_level),
        image_path: diseaseForm.image_path || null,
        group_id: diseaseForm.group_id || null,
      };

      if (editingDisease) {
        await updateDisease(editingDisease.id, payload);
      } else {
        await createDisease(payload);
      }
      setIsDiseaseModalOpen(false);
      loadAllData();
    } catch (err) {
      console.error('Error saving disease:', err);
      alert('Failed to save disease details.');
    }
  };

  const handleGroupSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: groupForm.name,
        name_hi: groupForm.name_hi || null,
        description: groupForm.description || null,
        description_hi: groupForm.description_hi || null,
        icon_emoji: groupForm.icon_emoji || '🐄',
        image_path: groupForm.image_path || null,
      };

      if (editingGroup) {
        await updateDiseaseGroup(editingGroup.id, payload);
      } else {
        await createDiseaseGroup(payload);
      }
      setIsGroupModalOpen(false);
      loadAllData();
    } catch (err) {
      console.error('Error saving disease group:', err);
      alert('Failed to save category group.');
    }
  };

  const handleDeleteDiseaseClick = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this disease?')) {
      await deleteDisease(id);
      loadAllData();
    }
  };

  const handleDeleteGroupClick = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this category group? Associated diseases will lose their category link.')) {
      await deleteDiseaseGroup(id);
      loadAllData();
    }
  };

  const openCreateDiseaseModal = () => {
    setEditingDisease(null);
    setDiseaseForm({
      name: '',
      name_hi: '',
      category: 'Viral',
      description: '',
      description_hi: '',
      species: 'Cattle',
      symptoms: '',
      symptoms_hi: '',
      treatment: '',
      treatment_hi: '',
      severity_level: 1,
      image_path: '',
      group_id: ''
    });
    setModalLang('en');
    setIsDiseaseModalOpen(true);
  };

  const openEditDiseaseModal = (d: Disease) => {
    setEditingDisease(d);
    setDiseaseForm({
      name: d.name,
      name_hi: d.name_hi || '',
      category: d.category || 'Viral',
      description: d.description || '',
      description_hi: d.description_hi || '',
      species: d.species || 'Cattle',
      symptoms: (d.symptoms || []).join(', '),
      symptoms_hi: (d.symptoms_hi || []).join(', '),
      treatment: (d.treatments || [])[0] || '',
      treatment_hi: (d.treatments_hi || [])[0] || '',
      severity_level: d.severity_level || 1,
      image_path: d.image_path || '',
      group_id: d.group_id || ''
    });
    setModalLang('en');
    setIsDiseaseModalOpen(true);
  };

  const openCreateGroupModal = () => {
    setEditingGroup(null);
    setGroupForm({
      name: '',
      name_hi: '',
      description: '',
      description_hi: '',
      icon_emoji: '🐄',
      image_path: ''
    });
    setModalLang('en');
    setIsGroupModalOpen(true);
  };

  const openEditGroupModal = (g: DiseaseGroup) => {
    setEditingGroup(g);
    setGroupForm({
      name: g.name,
      name_hi: g.name_hi || '',
      description: g.description || '',
      description_hi: g.description_hi || '',
      icon_emoji: g.icon_emoji || '🐄',
      image_path: g.image_path || ''
    });
    setModalLang('en');
    setIsGroupModalOpen(true);
  };

  if (loading) return (
    <div className="loading-spinner">
      <Loader2 size={36} />
      <p>Loading disease directory...</p>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="list-screen-header">
        <div>
          <h1 className="list-screen-title">Manage Diseases</h1>
          <p className="list-screen-subtitle">Manage livestock disease database, symptoms, treatments, and category groups</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="export-btn" style={{ backgroundColor: '#e6f0eb', color: '#0a4f32', border: '1px solid #0a4f32' }} onClick={openCreateGroupModal}>
            <FolderPlus size={16} /> New Category Group
          </button>
          <button className="export-btn" onClick={openCreateDiseaseModal}>
            <Plus size={16} /> Add Disease
          </button>
        </div>
      </div>

      {/* Main Tabs (Diseases vs Category Groups) */}
      <div className="list-tabs" style={{ marginBottom: 20 }}>
        <button
          className={`list-tab ${activeTab === 'diseases' ? 'active' : ''}`}
          onClick={() => { setActiveTab('diseases'); setPage(1); }}
        >
          <Stethoscope size={16} style={{ display: 'inline', marginRight: 6 }} />
          Diseases ({diseases.length})
        </button>
        <button
          className={`list-tab ${activeTab === 'groups' ? 'active' : ''}`}
          onClick={() => { setActiveTab('groups'); setPage(1); }}
        >
          <Layers size={16} style={{ display: 'inline', marginRight: 6 }} />
          Category Groups ({groups.length})
        </button>
      </div>

      {/* KPI Cards */}
      <div className="list-kpi-row">
        {[
          { label: 'Total Diseases', value: stats.totalDiseases, icon: <Stethoscope size={16} />, bg: '#dbeafe', color: '#3b82f6' },
          { label: 'Category Groups', value: stats.totalGroups, icon: <Layers size={16} />, bg: '#e6f0eb', color: '#0a4f32' },
          { label: 'Bacterial', value: stats.bacterial, icon: <Activity size={16} />, bg: '#dcfce7', color: '#10b981' },
          { label: 'Viral', value: stats.viral, icon: <Activity size={16} />, bg: '#fee2e2', color: '#ef4444' },
        ].map(kpi => (
          <div key={kpi.label} className="list-kpi-card">
            <div className="list-kpi-icon" style={{ backgroundColor: kpi.bg, color: kpi.color }}>{kpi.icon}</div>
            <div className="list-kpi-value">{kpi.value}</div>
            <div className="list-kpi-label">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="list-filter-bar">
        <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input className="filter-search" style={{ paddingLeft: 36 }} placeholder={activeTab === 'diseases' ? 'Search disease name or symptom...' : 'Search group name...'} value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setPage(1); }} />
        </div>
        {activeTab === 'diseases' && (
          <>
            <select className="filter-select" value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}>
              <option value="all">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="filter-select" value={groupFilter} onChange={e => { setGroupFilter(e.target.value); setPage(1); }}>
              <option value="all">All Groups</option>
              {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </>
        )}
      </div>

      {/* TAB 1: DISEASES TABLE */}
      {activeTab === 'diseases' && (
        <div className="list-table-card">
          <div style={{ overflowX: 'auto' }}>
            <table className="list-table">
              <thead>
                <tr>
                  <th>Disease</th>
                  <th>Hindi Name</th>
                  <th>Category Group</th>
                  <th>Pathogen / Category</th>
                  <th>Target Animals</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedDiseases.map(d => {
                  const imgUrl = getImageVariantUrl(d.image_path, 'thumbnail');
                  const groupObj = groups.find(g => g.id === d.group_id) || d.group;
                  return (
                    <tr key={d.id} onClick={() => setSelectedDisease(d)}>
                      <td>
                        <div className="list-cell-name">
                          {imgUrl ? (
                            <img src={imgUrl} alt={d.name} style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }} />
                          ) : (
                            <div className="list-cell-avatar" style={{ backgroundColor: '#dbeafe', color: '#1e40af' }}>
                              {(d.name || 'D')[0]}
                            </div>
                          )}
                          <div>
                            <div style={{ fontWeight: 600 }}>{d.name}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{d.name_hi || '—'}</td>
                      <td>
                        {groupObj ? (
                          <span className="list-status-badge" style={{ backgroundColor: '#e6f0eb', color: '#0a4f32' }}>
                            {groupObj.icon_emoji ? `${groupObj.icon_emoji} ` : ''}{groupObj.name}
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>Unassigned</span>
                        )}
                      </td>
                      <td>
                        <span className="list-status-badge" style={{ backgroundColor: '#e2e8f0', color: '#334155' }}>
                          {d.category || d.pathogen_type || 'General'}
                        </span>
                      </td>
                      <td>{d.species || 'Cattle, Buffalo'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <button onClick={e => { e.stopPropagation(); setSelectedDisease(d); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }} title="View details">
                            <Eye size={18} />
                          </button>
                          <button onClick={e => { e.stopPropagation(); openEditDiseaseModal(d); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--humal-green)' }} title="Edit disease">
                            <Edit3 size={18} />
                          </button>
                          <button onClick={e => { e.stopPropagation(); handleDeleteDiseaseClick(d.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }} title="Delete disease">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {paginatedDiseases.length === 0 && (
                  <tr><td colSpan={6} className="list-empty">No diseases found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CATEGORY GROUPS GRID */}
      {activeTab === 'groups' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {filteredGroups.map(g => {
            const count = diseases.filter(d => d.group_id === g.id).length;
            const imgUrl = getImageVariantUrl(g.image_path, 'medium');
            return (
              <div key={g.id} style={{ background: 'var(--card-white)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 42, height: 42, borderRadius: 8, backgroundColor: '#e6f0eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
                        {g.icon_emoji || '🐄'}
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600 }}>{g.name}</h3>
                        {g.name_hi && <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{g.name_hi}</p>}
                      </div>
                    </div>
                    <span className="list-status-badge" style={{ backgroundColor: '#dbeafe', color: '#1e40af' }}>
                      {count} {count === 1 ? 'Disease' : 'Diseases'}
                    </span>
                  </div>

                  {imgUrl && (
                    <img src={imgUrl} alt={g.name} style={{ width: '100%', height: 100, borderRadius: 6, objectFit: 'cover', margin: '8px 0' }} />
                  )}

                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '8px 0 0 0' }}>
                    {g.description || 'No description provided.'}
                  </p>
                </div>

                <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <button onClick={() => openEditGroupModal(g)} className="export-btn" style={{ padding: '6px 12px', backgroundColor: '#e6f0eb', color: '#0a4f32' }}>
                    <Edit3 size={14} /> Edit
                  </button>
                  <button onClick={() => handleDeleteGroupClick(g.id)} className="export-btn" style={{ padding: '6px 12px', backgroundColor: '#fee2e2', color: '#ef4444' }}>
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            );
          })}
          {filteredGroups.length === 0 && (
            <div className="list-empty" style={{ gridColumn: '1 / -1' }}>No category groups defined yet.</div>
          )}
        </div>
      )}

      {/* DISEASE MODAL */}
      {isDiseaseModalOpen && (
        <>
          <div className="profile-drawer-overlay" onClick={() => setIsDiseaseModalOpen(false)} />
          <div className="profile-drawer" style={{ width: 540 }}>
            <div className="drawer-header">
              <div className="drawer-name">{editingDisease ? 'Edit Disease' : 'Add New Disease'}</div>
              <button className="drawer-close" onClick={() => setIsDiseaseModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleDiseaseSave} className="drawer-body" style={{ gap: 14, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: 12 }}>
                <button type="button" className={`drawer-tab ${modalLang === 'en' ? 'active' : ''}`} onClick={() => setModalLang('en')}>
                  <Globe size={14} style={{ display: 'inline', marginRight: 4 }} /> English Details
                </button>
                <button type="button" className={`drawer-tab ${modalLang === 'hi' ? 'active' : ''}`} onClick={() => setModalLang('hi')}>
                  <Globe size={14} style={{ display: 'inline', marginRight: 4 }} /> Hindi Translation (हिंदी)
                </button>
              </div>

              {modalLang === 'en' ? (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Disease Name *</label>
                    <input type="text" required className="filter-search" style={{ width: '100%', boxSizing: 'border-box' }} value={diseaseForm.name} onChange={e => setDiseaseForm({ ...diseaseForm, name: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Category Group</label>
                    <select className="filter-select" style={{ width: '100%' }} value={diseaseForm.group_id} onChange={e => setDiseaseForm({ ...diseaseForm, group_id: e.target.value })}>
                      <option value="">-- Unassigned --</option>
                      {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Category</label>
                    <select className="filter-select" style={{ width: '100%' }} value={diseaseForm.category} onChange={e => setDiseaseForm({ ...diseaseForm, category: e.target.value })}>
                      <option value="Viral">Viral</option>
                      <option value="Bacterial">Bacterial</option>
                      <option value="Parasitic">Parasitic</option>
                      <option value="Fungal">Fungal</option>
                      <option value="Nutritional/Toxic">Nutritional/Toxic</option>
                    </select>
                  </div>
                  {renderImageUploader(diseaseForm.image_path, 'disease')}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Symptoms (comma separated)</label>
                    <textarea className="filter-search" style={{ width: '100%', boxSizing: 'border-box', height: 70 }} value={diseaseForm.symptoms} onChange={e => setDiseaseForm({ ...diseaseForm, symptoms: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Treatment</label>
                    <textarea className="filter-search" style={{ width: '100%', boxSizing: 'border-box', height: 70 }} value={diseaseForm.treatment} onChange={e => setDiseaseForm({ ...diseaseForm, treatment: e.target.value })} />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Disease Name (Hindi)</label>
                    <input type="text" className="filter-search" style={{ width: '100%', boxSizing: 'border-box' }} value={diseaseForm.name_hi} onChange={e => setDiseaseForm({ ...diseaseForm, name_hi: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Symptoms in Hindi (हिंदी लक्षण)</label>
                    <textarea className="filter-search" style={{ width: '100%', boxSizing: 'border-box', height: 70 }} value={diseaseForm.symptoms_hi} onChange={e => setDiseaseForm({ ...diseaseForm, symptoms_hi: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Treatment in Hindi (हिंदी उपचार)</label>
                    <textarea className="filter-search" style={{ width: '100%', boxSizing: 'border-box', height: 70 }} value={diseaseForm.treatment_hi} onChange={e => setDiseaseForm({ ...diseaseForm, treatment_hi: e.target.value })} />
                  </div>
                </>
              )}

              <button type="submit" className="export-btn" style={{ marginTop: 12 }}>
                {editingDisease ? 'Update Disease' : 'Create Disease'}
              </button>
            </form>
          </div>
        </>
      )}

      {/* GROUP MODAL */}
      {isGroupModalOpen && (
        <>
          <div className="profile-drawer-overlay" onClick={() => setIsGroupModalOpen(false)} />
          <div className="profile-drawer" style={{ width: 460 }}>
            <div className="drawer-header">
              <div className="drawer-name">{editingGroup ? 'Edit Category Group' : 'Add Category Group'}</div>
              <button className="drawer-close" onClick={() => setIsGroupModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleGroupSave} className="drawer-body" style={{ gap: 14, display: 'flex', flexDirection: 'column' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Group Name *</label>
                <input type="text" required className="filter-search" style={{ width: '100%', boxSizing: 'border-box' }} value={groupForm.name} onChange={e => setGroupForm({ ...groupForm, name: e.target.value })} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Group Name (Hindi)</label>
                <input type="text" className="filter-search" style={{ width: '100%', boxSizing: 'border-box' }} value={groupForm.name_hi} onChange={e => setGroupForm({ ...groupForm, name_hi: e.target.value })} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Icon Emoji</label>
                <input type="text" className="filter-search" style={{ width: 80 }} value={groupForm.icon_emoji} onChange={e => setGroupForm({ ...groupForm, icon_emoji: e.target.value })} />
              </div>
              {renderImageUploader(groupForm.image_path, 'group')}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Description</label>
                <textarea className="filter-search" style={{ width: '100%', boxSizing: 'border-box', height: 70 }} value={groupForm.description} onChange={e => setGroupForm({ ...groupForm, description: e.target.value })} />
              </div>

              <button type="submit" className="export-btn" style={{ marginTop: 12 }}>
                {editingGroup ? 'Update Category Group' : 'Create Category Group'}
              </button>
            </form>
          </div>
        </>
      )}

      {/* DETAIL DRAWER */}
      {selectedDisease && (
        <>
          <div className="profile-drawer-overlay" onClick={() => setSelectedDisease(null)} />
          <div className="profile-drawer">
            <div className="drawer-header">
              <div className="drawer-profile">
                <div className="drawer-avatar" style={{ backgroundColor: '#dbeafe', color: '#1e40af' }}>{(selectedDisease.name || 'D')[0]}</div>
                <div>
                  <div className="drawer-name">{selectedDisease.name}</div>
                  <div className="drawer-meta">{selectedDisease.name_hi || selectedDisease.category}</div>
                </div>
              </div>
              <button className="drawer-close" onClick={() => setSelectedDisease(null)}><X size={20} /></button>
            </div>
            <div className="drawer-body">
              {selectedDisease.image_path && (
                <div 
                  style={{ 
                    position: 'relative', 
                    width: '100%', 
                    height: 200, 
                    borderRadius: 8, 
                    overflow: 'hidden', 
                    marginBottom: 16, 
                    cursor: 'pointer',
                    border: '1px solid var(--border-color)' 
                  }}
                  onClick={() => setLightboxUrl(getImageVariantUrl(selectedDisease.image_path, 'large'))}
                >
                  <img 
                    src={getImageVariantUrl(selectedDisease.image_path, 'medium')} 
                    alt={selectedDisease.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                  <div style={{ position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(0, 0, 0, 0.6)', color: '#fff', padding: '4px 8px', borderRadius: 4, fontSize: '0.72rem' }}>
                    Click to expand
                  </div>
                </div>
              )}
              <div className="drawer-section">
                <div className="drawer-section-title">Disease Details</div>
                {[
                  ['Name (English)', selectedDisease.name || '—'],
                  ['Name (Hindi)', selectedDisease.name_hi || '—'],
                  ['Category Group', groups.find(g => g.id === selectedDisease.group_id)?.name || 'Unassigned'],
                  ['Category', selectedDisease.category || '—'],
                  ['Target Species', selectedDisease.species || 'Cattle, Buffalo'],
                  ['Symptoms', (selectedDisease.symptoms || []).join(', ') || '—'],
                  ['Treatment', (selectedDisease.treatments || []).join(', ') || '—'],
                ].map(([label, value]) => (
                  <div key={label as string} className="drawer-detail-row">
                    <span className="drawer-detail-label">{label}</span>
                    <span className="drawer-detail-value">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* LIGHTBOX / IMAGE VIEWER */}
      {lightboxUrl && (
        <div 
          style={{ 
            position: 'fixed', 
            inset: 0, 
            backgroundColor: 'rgba(0,0,0,0.9)', 
            zIndex: 9999, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}
          onClick={() => { setLightboxUrl(null); setZoomLevel(1); }}
        >
          <div 
            style={{ position: 'absolute', top: 20, right: 20, display: 'flex', gap: 12 }}
            onClick={e => e.stopPropagation()}
          >
            <button className="export-btn" style={{ backgroundColor: '#fff', color: '#333' }} onClick={() => setZoomLevel(prev => Math.min(prev + 0.5, 3))}>Zoom In</button>
            <button className="export-btn" style={{ backgroundColor: '#fff', color: '#333' }} onClick={() => setZoomLevel(prev => Math.max(prev - 0.5, 1))}>Zoom Out</button>
            <a href={lightboxUrl} target="_blank" rel="noreferrer" className="export-btn" style={{ backgroundColor: '#fff', color: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>Open Original</a>
            <button className="export-btn" style={{ backgroundColor: '#ef4444', color: '#fff' }} onClick={() => { setLightboxUrl(null); setZoomLevel(1); }}><X size={16} /></button>
          </div>
          <img 
            src={lightboxUrl} 
            alt="Disease full screen" 
            style={{ 
              maxWidth: '90%', 
              maxHeight: '80%', 
              objectFit: 'contain', 
              transform: `scale(${zoomLevel})`, 
              transition: 'transform 0.2s ease-in-out' 
            }} 
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default DiseasesScreen;
