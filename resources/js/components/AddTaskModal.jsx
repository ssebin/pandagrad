import React, { useState, useEffect, useRef } from 'react';
import styles from './addsemestermodal.module.css';
import axios from 'axios';
import { retrieveAndDecrypt } from "./storage";
import Select from 'react-select';

function AddTaskModal({ isOpen, onClose, intakeId, onTaskAdded, programId }) {
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [taskWeight, setTaskWeight] = useState('');
    const [versionNumber] = useState(1); // Version number is fixed at 1
    const token = retrieveAndDecrypt('token');
    const modalRef = useRef(null);
    const [applyToOption, setApplyToOption] = useState('this'); // 'this', 'all', 'custom'
    const [intakes, setIntakes] = useState([]);
    const [selectedIntakes, setSelectedIntakes] = useState([]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate inputs
        if (!name || !category || !taskWeight) {
            alert('Please fill in all required fields.');
            return;
        }

        if (!window.confirm("Are you sure you want to add this task?")) {
            return;
        }

        try {
            const response = await axios.post(
                `/api/tasks/intake/${intakeId}`,
                {
                    name: name,
                    category: category,
                    task_weight: taskWeight,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const newTask = response.data;

            // Determine intake IDs to apply changes to
            let intakeIds = [];
            if (applyToOption === 'all') {
                intakeIds = intakes.map(intake => intake.id);
            } else if (applyToOption === 'custom') {
                intakeIds = selectedIntakes.map(intake => intake.value);
            }

            // Remove current intake ID from the list since we've already created the task there
            intakeIds = intakeIds.filter(id => id !== parseInt(intakeId));

            // Apply changes to other intakes if any
            if (intakeIds.length > 0) {
                await axios.post(
                    `/api/tasks/${newTask.id}/apply-changes`,
                    { intake_ids: intakeIds },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }

            alert('Task added successfully!');
            onTaskAdded(response.data);
            handleClose();
        } catch (error) {
            alert('An error occurred while adding the task. Please try again.');
            console.error('Error adding task:', error);
        }
    };

    const handleClose = () => {
        setName('');
        setCategory('');
        setTaskWeight('');
        setApplyToOption('this');
        onClose();
    };

    const intakeOptions = intakes.map(intake => ({
        value: intake.id,
        label: `Semester ${intake.intake_semester} ${intake.intake_year}`,
    }));

    useEffect(() => {
        if (isOpen) {
            axios.get(`/api/programs/${programId}/intakes`, {
                headers: { Authorization: `Bearer ${token}` },
            }).then(response => {
                setIntakes(response.data);
            }).catch(error => {
                console.error('Error fetching intakes:', error);
            });
        }
    }, [isOpen]);

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
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent} ref={modalRef}>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label>Name<span style={{ color: 'red' }}> *</span></label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Category<span style={{ color: 'red' }}> *</span></label>
                        <input
                            type="text"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Task Weight<span style={{ color: 'red' }}> *</span></label>
                        <input
                            type="number"
                            value={taskWeight}
                            onChange={(e) => setTaskWeight(e.target.value)}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Version Number</label>
                        <input
                            type="number"
                            value={versionNumber}
                            readOnly
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Apply to<span style={{ color: 'red' }}> *</span></label>
                        <select value={applyToOption} onChange={(e) => setApplyToOption(e.target.value)} required>
                            <option value="this">This Intake Only</option>
                            <option value="all">All Intakes</option>
                            <option value="custom">Selected Intakes</option>
                        </select>
                    </div>
                    {applyToOption === 'custom' && (
                        <div className={styles.formGroup}>
                            <label>Select Intakes<span style={{ color: 'red' }}> *</span></label>
                            <Select
                                isMulti
                                options={intakes.map(intake => ({
                                    value: intake.id,
                                    label: `Semester ${intake.intake_semester}, ${intake.intake_year}`,
                                }))}
                                value={selectedIntakes}
                                onChange={setSelectedIntakes}
                                required
                            />
                        </div>
                    )}
                    <div className={styles.buttons}>
                        <button type="button" className={styles.cancelButton} onClick={handleClose}>
                            Cancel
                        </button>
                        <button type="submit" className={styles.saveButton}>
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
export default AddTaskModal;