/*
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import axios from './axiosConfig';

function GoogleLoginComponent() {
    const navigate = useNavigate();
    const { login } = useUser();

    useEffect(() => {
        const handleGoogleLogin = async (response) => {
            const { credential } = response;
            try {
                const backendResponse = await axios.post('/auth/google/callback', {
                    token: credential,
                });

                const { token, user } = backendResponse.data;

                if (token && user) {
                    localStorage.setItem('token', token);
                    login(user, token);
                    navigate('/admin/all-students');
                } else {
                    console.error('Failed to get token or user data.');
                }
            } catch (error) {
                console.error('Google login failed:', error.response?.data || error.message);
                alert('Google login failed: ' + (error.response?.data?.message || 'Unknown error'));
            }
        };

        const loadGoogleScript = () => {
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            document.body.appendChild(script);

            script.onload = () => {
                window.google.accounts.id.initialize({
                    client_id: '863771273231-mc3hcehuvnd1o64aeoc4lds0ubor2nkl.apps.googleusercontent.com',
                    callback: handleGoogleLogin
                });
                window.google.accounts.id.renderButton(
                    document.getElementById('googleSignInButton'),
                    { theme: 'outline', size: 'large' }
                );
            };
        };
        loadGoogleScript();
    }, [navigate, login]);

    return <div id="googleSignInButton"></div>;
}

export default GoogleLoginComponent;
*/