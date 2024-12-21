import React, { useState, useEffect } from 'react';
import axios from './axiosConfig.js';
import { Link } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import AddAdminModal from './AddAdminModal.jsx';
import './ManageAdmins.css';

function ManageAdmins() {
    const [admins, setAdmins] = useState([]);
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [searchKeyword, setSearchKeyword] = useState("");

    const handleOpenModal = () => {
        setSelectedAdmin(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedAdmin(null);
    };

    const handleSubmit = async (formData) => {
        try {
            const duplicate = admins.find(
                (admin) => admin.Name === formData.Name || admin.UMEmail === formData.UMEmail
            );
            if (duplicate && (!selectedAdmin || duplicate.AdminID !== selectedAdmin.AdminID)) {
                alert('An admin with the same UM Email already exists!');
                return;
            }
    
            if (selectedAdmin) {
                await axios.put(`/api/admins/${selectedAdmin.AdminID}`, formData);
            } else {
                await axios.post('/api/admins', formData);
            }

            alert('Admin saved successfully!');
    
            fetchAdmins();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Submission Error:', error.response?.data || error.message);
            alert('Failed to save admin. Please try again.');
        }
    };

    const fetchAdmins = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get('/api/admins');
            console.log('Admins:', response.data);
            setAdmins(response.data);
            setIsLoading(false);
        } catch (error) {
            console.error('Failed to fetch admins:', error);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    const handleRowClick = (admin) => {
        setSelectedAdmin(admin);
        setIsModalOpen(true);
    };

    const handleSearchInputChange = (e) => {
        setSearchKeyword(e.target.value.toLowerCase());
        setCurrentPage(1); // Reset to the first page after a search
    };

    const filterAdmins = (admins) => {
        return admins.filter((admin) => {
            return (
                (admin.Name && admin.Name.toLowerCase().includes(searchKeyword)) ||
                (admin.UMEmail && admin.UMEmail.toLowerCase().includes(searchKeyword)) ||
                (admin.role && admin.role.toLowerCase().includes(searchKeyword)) ||
                (admin.Status && admin.Status.toLowerCase().includes(searchKeyword))
            );
        });
    };

    const filteredAdmins = filterAdmins(admins);
    const totalPages = Math.ceil(filteredAdmins.length / itemsPerPage);
    const paginatedAdmins = filteredAdmins.slice(
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
        <div className="admin-settings-container">
            <div className="breadcrumbs">
                <Link to="/admin/admin-settings">Admin Settings</Link>
                <span className="breadcrumbSeparator">&gt;</span>
                <Link to="/admin/admin-settings/manage-users">Manage Users</Link>
                <span className="breadcrumbSeparator">&gt;</span>
                <span>Admins</span>
            </div>

            <div className="header">
                <h1>Admins</h1>
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
                    <button className="add-semester-button" onClick={handleOpenModal}>Add New Admin</button>
                </div>
            </div>
            <AddAdminModal isOpen={isModalOpen} onClose={handleCloseModal} onSubmit={handleSubmit} initialData={selectedAdmin} />
            {isLoading ? (
                <p>Loading...</p>
            ) : (
                <>
                    {paginatedAdmins.length > 0 ? (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>No.</th>
                                    <th>Admin Name</th>
                                    <th>UM Email</th>
                                    <th>Role</th>
                                    <th>Remarks</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedAdmins.sort((a, b) => b.AdminID - a.AdminID).map((admin, index) => (
                                    <tr key={admin.AdminID} onClick={() => handleRowClick(admin)} style={{ cursor: 'pointer' }}>
                                        <td>{admins.length - ((currentPage - 1) * itemsPerPage + index)}</td>
                                        <td>{admin.Name}</td>
                                        <td>{admin.UMEmail}</td>
                                        <td>{admin.role.charAt(0).toUpperCase() + admin.role.slice(1).toLowerCase()}</td>
                                        <td className="remarks-cell"><i>{admin.Remarks || '-'}</i></td>
                                        <td>
                                            <span className={`status-${(admin.Status).toLowerCase()}`}>{admin.Status}</span>
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
            {paginatedAdmins.length > 0 && (
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

export default ManageAdmins;