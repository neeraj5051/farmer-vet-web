import { useState } from 'react';
import { Video, Home, Syringe, Dna } from 'lucide-react';
import '../../components/admin-v2/ListScreens.css';

const DEFAULT_SERVICES = [
  { id: 'srv-1', name: 'Online Video Consultation', icon: Video, duration: '15 mins', status: 'Active', category: 'Telemedicine' },
  { id: 'srv-2', name: 'In-Person Field Visit', icon: Home, duration: 'Variable', status: 'Active', category: 'Field Care' },
  { id: 'srv-3', name: 'Artificial Insemination (AI)', icon: Dna, duration: '30 mins', status: 'Active', category: 'Breeding' },
  { id: 'srv-4', name: 'Vaccination Drive', icon: Syringe, duration: '10 mins', status: 'Active', category: 'Immunization' },
];

const ServicesScreen = () => {
  const [services] = useState(DEFAULT_SERVICES);

  return (
    <div>
      <div className="list-screen-header">
        <div>
          <h1 className="list-screen-title">Global Service Offerings</h1>
          <p className="list-screen-subtitle">Manage platform-wide veterinary service categories and time slot parameters</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        {services.map(srv => {
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
    </div>
  );
};

export default ServicesScreen;
