import {
    BarChart2,
    BookOpen,
    Calendar,
    CreditCard,
    IndianRupee,
    LayoutDashboard,
    LogOut,
    MessageSquare,
    Settings,
    Shield,
    Stethoscope,
    Users,
    Video,
} from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import './DashboardLayout.css';

const NAV_SECTIONS = [
    {
        label: 'Overview',
        items: [
            { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
            { to: '/admin/reports', label: 'Reports', icon: BarChart2 },
        ],
    },
    {
        label: 'Users',
        items: [
            { to: '/admin/users', label: 'Vets & Farmers', icon: Users },
        ],
    },
    {
        label: 'Consultations',
        items: [
            { to: '/admin/consultations', label: 'Consultations', icon: Video },
            { to: '/admin/vaccination', label: 'Vaccination', icon: Shield },
        ],
    },
    {
        label: 'Finance',
        items: [
            { to: '/admin/payments', label: 'Payments & Payouts', icon: CreditCard },
            { to: '/admin/financials', label: 'Financials', icon: IndianRupee },
            { to: '/admin/fees', label: 'Manage Fees', icon: Settings },
        ],
    },
    {
        label: 'Content',
        items: [
            { to: '/admin/diseases', label: 'Diseases', icon: Stethoscope },
            { to: '/admin/blogs', label: 'Pashu Gyan', icon: BookOpen },
            { to: '/admin/services', label: 'Services', icon: Calendar },
            { to: '/admin/vaccines', label: 'Vaccines', icon: Shield },
        ],
    },
    {
        label: 'Support',
        items: [
            { to: '/admin/support', label: 'Support Tickets', icon: MessageSquare },
        ],
    },
];

const DashboardLayout = () => {
    const { logout, user } = useAuth();
    
    // Theme state
    const [theme, setTheme] = useState<'dark' | 'light'>(() => {
        return (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
    });

    useEffect(() => {
        if (theme === 'light') {
            document.documentElement.classList.add('light-mode');
        } else {
            document.documentElement.classList.remove('light-mode');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    return (
        <div className="layout-container">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <span className="sidebar-logo-icon">🐄</span>
                        <h2>Humal Admin</h2>
                    </div>
                </div>
                <nav className="sidebar-nav">
                    {NAV_SECTIONS.map(section => (
                        <div key={section.label} className="nav-section">
                            <div className="nav-section-label">{section.label}</div>
                            {section.items.map(item => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    end={item.end}
                                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                                >
                                    <item.icon size={18} />
                                    <span>{item.label}</span>
                                </NavLink>
                            ))}
                        </div>
                    ))}
                </nav>
                <div className="sidebar-footer">
                    <button 
                        onClick={toggleTheme} 
                        className="logout-btn" 
                        style={{ marginBottom: '10px', background: 'var(--glass-white)' }}
                    >
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                    </button>
                    <button onClick={logout} className="logout-btn">
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                    <div className="user-info">
                        <small>{user?.phone_number}</small>
                    </div>
                </div>
            </aside>
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
};
export default DashboardLayout;
