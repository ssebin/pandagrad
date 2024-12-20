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
        intake: "",
        program: "",
        nationality: "",
        profile_pic: null,
    });
    const { semesters } = useContext(StudentContext);
    const { setUser } = useUser();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, profile_pic: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

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
            const response = await fetch('http://127.0.0.1:8000/api/student/register', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${retrieveAndDecrypt('token')}`,
                },
                body: formDataObj
            });

            // Check for a successful response
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Parse the JSON response
            const data = await response.json();
            console.log('Registration successful:', data);

            // Update user context or localStorage with the new data
            const updatedUser = {
                ...user,
                profile_pic: data.profile_pic, // Update the profile picture
            };
            setUser(updatedUser);

            encryptAndStore('user', JSON.stringify(updatedUser)); // Update localStorage            

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
                    <p className={styles.description}>Monitor your progress and stay on track with FSKTM's monitoring system.</p>
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
                            <label className={styles.label}>Intake<span className={styles.required}> *</span></label>
                            <select
                                id="intake"
                                name="intake"
                                value={formData.intake}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="" disabled>Select Intake</option>
                                {semesters &&
                                    Array.from(
                                        new Set(
                                            semesters.map(
                                                semester => `Sem ${semester.semester}, ${semester.academic_year}`
                                            )
                                        )
                                    ).map(intake => (
                                        <option key={intake} value={intake}>
                                            {intake}
                                        </option>
                                    ))}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label} htmlFor="program">Program<span className={styles.required}> *</span></label>
                            <select
                                id="program"
                                name="program"
                                value={formData.program}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="" disabled>Select Program</option>
                                <option value="MSE (ST)">MSE (ST)</option>
                                <option value="MCS (AC)">MCS (AC)</option>
                            </select>
                        </div>
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