import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from './axiosConfig.js';
import styles from './UpdateProgressModal.module.css';
import { StudentContext } from './StudentContext';
import { useParams } from 'react-router-dom';
import { retrieveAndDecrypt } from "./storage.js";
import Select, { components } from 'react-select';

function UpdateProgressModal({ studentId, isOpen, onClose, onUpdate, user, student, studyPlan }) {
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
    const [progressStatus, setProgressStatus] = useState("");
    const dropdownRefs = useRef({});
    const [formData, setFormData] = useState({
        semesters_no: "",
        semesters: [],
    });
    const { supervisors, currentSemester, tasksByIntake, fetchTasks } = useContext(StudentContext);
    const fileInputRef = useRef(null);
    const dateInputRef = useRef(null);
    const [selectedTasksPerSemester, setSelectedTasksPerSemester] = useState({});
    const [tempSelectedTasksPerSemester, setTempSelectedTasksPerSemester] = useState({});

    const nationality = student.nationality;
    const intakeId = student.intake_id;

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
            setProgressStatus("");
        }
    }, [isOpen, studentId]);

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

    const groupedOptions = Object.keys(tasksOptions).map((category) => ({
        label: category,
        options: tasksOptions[category].map((task) => ({
            value: task.id,
            label: task.name,
        })),
    }));

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
        if (studyPlan && updateType === 'change_study_plan') {
            const numSemesters = studyPlan.length;
            setNumSemesters(numSemesters);

            const allTasks = Object.values(tasksOptions).flat(); // Flatten tasksOptions
            const initialSemesters = studyPlan.map((semester) => {
                const semesterTasks = semester.tasks ? Object.keys(semester.tasks).map((taskKey) => {
                    const taskDetail = semester.tasks[taskKey];
                    const matchingTask = allTasks.find((task) => task.name === taskDetail.name);
                    return matchingTask ? matchingTask.id : null; // Map to task IDs
                }).filter((id) => id !== null) : []; // Filter out null IDs

                return { semester: semester.semester, tasks: semesterTasks };
            });

            setFormData((prev) => ({
                ...prev,
                semesters: initialSemesters,
            }));

            const initialSelectedTasks = studyPlan.map((semester) => {
                if (semester.tasks && typeof semester.tasks === 'object') {
                    return Object.keys(semester.tasks).map((taskKey) => {
                        const taskDetail = semester.tasks[taskKey];
                        const matchingTask = allTasks.find((task) => task.name === taskDetail.name);
                        return matchingTask
                            ? { value: matchingTask.id, label: matchingTask.name }
                            : null;
                    }).filter((task) => task !== null);
                }
                return [];
            });

            setSelectedTasksPerSemester(initialSelectedTasks);
            setTempSelectedTasks(
                initialSelectedTasks.map((tasks) => tasks.map((task) => task.value))
            );

            setExtraFields({}); // Reset extra fields (status, grade, etc.)
            setProgressStatus("");
            setEvidence(null);
            setLink('');
            setDescription('');
            setFormData((prev) => ({
                ...prev,
                semesters: studyPlan.map((semester, index) => ({
                    semester: index + 1,
                    tasks: Object.keys(semester.tasks || {}).map((taskId) => parseInt(taskId, 10)),
                })),
            }));
        } else {
            // Clear all fields if updateType is not 'change_study_plan'
            setProgressStatus("");
            setNumSemesters(0);
            setFormData((prev) => ({
                ...prev,
                semesters_no: '',
                semesters: [], // Clear the semester fields
            }));
            setExtraFields({});
            setTempSelectedTasks([]);
            setEvidence(null);
            setLink('');
            setDescription('');
            setSelectedTasksPerSemester({});
            setTempSelectedTasksPerSemester({});

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            if (dateInputRef.current) {
                dateInputRef.current.value = '';
            }
        }
    }, [updateType, studyPlan]); // Include studyPlan and updateType as dependencies

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

    const handleSelectChange = (semesterIndex, selectedOptions) => {
        const sortedOptions = selectedOptions
            ? [...selectedOptions].sort((a, b) => a.value - b.value)
            : [];
    
        // Update selectedTasksPerSemester
        setSelectedTasksPerSemester((prevSelectedTasks) => ({
            ...prevSelectedTasks,
            [semesterIndex]: sortedOptions || [],
        }));
    
        // Update formData.semesters
        setFormData((prevFormData) => ({
            ...prevFormData,
            semesters: prevFormData.semesters.map((semester, idx) => {
                if (idx === semesterIndex) {
                    return {
                        ...semester,
                        tasks: sortedOptions.map((task) => task.value), // Use task IDs
                    };
                }
                return semester; // Preserve other semesters
            }),
        }));
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

        // Reset selected tasks per semester
        const updatedSelectedTasks = Array.from({ length: num }, () => []);

        setFormData((prevFormData) => ({
            ...prevFormData,
            semesters: updatedSemesters,
        }));

        setSelectedTasksPerSemester(updatedSelectedTasks);
    };

    const handleSave = async (currentEvidence) => {
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
                const cgpa = parseFloat(extraFields.cgpa);
                if (isNaN(cgpa) || cgpa < 0 || cgpa > 4.0) {
                    alert("Please provide a valid CGPA between 0.0 and 4.0.");
                    return;
                }
                if (!/^\d(\.\d{1,2})?$/.test(extraFields.cgpa)) {
                    alert("Please provide a valid CGPA with at most 2 decimal places.");
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
            case 'submission_of_appointment_of_supervisor_form':
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
            case 'candidature_defence': {
                // Common fields for both proposal_defence and candidature_defence
                if (!extraFields.progress_status) {
                    alert("Please select a progress status.");
                    return;
                }
                if (extraFields.progress_status === "In Progress") {
                    if (!extraFields.panels) {
                        alert("Please provide the panel members.");
                        return;
                    }
                    if (!extraFields.chairperson) {
                        alert("Please provide the chairperson.");
                        return;
                    }
                    const defenseLabel = updateType === 'proposal_defence' ? "pd" : "cd";
                    if (!extraFields[`${defenseLabel}_date`]) {
                        alert(`Please provide the ${defenseLabel.toUpperCase()} Date.`);
                        return;
                    }
                    if (!extraFields[`${defenseLabel}_time`]) {
                        alert(`Please provide the ${defenseLabel.toUpperCase()} Time.`);
                        return;
                    }
                    if (!extraFields[`${defenseLabel}_venue`]) {
                        alert(`Please provide the ${defenseLabel.toUpperCase()} Venue.`);
                        return;
                    }
                }
                break;
            }
            case 'committee_meeting':
            case 'committee_of_examiners_meeting':
            case 'jkit_correction_approval':
            case 'approval_of_correction_by_jkit':
            case 'senate_approval':
            case 'dissertation_chapters_1_2_3':
            case 'chapters_1_2_and_3_of_dissertation':
            case 'dissertation_all_chapters':
            case 'all_chapters_of_dissertation':
            case 'dissertation_submission_examination':
            case 'dissertation_submission_for_examination':
            case 'dissertation_submission_correction':
            case 'dissertation_submission_after_correction':
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
                const selectedTaskIDs = formData.semesters
                    .flatMap(semester => semester.tasks.map(task => task.value));
                //const selectedTaskIDs = formData.semesters.flatMap(semester => semester.tasks);

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
                        tasks: semester.tasks.map(task => task.value), // Extract task IDs
                        //tasks: semester.tasks,
                    };
                });

                extraFields.num_semesters = updatedSemesters.length;
                extraFields.semesters = updatedSemesters;

                break;
            default:
                break;
        }

        if (!extraFields.completion_date) {
            alert("Please select the Date of Update.");
            return;
        }

        // Ask for confirmation before saving
        const isConfirmed = window.confirm("Are you sure you want to save the changes?");
        if (!isConfirmed) {
            return; // If the user cancels, stop the save process
        }

        const formData2 = new FormData();
        formData2.append('update_type', updateType);

        // console.log('Evidence before appending:', evidence);
        // console.log('Current Evidence:', currentEvidence);

        if (currentEvidence) {
            //console.log('Appending evidence file:', currentEvidence);
            formData2.append('evidence', currentEvidence);
        } else {
            //console.log('No evidence file selected.');
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
        const adminName = JSON.parse(retrieveAndDecrypt('user')).Name;
        formData2.append('admin_name', adminName);
        formData2.append('currentSemester', student.currentSemester);
        console.log("Student ID:", studentId);

        // for (let [key, value] of formData2.entries()) {
        //     console.log(`${key}:`, value);
        // }

        try {
            await axios.post(`/api/students/${studentId}/update-progress`, formData2, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            if (user.role !== 'student') {
                onUpdate(studentId);
            }
            onClose();
        } catch (error) {
            console.error('Error updating progress:', error);
            alert('An error occurred while updating progress');
            onClose();
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        //console.log('Selected File:', selectedFile);
        setEvidence(selectedFile);
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
                        <label className={styles.label}>Student Status<span style={{ color: 'red' }}> *</span></label>
                        <select
                            className={styles.input}
                            onChange={(e) => handleExtraFieldChange('status', e.target.value)}
                        >
                            <option value="">Select Status</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                            <option value="GoT">GoT</option>
                            <option value="Non-GoT">Non-GoT</option>
                            <option value="PL">Personal Leave</option>
                            <option value="Withdrawn">Withdrawn</option>
                            <option value="TI">Terminated (Inactive)</option>
                            <option value="TF">Terminated (Failed)</option>
                            <option value="Deactivated">Deactivated</option>
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
                            value={numSemesters}
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
                                        <div ref={(el) => { dropdownRefs.current[index] = el }} className={`${styles.dropdown} ${dropdownVisible[index] ? styles.show : ""}`}>
                                            <Select
                                                isMulti
                                                options={groupedOptions}
                                                value={selectedTasksPerSemester[index] || []}
                                                onChange={(selectedOptions) => handleSelectChange(index, selectedOptions)}
                                                styles={{
                                                    control: (provided, state) => ({
                                                        ...provided,
                                                        marginTop: '10px',
                                                        marginBottom: '15px',
                                                        marginLeft: '10px',
                                                        paddingLeft: '3px',
                                                        border: '1px solid #DDDDDD',
                                                        borderRadius: '10px',
                                                        fontSize: '0.8em',
                                                        width: '94%',
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
                                                        padding: '14px',
                                                        fontSize: '0.8em',
                                                    }),
                                                }}
                                                components={{ ClearIndicator: CustomClearIndicator }}
                                                required
                                            />
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
                            ref={dateInputRef}
                            onChange={(e) => handleExtraFieldChange('start_date', e.target.value)}
                        />

                        <label className={styles.label}>End Date<span style={{ color: 'red' }}> *</span></label>
                        <input
                            type="date"
                            className={styles.input}
                            ref={dateInputRef}
                            onChange={(e) => handleExtraFieldChange('end_date', e.target.value)}
                        />
                    </>
                );
            case 'appointment_supervisor_form':
            case 'submission_of_appointment_of_supervisor_form':
                return (
                    <>
                        <label className={styles.label}>Name of Supervisor<span style={{ color: 'red' }}> *</span></label>
                        <select
                            className={styles.input}
                            onChange={(e) => handleExtraFieldChange('supervisor_id', e.target.value)} // Store supervisor_id
                        >
                            <option value="">Select a Supervisor</option>
                            {supervisors
                                .filter(
                                    supervisor =>
                                        supervisor.status !== 'Deactivated' && // Exclude deactivated supervisors
                                        supervisor.program_id === student.program_id // Ensure programs match
                                )
                                .map(supervisor => (
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
            case 'candidature_defence': {
                const isProposalDefence = updateType === 'proposal_defence';
                const defenseLabel = isProposalDefence ? "PD" : "CD";

                return (
                    <>
                        <label className={styles.label}>Progress Status<span style={{ color: 'red' }}> *</span></label>
                        <select
                            className={styles.input}
                            value={progressStatus}
                            onChange={(e) => {
                                setProgressStatus(e.target.value); // Update progress status state
                                handleExtraFieldChange('progress_status', e.target.value); // Store value in extra fields
                            }}
                        >
                            <option value="">Select Progress Status</option>
                            <option value="Completed">Completed</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Pending">Pending</option>
                        </select>

                        {/* Render additional fields if "In Progress" is selected */}
                        {progressStatus === "In Progress" && (
                            <>
                                <label className={styles.label}>Panels<span style={{ color: 'red' }}> *</span></label>
                                <textarea
                                    className={styles.textarea}
                                    placeholder="Enter panel members"
                                    onChange={(e) => handleExtraFieldChange('panels', e.target.value)}
                                />

                                <label className={styles.label}>Chairperson<span style={{ color: 'red' }}> *</span></label>
                                <textarea
                                    className={styles.textarea}
                                    placeholder="Enter chairperson"
                                    onChange={(e) => handleExtraFieldChange('chairperson', e.target.value)}
                                />

                                <label className={styles.label}>{defenseLabel} Date<span style={{ color: 'red' }}> *</span></label>
                                <input
                                    type="date"
                                    className={styles.input}
                                    onChange={(e) => handleExtraFieldChange(`${defenseLabel.toLowerCase()}_date`, e.target.value)}
                                />

                                <label className={styles.label}>{defenseLabel} Time<span style={{ color: 'red' }}> *</span></label>
                                <input
                                    type="time"
                                    className={styles.input}
                                    onChange={(e) => handleExtraFieldChange(`${defenseLabel.toLowerCase()}_time`, e.target.value)}
                                />

                                <label className={styles.label}>{defenseLabel} Venue<span style={{ color: 'red' }}> *</span></label>
                                <textarea
                                    className={styles.textarea}
                                    placeholder="Enter venue"
                                    onChange={(e) => handleExtraFieldChange(`${defenseLabel.toLowerCase()}_venue`, e.target.value)}
                                />
                            </>
                        )}
                    </>
                );
            }
            case 'committee_meeting':
            case 'committee_of_examiners_meeting':
            case 'jkit_correction_approval':
            case 'approval_of_correction_by_jkit':
            case 'senate_approval':
            case 'dissertation_chapters_1_2_3':
            case 'chapters_1_2_and_3_of_dissertation':
            case 'dissertation_all_chapters':
            case 'all_chapters_of_dissertation':
            case 'dissertation_submission_examination':
            case 'dissertation_submission_for_examination':
            case 'dissertation_submission_correction':
            case 'dissertation_submission_after_correction':
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
                        <optgroup label="Student Information">
                            <option value="update_status">Update Student Status</option>
                            <option value="workshops_attended">Workshops Attended</option>
                            <option value="change_study_plan">Change Study Plan</option>
                            <option value="extension_candidature_period">Extension of Candidature Period</option>
                        </optgroup>
                        {Object.keys(tasksOptions).map((category) => (
                            <optgroup key={category} label={category}>
                                {tasksOptions[category].map((task) => (
                                    <option key={task.id} value={task.unique_identifier}>
                                        {task.name}
                                    </option>
                                ))}
                            </optgroup>
                        ))}
                    </select>

                    {renderExtraFields()}

                    <label className={styles.label}>Date of Update<span style={{ color: 'red' }}> *</span></label>
                    <input
                        className={styles.input}
                        type="date"
                        ref={dateInputRef}
                        onChange={(e) => handleExtraFieldChange('completion_date', e.target.value)}
                    />

                    <label className={styles.label}>Evidence (Optional)</label>
                    <input
                        className={styles.input}
                        type="file"
                        accept="image/*, application/pdf"
                        onChange={handleFileChange}
                        ref={fileInputRef}
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
                        <button type="button" onClick={() => handleSave(evidence)} className={styles.saveButton}>Save</button>
                        <button type="button" onClick={handleFormClose} className={styles.closeButton}>Cancel</button>
                    </div>
                </form>
            </div>
        </>
    );
}

export default UpdateProgressModal;