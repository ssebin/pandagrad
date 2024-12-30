import React, { useState, useEffect, useContext } from 'react';
import axios from './axiosConfig.js';
import styles from './EditStudentModal.module.css';
import { useNavigate, useParams } from 'react-router-dom';
import { StudentContext } from './StudentContext.jsx';

function StudentInfoModal({ selectedStudent, isOpen, onClose, onUpdate, currentSemester }) {
    const navigate = useNavigate();
    const { supervisors, studentsData, intakesByProgram, fetchIntakes, programs } = useContext(StudentContext);
    const [student, setStudent] = useState(selectedStudent || {});
    const [selectedProgramId, setSelectedProgramId] = useState(null);
    const [selectedIntakeId, setSelectedIntakeId] = useState(null);
    const [selectedSupervisorId, setSelectedSupervisorId] = useState(null);

    const students = studentsData && Object.keys(studentsData).length > 0
        ? Object.values(studentsData).flat()
        : [];

    const intakes = selectedProgramId ? intakesByProgram[selectedProgramId] || [] : [];

    useEffect(() => {
        if (selectedStudent) {
            setStudent(selectedStudent);
            setSelectedProgramId(selectedStudent.program_id);
            setSelectedSupervisorId(selectedStudent.supervisor_id);
            fetchIntakes(selectedStudent.program_id);
        }
    }, [selectedStudent]);

    useEffect(() => {
        if (!isOpen) {
            // Reset the form when the modal is closed
            setStudent({});
        } else if (selectedStudent) {
            // Set the student state when `selectedStudent` changes
            setStudent({
                id: selectedStudent.id || null,
                first_name: selectedStudent.first_name || '',
                last_name: selectedStudent.last_name || '',
                siswamail: selectedStudent.siswamail || '',
                matric_number: selectedStudent.matric_number || '',
                program_id: selectedStudent.program_id || '',
                intake_id: selectedStudent.intake_id || '',
                supervisor_id: selectedStudent.supervisor_id || null,
                research: selectedStudent.research || '',
                cgpa: selectedStudent.cgpa || '',
                nationality: selectedStudent.nationality || '',
                status: selectedStudent.status || '',
            });
        } else {
            // Reset the form for adding a new student
            setStudent({
                id: null,
                first_name: '',
                last_name: '',
                siswamail: '',
                matric_number: '',
                program_id: '',
                intake_id: '',
                supervisor_id: null,
                research: '',
                cgpa: '',
                nationality: '',
                status: '',
            });
        }
    }, [isOpen, selectedStudent]);

    // const calculateStudentSemester = (intake) => {
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

    // const handleChange = (e) => {
    //     const { name, value } = e.target;

    //     setStudent((prevStudent) => {
    //         // Create a copy of the current student state
    //         const updatedStudent = { ...prevStudent, [name]: value };

    //         // Handle special cases
    //         if (name === 'intake') {
    //             // Update the semester based on the intake value
    //             updatedStudent.semester = calculateStudentSemester(value);
    //         } else if (name === 'supervisor_id') {
    //             // Update both supervisor_id and supervisor (first name only)
    //             const selectedSupervisor = supervisors.find(supervisor => supervisor.id === parseInt(value));
    //             updatedStudent.supervisor_id = selectedSupervisor ? selectedSupervisor.id : null;
    //             updatedStudent.supervisor = selectedSupervisor ? selectedSupervisor.first_name : null;
    //         }

    //         return updatedStudent;
    //     });
    // };

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

    // const handleChange = (e) => {
    //     const { name, value } = e.target;

    //     setStudent((prevStudent) => {
    //         const updatedStudent = { ...prevStudent, [name]: value };

    //         if (name === 'program_id') {
    //             setSelectedProgramId(value);
    //             // Reset dependent fields
    //             updatedStudent.intake_id = '';
    //             updatedStudent.supervisor_id = '';
    //             setSelectedIntakeId(null);
    //             setSelectedSupervisorId(null);
    //             fetchIntakes(value);
    //         } else if (name === 'intake_id') {
    //             setSelectedIntakeId(value);
    //             // Calculate the semester based on intake
    //             const selectedIntake = intakes.find(intake => intake.id === parseInt(value));
    //             updatedStudent.semester = calculateStudentSemester(selectedIntake);
    //         } else if (name === 'supervisor_id') {
    //             setSelectedSupervisorId(value);
    //         }

    //         return updatedStudent;
    //     });
    // };

    const handleSave = () => {
        if (!window.confirm("Are you sure you want to save the changes?")) {
            return;
        }

        const duplicate = students.find(
            (eachStudent) =>
                eachStudent.siswamail === student.siswamail && eachStudent.id !== student.id
        );

        if (duplicate) {
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

        axios.put(`/api/students/${student.id}`, newStudent)
            .then(response => {
                onUpdate();
                onClose();
                alert("Student data updated successfully.");
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
            await axios.delete(`/api/students/${student.id}`);
            onUpdate();
            onClose();
            alert("Student deleted successfully.");
        } catch (error) {
            console.error('Error deleting student:', error);
            alert("An error occurred. Please try again.");
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
                    <input className={styles.input} type="text" name="first_name" value={student.first_name || ''} onChange={handleChange} required />

                    <label className={styles.label}>Last Name</label>
                    <input className={styles.input} type="text" name="last_name" value={student.last_name || ''} onChange={handleChange} required />

                    <label className={styles.label}>Siswamail</label>
                    <input className={styles.input} type="email" name="siswamail" value={student.siswamail || ''} onChange={handleChange} required />

                    <label className={styles.label}>Matric Number</label>
                    <input className={styles.input} type="text" name="matric_number" value={student.matric_number || ''} onChange={handleChange} required />

                    <label className={styles.label}>Program</label>
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
                            <label className={styles.label}>Intake</label>
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
                            <label className={styles.label}>Supervisor</label>
                            <select
                                className={styles.select}
                                name="supervisor_id"
                                value={student.supervisor_id || "null"} // Use `student.supervisor_id` to match the `value` of the option
                                onChange={handleChange}
                                required
                            >
                                {supervisors
                                    .filter(
                                        supervisor =>
                                            supervisor.status !== 'Deactivated' && // Exclude deactivated supervisors
                                            supervisor.program_id === parseInt(student.program_id) // Dynamically filter by the selected program
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

                    <label className={styles.label}>Nationality</label>
                    <select className={styles.select} name="nationality" value={student.nationality || ''} onChange={handleChange} required>
                        <option value="">Select the nationality</option>
                        <option value="Malaysian">Malaysian</option>
                        <option value="Non-Malaysian">Non-Malaysian</option>
                    </select>

                    <label className={styles.label}>Student Status</label>
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

export default StudentInfoModal;
