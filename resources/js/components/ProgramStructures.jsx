import React, { useEffect, useState, useContext } from 'react';
import { retrieveAndDecrypt } from "./storage";
import axios from 'axios';
import { Link } from 'react-router-dom';
import './ProgramStructures.css';
import { FaPlus } from 'react-icons/fa';
import AddProgramModal from './AddProgramModal';
import { StudentContext } from './StudentContext';

function ProgramStructures() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const token = retrieveAndDecrypt('token');
    const { programs, fetchPrograms } = useContext(StudentContext);

    useEffect(() => {
        fetchPrograms();
    }, [token]);

    const handleAddProgram = (newProgram) => {
        fetchPrograms();
        setIsModalOpen(false);
    };

    return (
        <div className="semester-settings-container">
            <div className="breadcrumbs">
                <Link to="/admin/admin-settings">Admin Settings</Link>
                <span className="breadcrumbSeparator">&gt;</span>
                <span>Program Structures</span>
            </div>
            <div className="header">
                <h1>Program Structures</h1>
                <div className="actions">
                    <button className="add-student-button" onClick={() => setIsModalOpen(true)}>
                        <FaPlus className="add" /> Add New Program
                    </button>
                </div>
            </div>
            <div className="program-page-container">
                <div className="settings-list">
                    {programs.sort((a, b) => a.id - b.id).map((program) => (
                        <Link
                            key={program.id}
                            to={`/admin/admin-settings/program-structures/${program.id}`}
                            state={{ programName: program.name }}
                            className="settings-item"
                        >
                            <span>{program.name}</span> <span className="right-arrow">→</span>
                        </Link>
                    ))}
                </div>
            </div>
            <AddProgramModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onProgramAdded={handleAddProgram}
            />
        </div>
    );
}

export default ProgramStructures;
