import React from 'react';
import { Link } from 'react-router-dom';
import './ProgramStructures.css';

function ProgramStructures() {
    return (
        <div className="page-container">
            <div className="breadcrumbs">
                <Link to="/admin/admin-settings">Admin Settings</Link>
                <span className="breadcrumbSeparator">&gt;</span>
                <span>Program Structures</span>
            </div>
            <h1>Program Structures</h1>
            {/* Add your Program Structures content here */}
        </div>
    );
}

export default ProgramStructures;
