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
            {/* Add your Manage Users content here */}
        </div>
    );
}

export default ManageUsers;