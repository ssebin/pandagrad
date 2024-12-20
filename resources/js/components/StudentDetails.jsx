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

function StudentDetails() {
    const { id } = useParams();
    const { user } = useUser();
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isViewFilesModalOpen, setIsViewFilesModalOpen] = useState(false);
    const [studyPlan, setStudyPlan] = useState(null);
    const [files, setFiles] = useState([]);
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

    const realId = user.role === 'student' ? user.id : id;

    const fetchStudyPlan = async (studentId) => {
        try {
            const response = await axios.get(`/api/students/${studentId}/study-plan`);

            if (response.data) {
                const studyPlan = response.data;
                setStudyPlan(studyPlan);
                console.log('Study plan:', studyPlan);

                // Extract evidence files along with their original file names
                const files = studyPlan.flatMap((semester, semesterIndex) => {
                    //console.log(`Semester ${semesterIndex + 1}:`, semester);

                    // Convert tasks object to an array
                    const tasks = semester.tasks ? Object.values(semester.tasks) : [];
                    //console.log(`Semester ${semesterIndex + 1} Tasks:`, tasks);

                    return tasks.flatMap((task, taskIndex) => {
                        //console.log(`Task ${taskIndex + 1} in Semester ${semesterIndex + 1}:`, task);

                        // Ensure progress_updates is an array
                        const progressUpdates = Array.isArray(task.progress_updates) ? task.progress_updates : [];
                        //console.log(`Task ${taskIndex + 1} Progress Updates:`, progressUpdates);

                        return progressUpdates
                            .filter((update) => update && update.evidence) // Ensure evidence exists
                            .map((update) => ({
                                evidence: update.evidence, // File path
                                originalFileName: update.original_file_name || update.evidence.split('/').pop(), // Fallback to file path
                            }));
                    });
                });

                //console.log('Extracted files:', files);
                setFiles(files); // Set the extracted files
            } else {
                console.log('Study plan not found for this student.');
            }
        } catch (error) {
            console.error('Error fetching study plan:', error);
        }
    };

    useEffect(() => {
        fetchStudyPlan(realId);
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

    const handleViewFilesModalOpen = () => setIsViewFilesModalOpen(true);
    const handleViewFilesModalClose = () => setIsViewFilesModalOpen(false);

    if (error) {
        return <div>{error}</div>;
    }

    //if (!student || !currentSemester || calculatedSemester === null) return <div>Loading...</div>;
    if (!studentsData) return <p>Loading student details...</p>;

    // Flatten the studentsData object (merge all semester arrays into one array)
    const allStudents = Object.values(studentsData).flat();
    //console.log(allStudents);

    const student = user.role === 'student'
        ? allStudents.find(s => s.id === parseInt(user.id))
        : allStudents.find(s => s.id === parseInt(id));

    if (!student) return <p>Student not found.</p>;

    //if (!studyPlan) return <p>Loading study plan...</p>;

    const formattedCGPA = student.cgpa ? parseFloat(student.cgpa).toFixed(2) : 'N/A';
    const workshops = student.workshops_attended ? student.workshops_attended.split(',').map(w => w.trim()) : [];

    const progressColor = getProgressColor(student.track_status);
    const solidColor = getSolidColor(student.track_status);

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
                            // .replace(/terminated\s*\(i\)/g, 'terminated-i')
                            // .replace(/terminated\s*\(f\)/g, 'terminated-f')
                            .replace(/\s+/g, '-')
                            .trim()}`]}>
                            {student.status}
                        </span>
                    </div>
                    <div className={styles.progressBarContainer}>
                        <p style={{ color: solidColor }}>{student.progress}% <span className={styles.trackStatus} style={{ color: solidColor }}>({student.track_status})</span></p>
                    </div>
                    <div className={styles.progressBar} style={{ width: `calc(25% + ${student.first_name.length + student.last_name.length + student.status.length}em)` }}>
                        <div className={styles.progressCompleted} style={{ width: `${student.progress}%`, background: progressColor }}></div>
                    </div>
                </div>
                <div className={styles.studentActions}>
                    {user.role == 'admin' && (
                        <button className={styles.editButton} onClick={handleModalOpen}>
                            <FaPencilAlt className={styles.icon} /> Edit
                        </button>
                    )}
                    <>
                        <button className={styles.viewFilesButton} onClick={handleViewFilesModalOpen}>
                            <FaFileAlt /> View Submitted Files
                        </button>
                        {isViewFilesModalOpen && (
                            <>
                                <div className={styles.modalOverlay} onClick={handleViewFilesModalClose}></div>
                                <div className={styles.updateProgressPopup}>
                                    <h2 style={{ marginBottom: "30px", textAlign: "center" }}>Submitted Files</h2>
                                    <div className={styles.filesContainer}>
                                        {files.length > 0 ? (
                                            files.map((file, index) => (
                                                <div key={index} className={styles.fileItem}>
                                                    <a
                                                        href={`/storage/${file.evidence}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{ color: "#0043CE", textDecoration: "underline" }}
                                                    >
                                                        {file.originalFileName}
                                                    </a>
                                                </div>
                                            ))
                                        ) : (
                                            <p style={{ textAlign: "center" }}>No files submitted.</p>
                                        )}
                                    </div>
                                    <div className={styles.buttons}>
                                        <button className={styles.closeButton} onClick={handleViewFilesModalClose}>
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </>
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
                            {student.supervisor_name && (
                                <div className={styles.infoItemValue}>Dr. {student.supervisor?.first_name} {student.supervisor?.last_name}</div>
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
                    <div className={`${styles.studentInfoBlock} ${styles.studentInfoBlockRight}`}>
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
                <h2 className='studyplan'>Study Plan</h2>
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
                studentId={realId}
                isOpen={isUpdateModalOpen}
                onClose={handleUpdateModalClose}
                onUpdate={() => {
                    fetchStudentsData();
                    fetchStudyPlan(realId);
                }}
                user={user}
            />
        </div>
    );
}

const getSolidColor = (status) => {
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

const getProgressColor = (status) => {
    switch (status.toLowerCase()) {
        case 'on track':
            return 'linear-gradient(90deg, #0043CE, #00A8FF)';
        case 'slightly delayed':
            return 'linear-gradient(90deg, #FF8D08, #FFD300)';
        case 'very delayed':
            return 'linear-gradient(90deg, #FF0808,rgb(249, 131, 131))';
        default:
            return '#ccc'; // Fallback for unknown status
    }
};
export default StudentDetails;