import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import { useNotifications } from './NotificationContext';
import { encryptAndStore } from "./storage";

function ProcessLogin() {
    const navigate = useNavigate();
    const { login } = useUser();
    const { addPopupNotification } = useNotifications();

    useEffect(() => {
        // Extract the token from the query string
        const queryParams = new URLSearchParams(window.location.search);
        const token = queryParams.get('token');
        const role = queryParams.get('role');
        const unreadNotificationsEncoded = queryParams.get('unread_notifications');

        console.log('Token from URL:', token, 'Role:', role, 'Encoded Unread Notifications:', unreadNotificationsEncoded);

        // Decode and parse the unread notifications
        let unreadNotifications = [];
        if (unreadNotificationsEncoded) {
            try {
                unreadNotifications = JSON.parse(decodeURIComponent(unreadNotificationsEncoded));
                console.log('Decoded Unread Notifications:', unreadNotifications);
            } catch (error) {
                console.error('Failed to decode or parse unread_notifications:', error);
            }
        }

        if (token && role) {
            // Store the token in localStorage
            console.log('Storing token and role in localStorage:', token);
            encryptAndStore('token', token);
            encryptAndStore('role', role);

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

                        if (Array.isArray(unreadNotifications)) {
                            unreadNotifications.forEach((notification) => {
                                addPopupNotification({
                                    id: notification.id,
                                    message: notification.message,
                                    type: notification.type,
                                });
                            });
                        }

                        if (role === 'student') {
                            encryptAndStore('has_study_plan', userData.has_study_plan ? 'true' : 'false');
                            console.log('Stored has_study_plan:', userData.has_study_plan ? 'true' : 'false');
                        }

                        // Redirect the user to the correct page based on their role
                        if (role === 'admin') {
                            navigate('/admin/all-students');
                        } else if (role === 'lecturer_supervisor') {
                            navigate('/lecturer/supervisor/all-students');
                        } else if (role === 'lecturer_coordinator') {
                            navigate('/lecturer/coordinator/all-students');
                        } else if (role === 'lecturer_both') {
                            navigate('/lecturer/both/all-students');
                        } else if (userData && role === 'student') {
                            if (userData.has_study_plan) {
                                navigate('/student/my-progress');
                            } else {
                                navigate('/student/register');
                            }
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
            <p>Processing login...</p>
        </div>
    );
}

export default ProcessLogin;