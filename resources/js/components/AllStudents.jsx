import React, { useRef, useEffect, useState, useContext } from 'react';
import { useUser } from './UserContext';
import './AllStudents.css';
import { FaFilter, FaPlus, FaSearch } from 'react-icons/fa';
import axios from './axiosConfig.js';
import { Link } from 'react-router-dom';
import { StudentContext } from './StudentContext';

const getColor = (index) => {
    const colors = ['#1E293B', '#306BFF', '#FFB580', '#78C552', '#FFD700', '#ff5b7b'];
    return colors[index % colors.length];
};

// const getTaskColor = (task, opacity) => {
//     const taskColors = {
//         "Dissertation": `rgba(255, 99, 71, ${opacity})`,        // Tomato
//         "Candidature Defence": `rgba(255, 100, 193, ${opacity})`, // Pink
//         "Literature Review": `rgba(32, 178, 170, ${opacity})`,   // LightSeaGreen
//         "Proposal Defence": `rgba(70, 130, 180, ${opacity})`,    // SteelBlue
//         "Final Report": `rgba(255, 215, 0, ${opacity})`,         // Gold
//         "Core Courses": `rgba(200, 150, 0, ${opacity})`,         // DarkOrange
//         "Draft of Dissertation": `rgba(147, 112, 219, ${opacity})` // MediumPurple
//     };
//     return taskColors[task] || `rgba(224, 224, 224, ${opacity})`;
// };

const getProgressColor = (status) => {
    switch (status.toLowerCase()) {
        case 'on track':
            return '#0043CE';
        case 'slightly delayed':
            return '#FF8D08';
        case 'very delayed':
            return '#FF0808';
        default:
            return '#ccc';
    }
};

// const calculateCurrentSemester = (semesters) => {
//     const today = new Date();
//     const currentSemester = semesters.find(semester => {
//         const startDate = new Date(semester.start_date);
//         const endDate = new Date(semester.end_date);
//         return today >= startDate && today <= endDate;
//     });

//     if (!currentSemester) return { semester: null, academic_year: null };
//     return { semester: currentSemester.semester, academic_year: currentSemester.academic_year };
// };

const calculateStudentSemester = (intake, currentSemester) => {
    const { semester: currentSem, academic_year: currentYearRange } = currentSemester;
    const [currentYearStart, currentYearEnd] = currentYearRange.split('/').map(Number);

    const [intakeSem, intakeYearRange] = intake.split(', ');
    const [intakeYearStart, intakeYearEnd] = intakeYearRange.split('/').map(Number);
    const intakeSemNumber = parseInt(intakeSem.split(' ')[1]);

    let semesterCount = (currentYearStart - intakeYearStart) * 2;

    if (currentSem === 2) {
        semesterCount += 1;
    }

    if (intakeSemNumber === 2) {
        semesterCount -= 1;
    }

    return semesterCount + 1;
};

