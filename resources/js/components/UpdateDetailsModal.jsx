import React, { useRef, useEffect, useState } from "react";
import styles from "./UpdateDetailsModal.module.css";
import axios from "axios";
import { useNotifications } from "./NotificationContext";

const UpdateDetailsModal = ({ update, onClose, userRole }) => {
    const [status, setStatus] = useState(update.status || "Pending");
    const [reason, setReason] = useState(update.reason || "");
    const modalRef = useRef(null);
    const { notifications, setNotifications, setUnreadCount } = useNotifications();

    const handleClickOutside = (event) => {
        if (modalRef.current && !modalRef.current.contains(event.target)) {
            onClose(); // Close the modal when clicking outside
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (status === "Rejected" && !reason) {
            alert("Please fill in the Reason for Rejection.");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            // Construct the API endpoint based on the status
            let url = `/api/progress-updates/${update.id}/`;
            if (status === "Approved") {
                url += "approve";
            } else if (status === "Rejected") {
                url += "reject";
            } else if (status === "Pending") {
                url += "pending";
            }

            // Construct the payload
            const payload = status === "Rejected" ? { reason } : {};
            console.log('payload', payload);
            console.log('url', url);

            const response = await axios.post(url, payload, {
                headers: {
                    Authorization: `Bearer ${token}`, // Attach the token
                    "Content-Type": "application/json", // Specify JSON content type
                },
            });

            console.log(response.data.message); // Debug API response
            onClose(); // Close the modal after success

        } catch (error) {
            console.error("Error details:", error.response?.data, error.message);
            alert("An error occurred. Please try again.");
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (update && update.id) {
            markAsRead(update.id);
        }
    }, [update]);

    // const markAsRead = async (progressUpdateId) => {
    //     const token = localStorage.getItem("token");
    //     if (!progressUpdateId) {
    //         console.error("Progress Update ID is missing. Cannot mark as read.");
    //         return;
    //     }

    //     console.log("Notifications Type:", typeof notification, "Value:", notification);

    //     if (!Array.isArray(notificatios)) {
    //         console.error("Notification is not an array.");
    //         return;
    //     }

    //     const noti = noti.find(
    //         (noti) => noti.progress_update_id === progressUpdateId
    //     );

    //     if (noti && noti.read_at) {
    //         console.log("Notification is already marked as read.");
    //         return;
    //     }
    //     try {
    //         await axios.post(`/api/notifications/mark-as-read/${progressUpdateId}`, {}, {
    //             headers: {
    //                 Authorization: `Bearer ${token}`,
    //             },
    //         });
    //         console.log("Notification marked as read.");

    //         const unreadResponse = await axios.get('/api/notifications/unread-count', {
    //             headers: {
    //                 Authorization: `Bearer ${token}`,
    //             },
    //         });

    //         setNotification((prevNotifications) =>
    //             prevNotifications.map((noti) =>
    //                 noti.progress_update_id === progressUpdateId
    //                     ? { ...noti, read_at: new Date().toISOString() }
    //                     : noti
    //             )
    //         );

    //         // setUnreadCount((prevUnreadCount) => {
    //         //     const isUnread = notifications.some(
    //         //         (notification) =>
    //         //             notification.progress_update_id === progressUpdateId &&
    //         //             !notification.read_at
    //         //     );
    //         //     return isUnread ? prevUnreadCount - 1 : prevUnreadCount;
    //         // });

    //         setUnreadCount(unreadResponse.data.unread_count);
    //     } catch (error) {
    //         console.error("Error marking notification as read:", error);
    //     }
    // };

    const markAsRead = async (progressUpdateId) => {
        const token = localStorage.getItem("token");
        if (!progressUpdateId) {
            console.error("Progress Update ID is missing.");
            return;
        }

        if (!Array.isArray(notifications)) {
            console.error("Notifications is not an array.");
            return;
        }

        const notification = notifications.find(
            (noti) => noti.progress_update_id === progressUpdateId
        );

        if (notification && notification.read_at) {
            console.log("Notification is already marked as read.");
            return;
        }

        try {
            await axios.post(`/api/notifications/mark-as-read/${progressUpdateId}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setNotifications((prevNotifications) =>
                prevNotifications.map((noti) =>
                    noti.progress_update_id === progressUpdateId ? { ...noti, read_at: new Date().toISOString() } : noti
                )
            );

            const unreadResponse = await axios.get('/api/notifications/unread-count', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUnreadCount(unreadResponse.data.unread_count);
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const handleMarkAsUnread = async (progressUpdateId) => {
        const token = localStorage.getItem("token");
        if (!progressUpdateId) {
            console.error("Progress Update ID is missing. Cannot mark as unread.");
            return;
        }

        if (!Array.isArray(notifications)) {
            console.error("Notifications is not an array.");
            return;
        }

        try {
            await axios.post(`/api/notifications/mark-as-unread/${progressUpdateId}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log("Notification marked as unread.");
            // Update local state if needed
            setNotifications((prevNotifications) =>
                prevNotifications.map((noti) =>
                    noti.progress_update_id === progressUpdateId
                        ? { ...noti, read_at: null }
                        : noti
                )
            );

            // setUnreadCount((prevUnreadCount) => {
            //     const isRead = notification.some(
            //         (noti) =>
            //             noti.progress_update_id === progressUpdateId &&
            //             noti.read_at
            //     );
            //     return isRead ? prevUnreadCount + 1 : prevUnreadCount;
            // });

            // Fetch the latest unread count from the backend
            const unreadResponse = await axios.get('/api/notifications/unread-count', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // Update unread count using the backend response
            setUnreadCount(unreadResponse.data.unread_count);
        } catch (error) {
            console.error("Error marking notification as unread:", error);
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent} ref={modalRef}>
                <form onSubmit={handleSubmit}>
                    <label>Student Name</label>
                    <input type="text" value={update.student_name || "N/A"} readOnly />

                    <label>Update</label>
                    <input type="text" value={update.update_name || "N/A"} readOnly />

                    {update.cgpa && (
                        <>
                            <label>CGPA</label>
                            <input type="text" value={update.cgpa} readOnly />
                        </>
                    )}

                    {update.num_courses && (
                        <>
                            <label>Number of Courses</label>
                            <input type="text" value={update.num_courses} readOnly />
                        </>
                    )}

                    {[...Array(5)].map((_, index) => {
                        const courseName = update[`course_name_${index + 1}`];
                        const grade = update[`grade_${index + 1}`];
                        if (courseName) {
                            return (
                                <React.Fragment key={index}>
                                    <label>{`Course ${index + 1} (Grade)`}</label>
                                    <input type="text" value={`${courseName} (${grade || "N/A"})`} readOnly />
                                </React.Fragment>
                            );
                        }
                        return null;
                    })}

                    {update.supervisor_name && (
                        <>
                            <label>Supervisor</label>
                            <input type="text" value={update.supervisor_name} readOnly />
                        </>
                    )}

                    {update.research_topic && (
                        <>
                            <label>Research Topic</label>
                            <input type="text" value={update.research_topic} readOnly />
                        </>
                    )}

                    {update.progress_status && (
                        <>
                            <label>Progress Status</label>
                            <input type="text" value={update.progress_status} readOnly />
                        </>
                    )}

                    {update.grade && (
                        <>
                            <label>New Max. Period of Candidature</label>
                            <input type="text" value={update.grade} readOnly />
                        </>
                    )}

                    {update.max_sem && (
                        <>
                            <label>Grade</label>
                            <input type="text" value={update.max_sem} readOnly />
                        </>
                    )}

                    {update.residential_college && (
                        <>
                            <label>Residential College</label>
                            <input type="text" value={update.residential_college} readOnly />
                        </>
                    )}

                    {update.start_date && (
                        <>
                            <label>Start Date</label>
                            <input type="text" value={new Date(update.start_date).toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" })} readOnly />
                        </>
                    )}

                    {update.end_date && (
                        <>
                            <label>End Date</label>
                            <input type="text" value={new Date(update.end_date).toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" })} readOnly />
                        </>
                    )}

                    {update.panels && (
                        <>
                            <label>Panels</label>
                            <textarea type="text" value={update.panels} readOnly />
                        </>
                    )}
                    {update.chairperson && (
                        <>
                            <label>Chairperson</label>
                            <textarea type="text" value={update.chairperson} readOnly />
                        </>
                    )}
                    {(update.pd_date || update.cd_date) && (
                        <>
                            <label>Date</label>
                            <input type="text" value={new Date(update.pd_date || update.cd_date).toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" })} readOnly />
                        </>
                    )}
                    {(update.pd_time || update.cd_time) && (
                        <>
                            <label>Time</label>
                            <input type="text" value={new Date(`1970-01-01T${update.pd_time || update.cd_time}:00`).toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "numeric",
                                hour12: true,
                            })} readOnly />
                        </>
                    )}
                    {(update.pd_venue || update.cd_venue) && (
                        <>
                            <label>Venue</label>
                            <textarea type="text" value={update.pd_venue || update.cd_venue} readOnly />
                        </>
                    )}

                    <label>Evidence</label>
                    {update.evidence ? (
                        <a
                            href={`/storage/${update.evidence.path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.evidenceLink}
                        >
                            {update.evidence.name}
                        </a>
                    ) : (
                        <input type="text" value="N/A" readOnly />
                    )}

                    <label>Link</label>
                    {update.link ? (
                        <a
                            href={update.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.evidenceLink}
                        >
                            {update.link}
                        </a>
                    ) : (
                        <input type="text" value="N/A" readOnly />
                    )}

                    <label>Description</label>
                    <textarea value={update.description || "N/A"} readOnly />

                    <label>Completion Date</label>
                    <input type="text" value={new Date(update.completion_date).toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" })} readOnly />

                    <label>Status<span style={{ color: 'red' }}> *</span></label>
                    {userRole === "admin" ? (
                        <select value={status} onChange={(e) => setStatus(e.target.value)}>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Pending">Pending</option>
                        </select>
                    ) : (
                        <input type="text" value={status} readOnly />
                    )}

                    {status === "Rejected" && (
                        <>
                            <label>Reason for Rejection<span style={{ color: 'red' }}> *</span></label>
                            {userRole === "admin" ? (
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Enter reason for rejection"
                                    required
                                />
                            ) : (
                                <textarea value={reason} readOnly />
                            )}
                        </>
                    )}

                    <div className={styles.buttons}>
                        <button type="button" className={styles.cancelButton} onClick={onClose}>
                            Close
                        </button>
                        {userRole === "admin" && (
                            <button type="submit" className={styles.saveButton}>
                                Update
                            </button>
                        )}
                        <button type="button" className={styles.unreadButton} onClick={() => handleMarkAsUnread(update.id)}>
                            Unread
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdateDetailsModal;