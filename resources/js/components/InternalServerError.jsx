import React from 'react';
import { Link } from 'react-router-dom';
import './InternalServerError.css';
import { FaExclamationTriangle } from 'react-icons/fa'; // Import warning icon

function InternalServerError() {
    return (
        <div className="error-container">
            <img src="/images/fsktm.jpg" alt="FSKTM Background" className="backgroundImage" />
            <div className="overlay"></div>
            <div className="error-content">
                <div className="error-icon">
                    <FaExclamationTriangle />
                </div>
                <h1 className="error-title">Internal Server Error</h1>
                <p className="error-message">Something went wrong on our end.<br></br>Please try again later.</p>
                <p className="error-contact">If the issue persists, contact the developer: <a href="mailto:hiimsebin1109@gmail.com">hiimsebin1109@gmail.com</a></p>
                <Link to="/" className="error-home-button">Go to homepage</Link>
            </div>
        </div>
    );
}

export default InternalServerError;