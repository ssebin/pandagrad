import React, { useState, useRef, useEffect } from 'react';
import styles from './addsemestermodal.module.css';
import axios from 'axios';
import { retrieveAndDecrypt } from "./storage";

function TaskModal({ isOpen, onClose, task, onTaskUpdated, onTaskDeleted }) {
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [taskWeight, setTaskWeight] = useState('');
    const [versionNumber, setVersionNumber] = useState('');
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

            alert('Task updated successfully!');
            onTaskUpdated(response.data);
            onClose();
        } catch (error) {
            alert('An error occurred while updating the task. Please try again.');
            console.error('Error updating task:', error);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this task? This action cannot be undone.")) {
            return;
        }

        try {
            await axios.delete(`/api/tasks/${task.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            alert('Task deleted successfully!');
            onTaskDeleted(task.id);
            onClose();
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