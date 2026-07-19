import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Video, 
  Users, 
  UserSquare2, 
  IndianRupee, 
  CreditCard, 
  FileText, 
  Settings, 
  LogOut,
  Menu,
  Bell,
  User
} from 'lucide-react';
import './AdminLayoutV2.css';
import { FilterProvider, useFilters } from '../context/FilterContext';

const NAV_SECTIONS = [
  {
    label: 'Operations',
    items: [
      { to: '/admin-v2/operations', label: 'Operations Overview', icon: LayoutDashboard },
      { to: '/admin-v2/bookings', label: 'Bookings', icon: FileText },
      { to: '/admin-v2/consultations', label: 'Consultations', icon: Video },
      { to: '/admin-v2/farmers', label: 'Farmers', icon: Users },
      { to: '/admin-v2/vets', label: 'Veterinarians', icon: UserSquare2 },
    ],
  },
  {
    label: 'Financials',
    items: [
      { to: '/admin-v2/financials', label: 'Financial Overview', icon: IndianRupee },
      { to: '/admin-v2/revenue', label: 'Revenue', icon: IndianRupee },
      { to: '/admin-v2/payouts', label: 'Vet Payouts', icon: CreditCard },
      { to: '/admin-v2/transactions', label: 'Transactions', icon: FileText },
    ],
  },
  {
    label: 'Reports',
    items: [
      { to: '/admin-v2/reports', label: 'Reports & Downloads', icon: FileText },
    ],
  },
];

const AdminLayoutContent = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { dateRange, setDateRange, stateFilter, setStateFilter, serviceFilter, setServiceFilter } = useFilters();

  return (
    <div className="admin-v2-container">
      {/* Sidebar Navigation */}
      <aside className={`admin-v2-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo-v2">
          <span>🐄</span> Humal Admin
        </div>
        
        <nav className="sidebar-nav-v2">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className="nav-group-v2">
              <div className="nav-title-v2">{section.label}</div>
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `nav-link-v2 ${isActive ? 'active' : ''}`}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="nav-group-v2" style={{ marginTop: 'auto', marginBottom: '20px' }}>
          <NavLink to="/admin-v2/settings" className="nav-link-v2">
            <Settings />
            <span>Settings</span>
          </NavLink>
          <button className="nav-link-v2" style={{ border: 'none', background: 'transparent', width: '100%', cursor: 'pointer' }}>
            <LogOut color="#ef4444" />
            <span style={{ color: '#ef4444' }}>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-v2-main">
        {/* Topbar */}
        <header className="admin-v2-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu size={24} />
            </button>
            <h2 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 600 }}>Dashboard</h2>
          </div>

          {/* Global Filters */}
          <div className="topbar-filters">
            <select className="filter-select" value={dateRange} onChange={e => setDateRange(e.target.value)}>
              <option value="Today">Date: Today</option>
              <option value="This Week">Date: This Week</option>
              <option value="This Month">Date: This Month</option>
            </select>
            <select className="filter-select" value={stateFilter} onChange={e => setStateFilter(e.target.value)}>
              <option value="All States">All States</option>
              <option value="Bihar">Bihar</option>
              <option value="Karnataka">Karnataka</option>
            </select>
            <select className="filter-select" value={serviceFilter} onChange={e => setServiceFilter(e.target.value)}>
              <option value="All Services">All Services</option>
              <option value="Online Consultation">Online Consultation</option>
              <option value="In-Person Visit">In-Person Visit</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-secondary)' }}>
            <Bell size={20} style={{ cursor: 'pointer' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <div style={{ width: '32px', height: '32px', backgroundColor: 'var(--humal-green-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={16} color="var(--humal-green)" />
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>Admin</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div style={{ padding: '24px', flex: 1 }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

const AdminLayoutV2 = () => (
  <FilterProvider>
    <AdminLayoutContent />
  </FilterProvider>
);

export default AdminLayoutV2;
