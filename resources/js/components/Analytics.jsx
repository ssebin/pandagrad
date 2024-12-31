import React, { useState } from 'react';
import './Analytics.css';
import Tabs from './Tabs';
import Dropdowns from './Dropdowns';
import Statistics from './Statistics';
import Charts from './Charts';

function Analytics() {
    const [selectedSemester, setSelectedSemester] = useState('sem1');

    return (
        <div className="analytics-page-container">
            <h1>Analytics</h1>
            <div className="tabs-dropdowns-container">
                <Tabs
                    selectedSemester={selectedSemester}
                    onSemesterChange={(semester) => setSelectedSemester(semester)}
                />
                <Dropdowns />
            </div>
            <div id="pdf-content">
                <Statistics selectedSemester={selectedSemester} />
                <Charts selectedSemester={selectedSemester} />
            </div>
        </div>
    );
}

export default Analytics;