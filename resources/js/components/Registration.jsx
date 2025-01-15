import React, { useState, useContext } from "react";
import { useNavigate } from 'react-router-dom';
import { StudentContext } from './StudentContext';
import { useUser } from './UserContext';
import { encryptAndStore, retrieveAndDecrypt } from "./storage";
import styles from './Registration.module.css';

const Registration = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        matric_number: "",
        intake_id: "",
        program_id: "",
        nationality: "",
        profile_pic: "",
    });
    const { studentsData, intakesByProgram, fetchIntakes, programs } = useContext(StudentContext);
    const { setUser } = useUser();
    const [selectedProgramId, setSelectedProgramId] = useState(null);
    const [selectedIntakeId, setSelectedIntakeId] = useState(null);

    const students = studentsData && Object.keys(studentsData).length > 0
        ? Object.values(studentsData).flat()
        : [];

    const intakes = selectedProgramId ? intakesByProgram[selectedProgramId] || [] : [];

    // const handleInputChange = (e) => {
    //     const { name, value } = e.target;
    //     setFormData({ ...formData, [name]: value });
    // };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setFormData((prevStudent) => {
            const updatedStudent = { ...prevStudent, [name]: value };

            if (name === 'program_id') {
                setSelectedProgramId(value);
                // Reset dependent fields
                updatedStudent.intake_id = '';
                setSelectedIntakeId(null);
                fetchIntakes(value);
            } else if (name === 'intake_id') {
                setSelectedIntakeId(value);
                // Calculate the semester based on intake
                const selectedIntake = intakes.find(intake => intake.id === parseInt(value));
            }

            return updatedStudent;
        });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, profile_pic: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!formData.first_name || !formData.last_name || !formData.matric_number || !formData.program_id || !formData.intake_id || !formData.nationality) {
            alert('Please fill in all required fields.');
            return;
        }

        try {
            // Log the current form data state
            console.log('Current formData:', formData);

            // Create a FormData object to handle file uploads
            const formDataObj = new FormData();
            Object.keys(formData).forEach(key => {
                formDataObj.append(key, formData[key]);
            });

            // Get the user object from localStorage
            const user = JSON.parse(retrieveAndDecrypt('user'));

            if (user && user.siswamail) {
                // Append Siswamail to formDataObj
                formDataObj.append('siswamail', user.siswamail);
            } else {
                console.error('User not found in localStorage or Siswamail is missing');
                return;
            }

            // Save nationality in localStorage
            encryptAndStore('nationality', formData.nationality);

            // Send registration request
            const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/student/register`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${retrieveAndDecrypt('token')}`,
                },
                body: formDataObj
            });

            if (response.status === 422) {
                // Handle validation errors
                const errorData = await response.json();
                console.log('Validation error:', errorData);

                if (errorData.messages && errorData.messages.matric_number) {
                    alert('A student with the same matric number already exists!');
                } else {
                    alert('Registration failed due to validation errors.');
                }
            } else if (!response.ok) {
                console.error(`HTTP error! status: ${response.status}`);
                alert('An error occurred during registration.');
            }

            // Parse the JSON response
            const updatedUser = await response.json();
            console.log('Registration successful:', updatedUser);

            // Update user context and localStorage with the new data
            setUser(updatedUser); // Update the user context
            encryptAndStore('user', JSON.stringify(updatedUser)); // Update localStorae            

            // Redirect to study plan registration
            navigate('/student/register-study-plan');
        } catch (error) {
            console.error('Error during registration:', error);
        }
    };

    return (
        <div className={styles.registrationContainer}>
            {/* Left Section */}
            <div className={styles.leftSection}>
                <img src="/images/fsktm.jpg" alt="FSKTM Background" className={styles.backgroundImage} />
                <div className={styles.overlay}></div>
                <div className={styles.content}>
                    <img src="/images/logo.png" alt="Logo" className={styles.logo} />
                    <p className={styles.logoText}>PandaGrad</p>
                    <p className={styles.description}>Monitor your progress and stay on track with PandaGrad by FSKTM.</p>
                </div>
            </div>

            {/* Right Section */}
            <div className={styles.rightSection}>
                <div className={styles.formWrapper}>
                    <h1 className={styles.title}>Student Registration</h1>
                    <form onSubmit={handleSubmit}>
                        <div className={styles.formGroup}>
                            <label className={styles.label} htmlFor="first_name">First Name<span className={styles.required}> *</span></label>
                            <input
                                type="text"
                                id="first_name"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label} htmlFor="last_name">Last Name<span className={styles.required}> *</span></label>
                            <input
                                type="text"
                                id="last_name"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label} htmlFor="matric_number">Matric Number<span className={styles.required}> *</span></label>
                            <input
                                type="text"
                                id="matric_number"
                                name="matric_number"
                                value={formData.matric_number}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label} htmlFor="program">Program<span className={styles.required}> *</span></label>
                            <select
                                id="program_id"
                                name="program_id"
                                value={formData.program_id}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Select the program</option>
                                {programs.map((program) => (
                                    <option key={program.id} value={program.id}>
                                        {program.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {formData.program_id && (
                            <>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Intake<span className={styles.required}> *</span></label>
                                    <select
                                        id="intake_id"
                                        name="intake_id"
                                        value={formData.intake_id}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Select the intake</option>
                                        {intakes.map((intake) => (
                                            <option key={intake.id} value={intake.id}>
                                                Semester {intake.intake_semester}, {intake.intake_year}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        )}
                        <div className={styles.formGroup}>
                            <label className={styles.label} htmlFor="nationality">Nationality<span className={styles.required}> *</span></label>
                            <select
                                id="nationality"
                                name="nationality"
                                value={formData.nationality}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="" disabled>Select Nationality</option>
                                <option value="Malaysian">Malaysian</option>
                                <option value="Non-Malaysian">Non-Malaysian</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label} htmlFor="profile_pic">Profile Picture</label>
                            <input
                                type="file"
                                id="profile_pic"
                                name="profile_pic"
                                onChange={handleFileChange}
                            />
                        </div>
                        <button type="submit" className={styles.submitButton}>Next</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Registration;