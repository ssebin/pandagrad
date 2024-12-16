// import React from "react";
// import "./NotificationPopup.css";

// const NotificationPopup = ({ message, onClose }) => {
//     return (
//         <div className="notification-popup">
//             {/* <p>{typeof message === "string" ? message : "Notification received"}</p> */}
//             <p>{message || "New notification received"}</p>
//             <button onClick={onClose}>Close</button>
//         </div>
//     );
// };

// export default NotificationPopup;

import React, { useEffect, useState } from "react";
import "./NotificationPopup.css";
import { FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaInfoCircle, FaRegPaperPlane } from "react-icons/fa";

const NotificationPopup = ({ message, type, onClose }) => {
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => Math.max(prev - 1, 0));
        }, 100); // Decrease 1% every 100ms

        // Clear interval when notification is removed
        return () => clearInterval(interval);
    }, []);

    const notificationConfig = {
        success: { icon: <FaCheckCircle />, colorClass: "green" },
        warning: { icon: <FaExclamationTriangle />, colorClass: "yellow" },
        error: { icon: <FaTimesCircle />, colorClass: "red" },
        info: { icon: <FaInfoCircle />, colorClass: "blue" },
        request: { icon: <FaRegPaperPlane />, colorClass: "purple" },
    };

    const { icon, colorClass } = notificationConfig[type] || notificationConfig.info;

    return (
        <div className={`notification-popup ${colorClass}`}>
            <div className="icon">{icon}</div>
            <p className="message">{message || "New notification received"}</p>
            <button className="close-btn" onClick={onClose}>
                &times;
            </button>
            <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
    );
};

export default NotificationPopup;