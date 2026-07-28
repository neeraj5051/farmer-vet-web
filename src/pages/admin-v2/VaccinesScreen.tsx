import { useEffect, useMemo, useState, useRef } from 'react';
import { 
  getVaccines, 
  createVaccine, 
  updateVaccine, 
  deleteVaccine 
} from '../../services/vaccineService';
import api from '../../services/api';
import { Search, Download, Loader2, Eye, X, ShieldCheck, Syringe, Calendar, Plus, Edit3, Trash2 } from 'lucide-react';
import '../../components/admin-v2/ListScreens.css';
import { getImageVariantUrl } from '../../utils/imageUtils';

const PAGE_SIZE = 10;

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
            height: 90, 
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

const VaccinesScreen = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVaccine, setSelectedVaccine] = useState<any>(null);
  const [page, setPage] = useState(1);

  // Modal Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVaccine, setEditingVaccine] = useState<any>(null);
  const [modalTab, setModalTab] = useState<'english' | 'hindi'>('english');
  const [vaccineForm, setVaccineForm] = useState({
    name: '',
    name_hi: '',
    disease_name: '',
    target_animals: '',
    dosage_schedule: '',
    price: 150,
    is_mandatory: false,
    image_url: '',
    description: '',
    description_hi: ''
  });

  // Uploader states
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await getVaccines();
      setData(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error('Error fetching vaccines:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = useMemo(() => {
    let result = data;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(v =>
        v.name?.toLowerCase().includes(q) ||
        v.disease_name?.toLowerCase().includes(q) ||
        v.target_animals?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [data, searchTerm]);

  const stats = useMemo(() => ({
    total: data.length,
    mandatory: data.filter(v => v.is_mandatory !== false).length,
    seasonal: data.filter(v => v.seasonal_timing).length,
  }), [data]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Image Upload Logic
  const handleImageUpload = async (file: File) => {
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
    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'vaccines');
      const response = await api.post('/upload/admin-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const url = response.data.url;
      setVaccineForm(prev => ({ ...prev, image_url: url }));
    } catch (err) {
      console.error("Image upload failed:", err);
      setUploadError("Image upload failed. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  // CRUD Trigger Operations
  const openCreateModal = () => {
    setEditingVaccine(null);
    setModalTab('english');
    setVaccineForm({
      name: '',
      name_hi: '',
      disease_name: '',
      target_animals: 'Cattle, Buffalo',
      dosage_schedule: 'Annual booster',
      price: 150,
      is_mandatory: false,
      image_url: '',
      description: '',
      description_hi: ''
    });
    setUploadError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (v: any) => {
    setEditingVaccine(v);
    setModalTab('english');
    setVaccineForm({
      name: v.name || '',
      name_hi: v.name_hi || '',
      disease_name: v.disease_name || '',
      target_animals: v.target_animals || 'Cattle, Buffalo',
      dosage_schedule: v.dosage_schedule || 'Annual booster',
      price: v.price || 150,
      is_mandatory: v.is_mandatory || false,
      image_url: v.image_url || '',
      description: v.description || '',
      description_hi: v.description_hi || ''
    });
    setUploadError(null);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this vaccine?")) {
      try {
        await deleteVaccine(id);
        await loadData();
      } catch (err) {
        console.error("Delete vaccine failed:", err);
        alert("Failed to delete vaccine.");
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingVaccine) {
        await updateVaccine(editingVaccine.id, vaccineForm);
      } else {
        await createVaccine(vaccineForm);
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      console.error("Save vaccine failed:", err);
      alert("Failed to save vaccine. Please check required fields.");
    }
  };

  const renderImageUploader = (currentPath: string) => {
    const imgUrl = getImageVariantUrl(currentPath, 'medium');

    return (
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Cover Image</label>
        {uploadError && <div style={{ color: '#ef4444', fontSize: '0.78rem', marginBottom: 6 }}>{uploadError}</div>}
        
        {imgUrl ? (
          <div style={{ position: 'relative', width: '100%', height: 180, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
            <img src={imgUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.3)', display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', padding: 12 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <label className="export-btn" style={{ padding: '6px 12px', fontSize: '0.75rem', cursor: 'pointer', backgroundColor: '#fff', color: '#333', border: '1px solid #ccc' }}>
                  Replace
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }} />
                </label>
                <button type="button" className="export-btn" style={{ padding: '6px 12px', fontSize: '0.75rem', backgroundColor: '#ef4444', color: '#fff', border: 'none' }} onClick={() => setVaccineForm(prev => ({ ...prev, image_url: '' }))}>
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
              backgroundColor: '#fafafa'
            }}
            onClick={() => document.getElementById('vaccine-file-input')?.click()}
          >
            {uploadingImage ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Loader2 className="animate-spin" size={24} style={{ color: 'var(--primary-color)', marginBottom: 8 }} />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Uploading image...</span>
              </div>
            ) : (
              <>
                <Plus size={20} style={{ color: 'var(--text-secondary)', marginBottom: 4 }} />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Click to upload vaccine cover image</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Supports JPG, PNG, WEBP up to 5MB</span>
              </>
            )}
            <input type="file" id="vaccine-file-input" accept="image/*" style={{ display: 'none' }} onChange={e => {
              const file = e.target.files?.[0];
              if (file) handleImageUpload(file);
            }} />
          </div>
        )}
      </div>
    );
  };

  if (loading && data.length === 0) return (
    <div className="loading-spinner">
      <Loader2 size={36} />
      <p>Loading vaccine catalog...</p>
    </div>
  );

  return (
    <div>
      <div className="list-screen-header">
        <div>
          <h1 className="list-screen-title">Manage Vaccines</h1>
          <p className="list-screen-subtitle">Manage mandatory livestock immunization schedules and pricing</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="export-btn"><Download size={16} /> Export CSV</button>
          <button className="export-btn" onClick={openCreateModal}>
            <Plus size={16} /> Add Vaccine
          </button>
        </div>
      </div>

      <div className="list-filter-bar">
        <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input className="filter-search" style={{ paddingLeft: 36 }} placeholder="Search vaccine name or disease..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setPage(1); }} />
        </div>
        {searchTerm && (
          <button 
            type="button" 
            onClick={() => {
              setSearchTerm('');
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
              padding: '6px 12px',
              marginLeft: 'auto'
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="list-kpi-row">
        {[
          { label: 'Total Vaccines', value: stats.total, icon: <Syringe size={16} />, bg: '#dbeafe', color: '#3b82f6' },
          { label: 'Mandatory', value: stats.mandatory, icon: <ShieldCheck size={16} />, bg: '#dcfce7', color: '#10b981' },
          { label: 'Seasonal', value: stats.seasonal, icon: <Calendar size={16} />, bg: '#fef3c7', color: '#f59e0b' },
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
                <th>Vaccine</th>
                <th>Disease Prevented</th>
                <th>Target Animals</th>
                <th>Dosage / Schedule</th>
                <th>Base Price</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(v => {
                const imgUrl = getImageVariantUrl(v.image_url, 'thumbnail');
                return (
                  <tr key={v.id}>
                    <td>
                      <div className="list-cell-name">
                        {imgUrl ? (
                          <img src={imgUrl} alt={v.name} style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }} />
                        ) : (
                          <div className="list-cell-avatar" style={{ backgroundColor: '#dbeafe', color: '#1e40af' }}>
                            {(v.name || 'V')[0]}
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 600 }}>{v.name}</div>
                        </div>
                      </div>
                    </td>
                    <td>{v.disease_name || '—'}</td>
                    <td>{v.target_animals || 'Cattle, Buffalo'}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{v.dosage_schedule || v.timing || 'Annual booster'}</td>
                    <td style={{ fontWeight: 600 }}>{v.price ? `₹${v.price}` : '₹150'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <button onClick={() => setSelectedVaccine(v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }} title="View details">
                          <Eye size={18} />
                        </button>
                        <button onClick={() => openEditModal(v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--humal-green)' }} title="Edit vaccine">
                          <Edit3 size={18} />
                        </button>
                        <button onClick={() => handleDeleteClick(v.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }} title="Delete vaccine">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paginated.length === 0 && (
                <tr><td colSpan={6} className="list-empty">No vaccines found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      {filtered.length > PAGE_SIZE && (
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
            Showing <strong style={{ color: 'var(--text-primary)' }}>{Math.min(filtered.length, (page - 1) * PAGE_SIZE + 1)}</strong> to{' '}
            <strong style={{ color: 'var(--text-primary)' }}>{Math.min(filtered.length, page * PAGE_SIZE)}</strong> of{' '}
            <strong style={{ color: 'var(--text-primary)' }}>{filtered.length}</strong> vaccines
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
            {[...Array(Math.ceil(filtered.length / PAGE_SIZE))].map((_, idx) => {
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
              onClick={() => setPage(p => Math.min(Math.ceil(filtered.length / PAGE_SIZE), p + 1))} 
              disabled={page === Math.ceil(filtered.length / PAGE_SIZE)}
              className="export-btn"
              style={{ 
                backgroundColor: page === Math.ceil(filtered.length / PAGE_SIZE) ? '#f5f5f5' : '#fff', 
                color: page === Math.ceil(filtered.length / PAGE_SIZE) ? '#a3a3a3' : 'var(--text-primary)', 
                border: '1px solid var(--border-color)',
                cursor: page === Math.ceil(filtered.length / PAGE_SIZE) ? 'not-allowed' : 'pointer',
                padding: '6px 12px',
                fontSize: '0.8rem'
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* CREATE/EDIT POPUP MODAL */}
      {isModalOpen && (
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
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            style={{ 
              backgroundColor: '#fff', 
              borderRadius: 16, 
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', 
              width: '100%', 
              maxWidth: 700, 
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
                  {editingVaccine ? 'Edit Vaccine Details' : 'Add New Vaccine'}
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Configure vaccine descriptions, schedules, targets, and base price.
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden' }}>
              <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
                
                {/* Banner image preview */}
                {renderImageUploader(vaccineForm.image_url)}

                {/* English/Hindi Tabs */}
                <div className="list-tabs" style={{ marginBottom: 4 }}>
                  <button
                    type="button"
                    className={`list-tab ${modalTab === 'english' ? 'active' : ''}`}
                    onClick={() => setModalTab('english')}
                  >
                    English details
                  </button>
                  <button
                    type="button"
                    className={`list-tab ${modalTab === 'hindi' ? 'active' : ''}`}
                    onClick={() => setModalTab('hindi')}
                  >
                    Hindi Translation (हिंदी)
                  </button>
                </div>

                {modalTab === 'english' ? (
                  <>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Vaccine Name *</label>
                      <input type="text" required className="filter-search" style={{ width: '100%', boxSizing: 'border-box' }} value={vaccineForm.name} onChange={e => setVaccineForm({ ...vaccineForm, name: e.target.value })} placeholder="e.g. Bruvax" />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Disease Prevented *</label>
                        <input type="text" required className="filter-search" style={{ width: '100%', boxSizing: 'border-box' }} value={vaccineForm.disease_name} onChange={e => setVaccineForm({ ...vaccineForm, disease_name: e.target.value })} placeholder="e.g. Brucellosis" />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Target Animals</label>
                        <input type="text" className="filter-search" style={{ width: '100%', boxSizing: 'border-box' }} value={vaccineForm.target_animals} onChange={e => setVaccineForm({ ...vaccineForm, target_animals: e.target.value })} placeholder="e.g. Cattle, Buffalo" />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 14 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Dosage Schedule</label>
                        <input type="text" className="filter-search" style={{ width: '100%', boxSizing: 'border-box' }} value={vaccineForm.dosage_schedule} onChange={e => setVaccineForm({ ...vaccineForm, dosage_schedule: e.target.value })} placeholder="e.g. Annual booster, 2 doses" />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Base Price (₹) *</label>
                        <input type="number" required className="filter-search" style={{ width: '100%', boxSizing: 'border-box' }} value={vaccineForm.price} onChange={e => setVaccineForm({ ...vaccineForm, price: Number(e.target.value) })} placeholder="150" />
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input type="checkbox" id="is_mandatory" checked={vaccineForm.is_mandatory} onChange={e => setVaccineForm({ ...vaccineForm, is_mandatory: e.target.checked })} style={{ cursor: 'pointer' }} />
                      <label htmlFor="is_mandatory" style={{ fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}>Mandatory Immunization</label>
                    </div>

                    <AdvancedTextarea 
                      label="Description" 
                      value={vaccineForm.description} 
                      onChange={val => setVaccineForm({ ...vaccineForm, description: val })} 
                      placeholder="Write comprehensive description in English..." 
                    />
                  </>
                ) : (
                  <>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Vaccine Name (Hindi)</label>
                      <input type="text" className="filter-search" style={{ width: '100%', boxSizing: 'border-box' }} value={vaccineForm.name_hi} onChange={e => setVaccineForm({ ...vaccineForm, name_hi: e.target.value })} placeholder="हिंदी में वैक्सीन का नाम..." />
                    </div>

                    <AdvancedTextarea 
                      label="Description in Hindi (हिंदी विवरण)" 
                      value={vaccineForm.description_hi} 
                      onChange={val => setVaccineForm({ ...vaccineForm, description_hi: val })} 
                      placeholder="हिंदी में विवरण दर्ज करें..." 
                    />
                  </>
                )}
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
                  onClick={() => setIsModalOpen(false)} 
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
                  {editingVaccine ? 'Update Vaccine' : 'Create Vaccine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL VIEW DRAWER */}
      {selectedVaccine && (
        <>
          <div className="profile-drawer-overlay" onClick={() => setSelectedVaccine(null)} />
          <div className="profile-drawer">
            <div className="drawer-header">
              <div className="drawer-name">{selectedVaccine.name}</div>
              <button className="drawer-close" onClick={() => setSelectedVaccine(null)}><X size={20} /></button>
            </div>
            <div className="drawer-body">
              {selectedVaccine.image_url && (
                <div style={{ width: '100%', height: 160, borderRadius: 10, overflow: 'hidden', marginBottom: 16 }}>
                  <img src={getImageVariantUrl(selectedVaccine.image_url, 'medium')} alt={selectedVaccine.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <div className="drawer-section">
                <div className="drawer-section-title">Vaccine Details</div>
                {[
                  ['Vaccine Name', selectedVaccine.name || '—'],
                  ['Disease Prevented', selectedVaccine.disease_name || '—'],
                  ['Target Species', selectedVaccine.target_animals || 'Cattle, Buffalo'],
                  ['Dosage Schedule', selectedVaccine.dosage_schedule || 'Annual'],
                  ['Base Price', selectedVaccine.price ? `₹${selectedVaccine.price}` : '₹150'],
                  ['Mandatory', selectedVaccine.is_mandatory ? 'Yes' : 'No'],
                ].map(([label, value]) => (
                  <div key={label as string} className="drawer-detail-row">
                    <span className="drawer-detail-label">{label}</span>
                    <span className="drawer-detail-value">{String(value)}</span>
                  </div>
                ))}
              </div>
              
              {(selectedVaccine.description || selectedVaccine.description_hi) && (
                <div className="drawer-section" style={{ marginTop: 14 }}>
                  <div className="drawer-section-title">Description</div>
                  {selectedVaccine.description && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 10 }}>
                      <strong>English:</strong><br />{selectedVaccine.description}
                    </div>
                  )}
                  {selectedVaccine.description_hi && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      <strong>Hindi:</strong><br />{selectedVaccine.description_hi}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default VaccinesScreen;
