import React, { useState, useEffect, useRef, useContext } from "react";
import { retrieveAndDecrypt } from "./storage";
import { useNavigate } from 'react-router-dom';
import styles from "./StudyPlanRegistration.module.css";
import Select, { components } from 'react-select';
import { StudentContext } from './StudentContext';
import { use } from "react";
import { useUser } from './UserContext';

const StudyPlanRegistration = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        semesters_no: "",
        semesters: [],
    });

    const [tasksOptions, setTasksOptions] = useState([]);
    const [dropdownVisible, setDropdownVisible] = useState({}); // For tracking the dropdown state for each semester
    const [tempSelectedTasks, setTempSelectedTasks] = useState([]); // Temporary state for task selection
    const dropdownRefs = useRef({});
    const [selectedTasksPerSemester, setSelectedTasksPerSemester] = useState({});
    const [tempSelectedTasksPerSemester, setTempSelectedTasksPerSemester] = useState({});

    const { tasksByIntake, fetchTasks } = useContext(StudentContext);

    const nationality = user.nationality;
    const intakeId = user.intake_id;

    useEffect(() => {
        setSelectedTasksPerSemester({});
        setTempSelectedTasksPerSemester({});

        if (!intakeId) {
            console.error('User does not have an intake_id');
            return;
        }

        // Fetch tasks for the user's intake if not already fetched
        if (!tasksByIntake[intakeId]) {
            fetchTasks(intakeId);
        }
        console.log('Tasks by intake:', tasksByIntake);
    }, [intakeId, tasksByIntake, fetchTasks]);

    useEffect(() => {
        if (!intakeId) {
            console.error('User does not have an intake_id');
            return;
        }

        const tasks = tasksByIntake[intakeId];

        if (tasks) {
            // Tasks are available, proceed to set tasksOptions

            // Filter tasks based on nationality
            const filteredTasks = tasks.filter(task => {
                // Exclude "Bahasa Melayu Course" for Malaysians
                if (task.unique_identifier === "bahasa_melayu_course" && nationality === "Malaysian") {
                    return false;
                }
                return true;
            });

            // Sort tasks by ID before grouping them by category
            filteredTasks.sort((a, b) => a.id - b.id);

            // Group tasks by category
            const categorizedTasks = filteredTasks.reduce((acc, task) => {
                if (!acc[task.category]) {
                    acc[task.category] = [];
                }
                acc[task.category].push(task);
                return acc;
            }, {});

            setTasksOptions(categorizedTasks);
        }
    }, [intakeId, tasksByIntake, nationality]);

    // useEffect(() => {
    //     setSelectedTasksPerSemester({});
    //     setTempSelectedTasksPerSemester({});

    //     fetch('http://127.0.0.1:8000/api/tasks', {
    //         method: 'GET',
    //         headers: {
    //             'Authorization': `Bearer ${retrieveAndDecrypt('token')}`,
    //         }
    //     })
    //         .then(response => response.json())
    //         .then(data => {
    //             console.log('Fetched tasks data:', data);

    //             // Sort tasks by ID before grouping them by category
    //             data.sort((a, b) => a.id - b.id);

    //             // Filter tasks based on nationality
    //             const filteredTasks = data.filter(task => {
    //                 // Exclude "Bahasa Melayu Course" (ID = 2) for Malaysians
    //                 if (task.id === 2 && nationality === "Malaysian") {
    //                     return false;
    //                 }
    //                 return true;
    //             });

    //             // Group tasks by category
    //             const categorizedTasks = filteredTasks.reduce((acc, task) => {
    //                 if (!acc[task.category]) {
    //                     acc[task.category] = [];
    //                 }
    //                 acc[task.category].push(task);
    //                 return acc;
    //             }, {});
    //             // Ensure each category has an array
    //             for (const category in categorizedTasks) {
    //                 if (!Array.isArray(categorizedTasks[category])) {
    //                     console.warn(`Expected array for category ${category}, got:`, categorizedTasks[category]);
    //                     categorizedTasks[category] = []; // Fallback to empty array
    //                 }
    //             }
    //             setTasksOptions(categorizedTasks); // Set categorized tasks
    //         })
    //         .catch(error => {
    //             console.error('Error fetching tasks:', error);
    //         });
    // }, []);

    useEffect(() => {
        document.addEventListener("mousedown", handleOutsideClick);
        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, [dropdownVisible]);

    useEffect(() => {
        const allTasks = Object.values(tasksOptions).flat();
        const updatedSelectedTasks = {};

        for (let semesterIndex in tempSelectedTasksPerSemester) {
            const tempSelectedTasks = tempSelectedTasksPerSemester[semesterIndex];
            const selectedTasksFormatted = tempSelectedTasks.map((taskId) => {
                const task = allTasks.find((t) => t.id === taskId);
                if (task) {
                    return { value: task.id, label: task.name };
                } else {
                    console.warn(`Task with id ${taskId} not found`);
                    return null;
                }
            }).filter((item) => item !== null);

            updatedSelectedTasks[semesterIndex] = selectedTasksFormatted;
        }

        setSelectedTasksPerSemester(updatedSelectedTasks);
    }, [tempSelectedTasksPerSemester, tasksOptions]);

    const groupedOptions = Object.keys(tasksOptions).map((category) => ({
        label: category,
        options: tasksOptions[category].map((task) => ({
            value: task.id,
            label: task.name,
        })),
    }));

    const handleSelectChange = (semesterIndex, selectedOptions) => {
        const sortedOptions = selectedOptions
            ? [...selectedOptions].sort((a, b) => a.value - b.value)
            : [];

        setSelectedTasksPerSemester((prevSelectedTasks) => ({
            ...prevSelectedTasks,
            [semesterIndex]: sortedOptions || [],
        }));

        // Update tempSelectedTasksPerSemester if needed
        const selectedIds = sortedOptions.map((option) => option.value);

        // Update tempSelectedTasksPerSemester if needed
        setTempSelectedTasksPerSemester((prevTempSelectedTasks) => ({
            ...prevTempSelectedTasks,
            [semesterIndex]: selectedIds,
        }));

        // Additionally, update formData.semesters
        setFormData(prevFormData => {
            const updatedSemesters = [...prevFormData.semesters];
            updatedSemesters[semesterIndex] = {
                ...updatedSemesters[semesterIndex],
                tasks: selectedOptions || [], // Store the full task options if needed
            };
            return {
                ...prevFormData,
                semesters: updatedSemesters,
            };
        });
    };

    const CustomClearIndicator = (props) => {
        const {
            innerProps: { ref, ...restInnerProps },
        } = props;
        return (
            <div
                {...restInnerProps}
                ref={ref}
                onMouseDown={(e) => {
                    e.stopPropagation();
                    if (restInnerProps.onMouseDown) {
                        restInnerProps.onMouseDown(e);
                    }
                }}
                onClick={(e) => {
                    e.stopPropagation();
                    if (restInnerProps.onClick) {
                        restInnerProps.onClick(e);
                    }
                }}
            >
                {components.ClearIndicator(props)}
            </div>
        );
    };

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

    const handleSubmit = (e) => {
        e.preventDefault();

        // Flatten all task IDs from tasksOptions
        const allTasks = Object.values(tasksOptions).flat(); // Get all tasks as an array
        const allTaskIDs = allTasks.map(task => task.id);

        // Gather all selected task IDs across semesters
        const selectedTaskIDs = formData.semesters
            .flatMap(semester => semester.tasks.map(task => task.value));

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

        // Check if the student selected more than 5 semesters
        if (formData.semesters_no > 5) {
            alert(
                "You have selected more than 5 semesters. Please note that you may be charged extra fees if you don't graduate on time or if you need to repeat your dissertation."
            );
        }

        const updatedSemesters = formData.semesters.map(semester => ({
            semester: semester.semester,
            tasks: semester.tasks.map(task => task.value), // Extract task IDs
        }));

        // Add semesters_no to the payload
        const payload = {
            semesters_no: parseInt(formData.semesters_no),
            semesters: updatedSemesters,
        };

        fetch(`https://pandagrad.com/api/student/study-plan`, {
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

    return (
        <div className={styles.studyplanContainer}>
            <div className={styles.leftSection}>
                <img src="/images/fsktm.jpg" alt="FSKTM Background" className={styles.backgroundImage} />
                <div className={styles.overlay}></div>
                <div className={styles.content}>
                    <img src="/images/logo.png" alt="Logo" className={styles.logo} />
                    <p className={styles.logoText}>PandaGrad</p>
                    <p className={styles.description}>Monitor your progress and stay on track with FSKTM's monitoring system.</p>
                </div>
            </div>

            <div className={styles.rightSection}>
                <div className={styles.formWrapper}>
                    <h1 className={styles.title}>Study Plan Registration</h1>
                    <form onSubmit={handleSubmit}>
                        <div className={styles.formGroup}>
                            <label className={styles.label} htmlFor="semesters_no">
                                Number of Semesters<span className={styles.required}> *</span>
                            </label>
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

                        {formData.semesters.map((semester, index) => (
                            <div key={index} className={styles.formGroup}>
                                <label className={styles.label} >
                                    Semester {index + 1}<span className={styles.required}> *</span>
                                </label>
                                <div
                                    className={styles.tasksField}
                                    ref={(el) => (dropdownRefs.current[index] = el)}
                                >
                                    <Select
                                        isMulti
                                        options={groupedOptions}
                                        value={selectedTasksPerSemester[index] || []}
                                        onChange={(selectedOptions) => handleSelectChange(index, selectedOptions)}
                                        menuPlacement="auto"
                                        styles={{
                                            control: (provided, state) => ({
                                                ...provided,
                                                marginTop: '10px',
                                                marginBottom: '15px',
                                                border: '1px solid #DDDDDD',
                                                borderRadius: '10px',
                                                fontSize: '0.8em',
                                                width: '100%',
                                                boxShadow:
                                                    state.isFocused
                                                        ? '0 0 0 1px #192e59'
                                                        : '0 2px 4px rgba(0, 0, 0, 0.2)',
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
                                                padding: '16px',
                                                fontSize: '0.9em',
                                                minHeight: 100,
                                            }),
                                        }}
                                        components={{ ClearIndicator: CustomClearIndicator }}
                                        required
                                    />
                                </div>
                            </div>
                        ))}

                        <button type="submit" className={styles.submitButton}>
                            Next
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default StudyPlanRegistration;
