import React, { useState, useEffect } from 'react';
import axios from './axiosConfig.js';
import './SemesterSettings.css';
import { Link } from 'react-router-dom';
import AddSemesterModal from './AddSemesterModal.jsx';
import { FaSearch, FaPlus } from 'react-icons/fa';

function SemesterSettings() {
    const [semesters, setSemesters] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSemester, setSelectedSemester] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [searchKeyword, setSearchKeyword] = useState("");

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

    const handleSearchInputChange = (e) => {
        setSearchKeyword(e.target.value.toLowerCase());
        setCurrentPage(1); // Reset to the first page after a search
    };

    const filterSemesters = (semesters) => {
        return semesters.filter((semester) => {
            return (
                (semester.academic_year && semester.academic_year.toLowerCase().includes(searchKeyword)) ||
                (semester.start_date && formatDate(semester.start_date).toLowerCase().includes(searchKeyword)) ||
                (semester.end_date && formatDate(semester.end_date).toLowerCase().includes(searchKeyword)) ||
                (semester.remarks && semester.remarks.toLowerCase().includes(searchKeyword)) ||
                (semester.semester && semester.semester.toString().includes(searchKeyword)) ||
                (semester.status && semester.status.toLowerCase().includes(searchKeyword))
            );
        });
    };

    const filteredSemesters = filterSemesters(semesters);
    const sortedSemesters = [...filteredSemesters].sort((a, b) => b.id - a.id);
    const totalPages = Math.ceil(sortedSemesters.length / itemsPerPage);
    const paginatedSemesters = sortedSemesters.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const renderPageNumbers = () => {
        if (totalPages === 1) {
            return [1];
        }

        const totalPagesArray = Array.from({ length: totalPages }, (_, i) => i + 1);
        const maxPagesToShow = 2; // Number of pages to show at the start and end
        const visiblePages = [];

        // Always include the first page
        visiblePages.push(1);

        if (currentPage > maxPagesToShow + 1) {
            visiblePages.push('...');
        }

        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);
        for (let i = start; i <= end; i++) {
            visiblePages.push(i);
        }

        if (currentPage < totalPages - maxPagesToShow) {
            visiblePages.push('...');
        }

        if (totalPages > 1) {
            visiblePages.push(totalPages);
        }

        return visiblePages;
    };

    return (
        <div className="semester-settings-container">
            <nav className="breadcrumbs">
                <Link to="/admin/admin-settings">Admin Settings</Link>
                <span className="breadcrumbSeparator">&gt;</span>
                <span>Semester Settings</span>
            </nav>
            <div className="header">
                <h1>Semester Settings</h1>
                <div className="actions">
                    <div className="search-bar">
                        <FaSearch />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchKeyword}
                            onChange={handleSearchInputChange}
                        />
                    </div>

                    <button className="add-student-button" onClick={handleOpenModal}>
                        <FaPlus className="add" /> Add New Semester
                    </button>
                </div>
            </div>
            <AddSemesterModal isOpen={isModalOpen} onClose={handleCloseModal} onSubmit={handleSubmit} initialData={selectedSemester} semesters={semesters} />
            {isLoading ? (
                <p>Loading...</p>
            ) : (
                <>
                    {paginatedSemesters.length > 0 ? (
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
                                {paginatedSemesters.sort((a, b) => b.id - a.id).map((semester, index) => (
                                    <tr key={index} onClick={() => handleRowClick(semester)} style={{ cursor: 'pointer' }}>
                                        <td>{semesters.length - ((currentPage - 1) * itemsPerPage + index)}</td>
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
                    ) : (
                        <div
                            style={{
                                textAlign: 'center',
                                padding: '50px',
                                // fontSize: '16px',
                                // color: '#555',
                            }}
                        >
                            No data available
                        </div>
                    )}
                </>
            )}
            {paginatedSemesters.length > 0 && (
                <div className="pagination">
                    <button
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                    >
                        First
                    </button>
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        &lt;
                    </button>
                    {renderPageNumbers().map((page, index) => (
                        <button
                            key={index}
                            onClick={() => typeof page === 'number' && handlePageChange(page)}
                            className={currentPage === page ? "active" : ""}
                            disabled={page === '...'}
                        >
                            {page}
                        </button>
                    ))}
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        &gt;
                    </button>
                    <button
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages}
                    >
                        Last
                    </button>
                </div>
            )}
        </div>
    );
}

export default SemesterSettings;
