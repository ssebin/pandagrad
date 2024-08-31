import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaPencilAlt, FaFileAlt, FaPlus } from 'react-icons/fa';
import EditStudentModal from './EditStudentModal';
import styles from './StudentDetails.module.css';

function StudentDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [currentSemester, setCurrentSemester] = useState(null);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchStudentData = async () => {
        try {
            const response = await axios.get(`/api/students/${id}`);
            setStudent(response.data);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                setError('Student not found.');
                navigate('/all-students', { replace: true }); // Redirect to all students
            } else {
                setError('There was an error fetching the student data!');
            }
            console.log('There was an error fetching the student data!', error); 
        }
    }; 

    const fetchCurrentSemester = async () => {
        try {
            const response = await axios.get('/api/semesters/current');
            setCurrentSemester(response.data);
        } catch (error) {
            console.error('Error fetching current semester:', error);
        }
    };   

    useEffect(() => {
        fetchStudentData();
        fetchCurrentSemester();
    }, [id]);    

    const handleModalClose = () => {
        setIsModalOpen(false);
    };       

    const handleModalOpen = () => {
        setIsModalOpen(true);
    };

    if (error) {
        return <div>{error}</div>;
    }

    if (!student || !currentSemester) return <div>Loading...</div>;

    const formattedCGPA = student.cgpa ? parseFloat(student.cgpa).toFixed(2) : 'N/A';
    const workshops = student.workshops || ['Endnote', 'Turnitin'];

    const progressColor = getProgressColor(student.track_status);

    return (
        <div className={styles.studentDetails}>
            <div className={styles.breadcrumbs}>
                <Link to="/all-students">My Students</Link>
                <span className={styles.breadcrumbSeparator}>&gt;</span>
                <span>{student.first_name} {student.last_name}</span>
            </div>
            <div className={styles.studentHeader}>
                <img src={student.profile_pic} alt={`${student.first_name} ${student.last_name}`} className={styles.profilePic} />
                <div className={styles.studentInfo}>
                    <div className={styles.studentNameStatus}>
                        <h1>
                            {student.first_name} {student.last_name} 
                        </h1>
                        <span className={student.status.toLowerCase() === 'active' ? styles['status-active'] : styles['status-inactive']}>{student.status}</span>
                    </div>
                    <div className={styles.progressBarContainer}>
                        <p style={{ color: progressColor }}>{student.progress}% <span className={styles.trackStatus} style={{ color: progressColor }}>({student.track_status})</span></p>
                    </div>
                    <div className={styles.progressBar} style={{ width: `calc(25% + ${student.first_name.length + student.last_name.length + student.status.length}em)` }}>
                        <div className={styles.progressCompleted} style={{ width: `${student.progress}%`, backgroundColor: progressColor }}></div>
                    </div>
                </div>
                <div className={styles.studentActions}>
                    <button className={styles.editButton} onClick={handleModalOpen}>
                        <FaPencilAlt className={styles.icon} /> Edit
                    </button>
                    <button className={styles.viewFilesButton}>
                        <FaFileAlt /> View Submitted Files
                    </button>
                    <button className={styles.updateInfoButton}>
                        <FaPlus /> Update Progress
                    </button>
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
                            <div className={styles.infoItemTitle}>Current Semester</div>
                            <div className={styles.infoItemValue}>Semester {student.semester}</div>
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
                            <div className={styles.infoItemValue}>Dr. {student.supervisor}</div>
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
                                    {workshops.map(workshop => (
                                        <li key={workshop}>{workshop}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <EditStudentModal
                studentId={student.id}
                isOpen={isModalOpen}
                onClose={handleModalClose}
                onUpdate={fetchStudentData}
                currentSemester={currentSemester}
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