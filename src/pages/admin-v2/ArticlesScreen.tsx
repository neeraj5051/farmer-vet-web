import { useEffect, useMemo, useState } from 'react';
import { getArticles } from '../../services/adminService';
import { Search, Download, Loader2, Eye, X, BookOpen, CheckCircle, FileText } from 'lucide-react';
import '../../components/admin-v2/ListScreens.css';
import { getImageVariantUrl } from '../../utils/imageUtils';

const PAGE_SIZE = 10;

const ArticlesScreen = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getArticles();
        setData(Array.isArray(result) ? result : []);
      } catch (err) {
        console.error('Error fetching articles:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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

  if (loading) return (
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
        <button className="export-btn"><Download size={16} /> Export CSV</button>
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
                  <tr key={a.id} onClick={() => setSelectedArticle(a)}>
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
                      <button onClick={e => { e.stopPropagation(); setSelectedArticle(a); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                        <Eye size={18} />
                      </button>
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

      {/* Detail Drawer */}
      {selectedArticle && (
        <>
          <div className="profile-drawer-overlay" onClick={() => setSelectedArticle(null)} />
          <div className="profile-drawer">
            <div className="drawer-header">
              <div className="drawer-profile">
                <div className="drawer-name">{selectedArticle.title}</div>
              </div>
              <button className="drawer-close" onClick={() => setSelectedArticle(null)}><X size={20} /></button>
            </div>
            <div className="drawer-body">
              <div className="drawer-section">
                <div className="drawer-section-title">Article Summary</div>
                <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: 1.6 }}>{selectedArticle.content || selectedArticle.summary || 'No description provided.'}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ArticlesScreen;
