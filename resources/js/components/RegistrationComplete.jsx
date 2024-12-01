import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import './RegistrationComplete.css';

const RegistrationComplete = () => {
    const navigate = useNavigate(); // Use useNavigate instead of useHistory

    // Set has_study_plan in local storage when component mounts
    useEffect(() => {
        localStorage.setItem('has_study_plan', 'true'); // Set to true when registration is complete
    }, []);

    return (
        <div className="registration-complete-container">
            <div className="registration-left-section">
                {/* Logos */}
                <div className="logo-container">
                    <img src="/images/logo.png" alt="Logo" className="logo" />
                    <p className='logo-text'>PandaGrad</p>
                    <img src="/images/faculty-logo.png" alt="Faculty Logo" className="faculty-logo" />
                </div>
                {/* 3D Illustration Image */}
                <img src="/images/thumbs-up.png" alt="Illustration" className="thumbs-up" />
            </div>

            <div className="registration-right-section">
                <h2 className='welcome'>Study Plan Created Successfully</h2>
                <p className="complete-details">Your study plan has been created. You may request to change the study plan in the future if required.</p>
                <button type="submit" className="registration-complete-button" onClick={() => navigate('/student/my-progress')}>Go to My Progress</button>
            </div>
        </div>
    );
};

export default RegistrationComplete;