import React, { useEffect, useState } from 'react';
import './AllStudents.css';
import { FaFilter, FaPlus, FaSearch } from 'react-icons/fa';
import axios from 'axios';
import { Link } from 'react-router-dom';

const getColor = (index) => {
    const colors = ['#1E293B', '#306BFF', '#FFB580', '#78C552', '#FFD700', '#ff5b7b'];
    return colors[index % colors.length];
};

const getTaskColor = (task, opacity) => {
    const taskColors = {
        "Dissertation": `rgba(255, 99, 71, ${opacity})`,        // Tomato
        "Candidature Defence": `rgba(255, 100, 193, ${opacity})`, // Pink
        "Literature Review": `rgba(32, 178, 170, ${opacity})`,   // LightSeaGreen
        "Proposal Defence": `rgba(70, 130, 180, ${opacity})`,    // SteelBlue
        "Final Report": `rgba(255, 215, 0, ${opacity})`,         // Gold
        "Core Courses": `rgba(200, 150, 0, ${opacity})`,         // DarkOrange
        "Draft of Dissertation": `rgba(147, 112, 219, ${opacity})` // MediumPurple
    };
    return taskColors[task] || `rgba(224, 224, 224, ${opacity})`;
};

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

const calculateCurrentSemester = (semesters) => {
    const today = new Date();
    const currentSemester = semesters.find(semester => {
        const startDate = new Date(semester.start_date);
        const endDate = new Date(semester.end_date);
        return today >= startDate && today <= endDate;
    });

    if (!currentSemester) return { semester: null, academic_year: null };
    return { semester: currentSemester.semester, academic_year: currentSemester.academic_year };
};

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
    const [studentsData, setStudentsData] = useState({});
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
    const [currentSemester, setCurrentSemester] = useState(null);

    const fetchStudentsData = async () => {
        try {
            const semesterResponse = await axios.get('/api/semesters');
            const semesters = semesterResponse.data;
            const currentSem = calculateCurrentSemester(semesters);
            setCurrentSemester(currentSem);

            const studentResponse = await axios.get('/api/students');
            const students = studentResponse.data;

            students.forEach(student => {
                student.currentSemester = calculateStudentSemester(student.intake, currentSem);
            });

            const groupedStudents = students.reduce((acc, student) => {
                const intake = student.intake;
                if (!acc[intake]) {
                    acc[intake] = [];
                }
                acc[intake].push(student);
                return acc;
            }, {});

            // Sort intakes in descending order (oldest to newest)
            const sortedIntakes = Object.keys(groupedStudents).sort((a, b) => {
                const [aSem, aYearRange] = a.split(', ');
                const [bSem, bYearRange] = b.split(', ');
                const [aYearStart] = aYearRange.split('/').map(Number);
                const [bYearStart] = bYearRange.split('/').map(Number);
                const aSemNumber = parseInt(aSem.split(' ')[1]);
                const bSemNumber = parseInt(bSem.split(' ')[1]);
                
                if (aYearStart === bYearStart) {
                    return bSemNumber - aSemNumber;
                }
                return bYearStart - aYearStart;
            });

            const sortedGroupedStudents = {};
            sortedIntakes.forEach(intake => {
                sortedGroupedStudents[intake] = groupedStudents[intake].sort((a, b) =>
                    `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`)
                );
            });

            setStudentsData(sortedGroupedStudents);
        } catch (error) {
            console.error("There was an error fetching the students!", error);
        }
    };

    useEffect(() => {
        fetchStudentsData();
    }, []);

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

    const filterStudents = (students) => {
        return students.filter(student =>
            (searchKeyword === "" ||
                student.first_name.toLowerCase().includes(searchKeyword) ||
                student.last_name.toLowerCase().includes(searchKeyword) ||
                student.supervisor.toLowerCase().includes(searchKeyword) ||
                student.matric_number.toLowerCase().includes(searchKeyword) ||
                student.research.toLowerCase().includes(searchKeyword)) &&
            (filters.programs.length === 0 || filters.programs.includes(student.program)) &&
            (filters.tasks.length === 0 || filters.tasks.includes(student.task)) &&
            (filters.progress.length === 0 || filters.progress.includes(student.track_status))
        );
    };

    const handleAddStudent = async (event) => {
        event.preventDefault();
        
        if (!window.confirm("Are you sure you want to add this student?")) {
            return;
        }

        const newStudent = {
            first_name: event.target.first_name.value,
            last_name: event.target.last_name.value,
            siswamail: event.target.siswamail.value,
            supervisor: event.target.supervisor.value,
            status: event.target.status.value,
            intake: event.target.intake.value,
            semester: calculateStudentSemester(event.target.intake.value, currentSemester),
            program: event.target.program.value,
            research: event.target.research.value,
            task: "Core Courses",
            profile_pic: "/images/profile-pic.png",
            progress: 0,
            track_status: "On Track",
            cgpa: parseFloat(event.target.cgpa.value),
            matric_number: event.target.matric_number.value,
            remarks: "",
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

    return (
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
                    <button className="add-student-button" onClick={() => setShowAddStudentPopup(true)}>
                        <FaPlus className="add" /> Add a Student
                    </button>
                </div>
            </div>
            {showFilterPopup && (
                <div className="filter-popup">
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
                    <div className="filter-category">
                        <h4>Current Task</h4>
                        <label>
                            <input
                                type="checkbox"
                                checked={tempFilters.tasks.includes('Core Courses')}
                                onChange={() => handleTempFilterChange('tasks', 'Core Courses')}
                            />
                            Core Courses
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                checked={tempFilters.tasks.includes('Proposal Defence')}
                                onChange={() => handleTempFilterChange('tasks', 'Proposal Defence')}
                            />
                            Proposal Defence
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                checked={tempFilters.tasks.includes('Draft of Dissertation')}
                                onChange={() => handleTempFilterChange('tasks', 'Draft of Dissertation')}
                            />
                            Draft of Dissertation
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                checked={tempFilters.tasks.includes('Candidature Defence')}
                                onChange={() => handleTempFilterChange('tasks', 'Candidature Defence')}
                            />
                            Candidature Defence
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                checked={tempFilters.tasks.includes('Dissertation')}
                                onChange={() => handleTempFilterChange('tasks', 'Dissertation')}
                            />
                            Dissertation
                        </label>
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
                        <label>First Name</label>
                        <input type="text" name="first_name" placeholder="First Name" required />

                        <label>Last Name</label>
                        <input type="text" name="last_name" placeholder="Last Name" required />

                        <label>Siswamail</label>
                        <input type="email" name="siswamail" placeholder="Siswamail" required />

                        <label>Status</label>
                        <select name="status" required>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>

                        <label>Intake</label>
                        <select name="intake" required>
                            <option value="Sem 1, 2021/2022">Sem 1, 2021/2022</option>
                            <option value="Sem 2, 2021/2022">Sem 2, 2021/2022</option>
                            <option value="Sem 1, 2022/2023">Sem 1, 2022/2023</option>
                            <option value="Sem 2, 2022/2023">Sem 2, 2022/2023</option>
                            <option value="Sem 1, 2023/2024">Sem 1, 2023/2024</option>
                            <option value="Sem 2, 2023/2024">Sem 2, 2023/2024</option>
                        </select>

                        <label>Matric Number</label>
                        <input type="text" name="matric_number" placeholder="Matric Number" required />

                        <label>CGPA</label>
                        <input type="number" step="0.01" name="cgpa" placeholder="CGPA" required />

                        <label>Program</label>
                        <select name="program" required>
                            <option value="MSE (ST)">MSE (ST)</option>
                            <option value="MCS (AC)">MCS (AC)</option>
                        </select>

                        <label>Supervisor</label>
                        <select name="supervisor" required>
                            <option value="Green">Dr. Green</option>
                            <option value="Blue">Dr. Blue</option>
                            <option value="Yellow">Dr. Yellow</option>
                            <option value="Red">Dr. Red</option>
                            <option value="Pink">Dr. Pink</option>
                            <option value="Orange">Dr. Orange</option>
                        </select>

                        <label>Research Topic</label>
                        <input type="text" name="research" placeholder="Research Topic" required />

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                            <button type="button" className="cancel-button" onClick={() => setShowAddStudentPopup(false)}>Cancel</button>
                            <button type="submit" className="add-button">Add</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="student-columns-container">
                <div className="student-columns">
                    {Object.keys(studentsData).reverse().map((intake, index) => (
                        <div className="column" key={index}>
                            <div className="column-header">
                                <h2>{intake}</h2>
                                <span className="student-count">
                                    {studentsData[intake] ? filterStudents(studentsData[intake]).length : 0}
                                </span>
                            </div>
                            <hr style={{ borderColor: getColor(index) }} />
                            {studentsData[intake] && filterStudents(studentsData[intake]).map((student, idx) => (
                                <Link to={`/student/${student.id}`} key={idx} className="student-link">
                                    <div className="student-card" key={idx}>
                                        <div className="card-header">
                                            <h3>{student.first_name} <span className="supervisor">(Dr. {student.supervisor})</span></h3>
                                            <span className={`status ${student.status.toLowerCase()}`}>{student.status}</span>
                                        </div>
                                        <p className="semester">Semester {student.currentSemester} - {student.program}</p>
                                        <p className="research">{student.research}</p>
                                        <div className="task-profile">
                                            <div className="task" style={{ backgroundColor: `${getTaskColor(student.task, 0.2)}`, color: `${getTaskColor(student.task, 1)}`, padding: '3px 8px', borderRadius: '5px' }}>{student.task}</div>
                                            <img src={student.profile_pic} alt="Profile" className="profile-pic" />
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
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default AllStudents;
