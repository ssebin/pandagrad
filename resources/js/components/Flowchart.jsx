import React from 'react';
import styles from './Flowchart.module.css';

const Flowchart = ({ semesters }) => {
    if (!semesters || semesters.length === 0) {
        return <div>No study plan.</div>;
    }

    return (
        <div className={styles.flowchartContainer}>
            <div className={styles.flowchart}>
                {semesters.map((semester, index) => (
                    <div key={index} className={styles.semesterBlock}>
                        <h3>Semester {index + 1}</h3>
                        {semester.tasks.map((task, i) => (
                            <div key={i} className={styles.taskBlock}>
                                <span>{task.name}</span>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Flowchart;