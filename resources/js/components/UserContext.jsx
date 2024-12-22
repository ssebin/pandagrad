import React, { createContext, useState, useContext, useEffect } from 'react';
import { encryptAndStore, retrieveAndDecrypt } from "./storage";
import eventEmitter from './events';

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
        const tokenTimestamp = retrieveAndDecrypt('tokenTimestamp');
        if (!tokenTimestamp) {
            console.log('Token timestamp not found, skipping expiry check.');
            return; // Avoid logging out if the timestamp is missing
        }
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
        const token = retrieveAndDecrypt('token');
        if (token) {
            encryptAndStore('tokenTimestamp', Date.now().toString());
        }
    };

    useEffect(() => {
        const savedUser = retrieveAndDecrypt('user');
        const savedToken = retrieveAndDecrypt('token');
        const savedTimestamp = retrieveAndDecrypt('tokenTimestamp');

        console.log('Retrieved during initialization:', {
            user: savedUser,
            token: savedToken,
            tokenTimestamp: savedTimestamp,
        });

        if (savedUser && savedToken && savedTimestamp) {
            console.log('Auto-login detected. Setting user and token.');
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
    //             const updatedToken = retrieveAndDecrypt('token');
    //             if (!updatedToken) {
    //                 console.log('Token removed in another tab, logging out.');
    //                 setUser(null);
    //                 setToken(null);
    //                 localStorage.clear();
    //                 // Emit the clearNotifications event
    //                 eventEmitter.emit('clearNotifications');
    //             } else {
    //                 console.log('Token updated in another tab.');
    //                 eventEmitter.emit('clearNotifications');
    //                 setToken(updatedToken);
    //             }
    //         }

    //         if (event.key === 'user') {
    //             const updatedUser = retrieveAndDecrypt('user');
    //             setUser(updatedUser ? JSON.parse(updatedUser) : null);
    //         }
    //     };

    //     window.addEventListener('storage', handleStorageChange);

    //     return () => {
    //         window.removeEventListener('storage', handleStorageChange);
    //     };
    // }, []);

    const login = (userData, token, role) => {
        console.log('Storing user and token:', { userData, token, role });
        setUser({ ...userData, role });
        setToken(token);
        const timestamp = Date.now().toString();
        encryptAndStore('user', JSON.stringify({ ...userData, role }));
        encryptAndStore('role', role);
        encryptAndStore('token', token);
        encryptAndStore('tokenTimestamp', timestamp);

        const storedToken = retrieveAndDecrypt('token');
        console.log('Token retrieved after storing:', storedToken);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.clear();
        // Emit the clearNotifications event
        eventEmitter.emit('clearNotifications');
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
    console.trace('callLogout invoked. Global logout:', globalLogout);
    if (globalLogout) {
        globalLogout();
    }
}