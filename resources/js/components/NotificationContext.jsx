import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import Pusher from "./pusher";

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [popupNotification, setPopupNotification] = useState(null);
    const [requests, setRequests] = useState([]);

    const normalizeNotifications = (rawNotifications) => {
        if (!rawNotifications) {
            return [];
        }
        // Ensure notifications are always in array format
        return Array.isArray(rawNotifications)
            ? rawNotifications
            : Object.values(rawNotifications);
    };

    const fetchNotifications = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.get('/api/notifications', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const normalized = normalizeNotifications(response.data);
            console.log("Fetched Notifications:", normalized);
            setNotifications(normalized);
            fetchUnreadCount(); // Ensure unread count is also updated
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    const fetchUnreadCount = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.get('/api/notifications/unread-count', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUnreadCount(response.data.unread_count);
        } catch (error) {
            console.error("Error fetching unread count:", error);
        }
    };

    const fetchRequests = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get('/api/progress-updates', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setRequests((prev) => {
                const areEqual = JSON.stringify(prev) === JSON.stringify(response.data);
                return areEqual ? prev : response.data;
            });
            console.log("Fetched Requests:", response.data);
        } catch (error) {
            console.error("Error fetching requests:", error);
        }
    };

    useEffect(() => {
        console.log("NotificationContext useEffect triggered");

        const storedUser = localStorage.getItem("user");
        const user = storedUser ? JSON.parse(storedUser) : null;
        const userRole = localStorage.getItem("role");
        const userId = userRole === "admin" ? "shared" : user?.id;

        if (!userId) {
            console.error("User ID is missing. Cannot subscribe to Pusher.");
            return;
        }

        console.log("Subscribing to Pusher channel for userId:", userId);

        // const fetchNotificationsAndRequests = async () => {
        //     await fetchNotifications();
        //     // Fetch the requests only if the user is on the Requests page
        //     //if (window.location.pathname.includes('requests')) {
        //     await fetchRequests();
        //     //}
        // };

        const channel = Pusher.subscribe(`private-RequestNotification${userId}`);
        channel.bind("App\\Events\\RequestNotification", async (data) => {
            console.log("Notification received via Pusher:", data);

            const notificationData = data.data || data;
            const notificationMessage = typeof notificationData.message === "string"
                ? notificationData.message
                : "Notification received";

            setPopupNotification(notificationMessage);

            // Fetch updated notifications and requests
            await fetchNotifications();
            if (window.location.pathname.includes('requests')) {
                await fetchRequests();
            }
        });

        return () => {
            console.log("Unsubscribing from Pusher channel");
            Pusher.unsubscribe(`private-RequestNotification${userId}`);
        };
    }, []);

    useEffect(() => {
        // Fetch notifications on component mount
        console.log("Fetching notifications on mount");
        fetchNotifications();
    }, []); // Effect for fetching notifications

    // useEffect(() => {
    //     fetchNotifications();

    //     const userId = localStorage.getItem("role") === "admin" ? "shared" : localStorage.getItem("id");
    //     const channel = Pusher.subscribe(`private-RequestNotification${userId}`);
    //     channel.bind("App\\Events\\RequestNotification", (data) => {
    //         console.log("Notification received via Pusher:", data);

    //         const notificationData = data.data || data; // Adjust based on the actual structure
    //         const notificationMessage = typeof notificationData.message === "string"
    //             ? notificationData.message
    //             : "Notification received";

    //         fetchNotifications(); // Refresh notifications
    //         setPopupNotification(notificationMessage);
    //     });

    //     return () => {
    //         Pusher.unsubscribe(`private-RequestNotification${userId}`);
    //     };
    // }, []);

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                setUnreadCount,
                popupNotification,
                setPopupNotification,
                setNotifications,
                fetchRequests,
                requests,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

// const NotificationContext = createContext();

// export const useNotifications = () => useContext(NotificationContext);

// export const NotificationProvider = ({ children }) => {
//     const [unreadCount, setUnreadCount] = useState(0);
//     const [notification, setNotification] = useState(null);

//     useEffect(() => {
//         const fetchUnreadCount = async () => {
//             const token = localStorage.getItem("token");
//             try {
//                 const response = await axios.get('/api/notifications/unread-count', {
//                     headers: {
//                         Authorization: `Bearer ${token}`,
//                     },
//                 });
//                 setUnreadCount(response.data.unread_count);
//             } catch (error) {
//                 console.error("Error fetching unread count:", error);
//             }
//         };

//         fetchUnreadCount();

//         const userId = localStorage.getItem("role") === "admin" ? "shared" : localStorage.getItem("id");
//         const channel = Pusher.subscribe(`private-RequestNotification${userId}`);
//         channel.bind("App\\Events\\RequestNotification", (data) => {
//             if (data.recipient_id !== userId) {
//                 console.log("Notification data received:", data); 
//                 //setNotification(data.message); // Show notification popup
//                 setNotification(typeof data.message === "string" ? data.message : data.message.message);
//                 fetchUnreadCount(); // Update unread count
//             }
//         });

//         return () => {
//             Pusher.unsubscribe(`private-RequestNotification${userId}`);
//         };
//     }, []);

//     return (
//         <NotificationContext.Provider value={{ unreadCount, setUnreadCount, notification, setNotification }}>
//             {children}
//         </NotificationContext.Provider>
//     );
// };