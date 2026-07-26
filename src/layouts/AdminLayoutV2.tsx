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
  Calendar,
  X
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
  const { 
    dateRange, 
    setDateRange, 
    stateFilter, 
    setStateFilter, 
    serviceFilter, 
    setServiceFilter, 
    customStartDate, 
    customEndDate, 
    setCustomDateRange, 
    resetFilters, 
    isFiltered 
  } = useFilters();

  const [showCustomDateModal, setShowCustomDateModal] = useState(false);
  const [tempStart, setTempStart] = useState(customStartDate || new Date().toISOString().slice(0, 10));
  const [tempEnd, setTempEnd] = useState(customEndDate || new Date().toISOString().slice(0, 10));

  const handleDateSelectChange = (val: string) => {
    if (val === 'Custom') {
      setShowCustomDateModal(true);
    } else {
      setDateRange(val);
    }
  };

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
          <div className="topbar-filters" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <select className="filter-select" value={dateRange} onChange={e => handleDateSelectChange(e.target.value)}>
              <option value="Today">Date: Today</option>
              <option value="This Week">Date: Last 7 Days</option>
              <option value="This Month">Date: Last 30 Days</option>
              <option value="All Time">Date: All Time</option>
              <option value="Custom">
                {dateRange === 'Custom' && customStartDate && customEndDate 
                  ? `Custom: ${customStartDate} to ${customEndDate}` 
                  : 'Custom Range... 📅'}
              </option>
            </select>
            <select className="filter-select" value={stateFilter} onChange={e => setStateFilter(e.target.value)}>
              <option value="All States">All States</option>
              <option value="Bihar">Bihar</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Rajasthan">Rajasthan</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Punjab">Punjab</option>
              <option value="Haryana">Haryana</option>
              <option value="Gujarat">Gujarat</option>
              <option value="West Bengal">West Bengal</option>
              <option value="Odisha">Odisha</option>
            </select>
            <select className="filter-select" value={serviceFilter} onChange={e => setServiceFilter(e.target.value)}>
              <option value="All Services">All Services</option>
              <option value="Online Consultation">Online Consultation</option>
              <option value="In-Person Visit">In-Person Visit</option>
              <option value="AI / Insemination">AI / Insemination</option>
              <option value="Vaccination">Vaccination</option>
            </select>

            {isFiltered && (
              <button 
                onClick={resetFilters}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--humal-green-light)',
                  color: 'var(--humal-green)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
                title="Reset all filters"
              >
                Reset
              </button>
            )}
          </div>

          {/* Custom Date Range Modal */}
          {showCustomDateModal && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.4)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}>
              <div style={{
                backgroundColor: 'var(--card-white)',
                borderRadius: '12px',
                width: '100%',
                maxWidth: '420px',
                padding: '24px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={20} color="var(--humal-green)" />
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Select Custom Date Range</h3>
                  </div>
                  <button 
                    onClick={() => setShowCustomDateModal(false)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px' }}
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Preset range quick buttons */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => {
                      const today = new Date();
                      const start = new Date(today.getTime() - 7 * 86400000);
                      setTempStart(start.toISOString().slice(0, 10));
                      setTempEnd(today.toISOString().slice(0, 10));
                    }}
                    style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-light)', cursor: 'pointer', fontWeight: 500 }}
                  >
                    Last 7 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const today = new Date();
                      const start = new Date(today.getTime() - 30 * 86400000);
                      setTempStart(start.toISOString().slice(0, 10));
                      setTempEnd(today.toISOString().slice(0, 10));
                    }}
                    style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-light)', cursor: 'pointer', fontWeight: 500 }}
                  >
                    Last 30 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const today = new Date();
                      const start = new Date(today.getFullYear(), today.getMonth(), 1);
                      setTempStart(start.toISOString().slice(0, 10));
                      setTempEnd(today.toISOString().slice(0, 10));
                    }}
                    style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-light)', cursor: 'pointer', fontWeight: 500 }}
                  >
                    This Month
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      From Date (Start)
                    </label>
                    <input 
                      type="date"
                      value={tempStart}
                      onChange={e => setTempStart(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        fontSize: '0.9rem',
                        outline: 'none',
                        backgroundColor: 'var(--card-white)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      To Date (End)
                    </label>
                    <input 
                      type="date"
                      value={tempEnd}
                      onChange={e => setTempEnd(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        fontSize: '0.9rem',
                        outline: 'none',
                        backgroundColor: 'var(--card-white)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setShowCustomDateModal(false)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'transparent',
                      color: 'var(--text-secondary)',
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (tempStart && tempEnd) {
                        setCustomDateRange(tempStart, tempEnd);
                        setShowCustomDateModal(false);
                      }
                    }}
                    disabled={!tempStart || !tempEnd}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: tempStart && tempEnd ? 'var(--humal-green)' : '#ccc',
                      color: '#fff',
                      fontWeight: 600,
                      cursor: tempStart && tempEnd ? 'pointer' : 'not-allowed'
                    }}
                  >
                    Apply Range
                  </button>
                </div>
              </div>
            </div>
          )}

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
