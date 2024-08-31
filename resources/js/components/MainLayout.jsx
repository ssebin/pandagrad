import React from 'react';
import SideNav from './SideNav';
import TopNav from './TopNav';
import { Outlet } from 'react-router-dom';
import './MainLayout.css';
import { useUser } from './UserContext';

function MainLayout() {
    const { user } = useUser();

    return (
        <div className="main-layout">
            <SideNav />
            <div className="content">
                <TopNav userName={user?.Name} profilePic={user?.ProfilePic} />
                <div className="page-content">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}

export default MainLayout;
