import React, { useState, useEffect } from 'react';
import SideNav from './SideNav';
import TopNav from './TopNav';
import { Outlet } from 'react-router-dom';
import './MainLayout.css';
import { useUser } from './UserContext';

function MainLayout() {
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

    // Set the username based on the role
    const userName = user?.role === 'admin' ? user?.Name : `${user?.first_name}`;

    return (
        <div className="main-layout">
            <SideNav />
            <div className="content">
                <TopNav
                    userName={userName}
                    profilePic={profilePic}
                    updateProfilePicture={updateProfilePicture} // Pass down the update function to TopNav
                />
                <div className="page-content">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}

export default MainLayout;
