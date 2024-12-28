import React, { useRef, useEffect, useState, useContext } from "react";
import styles from "./UpdateDetailsModal.module.css";
import axios from "axios";
import { useNotifications } from "./NotificationContext";
import { StudentContext } from './StudentContext';
import { retrieveAndDecrypt } from "./storage";
import Select, { components } from 'react-select';

const UpdateDetailsModal = ({ update, onClose, userRole }) => {
    const [status, setStatus] = useState(update.status || "Pending");
    const [reason, setReason] = useState(update.reason || "");
    const [tasksOptions, setTasksOptions] = useState({});
    const modalRef = useRef(null);
    const { notifications, setNotifications, setUnreadCount } = useNotifications();
    const { tasks, fetchStudentsData } = useContext(StudentContext);

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

        // Ask for confirmation before saving
        const isConfirmed = window.confirm("Are you sure you want to save the changes?");
        if (!isConfirmed) {
            return; // If the user cancels, stop the save process
        }

        try {
            const token = retrieveAndDecrypt("token");
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
            //console.log('payload', payload);
            //console.log('url', url);

            const response = await axios.post(url, payload, {
                headers: {
                    Authorization: `Bearer ${token}`, // Attach the token
                    "Content-Type": "application/json", // Specify JSON content type
                },
            });

            await fetchStudentsData(); // Ensure the all students data is refreshed

            //console.log(response.data.message); // Debug API response
            onClose(); // Close the modal after success

        } catch (error) {
            if (error.response && error.response.status === 400) {
                alert(error.response.data.message); // Show "already approved" message
            } else {
                console.error('An error occurred:', error);
                alert('An unexpected error occurred.');
            }
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

    useEffect(() => {
        // Sort and group tasks by category
        tasks.sort((a, b) => a.id - b.id);
        const categorizedTasks = tasks.reduce((acc, task) => {
            if (!acc[task.category]) {
                acc[task.category] = [];
            }
            acc[task.category].push(task);
            return acc;
        }, {});

        setTasksOptions(categorizedTasks); // Set categorized tasks
    }, [tasks]);

    const markAsRead = async (progressUpdateId) => {
        const token = retrieveAndDecrypt("token");
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
            //console.log("Notification is already marked as read.");
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
        const token = retrieveAndDecrypt("token");
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
            //console.log("Notification marked as unread.");
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

    const groupedOptions = Object.keys(tasksOptions).map((category) => ({
        label: category,
        options: tasksOptions[category].map((task) => ({
            value: task.id,
            label: task.name,
        })),
    }));

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent} ref={modalRef}>
                <form onSubmit={handleSubmit}>
                    <label>Student Name</label>
                    <input type="text" value={update.student_name || "N/A"} readOnly />

                    <label>Update</label>
                    <input type="text" value={update.update_name || "N/A"} readOnly />

                    {update.student_status && (
                        <>
                            <label>Student Status</label>
                            <input type="text" value={update.student_status} readOnly />
                        </>
                    )}

                    {update.workshop_name && (
                        <>
                            <label>Name of the Workshop</label>
                            <input type="text" value={update.workshop_name} readOnly />
                        </>
                    )}

                    {update.max_sem && (
                        <>
                            <label>New Max. Period of Candidature</label>
                            <input type="text" value={update.max_sem} readOnly />
                        </>
                    )}

                    {update.updated_study_plan && (
                        <>
                            {/* Display the number of semesters */}
                            <label>Number of Semesters</label>
                            <input type="text" value={JSON.parse(update.updated_study_plan).length} readOnly />

                            {JSON.parse(update.updated_study_plan).map((semester, index) => {
                                const sortedTasks = semester.tasks.sort((a, b) => a - b); // Sort task IDs

                                // Build an array of selected task options for the semester
                                const selectedTasks = sortedTasks.map((taskId) => {
                                    // Ensure taskId is of the same type as t.id
                                    const normalizedTaskId = String(taskId); // Convert to string if needed

                                    const taskOption = Object.values(tasksOptions)
                                        .flat()
                                        .find((t) => String(t.id) === normalizedTaskId); // Compare as strings

                                    // If taskOption is found, construct the option object
                                    return taskOption
                                        ? { value: taskOption.id, label: taskOption.name }
                                        : { value: normalizedTaskId, label: `Task ID: ${normalizedTaskId}` };
                                });

                                return (
                                    <div key={index}>
                                        <label>Semester {semester.semester}</label>
                                        <Select
                                            isMulti
                                            options={groupedOptions}
                                            value={selectedTasks}
                                            isDisabled={true} // Makes the select read-only
                                            components={{ IndicatorSeparator: () => null }}
                                            styles={{
                                                control: (provided, state) => ({
                                                    ...provided,
                                                    backgroundColor: '#f9f9f9',
                                                    marginTop: '10px',
                                                    marginBottom: '15px',
                                                  
                                                    paddingLeft: '3px',
                                                    border: '1px solid #E2E8F0',
                                                    borderRadius: '10px',
                                                    fontSize: '0.8em',
                                                    width: '100%',
                                                    boxShadow:
                                                        state.isFocused
                                                            ? '0 0 0 1px #192e59'
                                                            : '0 4px 4px rgba(0, 0, 0, 0.1)',
                                                    '&:hover': {
                                                        borderColor: '#E2E8F0',
                                                    },
                                                }),
                                                input: (provided) => ({
                                                    ...provided,
                                                    margin: '0px',
                                                    fontSize: '1em',
                                                }),
                                                valueContainer: (provided) => ({
                                                    ...provided,
                                                    padding: '10px 10px',
                                                }),
                                                multiValue: (provided) => ({
                                                    ...provided,
                                                    backgroundColor: '#f0f0f0',
                                                }),
                                                multiValueLabel: (provided) => ({
                                                    ...provided,
                                                    color: '#333',
                                                    fontSize: '1em',
                                                }),
                                                multiValueRemove: (provided) => ({
                                                    ...provided,
                                                    color: '#666',
                                                    ':hover': {
                                                        backgroundColor: '#e91e255b',
                                                        color: '#333',
                                                    },
                                                }),
                                                option: (provided, state) => ({
                                                    ...provided,
                                                    backgroundColor: state.isSelected
                                                        ? '#3182ce'
                                                        : state.isFocused
                                                            ? '#ebf8ff'
                                                            : 'white',
                                                    color: state.isSelected ? 'white' : 'black',
                                                    padding: '10px',
                                                }),
                                                menu: (provided) => ({
                                                    ...provided,
                                                    borderRadius: '10px',
                                                    marginTop: '5px',
                                                }),
                                                menuList: (provided) => ({
                                                    ...provided,
                                                    padding: '14px',
                                                    fontSize: '0.8em',
                                                }),
                                            }}
                                        />
                                    </div>
                                );
                            })}
                        </>
                    )}

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
                            <label>Grade</label>
                            <input type="text" value={update.grade} readOnly />
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

                    <label>Update Status<span style={{ color: 'red' }}> *</span></label>
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