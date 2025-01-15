import axios from "axios";
import { callLogout } from "./UserContext";
import { encryptAndStore, retrieveAndDecrypt } from "./storage";
import { useNavigate } from "react-router-dom";

const instance = axios.create({
    baseURL: "https://pandagrad.com",
    headers: {
        "Content-Type": "application/json",
    },
});

// Interceptor for adding token to request headers
instance.interceptors.request.use(
    (config) => {
        const token = retrieveAndDecrypt("token");
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
                    encryptAndStore("token", data.token); // Securely encrypt and store the token
                    originalRequest.headers.Authorization = `Bearer ${data.token}`;
                    return instance(originalRequest); // Retry the original request with new token
                } catch (err) {
                    console.error("Token refresh failed:", err);
                    alert("Session expired. Please log in again.");
                    callLogout();
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
        const token = retrieveAndDecrypt("token");
        const tokenTimestamp = retrieveAndDecrypt("tokenTimestamp");
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
            encryptAndStore("tokenTimestamp", now.toString()); // Reset timestamp on activity
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor for handling response errors
instance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 500) {
            // Redirect to Internal Server Error page
            //window.location.href = "/internal-server-error";
        } else if (error.response && (error.response.status === 403)) {
            // Redirect to Unauthorized page
            alert('Your account does not exist or has been deactivated.');
            console.error('Forbidden: Access denied.');
            window.location.href = '/unauthorized';
        }
        return Promise.reject(error);
    }
);

export default instance;
