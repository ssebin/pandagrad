import React, { useState, useContext } from 'react';
import styles from './Login.module.css';
import axios from './axiosConfig.js';
import { useNavigate } from 'react-router-dom';
import { StudentContext } from './StudentContext';
import { useUser } from './UserContext';
import { initializeEcho } from '../bootstrap';
import { useNotifications } from './NotificationContext';
import { encryptAndStore } from "./storage.js";
import '@fortawesome/fontawesome-free/css/all.min.css';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student'); // default to 'student'
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { login } = useUser();
    const { fetchStudentsData } = useContext(StudentContext);
    const { addPopupNotification } = useNotifications();

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
                const { token, user, role: returnedRole, unread_notifications } = response.data;

                if (token && user) {
                    console.log('Storing token and user data after manual login:', { token, user, role: returnedRole });

                    initializeEcho();

                    // Store additional user information for students only
                    if (returnedRole === 'student') {
                        encryptAndStore('has_study_plan', user.has_study_plan ? 'true' : 'false');
                        console.log('Stored has_study_plan:', user.has_study_plan ? 'true' : 'false');
                    }

                    login(user, token, returnedRole);

                    if (Array.isArray(unread_notifications)) {
                        unread_notifications.forEach((notification) => {
                            addPopupNotification({
                                id: notification.id,
                                message: notification.message,
                                type: notification.type,
                            });
                        });
                    }

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
                            alert('As this is your first time logging in, you will be redirected to the Registration page to set up your profile and study plan.');
                            navigate('/student/register');
                        }

                    } else {
                        console.error('Unknown user role:', returnedRole);
                    }
                    fetchStudentsData();
                } else {
                    console.error('Token or user data is missing in response data');
                }
            }
        } catch (error) {
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                const errorMessage = error.response?.data?.error || 'Unauthorized access. Your account may be deactivated.';
                console.log('Login failed:', errorMessage);
                //navigate('/unauthorized', { state: { message: errorMessage } });
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
            window.location.href = "http://127.0.0.1:8000/auth/google";
        } catch (error) {
            console.error('Google Login failed:', error.response?.data || error.message);
            setError('Google login failed. Please try again.');
        }
    };

    return (
        <div className={styles.loginContainer}>
            <div className={styles.leftSection}>
                <div className={styles.overlay}></div>
                <div className={styles.content}>
                    <img src="/images/fsktm.jpg" alt="FSKTM Background" className={styles.backgroundImage} />
                    <img src="/images/faculty-logo.png" alt="Faculty Logo" className={styles.facultyLogo} />
                    <p className={styles.description}>
                        A website to monitor Postgraduate students' progress in FSKTM, UM.
                    </p>
                </div>
            </div>
            <div className={styles.rightSection}>
                <div className={styles.contentWrapper}>
                    <img src="/images/logo.png" alt="Logo" className={styles.logo} />
                    <h1 className={styles.logoText}>PandaGrad</h1>
                    <p className={styles.tagline}>Log in to keep track of your progress and updates.</p>

                    <form onSubmit={handleSubmit}>
                        <div className={`${styles.formGroup} ${styles.inputWithIcon}`}>
                            <i className={`fa fa-user ${styles.icon}`}></i>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="Siswamail/UM Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className={`${styles.formGroup} ${styles.inputWithIcon}`}>
                            <i className={`fa fa-lock ${styles.icon}`}></i>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className={`${styles.formGroup} ${styles.inputWithIcon}`}>
                            <i className={`fa fa-users ${styles.icon}`}></i>
                            <select
                                id="role"
                                name="role"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                required
                            >
                                <option value="" disabled>Select your role</option>
                                <option value="student">Student</option>
                                <option value="lecturer">Lecturer</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <button type="submit" className={styles.loginButton}>Login</button>
                        <p className={styles.signupText}>
                            <b>Don’t have an account?</b><br></br>Please contact your faculty administrator.
                        </p>
                    </form>

                    <div className={styles.divider}>Or</div>
                    <button className={styles.googleLoginButton} onClick={handleGoogleLogin}>
                        <img src="/images/googlelogo.png" alt="Google Logo" />
                        Continue with Google
                    </button>

                    {error && <p className={styles.errorMessage}>{error}</p>}
                </div>
            </div>
        </div>
    );
}

export default Login;