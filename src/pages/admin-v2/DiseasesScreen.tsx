import { useEffect, useMemo, useState, useRef } from 'react';
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

const ChipsInput = ({ 
  label, 
  values, 
  onChange, 
  placeholder 
}: { 
  label: string, 
  values: string[], 
  onChange: (newVals: string[]) => void, 
  placeholder?: string 
}) => {
  const [inputVal, setInputVal] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmed = inputVal.trim();
      if (trimmed && !values.includes(trimmed)) {
        onChange([...values, trimmed]);
      }
      setInputVal('');
    }
  };

  const removeChip = (idx: number) => {
    onChange(values.filter((_, i) => i !== idx));
  };

  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>{label}</label>
      <div 
        style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 6, 
          padding: '6px 10px', 
          border: '1px solid var(--border-color)', 
          borderRadius: 6,
          backgroundColor: '#fff',
          alignItems: 'center'
        }}
      >
        {values.map((v, i) => (
          <span 
            key={i} 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 4, 
              backgroundColor: '#e6f0eb', 
              color: '#0a4f32', 
              padding: '2px 8px', 
              borderRadius: 4, 
              fontSize: '0.78rem',
              fontWeight: 500
            }}
          >
            {v}
            <button 
              type="button" 
              onClick={() => removeChip(i)} 
              style={{ border: 'none', background: 'none', padding: 0, display: 'flex', alignItems: 'center', cursor: 'pointer', color: '#0a4f32' }}
            >
              <X size={10} />
            </button>
          </span>
        ))}
        <input 
          type="text" 
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={values.length === 0 ? (placeholder || 'Type and press Enter') : ''}
          style={{ 
            border: 'none', 
            outline: 'none', 
            fontSize: '0.82rem', 
            flexGrow: 1, 
            padding: '2px 4px', 
            minWidth: 100 
          }} 
        />
      </div>
    </div>
  );
};
const AdvancedTextarea = ({ 
  label, 
  value, 
  onChange, 
  placeholder
}: { 
  label: string, 
  value: string, 
  onChange: (val: string) => void, 
  placeholder?: string
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertText = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const replacement = prefix + selected + suffix;

    const newVal = text.substring(0, start) + replacement + text.substring(end);
    onChange(newVal);

    // Reset cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 0);
  };

  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const charCount = value.length;

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>{label}</label>
      </div>

      <div style={{ border: '1px solid var(--border-color)', borderRadius: 8, overflow: 'hidden', backgroundColor: '#fff' }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 6, padding: '6px 10px', borderBottom: '1px solid var(--border-color)', backgroundColor: '#fafafa', alignItems: 'center' }}>
          <button 
            type="button" 
            onClick={() => insertText('**', '**')}
            style={{ fontWeight: 'bold', width: 28, height: 24, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid #e2e8f0', borderRadius: 4, background: '#fff', fontSize: '0.82rem' }}
            title="Bold"
          >
            B
          </button>
          <button 
            type="button" 
            onClick={() => insertText('*', '*')}
            style={{ fontStyle: 'italic', width: 28, height: 24, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid #e2e8f0', borderRadius: 4, background: '#fff', fontSize: '0.82rem' }}
            title="Italic"
          >
            I
          </button>
          <button 
            type="button" 
            onClick={() => insertText('\n- ', '')}
            style={{ width: 28, height: 24, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid #e2e8f0', borderRadius: 4, background: '#fff', fontSize: '0.82rem' }}
            title="Bullet List"
          >
            •
          </button>
          <button 
            type="button" 
            onClick={() => insertText('\n1. ', '')}
            style={{ width: 28, height: 24, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid #e2e8f0', borderRadius: 4, background: '#fff', fontSize: '0.82rem' }}
            title="Numbered List"
          >
            1.
          </button>
          <div style={{ flexGrow: 1 }} />
          <button 
            type="button" 
            onClick={() => onChange('')}
            style={{ width: 48, height: 24, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid #e2e8f0', borderRadius: 4, background: '#fff', fontSize: '0.72rem', color: '#ef4444' }}
            title="Clear Text"
          >
            Clear
          </button>
        </div>

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ 
            width: '100%', 
            height: 100, 
            border: 'none', 
            outline: 'none', 
            padding: '10px 12px', 
            fontSize: '0.85rem', 
            fontFamily: 'inherit', 
            resize: 'vertical',
            boxSizing: 'border-box',
            lineHeight: '1.45'
          }}
        />

        {/* Stats footer */}
        <div style={{ padding: '4px 10px', borderTop: '1px solid var(--border-color)', backgroundColor: '#fafafa', display: 'flex', justifyContent: 'flex-end', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
          {wordCount} words | {charCount} chars
        </div>
      </div>
    </div>
  );
};

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
          <div 
            style={{ position: 'relative', width: '100%', height: 180, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border-color)', cursor: 'pointer' }}
            onClick={() => setLightboxUrl(getImageVariantUrl(currentPath, 'large'))}
          >
            <img src={imgUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div 
              style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.3)', display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', padding: 12, opacity: 0, transition: 'opacity 0.2s' }} 
              onMouseEnter={e => e.currentTarget.style.opacity = '1'} 
              onMouseLeave={e => e.currentTarget.style.opacity = '0'}
            >
              <div style={{ display: 'flex', gap: 8 }} onClick={e => e.stopPropagation()}>
                <label className="export-btn" style={{ padding: '6px 12px', fontSize: '0.75rem', cursor: 'pointer', backgroundColor: '#fff', color: '#333', border: '1px solid #ccc' }}>
                  Replace
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file, type);
                  }} />
                </label>
                <button type="button" className="export-btn" style={{ padding: '6px 12px', fontSize: '0.75rem', backgroundColor: '#ef4444', color: '#fff', border: 'none' }} onClick={() => {
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
    symptoms: [] as string[],
    symptoms_hi: [] as string[],
    treatment: [] as string[],
    treatment_hi: [] as string[],
    severity_level: 1,
    image_path: '',
    group_id: '',
    body_system: 'Respiratory',
    disease_type: 'Infectious',
    causes: '',
    causes_hi: '',
    pathogen_type: 'Virus',
    pathogen_name: '',
    is_common: false
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
        symptoms: diseaseForm.symptoms || [],
        symptoms_hi: diseaseForm.symptoms_hi || [],
        causes: diseaseForm.causes ? diseaseForm.causes.split('\n').map(c => c.trim()).filter(Boolean) : [],
        causes_hi: diseaseForm.causes_hi ? diseaseForm.causes_hi.split('\n').map(c => c.trim()).filter(Boolean) : [],
        treatments: diseaseForm.treatment || [],
        treatments_hi: diseaseForm.treatment_hi || [],
        severity_level: Number(diseaseForm.severity_level),
        image_path: diseaseForm.image_path || null,
        group_id: diseaseForm.group_id || null,
        body_system: diseaseForm.body_system || null,
        disease_type: diseaseForm.disease_type || null,
        pathogen_type: diseaseForm.pathogen_type || null,
        pathogen_name: diseaseForm.pathogen_name || null,
        is_common: diseaseForm.is_common || false
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
      symptoms: [] as string[],
      symptoms_hi: [] as string[],
      treatment: [] as string[],
      treatment_hi: [] as string[],
      severity_level: 1,
      image_path: '',
      group_id: '',
      body_system: 'Respiratory',
      disease_type: 'Infectious',
      causes: '',
      causes_hi: '',
      pathogen_type: 'Virus',
      pathogen_name: '',
      is_common: false
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
      symptoms: d.symptoms || [],
      symptoms_hi: d.symptoms_hi || [],
      treatment: d.treatments || [],
      treatment_hi: d.treatments_hi || [],
      severity_level: d.severity_level || 1,
      image_path: d.image_path || '',
      group_id: d.group_id || '',
      body_system: d.body_system || 'Respiratory',
      disease_type: d.disease_type || 'Infectious',
      causes: (d.causes || []).join('\n'),
      causes_hi: (d.causes_hi || []).join('\n'),
      pathogen_type: d.pathogen_type || 'Virus',
      pathogen_name: d.pathogen_name || '',
      is_common: d.is_common || false
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

          {/* Pagination Footer */}
          {filteredDiseases.length > PAGE_SIZE && (
            <div 
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginTop: 16, 
                padding: '12px 16px', 
                backgroundColor: '#fff', 
                border: '1px solid var(--border-color)', 
                borderRadius: 8 
              }}
            >
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Showing <strong style={{ color: 'var(--text-primary)' }}>{Math.min(filteredDiseases.length, (page - 1) * PAGE_SIZE + 1)}</strong> to{' '}
                <strong style={{ color: 'var(--text-primary)' }}>{Math.min(filteredDiseases.length, page * PAGE_SIZE)}</strong> of{' '}
                <strong style={{ color: 'var(--text-primary)' }}>{filteredDiseases.length}</strong> diseases
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))} 
                  disabled={page === 1}
                  className="export-btn"
                  style={{ 
                    backgroundColor: page === 1 ? '#f5f5f5' : '#fff', 
                    color: page === 1 ? '#a3a3a3' : 'var(--text-primary)', 
                    border: '1px solid var(--border-color)',
                    cursor: page === 1 ? 'not-allowed' : 'pointer',
                    padding: '6px 12px',
                    fontSize: '0.8rem'
                  }}
                >
                  Previous
                </button>
                {[...Array(Math.ceil(filteredDiseases.length / PAGE_SIZE))].map((_, idx) => {
                  const pNum = idx + 1;
                  return (
                    <button
                      key={pNum}
                      onClick={() => setPage(pNum)}
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.8rem',
                        borderRadius: 6,
                        border: '1px solid var(--border-color)',
                        cursor: 'pointer',
                        fontWeight: 600,
                        backgroundColor: page === pNum ? 'var(--humal-green)' : '#fff',
                        color: page === pNum ? '#fff' : 'var(--text-primary)'
                      }}
                    >
                      {pNum}
                    </button>
                  );
                })}
                <button 
                  onClick={() => setPage(p => Math.min(Math.ceil(filteredDiseases.length / PAGE_SIZE), p + 1))} 
                  disabled={page === Math.ceil(filteredDiseases.length / PAGE_SIZE)}
                  className="export-btn"
                  style={{ 
                    backgroundColor: page === Math.ceil(filteredDiseases.length / PAGE_SIZE) ? '#f5f5f5' : '#fff', 
                    color: page === Math.ceil(filteredDiseases.length / PAGE_SIZE) ? '#a3a3a3' : 'var(--text-primary)', 
                    border: '1px solid var(--border-color)',
                    cursor: page === Math.ceil(filteredDiseases.length / PAGE_SIZE) ? 'not-allowed' : 'pointer',
                    padding: '6px 12px',
                    fontSize: '0.8rem'
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CATEGORY GROUPS TABLE */}
      {activeTab === 'groups' && (
        <div className="list-table-card">
          <div style={{ overflowX: 'auto' }}>
            <table className="list-table">
              <thead>
                <tr>
                  <th>Group Name</th>
                  <th>Hindi Name</th>
                  <th>Description</th>
                  <th>Associated Diseases</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredGroups.map(g => {
                  const count = diseases.filter(d => d.group_id === g.id).length;
                  const imgUrl = getImageVariantUrl(g.image_path, 'medium');
                  return (
                    <tr key={g.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {imgUrl ? (
                            <img src={imgUrl} alt={g.name} style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: 36, height: 36, borderRadius: 6, backgroundColor: '#e6f0eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--humal-green)' }}>
                              <Layers size={18} />
                            </div>
                          )}
                          <div style={{ fontWeight: 600 }}>{g.name}</div>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{g.name_hi || '—'}</td>
                      <td style={{ color: 'var(--text-secondary)', maxWidth: 280, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {g.description || 'No description provided.'}
                      </td>
                      <td>
                        <span 
                          className="list-status-badge" 
                          style={{ backgroundColor: '#dbeafe', color: '#1e40af', cursor: 'pointer' }}
                          title="Click to view associated diseases"
                          onClick={() => {
                            setGroupFilter(g.id);
                            setActiveTab('diseases');
                            setPage(1);
                          }}
                        >
                          {count} {count === 1 ? 'Disease' : 'Diseases'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <button onClick={() => openEditGroupModal(g)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--humal-green)' }} title="Edit group">
                            <Edit3 size={18} />
                          </button>
                          <button onClick={() => handleDeleteGroupClick(g.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }} title="Delete group">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredGroups.length === 0 && (
                  <tr><td colSpan={5} className="list-empty">No category groups found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DISEASE MODAL */}
      {isDiseaseModalOpen && (
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
          onClick={() => setIsDiseaseModalOpen(false)}
        >
          <div 
            style={{ 
              backgroundColor: '#fff', 
              borderRadius: 16, 
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', 
              width: '100%', 
              maxWidth: 900, 
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
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {editingDisease ? 'Edit Disease Details' : 'Add New Disease'}
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Provide clinical profiles, pathogen types, symptoms, and treatments.
                </p>
              </div>
              <button 
                onClick={() => setIsDiseaseModalOpen(false)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Language Selection Tabs */}
            <div 
              style={{ 
                padding: '0 24px', 
                borderBottom: '1px solid var(--border-color)', 
                display: 'flex', 
                backgroundColor: '#fff' 
              }}
            >
              <button 
                type="button" 
                onClick={() => setModalLang('en')}
                style={{ 
                  padding: '14px 20px', 
                  fontSize: '0.88rem', 
                  fontWeight: 600, 
                  border: 'none', 
                  background: 'none', 
                  cursor: 'pointer',
                  borderBottom: modalLang === 'en' ? '2px solid var(--humal-green)' : '2px solid transparent',
                  color: modalLang === 'en' ? 'var(--humal-green)' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <Globe size={14} /> English details
              </button>
              <button 
                type="button" 
                onClick={() => setModalLang('hi')}
                style={{ 
                  padding: '14px 20px', 
                  fontSize: '0.88rem', 
                  fontWeight: 600, 
                  border: 'none', 
                  background: 'none', 
                  cursor: 'pointer',
                  borderBottom: modalLang === 'hi' ? '2px solid var(--humal-green)' : '2px solid transparent',
                  color: modalLang === 'hi' ? 'var(--humal-green)' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <Globe size={14} /> Hindi Translation (हिंदी)
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleDiseaseSave} style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden' }}>
              <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
                {modalLang === 'en' ? (
                  <>
                    {/* Cover Image Banner Preview at the Top */}
                    {renderImageUploader(diseaseForm.image_path, 'disease')}

                    {/* Section 1: General & Classification */}
                    <div style={{ backgroundColor: '#fcfcfc', border: '1px solid var(--border-color)', borderRadius: 10, padding: 18 }}>
                      <h4 style={{ margin: '0 0 14px 0', fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)', borderBottom: '1px dashed var(--border-color)', paddingBottom: 6 }}>General Information</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Disease Name *</label>
                          <input type="text" required className="filter-search" style={{ width: '100%', boxSizing: 'border-box' }} value={diseaseForm.name} onChange={e => setDiseaseForm({ ...diseaseForm, name: e.target.value })} placeholder="e.g. Foot and Mouth Disease" />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Category Group</label>
                          <select className="filter-select" style={{ width: '100%' }} value={diseaseForm.group_id} onChange={e => setDiseaseForm({ ...diseaseForm, group_id: e.target.value })}>
                            <option value="">-- Unassigned --</option>
                            {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                          </select>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 12 }}>
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
                        <div>
                          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Target Species</label>
                          <input type="text" className="filter-search" style={{ width: '100%', boxSizing: 'border-box' }} value={diseaseForm.species} onChange={e => setDiseaseForm({ ...diseaseForm, species: e.target.value })} placeholder="e.g. Cattle, Buffalo" />
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Systems Affected & Pathogen */}
                    <div style={{ backgroundColor: '#fcfcfc', border: '1px solid var(--border-color)', borderRadius: 10, padding: 18 }}>
                      <h4 style={{ margin: '0 0 14px 0', fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)', borderBottom: '1px dashed var(--border-color)', paddingBottom: 6 }}>Clinical details</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Body System Affected</label>
                          <select className="filter-select" style={{ width: '100%' }} value={diseaseForm.body_system} onChange={e => setDiseaseForm({ ...diseaseForm, body_system: e.target.value })}>
                            <option value="Respiratory">Respiratory</option>
                            <option value="Digestive">Digestive</option>
                            <option value="Musculoskeletal">Musculoskeletal</option>
                            <option value="Nervous">Nervous</option>
                            <option value="Integumentary">Integumentary</option>
                            <option value="Reproductive">Reproductive</option>
                            <option value="Circulatory">Circulatory</option>
                            <option value="Urinary">Urinary</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Disease Type</label>
                          <select className="filter-select" style={{ width: '100%' }} value={diseaseForm.disease_type} onChange={e => setDiseaseForm({ ...diseaseForm, disease_type: e.target.value })}>
                            <option value="Infectious">Infectious</option>
                            <option value="Zoonotic">Zoonotic</option>
                            <option value="Hereditary">Hereditary</option>
                            <option value="Metabolic">Metabolic</option>
                            <option value="Deficiency">Deficiency</option>
                            <option value="Toxicological">Toxicological</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginTop: 12 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Pathogen Type</label>
                          <select className="filter-select" style={{ width: '100%' }} value={diseaseForm.pathogen_type} onChange={e => setDiseaseForm({ ...diseaseForm, pathogen_type: e.target.value })}>
                            <option value="Virus">Virus</option>
                            <option value="Bacteria">Bacteria</option>
                            <option value="Fungus">Fungus</option>
                            <option value="Parasite">Parasite</option>
                            <option value="Prion">Prion</option>
                            <option value="Toxin">Toxin</option>
                            <option value="Unknown">Unknown</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Pathogen Name</label>
                          <input type="text" className="filter-search" style={{ width: '100%', boxSizing: 'border-box' }} value={diseaseForm.pathogen_name} onChange={e => setDiseaseForm({ ...diseaseForm, pathogen_name: e.target.value })} placeholder="e.g. Aphthovirus" />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Severity Level (1-5)</label>
                          <select className="filter-select" style={{ width: '100%' }} value={diseaseForm.severity_level} onChange={e => setDiseaseForm({ ...diseaseForm, severity_level: Number(e.target.value) })}>
                            <option value="1">1 (Mild)</option>
                            <option value="2">2 (Moderate)</option>
                            <option value="3">3 (Severe)</option>
                            <option value="4">4 (Very Severe)</option>
                            <option value="5">5 (Critical)</option>
                          </select>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14 }}>
                        <input type="checkbox" id="is_common" checked={diseaseForm.is_common} onChange={e => setDiseaseForm({ ...diseaseForm, is_common: e.target.checked })} style={{ cursor: 'pointer' }} />
                        <label htmlFor="is_common" style={{ fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}>Mark as Common Disease</label>
                      </div>
                    </div>

                    {/* Section 3: Descriptions & Causes (full width stacked) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <AdvancedTextarea 
                        label="Description *" 
                        value={diseaseForm.description} 
                        onChange={val => setDiseaseForm({ ...diseaseForm, description: val })} 
                        placeholder="Write comprehensive clinical description in English..." 
                      />
                      <AdvancedTextarea 
                        label="Causes" 
                        value={diseaseForm.causes} 
                        onChange={val => setDiseaseForm({ ...diseaseForm, causes: val })} 
                        placeholder="Type each cause on a new line..." 
                      />
                    </div>

                    {/* Section 4: Symptoms & Treatments tag editors */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <ChipsInput 
                        label="Symptoms" 
                        values={diseaseForm.symptoms} 
                        onChange={newVals => setDiseaseForm({ ...diseaseForm, symptoms: newVals })} 
                        placeholder="Type symptom and press Enter" 
                      />
                      <ChipsInput 
                        label="Treatments" 
                        values={diseaseForm.treatment} 
                        onChange={newVals => setDiseaseForm({ ...diseaseForm, treatment: newVals })} 
                        placeholder="Type treatment and press Enter" 
                      />
                    </div>
                  </>
                ) : (
                  <>
                    {/* Hindi translation fields */}
                    <div style={{ backgroundColor: '#fcfcfc', border: '1px solid var(--border-color)', borderRadius: 10, padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)' }}>Hindi Translation Info</h4>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Disease Name (Hindi)</label>
                        <input type="text" className="filter-search" style={{ width: '100%', boxSizing: 'border-box' }} value={diseaseForm.name_hi} onChange={e => setDiseaseForm({ ...diseaseForm, name_hi: e.target.value })} placeholder="हिंदी में बीमारी का नाम..." />
                      </div>
                      <AdvancedTextarea 
                        label="Description in Hindi (हिंदी विवरण)" 
                        value={diseaseForm.description_hi} 
                        onChange={val => setDiseaseForm({ ...diseaseForm, description_hi: val })} 
                        placeholder="हिंदी में बीमारी का विवरण..." 
                      />
                      <AdvancedTextarea 
                        label="Causes in Hindi (हिंदी कारण)" 
                        value={diseaseForm.causes_hi} 
                        onChange={val => setDiseaseForm({ ...diseaseForm, causes_hi: val })} 
                        placeholder="हिंदी में बीमारी के कारण..." 
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <ChipsInput 
                        label="Symptoms in Hindi (हिंदी लक्षण)" 
                        values={diseaseForm.symptoms_hi} 
                        onChange={newVals => setDiseaseForm({ ...diseaseForm, symptoms_hi: newVals })} 
                        placeholder="लक्षण दर्ज करें और Enter दबाएं" 
                      />
                      <ChipsInput 
                        label="Treatment in Hindi (हिंदी उपचार)" 
                        values={diseaseForm.treatment_hi} 
                        onChange={newVals => setDiseaseForm({ ...diseaseForm, treatment_hi: newVals })} 
                        placeholder="उपचार दर्ज करें और Enter दबाएं" 
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Modal Footer (Sticky) */}
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
                  onClick={() => setIsDiseaseModalOpen(false)} 
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
                  {editingDisease ? 'Update Disease' : 'Create Disease'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GROUP MODAL */}
      {isGroupModalOpen && (
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
          onClick={() => setIsGroupModalOpen(false)}
        >
          <div 
            style={{ 
              backgroundColor: '#fff', 
              borderRadius: 16, 
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', 
              width: '100%', 
              maxWidth: 540, 
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
                  {editingGroup ? 'Edit Category Group' : 'Add Category Group'}
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Configure disease grouping classifications.
                </p>
              </div>
              <button 
                onClick={() => setIsGroupModalOpen(false)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleGroupSave} style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden' }}>
              <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
                
                {/* Banner image at the top */}
                {renderImageUploader(groupForm.image_path, 'group')}

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Group Name *</label>
                  <input type="text" required className="filter-search" style={{ width: '100%', boxSizing: 'border-box' }} value={groupForm.name} onChange={e => setGroupForm({ ...groupForm, name: e.target.value })} placeholder="e.g. Digestive Disorders" />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Group Name (Hindi)</label>
                  <input type="text" className="filter-search" style={{ width: '100%', boxSizing: 'border-box' }} value={groupForm.name_hi} onChange={e => setGroupForm({ ...groupForm, name_hi: e.target.value })} placeholder="हिंदी में श्रेणी समूह का नाम..." />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Description</label>
                  <textarea className="filter-search" style={{ width: '100%', boxSizing: 'border-box', height: 80 }} value={groupForm.description} onChange={e => setGroupForm({ ...groupForm, description: e.target.value })} placeholder="Write group description..." />
                </div>
              </div>

              {/* Modal Footer (Sticky) */}
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
                  onClick={() => setIsGroupModalOpen(false)} 
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
                  {editingGroup ? 'Update Group' : 'Create Group'}
                </button>
              </div>
            </form>
          </div>
        </div>
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
                  ['Body System', selectedDisease.body_system || '—'],
                  ['Disease Type', selectedDisease.disease_type || '—'],
                  ['Target Species', selectedDisease.species || '—'],
                  ['Pathogen Type', selectedDisease.pathogen_type || '—'],
                  ['Pathogen Name', selectedDisease.pathogen_name || '—'],
                  ['Common Disease', selectedDisease.is_common ? 'Yes' : 'No'],
                  ['Symptoms (English)', (selectedDisease.symptoms || []).join(', ') || '—'],
                  ['Symptoms (Hindi)', (selectedDisease.symptoms_hi || []).join(', ') || '—'],
                  ['Causes (English)', (selectedDisease.causes || []).join(', ') || '—'],
                  ['Causes (Hindi)', (selectedDisease.causes_hi || []).join(', ') || '—'],
                  ['Treatment (English)', (selectedDisease.treatments || []).join(', ') || '—'],
                  ['Treatment (Hindi)', (selectedDisease.treatments_hi || []).join(', ') || '—'],
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
