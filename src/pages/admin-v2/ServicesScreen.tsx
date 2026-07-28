import { useEffect, useState } from 'react';
import { serviceCardService } from '../../services/serviceCardService';
import api from '../../services/api';
import { 
  LayoutGrid, 
  Eye, 
  Loader2, 
  Video, 
  Home, 
  Syringe, 
  Dna, 
  Settings2,
  X,
  Plus
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

  // Edit Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [modalTab, setModalTab] = useState<'english' | 'hindi'>('english');
  const [cardForm, setCardForm] = useState({
    title: '',
    title_hi: '',
    subtitle: '',
    subtitle_hi: '',
    image_url: '',
    order_index: 1,
    is_active: true
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await serviceCardService.getAllServiceCardsAdmin();
      setCardsData(Array.isArray(result) && result.length > 0 ? result : DEFAULT_CARDS);
    } catch (err) {
      console.warn('Backend service cards empty. Loading defaults.', err);
      setCardsData(DEFAULT_CARDS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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

  const openEditModal = (card: any) => {
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
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCard) return;
    try {
      await serviceCardService.updateServiceCard(selectedCard.id, cardForm);
      setIsModalOpen(false);
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
          <div style={{ position: 'relative', width: '100%', height: 160, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
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

  if (loading && cardsData.length === 0) return (
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
                    <button onClick={() => openEditModal(card)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
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

      {/* EDIT POPUP MODAL */}
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
                onClick={() => setIsModalOpen(false)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden' }}>
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
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesScreen;