function AllStudents() {
    // const [studentsData, setStudentsData] = useState({});
    const [searchKeyword, setSearchKeyword] = useState("");
    const [tempFilters, setTempFilters] = useState({
        programs: [],
        tasks: [],
        progress: [],
    });
    const [filters, setFilters] = useState({
        programs: [],
        tasks: [],
        progress: [],
    });
    const [showFilterPopup, setShowFilterPopup] = useState(false);
    const [showAddStudentPopup, setShowAddStudentPopup] = useState(false);
    const { user } = useUser();
    const filterPopupRef = useRef(null);
    const { studentsData, isLoading, currentSemester, supervisors, tasks, fetchTasks, fetchStudentsData, semesters } = useContext(StudentContext);
    const [taskColors, setTaskColors] = useState({});

    let basePath = "";
    if (user.role === "admin") {
        basePath = "/admin";
    } else if (user.role === "lecturer_supervisor") {
        basePath = "/lecturer/supervisor";
    } else if (user.role === "lecturer_coordinator") {
        basePath = "/lecturer/coordinator";
    } else if (user.role === "lecturer_both") {
        basePath = "/lecturer/both";
    }

    // const fetchSupervisors = async () => {
    //     try {
    //         const response = await axios.get('/api/lecturers?role=supervisor');
    //         setSupervisors(response.data);
    //     } catch (error) {
    //         console.error('Error fetching supervisors:', error);
    //     }
    // };

    // const fetchStudentsData = async () => {
    //     try {
    //         const semesterResponse = await axios.get('/api/semesters');
    //         const semesters = semesterResponse.data;
    //         const currentSem = calculateCurrentSemester(semesters);
    //         setCurrentSemester(currentSem);

    //         const studentResponse = await axios.get('/api/students?includeDetails=true');
    //         const students = studentResponse.data;

    //         students.forEach(student => {
    //             student.currentSemester = calculateStudentSemester(student.intake, currentSem);
    //         });

    //         const groupedStudents = students.reduce((acc, student) => {
    //             const intake = student.intake;
    //             if (!acc[intake]) {
    //                 acc[intake] = [];
    //             }
    //             acc[intake].push(student);
    //             return acc;
    //         }, {});

    //         // Sort intakes in descending order (oldest to newest)
    //         const sortedIntakes = Object.keys(groupedStudents).sort((a, b) => {
    //             const [aSem, aYearRange] = a.split(', ');
    //             const [bSem, bYearRange] = b.split(', ');
    //             const [aYearStart] = aYearRange.split('/').map(Number);
    //             const [bYearStart] = bYearRange.split('/').map(Number);
    //             const aSemNumber = parseInt(aSem.split(' ')[1]);
    //             const bSemNumber = parseInt(bSem.split(' ')[1]);

    //             if (aYearStart === bYearStart) {
    //                 return bSemNumber - aSemNumber;
    //             }
    //             return bYearStart - aYearStart;
    //         });

    //         const sortedGroupedStudents = {};
    //         sortedIntakes.forEach(intake => {
    //             sortedGroupedStudents[intake] = groupedStudents[intake].sort((a, b) =>
    //                 `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`)
    //             );
    //         });

    //         setStudentsData(sortedGroupedStudents);
    //     } catch (error) {
    //         console.error('Failed to fetch students:', error.response?.data || error.message);
    //         if (error.response?.status === 401) {
    //             // Handle token expiration, refresh token, or redirect to login
    //             console.log('Unauthorized - token might be expired');
    //         }
    //     }
    // };

    // useEffect(() => {
    //     fetchStudentsData();
    //     fetchSupervisors();
    // }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                filterPopupRef.current &&
                !filterPopupRef.current.contains(event.target)
            ) {
                setShowFilterPopup(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        // Generate colors only when tasks are available
        if (tasks && tasks.length > 0) {
            const colors = generateTaskColors(tasks);
            setTaskColors(colors);
        } else {
            // Fetch tasks only if not already fetched
            const fetchIfNeeded = async () => {
                await fetchTasks();
            };

            fetchIfNeeded();
        }
    }, [tasks]); // Dependency on tasks only

    const generateTaskColors = (tasks) => {
        const baseColors = [
            '255, 99, 71',        // Tomato
            '70, 130, 180',       // SteelBlue
            '255, 215, 0',        // Gold
            '32, 178, 170',       // LightSeaGreen
            '147, 112, 219',      // MediumPurple
            '255, 140, 0',        // DarkOrange
            '255, 182, 193',      // LightPink
            '173, 216, 230',      // LightBlue
            '46, 139, 87',        // SeaGreen
            '205, 92, 92',        // IndianRed
            '210, 180, 140',      // Tan
            '100, 149, 237',      // CornflowerBlue
            '244, 164, 96',       // SandyBrown
            '85, 107, 47',        // DarkOliveGreen
            '220, 20, 60',        // Crimson
        ];

        const taskColorMap = {};
        tasks.forEach((task, index) => {
            const color = baseColors[index % baseColors.length]; // Cycle through baseColors if tasks > colors
            taskColorMap[task.name] = color;
        });

        return taskColorMap;
    };

    const getTaskColor = (task, opacity) => {
        const defaultColor = `150, 150, 150`; // Default gray color
        const rgbColor = taskColors[task] || defaultColor;
        return `rgba(${rgbColor}, ${opacity})`;
    };

    const handleSearchInputChange = (e) => {
        setSearchKeyword(e.target.value.toLowerCase());
    };

    const handleTempFilterChange = (filterType, value) => {
        const newFilters = { ...tempFilters };
        if (newFilters[filterType].includes(value)) {
            newFilters[filterType] = newFilters[filterType].filter(item => item !== value);
        } else {
            newFilters[filterType].push(value);
        }
        setTempFilters(newFilters);
    };

    const handleApplyFilters = () => {
        setFilters(tempFilters);
        setShowFilterPopup(false);
    };

    const mappedStudentsData = studentsData
        ? Object.keys(studentsData).reduce((mappedData, intake) => {
            const mappedStudents = studentsData[intake].map((student) => {
                // Find the task object for the student's current task
                const task = tasks.find((t) => t.name === student.task);

                // Add taskCategory to each student
                return {
                    ...student,
                    taskCategory: task ? task.category : 'Unknown', // Default to 'Unknown' if no matching task
                };
            });

            return { ...mappedData, [intake]: mappedStudents };
        }, {})
        : {};

    const filterStudents = (students) => {
        return students.filter((student) => {
            const taskCategory = student.taskCategory;

            return (
                (searchKeyword === "" ||
                    (student.first_name && student.first_name.toLowerCase().includes(searchKeyword.toLowerCase())) ||
                    (student.last_name && student.last_name.toLowerCase().includes(searchKeyword.toLowerCase())) ||
                    (student.supervisor && student.supervisor.first_name && student.supervisor.first_name.toLowerCase().includes(searchKeyword.toLowerCase())) || // Access supervisor's first_name
                    (student.supervisor && student.supervisor.last_name && student.supervisor.last_name.toLowerCase().includes(searchKeyword.toLowerCase())) || // Access supervisor's last_name
                    (student.matric_number && student.matric_number.toLowerCase().includes(searchKeyword.toLowerCase())) ||
                    (student.research && student.research.toLowerCase().includes(searchKeyword.toLowerCase()))) &&
                (filters.programs.length === 0 || filters.programs.includes(student.program)) &&
                (filters.tasks.length === 0 || filters.tasks.includes(taskCategory)) &&
                (filters.progress.length === 0 || filters.progress.includes(student.track_status))
            );
        });
    };

    // const handleStudentClick = (studentId) => {
    //     const selectedStudent = students.find(student => student.id === studentId);
    //     console.log('Selected student:', selectedStudent); // Debugging purposes
    //     // Optionally store selected student data in state/context
    //     setSelectedStudent(selectedStudent);
    // };

    const handleAddStudent = async (event) => {
        event.preventDefault();

        if (!window.confirm("Are you sure you want to add this student?")) {
            return;
        }

        let selectedSupervisor = event.target.supervisor.value !== "null"
            ? JSON.parse(event.target.supervisor.value)
            : { id: null, name: null };

        const newStudent = {
            first_name: event.target.first_name.value,
            last_name: event.target.last_name.value,
            siswamail: event.target.siswamail.value,
            //supervisor: selectedSupervisor.name, // Save supervisor's name
            supervisor_id: selectedSupervisor.id, // Save supervisor's ID
            status: event.target.status.value,
            intake: event.target.intake.value,
            semester: calculateStudentSemester(event.target.intake.value, currentSemester),
            program: event.target.program.value,
            task: "Core Courses",
            profile_pic: "/images/profile-pic.png",
            progress: 0,
            track_status: "On Track",
            matric_number: event.target.matric_number.value,
            remarks: "",
            password: "password123", // default password
        };

        try {
            await axios.post('/api/students', newStudent);
            alert('Student added successfully');
            setShowAddStudentPopup(false);
            fetchStudentsData();
        } catch (error) {
            console.error('Error adding student:', error);
            alert('Failed to add student');
        }
    };

    const renderOverlay = () => {
        if (showAddStudentPopup) {
            return <div className="modal-overlay" onClick={() => setShowAddStudentPopup(false)}></div>;
        }
        return null;
    };

    // Extract unique categories
    // Extract unique categories sorted by task ID
    const uniqueTaskCategories = tasks
        ? [...new Map(tasks.sort((a, b) => a.id - b.id).map(task => [task.category, task])).values()]
            .map(task => task.category)
        : [];

    if (isLoading) return <p>Loading students...</p>;
    if (!studentsData) return <p>No student data available.</p>;
    if (!tasks) {
        console.error("Data not available: studentsData or tasks is undefined");
        return <p>Loading...</p>; // Render a fallback UI
    }

    return (
        <div className="all-students-container">
            <div className="all-students">
                {renderOverlay()}
                <div className="header">
                    <div className="title">
                        <h1>All Students</h1>
                        <p>Current Semester: {currentSemester ? `Sem ${currentSemester.semester}, ${currentSemester.academic_year}` : 'Loading...'}</p>
                    </div>
                    <div className="actions">
                        <div className="search-bar">
                            <FaSearch />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchKeyword}
                                onChange={handleSearchInputChange}
                            />
                        </div>
                        <button className="filter-button" onClick={() => setShowFilterPopup(!showFilterPopup)}>
                            Filter <FaFilter className="arrow" />
                        </button>
                        {user.role == "admin" && (
                            <button className="add-student-button" onClick={() => setShowAddStudentPopup(true)}>
                                <FaPlus className="add" /> Add a Student
                            </button>
                        )}
                    </div>
                </div>
                {showFilterPopup && (
                    <div className="filter-popup" ref={filterPopupRef}>
                        {user?.role === 'admin' && (
                            <div className="filter-category">
                                <h4>Program</h4>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={tempFilters.programs.includes('MSE (ST)')}
                                        onChange={() => handleTempFilterChange('programs', 'MSE (ST)')}
                                    />
                                    MSE (ST)
                                </label>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={tempFilters.programs.includes('MCS (AC)')}
                                        onChange={() => handleTempFilterChange('programs', 'MCS (AC)')}
                                    />
                                    MCS (AC)
                                </label>
                            </div>
                        )}
                        <div className="filter-category">
                            <h4>Current Task</h4>
                            {uniqueTaskCategories.map((category, index) => (
                                <label key={index}>
                                    <input
                                        type="checkbox"
                                        checked={tempFilters.tasks.includes(category)}
                                        onChange={() => handleTempFilterChange('tasks', category)}
                                    />
                                    {category}
                                </label>
                            ))}
                        </div>
                        <div className="filter-category">
                            <h4>Progress</h4>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={tempFilters.progress.includes('On Track')}
                                    onChange={() => handleTempFilterChange('progress', 'On Track')}
                                />
                                On Track
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={tempFilters.progress.includes('Slightly Delayed')}
                                    onChange={() => handleTempFilterChange('progress', 'Slightly Delayed')}
                                />
                                Slightly Delayed
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={tempFilters.progress.includes('Very Delayed')}
                                    onChange={() => handleTempFilterChange('progress', 'Very Delayed')}
                                />
                                Very Delayed
                            </label>
                        </div>
                        <button className="apply-button" onClick={handleApplyFilters}>Apply</button>
                    </div>
                )}

                {showAddStudentPopup && (
                    <div className="add-student-popup">
                        <form onSubmit={handleAddStudent}>
                            <label>First Name<span style={{ color: 'red' }}> *</span></label>
                            <input type="text" name="first_name" placeholder="First Name" required />

                            <label>Last Name<span style={{ color: 'red' }}> *</span></label>
                            <input type="text" name="last_name" placeholder="Last Name" required />

                            <label>Siswamail<span style={{ color: 'red' }}> *</span></label>
                            <input type="email" name="siswamail" placeholder="Siswamail" required />

                            <label>Matric Number<span style={{ color: 'red' }}> *</span></label>
                            <input type="text" name="matric_number" placeholder="Matric Number" required />

                            {/* <label>Intake<span style={{ color: 'red' }}> *</span></label>
                            <select name="intake" required>
                                <option value="Sem 1, 2021/2022">Sem 1, 2021/2022</option>
                                <option value="Sem 2, 2021/2022">Sem 2, 2021/2022</option>
                                <option value="Sem 1, 2022/2023">Sem 1, 2022/2023</option>
                                <option value="Sem 2, 2022/2023">Sem 2, 2022/2023</option>
                                <option value="Sem 1, 2023/2024">Sem 1, 2023/2024</option>
                                <option value="Sem 2, 2023/2024">Sem 2, 2023/2024</option>
                            </select> */}

                            <label>Intake<span style={{ color: 'red' }}> *</span></label>
                            <select name="intake" required>
                                {semesters &&
                                    Array.from(
                                        new Set(
                                            semesters.map(
                                                semester => `Sem ${semester.semester}, ${semester.academic_year}`
                                            )
                                        )
                                    ).map(intake => (
                                        <option key={intake} value={intake}>
                                            {intake}
                                        </option>
                                    ))}
                            </select>

                            <label>Program<span style={{ color: 'red' }}> *</span></label>
                            <select name="program" required>
                                <option value="MSE (ST)">MSE (ST)</option>
                                <option value="MCS (AC)">MCS (AC)</option>
                            </select>

                            <label>Status<span style={{ color: 'red' }}> *</span></label>
                            <select name="status" required>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                                <option value="GoT">GoT</option>
                                <option value="Non-GoT">Non-GoT</option>
                                <option value="PL">Personal Leave</option>
                                <option value="Withdrawn">Withdrawn</option>
                                <option value="TI">Terminated (I)</option>
                                <option value="TF">Terminated (F)</option>
                            </select>

                            <label>Supervisor<span style={{ color: 'red' }}> *</span></label>
                            <select name="supervisor" required>
                                <option value="null">N/A</option>
                                {supervisors.map(supervisor => (
                                    <option
                                        key={supervisor.id}
                                        value={JSON.stringify({
                                            id: supervisor.id,
                                            name: `${supervisor.first_name} ${supervisor.last_name}`
                                        })}
                                    >
                                        Dr. {supervisor.first_name} {supervisor.last_name}
                                    </option>
                                ))}
                            </select>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                                <button type="button" className="cancel-button" onClick={() => setShowAddStudentPopup(false)}>Cancel</button>
                                <button type="submit" className="add-button">Add</button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="student-columns-container">
                    <div className="student-columns">
                        {Object.keys(mappedStudentsData).reverse().map((intake, index) => (
                            <div className="column" key={index}>
                                <div className="column-header">
                                    <h2>{intake}</h2>
                                    <span className="student-count">
                                        {mappedStudentsData[intake] ? filterStudents(mappedStudentsData[intake]).length : 0}
                                    </span>
                                </div>
                                <hr style={{ borderColor: getColor(index) }} />
                                {mappedStudentsData[intake] &&
                                    filterStudents(mappedStudentsData[intake]).map((student, idx) => {
                                        const task = tasks.find(t => t.name === student.task);
                                        const taskCategory = task ? task.category : 'Unknown';

                                        return (
                                            <Link to={`${basePath}/student/${student.id}`} key={idx} className="student-link">
                                                <div className="student-card" key={idx}>
                                                    <div className="card-header">
                                                        <h3>
                                                            {student.first_name}{" "}
                                                            {student.supervisor?.first_name && (
                                                                <span className="supervisor">(Dr. {student.supervisor?.first_name})</span>
                                                            )}
                                                        </h3>
                                                        <span className={`status ${student.status
                                                            .toLowerCase()
                                                            // .replace(/terminated\s*\(i\)/g, 'ti')
                                                            // .replace(/terminated\s*\(f\)/g, 'tf')
                                                            .replace(/\s+/g, '-')
                                                            .trim()}`}>
                                                            {student.status}
                                                        </span>
                                                    </div>
                                                    <p className="semester">Semester {student.currentSemester} - {student.program}</p>
                                                    <p className="research">{student.research}</p>
                                                    <div className="task-profile">
                                                        <div className="task" style={{ backgroundColor: `${getTaskColor(student.task, 0.2)}`, color: `${getTaskColor(student.task, 1)}`, padding: '3px 8px', borderRadius: '5px' }}>{student.taskCategory || 'Unknown'}</div>
                                                        <img
                                                            src={student.profile_pic.includes('profile-pic.png')
                                                                ? student.profile_pic
                                                                : `/storage/${student.profile_pic}`}
                                                            alt="Profile"
                                                            className="profile-pic"
                                                        />
                                                    </div>
                                                    <div className="progress">
                                                        <span className="track-status" style={{ color: getProgressColor(student.track_status) }}>
                                                            {student.progress}% ({student.track_status})
                                                        </span>
                                                        <div className="progress-bar">
                                                            <div className="progress-completed" style={{ width: `${student.progress}%`, backgroundColor: getProgressColor(student.track_status) }}></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        );
                                    })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AllStudents;
