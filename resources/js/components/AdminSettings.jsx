import React from 'react';
import { Link } from 'react-router-dom';
import './AdminSettings.css';

function AdminSettings() {
    return (
        <div className="page-container">
            <h1>Admin Settings</h1>
            <div className="settings-list">
                <Link to="/admin-settings/manage-users" className="settings-item">
                    <span>Manage Users</span> <span className="right-arrow">→</span>
                </Link>
                <Link to="/admin-settings/semester-settings" className="settings-item">
                    <span>Semester Settings</span> <span className="right-arrow">→</span>
                </Link>
                <Link to="/admin-settings/program-structures" className="settings-item">
                    <span>Program Structures</span> <span className="right-arrow">→</span>
                </Link>
            </div>
        </div>
    );
}

export default AdminSettings;
