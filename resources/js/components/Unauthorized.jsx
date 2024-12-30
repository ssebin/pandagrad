import React from 'react';
import { Link } from 'react-router-dom';
import './Unauthorized.css';
import { FaBan } from 'react-icons/fa';

function Unauthorized() {
    return (
        <div className="unauthorized-container">
            <img src="/images/fsktm.jpg" alt="FSKTM Background" className="backgroundImage" />
            <div className="overlay"></div>
            <div className="unauthorized-content">
                <div className="unauthorized-icon">
                    <FaBan />
                </div>
                <h1 className="unauthorized-title">Access Denied</h1>
                <p className="unauthorized-message">You do not have the permission to proceed.</p>
                <Link to="/" className="unauthorized-home-button">Go to homepage</Link>
            </div>
        </div>
    );
}

export default Unauthorized;