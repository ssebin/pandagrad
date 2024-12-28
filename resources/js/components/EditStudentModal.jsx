import React, { useState, useEffect, useContext } from 'react';
import axios from './axiosConfig.js';
import styles from './EditStudentModal.module.css';
import { useNavigate, useParams } from 'react-router-dom';
import { StudentContext } from './StudentContext';

function EditStudentModal({ studentId, isOpen, onClose, onUpdate, currentSemester }) {
    const navigate = useNavigate();
    const { id } = useParams();
    const { studentsData, supervisors, fetchStudentsData, programs, intakesByProgram, fetchIntakes } = useContext(StudentContext);

    // Flatten the studentsData object (merge all semester arrays into one array)
    const allStudents = Object.values(studentsData).flat();

    // Find the student by ID
    const initialStudent = allStudents.find(s => s.id === parseInt(id));

    const [student, setStudent] = useState(initialStudent || {});

    const [selectedProgramId, setSelectedProgramId] = useState(null);
    const [selectedSupervisorId, setSelectedSupervisorId] = useState(null);

    const intakes = selectedProgramId ? intakesByProgram[selectedProgramId] || [] : [];

    const handleProgramChange = (e) => {
        const programId = e.target.value;
        setSelectedProgramId(programId); // Update the selected program ID
        setSelectedSupervisorId(null); // Reset the selected supervisor ID
        fetchIntakes(programId); // Fetch intakes for the selected program
    };

    useEffect(() => {
        if (initialStudent) {
            setStudent(initialStudent);
            setSelectedProgramId(initialStudent.program_id);
            setSelectedSupervisorId(initialStudent.supervisor_id);
            fetchIntakes(initialStudent.program_id);
        }
    }, [initialStudent]);


    const calculateStudentSemester = (intake) => {
        if (!intake) return null;

        const { semester: currentSem, academic_year: currentYearRange } = currentSemester;
        const { intake_semester: intakeSem, intake_year: intakeYearRange } = intake;

        const [currentYearStart] = currentYearRange.split('/').map(Number);
        const [intakeYearStart] = intakeYearRange.split('/').map(Number);

        let semesterCount = (currentYearStart - intakeYearStart) * 2;

        if (currentSem === 2) {
            semesterCount += 1;
        }

        if (intakeSem === 2) {
            semesterCount -= 1;
        }

        return semesterCount + 1;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setStudent((prevStudent) => {
            const updatedStudent = { ...prevStudent, [name]: value };

            if (name === 'program_id') {
                const programId = value;
                setSelectedProgramId(programId);
                setSelectedSupervisorId(null);
                fetchIntakes(programId);

                // Reset supervisor and intake-related fields
                updatedStudent.supervisor_id = null;
                updatedStudent.supervisor = null;
                updatedStudent.intake_id = null;
                updatedStudent.semester = null;
            } else if (name === 'intake_id') {
                const intakeId = parseInt(value);
                const selectedIntake = intakes.find(intake => intake.id === intakeId);
                updatedStudent.intake_id = selectedIntake ? selectedIntake.id : null;
                updatedStudent.semester = calculateStudentSemester(selectedIntake);
            } else if (name === 'supervisor_id') {
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

        const duplicate = allStudents.find(
            (eachStudent) => eachStudent.siswamail === student.siswamail
        );
        if (duplicate && (!student || duplicate.id !== student.id)) {
            alert('A student with the same siswamail already exists!');
            return;
        }

        const newStudent = {
            ...student,
            program_id: parseInt(student.program_id),
            intake_id: parseInt(student.intake_id),
            supervisor_id: student.supervisor_id !== 'null' ? parseInt(student.supervisor_id) : null,
            // Ensure numbers are converted appropriately
        };

        axios.put(`/api/students/${studentId}`, newStudent)
            .then(response => {
                alert('Student updated successfully!');
                onUpdate(studentId);
                onClose();
            })
            .catch(async (error) => {
                if (error.response) {
                    // The request was made, and the server responded with a status code
                    if (error.response.status === 422) {
                        // Handle validation errors
                        const errorData = error.response.data; // Assuming the server sends validation errors in the response body
                        console.log('Validation error:', errorData);

                        if (errorData.messages && errorData.messages.matric_number) {
                            alert('A student with the same matric number already exists!');
                        } else {
                            alert('Update failed due to validation errors.');
                        }
                    } else {
                        console.error(`HTTP error! status: ${error.response.status}`);
                        alert('An error occurred during student update.');
                    }
                } else if (error.request) {
                    // The request was made, but no response was received
                    console.error('No response received:', error.request);
                    alert('No response from the server. Please check your network connection.');
                } else {
                    // Something happened in setting up the request that triggered an Error
                    console.error('Error', error.message);
                    alert('An error occurred while setting up the request.');
                }
            });
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this student?")) {
            return;
        }

        try {
            await axios.delete(`/api/students/${studentId}`);
            alert('Student deleted successfully!');
            onClose(); // Close the modal
            fetchStudentsData(); // Fetch the updated student data
            navigate('/admin/all-students'); // Redirect to all students page
        } catch (error) {
            console.error('Error deleting student:', error);
            alert('Failed to delete student. Please try again.');
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
                    <label className={styles.label}>First Name<span style={{ color: 'red' }}> *</span></label>
                    <input className={styles.input} type="text" name="first_name" value={student.first_name || ''} onChange={handleChange} required />

                    <label className={styles.label}>Last Name<span style={{ color: 'red' }}> *</span></label>
                    <input className={styles.input} type="text" name="last_name" value={student.last_name || ''} onChange={handleChange} required />

                    <label className={styles.label}>Siswamail<span style={{ color: 'red' }}> *</span></label>
                    <input className={styles.input} type="email" name="siswamail" value={student.siswamail || ''} onChange={handleChange} required />

                    <label className={styles.label}>Matric Number<span style={{ color: 'red' }}> *</span></label>
                    <input className={styles.input} type="text" name="matric_number" value={student.matric_number || ''} onChange={handleChange} required />

                    <label className={styles.label}>
                        Program<span style={{ color: 'red' }}> *</span>
                    </label>
                    <select
                        className={styles.select}
                        name="program_id"
                        value={student.program_id || ''}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select the program</option>
                        {programs && programs.length > 0 ? (
                            programs.map((program) => (
                                <option key={program.id} value={program.id}>
                                    {program.name}
                                </option>
                            ))
                        ) : (
                            <option value="">Loading programs...</option>
                        )}
                    </select>
                    {student.program_id && (
                        <>
                            <label className={styles.label}>Intake<span style={{ color: 'red' }}> *</span></label>
                            <select
                                className={styles.select}
                                name="intake_id"
                                value={student.intake_id || ''}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select the intake</option>
                                {intakes &&
                                    intakes
                                        .sort((a, b) => a.id - b.id)
                                        .map(intake => (
                                            <option key={intake.id} value={intake.id}>
                                                Sem {intake.intake_semester}, {intake.intake_year}
                                            </option>
                                        ))
                                }
                                <option value="null">N/A</option>
                            </select>
                        </>
                    )}
                    {student.program_id && (
                        <>
                            <label className={styles.label}>Supervisor<span style={{ color: 'red' }}> *</span></label>
                            <select
                                className={styles.select}
                                name="supervisor_id"
                                value={student.supervisor_id || "null"} // Use `student.supervisor_id` to match the `value` of the option
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select the supervisor</option>
                                {supervisors
                                    .filter(
                                        supervisor =>
                                            supervisor.status !== 'Deactivated' && // Exclude deactivated supervisors
                                            supervisor.program_id === parseInt(student.program_id) // Ensure programs match
                                    )
                                    .map(supervisor => (
                                        <option
                                            key={supervisor.id}
                                            value={supervisor.id} // Use `id` as the `value` for simplicity
                                        >
                                            Dr. {supervisor.first_name} {supervisor.last_name}
                                        </option>
                                    ))}
                                <option value="null">N/A</option>
                            </select>
                        </>
                    )}
                    <label className={styles.label}>Research Topic</label>
                    <input className={styles.input} type="text" name="research" value={student.research || ''} onChange={handleChange} />

                    <label className={styles.label}>CGPA</label>
                    <input className={styles.input} type="number" step="0.01" name="cgpa" value={student.cgpa || ''} onChange={handleChange} />

                    <label className={styles.label}>Nationality<span style={{ color: 'red' }}> *</span></label>
                    <select className={styles.select} name="nationality" value={student.nationality || ''} onChange={handleChange} required>
                        <option value="">Select the nationality</option>
                        <option value="Malaysian">Malaysian</option>
                        <option value="Non-Malaysian">Non-Malaysian</option>
                    </select>

                    <label className={styles.label}>Student Status<span style={{ color: 'red' }}> *</span></label>
                    <select className={styles.select} name="status" value={student.status || ''} onChange={handleChange} required>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="GoT">GoT</option>
                        <option value="Non-GoT">Non-GoT</option>
                        <option value="PL">Personal Leave</option>
                        <option value="Withdrawn">Withdrawn</option>
                        <option value="TI">Terminated (I)</option>
                        <option value="TF">Terminated (F)</option>
                        <option value="Deactivated">Deactivated</option>
                    </select>

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
