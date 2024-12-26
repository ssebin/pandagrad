import React, { useState, useEffect, useRef } from 'react';
import styles from './addsemestermodal.module.css';

function SemesterModal({ isOpen, onClose, onSubmit, initialData, semesters }) {
    const [semester, setSemester] = useState('');
    const [academicYear, setAcademicYear] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [remarks, setRemarks] = useState('');
    const modalRef = useRef(null);

    useEffect(() => {
        if (initialData) {
            setSemester(initialData.semester);
            setAcademicYear(initialData.academic_year);
            setStartDate(initialData.start_date);
            setEndDate(initialData.end_date);
            setRemarks(initialData.remarks);
        } else {
            setSemester('');
            setAcademicYear('');
            setStartDate('');
            setEndDate('');
            setRemarks('');
        }
    }, [initialData]);    

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

        if (new Date(startDate) >= new Date(endDate)) {
            alert("End date must be later than start date.");
            return;
        }

        const academicYearRegex = /^\d{4}\/\d{4}$/;
        if (!academicYearRegex.test(academicYear)) {
            alert("Academic year must be in the format 20XX/20XX.");
            return;
        }

        const today = new Date();
        let calculatedStatus = 'Upcoming';
        if (new Date(endDate) < today) {
            calculatedStatus = 'Ended';
        } else if (new Date(startDate) <= today && new Date(endDate) >= today) {
            calculatedStatus = 'Ongoing';
            // Ensure only one ongoing semester
            if (semesters.some(sem => sem.status === 'Ongoing' && (!initialData || sem.id !== initialData.id))) {
                alert("There can only be one ongoing semester at a time.");
                return;
            }
        }

        if (semesters.some(sem => sem.semester === semester && sem.academic_year === academicYear && (!initialData || sem.id !== initialData.id))) {
            alert("This semester already exists!");
            return;
        }

        if (window.confirm("Are you sure you want to save these changes?")) {
            onSubmit({ semester, academic_year: academicYear, start_date: startDate, end_date: endDate, remarks, status: calculatedStatus });
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent} ref={modalRef}>
                <form onSubmit={handleSubmit}>
                    <label>Semester<span style={{ color: 'red' }}> *</span></label>
                    <select value={semester} onChange={(e) => setSemester(e.target.value)} required>
                        <option value="1">1</option>
                        <option value="2">2</option>
                    </select>
                    <label>Academic Year<span style={{ color: 'red' }}> *</span></label>
                    <input
                        type="text"
                        value={academicYear}
                        onChange={(e) => setAcademicYear(e.target.value)}
                        placeholder="e.g. 20XX/20XX"
                        pattern="\d{4}/\d{4}"
                        required
                    />
                    <label>Start Date<span style={{ color: 'red' }}> *</span></label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                    <label>End Date<span style={{ color: 'red' }}> *</span></label>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                    <label>Remarks</label>
                    <input type="text" value={remarks || "N/A"} onChange={(e) => setRemarks(e.target.value)} />

                    <div className={styles.buttons}>
                        <button type="button" className={styles.cancelButton} onClick={onClose}>Cancel</button>
                        {initialData && initialData.status === 'Upcoming' && (
                            <button
                                type="button"
                                className={styles.deleteButton}
                                onClick={() => {
                                    if (window.confirm("Are you sure you want to delete this semester?")) {
                                        onSubmit(null, true);
                                    }
                                }}
                            >
                                Delete
                            </button>
                        )}
                        <button type="submit" className={styles.saveButton}>
                            {initialData ? 'Save' : 'Add'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SemesterModal;
