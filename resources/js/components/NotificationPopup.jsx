import React from "react";
import "./NotificationPopup.css";

const NotificationPopup = ({ message, onClose }) => {
    return (
        <div className="notification-popup">
            {/* <p>{typeof message === "string" ? message : "Notification received"}</p> */}
            <p>{message || "New notification received"}</p>
            <button onClick={onClose}>Close</button>
        </div>
    );
};

export default NotificationPopup;