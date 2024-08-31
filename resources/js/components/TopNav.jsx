import React from 'react';
import './TopNav.css';

function TopNav({ userName, profilePic }) {
    return (
        <div className="top-nav">
            <div className="user-info">
                <img src={profilePic} alt="Profile" className="profile-pic" />
                <span className="user-name">{userName}</span>
            </div>
        </div>
    );
}

export default TopNav;
