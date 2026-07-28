import { useEffect, useState, useRef, useMemo } from 'react';
import { serviceCardService } from '../../services/serviceCardService';
import {
  getAdminServices,
  createCategory,
  updateCategory,
  deleteCategory,
  createVariant,
  updateVariant,
  deleteVariant,
  type ServiceCategory,
  type ServiceVariant
} from '../../services/servicesService';
import api from '../../services/api';
import { 
  LayoutGrid, 
  Eye, 
  Loader2, 
  Settings2,
  X,
  Plus,
  ChevronDown,
  ChevronRight,
  Edit3,
  Trash2,
  Layers,
  Sparkles
} from 'lucide-react';
import '../../components/admin-v2/ListScreens.css';
import { getImageVariantUrl } from '../../utils/imageUtils';

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

const DEFAULT_CARDS = [
  { id: 'sc-1', title: 'Online Consultation', title_hi: 'ऑनलाइन परामर्श', subtitle: 'Video call with licensed vet', display_order: 1, is_active: true },
  { id: 'sc-2', title: 'In-Person Visit', title_hi: 'घर पर पशु चिकित्सक', subtitle: 'On-site farm vet visit', display_order: 2, is_active: true },
  { id: 'sc-3', title: 'Artificial Insemination', title_hi: 'कृत्रिम गर्भाधान', subtitle: 'Breed improvement service', display_order: 3, is_active: true },
  { id: 'sc-4', title: 'Vaccinations', title_hi: 'पशु टीकाकरण', subtitle: 'Immunization & preventive care', display_order: 4, is_active: true },
];

