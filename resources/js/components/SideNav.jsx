import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './SideNav.css';
import { FaUsers, FaChartLine, FaEnvelope, FaCog, FaSignOutAlt, FaBook, FaAngleDoubleLeft, FaAngleDoubleRight } from 'react-icons/fa';
import { useUser } from './UserContext';
import { useNotifications } from "./NotificationContext";

function SideNav() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { user, logout, loading } = useUser();
    const navigate = useNavigate();
    const { unreadCount } = useNotifications();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const toggleCollapse = () => {
        setIsCollapsed((prev) => !prev);
    };

    if (loading) {
        return <div>Loading...</div>; // Show a loading state while data is being fetched
    }

    if (!user) {
        return <div>No user logged in</div>; // If user is null, handle it accordingly
    }

    // console.log('User Role:', user.role); // Log the role to debug

    return (
        <div className={`side-nav ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="top-section">
                <div className="logo-container">
                    <img src="/images/logo.png" alt="Logo" className="logo" />
                    {!isCollapsed && (
                        <span className="logo-text">PandaGrad</span>
                    )}
                </div>
                <div className="divider"></div>
            </div>
            <div className="menu-items">
                {/* Admin can view All Students, Analytics, Requests, and Admin Settings */}
                {user.role === 'admin' && (
                    <>
                        <NavLink to="/admin/all-students" className="menu-item">
                            <FaUsers className="menu-icon" />
                            {!isCollapsed && <span>All Students</span>}
                        </NavLink>
                        <NavLink to="/admin/analytics" className="menu-item">
                            <FaChartLine className="menu-icon" />
                            {!isCollapsed && <span>Analytics</span>}
                        </NavLink>
                        <NavLink to="/admin/requests" className="menu-item">
                            <FaEnvelope className="menu-icon" />
                            {!isCollapsed && (
                                <span>
                                    Requests {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                                </span>
                            )}
                        </NavLink>
                        <NavLink to="/admin/admin-settings" className="menu-item">
                            <FaCog className="menu-icon" />
                            {!isCollapsed &&
                                <span>Admin Settings</span>
                            }
                        </NavLink>
                    </>
                )}

                {/* Lecturer Supervisor: View All Students and Requests */}
                {user.role === 'lecturer_supervisor' && (
                    <>
                        <NavLink to="/lecturer/supervisor/all-students" className="menu-item">
                            <FaUsers className="menu-icon" />
                            {!isCollapsed &&
                                <span>All Students</span>
                            }
                        </NavLink>
                        <NavLink to="/lecturer/supervisor/requests" className="menu-item">
                            <FaEnvelope className="menu-icon" />
                            {!isCollapsed && (
                                <span>
                                    Requests {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                                </span>
                            )}
                        </NavLink>
                    </>
                )}

                {/* Lecturer Coordinator: View Analytics and Requests */}
                {user.role === 'lecturer_coordinator' && (
                    <>
                        <NavLink to="/lecturer/coordinator/all-students" className="menu-item">
                            <FaUsers className="menu-icon" />
                            {!isCollapsed &&
                                <span>All Students</span>
                            }
                        </NavLink>
                        <NavLink to="/lecturer/coordinator/analytics" className="menu-item">
                            <FaChartLine className="menu-icon" />
                            {!isCollapsed &&
                                <span>Analytics</span>
                            }
                        </NavLink>
                    </>
                )}

                {/* Lecturer Both: View All Students, Analytics, and Requests */}
                {user.role === 'lecturer_both' && (
                    <>
                        <NavLink to="/lecturer/both/all-students" className="menu-item">
                            <FaUsers className="menu-icon" />
                            {!isCollapsed &&
                                <span>All Students</span>
                            }
                        </NavLink>
                        <NavLink to="/lecturer/both/analytics" className="menu-item">
                            <FaChartLine className="menu-icon" />
                            {!isCollapsed &&
                                <span>Analytics</span>
                            }
                        </NavLink>
                        <NavLink to="/lecturer/both/requests" className="menu-item">
                            <FaEnvelope className="menu-icon" />
                            {!isCollapsed && (
                                <span>
                                    Requests {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                                </span>
                            )}
                        </NavLink>
                    </>
                )}

                {/* Students can view My Progress and Requests */}
                {user.role === 'student' && (
                    <>
                        <NavLink to="/student/my-progress" className="menu-item">
                            <FaBook className="menu-icon" />
                            {!isCollapsed &&
                                <span>My Progress</span>
                            }
                        </NavLink>
                        <NavLink to="/student/requests" className="menu-item">
                            <FaEnvelope className="menu-icon" />
                            {!isCollapsed && (
                                <span>
                                    Requests {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                                </span>
                            )}
                        </NavLink>
                    </>
                )}

                {/* Logout Button */}
                <button onClick={handleLogout} className="menu-item logout-button">
                    <FaSignOutAlt className="menu-icon" />
                    {!isCollapsed &&
                        <span>Logout</span>
                    }
                </button>
            </div>
            <div className="bottom-section">
                {!isCollapsed &&
                    <img src="/images/faculty-logo.png" alt="Faculty Logo" className="faculty-logo" />
                }
                {/* {isCollapsed &&
                    <img src="/images/um-logo.png" alt="UM Logo" className="um-logo" />
                } */}
            </div>
            <button className="collapse-button" onClick={toggleCollapse}>
                {isCollapsed ? <FaAngleDoubleRight /> : <FaAngleDoubleLeft />}
            </button>
        </div>
    );
}

export default SideNav;
