import { useEffect, useMemo, useState, useRef } from 'react';
import { 
  getArticles, 
  createArticle, 
  updateArticle, 
  deleteArticle 
} from '../../services/articleService';
import api from '../../services/api';
import { Search, Download, Loader2, Eye, X, BookOpen, CheckCircle, FileText, Plus, Edit3, Trash2 } from 'lucide-react';
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
            height: 120, 
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

const ArticlesScreen = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [page, setPage] = useState(1);

  // Modal Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<any>(null);
  const [modalTab, setModalTab] = useState<'english' | 'hindi'>('english');
  const [articleForm, setArticleForm] = useState({
    title: '',
    title_hi: '',
    content: '',
    content_hi: '',
    category: 'General',
    image_url: '',
    is_published: true
  });

  // Image uploader states
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await getArticles();
      setData(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error('Error fetching articles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    data.forEach(a => { if (a.category) set.add(a.category); });
    return Array.from(set).sort();
  }, [data]);

  const filtered = useMemo(() => {
    let result = data;
    if (categoryFilter !== 'all') {
      result = result.filter(a => a.category === categoryFilter);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(a =>
        a.title?.toLowerCase().includes(q) ||
        a.title_hi?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [data, categoryFilter, searchTerm]);

  const stats = useMemo(() => ({
    total: data.length,
    published: data.filter(a => a.is_published !== false).length,
    drafts: data.filter(a => a.is_published === false).length,
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
      formData.append('folder', 'articles');
      const response = await api.post('/upload/admin-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const url = response.data.url;
      setArticleForm(prev => ({ ...prev, image_url: url }));
    } catch (err) {
      console.error("Image upload failed:", err);
      setUploadError("Image upload failed. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  // CRUD Actions
  const openCreateModal = () => {
    setEditingArticle(null);
    setModalTab('english');
    setArticleForm({
      title: '',
      title_hi: '',
      content: '',
      content_hi: '',
      category: 'General',
      image_url: '',
      is_published: true
    });
    setUploadError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (a: any) => {
    setEditingArticle(a);
    setModalTab('english');
    setArticleForm({
      title: a.title || '',
      title_hi: a.title_hi || '',
      content: a.content || '',
      content_hi: a.content_hi || '',
      category: a.category || 'General',
      image_url: a.image_url || '',
      is_published: a.is_published !== false
    });
    setUploadError(null);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this article?")) {
      try {
        await deleteArticle(id);
        await loadData();
      } catch (err) {
        console.error("Delete article failed:", err);
        alert("Failed to delete article.");
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingArticle) {
        await updateArticle(editingArticle.id, articleForm);
      } else {
        await createArticle(articleForm);
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      console.error("Save article failed:", err);
      alert("Failed to save article. Please check required fields.");
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
                    if (file) handleImageUpload(file);
                  }} />
                </label>
                <button type="button" className="export-btn" style={{ padding: '6px 12px', fontSize: '0.75rem', backgroundColor: '#ef4444', color: '#fff', border: 'none' }} onClick={() => setArticleForm(prev => ({ ...prev, image_url: '' }))}>
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
            onClick={() => document.getElementById('article-file-input')?.click()}
          >
            {uploadingImage ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Loader2 className="animate-spin" size={24} style={{ color: 'var(--primary-color)', marginBottom: 8 }} />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Uploading image...</span>
              </div>
            ) : (
              <>
                <Plus size={20} style={{ color: 'var(--text-secondary)', marginBottom: 4 }} />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Click to upload article cover image</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Supports JPG, PNG, WEBP up to 5MB</span>
              </>
            )}
            <input type="file" id="article-file-input" accept="image/*" style={{ display: 'none' }} onChange={e => {
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
      <p>Loading articles & advisories...</p>
    </div>
  );

  return (
    <div>
      <div className="list-screen-header">
        <div>
          <h1 className="list-screen-title">Articles & Advisory</h1>
          <p className="list-screen-subtitle">Publish educational blogs and health advisories for farmers</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="export-btn"><Download size={16} /> Export CSV</button>
          <button className="export-btn" onClick={openCreateModal}>
            <Plus size={16} /> Add Article
          </button>
        </div>
      </div>

      <div className="list-filter-bar">
        <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input className="filter-search" style={{ paddingLeft: 36 }} placeholder="Search article title..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setPage(1); }} />
        </div>
        <select className="filter-select" value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}>
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {(searchTerm || categoryFilter !== 'all') && (
          <button 
            type="button" 
            onClick={() => {
              setSearchTerm('');
              setCategoryFilter('all');
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
          { label: 'Total Articles', value: stats.total, icon: <BookOpen size={16} />, bg: '#dbeafe', color: '#3b82f6' },
          { label: 'Published', value: stats.published, icon: <CheckCircle size={16} />, bg: '#dcfce7', color: '#10b981' },
          { label: 'Drafts', value: stats.drafts, icon: <FileText size={16} />, bg: '#fef3c7', color: '#f59e0b' },
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
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Published Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(a => {
                const imgUrl = getImageVariantUrl(a.image_url, 'thumbnail');
                return (
                  <tr key={a.id}>
                    <td>
                      <div className="list-cell-name">
                        {imgUrl ? (
                          <img src={imgUrl} alt={a.title} style={{ width: 44, height: 32, borderRadius: 4, objectFit: 'cover' }} />
                        ) : (
                          <div className="list-cell-avatar" style={{ backgroundColor: '#dbeafe', color: '#1e40af' }}>
                            {(a.title || 'A')[0]}
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 600 }}>{a.title}</div>
                          {a.title_hi && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{a.title_hi}</div>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="list-status-badge" style={{ backgroundColor: '#e2e8f0', color: '#334155' }}>
                        {a.category || 'General'}
                      </span>
                    </td>
                    <td>
                      <span className="list-status-badge" style={{
                        backgroundColor: a.is_published !== false ? '#dcfce7' : '#fef3c7',
                        color: a.is_published !== false ? '#166534' : '#92400e'
                      }}>
                        {a.is_published !== false ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{a.created_at?.slice(0, 10) || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <button onClick={() => setSelectedArticle(a)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }} title="View details">
                          <Eye size={18} />
                        </button>
                        <button onClick={() => openEditModal(a)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--humal-green)' }} title="Edit article">
                          <Edit3 size={18} />
                        </button>
                        <button onClick={() => handleDeleteClick(a.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }} title="Delete article">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paginated.length === 0 && (
                <tr><td colSpan={5} className="list-empty">No articles found.</td></tr>
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
            <strong style={{ color: 'var(--text-primary)' }}>{filtered.length}</strong> articles
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
              maxWidth: 750, 
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
                  {editingArticle ? 'Edit Article Details' : 'Add New Article'}
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Publish educational content and advisories for farmers.
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
                
                {/* Cover Image uploader banner */}
                {renderImageUploader(articleForm.image_url)}

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
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Article Title *</label>
                      <input type="text" required className="filter-search" style={{ width: '100%', boxSizing: 'border-box' }} value={articleForm.title} onChange={e => setArticleForm({ ...articleForm, title: e.target.value })} placeholder="e.g. Vaccination Schedule for Cows" />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Category *</label>
                        <select className="filter-select" style={{ width: '100%' }} value={articleForm.category} onChange={e => setArticleForm({ ...articleForm, category: e.target.value })}>
                          <option value="General">General</option>
                          <option value="Breeding">Breeding</option>
                          <option value="Nutrition">Nutrition</option>
                          <option value="Disease Prevention">Disease Prevention</option>
                          <option value="Health Tips">Health Tips</option>
                        </select>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', marginTop: 22 }}>
                        <input type="checkbox" id="is_published" checked={articleForm.is_published} onChange={e => setArticleForm({ ...articleForm, is_published: e.target.checked })} style={{ cursor: 'pointer' }} />
                        <label htmlFor="is_published" style={{ fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', marginLeft: 8, userSelect: 'none' }}>Publish Immediately</label>
                      </div>
                    </div>

                    <AdvancedTextarea 
                      label="Content *" 
                      value={articleForm.content} 
                      onChange={val => setArticleForm({ ...articleForm, content: val })} 
                      placeholder="Write full article content in English..." 
                    />
                  </>
                ) : (
                  <>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>Article Title (Hindi)</label>
                      <input type="text" className="filter-search" style={{ width: '100%', boxSizing: 'border-box' }} value={articleForm.title_hi} onChange={e => setArticleForm({ ...articleForm, title_hi: e.target.value })} placeholder="हिंदी में लेख का शीर्षक..." />
                    </div>

                    <AdvancedTextarea 
                      label="Content in Hindi (हिंदी लेख)" 
                      value={articleForm.content_hi || ''} 
                      onChange={val => setArticleForm({ ...articleForm, content_hi: val })} 
                      placeholder="हिंदी में लेख का विवरण दर्ज करें..." 
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
                  {editingArticle ? 'Update Article' : 'Create Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL VIEW DRAWER */}
      {selectedArticle && (
        <>
          <div className="profile-drawer-overlay" onClick={() => setSelectedArticle(null)} />
          <div className="profile-drawer">
            <div className="drawer-header">
              <div className="drawer-name">{selectedArticle.title}</div>
              <button className="drawer-close" onClick={() => setSelectedArticle(null)}><X size={20} /></button>
            </div>
            <div className="drawer-body">
              {selectedArticle.image_url && (
                <div 
                  style={{ width: '100%', height: 160, borderRadius: 10, overflow: 'hidden', marginBottom: 16, cursor: 'pointer' }}
                  onClick={() => setLightboxUrl(getImageVariantUrl(selectedArticle.image_url, 'large'))}
                >
                  <img src={getImageVariantUrl(selectedArticle.image_url, 'medium')} alt={selectedArticle.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <div className="drawer-section">
                <div className="drawer-section-title">Article Information</div>
                {[
                  ['Title', selectedArticle.title || '—'],
                  ['Hindi Title', selectedArticle.title_hi || '—'],
                  ['Category', selectedArticle.category || 'General'],
                  ['Status', selectedArticle.is_published !== false ? 'Published' : 'Draft'],
                  ['Published Date', selectedArticle.created_at?.slice(0, 10) || '—'],
                ].map(([label, value]) => (
                  <div key={label as string} className="drawer-detail-row">
                    <span className="drawer-detail-label">{label}</span>
                    <span className="drawer-detail-value">{String(value)}</span>
                  </div>
                ))}
              </div>
              
              <div className="drawer-section" style={{ marginTop: 14 }}>
                <div className="drawer-section-title">Content Summary</div>
                {selectedArticle.content && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap', marginBottom: 14 }}>
                    <strong>English Content:</strong><br />{selectedArticle.content}
                  </div>
                )}
                {selectedArticle.content_hi && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    <strong>Hindi Content:</strong><br />{selectedArticle.content_hi}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
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

export default ArticlesScreen;
