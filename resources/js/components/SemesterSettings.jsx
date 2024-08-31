import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SemesterSettings.css';
import { Link } from 'react-router-dom';
import AddSemesterModal from './AddSemesterModal.jsx';

function SemesterSettings() {
    const [semesters, setSemesters] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSemester, setSelectedSemester] = useState(null);

    const handleOpenModal = () => {
        setSelectedSemester(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedSemester(null);
    };

    const handleSubmit = async (formData, isDelete = false) => {
        if (isDelete) {
            await axios.delete(`/api/semesters/${selectedSemester.id}`);
        } else {
            // Duplicate semester check
            const duplicate = semesters.find(sem => sem.semester === formData.semester && sem.academic_year === formData.academic_year);
            if (duplicate && (!selectedSemester || duplicate.id !== selectedSemester.id)) {
                alert('This semester already exists!');
                return;
            }

            if (selectedSemester) {
                await axios.put(`/api/semesters/${selectedSemester.id}`, formData);
            } else {
                await axios.post('/api/semesters', formData);
            }
        }
        fetchSemesters();
        setIsModalOpen(false);
    };

    const fetchSemesters = async () => {
        try {
            const response = await axios.get('/api/semesters');
            setSemesters(response.data);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching semesters:', error);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSemesters();
    }, []);

    const getStatusClass = (status) => {
        switch (status.toLowerCase()) {
            case 'upcoming':
                return 'status-upcoming';
            case 'ongoing':
                return 'status-ongoing';
            case 'ended':
                return 'status-ended';
            default:
                return '';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
    };

    const handleRowClick = (semester) => {
        setSelectedSemester(semester);
        setIsModalOpen(true);
    };

    return (
        <div className="semester-settings-container">
            <nav className="breadcrumbs">
                <Link to="/admin-settings">Admin Settings</Link>
                <span className="breadcrumbSeparator">&gt;</span>
                <span>Semester Settings</span>
            </nav>
            <h1>Semester Settings</h1>
            <button className="add-semester-button" onClick={handleOpenModal}>Add New Semester</button>
            <AddSemesterModal isOpen={isModalOpen} onClose={handleCloseModal} onSubmit={handleSubmit} initialData={selectedSemester} semesters={semesters} />
            {isLoading ? (
                <p>Loading...</p>
            ) : (
                <table className="semester-table">
                    <thead>
                        <tr>
                            <th>No.</th>
                            <th>Semester</th>
                            <th>Academic Year</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Remarks</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {semesters.sort((a, b) => b.id - a.id).map((semester, index) => (
                            <tr key={index} onClick={() => handleRowClick(semester)} style={{ cursor: 'pointer' }}>
                                <td>{semesters.length - index}</td>
                                <td>{semester.semester}</td>
                                <td>{semester.academic_year}</td>
                                <td>{formatDate(semester.start_date)}</td>
                                <td>{formatDate(semester.end_date)}</td>
                                <td className="remarks-cell"><i>{semester.remarks}</i></td>
                                <td>
                                    <span className={`status-badge ${getStatusClass(semester.status)}`}>{semester.status}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default SemesterSettings;
