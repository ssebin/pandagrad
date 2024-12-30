import React, { useState, useRef, useEffect, useContext } from 'react';
import styles from './AddSemesterModal.module.css';
import axios from 'axios';
import { retrieveAndDecrypt } from "./storage";
import Select, { components } from 'react-select';
import { StudentContext } from './StudentContext';

function TaskModal({ isOpen, onClose, task, onTaskUpdated, onTaskDeleted, programId, intakeId, isVersionView = false }) {
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [taskWeight, setTaskWeight] = useState('');
    const [versionNumber, setVersionNumber] = useState('');
    const [applyToOption, setApplyToOption] = useState('this'); // 'this', 'all', 'custom'
    const [intakes, setIntakes] = useState([]);
    const [selectedIntakes, setSelectedIntakes] = useState([]);
    const [latestVersionNumber, setLatestVersionNumber] = useState(null);
    const token = retrieveAndDecrypt('token');
    const modalRef = useRef(null);
    const { intakesByProgram, fetchIntakes } = useContext(StudentContext);

    useEffect(() => {
        if (isOpen && task && intakes && intakes.length > 0) {
            setName(task.name || '');
            setCategory(task.category || '');
            setTaskWeight(task.task_weight || '');
            setVersionNumber(task.version_number || '');
            setApplyToOption(task.apply_to_option || 'this');

            if (task.apply_to_option === 'custom' && task.selected_intake_ids) {
                const intakeIds = JSON.parse(task.selected_intake_ids);
                const selected = intakes
                    .filter((intake) => intakeIds.includes(intake.id))
                    .map((intake) => ({
                        value: intake.id,
                        label: `Semester ${intake.intake_semester}, ${intake.intake_year}`,
                    }));
                setSelectedIntakes(selected);
            } else {
                setSelectedIntakes([]);
            }
        }
    }, [isOpen, task, intakes]);

    useEffect(() => {
        if (isOpen) {
            fetchIntakes(programId);
            setIntakes(intakesByProgram[programId]);
            console.log('Intakes:', intakesByProgram[programId]);
        }
    }, [isOpen, programId, token]);

    useEffect(() => {
        if (isOpen && task && task.id && isVersionView) {
            console.log('Task in useEffect:', task);
            // Fetch the latest version number
            const fetchLatestVersion = async () => {
                try {
                    const response = await axios.get(
                        `/api/tasks/${task.id}/latest-version-number`,
                        {
                            headers: { Authorization: `Bearer ${token}` },
                        }
                    );
                    setLatestVersionNumber(response.data.latest_version_number);
                } catch (error) {
                    console.error('Error fetching latest version number:', error);
                }
            };
            fetchLatestVersion();
        }
    }, [isOpen, task, isVersionView, token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!window.confirm("Are you sure you want to save changes to this task?")) {
            return;
        }

        try {
            const payload = {
                name: name,
                category: category,
                task_weight: taskWeight,
                apply_to_option: applyToOption,
            };

            if (applyToOption === 'custom') {
                payload.selected_intake_ids = selectedIntakes.map((intake) => intake.value);
            }

            const response = await axios.put(
                `/api/tasks/${task.id}`,
                payload,
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
            // intakeIds = intakeIds.filter(id => id !== parseInt(intakeId));

            // Apply changes to other intakes if any
            if (intakeIds.length > 0) {
                await axios.post(
                    `/api/tasks/${updatedTask.id}/apply-changes`,
                    { intake_ids: intakeIds, apply_to_option: applyToOption, },
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

    const handleRevert = async () => {
        if (!window.confirm('Are you sure you want to revert to this version?')) {
            return;
        }

        try {
            await axios.post(
                `/api/tasks/${task.id}/revert`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            alert('Task reverted successfully!');
            onTaskUpdated();
            onClose();
        } catch (error) {
            alert('An error occurred while reverting the task. Please try again.');
            console.error('Error reverting task:', error);
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
                            readOnly={isVersionView}
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
                            readOnly={isVersionView}
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
                            readOnly={isVersionView}
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
                        <select
                            value={applyToOption}
                            onChange={(e) => setApplyToOption(e.target.value)}
                            required
                            disabled={isVersionView}
                            className={`${isVersionView ? styles.disabledSelect : ''}`}
                        >
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
                                isDisabled={isVersionView}
                                styles={{
                                    control: (provided, state) => ({
                                        ...provided,
                                        backgroundColor: isVersionView ? '#f9f9f9' : provided.backgroundColor,
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
                        {isVersionView && task.version_number !== latestVersionNumber && (
                            <button type="button" className={styles.deleteButton} onClick={handleRevert}>
                                Revert to this version
                            </button>
                        )}
                        {!isVersionView && (
                            <button type="button" className={styles.deleteButton} onClick={handleDelete}>
                                Delete
                            </button>
                        )}
                        {!isVersionView && (
                            <button type="submit" className={styles.saveButton}>
                                Save
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
export default TaskModal;