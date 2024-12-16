import React, { useState, useEffect } from 'react';
import SideNav from './SideNav';
import TopNav from './TopNav';
import { Outlet } from 'react-router-dom';
import './MainLayout.css';
import { useUser } from './UserContext';
import { useNotifications } from "./NotificationContext";
import NotificationPopup from "./NotificationPopup";
import "./NotificationPopup.css";

function MainLayout() {
    const { unreadCount, popupNotifications, removePopupNotification } = useNotifications();
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

    useEffect(() => {
        // Set a timer for each notification to auto-dismiss after 10 seconds
        const timers = popupNotifications.map((_, index) =>
            setTimeout(() => removePopupNotification(index), 10000)
        );

        // Clear timers on unmount or if the notifications array changes
        return () => timers.forEach((timer) => clearTimeout(timer));
    }, [popupNotifications, removePopupNotification]);

    // Set the username based on the role
    const userName = user?.role === 'admin' ? user?.Name : `${user?.first_name}`;

    const MAX_VISIBLE_NOTIFICATIONS = 5;

    return (
        <div className="main-layout">
            <div className="notification-container">
                {popupNotifications.slice(0, MAX_VISIBLE_NOTIFICATIONS).map((notification, index) => (
                    <NotificationPopup
                        key={index}
                        message={notification.message}
                        type={notification.type}
                        onClose={() => removePopupNotification(index)}
                    />
                ))}
            </div>
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
