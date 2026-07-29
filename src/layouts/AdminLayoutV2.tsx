import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
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
  User,
  Calendar,
  Stethoscope,
  BookOpen,
  Syringe,
  Percent,
  Headphones,
  Settings2,
  ChevronDown,
  X
} from 'lucide-react';
import './AdminLayoutV2.css';
import { FilterProvider, useFilters } from '../context/FilterContext';
import { useAuth } from '../context/AuthContext';
import { DateRangeCalendarModal } from '../components/admin-v2/DateRangeCalendarModal';

const NAV_SECTIONS = [
  {
    label: 'Operations',
    items: [
      { to: '/admin-v2/operations', label: 'Operations Overview', icon: LayoutDashboard },
      { to: '/admin-v2/bookings', label: 'Bookings', icon: FileText },
      { to: '/admin-v2/consultations', label: 'Consultations', icon: Video },
      { to: '/admin-v2/farmers', label: 'Farmers', icon: Users },
      { to: '/admin-v2/vets', label: 'Veterinarians', icon: UserSquare2 },
      { to: '/admin-v2/support', label: 'Support Tickets', icon: Headphones },
    ],
  },
  {
    label: 'Financials',
    items: [
      { to: '/admin-v2/financials', label: 'Financial Overview', icon: IndianRupee },
      { to: '/admin-v2/revenue', label: 'Revenue', icon: IndianRupee },
      { to: '/admin-v2/payouts', label: 'Vet Payouts', icon: CreditCard },
      { to: '/admin-v2/transactions', label: 'Transactions', icon: FileText },
      { to: '/admin-v2/fees', label: 'Platform Fees', icon: Percent },
    ],
  },
  {
    label: 'Catalogs & Content',
    items: [
      { to: '/admin-v2/diseases', label: 'Manage Diseases', icon: Stethoscope },
      { to: '/admin-v2/vaccines', label: 'Manage Vaccines', icon: Syringe },
      { to: '/admin-v2/articles', label: 'Manage Articles', icon: BookOpen },
      { to: '/admin-v2/services', label: 'Services & Action Cards', icon: Settings2 },
    ],
  },
  {
    label: 'Reports & Settings',
    items: [
      { to: '/admin-v2/reports', label: 'Reports & Exports', icon: FileText },
      { to: '/admin-v2/settings', label: 'System Settings', icon: Settings },
    ],
  },
];

