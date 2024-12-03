import React, { useState, useContext } from "react";
import { useNavigate } from 'react-router-dom';
import './Registration.css';
import { StudentContext } from './StudentContext';
import { useUser } from './UserContext';

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

    // const handleSubmit = (e) => {
    //     e.preventDefault();

    //     // Log the current form data state
    //     console.log('Current formData:', formData);

    //     // Create a FormData object to handle file uploads
    //     const formDataObj = new FormData();
    //     Object.keys(formData).forEach(key => {
    //         formDataObj.append(key, formData[key]);
    //     });

    //     // Log the FormData object contents
    //     console.log('FormData before sending:', [...formDataObj]);

    //     // Get the user object from localStorage
    //     const user = JSON.parse(localStorage.getItem('user'));

    //     // Check if user exists and retrieve Siswamail
    //     if (user && user.siswamail) {
    //         // Append Siswamail to formDataObj
    //         formDataObj.append('siswamail', user.siswamail);
    //     } else {
    //         // Handle the case where user or siswamail is not available
    //         console.error('User not found in localStorage or Siswamail is missing');
    //         return;
    //     }

    //     // Save nationality in localStorage
    //     localStorage.setItem('nationality', formData.nationality);

    //     fetch('http://127.0.0.1:8000/api/student/register', {
    //         method: 'POST',
    //         headers: {
    //             'Authorization': `Bearer ${localStorage.getItem('token')}`,
    //         },
    //         body: formDataObj
    //     })
    //         .then(response => {
    //             // Check if the response is JSON
    //             if (response.headers.get('content-type')?.includes('application/json')) {
    //                 return response.json();
    //             } else {
    //                 throw new Error('Non-JSON response received');
    //             }
    //         })
    //         .then(data => {
    //             console.log('Registration successful:', data);
    //             // Redirect to study plan registration
    //             navigate('/student/register-study-plan');
    //         })
    //         .catch(error => {
    //             console.error('Error during registration:', error);
    //         });
    // };

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
            const user = JSON.parse(localStorage.getItem('user'));
    
            if (user && user.siswamail) {
                // Append Siswamail to formDataObj
                formDataObj.append('siswamail', user.siswamail);
            } else {
                console.error('User not found in localStorage or Siswamail is missing');
                return;
            }
    
            // Save nationality in localStorage
            localStorage.setItem('nationality', formData.nationality);
    
            // Send registration request
            const response = await fetch('http://127.0.0.1:8000/api/student/register', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
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
    
            localStorage.setItem('user', JSON.stringify(updatedUser)); // Update localStorage            
    
            // Redirect to study plan registration
            navigate('/student/register-study-plan');
        } catch (error) {
            console.error('Error during registration:', error);
        }
    };

    return (
        <div className="registration-container">
            <div className="registration-left-section">
                {/* Logos */}
                <div className="logo-container">
                    <img src="/images/logo.png" alt="Logo" className="logo" />
                    <p className='logo-text'>PandaGrad</p>
                    <img src="/images/faculty-logo.png" alt="Faculty Logo" className="faculty-logo" />
                </div>
                {/* 3D Illustration Image */}
                <img src="/images/registration-3d.png" alt="Illustration" className="registration-3d" />
            </div>

            <div className="registration-right-section">
                {/* Form */}
                <h1 className="registration-title">Student Registration</h1>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="first_name">First Name<span style={{ color: 'red' }}> *</span></label>
                        <input
                            type="text"
                            name="first_name"
                            id="first_name"
                            value={formData.first_name}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="last_name">Last Name<span style={{ color: 'red' }}> *</span></label>
                        <input
                            type="text"
                            name="last_name"
                            id="last_name"
                            value={formData.last_name}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="matric_number">Matric Number<span style={{ color: 'red' }}> *</span></label>
                        <input
                            type="text"
                            name="matric_number"
                            id="matric_number"
                            value={formData.matric_number}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        {/* <label htmlFor="intake">Intake<span style={{ color: 'red' }}> *</span></label>
                        <select
                            name="intake"
                            id="intake"
                            value={formData.intake}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">Select Intake</option>
                            <option value="Sem 1, 2021/2022">Sem 1, 2021/2022</option>
                            <option value="Sem 2, 2021/2022">Sem 2, 2021/2022</option>
                            <option value="Sem 1, 2022/2023">Sem 1, 2022/2023</option>
                            <option value="Sem 2, 2022/2023">Sem 2, 2022/2023</option>
                            <option value="Sem 1, 2023/2024">Sem 1, 2023/2024</option>
                            <option value="Sem 2, 2023/2024">Sem 2, 2023/2024</option>
                        </select> */}

                        <label>Intake<span style={{ color: 'red' }}> *</span></label>
                        <select
                            name="intake"
                            id="intake"
                            value={formData.intake}
                            onChange={handleInputChange}
                            required
                        >
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
                    <div className="form-group">
                        <label htmlFor="program">Program<span style={{ color: 'red' }}> *</span></label>
                        <select
                            name="program"
                            id="program"
                            value={formData.program}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">Select Program</option>
                            <option value="MSE (ST)">MSE (ST)</option>
                            <option value="MCS (AC)">MCS (AC)</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="nationality">Nationality<span style={{ color: 'red' }}> *</span></label>
                        <select
                            name="nationality"
                            id="nationality"
                            value={formData.nationality}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">Select Nationality</option>
                            <option value="Malaysian">Malaysian</option>
                            <option value="Non-Malaysian">Non-Malaysian</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="profile_pic">Profile Picture</label>
                        <input
                            type="file"
                            name="profile_pic"
                            id="profile_pic"
                            onChange={handleFileChange}
                        />
                    </div>
                    <button type="submit" className="submit-button">Next</button>
                </form>
            </div>
        </div>
    );
};

export default Registration;