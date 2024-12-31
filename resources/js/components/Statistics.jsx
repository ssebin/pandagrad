import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSmile, faGraduationCap, faBriefcase, faFileAlt } from '@fortawesome/free-solid-svg-icons';

export const statisticsData = [
    { label: 'All Students', value: 77 },
    { label: 'Active Students', value: 19 },
    { label: 'GoT Students', value: 58 },
    { label: 'Supervisors', value: 26 },
    { label: 'Dissertations', value: 42 },
];

function Statistics({ selectedSemester }) {
    const statsData = {
        sem1: [
            { label: 'All Students', value: 77, icon: faUser, change: '-' },
            { label: 'Active Students', value: 19, icon: faSmile, change: '-9', changeColor: 'red' },
            { label: 'GoT Students', value: 58, icon: faGraduationCap, change: '+12', changeColor: 'green' },
            { label: 'Supervisors', value: 26, icon: faBriefcase, change: '-' },
            { label: 'Dissertations', value: 42, icon: faFileAlt, change: '+12', changeColor: 'green' },
        ],
        sem2: [
            { label: 'All Students', value: 80, icon: faUser, change: '-' },
            { label: 'Active Students', value: 22, icon: faSmile, change: '-7', changeColor: 'red' },
            { label: 'GoT Students', value: 60, icon: faGraduationCap, change: '+15', changeColor: 'green' },
            { label: 'Supervisors', value: 28, icon: faBriefcase, change: '-' },
            { label: 'Dissertations', value: 45, icon: faFileAlt, change: '+15', changeColor: 'green' },
        ],
        sem3: [
            { label: 'All Students', value: 85, icon: faUser, change: '-' },
            { label: 'Active Students', value: 25, icon: faSmile, change: '-5', changeColor: 'red' },
            { label: 'GoT Students', value: 60, icon: faGraduationCap, change: '+18', changeColor: 'green' },
            { label: 'Supervisors', value: 30, icon: faBriefcase, change: '-' },
            { label: 'Dissertations', value: 50, icon: faFileAlt, change: '+18', changeColor: 'green' },
        ],
        sem4: [
            { label: 'All Students', value: 77, icon: faUser, change: '-' },
            { label: 'Active Students', value: 19, icon: faSmile, change: '-9', changeColor: 'red' },
            { label: 'GoT Students', value: 58, icon: faGraduationCap, change: '+12', changeColor: 'green' },
            { label: 'Supervisors', value: 26, icon: faBriefcase, change: '-' },
            { label: 'Dissertations', value: 42, icon: faFileAlt, change: '+12', changeColor: 'green' },
        ],
        sem5: [
            { label: 'All Students', value: 80, icon: faUser, change: '-' },
            { label: 'Active Students', value: 22, icon: faSmile, change: '-7', changeColor: 'red' },
            { label: 'GoT Students', value: 60, icon: faGraduationCap, change: '+15', changeColor: 'green' },
            { label: 'Supervisors', value: 28, icon: faBriefcase, change: '-' },
            { label: 'Dissertations', value: 45, icon: faFileAlt, change: '+15', changeColor: 'green' },
        ],
        sem6: [
            { label: 'All Students', value: 85, icon: faUser, change: '-' },
            { label: 'Active Students', value: 25, icon: faSmile, change: '-5', changeColor: 'red' },
            { label: 'GoT Students', value: 60, icon: faGraduationCap, change: '+18', changeColor: 'green' },
            { label: 'Supervisors', value: 30, icon: faBriefcase, change: '-' },
            { label: 'Dissertations', value: 50, icon: faFileAlt, change: '+18', changeColor: 'green' },
        ],
        sem7: [
            { label: 'All Students', value: 77, icon: faUser, change: '-' },
            { label: 'Active Students', value: 19, icon: faSmile, change: '-9', changeColor: 'red' },
            { label: 'GoT Students', value: 58, icon: faGraduationCap, change: '+12', changeColor: 'green' },
            { label: 'Supervisors', value: 26, icon: faBriefcase, change: '-' },
            { label: 'Dissertations', value: 42, icon: faFileAlt, change: '+12', changeColor: 'green' },
        ],
    };

    const stats = statsData[selectedSemester] || [];

    return (
        <div className="statistics">
            {stats.map((stat, index) => (
                <div key={index} className="stat-card">
                    <div className="stat-header">
                        <p>{stat.label}</p>
                        <FontAwesomeIcon icon={stat.icon} />
                    </div>
                    <div className="stat-value">
                        <h3>{stat.value}</h3>
                        <p style={{ color: stat.changeColor || 'black' }}>{stat.change}</p>
                    </div>

                </div>
            ))}
        </div>
    );
}

export default Statistics;