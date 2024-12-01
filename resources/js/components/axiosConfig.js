/*
import axios from 'axios';

const token = localStorage.getItem('token');

const instance = axios.create({
    baseURL: 'http://127.0.0.1:8000',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`, // Ensure token is correctly set
    },
});

// Interceptor for adding token to request headers
instance.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log('Request Config:', config);
        return config;
    },
    error => {
        console.error('Request Interceptor Error:', error); // Log interceptor error
        return Promise.reject(error);
    }
);

// Interceptor for handling response errors
instance.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;
        console.error('Response Error Details:', {
            status: error.response ? error.response.status : 'No response status',
            data: error.response ? error.response.data : 'No response data',
        });

        // Handle token refresh on 401 errors
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // Prevent infinite loop

            try {
                const { data } = await instance.post('/api/refresh');
                console.log('New Token:', data.token);
                localStorage.setItem('token', data.token); // Update token in storage
                originalRequest.headers.Authorization = `Bearer ${data.token}`;
                return instance(originalRequest); // Retry the original request
            } catch (err) {
                console.error('Failed to refresh token:', {
                    status: err.response ? err.response.status : 'No response status',
                    data: err.response ? err.response.data : 'No response data',
                });
                localStorage.removeItem('token'); // Remove token if refresh fails
                return Promise.reject(err);
            }
        }
        return Promise.reject(error);
    }
);

export default instance;
*/
import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://127.0.0.1:8000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor for adding token to request headers
instance.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        //console.log('Request Config:', config);
        return config;
    },
    error => {
        console.error('Request Interceptor Error:', error); // Log interceptor error
        return Promise.reject(error);
    }
);

// Interceptor for handling response errors
instance.interceptors.response.use(
    response => response, // If the response is OK, simply return it
    async error => {
        const originalRequest = error.config;

        // If the error is 401 and it's not a login request, check for token expiry
        if (error.response && error.response.status === 401) {

            // Handle invalid login credentials (e.g., from /login request)
            if (originalRequest.url.includes('/login')) {
                alert('Invalid credentials. Please try again.');
                return Promise.reject(error); // No need to retry the request
            }

            // Only refresh token for non-login related 401 errors
            if (!originalRequest._retry) {
                originalRequest._retry = true;

                try {
                    const { data } = await instance.post('/api/refresh');
                    localStorage.setItem('token', data.token); // Update the token
                    originalRequest.headers.Authorization = `Bearer ${data.token}`;
                    return instance(originalRequest); // Retry the original request with new token
                } catch (err) {
                    console.error('Token refresh failed:', err);
                    alert('Session expired. Please log in again.');
                    localStorage.removeItem('token'); // Clear the token
                    window.location.href = '/login'; // Redirect to login
                    return Promise.reject(err);
                }
            }
        }

        // For other errors (not 401), handle them as needed
        return Promise.reject(error);
    }
);

export default instance;
