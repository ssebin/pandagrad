import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from './UserContext';

function ProtectedRoute({ children, role }) {
    const { user, token, loading } = useUser();

    // Wait until the loading is complete
    if (loading) {
        return <div>Loading...</div>; // Show a loading indicator while waiting
    }

    // Wait until the user data is loaded
    // if (user === null && token === null) {
    //     // Optionally, check for a loading state
    //     return <div>Loading...</div>; // Or a spinner/placeholder
    // }

    // Redirect to login if user or token is not available
    if (user === null || token === null || role ==null ) {
        return <Navigate to="/" replace />;
    }

    // Check if the user's role matches the required role for this route
    if (role && user.role !== role) {
        // Redirect to an unauthorized page or homepage if the role doesn't match
        return <Navigate to="/unauthorized" replace />;
    }

    // If the user is authenticated, allow access to the route
    return children;
}

export default ProtectedRoute;