import React, { useState } from 'react';
import './Login.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('admin');
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

            if (response.status === 200) {
                alert('Login successful');
                login(response.data.admin);
                navigate('/all-students'); 
            }
        } catch (error) {
            console.error('Login failed:', error.response.data); 
            alert('Login failed: ' + (error.response.data.message || 'Unknown error'));
        }
    };

    return (
        <div className="login-container">
            <div className="left-section">
                <img src="/images/logo.png" alt="Logo" className="logo" />
                <p className='logo-text'>PandaGrad</p>
                <img src="/images/faculty-logo.png" alt="Faculty Logo" className="faculty-logo" />
                <h2 className='welcome'>Welcome Back!</h2>
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
                    <button type="submit" className="login-button">Login</button>
                </form>
                <p className="forgot-password">
                    Forgot Password? <a href="/reset-password">Reset Password</a>
                </p>
            </div>
            <div className="right-section">
                <img src="/images/login-3d.png" alt="Login 3D Image" className="login-3d" />
            </div>
        </div>
    );
}

export default Login;
