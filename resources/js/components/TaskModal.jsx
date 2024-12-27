import React, { useState, useRef, useEffect } from 'react';
import styles from './addsemestermodal.module.css';
import axios from 'axios';
import { retrieveAndDecrypt } from "./storage";
import Select, { components } from 'react-select';

function TaskModal({ isOpen, onClose, task, onTaskUpdated, onTaskDeleted, programId, intakeId }) {
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [taskWeight, setTaskWeight] = useState('');
    const [versionNumber, setVersionNumber] = useState('');
    const [applyToOption, setApplyToOption] = useState('this'); // 'this', 'all', 'custom'
    const [intakes, setIntakes] = useState([]);
    const [selectedIntakes, setSelectedIntakes] = useState([]);
    const token = retrieveAndDecrypt('token');
    const modalRef = useRef(null);

    useEffect(() => {
        if (isOpen && task) {
            setName(task.name || '');
            setCategory(task.category || '');
            setTaskWeight(task.task_weight || '');
            setVersionNumber(task.version_number || '');
        }
    }, [isOpen, task]);

    const intakeOptions = intakes.map(intake => ({
        value: intake.id,
        label: `Semester ${intake.intake_semester} ${intake.intake_year}`,
    }));

    useEffect(() => {
        if (isOpen) {
            axios.get(`/api/programs/${programId}/intakes`, {
                headers: { Authorization: `Bearer ${token}` },
            }).then(response => {
                setIntakes(response.data);
            }).catch(error => {
                console.error('Error fetching intakes:', error);
            });
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!window.confirm("Are you sure you want to save changes to this task?")) {
            return;
        }

        try {
            const response = await axios.put(
                `/api/tasks/${task.id}`,
                {
                    name: name,
                    category: category,
                    task_weight: taskWeight,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const updatedTask = response.data;

            // Determine intake IDs to apply changes to
            let intakeIds = [];
            if (applyToOption === 'all') {
                intakeIds = intakes.map(intake => intake.id);
            } else if (applyToOption === 'custom') {
                intakeIds = selectedIntakes.map(intake => intake.value);
            }

            // Remove current intake ID from the list since we've already created the task there
            intakeIds = intakeIds.filter(id => id !== parseInt(intakeId));

            // Apply changes to other intakes if any
            if (intakeIds.length > 0) {
                await axios.post(
                    `/api/tasks/${updatedTask.id}/apply-changes`,
                    { intake_ids: intakeIds },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }

            alert('Task updated successfully!');
            onTaskUpdated(response.data);
            onClose();
        } catch (error) {
            alert('An error occurred while updating the task. Please try again.');
            console.error('Error updating task:', error);
        }
    };

    const handleSelectChange = (selectedOptions) => {
        if (selectedOptions) {
            // Sort the selected options by id
            const sortedOptions = [...selectedOptions].sort((a, b) => a.value - b.value);
            setSelectedIntakes(sortedOptions);
        } else {
            setSelectedIntakes([]);
        }
    };

    const handleClose = () => {
        setName('');
        setCategory('');
        setTaskWeight('');
        setApplyToOption('this');
        setSelectedIntakes([]);
        onClose();
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this task? This action cannot be undone.")) {
            return;
        }

        try {
            let intakeIds = [];

            if (applyToOption === 'this') {
                // Delete only in this intake
                await axios.delete(`/api/tasks/${task.id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
            } else {
                if (applyToOption === 'all') {
                    intakeIds = intakes.map((intake) => intake.id);
                } else if (applyToOption === 'custom') {
                    intakeIds = selectedIntakes.map((intake) => intake.value);
                }

                // Ensure current intake is included if necessary
                if (!intakeIds.includes(parseInt(intakeId))) {
                    intakeIds.push(parseInt(intakeId));
                }

                await axios.post(
                    `/api/tasks/${task.id}/apply-delete`,
                    { intake_ids: intakeIds },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
            }

            alert('Task deleted successfully!');
            onTaskDeleted(task.id);
            handleClose();
        } catch (error) {
            alert('An error occurred while deleting the task. Please try again.');
            console.error('Error deleting task:', error);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    const CustomClearIndicator = (props) => {
        const {
            innerProps: { ref, ...restInnerProps },
        } = props;
        return (
            <div
                {...restInnerProps}
                ref={ref}
                onMouseDown={(e) => {
                    e.stopPropagation();
                    if (restInnerProps.onMouseDown) {
                        restInnerProps.onMouseDown(e);
                    }
                }}
                onClick={(e) => {
                    e.stopPropagation();
                    if (restInnerProps.onClick) {
                        restInnerProps.onClick(e);
                    }
                }}
            >
                {components.ClearIndicator(props)}
            </div>
        );
    };

    if (!isOpen || !task) {
        return null;
    }

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent} ref={modalRef}>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label>Name<span style={{ color: 'red' }}> *</span></label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter Task Name"
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Category<span style={{ color: 'red' }}> *</span></label>
                        <input
                            type="text"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            placeholder="Enter Task Category"
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Task Weight<span style={{ color: 'red' }}> *</span></label>
                        <input
                            type="number"
                            value={taskWeight}
                            onChange={(e) => setTaskWeight(e.target.value)}
                            placeholder="Enter Task Weight"
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Version Number</label>
                        <input
                            type="number"
                            value={versionNumber}
                            readOnly
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Apply to<span style={{ color: 'red' }}> *</span></label>
                        <select value={applyToOption} onChange={(e) => setApplyToOption(e.target.value)} required>
                            <option value="this">This Intake Only</option>
                            <option value="all">All Intakes</option>
                            <option value="custom">Selected Intakes</option>
                        </select>
                    </div>
                    {applyToOption === 'custom' && (
                        <div className={styles.formGroup}>
                            <label>Select Intakes<span style={{ color: 'red' }}> *</span></label>

                            <Select
                                isMulti
                                options={intakes.map((intake) => ({
                                    value: intake.id,
                                    label: `Semester ${intake.intake_semester}, ${intake.intake_year}`,
                                }))}
                                value={selectedIntakes}
                                onChange={handleSelectChange}
                                required
                                components={{ ClearIndicator: CustomClearIndicator }}
                                styles={{
                                    control: (provided, state) => ({
                                        ...provided,
                                        marginTop: '10px',
                                        marginBottom: '15px',
                                        paddingLeft: '3px',
                                        border: '1px solid #DDDDDD',
                                        borderRadius: '10px',
                                        fontSize: '0.9em',
                                        boxShadow:
                                            state.isFocused
                                                ? '0 0 0 1px #192e59'
                                                : '0 4px 4px rgba(0, 0, 0, 0.1)',
                                        '&:hover': {
                                            borderColor: '#E2E8F0',
                                        },
                                    }),
                                    input: (provided) => ({
                                        ...provided,
                                        margin: '0px',
                                        fontSize: '1em',
                                    }),
                                    valueContainer: (provided) => ({
                                        ...provided,
                                        padding: '10px 10px',
                                    }),
                                    multiValue: (provided) => ({
                                        ...provided,
                                        backgroundColor: '#f0f0f0',
                                    }),
                                    multiValueLabel: (provided) => ({
                                        ...provided,
                                        color: '#333',
                                        fontSize: '1em',
                                    }),
                                    multiValueRemove: (provided) => ({
                                        ...provided,
                                        color: '#666',
                                        ':hover': {
                                            backgroundColor: '#e91e255b',
                                            color: '#333',
                                        },
                                    }),
                                    option: (provided, state) => ({
                                        ...provided,
                                        backgroundColor: state.isSelected
                                            ? '#3182ce'
                                            : state.isFocused
                                                ? '#ebf8ff'
                                                : 'white',
                                        color: state.isSelected ? 'white' : 'black',
                                        padding: '10px',
                                    }),
                                    menu: (provided) => ({
                                        ...provided,
                                        borderRadius: '10px',
                                        marginTop: '5px',
                                    }),
                                    menuList: (provided) => ({
                                        ...provided,
                                        padding: '0',
                                    }),
                                }}
                            />
                        </div>
                    )}
                    <div className={styles.buttons}>
                        <button type="button" className={styles.cancelButton} onClick={onClose}>
                            Cancel
                        </button>
                        <button type="button" className={styles.deleteButton} onClick={handleDelete}>
                            Delete
                        </button>
                        <button type="submit" className={styles.saveButton}>
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
export default TaskModal;