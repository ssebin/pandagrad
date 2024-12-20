import React, { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import { useUser } from "./UserContext"; // Import the UserContext
import { StudentContext } from './StudentContext';
import axios from "./axiosConfig"; // Import axios instance
import { encryptAndStore, retrieveAndDecrypt } from "./storage.js";
import styles from './RegistrationComplete.module.css';

const RegistrationComplete = () => {
    const navigate = useNavigate();
    const { fetchStudentsData } = useContext(StudentContext);
    const { setUser } = useUser();

    useEffect(() => {
        // Set has_study_plan in local storage
        encryptAndStore('has_study_plan', 'true');

        // Fetch the updated user details
        const fetchUserData = async () => {
            try {
                const token = retrieveAndDecrypt('token'); // Get the token from localStorage
                const headers = { Authorization: `Bearer ${token}` };

                const response = await axios.get('/api/me', { headers }); // API endpoint to fetch user details
                const updatedUser = response.data;

                // Update the user context and localStorage
                setUser(updatedUser);
                encryptAndStore('user', JSON.stringify(updatedUser));

                console.log('Updated user data fetched:', updatedUser);
            } catch (error) {
                console.error('Failed to fetch updated user data:', error);
            }
        };

        fetchUserData();
        fetchStudentsData();
    }, [setUser]);

    return (
        <div className={styles.registrationCompleteContainer}>
            <div className={styles.leftSection}>
                <img src="/images/fsktm.jpg" alt="FSKTM Background" className={styles.backgroundImage} />
                <div className={styles.overlay}></div>
                <div className={styles.content}>
                    <img src="/images/logo.png" alt="Logo" className={styles.logo} />
                    <p className={styles.logoText}>PandaGrad</p>
                    <p className={styles.description}>Monitor your progress and stay on track with FSKTM's monitoring system.</p>
                </div>
            </div>
            <div className={styles.rightSection}>
                <div className={styles.contentWrapper}>
                    <h2 className={styles.welcome}>Study Plan Created Successfully!</h2>
                    <p className={styles.completeDetails}>
                        Your study plan has been created. You may request to change the study
                        plan in the future if required.
                    </p>
                    <button
                        type="button"
                        className={styles.registrationCompleteButton}
                        onClick={() => navigate('/student/my-progress')}
                    >
                        Go to My Progress
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RegistrationComplete;