import React, { useState } from 'react';
import './Login.css';
import axios from './axiosConfig.js'; // Ensure this is correctly configured
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student'); // default to 'student'
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { login } = useUser();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            alert('Please fill in all fields.');
            return;
        }

        try {
            const response = await axios.post('/api/login', {
                UMEmail: email,
                password: password,
                role: role,
            });

            //console.log("Response:", response);

            if (response.status === 200) {
                const { token, user, role: returnedRole } = response.data;

                if (token && user) {
                    // Store the token and user role in localStorage
                    localStorage.setItem('token', token);
                    localStorage.setItem('role', returnedRole);

                    // Store additional user information for students only
                    if (returnedRole === 'student') {
                        localStorage.setItem('has_study_plan', user.has_study_plan);
                    }

                    login(user, token, returnedRole);

                    // Redirect based on the role like in ProcessLogin.jsx
                    if (returnedRole === 'admin') {
                        navigate('/admin/all-students');
                    } else if (returnedRole === 'lecturer_supervisor') {
                        navigate('/lecturer/supervisor/all-students');
                    } else if (returnedRole === 'lecturer_coordinator') {
                        navigate('/lecturer/coordinator/all-students');
                    } else if (returnedRole === 'lecturer_both') {
                        navigate('/lecturer/both/all-students');
                    } else if (user && returnedRole === 'student') {
                        if (user.has_study_plan) {
                            navigate('/student/my-progress');
                        } else {
                            navigate('/student/register');
                        }

                    } else {
                        console.error('Unknown user role:', returnedRole);
                    }
                } else {
                    console.error('Token or user data is missing in response data');
                }
            }
        } catch (error) {
            if (error.response && error.response.status === 401) {
                // Show popup with error message for invalid credentials
                console.error('Login failed:', error);
            } else {
                // Handle other types of errors
                console.error('Login failed:', error);
                alert('An error occurred during login. Please try again later.');
            }
        }
    };

    const handleGoogleLogin = () => {
        try {
            // Redirect the user to the Google login via the backend
            window.location.href = "http://127.0.0.1:8000/auth/google"; // This is handled by your backend
        } catch (error) {
            console.error('Google Login failed:', error.response?.data || error.message);
            setError('Google login failed. Please try again.');
        }
    };

    return (
        <div className="login-container">
            <div className="left-section">
                <img src="/images/logo.png" alt="Logo" className="logo" />
                <p className='logo-text'>PandaGrad</p>
                <img src="/images/faculty-logo.png" alt="Faculty Logo" className="faculty-logo" />
                <h2 className='welcome'>Welcome Back!</h2>

                {/* Traditional Login Form */}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Siswamail/UM Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="role">Role</label>
                        <select
                            id="role"
                            name="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            required
                        >
                            <option value="student">Student</option>
                            <option value="lecturer">Lecturer</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <button type="submit" className="login-button">Login</button>
                        <button className="google-login-button" onClick={handleGoogleLogin}>
                            <img src="/images/googlelogo.png" alt="Google Logo" />
                            Google SSO
                        </button>
                    </div>
                </form>

                {/* Display error message if there is any */}
                {error && <p className="error-message">{error}</p>}
            </div>

            <div className="right-section">
                <img src="/images/login-3d.png" alt="Login 3D Image" className="login-3d" />
            </div>
        </div>
    );
}

export default Login;