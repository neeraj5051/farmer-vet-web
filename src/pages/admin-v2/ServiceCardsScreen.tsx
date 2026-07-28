import { useEffect, useState } from 'react';
import { getServiceCards } from '../../services/adminService';
import { LayoutGrid, Eye, Loader2 } from 'lucide-react';
import '../../components/admin-v2/ListScreens.css';
import { getImageVariantUrl } from '../../utils/imageUtils';

const DEFAULT_CARDS = [
  { id: 'sc-1', title: 'Online Consultation', title_hi: 'ऑनलाइन परामर्श', subtitle: 'Video call with licensed vet', display_order: 1, is_active: true },
  { id: 'sc-2', title: 'In-Person Visit', title_hi: 'घर पर पशु चिकित्सक', subtitle: 'On-site farm vet visit', display_order: 2, is_active: true },
  { id: 'sc-3', title: 'Artificial Insemination', title_hi: 'कृत्रिम गर्भाधान', subtitle: 'Breed improvement service', display_order: 3, is_active: true },
  { id: 'sc-4', title: 'Vaccinations', title_hi: 'पशु टीकाकरण', subtitle: 'Immunization & preventive care', display_order: 4, is_active: true },
];

const ServiceCardsScreen = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getServiceCards();
        setData(Array.isArray(result) && result.length > 0 ? result : DEFAULT_CARDS);
      } catch (err) {
        console.warn('Backend service cards empty. Loading defaults.', err);
        setData(DEFAULT_CARDS);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="loading-spinner">
      <Loader2 size={36} />
      <p>Loading home screen action cards...</p>
    </div>
  );

  return (
    <div>
      <div className="list-screen-header">
        <div>
          <h1 className="list-screen-title">Mobile App Service Action Cards</h1>
          <p className="list-screen-subtitle">Manage farmer app home screen primary service banners and localization</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        {data.map(card => {
          const imgUrl = getImageVariantUrl(card.image_url, 'medium');
          return (
            <div key={card.id} style={{ background: 'var(--card-white)', border: '1px solid var(--border-color)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ height: 120, backgroundColor: '#0a4f32', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                {imgUrl ? (
                  <img src={imgUrl} alt={card.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <LayoutGrid size={40} opacity={0.6} />
                )}
                <span style={{ position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '0.75rem', padding: '2px 8px', borderRadius: 10 }}>
                  Order #{card.display_order}
                </span>
              </div>
              <div style={{ padding: 16 }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{card.title}</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{card.title_hi || '—'}</p>
                <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', color: 'var(--text-primary)' }}>{card.subtitle || '—'}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border-color)' }}>
                  <span className="list-status-badge" style={{ backgroundColor: '#dcfce7', color: '#166534' }}>
                    Active
                  </span>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Eye size={16} /> Edit Card
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ServiceCardsScreen;
