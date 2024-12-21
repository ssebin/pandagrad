import React, { useState, useEffect, useContext } from 'react';
import axios from './axiosConfig.js';
import { Link } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import { StudentContext } from './StudentContext';
// import AddStudentModal from './AddStudentModal.jsx';
import StudentInfoModal from './StudentInfoModal';
import './ManageStudents.css';

function ManageStudents() {
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [searchKeyword, setSearchKeyword] = useState("");
    const { studentsData, fetchStudentsData, currentSemester, isLoading } = useContext(StudentContext);

    const students = studentsData ? Object.values(studentsData).flat() : [];

    const handleOpenEditModal = () => {
        setSelectedStudent(null);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedStudent(null);
    };

    useEffect(() => {
        fetchStudentsData();
    }, []);

    const handleSubmit = async (formData) => {
        try {
            const duplicate = students.find(
                (student) => student.siswamail === formData.siswamail
            );
            if (duplicate && (!selectedStudent || duplicate.id !== selectedStudent.id)) {
                alert('This student already exists!');
                return;
            }

            if (selectedStudent) {
                await axios.put(`/api/students/${selectedStudent.id}`, formData);
            } else {
                await axios.post('/api/students', formData);
            }

            alert('Student saved successfully!');

            fetchStudentsData();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Submission Error:', error.response?.data || error.message);
            alert('Failed to save student. Please try again.');
        }
    };

    const handleRowClick = (student) => {
        setSelectedStudent(student);
        console.log('Selected Student:', student);
        setIsEditModalOpen(true);
    };

    const handleSearchInputChange = (e) => {
        setSearchKeyword(e.target.value.toLowerCase());
        setCurrentPage(1); // Reset to the first page after a search
    };

    const filterStudents = (students) => {
        return students.filter((student) => {
            return (
                (student.first_name && student.first_name.toLowerCase().includes(searchKeyword)) ||
                (student.last_name && student.last_name.toLowerCase().includes(searchKeyword)) ||
                (student.siswamail && student.siswamail.toLowerCase().includes(searchKeyword)) ||
                (student.program && student.program.toLowerCase().includes(searchKeyword)) ||
                (student.intake && student.intake.toLowerCase().includes(searchKeyword)) ||
                (student.supervisor_name && student.supervisor_name.toLowerCase().includes(searchKeyword)) ||
                (student.task && student.task.toLowerCase().includes(searchKeyword)) ||
                (student.task_status && student.task_status.toLowerCase().includes(searchKeyword)) ||
                (student.nationality && student.nationality.toLowerCase().includes(searchKeyword)) ||
                (student.status && student.status.toLowerCase().includes(searchKeyword))
            );
        });
    };

    const filteredStudents = filterStudents(students);
    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
    const sortedStudents = filteredStudents.sort((a, b) => b.id - a.id); // Sort before pagination
    const paginatedStudents = sortedStudents.slice(
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
        <div className="student-settings-container">
            <div className="breadcrumbs">
                <Link to="/admin/admin-settings">Admin Settings</Link>
                <span className="breadcrumbSeparator">&gt;</span>
                <Link to="/admin/admin-settings/manage-users">Manage Users</Link>
                <span className="breadcrumbSeparator">&gt;</span>
                <span>Students</span>
            </div>

            <div className="header">
                <h1>Students</h1>
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
                    <button className="add-semester-button" onClick={handleOpenEditModal}>Add New Student</button>
                </div>
            </div>
            {/* <AddStudentModal isOpen={isModalOpen} onClose={handleCloseModal} onSubmit={handleSubmit} initialData={selectedStudent} /> */}

            {isLoading ? (
                <p>Loading...</p>
            ) : (
                <>
                    {paginatedStudents.length > 0 ? (
                        <table className="student-table">
                            <thead>
                                <tr>
                                    <th>No.</th>
                                    <th>First Name</th>
                                    <th>Last Name</th>
                                    <th>Siswamail</th>
                                    <th>Program</th>
                                    <th>Intake</th>
                                    <th>Supervisor</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedStudents.sort((a, b) => b.id - a.id).map((student, index) => (
                                    <tr key={student.id} onClick={() => handleRowClick(student)} style={{ cursor: 'pointer' }}>
                                        <td>{students.length - ((currentPage - 1) * itemsPerPage + index)}</td>
                                        <td>{student.first_name || '-'}</td>
                                        <td>{student.last_name || '-'}</td>
                                        <td>{student.siswamail || '-'}</td>
                                        <td>{student.program || '-'}</td>
                                        <td>{student.intake || '-'}</td>
                                        <td>{student.supervisor_name || '-'}</td>
                                        <td>
                                            <span className={`status-${(student.status).toLowerCase()}`}>
                                                {student.status === 'PL'
                                                    ? 'Personal Leave' :
                                                    student.status === 'TI'
                                                        ? 'Terminated (I)'
                                                        : student.status === 'TF'
                                                            ? 'Terminated (F)'
                                                            : student.status}
                                            </span>
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
            {paginatedStudents.length > 0 && (
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
            <StudentInfoModal
                selectedStudent={selectedStudent}
                isOpen={isEditModalOpen}
                onClose={handleCloseEditModal}
                onUpdate={fetchStudentsData}
                currentSemester={currentSemester}
                onSubmit={handleSubmit}
            />
        </div>
    );
}

export default ManageStudents;