import React, { useEffect, useState } from 'react';
import { retrieveAndDecrypt } from "./storage";
import axios from 'axios';
import { Link } from 'react-router-dom';
import './ProgramStructures.css';
import { FaPlus } from 'react-icons/fa';
import AddProgramModal from './AddProgramModal';

function ProgramStructures() {
    const [programs, setPrograms] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const token = retrieveAndDecrypt('token');

    useEffect(() => {
        const fetchPrograms = async () => {
            try {
                const response = await axios.get('/api/programs', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                setPrograms(response.data);
            } catch (error) {
                console.error('Error fetching programs:', error);
            }
        };

        fetchPrograms();
    }, []);

    const handleAddProgram = (newProgram) => {
        // Update the program list with the newly added program
        setPrograms((prevPrograms) => [...prevPrograms, newProgram]);
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
