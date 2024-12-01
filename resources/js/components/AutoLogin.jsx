import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import Login from './Login';

function AutoLogin() {
    const { login, user } = useUser();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        const savedToken = localStorage.getItem('token');
        const savedRole = localStorage.getItem('role');
        const hasStudyPlan = localStorage.getItem('has_study_plan') === 'true'; // Fetch flag from localStorage
    
        if (savedUser && savedToken && savedRole) {
            console.log('Auto-login detected. Logging in user automatically...');
            login(JSON.parse(savedUser), savedToken, savedRole);
    
            // Redirect based on the saved role and hasStudyPlan flag
            if (savedRole === 'admin') {
                navigate('/admin/all-students');
            } else if (savedRole === 'lecturer_supervisor') {
                navigate('/lecturer/supervisor/all-students');
            } else if (savedRole === 'lecturer_coordinator') {
                navigate('/lecturer/coordinator/all-students');
            } else if (savedRole === 'lecturer_both') {
                navigate('/lecturer/both/all-students');
            } else if (savedRole === 'student') {
                if (hasStudyPlan) {
                    navigate('/student/my-progress');
                } else {
                    // Redirect to default page to restart login
                    localStorage.clear(); // Clear localStorage to allow new login
                    navigate('/');
                }
            }
        } else {
            setLoading(false); // No auto-login possible, show the login page
        }
    }, [login, navigate]);

    if (loading) {
        return <div>Trying to autologin...</div>;
    }

    return <Login />;
}

export default AutoLogin;