import React from 'react';
import './Analytics.css';
import Tabs from './Tabs';
import Dropdowns from './Dropdowns';
import Statistics from './Statistics';
import Charts from './Charts';

function Analytics() {
    return (
        <div className="analytics-page-container">
            <h1>Analytics</h1>
            <div className="tabs-dropdowns-container">
                <Tabs />
                <Dropdowns />
            </div>
            <Statistics />
            <Charts />
        </div>
    );
}

export default Analytics;