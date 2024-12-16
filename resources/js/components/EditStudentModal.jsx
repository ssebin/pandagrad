import React, { useState, useEffect, useContext } from 'react';
import axios from './axiosConfig.js';
import styles from './EditStudentModal.module.css';
import { useNavigate, useParams } from 'react-router-dom';
import { StudentContext } from './StudentContext';

function EditStudentModal({ studentId, isOpen, onClose, onUpdate, currentSemester }) {
    const navigate = useNavigate();
    // const [student, setStudent] = useState({
    //     first_name: '',
    //     last_name: '',
    //     siswamail: '',
    //     supervisor: '',
    //     status: '',
    //     intake: '',
    //     semester: '',
    //     program: '',
    //     research: '',
    //     task: '',
    //     profile_pic: '',
    //     progress: '',
    //     track_status: '',
    //     cgpa: '',
    //     matric_number: '',
    //     remarks: ''
    // });
    const { id } = useParams();
    const { studentsData, supervisors, fetchStudentsData, semesters } = useContext(StudentContext);

    // Flatten the studentsData object (merge all semester arrays into one array)
    const allStudents = Object.values(studentsData).flat();

    // Find the student by ID
    const initialStudent = allStudents.find(s => s.id === parseInt(id));

    const [student, setStudent] = useState(initialStudent);

    useEffect(() => {
        // Update the local state if the `initialStudent` changes
        setStudent(initialStudent);
    }, [initialStudent]);


    // useEffect(() => {
    //     if (isOpen) {
    //         axios.get(`/api/students/${studentId}`)
    //             .then(response => {
    //                 setStudent(response.data);
    //             })
    //             .catch(error => {
    //                 console.error("There was an error fetching the student data!", error);
    //             });
    //     }
    // }, [isOpen, studentId]);

    const calculateStudentSemester = (intake) => {
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

    const handleChange = (e) => {
        const { name, value } = e.target;

        setStudent((prevStudent) => {
            // Create a copy of the current student state
            const updatedStudent = { ...prevStudent, [name]: value };

            // Handle special cases
            if (name === 'intake') {
                // Update the semester based on the intake value
                updatedStudent.semester = calculateStudentSemester(value);
            } else if (name === 'supervisor_id') {
                // Update both supervisor_id and supervisor (first name only)
                const selectedSupervisor = supervisors.find(supervisor => supervisor.id === parseInt(value));
                updatedStudent.supervisor_id = selectedSupervisor ? selectedSupervisor.id : null;
                updatedStudent.supervisor = selectedSupervisor ? selectedSupervisor.first_name : null;
            }

            return updatedStudent;
        });
    };

    const handleSave = () => {
        if (!window.confirm("Are you sure you want to save the changes?")) {
            return;
        }
        axios.put(`/api/students/${studentId}`, student)
            .then(response => {
                onUpdate(studentId);
                onClose();
            })
            .catch(error => {
                console.error("There was an error updating the student data!", error);
            });
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this student?")) {
            return;
        }

        try {
            await axios.delete(`/api/students/${studentId}`);
            onClose(); // Close the modal
            fetchStudentsData(); // Fetch the updated student data
            navigate('/admin/all-students'); // Redirect to all students page
        } catch (error) {
            console.error('Error deleting student:', error);
        }
    };

    const renderOverlay = () => {
        if (isOpen) {
            return <div className={styles.modalOverlay} onClick={onClose}></div>;
        }
        return null;
    };

    if (!isOpen) {
        return null;
    }

    return (
        <>
            {renderOverlay()}
            <div className={styles.editStudentPopup}>
                <form className={styles.form}>
                    <label className={styles.label}>First Name</label>
                    <input className={styles.input} type="text" name="first_name" value={student.first_name} onChange={handleChange} required />

                    <label className={styles.label}>Last Name</label>
                    <input className={styles.input} type="text" name="last_name" value={student.last_name} onChange={handleChange} required />

                    <label className={styles.label}>Siswamail</label>
                    <input className={styles.input} type="email" name="siswamail" value={student.siswamail} onChange={handleChange} required />

                    <label className={styles.label}>Student Status</label>
                    <select className={styles.select} name="status" value={student.status} onChange={handleChange} required>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="GoT">GoT</option>
                        <option value="Non-GoT">Non-GoT</option>
                        <option value="PL">Personal Leave</option>
                        <option value="Withdrawn">Withdrawn</option>
                        <option value="TI">Terminated (I)</option>
                        <option value="TF">Terminated (F)</option>
                    </select>

                    <label className={styles.label}>Intake</label>
                    <select
                        className={styles.select}
                        name="intake"
                        value={student?.intake || ''}
                        onChange={handleChange}
                        required
                    >
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

                    <label className={styles.label}>Matric Number</label>
                    <input className={styles.input} type="text" name="matric_number" value={student.matric_number} onChange={handleChange} required />

                    <label className={styles.label}>CGPA</label>
                    <input className={styles.input} type="number" step="0.01" name="cgpa" value={student.cgpa || ''} onChange={handleChange} />

                    <label className={styles.label}>Program</label>
                    <select className={styles.select} name="program" value={student.program} onChange={handleChange} required>
                        <option value="MSE (ST)">MSE (ST)</option>
                        <option value="MCS (AC)">MCS (AC)</option>
                    </select>

                    {/* <label className={styles.label}>Supervisor</label>
                    <select className={styles.select} name="supervisor" value={student.supervisor} onChange={handleChange} required>                        
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
                        <option value="null">N/A</option>
                    </select> */}

                    <label className={styles.label}>Supervisor</label>
                    <select
                        className={styles.select}
                        name="supervisor_id"
                        value={student.supervisor_id || "null"} // Use `student.supervisor_id` to match the `value` of the option
                        onChange={handleChange}
                        required
                    >
                        {supervisors.map(supervisor => (
                            <option
                                key={supervisor.id}
                                value={supervisor.id} // Use `id` as the `value` for simplicity
                            >
                                Dr. {supervisor.first_name} {supervisor.last_name}
                            </option>
                        ))}
                        <option value="null">N/A</option>
                    </select>

                    <label className={styles.label}>Research Topic</label>
                    <input className={styles.input} type="text" name="research" value={student.research || ''} onChange={handleChange} />

                    <div className={styles.buttons}>
                        <button type="button" className={styles.cancelButton} onClick={onClose}>Cancel</button>
                        <button type="button" className={styles.deleteButton} onClick={handleDelete}>Delete</button>
                        <button type="button" className={styles.saveButton} onClick={handleSave}>Save</button>
                    </div>
                </form>
            </div>
        </>
    );
}

export default EditStudentModal;
