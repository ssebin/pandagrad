import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSmile, faGraduationCap, faBriefcase, faFileAlt } from '@fortawesome/free-solid-svg-icons';

function Statistics() {
    const stats = [
        { label: 'All Students', value: 77, icon: faUser, change: '-' },
        { label: 'Active Students', value: 19, icon: faSmile, change: '-9', changeColor: 'red' },
        { label: 'GoT Students', value: 58, icon: faGraduationCap, change: '+12', changeColor: 'green' },
        { label: 'Supervisors', value: 26, icon: faBriefcase, change: '-' },
        { label: 'Dissertations', value: 42, icon: faFileAlt, change: '+12', changeColor: 'green' },
    ];

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