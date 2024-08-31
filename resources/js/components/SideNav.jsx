import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './SideNav.css';
import { FaUsers, FaChartLine, FaEnvelope, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { useUser } from './UserContext';

function SideNav() {
    const { logout } = useUser();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="side-nav">
            <div className="top-section">
                <div className="logo-container">
                    <img src="/images/logo.png" alt="Logo" className="logo" />
                    <span className="logo-text">PandaGrad</span>
                </div>
                <div className="divider"></div>
            </div>
            <div className="menu-items">
                <NavLink to="/all-students" className="menu-item">
                    <FaUsers className="menu-icon" />
                    <span>All Students</span>
                </NavLink>
                <NavLink to="/analytics" className="menu-item">
                    <FaChartLine className="menu-icon" />
                    <span>Analytics</span>
                </NavLink>
                <NavLink to="/requests" className="menu-item">
                    <FaEnvelope className="menu-icon" />
                    <span>Requests</span>
                </NavLink>
                <NavLink to="/admin-settings" className="menu-item">
                    <FaCog className="menu-icon" />
                    <span>Admin Settings</span>
                </NavLink>
                <button onClick={handleLogout} className="menu-item logout-button">
                    <FaSignOutAlt className="menu-icon" />
                    <span>Logout</span>
                </button>
            </div>
            <div className="bottom-section">
                <img src="/images/faculty-logo.png" alt="Faculty Logo" className="faculty-logo" />
            </div>
        </div>
    );
}

export default SideNav;
