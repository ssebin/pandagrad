import React, { useState, useEffect, useRef } from 'react';
import styles from './addsemestermodal.module.css';

function AddAdminModal({ isOpen, onClose, onSubmit, initialData, onDelete }) {
    const [adminName, setAdminName] = useState('');
    const [umEmail, setUmEmail] = useState('');
    const [remarks, setRemarks] = useState('');
    const [status, setStatus] = useState('');
    const modalRef = useRef(null);

    useEffect(() => {
        if (!isOpen) {
            setAdminName('');
            setUmEmail('');
            setRemarks('');
            setStatus('');
        } else if (initialData) {
            setAdminName(initialData.Name || '');
            setUmEmail(initialData.UMEmail || '');
            setRemarks(initialData.Remarks || '');
            setStatus(initialData.Status || '');
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

        if (!adminName) {
            alert("Admin name is required.");
            return;
        } else if (!umEmail) {
            alert("UM email is required.");
            return;
        } else if (!status) {
            alert("Status is required.");
            return;
        }

        if (window.confirm("Are you sure you want to save these changes?")) {
            onSubmit({
                Name: adminName,
                UMEmail: umEmail,
                Remarks: remarks,
                Status: status,
                role: 'admin',
                AdminID: initialData?.AdminID, // Include the ID if editing
            });
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent} ref={modalRef}>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label>Admin Name</label>
                        <input
                            type="text"
                            value={adminName}
                            onChange={(e) => setAdminName(e.target.value)}
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
                        <input type="text" value="admin" readOnly />
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

export default AddAdminModal;
