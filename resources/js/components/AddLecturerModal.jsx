import React, { useState, useEffect, useRef } from 'react';
import styles from './addsemestermodal.module.css';

function AddLecturerModal({ isOpen, onClose, onSubmit, initialData, onDelete }) {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [umEmail, setUmEmail] = useState('');
    const [status, setStatus] = useState('');
    const [role, setRole] = useState('');
    const [program, setProgram] = useState('');
    const [remarks, setRemarks] = useState('');

    const modalRef = useRef(null);

    // Reset form fields when modal is closed
    useEffect(() => {
        if (!isOpen) {
            setFirstName('');
            setLastName('');
            setUmEmail('');
            setRole('');
            setProgram('');
            setRemarks('');
            setStatus('');
        } else if (initialData) {
            setFirstName(initialData.first_name || '');
            setLastName(initialData.last_name || '');
            setUmEmail(initialData.um_email || '');
            setRole(initialData.role || '');
            setProgram(initialData.program || '');
            setRemarks(initialData.remarks || '');
            setStatus(initialData.status || '');
        }
    }, [isOpen, initialData]);

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleClickOutside = (event) => {
        if (modalRef.current && !modalRef.current.contains(event.target)) {
            onClose(); // Close the modal when clicking outside
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!firstName) {
            alert("First name is required.");
            return;
        } else if (!lastName) {
            alert("Last name is required.");
            return;
        } else if (!umEmail) {
            alert("UM email is required.");
            return;
        } else if (!status) {
            alert("Status is required.");
            return;
        } else if (!role) {
            alert("Role is required.");
            return;
        } else if (!program) {
            alert("Program is required.");
            return;
        }

        if (window.confirm("Are you sure you want to save these changes?")) {
            onSubmit({
                first_name: firstName,
                last_name: lastName,
                um_email: umEmail,
                status: status,
                role: role,
                program: program,
                remarks: remarks,
                id: initialData?.id, // Include the ID if editing
            });
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent} ref={modalRef}>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label>First Name</label>
                        <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Last Name</label>
                        <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>UM Email</label>
                        <input
                            type="email"
                            value={umEmail}
                            onChange={(e) => setUmEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Role</label>
                        <select value={role} onChange={(e) => setRole(e.target.value)}>
                            <option value="">Select the role</option>
                            <option value="supervisor">Supervisor</option>
                            <option value="coordinator">Coordinator</option>
                            <option value="both">Supervisor & Coordinator</option>
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Program</label>
                        <select value={program} onChange={(e) => setProgram(e.target.value)}>
                            <option value="">Select the program</option>
                            <option value="MSE (ST)">MSE (ST)</option>
                            <option value="MCS (AC)">MCS (AC)</option>
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Remarks</label>
                        <input
                            type="text"
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            placeholder="Add remarks if inactive/deactivated"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Status</label>
                        <select value={status} onChange={(e) => setStatus(e.target.value)}>
                            <option value="">Select the status</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                            <option value="Deactivated">Deactivated</option>
                        </select>
                    </div>

                    <div className={styles.buttons}>
                        <button type="button" className={styles.cancelButton} onClick={onClose}>Cancel</button>
                        {initialData && (
                            <button type="button" className={styles.deleteButton} onClick={onDelete}>Delete</button>
                        )}
                        <button type="submit" className={styles.saveButton}>
                            {initialData ? 'Update' : 'Add'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddLecturerModal;
