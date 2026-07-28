import { useEffect, useMemo, useState } from 'react';
import { getDiseases } from '../../services/adminService';
import { Search, Download, Loader2, Eye, X, Stethoscope, AlertTriangle, Activity } from 'lucide-react';
import '../../components/admin-v2/ListScreens.css';
import { getImageVariantUrl } from '../../utils/imageUtils';

const PAGE_SIZE = 10;

const DiseasesScreen = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedDisease, setSelectedDisease] = useState<any>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getDiseases();
        setData(Array.isArray(result) ? result : []);
      } catch (err) {
        console.error('Error fetching diseases:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    data.forEach(d => { if (d.category) set.add(d.category); });
    return Array.from(set).sort();
  }, [data]);

  const filtered = useMemo(() => {
    let result = data;
    if (categoryFilter !== 'all') {
      result = result.filter(d => d.category === categoryFilter);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(d =>
        d.name?.toLowerCase().includes(q) ||
        d.name_hi?.toLowerCase().includes(q) ||
        d.symptoms?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [data, categoryFilter, searchTerm]);

  const stats = useMemo(() => ({
    total: data.length,
    bacterial: data.filter(d => d.category === 'Bacterial').length,
    viral: data.filter(d => d.category === 'Viral').length,
    parasitic: data.filter(d => d.category === 'Parasitic' || d.category === 'Protozoal').length,
  }), [data]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) return (
    <div className="loading-spinner">
      <Loader2 size={36} />
      <p>Loading disease catalog...</p>
    </div>
  );

  return (
    <div>
      <div className="list-screen-header">
        <div>
          <h1 className="list-screen-title">Disease Catalog</h1>
          <p className="list-screen-subtitle">Manage livestock disease directory, symptoms, and treatments</p>
        </div>
        <button className="export-btn"><Download size={16} /> Export CSV</button>
      </div>

      <div className="list-filter-bar">
        <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input className="filter-search" style={{ paddingLeft: 36 }} placeholder="Search disease name or symptom..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setPage(1); }} />
        </div>
        <select className="filter-select" value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}>
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* KPI Cards */}
      <div className="list-kpi-row">
        {[
          { label: 'Total Diseases', value: stats.total, icon: <Stethoscope size={16} />, bg: '#dbeafe', color: '#3b82f6' },
          { label: 'Bacterial', value: stats.bacterial, icon: <Activity size={16} />, bg: '#dcfce7', color: '#10b981' },
          { label: 'Viral', value: stats.viral, icon: <AlertTriangle size={16} />, bg: '#fee2e2', color: '#ef4444' },
          { label: 'Parasitic / Protozoal', value: stats.parasitic, icon: <Activity size={16} />, bg: '#fef3c7', color: '#f59e0b' },
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
                <th>Disease</th>
                <th>Hindi Name</th>
                <th>Category</th>
                <th>Target Animals</th>
                <th>Symptoms</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(d => {
                const imgUrl = getImageVariantUrl(d.image_path || d.image_url, 'thumbnail');
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
                      <span className="list-status-badge" style={{ backgroundColor: '#e2e8f0', color: '#334155' }}>
                        {d.category || 'General'}
                      </span>
                    </td>
                    <td>{d.target_animals || d.affected_species || 'Cattle, Buffalo'}</td>
                    <td style={{ maxWidth: 260, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-secondary)' }}>
                      {d.symptoms || '—'}
                    </td>
                    <td>
                      <button onClick={e => { e.stopPropagation(); setSelectedDisease(d); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {paginated.length === 0 && (
                <tr><td colSpan={6} className="list-empty">No diseases found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Drawer */}
      {selectedDisease && (
        <>
          <div className="profile-drawer-overlay" onClick={() => setSelectedDisease(null)} />
          <div className="profile-drawer">
            <div className="drawer-header">
              <div className="drawer-profile">
                <div className="drawer-avatar" style={{ backgroundColor: '#dbeafe', color: '#1e40af' }}>
                  {(selectedDisease.name || 'D')[0]}
                </div>
                <div>
                  <div className="drawer-name">{selectedDisease.name}</div>
                  <div className="drawer-meta">{selectedDisease.name_hi || selectedDisease.category}</div>
                </div>
              </div>
              <button className="drawer-close" onClick={() => setSelectedDisease(null)}><X size={20} /></button>
            </div>
            <div className="drawer-body">
              <div className="drawer-section">
                <div className="drawer-section-title">Disease Details</div>
                {[
                  ['Name (English)', selectedDisease.name || '—'],
                  ['Name (Hindi)', selectedDisease.name_hi || '—'],
                  ['Category', selectedDisease.category || '—'],
                  ['Target Species', selectedDisease.target_animals || selectedDisease.affected_species || 'Cattle, Buffalo'],
                  ['Symptoms', selectedDisease.symptoms || '—'],
                  ['Treatment', selectedDisease.treatment || '—'],
                  ['Prevention', selectedDisease.prevention || '—'],
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
    </div>
  );
};

export default DiseasesScreen;
