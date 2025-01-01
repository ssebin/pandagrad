import React, { useState, useRef, useEffect, useContext } from 'react';
import styles from './AddSemesterModal.module.css';
import { retrieveAndDecrypt } from "./storage";
import axios from 'axios';
import { StudentContext } from './StudentContext';

function AddProgramModal({ isOpen, onClose, onProgramAdded }) {
    const [programName, setProgramName] = useState('');
    const [duplicateFromProgramId, setDuplicateFromProgramId] = useState('');
    const { programs, fetchPrograms } = useContext(StudentContext);
    const token = retrieveAndDecrypt('token');
    const modalRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!window.confirm("Are you sure you want to add a new program?")) {
            return;
        }

        if (!programName) {
            alert('Please enter a Program Name.');
            return;
        }

        try {
            // Step 1: Create the new program
            const addProgramResponse = await axios.post(
                '/api/programs',
                { name: programName },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            const newProgram = addProgramResponse.data;

            // Step 2: Duplicate intakes and tasks if a program is selected
            if (duplicateFromProgramId) {
                await axios.post(
                    `/api/programs/${duplicateFromProgramId}/duplicate`,
                    { new_program_id: newProgram.id },
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    }
                );
                alert('Program added and duplicated successfully!');
            } else {
                alert('Program added successfully!');
            }

            onProgramAdded(newProgram);

            // Close the modal
            onClose();
        } catch (error) {
            alert('An error occurred while adding the program. Please try again.');
            console.error('Error adding program:', error);
        }
    };

    useEffect(() => {
        fetchPrograms();
    }, [token]);

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
        setProgramName('');
        setDuplicateFromProgramId('');
        onClose();
    }

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
                    <div className={styles.formGroup}>
                        <label>Duplicate Intakes & Tasks From</label>
                        <select
                            value={duplicateFromProgramId}
                            onChange={(e) => setDuplicateFromProgramId(e.target.value)}
                        >
                            <option value="">None (Create an empty program)</option>
                            {programs.map((program) => (
                                <option key={program.id} value={program.id}>
                                    {program.name}
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

export default AddProgramModal;