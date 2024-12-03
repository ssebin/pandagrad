import React, { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import { useUser } from "./UserContext"; // Import the UserContext
import { StudentContext } from './StudentContext';
import axios from "./axiosConfig"; // Import axios instance
import './RegistrationComplete.css';

const RegistrationComplete = () => {
    const navigate = useNavigate(); 
    const { fetchStudentsData } = useContext(StudentContext);
    const { setUser } = useUser();

    useEffect(() => {
        // Set has_study_plan in local storage
        localStorage.setItem('has_study_plan', 'true');

        // Fetch the updated user details
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token'); // Get the token from localStorage
                const headers = { Authorization: `Bearer ${token}` };

                const response = await axios.get('/api/me', { headers }); // API endpoint to fetch user details
                const updatedUser = response.data;

                // Update the user context and localStorage
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));

                console.log('Updated user data fetched:', updatedUser);
            } catch (error) {
                console.error('Failed to fetch updated user data:', error);
            }
        };

        fetchUserData(); 
        fetchStudentsData();
    }, [setUser]);

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