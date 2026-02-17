import { IndianRupee, LayoutDashboard, LogOut, Stethoscope, Users } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './DashboardLayout.css';

const DashboardLayout = () => {
    const { logout, user } = useAuth();

    return (
        <div className="layout-container">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h2>Humal Admin</h2>
                </div>
                <nav className="sidebar-nav">
                    <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </NavLink>
                    <NavLink to="/financials" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <IndianRupee size={20} />
                        <span>Financials</span>
                    </NavLink>
                    <NavLink to="/users" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <Users size={20} />
                        <span>Users</span>
                    </NavLink>
                    <NavLink to="/fees" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <IndianRupee size={20} />
                        <span>Fees</span>
                    </NavLink>
                    <NavLink to="/diseases" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <Stethoscope size={20} />
                        <span>Diseases</span>
                    </NavLink>
                </nav>
                <div className="sidebar-footer">
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