const ServicesScreen = () => {
  const [activeTab, setActiveTab] = useState<'cards' | 'global'>('cards');
  const [cardsData, setCardsData] = useState<any[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Action Card Modal States
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [cardForm, setCardForm] = useState({
    title: '',
    title_hi: '',
    subtitle: '',
    subtitle_hi: '',
    image_url: '',
    order_index: 1,
    is_active: true
  });

  // Category Modal States
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<ServiceCategory | null>(null);
  const [catForm, setCatForm] = useState({
    name: '',
    title: '',
    title_hi: '',
    description: '',
    description_hi: '',
    icon_emoji: '✨',
    is_active: true
  });

  // Variant Modal States
  const [isVarModalOpen, setIsVarModalOpen] = useState(false);
  const [editingVar, setEditingVar] = useState<ServiceVariant | null>(null);
  const [parentCategoryId, setParentCategoryId] = useState('');
  const [varForm, setVarForm] = useState({
    name: '',
    name_hi: '',
    description: '',
    description_hi: '',
    base_fee_suggestion: '150',
    is_active: true
  });

  const [modalTab, setModalTab] = useState<'english' | 'hindi'>('english');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch action cards
      try {
        const cards = await serviceCardService.getAllServiceCardsAdmin();
        setCardsData(Array.isArray(cards) && cards.length > 0 ? cards : DEFAULT_CARDS);
      } catch (e) {
        console.warn("Failed fetching cards:", e);
        setCardsData(DEFAULT_CARDS);
      }

      // Fetch global service categories
      try {
        const services = await getAdminServices();
        setCategories(Array.isArray(services) ? services : []);
      } catch (e) {
        console.warn("Failed fetching categories:", e);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

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
      formData.append('folder', 'service_cards');
      const response = await api.post('/upload/admin-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const url = response.data.url;
      setCardForm(prev => ({ ...prev, image_url: url }));
    } catch (err) {
      console.error("Image upload failed:", err);
      setUploadError("Image upload failed. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  // ── Category CRUD ──────────────────────────────────────────────────────────
  const openAddCategory = () => {
    setEditingCat(null);
    setModalTab('english');
    setCatForm({
      name: '',
      title: '',
      title_hi: '',
      description: '',
      description_hi: '',
      icon_emoji: '✨',
      is_active: true
    });
    setIsCatModalOpen(true);
  };

  const openEditCategory = (cat: ServiceCategory) => {
    setEditingCat(cat);
    setModalTab('english');
    setCatForm({
      name: cat.name,
      title: cat.title,
      title_hi: cat.title_hi || '',
      description: cat.description || '',
      description_hi: cat.description_hi || '',
      icon_emoji: cat.icon_emoji || '✨',
      is_active: cat.is_active
    });
    setIsCatModalOpen(true);
  };

  const handleDeleteCategoryClick = async (cat: ServiceCategory) => {
    if (window.confirm(`Are you sure you want to delete category "${cat.title}" and ALL its variants?`)) {
      try {
        await deleteCategory(cat.id);
        await loadData();
      } catch (err) {
        console.error("Delete category failed:", err);
        alert("Failed to delete category.");
      }
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catForm.title.trim()) return;
    try {
      if (editingCat) {
        await updateCategory(editingCat.id, catForm);
      } else {
        const keyName = catForm.name.toUpperCase().replace(/\s+/g, '_');
        await createCategory({ ...catForm, name: keyName });
      }
      setIsCatModalOpen(false);
      await loadData();
    } catch (err) {
      console.error("Save category failed:", err);
      alert("Failed to save category. Make sure Key Name is unique.");
    }
  };

  // ── Variant CRUD ───────────────────────────────────────────────────────────
  const openAddVariant = (categoryId: string) => {
    setEditingVar(null);
    setParentCategoryId(categoryId);
    setModalTab('english');
    setVarForm({
      name: '',
      name_hi: '',
      description: '',
      description_hi: '',
      base_fee_suggestion: '150',
      is_active: true
    });
    setIsVarModalOpen(true);
  };

  const openEditVariant = (v: ServiceVariant) => {
    setEditingVar(v);
    setParentCategoryId(v.category_id);
    setModalTab('english');
    setVarForm({
      name: v.name,
      name_hi: v.name_hi || '',
      description: v.description || '',
      description_hi: v.description_hi || '',
      base_fee_suggestion: v.base_fee_suggestion != null ? String(v.base_fee_suggestion) : '150',
      is_active: v.is_active
    });
    setIsVarModalOpen(true);
  };

  const handleDeleteVariantClick = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this variant?")) {
      try {
        await deleteVariant(id);
        await loadData();
      } catch (err) {
        console.error("Delete variant failed:", err);
        alert("Failed to delete variant.");
      }
    }
  };

  const handleVariantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!varForm.name.trim()) return;
    try {
      const payload = {
        category_id: parentCategoryId,
        name: varForm.name,
        name_hi: varForm.name_hi || undefined,
        description: varForm.description || undefined,
        description_hi: varForm.description_hi || undefined,
        base_fee_suggestion: varForm.base_fee_suggestion ? parseFloat(varForm.base_fee_suggestion) : 150,
        is_active: varForm.is_active
      };
      if (editingVar) {
        await updateVariant(editingVar.id, payload);
      } else {
        await createVariant(payload);
      }
      setIsVarModalOpen(false);
      await loadData();
    } catch (err) {
      console.error("Save variant failed:", err);
      alert("Failed to save variant.");
    }
  };

  const openEditCardModal = (card: any) => {
    setSelectedCard(card);
    setModalTab('english');
    setCardForm({
      title: card.title || '',
      title_hi: card.title_hi || '',
      subtitle: card.subtitle || '',
      subtitle_hi: card.subtitle_hi || '',
      image_url: card.image_url || '',
      order_index: card.order_index || card.display_order || 1,
      is_active: card.is_active !== false
    });
    setUploadError(null);
    setIsCardModalOpen(true);
  };

  const handleCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCard) return;
    try {
      await serviceCardService.updateServiceCard(selectedCard.id, cardForm);
      setIsCardModalOpen(false);
      await loadData();
    } catch (err) {
      console.error("Failed to update service card:", err);
      alert("Failed to save changes. Please try again.");
    }
  };

  const renderImageUploader = (currentPath: string) => {
    const imgUrl = getImageVariantUrl(currentPath, 'medium');

    return (
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Cover Image</label>
        {uploadError && <div style={{ color: '#ef4444', fontSize: '0.78rem', marginBottom: 6 }}>{uploadError}</div>}
        
        {imgUrl ? (
          <div 
            style={{ position: 'relative', width: '100%', height: 160, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border-color)', cursor: 'pointer' }}
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
                    if (file) handleImageUpload(file);
                  }} />
                </label>
                <button type="button" className="export-btn" style={{ padding: '6px 12px', fontSize: '0.75rem', backgroundColor: '#ef4444', color: '#fff', border: 'none' }} onClick={() => setCardForm(prev => ({ ...prev, image_url: '' }))}>
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
            onClick={() => document.getElementById('card-file-input')?.click()}
          >
            {uploadingImage ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Loader2 className="animate-spin" size={24} style={{ color: 'var(--primary-color)', marginBottom: 8 }} />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Uploading image...</span>
              </div>
            ) : (
              <>
                <Plus size={20} style={{ color: 'var(--text-secondary)', marginBottom: 4 }} />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Click to upload card cover image</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Supports JPG, PNG, WEBP up to 5MB</span>
              </>
            )}
            <input type="file" id="card-file-input" accept="image/*" style={{ display: 'none' }} onChange={e => {
              const file = e.target.files?.[0];
              if (file) handleImageUpload(file);
            }} />
          </div>
        )}
      </div>
    );
  };

  const stats = useMemo(() => {
    let totalVar = 0;
    categories.forEach(c => {
      if (Array.isArray(c.variants)) {
        totalVar += c.variants.length;
      }
    });
    return {
      categories: categories.length,
      active: categories.filter(c => c.is_active !== false).length,
      variants: totalVar
    };
  }, [categories]);

  if (loading && cardsData.length === 0 && categories.length === 0) return (
    <div className="loading-spinner">
      <Loader2 size={36} />
      <p>Loading services & action cards...</p>
    </div>
  );

  return (
    <div>
      <div className="list-screen-header">
        <div>
          <h1 className="list-screen-title">Service Management</h1>
          <p className="list-screen-subtitle">Manage mobile app action cards, service banners, and global platform offerings</p>
        </div>
        {activeTab === 'global' && (
          <button className="export-btn" onClick={openAddCategory}>
            <Plus size={16} /> New Category
          </button>
        )}
      </div>

      {/* Top Tabs */}
      <div className="list-tabs" style={{ marginBottom: 24 }}>
        <button
          className={`list-tab ${activeTab === 'cards' ? 'active' : ''}`}
          onClick={() => setActiveTab('cards')}
        >
          <LayoutGrid size={16} style={{ display: 'inline', marginRight: 6 }} />
          Mobile App Action Cards ({cardsData.length})
        </button>
        <button
          className={`list-tab ${activeTab === 'global' ? 'active' : ''}`}
          onClick={() => setActiveTab('global')}
        >
          <Settings2 size={16} style={{ display: 'inline', marginRight: 6 }} />
          Global Service Offerings ({categories.length})
        </button>
      </div>

      {/* KPI Cards */}
      <div className="list-kpi-row">
        {activeTab === 'cards' ? (
          <>
            <div className="list-kpi-card">
              <div className="list-kpi-icon" style={{ backgroundColor: '#dbeafe', color: '#3b82f6' }}><LayoutGrid size={16} /></div>
              <div className="list-kpi-value">{cardsData.length}</div>
              <div className="list-kpi-label">Total Action Cards</div>
            </div>
            <div className="list-kpi-card">
              <div className="list-kpi-icon" style={{ backgroundColor: '#dcfce7', color: '#10b981' }}><Sparkles size={16} /></div>
              <div className="list-kpi-value">{cardsData.filter(c => c.is_active !== false).length}</div>
              <div className="list-kpi-label">Active Cards</div>
            </div>
          </>
        ) : (
          <>
            <div className="list-kpi-card">
              <div className="list-kpi-icon" style={{ backgroundColor: '#dbeafe', color: '#3b82f6' }}><Layers size={16} /></div>
              <div className="list-kpi-value">{stats.categories}</div>
              <div className="list-kpi-label">Categories</div>
            </div>
            <div className="list-kpi-card">
              <div className="list-kpi-icon" style={{ backgroundColor: '#dcfce7', color: '#10b981' }}><Sparkles size={16} /></div>
              <div className="list-kpi-value">{stats.active}</div>
              <div className="list-kpi-label">Active Categories</div>
            </div>
            <div className="list-kpi-card">
              <div className="list-kpi-icon" style={{ backgroundColor: '#fee2e2', color: '#ef4444' }}><Settings2 size={16} /></div>
              <div className="list-kpi-value">{stats.variants}</div>
              <div className="list-kpi-label">Total Service Variants</div>
            </div>
          </>
        )}
      </div>

      {/* TAB 1: MOBILE APP ACTION CARDS */}
      {activeTab === 'cards' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {cardsData.map(card => {
            const imgUrl = getImageVariantUrl(card.image_url, 'medium');
            return (
              <div key={card.id} style={{ background: 'var(--card-white)', border: '1px solid var(--border-color)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ height: 120, backgroundColor: '#0a4f32', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  {imgUrl ? (
                    <img src={imgUrl} alt={card.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <LayoutGrid size={40} opacity={0.6} />
                  )}
                  <span style={{ position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '0.75rem', padding: '2px 8px', borderRadius: 10 }}>
                    Order #{card.order_index || card.display_order}
                  </span>
                </div>
                <div style={{ padding: 16, display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{card.title}</h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{card.title_hi || '—'}</p>
                    <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', color: 'var(--text-primary)' }}>{card.subtitle || '—'}</p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border-color)' }}>
                    <span className="list-status-badge" style={{
                      backgroundColor: card.is_active !== false ? '#dcfce7' : '#fef3c7',
                      color: card.is_active !== false ? '#166534' : '#92400e'
                    }}>
                      {card.is_active !== false ? 'Active' : 'Disabled'}
                    </span>
                    <button onClick={() => openEditCardModal(card)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Eye size={16} /> Edit Card
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: GLOBAL SERVICE OFFERINGS (ACCRUING CRUD) */}
      {activeTab === 'global' && (
        <div className="list-table-card">
          <div style={{ overflowX: 'auto' }}>
            <table className="list-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}></th>
                  <th>Category Group</th>
                  <th>Hindi Title</th>
                  <th>Key ID</th>
                  <th>Status</th>
                  <th>Variants Count</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(cat => {
                  const isExpanded = expandedIds.has(cat.id);
                  const variants = cat.variants || [];
                  return (
                    <>
                      <tr key={cat.id}>
                        <td>
                          <button 
                            type="button" 
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                            onClick={() => toggleExpand(cat.id)}
                          >
                            {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                          </button>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 6, backgroundColor: '#e6f0eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                              {cat.icon_emoji || '✨'}
                            </div>
                            <div style={{ fontWeight: 600 }}>{cat.title}</div>
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>{cat.title_hi || '—'}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--text-muted)' }}>{cat.name}</td>
                        <td>
                          <span className="list-status-badge" style={{
                            backgroundColor: cat.is_active !== false ? '#dcfce7' : '#fef3c7',
                            color: cat.is_active !== false ? '#166534' : '#92400e'
                          }}>
                            {cat.is_active !== false ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td>
                          <span className="list-status-badge" style={{ backgroundColor: '#e2e8f0', color: '#334155' }}>
                            {variants.length} Variants
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <button onClick={() => openEditCategory(cat)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--humal-green)' }} title="Edit category">
                              <Edit3 size={18} />
                            </button>
                            <button onClick={() => handleDeleteCategoryClick(cat)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }} title="Delete category">
                              <Trash2 size={18} />
                            </button>
                            <button onClick={() => openAddVariant(cat.id)} className="export-btn" style={{ padding: '2px 8px', fontSize: '0.72rem', height: 'auto' }}>
                              + Add Variant
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Variants subtable */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={7} style={{ backgroundColor: '#fafafa', padding: '12px 24px' }}>
                            <div style={{ borderLeft: '3px solid var(--humal-green)', paddingLeft: 16 }}>
                              <h4 style={{ margin: '0 0 10px 0', fontSize: '0.88rem', fontWeight: 600 }}>
                                Service Variants for {cat.title}
                              </h4>
                              {variants.length === 0 ? (
                                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', padding: '6px 0' }}>
                                  No variants defined yet. Click "+ Add Variant" to create one.
                                </div>
                              ) : (
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                                  <thead>
                                    <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: 'var(--text-secondary)' }}>
                                      <th style={{ padding: '6px 8px' }}>Variant Name</th>
                                      <th style={{ padding: '6px 8px' }}>Hindi Name</th>
                                      <th style={{ padding: '6px 8px' }}>Base Fee</th>
                                      <th style={{ padding: '6px 8px' }}>Status</th>
                                      <th style={{ padding: '6px 8px', textAlign: 'right' }}>Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {variants.map(v => (
                                      <tr key={v.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '8px', fontWeight: 500 }}>{v.name}</td>
                                        <td style={{ padding: '8px', color: 'var(--text-secondary)' }}>{v.name_hi || '—'}</td>
                                        <td style={{ padding: '8px', fontWeight: 600 }}>₹{v.base_fee_suggestion || 0}</td>
                                        <td style={{ padding: '8px' }}>
                                          <span className="list-status-badge" style={{
                                            backgroundColor: v.is_active !== false ? '#dcfce7' : '#fef3c7',
                                            color: v.is_active !== false ? '#166534' : '#92400e',
                                            fontSize: '0.72rem',
                                            padding: '1px 6px'
                                          }}>
                                            {v.is_active !== false ? 'Active' : 'Disabled'}
                                          </span>
                                        </td>
                                        <td style={{ padding: '8px', textAlign: 'right' }}>
                                          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                            <button onClick={() => openEditVariant(v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--humal-green)' }}>
                                              <Edit3 size={14} />
                                            </button>
                                            <button onClick={() => handleDeleteVariantClick(v.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                                              <Trash2 size={14} />
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
                {categories.length === 0 && (
                  <tr><td colSpan={7} className="list-empty">No categories found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EDIT ACTION CARD MODAL */}
      {isCardModalOpen && (
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
          onClick={() => setIsCardModalOpen(false)}
        >
          <div 
            style={{ 
              backgroundColor: '#fff', 
              borderRadius: 16, 
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', 
              width: '100%', 
              maxWidth: 560, 
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
                  Edit Service Card
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Configure farmer app home screen primary banners and translation.
                </p>
              </div>
              <button 
                onClick={() => setIsCardModalOpen(false)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleCardSubmit} style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden' }}>
              <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
                
                {/* Image uploader banner */}
                {renderImageUploader(cardForm.image_url)}

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
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Title *</label>
                      <input type="text" required className="filter-search" style={{ width: '100%', boxSizing: 'border-box' }} value={cardForm.title} onChange={e => setCardForm({ ...cardForm, title: e.target.value })} placeholder="e.g. Online Consultation" />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Subtitle *</label>
                      <input type="text" required className="filter-search" style={{ width: '100%', boxSizing: 'border-box' }} value={cardForm.subtitle} onChange={e => setCardForm({ ...cardForm, subtitle: e.target.value })} placeholder="e.g. Video call with licensed vet" />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Display Order *</label>
                        <input type="number" required className="filter-search" style={{ width: '100%', boxSizing: 'border-box' }} value={cardForm.order_index} onChange={e => setCardForm({ ...cardForm, order_index: Number(e.target.value) })} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', marginTop: 22 }}>
                        <input type="checkbox" id="is_active" checked={cardForm.is_active} onChange={e => setCardForm({ ...cardForm, is_active: e.target.checked })} style={{ cursor: 'pointer' }} />
                        <label htmlFor="is_active" style={{ fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', marginLeft: 8, userSelect: 'none' }}>Active Card</label>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Title (Hindi)</label>
                      <input type="text" className="filter-search" style={{ width: '100%', boxSizing: 'border-box' }} value={cardForm.title_hi} onChange={e => setCardForm({ ...cardForm, title_hi: e.target.value })} placeholder="हिंदी में शीर्षक..." />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Subtitle (Hindi)</label>
                      <input type="text" className="filter-search" style={{ width: '100%', boxSizing: 'border-box' }} value={cardForm.subtitle_hi || ''} onChange={e => setCardForm({ ...cardForm, subtitle_hi: e.target.value })} placeholder="हिंदी में उपशीर्षक..." />
                    </div>
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
                  onClick={() => setIsCardModalOpen(false)} 
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

      {/* CREATE/EDIT CATEGORY MODAL */}
      {isCatModalOpen && (
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
          onClick={() => setIsCatModalOpen(false)}
        >
          <div 
            style={{ 
              backgroundColor: '#fff', 
              borderRadius: 16, 
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', 
              width: '100%', 
              maxWidth: 580, 
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
                  {editingCat ? 'Edit Service Category' : 'Create Service Category'}
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Configure service categorizations and listings.
                </p>
              </div>
              <button 
                onClick={() => setIsCatModalOpen(false)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleCategorySubmit} style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden' }}>
              <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
                
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
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 14 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Category Title *</label>
                        <input type="text" required className="filter-search" style={{ width: '100%', boxSizing: 'border-box' }} value={catForm.title} onChange={e => setCatForm({ ...catForm, title: e.target.value })} placeholder="e.g. Artificial Insemination" />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Icon Emoji</label>
                        <input type="text" className="filter-search" style={{ width: '100%', boxSizing: 'border-box', textAlign: 'center' }} value={catForm.icon_emoji} onChange={e => setCatForm({ ...catForm, icon_emoji: e.target.value })} placeholder="e.g. 🧬" />
                      </div>
                    </div>

                    {!editingCat && (
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Key Name (ID) *</label>
                        <input type="text" required className="filter-search" style={{ width: '100%', boxSizing: 'border-box' }} value={catForm.name} onChange={e => setCatForm({ ...catForm, name: e.target.value })} placeholder="e.g. ARTIFICIAL_INSEMINATION" />
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input type="checkbox" id="cat_is_active" checked={catForm.is_active} onChange={e => setCatForm({ ...catForm, is_active: e.target.checked })} style={{ cursor: 'pointer' }} />
                      <label htmlFor="cat_is_active" style={{ fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}>Active Category</label>
                    </div>

                    <AdvancedTextarea 
                      label="Description" 
                      value={catForm.description} 
                      onChange={val => setCatForm({ ...catForm, description: val })} 
                      placeholder="Write category description..." 
                    />
                  </>
                ) : (
                  <>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Category Title (Hindi)</label>
                      <input type="text" className="filter-search" style={{ width: '100%', boxSizing: 'border-box' }} value={catForm.title_hi} onChange={e => setCatForm({ ...catForm, title_hi: e.target.value })} placeholder="हिंदी में श्रेणी का नाम..." />
                    </div>

                    <AdvancedTextarea 
                      label="Description in Hindi (हिंदी विवरण)" 
                      value={catForm.description_hi} 
                      onChange={val => setCatForm({ ...catForm, description_hi: val })} 
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
                  onClick={() => setIsCatModalOpen(false)} 
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
                  {editingCat ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE/EDIT VARIANT MODAL */}
      {isVarModalOpen && (
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
          onClick={() => setIsVarModalOpen(false)}
        >
          <div 
            style={{ 
              backgroundColor: '#fff', 
              borderRadius: 16, 
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', 
              width: '100%', 
              maxWidth: 580, 
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
                  {editingVar ? 'Edit Service Variant' : 'Create Service Variant'}
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Configure service variant names, pricing suggestions, and localized translation.
                </p>
              </div>
              <button 
                onClick={() => setIsVarModalOpen(false)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleVariantSubmit} style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden' }}>
              <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
                
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
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Variant Name *</label>
                      <input type="text" required className="filter-search" style={{ width: '100%', boxSizing: 'border-box' }} value={varForm.name} onChange={e => setVarForm({ ...varForm, name: e.target.value })} placeholder="e.g. In-Person Field Visit" />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 14 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Base Fee Suggestion (₹) *</label>
                        <input type="number" required className="filter-search" style={{ width: '100%', boxSizing: 'border-box' }} value={varForm.base_fee_suggestion} onChange={e => setVarForm({ ...varForm, base_fee_suggestion: e.target.value })} placeholder="150" />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', marginTop: 22 }}>
                        <input type="checkbox" id="var_is_active" checked={varForm.is_active} onChange={e => setVarForm({ ...varForm, is_active: e.target.checked })} style={{ cursor: 'pointer' }} />
                        <label htmlFor="var_is_active" style={{ fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', marginLeft: 8, userSelect: 'none' }}>Active Variant</label>
                      </div>
                    </div>

                    <AdvancedTextarea 
                      label="Description" 
                      value={varForm.description} 
                      onChange={val => setVarForm({ ...varForm, description: val })} 
                      placeholder="Write variant description..." 
                    />
                  </>
                ) : (
                  <>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Variant Name (Hindi)</label>
                      <input type="text" className="filter-search" style={{ width: '100%', boxSizing: 'border-box' }} value={varForm.name_hi} onChange={e => setVarForm({ ...varForm, name_hi: e.target.value })} placeholder="हिंदी में उप-विकल्प का नाम..." />
                    </div>

                    <AdvancedTextarea 
                      label="Description in Hindi (हिंदी विवरण)" 
                      value={varForm.description_hi} 
                      onChange={val => setVarForm({ ...varForm, description_hi: val })} 
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
                  onClick={() => setIsVarModalOpen(false)} 
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
                  {editingVar ? 'Save Changes' : 'Create Variant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Lightbox Zoom Overlay */}
      {lightboxUrl && (
        <div 
          style={{ 
            position: 'fixed', 
            inset: 0, 
            backgroundColor: 'rgba(0, 0, 0, 0.85)', 
            backdropFilter: 'blur(4px)', 
            zIndex: 99999, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            cursor: 'zoom-out'
          }}
          onClick={() => { setLightboxUrl(null); setZoomLevel(1); }}
        >
          <div style={{ position: 'absolute', top: 20, right: 20, display: 'flex', gap: 10 }} onClick={e => e.stopPropagation()}>
            <a href={lightboxUrl} target="_blank" rel="noreferrer" className="export-btn" style={{ backgroundColor: '#fff', color: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>Open Original</a>
            <button className="export-btn" style={{ backgroundColor: '#ef4444', color: '#fff' }} onClick={() => { setLightboxUrl(null); setZoomLevel(1); }}><X size={16} /></button>
          </div>
          <img 
            src={lightboxUrl} 
            alt="Preview Zoom" 
            style={{ 
              maxHeight: '90vh', 
              maxWidth: '90vw', 
              objectFit: 'contain', 
              transform: `scale(${zoomLevel})`,
              transition: 'transform 0.1s ease',
              cursor: 'zoom-in'
            }} 
            onClick={e => {
              e.stopPropagation();
              setZoomLevel(z => z === 1 ? 1.5 : 1);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ServicesScreen;
