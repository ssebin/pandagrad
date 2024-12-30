import React, { useState, useRef, useEffect } from 'react';
import styles from './addsemestermodal.module.css';
import { retrieveAndDecrypt } from "./storage";
import axios from 'axios';

function EditProgramModal({ isOpen, onClose, programId, currentProgramName, onProgramUpdated, onProgramDeleted }) {
    const [programName, setProgramName] = useState(currentProgramName);
    const token = retrieveAndDecrypt('token');
    const modalRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!window.confirm("Are you sure you want to edit this program?")) {
            return;
        }

        try {
            const response = await axios.put(
                `/api/programs/${programId}`,
                { name: programName },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            alert('Program updated successfully!');

            // Notify parent component of the updated program
            onProgramUpdated(response.data);

            // Close the modal
            onClose();
        } catch (error) {
            alert('An error occurred while updating the program. Please try again.');
            console.error('Error updating program:', error);
        }
    };

    const handleDelete = async () => {
        if (
            !window.confirm(
                "Are you sure you want to delete this program? This action cannot be undone."
            )
        ) {
            return;
        }

        try {
            await axios.delete(`/api/programs/${programId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            alert('Program deleted successfully!');

            // Notify parent component of the deletion
            onProgramDeleted(programId);

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
                        <label>Program Name<span style={{ color: 'red' }}> *</span></label>
                        <input
                            type="text"
                            value={programName}
                            onChange={(e) => setProgramName(e.target.value)}
                            placeholder="Enter Program Name"
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

export default EditProgramModal;