const AdminLayoutContent = () => {
  const { pathname } = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { logout } = useAuth();

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    Operations: true,
    Financials: true,
    'Catalogs & Content': true,
    'Reports & Settings': true,
  });

  const toggleSection = (label: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const formatPillDate = (s?: string, e?: string) => {
    if (!s) return 'Custom Range...';
    const formatSingle = (str: string) => {
      const d = new Date(str);
      if (isNaN(d.getTime())) return str;
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    };
    const startFmt = formatSingle(s);
    const endFmt = e ? formatSingle(e) : startFmt;
    return startFmt === endFmt ? startFmt : `${startFmt} – ${endFmt}`;
  };

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
      <aside className={`admin-v2-sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
        <div className="sidebar-logo-v2" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span>🐄</span> Humal Admin
          </div>
          <button className="menu-toggle" onClick={() => setSidebarOpen(false)} style={{ border: 'none', background: 'transparent' }} title="Collapse sidebar">
            <X size={18} />
          </button>
        </div>
        
        <nav className="sidebar-nav-v2">
          {NAV_SECTIONS.map((section) => {
            const isExpanded = expandedSections[section.label] !== false;
            return (
              <div key={section.label} className="nav-group-v2">
                <div 
                  className="nav-title-v2" 
                  onClick={() => toggleSection(section.label)}
                  title={isExpanded ? "Click to collapse" : "Click to expand"}
                >
                  <span>{section.label}</span>
                  <ChevronDown 
                    size={14} 
                    style={{ 
                      transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)', 
                      transition: 'transform 0.2s ease' 
                    }} 
                  />
                </div>
                {isExpanded && (
                  <div className="nav-items-v2">
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
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className={`admin-v2-main ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
        {/* Topbar */}
        <header className="admin-v2-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} title={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}>
              <Menu size={20} />
            </button>
            <h2 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 600 }}>Dashboard</h2>
          </div>

          {/* Global Filters */}
          {!['/admin-v2/diseases', '/admin-v2/vaccines', '/admin-v2/articles', '/admin-v2/services', '/admin-v2/settings', '/admin-v2/reports', '/admin-v2/fees'].includes(pathname) && (
            <div className="topbar-filters" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {!['/admin-v2/vets', '/admin-v2/farmers'].includes(pathname) && (
                dateRange === 'Custom' ? (
                  <button
                    type="button"
                    onClick={() => setShowCustomDateModal(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '7px 14px',
                      borderRadius: '8px',
                      border: '1.5px solid #0d5c3a',
                      backgroundColor: '#e6f4ea',
                      color: '#0d5c3a',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(13, 92, 58, 0.1)',
                      transition: 'all 0.15s ease'
                    }}
                    title="Click to change custom date range"
                  >
                    <Calendar size={15} color="#0d5c3a" />
                    <span>Date: {formatPillDate(customStartDate, customEndDate)}</span>
                  </button>
                ) : (
                  <select className="filter-select" value={dateRange} onChange={e => handleDateSelectChange(e.target.value)}>
                    <option value="Today">Date: Today</option>
                    <option value="This Week">Date: Last 7 Days</option>
                    <option value="This Month">Date: Last 30 Days</option>
                    <option value="All Time">Date: All Time</option>
                    <option value="Custom">Custom Range... 📅</option>
                  </select>
                )
              )}
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
              {!['/admin-v2/vets', '/admin-v2/farmers'].includes(pathname) && (
                <select className="filter-select" value={serviceFilter} onChange={e => setServiceFilter(e.target.value)}>
                  <option value="All Services">All Services</option>
                  <option value="Online Consultation">Online Consultation</option>
                  <option value="In-Person Visit">In-Person Visit</option>
                  <option value="AI / Insemination">AI / Insemination</option>
                  <option value="Vaccination">Vaccination</option>
                </select>
              )}

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
          )}

          {/* Custom Visual Interactive Date Range Calendar Modal */}
          <DateRangeCalendarModal
            isOpen={showCustomDateModal}
            onClose={() => setShowCustomDateModal(false)}
            startDate={customStartDate}
            endDate={customEndDate}
            onApply={(start, end) => setCustomDateRange(start, end)}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-secondary)', position: 'relative' }}>
            <Bell size={20} style={{ cursor: 'pointer' }} />
            
            {/* Admin Profile Dropdown Trigger */}
            <div 
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '4px 8px', borderRadius: '8px', position: 'relative' }}
            >
              <div style={{ width: '32px', height: '32px', backgroundColor: 'var(--humal-green-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={16} color="var(--humal-green)" />
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>Admin</span>
              <ChevronDown size={14} color="var(--text-secondary)" />
            </div>

            {/* Admin Profile Dropdown Menu */}
            {userMenuOpen && (
              <div 
                style={{
                  position: 'absolute',
                  top: '48px',
                  right: 0,
                  width: '180px',
                  backgroundColor: 'var(--card-white)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                  zIndex: 100,
                  overflow: 'hidden',
                  padding: '4px 0'
                }}
              >
                <NavLink 
                  to="/admin-v2/settings" 
                  onClick={() => setUserMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 16px',
                    fontSize: '0.88rem',
                    color: 'var(--text-primary)',
                    textDecoration: 'none'
                  }}
                >
                  <Settings size={16} />
                  <span>Settings</span>
                </NavLink>
                <button
                  onClick={() => { setUserMenuOpen(false); logout(); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '10px 16px',
                    fontSize: '0.88rem',
                    color: '#ef4444',
                    background: 'none',
                    border: 'none',
                    borderTop: '1px solid var(--border-color)',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <LogOut size={16} color="#ef4444" />
                  <span>Logout</span>
                </button>
              </div>
            )}
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
