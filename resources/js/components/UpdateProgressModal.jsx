import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from './axiosConfig.js';
import styles from './UpdateProgressModal.module.css';
import { StudentContext } from './StudentContext';
import { useParams } from 'react-router-dom';

function UpdateProgressModal({ studentId, isOpen, onClose, onUpdate }) {
    const { id } = useParams();
    const [updateType, setUpdateType] = useState('');
    const [evidence, setEvidence] = useState(null);
    const [link, setLink] = useState('');
    const [description, setDescription] = useState('');
    const [extraFields, setExtraFields] = useState({});
    const [tasksOptions, setTasksOptions] = useState({});
    const [numSemesters, setNumSemesters] = useState(0);
    const [dropdownVisible, setDropdownVisible] = useState({});
    const [tempSelectedTasks, setTempSelectedTasks] = useState([]);
    const dropdownRefs = useRef({});
    const [formData, setFormData] = useState({
        semesters_no: "",
        semesters: [],
    });
    const { tasks, nationalities, supervisors, studentsData } = useContext(StudentContext);

    useEffect(() => {
        if (isOpen) {
            const semestersArray = formData.semesters_no
                ? Array.from({ length: parseInt(formData.semesters_no) }, (_, i) => ({ semester: i + 1, tasks: [] }))
                : [];
            setFormData((prev) => ({ ...prev, semesters: semestersArray }));
        }
    }, [isOpen, formData.semesters_no]);

    useEffect(() => {
        if (isOpen) {
            setUpdateType('');
            setEvidence(null);
            setLink('');
            setDescription('');
            setExtraFields({});
            setDropdownVisible([]);

            // Filter tasks and group them based on nationality
            const studentNationality = nationalities[studentId] || 'Unknown'; // Default to 'Unknown'
            console.log('Fetched student nationality:', studentNationality);

            // Filter tasks based on nationality
            const filteredTasks = tasks.filter(task => {
                return !(studentNationality === 'Malaysian' && task.name === 'Bahasa Melayu Course');
            });

            // Sort and group tasks by category
            filteredTasks.sort((a, b) => a.id - b.id);
            const categorizedTasks = filteredTasks.reduce((acc, task) => {
                if (!acc[task.category]) {
                    acc[task.category] = [];
                }
                acc[task.category].push(task);
                return acc;
            }, {});

            setTasksOptions(categorizedTasks); // Set categorized tasks
        }
    }, [isOpen, tasks, nationalities, studentId]);

    // Close dropdown when clicked outside
    // useEffect(() => {
    //     const handleClickOutside = (event) => {
    //         // Loop through dropdown refs and check if the clicked element is outside any dropdown
    //         dropdownRefs.current.forEach((dropdown, index) => {
    //             if (dropdown && !dropdown.contains(event.target)) {
    //                 setDropdownVisible((prev) => {
    //                     const updatedVisibility = [...prev];
    //                     updatedVisibility[index] = false; // Close the dropdown for this index
    //                     return updatedVisibility;
    //                 });
    //             }
    //         });
    //     };

    //     // Add event listener on mount
    //     document.addEventListener('click', handleClickOutside);

    //     // Clean up the event listener on unmount
    //     return () => {
    //         document.removeEventListener('click', handleClickOutside);
    //     };
    // }, []);

    const handleClickOutside = (e) => {
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

    // Add and remove event listener for outside clicks
    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownVisible]);


    // Close dropdown when modal is closed
    useEffect(() => {
        if (!isOpen) {
            setDropdownVisible([]); // Reset visibility when modal is closed
        }
    }, [isOpen]);

    useEffect(() => {
        // Reset the dropdown visibility whenever the update type changes
        setDropdownVisible([]);

        // Reset the form fields and number of semesters if the update type is 'change_study_plan'
        if (updateType === 'change_study_plan') {
            setNumSemesters(0); // Reset the number of semesters
            setFormData(prev => ({
                ...prev,
                semesters_no: '',
                semesters: [] // Clear the semester fields
            }));
            setSelectedTasks([]); // Clear selected tasks
            setTempSelectedTasks([]); // Clear temporary selected tasks
            setExtraFields({}); // Reset extra fields (status, grade, etc.)
        }
    }, [updateType]);

    // const fetchSupervisors = async () => {
    //     try {
    //         const response = await axios.get('/api/lecturers?role=supervisor');
    //         setSupervisors(response.data);
    //     } catch (error) {
    //         console.error('Error fetching supervisors:', error);
    //     }
    // };

    // const fetchStudyPlan = async () => {
    //     try {
    //         const response = await axios.get(`/api/students/${studentId}/study-plan`);
    //         console.log('Study plan data:', response.data);
    //         if (Array.isArray(response.data)) {
    //             setStudyPlan(response.data);

    //             // Map fetched study plan to formData.semesters
    //             const mappedSemesters = response.data.map((semester) => ({
    //                 semester: semester.semester,
    //                 tasks: semester.tasks || [], // Default to empty array if no tasks
    //             }));
    //             console.log('Mapped semesters:', mappedSemesters);
    //             setFormData((prev) => ({
    //                 ...prev,
    //                 semesters: mappedSemesters,
    //             }));
    //         } else {
    //             console.error('Study plan data is undefined');
    //         }
    //     } catch (error) {
    //         console.error('Error fetching study plan:', error);
    //     }
    // };

    const allStudents = Object.values(studentsData).flat();

    // Find the student by ID
    const student = allStudents.find(s => s.id === parseInt(id));

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

    // const handleDropdownToggle = (index) => {
    //     if (!formData.semesters[index]) {
    //         console.error(`Semester data is not defined for index: ${index}`);
    //         return; // Prevent further execution if the data is missing
    //     }

    //     // Load tasks into tempSelectedTasks when opening the dropdown
    //     setTempSelectedTasks(formData.semesters[index].tasks || []);

    //     // Toggle dropdown visibility
    //     setDropdownVisible((prev) => {
    //         // Create a copy of the visibility state, but ensure it's as long as the semesters
    //         const updatedVisibility = new Array(formData.semesters.length).fill(false);

    //         // Toggle visibility for the selected index
    //         updatedVisibility[index] = !prev[index];
    //         return updatedVisibility;
    //     });
    // };

    const handleDropdownToggle = (index) => {
        if (!formData.semesters[index]) {
            console.error(`Semester data is not defined for index: ${index}`);
            return; // Prevent further execution if the data is missing
        }

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
        //console.log('Task selected/deselected:', task);
        setTempSelectedTasks((prevTasks) => {
            if (prevTasks.includes(task.id)) {
                return prevTasks.filter((id) => id !== task.id);
            } else {
                return [...prevTasks, task.id];
            }
        });
    };

    // Function to handle number of semesters change
    const handleNumSemestersChange = (e) => {
        const num = parseInt(e.target.value);
        setNumSemesters(num);

        // Reset semesters array with placeholder data
        const updatedSemesters = Array.from({ length: num }, (_, i) => ({
            semester: i + 1,
            tasks: [],
        }));

        setFormData((prevFormData) => ({
            ...prevFormData,
            semesters: updatedSemesters,
        }));

        //console.log('Number of Semesters Updated:', num, updatedSemesters);
    };

    const handleApplyButton = (index) => {
        // Sort selected tasks by ID before saving to semester
        const sortedTasks = [...tempSelectedTasks].sort((a, b) => a - b);

        // Save the sorted tasks to the current semester
        setFormData(prevFormData => {
            const updatedSemesters = prevFormData.semesters.map((semester, i) => {
                if (i === index) {
                    return { ...semester, tasks: sortedTasks };
                }
                return semester;
            });
            const newFormData = { ...prevFormData, semesters: updatedSemesters };
            //console.log('FormData after applying tasks:', newFormData);
            return { ...prevFormData, semesters: updatedSemesters };
        });

        // Clear tempSelectedTasks after applying changes
        setTempSelectedTasks([]);

        // Close the dropdown
        setDropdownVisible(prevState => ({
            ...prevState,
            [index]: false,
        }));

        console.log('Updated tasks for semester:', index + 1, sortedTasks);
    };

    const handleSave = async () => {
        if (!updateType) {
            alert("Please choose an update type.");
            return;
        }

        // Conditionally validate based on the updateType
        switch (updateType) {
            case 'update_status':
                if (!extraFields.status) {
                    alert("Please select a status.");
                    return;
                }
                break;
            case 'workshops_attended':
                if (!extraFields.workshop_name) {
                    alert("Please provide the name of the workshop.");
                    return;
                }
                break;

            case 'bahasa_melayu_course':
            case 'english_language_course':
            case 'research_methodology_course':
                if (!extraFields.grade) {
                    alert("Please select a grade.");
                    return;
                }
                break;
            case 'core_courses':
            case 'elective_courses':
                if (!extraFields.cgpa) {
                    alert("Please provide the CGPA.");
                    return;
                }
                if (!extraFields.num_courses) {
                    alert("Please select a number of courses.");
                    return;
                }
                for (let i = 0; i < parseInt(extraFields.num_courses || 0); i++) {
                    if (!extraFields[`course_name_${i + 1}`]) {
                        alert(`Please provide the course name for course ${i + 1}.`);
                        return;
                    }
                    if (!extraFields[`grade_${i + 1}`]) {
                        alert(`Please select the grade for course ${i + 1}.`);
                        return;
                    }
                }
                break;
            case 'appointment_supervisor_form':
                if (!extraFields.supervisor_id) {
                    alert("Please select the name of the supervisor.");
                    return;
                }
                if (!extraFields.research_topic) {
                    alert("Please provide the research topic.");
                    return;
                }
                break;
            case 'proposal_defence':
            case 'candidature_defence':
            case 'committee_meeting':
            case 'jkit_correction_approval':
            case 'senate_approval':
            case 'dissertation_chapters_1_2_3':
            case 'dissertation_all_chapters':
            case 'dissertation_submission_examination':
            case 'dissertation_submission_correction':
                if (!extraFields.progress_status) {
                    alert("Please select a progress status.");
                    return;
                }
                break;
            case 'residential_requirement':
                if (!extraFields.residential_college) {
                    alert("Please provide the name of the residential college.");
                    return;
                }
                if (!extraFields.start_date) {
                    alert("Please select the start date.");
                    return;
                }
                if (!extraFields.end_date) {
                    alert("Please select the end date.");
                    return;
                }
                break;
            case 'extension_candidature_period':
                if (!extraFields.max_sem) {
                    alert("Please select the New Max. Period of Candidature.");
                    return;
                }
                break;

            case 'change_study_plan':
                if (!extraFields.num_semesters) {
                    alert("Please select at least one semester.");
                    return;
                }

                // Validate `formData.semesters`
                if (!formData || !formData.semesters || formData.semesters.length === 0) {
                    alert("Please select tasks for all semesters.");
                    return;
                }

                // Flatten all task IDs from tasksOptions
                const allTasks = Object.values(tasksOptions).flat(); // Get all tasks as an array
                const allTaskIDs = allTasks.map(task => task.id);

                // Gather all selected task IDs across semesters
                const selectedTaskIDs = formData.semesters.flatMap(semester => semester.tasks);

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

                const updatedSemesters = formData.semesters.map((semester) => {
                    if (!semester.tasks || semester.tasks.length === 0) {
                        alert(`Semester ${semester.semester} is missing tasks.`);
                        throw new Error(`Invalid semester data: Semester ${semester.semester} has no tasks.`);
                    }
                    return {
                        semester: semester.semester,
                        tasks: semester.tasks,
                    };
                });

                extraFields.num_semesters = updatedSemesters.length;
                extraFields.semesters = updatedSemesters;

                break;
            default:
                break;
        }

        if (!extraFields.completion_date) {
            alert("Please select the Date of Change.");
            return;
        }

        // Ask for confirmation before saving
        const isConfirmed = window.confirm("Are you sure you want to save the changes?");
        if (!isConfirmed) {
            return; // If the user cancels, stop the save process
        }

        const formData2 = new FormData();
        formData2.append('update_type', updateType);

        // Conditionally append 'evidence', 'link', and 'description'
        if (evidence) {
            formData2.append('evidence', evidence);
        }
        if (link) {
            formData2.append('link', link);
        }
        if (description) {
            formData2.append('description', description);
        }

        // Append extra fields, including study plan data if applicable
        Object.keys(extraFields).forEach((field) => {
            if (field === 'semesters') {
                // Check if the semesters field is not null and has valid data
                if (extraFields.semesters && extraFields.semesters.length > 0) {
                    formData2.append(field, JSON.stringify(extraFields.semesters)); // Send semesters as JSON string
                }
            } else {
                formData2.append(field, extraFields[field]);
            }
        });

        // Log serialized FormData for debugging
        // for (const [key, value] of formData2.entries()) {
        //     console.log(`formdata2 = ${key}: ${value}`);
        // }
        // console.log("Semesters JSON:", JSON.stringify(extraFields.semesters, null, 2));
        const adminName = JSON.parse(localStorage.getItem('user')).Name;
        console.log('Admin Name:', adminName);
        formData2.append('admin_name', adminName);
        formData2.append('currentSemester', student.currentSemester);
        try {
            await axios.post(`/api/students/${studentId}/update-progress`, formData2, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            onUpdate(studentId);
            onClose();
        } catch (error) {
            console.error('Error updating progress:', error);
            alert('An error occurred while updating progress');
            onClose();
        }
    };

    const handleFileChange = (e) => {
        setEvidence(e.target.files[0]);
    };

    const handleExtraFieldChange = (field, value) => {
        setExtraFields(prevFields => ({
            ...prevFields,
            [field]: value,
        }));
    };

    const handleFormClose = () => {
        // Reset the form state and call the onClose prop
        setNumSemesters(0);
        setFormData({ ...formData, semesters: [] });
        setExtraFields({});

        // Reset other form-related states
        setSelectedTasks([]);
        setTempSelectedTasks([]);

        // Call the onClose function passed as a prop to close the modal
        onClose();
    };

    const generateSemesters = () => {
        if (!currentSemester || !currentSemester.academic_year) {
            return [];
        }

        // Extract the start year from the current semester's academic year
        const currentAcademicYear = currentSemester.academic_year; // Example: "2023/2024"
        const [startYear] = currentAcademicYear.split('/').map(Number); // Extracts the first year (e.g., 2023)

        const endYear = startYear + 5; // End year is 5 years from the start year

        const semesters = [];
        for (let year = startYear; year <= endYear; year++) {
            semesters.push(`Sem 1, ${year}/${year + 1}`);
            semesters.push(`Sem 2, ${year}/${year + 1}`);
        }

        return semesters;
    };

    const renderExtraFields = () => {
        switch (updateType) {
            case 'update_status':
                return (
                    <>
                        <label className={styles.label}>Status<span style={{ color: 'red' }}> *</span></label>
                        <select
                            className={styles.input}
                            onChange={(e) => handleExtraFieldChange('status', e.target.value)}
                        >
                            <option value="">Select Status</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                            <option value="GoT">GoT</option>
                            <option value="Non-GoT">Non-GoT</option>
                            <option value="Personal Leave">Personal Leave</option>
                            <option value="Withdrawn">Withdrawn</option>
                            <option value="Terminated (I)">Terminated (I)</option>
                            <option value="Terminated (F)">Terminated (F)</option>
                        </select>
                    </>
                );
            case 'workshops_attended':
                return (
                    <>
                        <label className={styles.label}>Name of the Workshop<span style={{ color: 'red' }}> *</span></label>
                        <input
                            className={styles.input}
                            onChange={(e) => handleExtraFieldChange('workshop_name', e.target.value)}
                        />
                    </>
                );
            case 'change_study_plan':
                return (
                    <>
                        <label className={styles.label}>Number of Semesters<span style={{ color: 'red' }}> *</span></label>
                        <select
                            className={styles.input}
                            name="semesters_no"
                            onChange={(e) => {
                                handleExtraFieldChange('num_semesters', e.target.value);
                                handleInputChange(e);
                                setNumSemesters(parseInt(e.target.value));
                                setTempSelectedTasks(Array.from({ length: parseInt(e.target.value) }, () => []));
                                handleNumSemestersChange(e);
                            }}
                        >
                            <option value="">Select Number of Semesters</option>
                            <option value="3">3 (Graduate on Time)</option>
                            <option value="4">4 (Graduate on Time)</option>
                            <option value="5">5 (Graduate on Time)</option>
                            <option value="6">6</option>
                            <option value="7">7</option>
                            <option value="8">8</option>
                        </select>

                        {numSemesters > 0 && [...Array(numSemesters || 0)].map((_, index) => {
                            const semesterData = formData.semesters[index] || { tasks: [] };

                            // Ensure tasks is always an array before sorting
                            const sortedTasks = Array.isArray(semesterData.tasks) ? semesterData.tasks.sort((a, b) => a - b) : [];

                            return (
                                <div key={index}>
                                    <label className={styles.label}>
                                        Semester {index + 1}
                                        <span style={{ color: 'red' }}> *</span>
                                    </label>


                                    <div>
                                        <div ref={(el) => { dropdownRefs.current[index] = el }} className={`dropdown ${dropdownVisible[index] ? 'show' : ''}`}>
                                            <button
                                                type="button"
                                                className={styles.semesterinput}
                                                onClick={() => handleDropdownToggle(index)}
                                            >
                                                Select Tasks <span className="dropdown-icon">+</span>
                                            </button>
                                            <div className="dropdown-content">
                                                {Object.keys(tasksOptions).map(category => (
                                                    <div key={category}>
                                                        <strong>{category}</strong>
                                                        {Array.isArray(tasksOptions[category]) &&
                                                            tasksOptions[category].map(task => (
                                                                <label key={task.id} className="checkbox-label">
                                                                    <input
                                                                        type="checkbox"
                                                                        name={`task-${index}-${task.id}`}
                                                                        value={task.id}
                                                                        checked={tempSelectedTasks.includes(task.id)}
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
                                        <div className={styles.selectedtasks}>
                                            {sortedTasks.length > 0
                                                ? sortedTasks
                                                    .map((taskId) => {
                                                        const task = Object.values(tasksOptions).flat().find((t) => t.id === taskId);
                                                        return task ? task.name : '';
                                                    })
                                                    .filter(Boolean)
                                                    .join(', ')
                                                : 'No tasks selected'}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </>
                );
            case 'extension_candidature_period':
                return (
                    <>
                        <label className={styles.label}>
                            New Max. Period of Candidature<span style={{ color: 'red' }}> *</span>
                        </label>
                        <select
                            className={styles.input}
                            onChange={(e) => handleExtraFieldChange('max_sem', e.target.value)}
                            required
                        >
                            <option value="">Select New Max. Period</option>
                            {generateSemesters().map((semester, index) => (
                                <option key={index} value={semester}>
                                    {semester}
                                </option>
                            ))}
                        </select>
                    </>
                );
            case 'bahasa_melayu_course':
            case 'english_language_course':
            case 'research_methodology_course':
                return (
                    <>
                        <label className={styles.label}>Grade<span style={{ color: 'red' }}> *</span></label>
                        <select
                            className={styles.input}
                            onChange={(e) => handleExtraFieldChange('grade', e.target.value)}
                        >
                            <option value="">Select Grade</option>
                            <option value="A+">A+</option>
                            <option value="A">A</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B">B</option>
                            <option value="B-">B-</option>
                            <option value="C+">C+</option>
                            <option value="C">C</option>
                            <option value="C-">C-</option>
                            <option value="D+">D+</option>
                            <option value="D">D</option>
                            <option value="F">F</option>
                            <option value="N/A">N/A</option>
                        </select>
                    </>
                );
            case 'core_courses':
            case 'elective_courses':
                return (
                    <>
                        <label className={styles.label}>CGPA<span style={{ color: 'red' }}> *</span></label>
                        <input
                            className={styles.input}
                            onChange={(e) => handleExtraFieldChange('cgpa', e.target.value)}
                        />
                        <label className={styles.label}>Number of Courses<span style={{ color: 'red' }}> *</span></label>
                        <select
                            className={styles.input}
                            value={extraFields.num_courses || ''}
                            onChange={(e) => handleExtraFieldChange('num_courses', e.target.value)}
                        >
                            <option value="">Select the Number of Courses</option>
                            {[...Array(5)].map((_, i) => (
                                <option key={i + 1} value={i + 1}>{i + 1}</option>
                            ))}
                        </select>
                        {[...Array(parseInt(extraFields.num_courses || 0))].map((_, i) => (
                            <React.Fragment key={i}>
                                <label className={styles.label}>Course Code - {i + 1}<span style={{ color: 'red' }}> *</span></label>
                                <input
                                    className={styles.input}
                                    onChange={(e) => handleExtraFieldChange(`course_name_${i + 1}`, e.target.value)}
                                />
                                <label className={styles.label}>Grade - {i + 1}<span style={{ color: 'red' }}> *</span></label>
                                <select
                                    className={styles.input}
                                    onChange={(e) => handleExtraFieldChange(`grade_${i + 1}`, e.target.value)}
                                >
                                    <option value="">Select a Grade</option>
                                    <option value="A+">A+</option>
                                    <option value="A">A</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B">B</option>
                                    <option value="B-">B-</option>
                                    <option value="C+">C+</option>
                                    <option value="C">C</option>
                                    <option value="C-">C-</option>
                                    <option value="D+">D+</option>
                                    <option value="D">D</option>
                                    <option value="F">F</option>
                                    <option value="N/A">N/A</option>
                                </select>
                            </React.Fragment>
                        ))}
                    </>
                );
            case 'residential_requirement':
                return (
                    <>
                        <label className={styles.label}>Residential College<span style={{ color: 'red' }}> *</span></label>
                        <input
                            type="text"
                            className={styles.input}
                            placeholder="Enter Residential College"
                            onChange={(e) => handleExtraFieldChange('residential_college', e.target.value)} 
                        />

                        <label className={styles.label}>Start Date<span style={{ color: 'red' }}> *</span></label>
                        <input
                            type="date"
                            className={styles.input}
                            onChange={(e) => handleExtraFieldChange('start_date', e.target.value)} 
                        />

                        <label className={styles.label}>End Date<span style={{ color: 'red' }}> *</span></label>
                        <input
                            type="date"
                            className={styles.input}
                            onChange={(e) => handleExtraFieldChange('end_date', e.target.value)} 
                        />
                    </>
                );
            case 'appointment_supervisor_form':
                return (
                    <>
                        <label className={styles.label}>Name of Supervisor<span style={{ color: 'red' }}> *</span></label>
                        <select
                            className={styles.input}
                            onChange={(e) => handleExtraFieldChange('supervisor_id', e.target.value)} // Store supervisor_id
                        >
                            <option value="">Select a Supervisor</option>
                            {supervisors.map(supervisor => (
                                <option key={supervisor.id} value={supervisor.id}>
                                    Dr. {supervisor.first_name} {supervisor.last_name}
                                </option>
                            ))}
                        </select>
                        <label className={styles.label}>Research Topic<span style={{ color: 'red' }}> *</span></label>
                        <input
                            className={styles.input}
                            onChange={(e) => handleExtraFieldChange('research_topic', e.target.value)}
                        />
                    </>
                );
            case 'proposal_defence':
            case 'candidature_defence':
            case 'committee_meeting':
            case 'jkit_correction_approval':
            case 'senate_approval':
            case 'dissertation_chapters_1_2_3':
            case 'dissertation_all_chapters':
            case 'dissertation_submission_examination':
            case 'dissertation_submission_correction':
                return (
                    <>
                        <label className={styles.label}>Progress Status<span style={{ color: 'red' }}> *</span></label>
                        <select
                            className={styles.input}
                            onChange={(e) => handleExtraFieldChange('progress_status', e.target.value)}
                        >
                            <option value="">Select Progress Status</option>
                            <option value="Completed">Completed</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Pending">Pending</option>
                        </select>
                    </>
                );

            default:
                return null;
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <>
            <div className={styles.modalOverlay} onClick={handleFormClose}></div>
            <div className={styles.updateProgressPopup}>
                <form className={styles.form}>
                    <label className={styles.label}>Update<span style={{ color: 'red' }}> *</span></label>
                    <select className={styles.input} value={updateType} onChange={(e) => setUpdateType(e.target.value)} required>
                        <option value="">Select an update</option>
                        {/* Student Information Category */}
                        <optgroup label="Student Information">
                            <option value="update_status">Update Status</option>
                            <option value="workshops_attended">Workshops Attended</option>
                            <option value="change_study_plan">Change Study Plan</option>
                            <option value="extension_candidature_period">Extension of Candidature Period</option>
                        </optgroup>

                        {/* Courses Category */}
                        <optgroup label="Courses">
                            <option value="bahasa_melayu_course">Bahasa Melayu Course</option>
                            <option value="english_language_course">English Language Course</option>
                            <option value="core_courses">Core Courses</option>
                            <option value="elective_courses">Elective Courses</option>
                            <option value="research_methodology_course">Research Methodology Course</option>
                        </optgroup>

                        {/* Other Requirements Category */}
                        <optgroup label="Other Requirements">
                            <option value="appointment_supervisor_form">Submission of Appointment of Supervisor Form</option>
                            <option value="residential_requirement">Residential Requirement</option>
                        </optgroup>

                        {/* Proposal Defence Category */}
                        <optgroup label="Proposal Defence">
                            <option value="proposal_defence">Proposal Defence</option>
                        </optgroup>

                        {/* Dissertation Category */}
                        <optgroup label="Dissertation">
                            <option value="dissertation_chapters_1_2_3">Chapters 1, 2, and 3 of Dissertation</option>
                            <option value="dissertation_all_chapters">All Chapters of Dissertation</option>
                            <option value="dissertation_submission_examination">Dissertation Submission for Examination</option>
                            <option value="dissertation_submission_correction">Dissertation Submission After Correction</option>
                        </optgroup>

                        {/* Candidature Defence Category */}
                        <optgroup label="Candidature Defence">
                            <option value="candidature_defence">Candidature Defence</option>
                        </optgroup>

                        {/* Progress Meetings Category */}
                        <optgroup label="Progress Meetings">
                            <option value="committee_meeting">Committee Meeting</option>
                        </optgroup>

                        {/* Other Approval */}
                        <optgroup label="Approval">
                            <option value="jkit_correction_approval">JKIT Correction Approval</option>
                            <option value="senate_approval">Senate Approval</option>
                        </optgroup>
                    </select>

                    {renderExtraFields()}

                    <label className={styles.label}>Date of Completion / Change<span style={{ color: 'red' }}> *</span></label>
                    <input
                        className={styles.input}
                        type="date"
                        onChange={(e) => handleExtraFieldChange('completion_date', e.target.value)}
                    />

                    <label className={styles.label}>Evidence (Optional)</label>
                    <input
                        className={styles.input}
                        type="file"
                        accept="image/*, application/pdf"
                        onChange={handleFileChange}
                    />

                    <label className={styles.label}>Link (Optional)</label>
                    <input
                        className={styles.input}
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                    />

                    <label className={styles.label}>Description (Optional)</label>
                    <textarea
                        className={styles.textarea}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />

                    <div className={styles.buttons}>
                        <button type="button" onClick={handleSave} className={styles.saveButton}>Save</button>
                        <button type="button" onClick={handleFormClose} className={styles.closeButton}>Cancel</button>
                    </div>
                </form>
            </div>
        </>
    );
}

export default UpdateProgressModal;