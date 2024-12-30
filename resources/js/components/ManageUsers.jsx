import React from 'react';
import { Link } from 'react-router-dom';
import './ManageUsers.css';

function ManageUsers() {
    return (
        <div className="page-container">
            <div className="breadcrumbs">
                <Link to="/admin/admin-settings">Admin Settings</Link>
                <span className="breadcrumbSeparator">&gt;</span>
                <span>Manage Users</span>
            </div>
            <h1>Manage Users</h1>
            <div className="settings-list">
                <Link to="/admin/admin-settings/manage-users/students" className="settings-item">
                    <span>Students</span> <span className="right-arrow">→</span>
                </Link>
                <Link to="/admin/admin-settings/manage-users/lecturers" className="settings-item">
                    <span>Lecturers</span> <span className="right-arrow">→</span>
                </Link>
                <Link to="/admin/admin-settings/manage-users/admins" className="settings-item">
                    <span>Admins</span> <span className="right-arrow">→</span>
                </Link>
            </div>
        </div>
    );
}

export default ManageUsers;