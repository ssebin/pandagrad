import React, { useState } from 'react';
import './Analytics.css';
import Tabs from './Tabs';
import Dropdowns from './Dropdowns';
import Statistics from './Statistics';
import Charts from './Charts';

function Analytics() {
    const [selectedSemester, setSelectedSemester] = useState('sem1');
    const [selectedProgram, setSelectedProgram] = useState('MSE (ST)');

    return (
        <div className="analytics-page-container">
            <h1>Analytics</h1>
            <div className="tabs-dropdowns-container">
                <Tabs
                    selectedSemester={selectedSemester}
                    onSemesterChange={(semester) => setSelectedSemester(semester)}
                />
                <Dropdowns
                    selectedProgram={selectedProgram}
                    onProgramChange={(program) => setSelectedProgram(program)}
                />
            </div>
            <div id="pdf-content">
                <Statistics
                    selectedSemester={selectedSemester}
                    selectedProgram={selectedProgram}
                />
                <Charts
                    selectedSemester={selectedSemester}
                    selectedProgram={selectedProgram}
                />
            </div>
        </div>
    );
}

export default Analytics;