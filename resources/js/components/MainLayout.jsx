import React, { useState, useEffect } from 'react';
import SideNav from './SideNav';
import TopNav from './TopNav';
import { Outlet } from 'react-router-dom';
import './MainLayout.css';
import { useUser } from './UserContext';
import { useNotifications } from "./NotificationContext";
import NotificationPopup from "./NotificationPopup";

function MainLayout() {
    const { unreadCount, popupNotification, setPopupNotification } = useNotifications();
    const { user } = useUser();
    const [profilePic, setProfilePic] = useState(user?.profile_pic || "");

    const updateProfilePicture = (newProfilePic) => {
        setProfilePic(newProfilePic);
        const updatedUserData = { ...JSON.parse(localStorage.getItem("user")), profile_pic: newProfilePic };
        localStorage.setItem("user", JSON.stringify(updatedUserData));
    };

    useEffect(() => {
        const handleStorageChange = () => {
            const updatedUser = JSON.parse(localStorage.getItem("user"));
            setProfilePic(updatedUser?.profile_pic || "");
        };

        // Listen for changes in local storage
        window.addEventListener("storage", handleStorageChange);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };
    }, []);

    useEffect(() => {
        setProfilePic(user?.profile_pic || "");
    }, [user]);

    // useEffect(() => {
    //     const fetchUnreadCount = async () => {
    //         const token = localStorage.getItem("token");
    //         try {
    //             const response = await axios.get('/api/notifications/unread-count', {
    //                 headers: {
    //                     Authorization: `Bearer ${token}`,
    //                 },
    //             });
    //             setUnreadCount(response.data.unread_count);
    //         } catch (error) {
    //             console.error("Error fetching unread count:", error);
    //         }
    //     };

    //     fetchUnreadCount();

    //     const userId = user.role === "admin" ? "shared" : user.id;
    //     const channel = Pusher.subscribe(`private-RequestNotification${userId}`);
    //     channel.bind("App\\Events\\RequestNotification", (data) => {
    //         if (data.recipient_id !== userId) { // Skip notifications triggered by the logged-in user
    //             setNotification(data.message); // Set the notification message
    //             fetchUnreadCount();
    //         }
    //     });

    //     return () => {
    //         Pusher.unsubscribe(`private-RequestNotification${user.id}`);
    //     };

    // }, [user]);

    useEffect(() => {
        if (popupNotification) {
            const timer = setTimeout(() => setPopupNotification(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [popupNotification]);

    // Set the username based on the role
    const userName = user?.role === 'admin' ? user?.Name : `${user?.first_name}`;

    return (
        <div className="main-layout">
            {popupNotification && (
                <NotificationPopup
                    message={popupNotification}
                    onClose={() => setPopupNotification(null)}
                />
            )}
            <SideNav unreadCount={unreadCount} />
            <div className="content">
                <TopNav
                    userName={userName}
                    profilePic={profilePic}
                    updateProfilePicture={updateProfilePicture}
                />
                <div className="page-content">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}

export default MainLayout;
