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

import React, { useEffect, useState, useRef } from "react";
import "./NotificationPopup.css";
import { FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaInfoCircle, FaRegPaperPlane } from "react-icons/fa";

const NotificationPopup = ({ id, message, type, onClose }) => {
    const [progress, setProgress] = useState(100);
    const intervalRef = useRef(null);
    const timeoutRef = useRef(null);
    const onCloseRef = useRef(onClose); // Store onClose in a ref for stability

    // Update the ref if onClose changes
    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        console.log(`Notification ${id} Timer Started`);

        // Start progress bar decrement
        intervalRef.current = setInterval(() => {
            setProgress((prev) => Math.max(prev - 1, 0));
        }, 100);

        // Set timeout to auto-close the notification
        timeoutRef.current = setTimeout(() => {
            console.log(`Notification ${id} Timer Finished`);
            onCloseRef.current(id); // Use the ref for stability
        }, 10000);

        // Cleanup only when the component is unmounted
        return () => {
            console.log(`Notification ${id} Cleanup`);
            clearInterval(intervalRef.current);
            clearTimeout(timeoutRef.current);
        };
    }, [id]);

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
            <button className="close-btn" onClick={() => onClose(id)}>
                &times;
            </button>
            <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
    );
};

export default NotificationPopup;