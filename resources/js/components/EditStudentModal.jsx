import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './EditStudentModal.module.css';
import { useNavigate } from 'react-router-dom';

function EditStudentModal({ studentId, isOpen, onClose, onUpdate, currentSemester }) {
    const navigate = useNavigate();
    const [student, setStudent] = useState({
        first_name: '',
        last_name: '',
        siswamail: '',
        supervisor: '',
        status: '',
        intake: '',
        semester: '',
        program: '',
        research: '',
        task: '',
        profile_pic: '',
        progress: '',
        track_status: '',
        cgpa: '',
        matric_number: '',
        remarks: ''
    });

    useEffect(() => {
        if (isOpen) {
            axios.get(`/api/students/${studentId}`)
                .then(response => {
                    setStudent(response.data);
                })
                .catch(error => {
                    console.error("There was an error fetching the student data!", error);
                });
        }
    }, [isOpen, studentId]);

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
        const updatedStudent = { ...student, [name]: value };

        if (name === 'intake') {
            updatedStudent.semester = calculateStudentSemester(value);
        }

        setStudent(updatedStudent);
    };

    const handleSave = () => {
        if (!window.confirm("Are you sure you want to save the changes?")) {
        return;
    }
        
        axios.put(`/api/students/${studentId}`, student)
            .then(response => {
                onUpdate();
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
            navigate('/all-students'); // Redirect to all students page
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

                    <label className={styles.label}>Status</label>
                    <select className={styles.select} name="status" value={student.status} onChange={handleChange} required>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>

                    <label className={styles.label}>Intake</label>
                    <select className={styles.select} name="intake" value={student.intake} onChange={handleChange} required>
                        <option value="Sem 1, 2021/2022">Sem 1, 2021/2022</option>
                        <option value="Sem 2, 2021/2022">Sem 2, 2021/2022</option>
                        <option value="Sem 1, 2022/2023">Sem 1, 2022/2023</option>
                        <option value="Sem 2, 2022/2023">Sem 2, 2022/2023</option>
                        <option value="Sem 1, 2023/2024">Sem 1, 2023/2024</option>
                        <option value="Sem 2, 2023/2024">Sem 2, 2023/2024</option>
                    </select>

                    <label className={styles.label}>Matric Number</label>
                    <input className={styles.input} type="text" name="matric_number" value={student.matric_number} onChange={handleChange} required />

                    <label className={styles.label}>CGPA</label>
                    <input className={styles.input} type="number" step="0.01" name="cgpa" value={student.cgpa} onChange={handleChange} required />

                    <label className={styles.label}>Program</label>
                    <select className={styles.select} name="program" value={student.program} onChange={handleChange} required>
                        <option value="MSE (ST)">MSE (ST)</option>
                        <option value="MCS (AC)">MCS (AC)</option>
                    </select>

                    <label className={styles.label}>Supervisor</label>
                    <select className={styles.select} name="supervisor" value={student.supervisor} onChange={handleChange} required>
                        <option value="Green">Dr. Green</option>
                        <option value="Blue">Dr. Blue</option>
                        <option value="Yellow">Dr. Yellow</option>
                        <option value="Red">Dr. Red</option>
                        <option value="Pink">Dr. Pink</option>
                        <option value="Orange">Dr. Orange</option>
                    </select>

                    <label className={styles.label}>Research Topic</label>
                    <input className={styles.input} type="text" name="research" value={student.research} onChange={handleChange} required />

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
