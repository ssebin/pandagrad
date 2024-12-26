import React, { useState, useRef, useEffect } from 'react';
import styles from './addsemestermodal.module.css';
import { retrieveAndDecrypt } from "./storage";
import axios from 'axios';

function EditIntakeModal({ isOpen, onClose, intakeId, currentIntakeSemester, currentIntakeYear, onIntakeUpdated, onIntakeDeleted }) {
    const [intakeSemester, setIntakeSemester] = useState(currentIntakeSemester);
    const [intakeYear, setIntakeYear] = useState(currentIntakeYear);
    const token = retrieveAndDecrypt('token');
    const modalRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!window.confirm("Are you sure you want to edit this intake?")) {
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
            const response = await axios.put(
                `/api/programs/intakes/${intakeId}`,
                { intake_semester: intakeSemester, intake_year: intakeYear },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            alert('Intake updated successfully!');

            // Notify parent component of the updated intake
            onIntakeUpdated(response.data);

            // Close the modal
            onClose();
        } catch (error) {
            alert('An error occurred while updating the intake. Please try again.');
            console.error('Error updating intake:', error);
        }
    };

    const handleDelete = async () => {
        if (
            !window.confirm(
                "Are you sure you want to delete this intake? This action cannot be undone."
            )
        ) {
            return;
        }

        try {
            await axios.delete(`/api/programs/intakes/${intakeId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
    
            alert('Intake deleted successfully!');
    
            // Notify parent component of the deletion
            onIntakeDeleted(intakeId);
    
            // Close the modal
            onClose();
        } catch (error) {
            alert('An error occurred while deleting the program. Please try again.');
            console.error('Error deleting program:', error);
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
                            placeholder="e.g. 2024/2025"
                            pattern="\d{4}/\d{4}"
                            required
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

export default EditIntakeModal;