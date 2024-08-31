// resources/js/components/StudentList.jsx
import React, { useState, useEffect } from 'react';

function StudentList() {
    const [students, setStudents] = useState([]);

    useEffect(() => {
        fetch('/api/students')
            .then(response => response.json())
            .then(data => setStudents(data));
    }, []);

    return (
        <div>
            <h1>All Students</h1>
            <h2>testingzz</h2>
            <ul>
                {students.map(student => (
                    <li key={student.id}>{student.name}</li>
                ))}
            </ul>
        </div>
    );
}

export default StudentList;