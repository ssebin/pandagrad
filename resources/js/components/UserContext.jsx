import React, { createContext, useState, useContext, useEffect } from 'react';

const UserContext = createContext();

export function useUser() {
    return useContext(UserContext);
}

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true); // Loading state

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        const savedToken = localStorage.getItem('token');

        if (savedUser && savedToken) {
            setUser(JSON.parse(savedUser));
            setToken(savedToken);
        }
        setLoading(false); // Mark loading as done once data is retrieved
    }, []);

    const login = (userData, token, role) => {
        setUser({ ...userData, role });
        setToken(token);
        localStorage.setItem('user', JSON.stringify({ ...userData, role }));
        localStorage.setItem('token', token);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('has_study_plan');
        localStorage.removeItem('nationality');
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