import { useEffect, useState } from 'react';
import { getServiceCards } from '../../services/adminService';
import { 
  LayoutGrid, 
  Eye, 
  Loader2, 
  Video, 
  Home, 
  Syringe, 
  Dna, 
  Settings2 
} from 'lucide-react';
import '../../components/admin-v2/ListScreens.css';
import { getImageVariantUrl } from '../../utils/imageUtils';

const DEFAULT_SERVICES = [
  { id: 'srv-1', name: 'Online Video Consultation', icon: Video, duration: '15 mins', status: 'Active', category: 'Telemedicine' },
  { id: 'srv-2', name: 'In-Person Field Visit', icon: Home, duration: 'Variable', status: 'Active', category: 'Field Care' },
  { id: 'srv-3', name: 'Artificial Insemination (AI)', icon: Dna, duration: '30 mins', status: 'Active', category: 'Breeding' },
  { id: 'srv-4', name: 'Vaccination Drive', icon: Syringe, duration: '10 mins', status: 'Active', category: 'Immunization' },
];

const DEFAULT_CARDS = [
  { id: 'sc-1', title: 'Online Consultation', title_hi: 'ऑनलाइन परामर्श', subtitle: 'Video call with licensed vet', display_order: 1, is_active: true },
  { id: 'sc-2', title: 'In-Person Visit', title_hi: 'घर पर पशु चिकित्सक', subtitle: 'On-site farm vet visit', display_order: 2, is_active: true },
  { id: 'sc-3', title: 'Artificial Insemination', title_hi: 'कृत्रिम गर्भाधान', subtitle: 'Breed improvement service', display_order: 3, is_active: true },
  { id: 'sc-4', title: 'Vaccinations', title_hi: 'पशु टीकाकरण', subtitle: 'Immunization & preventive care', display_order: 4, is_active: true },
];

const ServicesScreen = () => {
  const [activeTab, setActiveTab] = useState<'cards' | 'global'>('cards');
  const [cardsData, setCardsData] = useState<any[]>([]);
  const [servicesData] = useState(DEFAULT_SERVICES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getServiceCards();
        setCardsData(Array.isArray(result) && result.length > 0 ? result : DEFAULT_CARDS);
      } catch (err) {
        console.warn('Backend service cards empty. Loading defaults.', err);
        setCardsData(DEFAULT_CARDS);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
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
          Global Service Offerings ({servicesData.length})
        </button>
      </div>

      {/* TAB 1: MOBILE APP ACTION CARDS */}
      {activeTab === 'cards' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {cardsData.map(card => {
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
      )}

      {/* TAB 2: GLOBAL SERVICE OFFERINGS */}
      {activeTab === 'global' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {servicesData.map(srv => {
            const IconComp = srv.icon;
            return (
              <div key={srv.id} style={{ background: 'var(--card-white)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: '#e6f0eb', color: '#0a4f32', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <IconComp size={20} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{srv.name}</h3>
                    <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{srv.category}</p>
                  </div>
                </div>

                <div style={{ fontSize: '0.88rem', display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px solid var(--border-color)', marginTop: 12 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Default Duration</span>
                  <span style={{ fontWeight: 600 }}>{srv.duration}</span>
                </div>
                <div style={{ fontSize: '0.88rem', display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Status</span>
                  <span className="list-status-badge" style={{ backgroundColor: '#dcfce7', color: '#166534' }}>{srv.status}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ServicesScreen;
