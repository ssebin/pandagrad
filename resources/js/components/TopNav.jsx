import React, { useState, useEffect, useRef, useContext } from "react";
import { retrieveAndDecrypt } from "./storage";
import "./TopNav.css";
import { StudentContext } from './StudentContext';

function TopNav({ userName, profilePic, updateProfilePicture }) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const dropdownRef = useRef(null);
    const { fetchStudentsData } = useContext(StudentContext);

    // Determine the profile picture URL
    const userProfilePic =
        profilePic && profilePic.trim() // Check if profilePic is provided and not empty
            ? profilePic.startsWith("/images")
                ? profilePic // Use as is if already a full path
                : `/storage/${profilePic}` // Assume it's a relative path and prepend `/storage/`
            : "/images/profile-pic.png"; // Default profile picture

    const toggleDropdown = () => setDropdownOpen((prev) => !prev);

    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setDropdownOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);

            const formData = new FormData();
            formData.append("profile_pic", file);

            try {
                const response = await fetch("/api/update-profile-picture", {
                    method: "POST",
                    body: formData,
                    headers: {
                        Authorization: `Bearer ${retrieveAndDecrypt("token")}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    alert("Profile picture updated successfully!");

                    updateProfilePicture(data.profile_pic); // Update profile picture in the parent component      
                    fetchStudentsData(); // Fetch the updated student data
                } else {
                    const errorData = await response.json();
                    alert(errorData.message || "Failed to upload profile picture.");
                }
                setDropdownOpen(false);
            } catch (error) {
                console.error("Error uploading profile picture:", error);
                alert("Error: Please ensure you have chosen jpeg, jpg, png, webp, or gif files only.");
            }
        }
    };

    return (
        <div className="top-nav">
            <div className="user-info">
                <img
                    src={userProfilePic}
                    alt="Profile"
                    className="profile-pic"
                    onClick={toggleDropdown}
                />
                <span className="user-name">{userName}</span>
                {dropdownOpen && (
                    <div className="top-dropdown-menu" ref={dropdownRef}>
                        <label htmlFor="file-upload" className="top-dropdown-item">
                            Change Profile Picture
                        </label>
                        <input
                            id="file-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ display: "none" }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export default TopNav;