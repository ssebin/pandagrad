import React, { useState, useEffect, useRef } from "react";
import { retrieveAndDecrypt } from "./storage";
import { useNavigate } from 'react-router-dom';
import './StudyPlanRegistration.css';

const StudyPlanRegistration = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        semesters_no: "",
        semesters: [],
    });

    const [tasksOptions, setTasksOptions] = useState([]);
    const [dropdownVisible, setDropdownVisible] = useState({}); // For tracking the dropdown state for each semester
    const [tempSelectedTasks, setTempSelectedTasks] = useState([]); // Temporary state for task selection
    const dropdownRefs = useRef({});

    useEffect(() => {
        const nationality = retrieveAndDecrypt('nationality');

        fetch('http://127.0.0.1:8000/api/tasks', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${retrieveAndDecrypt('token')}`,
            }
        })
            .then(response => response.json())
            .then(data => {
                console.log('Fetched tasks data:', data);

                // Sort tasks by ID before grouping them by category
                data.sort((a, b) => a.id - b.id);

                // Filter tasks based on nationality
                const filteredTasks = data.filter(task => {
                    // Exclude "Bahasa Melayu Course" (ID = 2) for Malaysians
                    if (task.id === 2 && nationality === "Malaysian") {
                        return false;
                    }
                    return true;
                });

                // Group tasks by category
                const categorizedTasks = filteredTasks.reduce((acc, task) => {
                    if (!acc[task.category]) {
                        acc[task.category] = [];
                    }
                    acc[task.category].push(task);
                    return acc;
                }, {});
                // Ensure each category has an array
                for (const category in categorizedTasks) {
                    if (!Array.isArray(categorizedTasks[category])) {
                        console.warn(`Expected array for category ${category}, got:`, categorizedTasks[category]);
                        categorizedTasks[category] = []; // Fallback to empty array
                    }
                }
                setTasksOptions(categorizedTasks); // Set categorized tasks
            })
            .catch(error => {
                console.error('Error fetching tasks:', error);
            });
    }, []);

    useEffect(() => {
        document.addEventListener("mousedown", handleOutsideClick);
        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, [dropdownVisible]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (name === "semesters_no") {
            const semestersArray = [];
            for (let i = 1; i <= value; i++) {
                semestersArray.push({ semester: i, tasks: [] });
            }
            setFormData({ ...formData, semesters_no: value, semesters: semestersArray });
        }
    };

    const handleDropdownToggle = (index) => {
        if (!dropdownVisible[index]) {
            // Load tasks into tempSelectedTasks when opening the dropdown
            setTempSelectedTasks(formData.semesters[index].tasks || []);
        }

        // Toggle dropdown visibility
        setDropdownVisible(prevState => ({
            ...prevState,
            [index]: !prevState[index],
        }));
    };

    const [selectedTasks, setSelectedTasks] = useState([]); // Track selected tasks

    const handleTaskChange = (task) => {
        setTempSelectedTasks(prevTasks => {
            if (prevTasks.find(t => t.id === task.id)) {
                return prevTasks.filter(t => t.id !== task.id);
            } else {
                return [...prevTasks, task];
            }
        });
    };

    const handleOutsideClick = (e) => {
        Object.keys(dropdownRefs.current).forEach((index) => {
            if (
                dropdownVisible[index] &&
                dropdownRefs.current[index] &&
                !dropdownRefs.current[index].contains(e.target)
            ) {
                // Close the dropdown
                setDropdownVisible((prevState) => ({
                    ...prevState,
                    [index]: false,
                }));
            }
        });
    };

    const handleApplyButton = (index) => {
        // Sort selected tasks by ID before saving to semester
        const sortedTasks = [...tempSelectedTasks].sort((a, b) => a.id - b.id);

        // Save the sorted tasks to the current semester
        setFormData(prevFormData => {
            const updatedSemesters = prevFormData.semesters.map((semester, i) => {
                if (i === index) {
                    return { ...semester, tasks: sortedTasks };
                }
                return semester;
            });
            return { ...prevFormData, semesters: updatedSemesters };
        });

        // Update selectedTasks to reflect the applied changes
        setSelectedTasks(sortedTasks);

        // Close the dropdown
        setDropdownVisible(prevState => ({
            ...prevState,
            [index]: false,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Flatten all task IDs from tasksOptions
        const allTasks = Object.values(tasksOptions).flat(); // Get all tasks as an array
        const allTaskIDs = allTasks.map(task => task.id);

        // Gather all selected task IDs across semesters
        const selectedTaskIDs = formData.semesters
            .flatMap(semester => semester.tasks.map(task => task.id));

        // Check if all tasks are selected
        const missingTaskIDs = allTaskIDs.filter(taskID => !selectedTaskIDs.includes(taskID));

        if (missingTaskIDs.length > 0) {
            // Find the names of missing tasks
            const missingTaskNames = allTasks
                .filter(task => missingTaskIDs.includes(task.id))
                .map(task => task.name);

            // Create a custom alert message
            const alertMessage = `The following tasks are missing:\n\n${missingTaskNames.join('\n')}\n\nPlease assign these tasks to a semester.`;
            alert(alertMessage);
            return;
        }

        if (formData.semesters.some(semester => semester.tasks.length === 0)) {
            alert("Please select at least one task for each semester.");
            return;
        }

        const updatedSemesters = formData.semesters.map(semester => ({
            semester: semester.semester,
            tasks: semester.tasks.map(task => task.id) // Only save task IDs
        }));

        // Add semesters_no to the payload
        const payload = {
            semesters_no: formData.semesters.length,
            semesters: updatedSemesters,
        };

        fetch('http://127.0.0.1:8000/api/student/study-plan', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${retrieveAndDecrypt('token')}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })
            .then(response => {
                // Check if the response is okay (status 200-299)
                if (!response.ok) {
                    // Log the status and text of the response if not successful
                    return response.text().then(text => {
                        throw new Error(`Request failed with status ${response.status}: ${text}`);
                    });
                }
                return response.json(); // Only parse as JSON if successful
            })
            .then(data => {
                console.log('Study plan saved successfully:', data);
                // Redirect to the completion page
                navigate('/student/registration-complete');
            })
            .catch(error => {
                console.error('Error saving study plan:', error);
            });
    };

    // const semesterOptions = [
    //     {
    //         label: "Courses",
    //         options: [
    //             { label: "Bahasa Melayu Course", value: "Bahasa Melayu Course" },
    //             { label: "Core Courses", value: "Core Courses" },
    //             { label: "Elective Courses", value: "Elective Courses" },
    //             { label: "Research Methodology Course", value: "Research Methodology Course" },
    //         ],
    //     },
    //     {
    //         label: "Research Proposal",
    //         options: [
    //             { label: "Research Proposal", value: "Research Proposal" },
    //         ],
    //     },
    //     {
    //         label: "Candidature Defence",
    //         options: [
    //             { label: "Candidature Defence", value: "Candidature Defence" },
    //         ], 
    //     },
    //     {
    //         label: "Dissertation",
    //         options: [
    //             { label: "Chapters 1, 2, and 3 of Dissertation", value: "Chapters 1, 2, and 3 of Dissertation" },
    //             { label: "All Chapters of Dissertation", value: "All Chapters of Dissertation" },
    //             { label: "Dissertation Submission for Examination", value: "Dissertation Submission for Examination" },
    //             { label: "Dissertation Submission After Correction", value: "Dissertation Submission After Correction" },
    //         ],
    //     },
    //     {
    //         label: "Committee of Examiners Meeting",
    //         options: [
    //             { label: "Committee of Examiners Meeting", value: "Committee of Examiners Meeting" },
    //         ],
    //     },
    //     {
    //         label: "Approval of Correction by JKIT",
    //         options: [
    //             { label: "Approval of Correction by JKIT", value: "Approval of Correction by JKIT" },
    //         ],
    //     },
    //     {
    //         label: "Senate Approval",
    //         options: [
    //             { label: "Senate Approval", value: "Senate Approval" },
    //         ],
    //     },
    //     {
    //         label: "Other Requirements",
    //         options: [
    //             { label: "Submission of Appointment of Supervisor Form", value: "Submission of Appointment of Supervisor Form" },
    //             { label: "Residential Requirement", value: "Residential Requirement" },
    //         ],
    //     },
    // ];

    return (
        <div className="studyplan-container">
            <div className="registration-left-section">
                {/* Logos */}
                <div className="logo-container">
                    <img src="/images/logo.png" alt="Logo" className="logo" />
                    <p className="logo-text">PandaGrad</p>
                    <img src="/images/faculty-logo.png" alt="Faculty Logo" className="faculty-logo" />
                </div>
                {/* 3D Illustration Image */}
                <img src="/images/registration-3d.png" alt="Illustration" className="registration-3d" />
            </div>

            <div className="registration-right-section">
                {/* Form */}
                <h1 className="registration-title">Study Plan Registration</h1>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="semesters_no">Number of Semesters<span style={{ color: 'red' }}> *</span></label>
                        <select
                            name="semesters_no"
                            id="semesters_no"
                            value={formData.semesters_no}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">Select Number of Semesters</option>
                            <option value="3">3 (Graduate on Time)</option>
                            <option value="4">4 (Graduate on Time)</option>
                            <option value="5">5 (Graduate on Time)</option>
                            <option value="6">6</option>
                            <option value="7">7</option>
                            <option value="8">8</option>
                        </select>
                    </div>

                    {/* Dynamic Semester Fields */}
                    {formData.semesters.map((semester, index) => (
                        <div key={index} className="form-group">
                            <label>Semester {index + 1}<span style={{ color: 'red' }}> *</span></label>
                            <div className="tasks-field" ref={(el) => (dropdownRefs.current[index] = el)}>
                                <div className={`dropdown ${dropdownVisible[index] ? 'show' : ''}`}>
                                    <button
                                        type="button"
                                        className="dropdown-button"
                                        onClick={() => handleDropdownToggle(index)}
                                    >
                                        Select Tasks <span className="dropdown-icon">+</span>
                                    </button>
                                    <div className="dropdown-content">
                                        {Object.keys(tasksOptions).map(category => (
                                            <div key={category}>
                                                <strong>{category}</strong>
                                                {Array.isArray(tasksOptions[category]) && tasksOptions[category].map(task => (
                                                    <label key={task.id} className="checkbox-label">
                                                        <input
                                                            type="checkbox"
                                                            name={`task-${index}-${task.id}`}
                                                            value={task.id}
                                                            checked={tempSelectedTasks.some(t => t.id === task.id)}
                                                            onChange={() => handleTaskChange(task)}
                                                        />
                                                        {task.name}
                                                    </label>
                                                ))}
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            className="apply-button"
                                            onClick={() => handleApplyButton(index)}
                                        >
                                            Apply
                                        </button>
                                    </div>

                                </div>

                                <div className="selected-tasks">
                                    {semester.tasks.length > 0
                                        ? semester.tasks.map(t => t.name).join(", ")
                                        : "No tasks selected"}
                                </div>
                            </div>
                        </div>
                    ))}

                    <button type="submit" className="submit-button">Next</button>
                </form>
            </div>
        </div>
    );
};

export default StudyPlanRegistration;
