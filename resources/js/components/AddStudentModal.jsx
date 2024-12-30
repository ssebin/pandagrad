import React, { useState, useRef, useEffect } from 'react';
import styles from './AddSemesterModal.module.css';
import axios from './axiosConfig.js';
import { use } from 'react';

function AddStudentModal({ isOpen, onClose, onUpdate, onBatchSummary }) {
    const [siswamail, setSiswamail] = useState('');
    const [file, setFile] = useState(null);
    const modalRef = useRef(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            setFile(selectedFile);
        } else {
            alert('Please upload a valid Excel file (.xlsx).');
        }
    };

    const handleSubmitSiswamail = async (e) => {
        e.preventDefault();

        if (!window.confirm("Are you sure you want to add a new student?")) {
            return;
        }
        
        try {
            // Add the default profile_pic value
            await axios.post('/api/students', {
                siswamail,
                profile_pic: '/images/profile-pic.png', // Default profile picture
            });
            alert('Student added successfully!');
            setSiswamail('');
            onUpdate();
            onClose();
        } catch (error) {
            console.error('Error adding student:', error);
            alert('Failed to add student. Please try again.');
        }
    };

    const handleSubmitExcel = async (e) => {
        e.preventDefault();

        if (!window.confirm("Are you sure you want to add new student(s)?")) {
            return;
        }
        
        if (!file) {
            alert('Please upload an Excel file.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('default_profile_pic', '/images/profile-pic.png'); // Include default profile picture

        try {
            const response = await axios.post('/api/students/batch', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            alert('Batch upload successful!');

            const { success_count, error_count, successful_entries, error_details } = response.data;

            // Call the onBatchSummary handler
            if (onBatchSummary) {
                onBatchSummary({
                    successCount: success_count,
                    errorCount: error_count,
                    successfulEntries: successful_entries,
                    errorDetails: error_details,
                });
            }
            
            setFile(null);
            onUpdate();
            onClose();
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Batch upload failed. Please try again.');
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

    useEffect(() => {
        if (!isOpen) {
            setSiswamail('');
            setFile(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent} ref={modalRef}>
                <form onSubmit={handleSubmitSiswamail}>
                    <div className={styles.formGroup}>
                        <label>Siswamail (Only one account)</label>
                        <input
                            type="email"
                            value={siswamail}
                            onChange={(e) => setSiswamail(e.target.value)}
                            placeholder="e.g. student@siswa.um.edu.my"
                            required
                        />
                    </div>
                    <div className={styles.buttons}>
                        <button type="button" className={styles.cancelButton} onClick={onClose}>Cancel</button>
                        <button type="submit" className={styles.saveButton}>Add</button>
                    </div>
                </form>
                <br></br>
                <div className={styles.divider}>
                    <span className={styles.dividerText}>Or</span>
                </div>
                <br></br>
                <form onSubmit={handleSubmitExcel}>
                    <div className={styles.formGroup}>
                        <label>Upload Excel File (Batch creation)</label>
                        <input
                            type="file"
                            accept=".xlsx"
                            onChange={handleFileChange}
                        />
                    </div>
                    <div className={styles.buttons}>
                        <button type="button" className={styles.cancelButton} onClick={onClose}>Cancel</button>
                        <button type="submit" className={styles.uploadButton}>Upload</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddStudentModal;