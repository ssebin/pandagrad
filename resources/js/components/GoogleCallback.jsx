import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';

function GoogleCallback() {
    const navigate = useNavigate();
    const { login } = useUser();

    useEffect(() => {
        // Extract the token from the query string
        const queryParams = new URLSearchParams(window.location.search);
        const token = queryParams.get('token');
        const role = queryParams.get('role');
        console.log('Token from URL:', token, 'Role:', role);

        if (token && role) {
            // Store the token in localStorage
            console.log('Storing token and role in localStorage:', token);
            localStorage.setItem('token', token);
            localStorage.setItem('role', role);  

            // Fetch user data from the backend using the token
            fetch('http://127.0.0.1:8000/api/me', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            })
            .then(response => response.json())
            .then(userData => {
                if (userData) {
                    console.log('User data:', userData);
                    // Store user data and token in context
                    login(userData, token, role);

                    // Redirect the user to the correct page based on their role
                    if (role === 'admin') {
                        navigate('/admin/all-students');
                    } else if (role === 'lecturer_supervisor' || 'lecturer_coordinator' || 'lecturer_both') {
                        navigate('/admin/all-students');
                    } else if (role === 'student') {
                        navigate('/student/my-progress');
                    } else {
                        console.error('Unknown user role:', userData.role);
                    }
                } else {
                    console.error('Failed to retrieve user data');
                }
            })
            .catch(error => {
                console.error('Error fetching user data:', error);
            });
        } else {
            console.error('No token found in URL');
        }
    }, [login, navigate]);

    return (
        <div>
            <p>Processing Google login...</p>
        </div>
    );
}

export default GoogleCallback;
