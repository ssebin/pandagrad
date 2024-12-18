import React, { createContext, useState, useContext, useEffect } from 'react';

const UserContext = createContext();

export function useUser() {
    return useContext(UserContext);
}

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        const savedToken = localStorage.getItem('token');

        if (savedUser && savedToken) {
            setUser(JSON.parse(savedUser));
            setToken(savedToken);
        }
        setLoading(false); // Mark loading as done once data is retrieved
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
        localStorage.setItem('user', JSON.stringify({ ...userData, role }));
        localStorage.setItem('token', token);
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