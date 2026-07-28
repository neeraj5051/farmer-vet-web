import { useState } from 'react';
import { Bell, Lock, UserCheck } from 'lucide-react';
import '../../components/admin-v2/ListScreens.css';

const SettingsScreen = () => {
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);

  return (
    <div>
      <div className="list-screen-header">
        <div>
          <h1 className="list-screen-title">System Settings & Profile</h1>
          <p className="list-screen-subtitle">Manage administrative privileges, security preferences, and alert channels</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {/* Profile Card */}
        <div style={{ background: 'var(--card-white)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: '#e6f0eb', color: '#0a4f32', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserCheck size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600 }}>Administrator Profile</h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Super Admin privileges</p>
            </div>
          </div>
          <div style={{ display: 'grid', gap: 12, marginTop: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: 4 }}>Account Name</label>
              <input type="text" className="filter-search" style={{ width: '100%', boxSizing: 'border-box' }} value="Humal Super Admin" readOnly />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: 4 }}>Email Address</label>
              <input type="email" className="filter-search" style={{ width: '100%', boxSizing: 'border-box' }} value="admin@humal.in" readOnly />
            </div>
          </div>
        </div>

        {/* Notifications Card */}
        <div style={{ background: 'var(--card-white)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: '#dbeafe', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bell size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600 }}>Alert Preferences</h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Configure instant system alerts</p>
            </div>
          </div>
          <div style={{ display: 'grid', gap: 16, marginTop: 20 }}>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '0.9rem' }}>
              <span>High priority vet verification alerts</span>
              <input type="checkbox" checked={notifications} onChange={e => setNotifications(e.target.checked)} />
            </label>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '0.9rem' }}>
              <span>Daily revenue summary email</span>
              <input type="checkbox" checked={emailAlerts} onChange={e => setEmailAlerts(e.target.checked)} />
            </label>
          </div>
        </div>

        {/* Security Card */}
        <div style={{ background: 'var(--card-white)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: '#fef3c7', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Lock size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600 }}>Security & Authentication</h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Two-factor authentication & password</p>
            </div>
          </div>
          <div style={{ marginTop: 20 }}>
            <button className="export-btn" style={{ backgroundColor: '#1e293b' }}>
              <Lock size={15} /> Change Admin Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;
