import _ from "lodash";
window._ = _;

/**
 * We'll load the axios HTTP library which allows us to easily issue requests
 * to our Laravel back-end. This library automatically handles sending the
 * CSRF token as a header based on the value of the "XSRF" token cookie.
 */

import axios from "axios";
window.axios = axios;

window.axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

/**
 * Echo exposes an expressive API for subscribing to channels and listening
 * for events that are broadcast by Laravel. Echo and event broadcasting
 * allows your team to easily build robust real-time web applications.
 */

// import Echo from 'laravel-echo';

// import Pusher from 'pusher-js';
// window.Pusher = Pusher;

// window.Echo = new Echo({
//     broadcaster: 'pusher',
//     key: import.meta.env.VITE_PUSHER_APP_KEY,
//     cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER ?? 'mt1',
//     wsHost: import.meta.env.VITE_PUSHER_HOST ? import.meta.env.VITE_PUSHER_HOST : `ws-${import.meta.env.VITE_PUSHER_APP_CLUSTER}.pusher.com`,
//     wsPort: import.meta.env.VITE_PUSHER_PORT ?? 80,
//     wssPort: import.meta.env.VITE_PUSHER_PORT ?? 443,
//     forceTLS: (import.meta.env.VITE_PUSHER_SCHEME ?? 'https') === 'https',
//     enabledTransports: ['ws', 'wss'],
// });

// import Echo from 'laravel-echo';
// import Pusher from 'pusher-js';

// window.Pusher = Pusher;

// window.Echo = new Echo({
//     broadcaster: 'pusher',
//     key: process.env.PUSHER_APP_KEY,
//     cluster: process.env.PUSHER_APP_CLUSTER,
//     encrypted: true,
//     authEndpoint: '/broadcasting/auth', // Default is correct
//     auth: {
//         headers: {
//             Authorization: `Bearer ${localStorage.getItem('token')}`, // Pass the user token
//         },
//     },
// });

import Echo from "laravel-echo";
import Pusher from "pusher-js";

let echoInstance = null;

export const initializeEcho = () => {
    const token = localStorage.getItem("token");

    if (!token) {
        console.warn("Token not found. Echo will not be initialized.");
        return null;
    }

    console.log("Initializing Echo with token:", token);

    window.Pusher = Pusher;

    echoInstance = new Echo({
        broadcaster: "pusher",
        key: import.meta.env.VITE_PUSHER_APP_KEY || "de2033bbba1180bf7323", // Replace with your Pusher key
        cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || "ap1", // Replace with your Pusher cluster
        encrypted: true,
        authEndpoint: "/broadcasting/auth",
        auth: {
            headers: {
                Authorization: `Bearer ${token}`, // Attach token
            },
        },
    });

    window.Echo = echoInstance;
    return echoInstance;
};

export const getEchoInstance = () => {
    if (!echoInstance) {
        console.warn("Echo instance is not initialized yet.");
    }
    return echoInstance;
};
