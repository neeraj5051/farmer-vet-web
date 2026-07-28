import { useEffect, useMemo, useState } from 'react';
import { getVaccines } from '../../services/adminService';
import { Search, Download, Loader2, Eye, X, ShieldCheck, Syringe, Calendar } from 'lucide-react';
import '../../components/admin-v2/ListScreens.css';
import { getImageVariantUrl } from '../../utils/imageUtils';

const PAGE_SIZE = 10;

const VaccinesScreen = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVaccine, setSelectedVaccine] = useState<any>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getVaccines();
        setData(Array.isArray(result) ? result : []);
      } catch (err) {
        console.error('Error fetching vaccines:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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

  if (loading) return (
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
        <button className="export-btn"><Download size={16} /> Export CSV</button>
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
                  <tr key={v.id} onClick={() => setSelectedVaccine(v)}>
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
                      <button onClick={e => { e.stopPropagation(); setSelectedVaccine(v); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                        <Eye size={18} />
                      </button>
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

      {/* Detail Drawer */}
      {selectedVaccine && (
        <>
          <div className="profile-drawer-overlay" onClick={() => setSelectedVaccine(null)} />
          <div className="profile-drawer">
            <div className="drawer-header">
              <div className="drawer-name">{selectedVaccine.name}</div>
              <button className="drawer-close" onClick={() => setSelectedVaccine(null)}><X size={20} /></button>
            </div>
            <div className="drawer-body">
              <div className="drawer-section">
                <div className="drawer-section-title">Vaccine Details</div>
                {[
                  ['Vaccine Name', selectedVaccine.name || '—'],
                  ['Disease Prevented', selectedVaccine.disease_name || '—'],
                  ['Target Species', selectedVaccine.target_animals || 'Cattle, Buffalo'],
                  ['Dosage Schedule', selectedVaccine.dosage_schedule || 'Annual'],
                  ['Base Price', selectedVaccine.price ? `₹${selectedVaccine.price}` : '₹150'],
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

export default VaccinesScreen;
