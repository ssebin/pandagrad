import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { retrieveAndDecrypt } from './storage';
import './ProgramStructures.css';
import './TaskList.css';
import { FaSearch, FaPlus, FaPencilAlt } from 'react-icons/fa';
import EditIntakeModal from './EditIntakeModal';
import TaskModal from './TaskModal';
import AddTaskModal from './AddTaskModal';

function TaskList() {
    const navigate = useNavigate();
    const { programId, intakeId } = useParams();
    const [tasks, setTasks] = useState([]);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
    const token = retrieveAndDecrypt('token');
    const { state } = useLocation();
    const programName = state?.programName || `Program ${programId}`;
    const initialIntakeSemester = state?.intakeSemester || '';
    const initialIntakeYear = state?.intakeYear || '';
    const initalIntakeName = 'Semester ' + initialIntakeSemester + ', ' + initialIntakeYear;
    const [intakeSemester, setIntakeSemester] = useState(initialIntakeSemester);
    const [intakeYear, setIntakeYear] = useState(initialIntakeYear);
    const [intakeName, setIntakeName] = useState(initalIntakeName);
    const [selectedTask, setSelectedTask] = useState(null);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

    const fetchTasks = async () => {
        try {
            const response = await axios.get(`/api/tasks/intake/${intakeId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setTasks(response.data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, [intakeId, token]);

    const handleRowClick = (task) => {
        setSelectedTask(task);
        setIsTaskModalOpen(true);
    };

    const handleTaskUpdated = () => {
        fetchTasks();
        setIsTaskModalOpen(false);
    };

    const handleTaskDeleted = () => {
        fetchTasks();
        setIsTaskModalOpen(false);
    };

    const handleTaskAdded = (newTask) => {
        setTasks((prevTasks) => [...prevTasks, newTask]);
    };

    const handleIntakeUpdate = (updatedIntake) => {
        setIntakeSemester(updatedIntake.intake_semester);
        setIntakeYear(updatedIntake.intake_year);
        setIntakeName('Semester ' + updatedIntake.intake_semester + ', ' + updatedIntake.intake_year);
    };

    const handleIntakeDeleted = (deletedIntakeId) => {
        setIsEditModalOpen(false);
        navigate(`/admin/admin-settings/program-structures/${programId}`, {
            state: {
                programName: programName,
            },
        });
    };

    const handleSearchInputChange = (e) => {
        setSearchKeyword(e.target.value.toLowerCase());
        setCurrentPage(1); // Reset to the first page after a search
    };

    const filterTasks = (tasks) => {
        return tasks.filter((task) => {
            return (
                (task.name && task.name.toLowerCase().includes(searchKeyword)) ||
                (task.category && task.category.toLowerCase().includes(searchKeyword))
            );
        });
    };

    const filteredTasks = filterTasks(tasks);
    const sortedTasks = [...filteredTasks].sort((a, b) => b.id - a.id);
    const totalPages = Math.ceil(sortedTasks.length / itemsPerPage);
    const paginatedTasks = sortedTasks.slice(
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
                <Link to="/admin/admin-settings/program-structures" state={{ programName: programName, intakeSemester: intakeSemester, intakeYear: intakeYear }}>Program Structures</Link>
                <span className="breadcrumbSeparator">&gt;</span>
                <Link to={`/admin/admin-settings/program-structures/${programId}`} state={{ programName: programName, intakeSemester: intakeSemester, intakeYear: intakeYear }}>{programName}</Link>
                <span className="breadcrumbSeparator">&gt;</span>
                <span>{intakeName}</span>
            </nav>
            <div className="header">
                <h1>{intakeName}</h1>
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
                    <button className="add-student-button" onClick={() => setIsEditModalOpen(true)}>
                        <FaPencilAlt className="add" /> Edit Intake
                    </button>
                    <button className="add-student-button" onClick={() => setIsAddTaskModalOpen(true)}>
                        <FaPlus className="add" /> Add New Task
                    </button>
                </div>
            </div>
            {paginatedTasks.length > 0 ? (
                <table className="task-table">
                    <thead>
                        <tr>
                            <th>No.</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Task Weight</th>
                            <th>Version Number</th>
                            <th>Version History</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedTasks.map((task, index) => (
                            <tr key={task.id} onClick={() => handleRowClick(task)}>
                                <td>{tasks.length - ((currentPage - 1) * itemsPerPage + index)}</td>
                                <td>{task.name}</td>
                                <td>{task.category}</td>
                                <td>{task.task_weight}</td>
                                <td>{task.version_number}</td>
                                <td>
                                    <Link
                                        to={`/admin/admin-settings/program-structures/${programId}/${intakeId}/${task.id}`}
                                        state={{
                                            programName: programName,
                                            intakeSemester: intakeSemester,
                                            intakeYear: intakeYear,
                                            intakeName: intakeName,
                                        }}
                                    >
                                        View
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    No tasks available
                </div>
            )}
            {paginatedTasks.length > 0 && (
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
            <EditIntakeModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                intakeId={intakeId}
                currentIntakeSemester={intakeSemester}
                currentIntakeYear={intakeYear}
                onIntakeUpdated={handleIntakeUpdate}
                onIntakeDeleted={handleIntakeDeleted}
            />
            <TaskModal
                isOpen={isTaskModalOpen}
                onClose={() => setIsTaskModalOpen(false)}
                task={selectedTask}
                onTaskUpdated={handleTaskUpdated}
                onTaskDeleted={handleTaskDeleted}
                programId={programId}
                intakeId={intakeId}
            />
            <AddTaskModal
                isOpen={isAddTaskModalOpen}
                onClose={() => setIsAddTaskModalOpen(false)}
                intakeId={intakeId}
                onTaskAdded={handleTaskAdded}
                programId={programId}
            />
        </div>
    );
}

export default TaskList;