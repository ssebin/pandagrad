import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app';
import { BrowserRouter as Router } from 'react-router-dom';
import { UserProvider } from './components/UserContext';

const container = document.getElementById('app');
const root = createRoot(container);

root.render(
  <React.StrictMode>
      <UserProvider>
          <Router>
              <App />
          </Router>
      </UserProvider>
  </React.StrictMode>
);
