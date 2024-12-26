import React, { useState, useRef, useEffect } from 'react';
import styles from './addsemestermodal.module.css';
import axios from 'axios';
import { retrieveAndDecrypt } from "./storage";
import Select from 'react-select';

function TaskModal({ isOpen, onClose, task, onTaskUpdated, onTaskDeleted, programId, intakeId }) {
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [taskWeight, setTaskWeight] = useState('');
    const [versionNumber, setVersionNumber] = useState('');
    const [applyToOption, setApplyToOption] = useState('this'); // 'this', 'all', 'custom'
    const [intakes, setIntakes] = useState([]);
    const [selectedIntakes, setSelectedIntakes] = useState([]);
    const token = retrieveAndDecrypt('token');
    const modalRef = useRef(null);

    useEffect(() => {
        if (isOpen && task) {
            setName(task.name || '');
            setCategory(task.category || '');
            setTaskWeight(task.task_weight || '');
            setVersionNumber(task.version_number || '');
        }
    }, [isOpen, task]);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!window.confirm("Are you sure you want to save changes to this task?")) {
            return;
        }

        try {
            const response = await axios.put(
                `/api/tasks/${task.id}`,
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
            const updatedTask = response.data;

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
                    `/api/tasks/${updatedTask.id}/apply-changes`,
                    { intake_ids: intakeIds },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }

            alert('Task updated successfully!');
            onTaskUpdated(response.data);
            onClose();
        } catch (error) {
            alert('An error occurred while updating the task. Please try again.');
            console.error('Error updating task:', error);
        }
    };

    const handleClose = () => {
        setName('');
        setCategory('');
        setTaskWeight('');
        setApplyToOption('this');
        onClose();
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this task? This action cannot be undone.")) {
            return;
        }

        try {
            let intakeIds = [];

            if (applyToOption === 'this') {
                // Delete only in this intake
                await axios.delete(`/api/tasks/${task.id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
            } else {
                if (applyToOption === 'all') {
                    intakeIds = intakes.map((intake) => intake.id);
                } else if (applyToOption === 'custom') {
                    intakeIds = selectedIntakes.map((intake) => intake.value);
                }

                // Ensure current intake is included if necessary
                if (!intakeIds.includes(parseInt(intakeId))) {
                    intakeIds.push(parseInt(intakeId));
                }

                await axios.post(
                    `/api/tasks/${task.id}/apply-delete`,
                    { intake_ids: intakeIds },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
            }

            alert('Task deleted successfully!');
            onTaskDeleted(task.id);
            handleClose();
        } catch (error) {
            alert('An error occurred while deleting the task. Please try again.');
            console.error('Error deleting task:', error);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen || !task) {
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
                        <button type="button" className={styles.cancelButton} onClick={onClose}>
                            Cancel
                        </button>
                        <button type="button" className={styles.deleteButton} onClick={handleDelete}>
                            Delete
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
export default TaskModal;