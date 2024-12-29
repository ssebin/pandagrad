import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { initializeEcho } from '../bootstrap';
import { v4 as uuidv4 } from 'uuid';
import { useUser } from './UserContext';
import { encryptAndStore, retrieveAndDecrypt } from "./storage.js";
import eventEmitter from './events';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

// Helper function to manage displayed IDs in localStorage
const getDisplayedNotifications = () => {
    const storedIds = retrieveAndDecrypt('displayedNotifications');
    return storedIds ? new Set(JSON.parse(storedIds)) : new Set();
};

const saveDisplayedNotifications = (ids) => {
    encryptAndStore('displayedNotifications', JSON.stringify([...ids]));
};

const fetchUnreadNotifications = async (addPopupNotification) => {
    console.log('Fetching unread notifications since last login');
    const token = retrieveAndDecrypt('token');
    if (!token) {
        console.warn('Token is missing. NotificationContext not initialized.');
        return;
    }
    const displayedNotifications = getDisplayedNotifications(); // Get previously displayed IDs

    try {
        const response = await axios.get('/api/notifications/since-last-login', {
            headers: { Authorization: `Bearer ${token}` },
        });

        const unreadNotifications = response.data;
        console.log('Unread Notifications:', unreadNotifications);

        if (Array.isArray(unreadNotifications)) {
            unreadNotifications.forEach((notification) => {
                // Check if the notification ID has already been displayed
                if (!displayedNotifications.has(notification.id)) {
                    displayedNotifications.add(notification.id); // Mark as displayed

                    addPopupNotification({
                        id: notification.id || uuidv4(), // Ensure unique ID
                        message: notification.message,
                        type: notification.type,
                    });
                    console.log('Notification added:', notification);
                }
            });

            // Persist updated IDs in localStorage
            saveDisplayedNotifications(displayedNotifications);
        } else {
            console.log('No unread notifications received.');
        }
    } catch (error) {
        console.error('Error fetching unread notifications:', error);
    }
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [popupNotifications, setPopupNotifications] = useState([]);
    const [visibleNotifications, setVisibleNotifications] = useState([]);
    const [allNotifications, setAllNotifications] = useState([]);
    const [requests, setRequests] = useState([]);
    const { token } = useUser();

    // const addPopupNotification = (notification) => {
    //     setPopupNotifications((prev) => {
    //         // Allow all notifications, even beyond 5
    //         return [...prev, notification];
    //     });
    // };
    const MAX_VISIBLE_NOTIFICATIONS = 5;

    const addPopupNotification = (notification) => {
        const newNotification = { ...notification, id: uuidv4() };

        setPopupNotifications((prev) => [...prev, newNotification]);
        setVisibleNotifications((prev) => {
            const nextVisible = [...prev, newNotification].slice(0, MAX_VISIBLE_NOTIFICATIONS);
            return nextVisible;
        });
    };

    // Remove a notification by ID
    // const removePopupNotification = (id) => {
    //     console.log(`RPN Removing notification with ID: ${id}`);
    //     setPopupNotifications((prev) => prev.filter((n) => n.id !== id));
    //     setVisibleNotifications((prev) => prev.filter((n) => n.id !== id));
    // };

    const removePopupNotification = (id) => {
        console.log(`RPN Removing notification with ID: ${id}`);

        // Update the popupNotifications list
        setPopupNotifications((prev) => {
            const updated = prev.filter((n) => n.id !== id);
            console.log("Updated popupNotifications:", updated);

            // Update visible notifications immediately with correct pending logic
            setVisibleNotifications((prev) => {
                const updatedVisible = prev.filter((n) => n.id !== id);

                // Find the next pending notification from updated list
                const nextPending = updated.find(
                    (n) => !updatedVisible.some((v) => v.id === n.id)
                );

                if (nextPending) {
                    return [...updatedVisible, nextPending].slice(0, MAX_VISIBLE_NOTIFICATIONS);
                }

                return updatedVisible;
            });

            return updated; // Return the updated list for popupNotifications
        });
    };

    const clearAllNotifications = () => {
        console.log("Clearing all notifications");
        setPopupNotifications([]);
        setVisibleNotifications([]);
    };

    useEffect(() => {
        // Listen for the clearNotifications event
        const clearListener = () => clearAllNotifications();

        eventEmitter.on('clearNotifications', clearListener);

        // Cleanup the listener on unmount
        return () => {
            eventEmitter.off('clearNotifications', clearListener);
        };
    }, []);

    // const removePopupNotification = (id) => {
    //     setPopupNotifications((prev) => prev.filter((n) => n.id !== id));
    // };

    // const removePopupNotification = (id) => {
    //     setVisibleNotifications((prev) => prev.filter((n) => n.id !== id));

    //     // Show pending notifications when slots open up
    //     setPopupNotifications((prev) => {
    //         const nextNotifications = prev.slice(1); // Remove first pending notification
    //         if (nextNotifications.length > 0) {
    //             setVisibleNotifications((current) => [
    //                 ...current,
    //                 nextNotifications[0],
    //             ]);
    //         }
    //         return nextNotifications;
    //     });
    // };

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
        if (!token) {
            console.warn('Token is missing. NotificationContext not initialized.');
            return;
        }
        try {
            const response = await axios.get('/api/notifications', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const normalized = normalizeNotifications(response.data);
            console.log("Fetched Notifications:", normalized);
            setNotifications(normalized);
            await fetchUnreadCount(); // Ensure unread count is also updated
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    const fetchUnreadCount = async () => {
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
        if (!token) {
            console.warn('Token is missing. NotificationContext not initialized.');
            return;
        }
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
            fetchUnreadCount();
        } catch (error) {
            console.error("Error fetching requests:", error);
        }
    };

    // const fetchUnreadNotifications = async () => {
    //     const token = localStorage.getItem('token');
    //     try {
    //         const response = await axios.get('/api/notifications/unread', {
    //             headers: {
    //                 Authorization: `Bearer ${token}`,
    //             },
    //         });

    //         // Assuming the nested structure is in response.data.notifications
    //         const unreadNotifications = response.data;

    //         // Check if notifications exist and iterate through them
    //         if (unreadNotifications && typeof unreadNotifications === 'object') {
    //             Object.values(unreadNotifications).forEach((notification) => {
    //                 addPopupNotification({
    //                     message: notification.message,
    //                     type: notification.type,
    //                 });
    //             });
    //         } else {
    //             console.log('No unread notifications received.');
    //         }
    //     } catch (error) {
    //         console.error('Error fetching unread notifications:', error);
    //     }
    // };

    // useEffect(() => {
    //     const token = localStorage.getItem('token');
    //     if (!token) {
    //         console.warn('Token is missing. NotificationContext not initialized.');
    //         return;
    //     }

    //     fetchUnreadNotifications(addPopupNotification);

    //     const initializeNotifications = async () => {
    //         console.log("Initializing NotificationContext");

    //         // Fetch initial data
    //         await Promise.all([fetchNotifications(), fetchRequests(), fetchUnreadCount()]);

    //         // Ensure Echo is initialized
    //         const echo = initializeEcho();

    //         if (!echo) {
    //             console.error('Echo instance is not initialized. Cannot subscribe to channels.');
    //             return;
    //         }

    //         const storedUser = localStorage.getItem('user');
    //         const user = storedUser ? JSON.parse(storedUser) : null;
    //         const userRole = localStorage.getItem('role');
    //         const userId = userRole === 'admin' ? 'shared' : user?.id;

    //         if (!userId) {
    //             console.error('User ID is missing. Cannot subscribe to Echo.');
    //             return;
    //         }

    //         console.log('Subscribing to Echo channel for userId:', userId);

    //         const channel = echo.private(`RequestNotification${userId}`);
    //         //console.log('Channel:', channel);

    //         channel.listen('RequestNotification', async (data) => {
    //             console.log('Notification received via Echo:', data);

    //             const { message, type } = data.data || {};

    //             // Fallback for safety if type or message are missing
    //             const notificationMessage = message || 'Notification received';
    //             const notificationType = type || 'info'; // Default to 'info'

    //             // Update popup notification state with message and type
    //             addPopupNotification({ message: notificationMessage, type: notificationType });

    //             // Fetch updated notifications and requests only when needed
    //             await fetchNotifications();
    //             if (window.location.pathname.includes('requests')) {
    //                 await fetchRequests();
    //             }
    //         });
    //     };

    //     initializeNotifications();
    // }, []);

    // useEffect(() => {
    //     const token = localStorage.getItem('token');
    //     if (token) {
    //         initializeEcho(); // Reinitialize Echo when token changes
    //     }
    // }, [localStorage.getItem('token')]); // Watch for token changes

    // useEffect(() => {
    //     fetchUnreadNotifications(addPopupNotification);
    // }, []); 


    useEffect(() => {    
        if (!token) {
            console.warn('Token is missing. NotificationContext not initialized.');
            return;
        }

        fetchUnreadNotifications(addPopupNotification);

        const initializeContext = async () => {
            const role = retrieveAndDecrypt('role');
            const storedUser = retrieveAndDecrypt('user');

            if (!role) {
                console.warn('Role is missing. NotificationContext not initialized.');
                return;
            }

            if (!storedUser) {
                console.warn('User data is missing. NotificationContext not initialized.');
                return;
            }

            console.log('Initializing NotificationContext for new session');

            // Clear previous Echo subscriptions
            if (window.Echo) {
                console.log('Unsubscribing from all Echo channels');
                Object.keys(window.Echo.connector.channels).forEach((channelName) => {
                    console.log(`Leaving channel: ${channelName}`);
                    window.Echo.leave(channelName);
                });
            }

            // Initialize Echo
            const echo = initializeEcho();
            if (!echo) {
                console.error('Echo instance is not initialized. Cannot subscribe to channels.');
                return;
            }

            const user = JSON.parse(storedUser);
            const userId = role === 'admin' ? 'shared' : user?.id;

            if (!userId) {
                console.error('User ID is missing. Cannot subscribe to Echo.');
                return;
            }

            console.log(`Subscribing to Echo channel for userId: ${userId}`);

            const channel = echo.private(`RequestNotification${userId}`);
            channel.listen('RequestNotification', async (data) => {
                console.log('Notification received via Echo:', data);

                const { message, type } = data.data || {};
                const notificationMessage = message || 'Notification received';
                const notificationType = type || 'info';

                addPopupNotification({ message: notificationMessage, type: notificationType });

                // Fetch updated data
                await Promise.all([fetchNotifications(), fetchRequests()]);
            });

            // Fetch initial data for the logged-in user
            await Promise.all([
                fetchNotifications(),
                fetchRequests(),
            ]);
        };

        initializeContext();

        // Cleanup
        return () => {
            if (window.Echo) {
                console.log('Unsubscribing from all Echo channels');
                Object.keys(window.Echo.connector.channels).forEach((channelName) => {
                    console.log(`Leaving channel: ${channelName}`);
                    window.Echo.leave(channelName);
                });
            }
        };
    }, [token]); // Runs whenever the token changes

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                setUnreadCount,
                addPopupNotification,
                setPopupNotifications,
                visibleNotifications,
                popupNotifications,
                setNotifications,
                fetchRequests,
                requests,
                removePopupNotification: (id) => {
                    setPopupNotifications((prev) => prev.filter((n) => n.id !== id));
                    setVisibleNotifications((prev) => prev.filter((n) => n.id !== id));
                },
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};
