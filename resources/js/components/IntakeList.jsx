import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { retrieveAndDecrypt } from './storage';
import './ProgramStructures.css';
import { FaPlus, FaPencilAlt } from 'react-icons/fa';
import EditProgramModal from './EditProgramModal';
import AddIntakeModal from './AddIntakeModal';

function IntakeList() {
    const navigate = useNavigate();
    const { programId } = useParams();
    const [intakes, setIntakes] = useState([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(7);
    const token = retrieveAndDecrypt('token');
    const { state } = useLocation();
    const initialProgramName = state?.programName || `Program ${programId}`;
    const [currentProgramName, setCurrentProgramName] = useState(initialProgramName);


    useEffect(() => {
        const fetchIntakes = async () => {
            try {
                const intakesResponse = await axios.get(`/api/programs/${programId}/intakes`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                setIntakes(intakesResponse.data);
            } catch (error) {
                console.error('Error fetching program or intakes:', error);
            }
        };

        fetchIntakes();
    }, [programId, token]);

    useEffect(() => {
        setCurrentProgramName(currentProgramName);
    }, [currentProgramName]);

    const handleProgramUpdate = (updatedProgram) => {
        setCurrentProgramName(updatedProgram.name);
    };

    const handleProgramDeleted = (deletedProgramId) => {
        setIsEditModalOpen(false);
        navigate('/admin/admin-settings/program-structures');
    };

    const handleIntakeAdded = (newIntake) => {
        setIntakes((prevIntakes) => [...prevIntakes, newIntake]);
    };

    const sortedIntakes = intakes.sort((a, b) => a.id - b.id);
    const totalPages = Math.ceil(sortedIntakes.length / itemsPerPage);
    const paginatedIntakes = sortedIntakes.slice(
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
            <div className="breadcrumbs">
                <Link to="/admin/admin-settings">Admin Settings</Link>
                <span className="breadcrumbSeparator">&gt;</span>
                <Link to="/admin/admin-settings/program-structures">Program Structures</Link>
                <span className="breadcrumbSeparator">&gt;</span>
                <span>{currentProgramName}</span>
            </div>
            <div className="header">
                <h1>{currentProgramName}</h1>
                <div className="actions">
                    <button className="add-student-button" onClick={() => setIsEditModalOpen(true)}>
                        <FaPencilAlt className="add" /> Edit Program
                    </button>
                    <button className="add-student-button" onClick={() => setIsAddModalOpen(true)}>
                        <FaPlus className="add" /> Add New Intake
                    </button>
                </div>
            </div>
            <div className="program-page-container">
                <div className="settings-list">
                    {paginatedIntakes.length > 0 ? (
                        paginatedIntakes.map((intake) => (
                            <Link
                                key={intake.id}
                                to={`/admin/admin-settings/program-structures/${programId}/${intake.id}`}
                                state={{ programName: currentProgramName, intakeSemester: intake.intake_semester, intakeYear: intake.intake_year }}
                                className="settings-item"
                            >
                                <span>{`Semester ${intake.intake_semester}, ${intake.intake_year}`}</span>
                                <span className="right-arrow">→</span>
                            </Link>
                        ))
                    ) : (
                        <div style={{ textAlign: 'end', paddingTop: '20px', color: '#555' }}>
                            No Intakes Available
                        </div>
                    )}
                </div>
            </div>
            {paginatedIntakes.length > 0 && (
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
            <EditProgramModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                programId={programId}
                currentProgramName={currentProgramName}
                onProgramUpdated={handleProgramUpdate}
                onProgramDeleted={handleProgramDeleted}
            />

            <AddIntakeModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                programId={programId}
                onIntakeAdded={handleIntakeAdded}
            />
        </div>
    );
}
export default IntakeList;