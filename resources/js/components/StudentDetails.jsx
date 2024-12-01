import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from './axiosConfig.js';
import { FaPencilAlt, FaFileAlt, FaPlus } from 'react-icons/fa';
import EditStudentModal from './EditStudentModal';
import UpdateProgressModal from './UpdateProgressModal';
import styles from './StudentDetails.module.css';
import ProgressFlowchart from './ProgressFlowchart.jsx';
import { useUser } from './UserContext';
import { StudentContext } from './StudentContext';

// const calculateStudentSemester = (intake, currentSemester) => {
//     const { semester: currentSem, academic_year: currentYearRange } = currentSemester;
//     const [currentYearStart, currentYearEnd] = currentYearRange.split('/').map(Number);

//     const [intakeSem, intakeYearRange] = intake.split(', ');
//     const [intakeYearStart, intakeYearEnd] = intakeYearRange.split('/').map(Number);
//     const intakeSemNumber = parseInt(intakeSem.split(' ')[1]);

//     let semesterCount = (currentYearStart - intakeYearStart) * 2;

//     if (currentSem === 2) {
//         semesterCount += 1;
//     }

//     if (intakeSemNumber === 2) {
//         semesterCount -= 1;
//     }

//     return semesterCount + 1;
// };

function StudentDetails() {
    const { id } = useParams();
    const { user } = useUser();
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [studyPlan, setStudyPlan] = useState(null);
    // const [studentProgress, seStudentProgress] = useState(null);
    const { studentsData, currentSemester, fetchStudentsData, semesters } = useContext(StudentContext);
    //const [studentCurrentTask, setStudentCurrentTask] = useState('Unknown');

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

    const fetchStudyPlan = async (studentId) => {
        try {
            const response = await axios.get(`/api/students/${studentId}/study-plan`);

            // Check if the response contains the study plan data
            if (response.data) {
                setStudyPlan(response.data);
            } else {
                console.log('Study plan not found for this student.');
            }
        } catch (error) {
            console.error('Error fetching study plan:', error);
        }
    };

    // const fetchStudentProgress = async (studentId) => {
    //     const token = localStorage.getItem('token');
    //     const headers = { Authorization: `Bearer ${token}` };

    //     try {
    //         const studentProgressResponse = await axios.get(`/api/students/${studentId}/progress`, { headers });
    //         seStudentProgress(studentProgressResponse.data);
    //     } catch (error) {
    //         console.error('Error fetching tasks:', error);
    //     }
    // };

    // const fetchTasks = async () => {
    //     try {
    //         const response = await axios.get('/api/tasks');
    //         setTasks(response.data);
    //     } catch (error) {
    //         console.error('Error fetching tasks:', error);
    //     }
    // };

    // const fetchCurrentSemester = async (studentId) => {
    //     try {
    //         const semesterResponse = await axios.get('/api/semesters/current');
    //         setCurrentSemester(semesterResponse.data);

    //         const studentResponse = await axios.get(`/api/students/${studentId}`);
    //         const studentData = studentResponse.data;
    //         setStudent(studentData);

    //         // Calculate student's current semester
    //         const calculatedSem = calculateStudentSemester(studentData.intake, semesterResponse.data);
    //         setCalculatedSemester(calculatedSem);
    //     } catch (error) {
    //         console.error('Error fetching student details:', error);
    //     }
    // };

    useEffect(() => {
        if (user.role === 'student') {
            // If the user is a student, use their ID from the user object
            fetchStudyPlan(user.id);
            //setStudentCurrentTask(currentTasks[user.id] || 'Unknown');
            //fetchCurrentSemester(user.id);
        } else {
            // For admin and lecturer, use the ID from the URL
            fetchStudyPlan(id);
            //setStudentCurrentTask(currentTasks[id] || 'Unknown');
            //fetchCurrentSemester(id);
        }
        //fetchCurrentSemester();
    }, [id, user]);

    const handleModalClose = () => {
        setIsModalOpen(false);
    };

    const handleModalOpen = () => {
        setIsModalOpen(true);
    };

    const handleUpdateModalOpen = () => {
        setIsUpdateModalOpen(true);
    };

    const handleUpdateModalClose = () => {
        setIsUpdateModalOpen(false);
    };

    if (error) {
        return <div>{error}</div>;
    }

    //if (!student || !currentSemester || calculatedSemester === null) return <div>Loading...</div>;
    if (!studentsData) return <p>Loading student details...</p>;

    // Flatten the studentsData object (merge all semester arrays into one array)
    const allStudents = Object.values(studentsData).flat();

    // Find the student by ID
    const student = allStudents.find(s => s.id === parseInt(id));


    if (!student) return <p>Student not found.</p>;

    //if (!studyPlan) return <p>Loading study plan...</p>;

    const formattedCGPA = student.cgpa ? parseFloat(student.cgpa).toFixed(2) : 'N/A';
    const workshops = student.workshops_attended ? student.workshops_attended.split(',').map(w => w.trim()) : [];

    const progressColor = getProgressColor(student.track_status);

    return (
        <div className={styles.studentDetails}>
            {user.role !== 'student' && (
                <>
                    <div className={styles.breadcrumbs}>
                        <Link to={`${basePath}/all-students`}>My Students</Link>
                        <span className={styles.breadcrumbSeparator}>&gt;</span>
                        <span>{student.first_name} {student.last_name}</span>
                    </div>
                </>
            )}
            <div className={styles.studentHeader}>
                <img
                    src={student.profile_pic.includes('profile-pic.png')
                        ? student.profile_pic
                        : `/storage/${student.profile_pic}`}
                    alt={`${student.first_name} ${student.last_name}`}
                    className={styles.profilePic}
                />
                <div className={styles.studentInfo}>
                    <div className={styles.studentNameStatus}>
                        <h1>
                            {student.first_name} {student.last_name}
                        </h1>
                        <span className={styles[`status-${student.status
                            .toLowerCase()
                            .replace(/terminated\s*\(i\)/g, 'terminated-i')
                            .replace(/terminated\s*\(f\)/g, 'terminated-f')
                            .replace(/\s+/g, '-')
                            .trim()}`]}>
                            {student.status}
                        </span>
                    </div>
                    <div className={styles.progressBarContainer}>
                        <p style={{ color: progressColor }}>{student.progress}% <span className={styles.trackStatus} style={{ color: progressColor }}>({student.track_status})</span></p>
                    </div>
                    <div className={styles.progressBar} style={{ width: `calc(25% + ${student.first_name.length + student.last_name.length + student.status.length}em)` }}>
                        <div className={styles.progressCompleted} style={{ width: `${student.progress}%`, backgroundColor: progressColor }}></div>
                    </div>
                </div>
                <div className={styles.studentActions}>
                    {user.role == 'admin' && (
                        <button className={styles.editButton} onClick={handleModalOpen}>
                            <FaPencilAlt className={styles.icon} /> Edit
                        </button>
                    )}
                    <button className={styles.viewFilesButton}>
                        <FaFileAlt /> View Submitted Files
                    </button>
                    {user.role !== 'lecturer_supervisor' && user.role !== 'lecturer_coordinator' && user.role !== 'lecturer_both' && (
                        <button className={styles.updateInfoButton} onClick={handleUpdateModalOpen}>
                            <FaPlus /> {user.role === 'student' ? 'Request Update' : 'Update Progress'}
                        </button>
                    )}
                </div>
            </div>
            <div className={styles.studentDetailsContainer}>
                <div className={styles.studentDetailsContent}>
                    <div className={`${styles.studentInfoBlock} ${styles.studentInfoBlockLeft}`}>
                        <div className={styles.infoItem}>
                            <div className={styles.infoItemTitle}>Intake</div>
                            <div className={styles.infoItemValue}>{student.intake}</div>
                        </div>
                        <div className={styles.infoItem}>
                            <div className={styles.infoItemTitle}>Max. Period</div>
                            <div className={styles.infoItemValue}>{student.max_sem}</div>
                        </div>
                        <div className={styles.infoItem}>
                            <div className={styles.infoItemTitle}>Current Semester</div>
                            <div className={styles.infoItemValue}>Semester {student.currentSemester}</div>
                        </div>
                        <div className={styles.infoItem}>
                            <div className={styles.infoItemTitle}>Matric Number</div>
                            <div className={styles.infoItemValue}>{student.matric_number}</div>
                        </div>
                        <div className={styles.infoItem}>
                            <div className={styles.infoItemTitle}>CGPA</div>
                            <div className={styles.infoItemValue}>{formattedCGPA}/4.00</div>
                        </div>
                    </div>
                    <div className={styles.verticalLine}></div>
                    <div className={`${styles.studentInfoBlock} ${styles.studentInfoBlockCenter}`}>
                        <div className={styles.infoItem}>
                            <div className={styles.infoItemTitle}>Program</div>
                            <div className={styles.infoItemValue}>{student.program}</div>
                        </div>
                        <div className={styles.infoItem}>
                            <div className={styles.infoItemTitle}>Supervisor</div>
                            {student.supervisor && (
                                <div className={styles.infoItemValue}>Dr. {student.supervisor}</div>
                            )}
                        </div>
                        <div className={styles.infoItem}>
                            <div className={styles.infoItemTitle}>Research Topic</div>
                            <div className={styles.infoItemValue}><span className={styles.multilineText}>{student.research}</span></div>
                        </div>
                        <div className={styles.infoItem}>
                            <div className={styles.infoItemTitle}>Current Task</div>
                            <div className={styles.infoItemValue}>{student.task}</div>
                        </div>
                    </div>
                    <div className={styles.verticalLine}></div>
                    <div className={styles.studentInfoBlock}>
                        <div className={styles.infoItem}>
                            <div className={styles.infoItemTitle}>Workshops Attended</div>
                            <div className={styles.infoItemValue}>
                                <ul className={styles.workshopsList}>
                                    {workshops.length > 0 ? (
                                        workshops.map(workshop => (
                                            <li key={workshop}>{workshop}</li>
                                        ))
                                    ) : (
                                        <li>None</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.flowchartContainer}>
                <h2>Study Plan</h2>
                {studyPlan && Object.keys(studyPlan).length > 0 ? (
                    <ProgressFlowchart
                        studyPlan={studyPlan}
                        intake={student.intake}
                        semesters={semesters}
                    />
                ) : (
                    <p>No study plan available.</p>
                )}
            </div>

            <EditStudentModal
                studentId={id}
                isOpen={isModalOpen}
                onClose={handleModalClose}
                onUpdate={fetchStudentsData}
                currentSemester={currentSemester}
            />

            <UpdateProgressModal
                studentId={id}
                isOpen={isUpdateModalOpen}
                onClose={handleUpdateModalClose}
                onUpdate={() => {
                    fetchStudentsData();
                    fetchStudyPlan(id);
                }}
            />
        </div>
    );
}

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

export default StudentDetails;