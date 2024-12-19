import axios from "axios";
import { callLogout } from "./UserContext";

const instance = axios.create({
    baseURL: "http://127.0.0.1:8000",
    headers: {
        "Content-Type": "application/json",
    },
});

// Interceptor for adding token to request headers
instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        //console.log('Request Config:', config);
        return config;
    },
    (error) => {
        console.error("Request Interceptor Error:", error); // Log interceptor error
        return Promise.reject(error);
    }
);

// Interceptor for handling response errors
instance.interceptors.response.use(
    (response) => response, // If the response is OK, simply return it
    async (error) => {
        const originalRequest = error.config;

        // If the error is 401 and it's not a login request, check for token expiry
        if (error.response && error.response.status === 401) {
            // Handle invalid login credentials (e.g., from /login request)
            if (originalRequest.url.includes("/login")) {
                alert("Invalid credentials. Please try again.");
                return Promise.reject(error); // No need to retry the request
            }

            // Only refresh token for non-login related 401 errors
            if (!originalRequest._retry) {
                originalRequest._retry = true;

                try {
                    const { data } = await instance.post("/api/refresh");
                    localStorage.setItem("token", data.token); // Update the token
                    originalRequest.headers.Authorization = `Bearer ${data.token}`;
                    return instance(originalRequest); // Retry the original request with new token
                } catch (err) {
                    console.error("Token refresh failed:", err);
                    alert("Session expired. Please log in again.");
                    localStorage.removeItem("token"); // Clear the token
                    window.location.href = "/login"; // Redirect to login
                    return Promise.reject(err);
                }
            }
        }

        // For other errors (not 401), handle them as needed
        return Promise.reject(error);
    }
);

// Interceptor for adding token to request headers
instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        const tokenTimestamp = localStorage.getItem("tokenTimestamp");
        const now = Date.now();

        const TOKEN_EXPIRY_TIME = 1 * 60 * 60 * 1000; // 1 hour in milliseconds
        if (
            tokenTimestamp &&
            now - parseInt(tokenTimestamp, 10) > TOKEN_EXPIRY_TIME
        ) {
            alert("Failed to Request. Session expired. Please log in again.");
            callLogout(); // Logout the user
            window.location.href = "/login";
            return Promise.reject(new Error("Token expired"));
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            localStorage.setItem("tokenTimestamp", now.toString()); // Reset timestamp on activity
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default instance;
