import React, { useState, useRef, useEffect } from 'react';
import styles from './AddSemesterModal.module.css';
import { retrieveAndDecrypt } from "./storage";
import axios from 'axios';

function AddIntakeModal({ isOpen, onClose, programId, onIntakeAdded }) {
    const [intakeSemester, setIntakeSemester] = useState('');
    const [intakeYear, setIntakeYear] = useState('');
    const [duplicatedFromIntakeId, setDuplicatedFromIntakeId] = useState('');
    const [intakesWithTasks, setIntakesWithTasks] = useState([]);
    const token = retrieveAndDecrypt('token');
    const modalRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!window.confirm("Are you sure you want to add a new intake?")) {
            return;
        }

        const yearPattern = /^\d{4}\/\d{4}$/;
        if (!yearPattern.test(intakeYear)) {
            alert('Please enter a valid Intake Year in the format XXXX/XXXX.');
            return;
        }

        if (!intakeSemester) {
            alert('Please select an Intake Semester.');
            return;
        }

        try {
            const addIntakeResponse = await axios.post(
                `/api/programs/${programId}/intakes`,
                { intake_semester: intakeSemester, intake_year: intakeYear },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            const newIntake = addIntakeResponse.data;

            if (duplicatedFromIntakeId) {
                await axios.post(
                    '/api/tasks/copy-tasks',
                    {
                        source_intake_id: duplicatedFromIntakeId,
                        destination_intake_id: newIntake.id,
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    }
                );
                alert('Intake added and tasks duplicated successfully!');
            } else {
                alert('Intake added successfully!');
            }

            onIntakeAdded(newIntake);
            handleClose();
        } catch (error) {
            console.error('Error adding intake or duplicating tasks:', error);
            alert('An error occurred while adding the intake or duplicating tasks.');
        }
    };

    useEffect(() => {
        const fetchIntakesWithTasks = async () => {
            try {
                const response = await axios.get(`/api/programs/${programId}/intakes-with-tasks`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                setIntakesWithTasks(response.data);
            } catch (error) {
                console.error('Error fetching intakes with tasks:', error);
            }
        };

        if (programId) {
            fetchIntakesWithTasks();
        }
    }, [programId, token]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                handleClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    const handleClose = () => {
        setIntakeSemester('');
        setIntakeYear('');
        setDuplicatedFromIntakeId('');
        onClose();
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent} ref={modalRef}>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label>Intake Semester<span style={{ color: 'red' }}> *</span></label>
                        <select value={intakeSemester} onChange={(e) => setIntakeSemester(e.target.value)} required>
                            <option value="">Select the intake semester</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Intake Year<span style={{ color: 'red' }}> *</span></label>
                        <input
                            type="text"
                            value={intakeYear}
                            onChange={(e) => setIntakeYear(e.target.value)}
                            placeholder="e.g. 20XX/20XX"
                            pattern="\d{4}/\d{4}"
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Duplicate Tasks From</label>
                        <select value={duplicatedFromIntakeId} onChange={(e) => setDuplicatedFromIntakeId(e.target.value)}>
                            <option value="">None (Create an empty intake)</option>
                            {intakesWithTasks.map((intake) => (
                                <option key={intake.id} value={intake.id}>
                                    {`Semester ${intake.intake_semester}, ${intake.intake_year}`}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.buttons}>
                        <button type="button" className={styles.cancelButton} onClick={handleClose}>
                            Cancel
                        </button>
                        <button type="submit" className={styles.saveButton}>
                            Add
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddIntakeModal;