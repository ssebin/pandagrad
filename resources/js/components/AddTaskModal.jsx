import React, { useState, useEffect, useRef } from 'react';
import styles from './addsemestermodal.module.css';
import axios from 'axios';
import { retrieveAndDecrypt } from "./storage";

function AddTaskModal({ isOpen, onClose, intakeId, onTaskAdded }) {
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [taskWeight, setTaskWeight] = useState('');
    const [versionNumber] = useState(1); // Version number is fixed at 1
    const token = retrieveAndDecrypt('token');
    const modalRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate inputs
        if (!name || !category || !taskWeight) {
            alert('Please fill in all required fields.');
            return;
        }

        // Ensure taskWeight is a valid integer between 1 and 10
        const weight = parseInt(taskWeight, 10);
        if (isNaN(weight) || weight < 1 || weight > 10) {
            alert('Task Weight must be an integer between 1 and 10.');
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
                    task_weight: weight,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            alert('Task added successfully!');
            onTaskAdded(response.data);
            onClose();
        } catch (error) {
            alert('An error occurred while adding the task. Please try again.');
            console.error('Error adding task:', error);
        }
    };

    const handleClose = () => {
        setName('');
        setCategory('');
        setTaskWeight('');
        onClose();
    };

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