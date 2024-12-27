import React, { useState, useEffect, useContext } from 'react';
import axios from './axiosConfig.js';
import { Link } from 'react-router-dom';
import { FaSearch, FaPlus } from 'react-icons/fa';
import AddLecturerModal from './AddLecturerModal.jsx';
import './ManageLecturers.css';
import { StudentContext } from './StudentContext';

function ManageLecturers() {
    const [lecturers, setLecturers] = useState([]);
    const [selectedLecturer, setSelectedLecturer] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [searchKeyword, setSearchKeyword] = useState("");
    const { programs, fetchPrograms } = useContext(StudentContext);

    const handleOpenModal = () => {
        setSelectedLecturer(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedLecturer(null);
    };

    const handleSubmit = async (formData) => {
        try {
            const duplicate = lecturers.find(
                (lecturer) => lecturer.um_email === formData.um_email
            );
            if (duplicate && (!selectedLecturer || duplicate.id !== selectedLecturer.id)) {
                alert('A lecturer with the same UM Email already exists!');
                return;
            }

            if (selectedLecturer) {
                await axios.put(`/api/lecturers/${selectedLecturer.id}`, formData);
            } else {
                await axios.post('/api/lecturers', formData);
            }

            alert('Lecturer saved successfully.');

            fetchLecturers();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Submission Error:', error.response?.data || error.message);
            alert('Failed to save lecturer. Please try again.');
        }
    };

    const handleDelete = async (formData) => {
        if (!window.confirm("Are you sure you want to delete this lecturer?")) {
            return;
        }

        try {
            await axios.delete(`/api/lecturers/${selectedLecturer.id}`, formData);
            fetchLecturers();
            setIsModalOpen(false);
            alert("Lecturer deleted successfully.");
        } catch (error) {
            console.error('Error deleting lecturer:', error.response?.data || error.message);
            alert("An error occurred. Please try again.");
        }
    };

    const fetchLecturers = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get('/api/lecturers/all');
            console.log('Lecturers:', response.data);
            setLecturers(response.data);
            setIsLoading(false);
        } catch (error) {
            console.error('Failed to fetch lecturers:', error);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLecturers();
    }, []);

    useEffect(() => {
        if (!programs || programs.length === 0) {
            fetchPrograms();
        }
    }, [programs]);

    const programIdToName = programs
        ? programs.reduce((acc, program) => {
            acc[String(program.id)] = program.name;
            return acc;
        }, {})
        : {};

    const handleRowClick = (lecturer) => {
        setSelectedLecturer(lecturer);
        setIsModalOpen(true);
    };

    const handleSearchInputChange = (e) => {
        setSearchKeyword(e.target.value.toLowerCase());
        setCurrentPage(1); // Reset to the first page after a search
    };

    const filterLecturers = (lecturers) => {
        return lecturers.filter((lecturer) => {
            const programName = programIdToName[String(lecturer.program_id)] || 'Unknown Program';
            return (
                (lecturer.first_name && lecturer.first_name.toLowerCase().includes(searchKeyword)) ||
                (lecturer.last_name && lecturer.last_name.toLowerCase().includes(searchKeyword)) ||
                (lecturer.um_email && lecturer.um_email.toLowerCase().includes(searchKeyword)) ||
                (programName && programName.toLowerCase().includes(searchKeyword)) ||
                (lecturer.role && lecturer.role.toLowerCase().includes(searchKeyword)) ||
                (lecturer.status && lecturer.status.toLowerCase().includes(searchKeyword))
            );
        });
    };

    const filteredLecturers = filterLecturers(lecturers);
    const sortedLecturers = [...filteredLecturers].sort((a, b) => b.id - a.id);
    const totalPages = Math.ceil(sortedLecturers.length / itemsPerPage);
    const paginatedLecturers = sortedLecturers.slice(
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
        <div className="lecturer-settings-container">
            <div className="breadcrumbs">
                <Link to="/admin/admin-settings">Admin Settings</Link>
                <span className="breadcrumbSeparator">&gt;</span>
                <Link to="/admin/admin-settings/manage-users">Manage Users</Link>
                <span className="breadcrumbSeparator">&gt;</span>
                <span>Lecturers</span>
            </div>

            <div className="header">
                <h1>Lecturers</h1>
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
                        <FaPlus className="add" /> Add New Lecturer
                    </button>
                </div>
            </div>
            <AddLecturerModal isOpen={isModalOpen} onClose={handleCloseModal} onSubmit={handleSubmit} initialData={selectedLecturer} onDelete={handleDelete} />
            {isLoading ? (
                <p>Loading...</p>
            ) : (
                <>
                    {paginatedLecturers.length > 0 ? (
                        <table className="lecturer-table">
                            <thead>
                                <tr>
                                    <th>No.</th>
                                    <th>First Name</th>
                                    <th>Last Name</th>
                                    <th>UM Email</th>
                                    <th>Role</th>
                                    <th>Program</th>
                                    <th>Remarks</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedLecturers.map((lecturer, index) => (
                                    <tr key={lecturer.id} onClick={() => handleRowClick(lecturer)} style={{ cursor: 'pointer' }}>
                                        <td>{lecturers.length - ((currentPage - 1) * itemsPerPage + index)}</td>
                                        <td>{lecturer.first_name}</td>
                                        <td>{lecturer.last_name}</td>
                                        <td>{lecturer.um_email}</td>
                                        <td>
                                            {lecturer.role.toLowerCase() === 'both'
                                                ? 'Supervisor & Coordinator'
                                                : lecturer.role.charAt(0).toUpperCase() + lecturer.role.slice(1).toLowerCase()}
                                        </td>
                                        <td>{programIdToName[String(lecturer.program_id)] || 'Unknown Program'}</td>
                                        <td className="remarks-cell"><i>{lecturer.remarks || '-'}</i></td>
                                        <td>
                                            <span className={`status-${(lecturer.status).toLowerCase()}`}>{lecturer.status}</span>
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
            {paginatedLecturers.length > 0 && (
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

export default ManageLecturers;