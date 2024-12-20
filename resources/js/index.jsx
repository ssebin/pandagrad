import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app';
import { BrowserRouter as Router } from 'react-router-dom';
import { UserProvider } from './components/UserContext';
import { StudentProvider } from './components/StudentContext';
import { NotificationProvider } from "./components/NotificationContext";
import {initializeEcho } from './bootstrap';
import { retrieveAndDecrypt } from "./components/storage";

const container = document.getElementById('app');
const root = createRoot(container);

const initializeApp = async () => {
    // Simulate waiting for token (if needed, replace this with actual logic)
    const token = retrieveAndDecrypt('token');
    if (!token) {
        console.warn('Token not found at app startup. Make sure it is set before rendering.');
    }

    // Initialize Echo once the token is available
    initializeEcho();

    // Render the app
    root.render(
        <UserProvider>
            <NotificationProvider>
                <StudentProvider>
                    <Router>
                        <App />
                    </Router>
                </StudentProvider>
            </NotificationProvider>
        </UserProvider>
    );
};

initializeApp();