import React, { createContext, useState, useContext, useEffect } from 'react';

const UserContext = createContext();

let globalLogout = null;

export function useUser() {
    return useContext(UserContext);
}

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    const TOKEN_EXPIRY_TIME = 1 * 60 * 60 * 1000; // 1 hour in milliseconds

    const checkTokenExpiry = () => {
        const tokenTimestamp = localStorage.getItem('tokenTimestamp');
        if (tokenTimestamp) {
            const now = Date.now();
            const isExpired = now - parseInt(tokenTimestamp, 10) > TOKEN_EXPIRY_TIME;
            if (isExpired) {
                logout();
                alert('Session expired due to inactivity. Please log in again.');
            }
        }
    };

    const resetTokenExpiry = () => {
        const token = localStorage.getItem('token');
        if (token) {
            localStorage.setItem('tokenTimestamp', Date.now().toString());
        }
    };

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        const savedToken = localStorage.getItem('token');

        if (savedUser && savedToken) {
            setUser(JSON.parse(savedUser));
            setToken(savedToken);
        }
        setLoading(false); // Mark loading as done once data is retrieved

        // Set up expiry check interval
        const interval = setInterval(checkTokenExpiry, 60000); // Check every minute
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Listen for user activity to reset expiry
        window.addEventListener('mousemove', resetTokenExpiry);
        window.addEventListener('keydown', resetTokenExpiry);

        return () => {
            window.removeEventListener('mousemove', resetTokenExpiry);
            window.removeEventListener('keydown', resetTokenExpiry);
        };
    }, []);


    useEffect(() => {
        globalLogout = logout;
    }, []);

    // To make other tabs log out if the user logs out in one tab (requires refresh)
    // useEffect(() => {
    //     const handleStorageChange = (event) => {
    //         if (event.key === 'token') {
    //             const updatedToken = localStorage.getItem('token');
    //             setToken(updatedToken);

    //             if (!updatedToken) {
    //                 setUser(null); // Clear user if token is removed
    //             }
    //         }

    //         if (event.key === 'user') {
    //             const updatedUser = localStorage.getItem('user');
    //             setUser(updatedUser ? JSON.parse(updatedUser) : null);
    //         }
    //     };

    //     window.addEventListener('storage', handleStorageChange);

    //     return () => {
    //         window.removeEventListener('storage', handleStorageChange);
    //     };
    // }, []);

    const login = (userData, token, role) => {
        setUser({ ...userData, role });
        setToken(token);
        const timestamp = Date.now().toString();
        localStorage.setItem('user', JSON.stringify({ ...userData, role }));
        localStorage.setItem('token', token);
        localStorage.setItem('tokenTimestamp', timestamp);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.clear();
    };

    // Prevent rendering children while loading
    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <UserContext.Provider value={{ user, token, setUser, login, logout, loading }}>
            {children}
        </UserContext.Provider>
    );
}

export function callLogout() {
    if (globalLogout) {
        globalLogout();
    }
}