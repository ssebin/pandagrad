import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app';
import { BrowserRouter as Router } from 'react-router-dom';
import { UserProvider } from './components/UserContext';
import { StudentProvider } from './components/StudentContext';
import { NotificationProvider } from "./components/NotificationContext";

const container = document.getElementById('app');
const root = createRoot(container);

root.render(
    <NotificationProvider>
        <UserProvider>
            <StudentProvider>
                <Router>
                    <App />
                </Router>
            </StudentProvider>
        </UserProvider>
    </NotificationProvider>
);
