import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { retrieveAndDecrypt } from './storage';
import './ProgramStructures.css';
import './TaskList.css';
import TaskModal from './TaskModal';

function TaskVersionList() {
    const navigate = useNavigate();
    const { programId, intakeId, taskId } = useParams();
    const [versions, setVersions] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [selectedVersion, setSelectedVersion] = useState(null);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const token = retrieveAndDecrypt('token');
    const { state } = useLocation();
    const programName = state?.programName || `Program ${programId}`;
    const intakeSemester = state?.intakeSemester || '';
    const intakeYear = state?.intakeYear || '';
    const intakeName = state?.intakeName || `Semester ${intakeSemester}, ${intakeYear}`;

    useEffect(() => {
        const fetchVersions = async () => {
            try {
                const response = await axios.get(
                    `/api/tasks/${taskId}/versions`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                console.log('Versions fetched:', response.data);
                setVersions(response.data);
            } catch (error) {
                console.error('Error fetching task versions:', error);
            }
        };

        fetchVersions();
    }, [taskId, token]);

    const handleTaskUpdated = () => {
        // Re-fetch versions after reverting or updating
        const fetchVersions = async () => {
            try {
                const response = await axios.get(
                    `/api/tasks/${taskId}/versions`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                setVersions(response.data);
            } catch (error) {
                console.error('Error fetching task versions:', error);
            }
        };

        fetchVersions();
        setIsTaskModalOpen(false);
    };

    const sortedVersions = [...versions].sort((a, b) => b.id - a.id);
    const totalPages = Math.ceil(sortedVersions.length / itemsPerPage);
    const paginatedVersions = sortedVersions.slice(
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
                <Link
                    to="/admin/admin-settings/program-structures"
                    state={{ programName, intakeSemester, intakeYear }}
                >
                    Program Structures
                </Link>
                <span className="breadcrumbSeparator">&gt;</span>
                <Link
                    to={`/admin/admin-settings/program-structures/${programId}`}
                    state={{ programName, intakeSemester, intakeYear }}
                >
                    {programName}
                </Link>
                <span className="breadcrumbSeparator">&gt;</span>
                <Link
                    to={`/admin/admin-settings/program-structures/${programId}/${intakeId}`}
                    state={{ programName, intakeSemester, intakeYear, intakeName }}
                >
                    {intakeName}
                </Link>
                <span className="breadcrumbSeparator">&gt;</span>
                <span>{versions[0]?.name}</span>
            </nav>
            <div className="header">
                <h1>Version History for {versions[0]?.name}</h1>
            </div>
            {paginatedVersions.length > 0 ? (
                <table className="task-table">
                    <thead>
                        <tr>
                            <th>No.</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Task Weight</th>
                            <th>Version Number</th>
                            <th>Updated By</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedVersions
                            .map((version, index) => (
                                <tr
                                    key={version.id}
                                    onClick={() => {
                                        setSelectedVersion(version);
                                        setIsTaskModalOpen(true);
                                    }}
                                >
                                    <td>{versions.length - ((currentPage - 1) * itemsPerPage + index)}</td>
                                    <td>{version.name}</td>
                                    <td>{version.category}</td>
                                    <td>{version.task_weight}</td>
                                    <td>{version.version_number}</td>
                                    <td>{version.admin?.Name || 'N/A'}</td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            ) : (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    No versions available
                </div>
            )}
            {paginatedVersions.length > 0 && (
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
            <TaskModal
                isOpen={isTaskModalOpen}
                onClose={() => setIsTaskModalOpen(false)}
                task={selectedVersion}
                onTaskUpdated={handleTaskUpdated}
                programId={programId}
                intakeId={intakeId}
                isVersionView={true}
            />
        </div>
    );
}
export default TaskVersionList;