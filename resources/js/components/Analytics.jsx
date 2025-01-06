// import React, { useState } from 'react';
// import './Analytics.css';
// import Tabs from './Tabs';
// import Dropdowns from './Dropdowns';
// import Statistics from './Statistics';
// import Charts from './Charts';

// function Analytics() {
//     const [selectedSemester, setSelectedSemester] = useState('sem1');
//     const [selectedProgram, setSelectedProgram] = useState('MSE (ST)');

//     return (
//         <div className="analytics-page-container">
//             <h1>Analytics</h1>
//             <div className="tabs-dropdowns-container">
//                 <Tabs
//                     selectedSemester={selectedSemester}
//                     onSemesterChange={(semester) => setSelectedSemester(semester)}
//                 />
//                 <Dropdowns
//                     selectedSemester={selectedSemester}
//                     selectedProgram={selectedProgram}
//                     onProgramChange={(program) => setSelectedProgram(program)}
//                 />
//             </div>
//             <div id="pdf-content">
//                 <Statistics
//                     selectedSemester={selectedSemester}
//                     selectedProgram={selectedProgram}
//                 />
//                 <Charts
//                     selectedSemester={selectedSemester}
//                     selectedProgram={selectedProgram}
//                 />
//             </div>
//         </div>
//     );
// }

// export default Analytics;

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import './Analytics.css';
import Tabs from './Tabs';
import Dropdowns from './Dropdowns';
import Statistics from './Statistics';
import Charts from './Charts';
import { StudentContext } from './StudentContext';
import { useUser } from './UserContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSmile, faGraduationCap, faBriefcase, faFileAlt } from '@fortawesome/free-solid-svg-icons';

function Analytics() {
    const { programs, fetchIntakes, intakesByProgram } = useContext(StudentContext);

    const [intakes, setIntakes] = useState([]);
    const [selectedSemester, setSelectedSemester] = useState(null);
    const [selectedProgram, setSelectedProgram] = useState(null);
    const [statistics, setStatistics] = useState(null);
    const [chartData, setChartData] = useState(null);
    const { token } = useUser();
    const { user } = useUser();

    const headers = { Authorization: `Bearer ${token}` };

    // Fetch Program and Semester Data
    useEffect(() => {
        if (programs.length > 0 && !selectedProgram) {
            if (user.role === 'admin') {
                setSelectedProgram(programs[0]);
            } else if (user.program_id) {
                const coordinatorProgram = programs.find(
                    (prog) => prog.id === user.program_id
                );
                if (coordinatorProgram) setSelectedProgram(coordinatorProgram);
            }
        }
    }, [programs, user]);

    useEffect(() => {
        if (selectedProgram) {
            fetchIntakes(selectedProgram.id);
            setIntakes([]); // Clear intakes until new ones are fetched
            setSelectedSemester(null); // Reset selectedSemester
        }
    }, [selectedProgram]);

    useEffect(() => {
        if (selectedProgram && intakesByProgram[selectedProgram.id]) {
            const fetchedIntakes = intakesByProgram[selectedProgram.id];
            setIntakes(fetchedIntakes);
            if (fetchedIntakes.length > 0) {
                setSelectedSemester(fetchedIntakes[0]);
            } else {
                setSelectedSemester(null);
            }
        }
    }, [intakesByProgram, selectedProgram]);

    useEffect(() => {
        if (selectedProgram && selectedSemester) {
            if (isFirstIntake) {
                setStatistics(hardcodedStats['Sem 1, 2024/2025']);
                setChartData(hardcodedCharts['Sem 1, 2024/2025']);
            } else {
                axios
                    .all([
                        axios.get('/api/statistics', {
                            params: {
                                program_id: selectedProgram.id,
                                intake_id: selectedSemester.id,
                            },
                            headers,
                        }),
                        axios.get('/api/charts', {
                            params: {
                                program_id: selectedProgram.id,
                                intake_id: selectedSemester.id,
                            },
                            headers,
                        }),
                    ])
                    .then(
                        axios.spread((statsRes, chartsRes) => {
                            const statistics = statsRes.data;
                            const chartData = chartsRes.data;

                            // Use `totalStudents` from statistics response
                            const totalStudents = statistics.all_students || 1; // Default to 1 to avoid division by zero

                            // Process and transform the chart data
                            const transformedData = {
                                lineData1: processLineData(
                                    chartData.lineData1,
                                    'Passed Proposal Defence',
                                    'rgba(75,192,192,0.4)',
                                    'rgba(75,192,192,1)',
                                    totalStudents
                                ),
                                lineData2: processLineData(
                                    chartData.lineData2,
                                    'Passed Candidature Defence',
                                    'rgba(153,102,255,0.4)',
                                    'rgba(153,102,255,1)',
                                    totalStudents
                                ),
                                lineData3: processLineData(
                                    chartData.lineData3,
                                    'Passed Dissertation',
                                    'rgba(255,159,64,0.4)',
                                    'rgba(255,159,64,1)',
                                    totalStudents
                                ),
                                doughnutData1: processDoughnutData(
                                    chartData.doughnutData1,
                                    'Student Status',
                                    ['#36A2EB', '#FF6384', '#4BC0C0', '#FFCE56', '#FF9F40', '#9966FF', '#000000', '#FF0000']
                                ),
                                doughnutData2: processDoughnutData(
                                    chartData.doughnutData2,
                                    'GoT Status',
                                    ['#4A90E2', '#50E3C2', '#9013FE', '#B8E986']
                                ),
                                barData: processBarData(chartData.barData),
                            };

                            // Update state with transformed data
                            setStatistics(statistics);
                            setChartData(transformedData);
                            console.log('Transformed chart data:', transformedData);
                        })
                    )
                    .catch((err) => console.error('Failed to fetch data:', err));
            }
        }
    }, [selectedProgram, selectedSemester]);

    const hardcodedStats = {
        'Sem 1, 2024/2025': [
            { label: 'All Students', value: 75, icon: faUser },
            { label: 'Active Students', value: 19, icon: faSmile, change: '-9' },
            { label: 'GoT Students', value: 58, icon: faGraduationCap },
            { label: 'Supervisors', value: 26, icon: faBriefcase },
            { label: 'Dissertations', value: 42, icon: faFileAlt },
        ],
    };

    const hardcodedCharts = {
        'Sem 1, 2024/2025': {
            lineData1: {
                labels: ['Sem 2', 'Sem 3', 'Sem 4'],
                datasets: [
                    {
                        label: 'Passed Proposal Defence',
                        data: [20, 50, 100],
                        counts: [10, 25, 50],
                        backgroundColor: 'rgba(75,192,192,0.4)',
                        borderColor: 'rgba(75,192,192,1)',
                        fill: true,
                    },
                ],
            },
            lineData2: {
                labels: ['Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7'],
                datasets: [
                    {
                        label: 'Passed Candidature Defence',
                        data: [10, 30, 72, 92, 100],
                        counts: [5, 15, 36, 46, 50],
                        backgroundColor: 'rgba(153,102,255,0.4)',
                        borderColor: 'rgba(153,102,255,1)',
                        fill: true,
                    },
                ],
            },
            lineData3: {
                labels: ['Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8'],
                datasets: [
                    {
                        label: 'Passed Dissertation',
                        data: [5, 15, 25, 40, 80, 100],
                        counts: [2, 7, 12, 20, 40, 50],
                        backgroundColor: 'rgba(255,159,64,0.4)',
                        borderColor: 'rgba(255,159,64,1)',
                        fill: true,
                    },
                ],
            },
            doughnutData1: {
                labels: [
                    'GoT', 'Non-GoT', 'Active', 'Inactive',
                    'Personal Leave', 'Withdrawn', 'Terminated (Inactive)', 'Terminated (Failed)',
                ],
                datasets: [
                    {
                        label: 'Student Status',
                        data: [50, 30, 40, 20, 10, 5, 2, 1],
                        backgroundColor: [
                            '#36A2EB', '#FF6384', '#4BC0C0', '#FFCE56',
                            '#FF9F40', '#9966FF', '#000000', '#FF0000',
                        ],
                    },
                ],
            },
            barData: {
                labels: ['WXX7001', 'WXX7002', 'WXX7015', 'WXX7016', 'WXX7017', 'WXX7018', 'WXX7019'],
                datasets: [
                    {
                        label: 'Courses Taken',
                        data: [25, 30, 35, 20, 25, 15, 10],
                        backgroundColor: 'rgba(255,206,86,0.6)',
                        borderColor: 'rgba(255,206,86,1)',
                        borderWidth: 1,
                    },
                ],
            },
            doughnutData2: {
                labels: ['GoT', 'Expected to GoT', 'Non-GoT', 'Not Expected to GoT'],
                datasets: [
                    {
                        label: 'GoT Status',
                        data: [50, 15, 25, 10],
                        backgroundColor: ['#4A90E2', '#50E3C2', '#9013FE', '#B8E986'],
                    },
                ],
            },
        },
    };

    const isFirstIntake =
        selectedSemester &&
        selectedSemester.intake_semester === 1 &&
        selectedSemester.intake_year === '2024/2025';

    const statsToUse = isFirstIntake
        ? hardcodedStats['Sem 1, 2024/2025']
        : statistics;

    const chartsToUse = isFirstIntake
        ? hardcodedCharts['Sem 1, 2024/2025']
        : chartData;

    const processLineData = (data, label, backgroundColor, borderColor, totalStudents) => {
        if (!data || !data.labels || !data.datasets) return null;

        const percentages = data.datasets.map((count) => Math.round((count / totalStudents) * 100));

        return {
            labels: data.labels,
            datasets: [
                {
                    label: label,
                    data: percentages, // Percentage data
                    counts: data.datasets, // Actual counts
                    backgroundColor: backgroundColor,
                    borderColor: borderColor,
                    fill: true,
                },
            ],
        };
    };

    const processDoughnutData = (data, label, backgroundColors) => {
        // Define label mapping for custom display names
        const labelMapping = {
            TF: 'Terminated (Failed)',
            TI: 'Terminated (Inactive)',
            PL: 'Personal Leave',
        };

        if (!data || !data.labels || !data.datasets || data.datasets.every((value) => value === 0)) {
            // Fallback to a light grey doughnut when the data is 0 or null
            return {
                labels: ['No Data'],
                datasets: [
                    {
                        label: 'No Data',
                        data: [1], // Show a full doughnut with one slice
                        backgroundColor: ['#D3D3D3'], // Light grey color
                    },
                ],
            };
        }

        // Map the labels to their display names
        const displayLabels = data.labels.map((originalLabel) =>
            labelMapping[originalLabel] || originalLabel // Use mapped label if exists, otherwise keep original
        );

        return {
            labels: displayLabels, // Use the updated display labels
            datasets: [
                {
                    label: label,
                    data: data.datasets,
                    backgroundColor: backgroundColors,
                },
            ],
        };
    };

    const processBarData = (data) => {
        if (!data || !data.labels || !data.datasets) return null;

        return {
            labels: data.labels,
            datasets: [
                {
                    label: 'Courses Taken',
                    data: data.datasets,
                    backgroundColor: 'rgba(255,206,86,0.6)',
                    borderColor: 'rgba(255,206,86,1)',
                    borderWidth: 1,
                },
            ],
        };
    };

    // Handle program change and reset semester
    const handleProgramChange = (program) => {
        if (selectedProgram?.id === program.id) {
            // If the selected program is the same as the current one, do nothing
            return;
        }
        setSelectedProgram(program);
        setIntakes([]); // Clear intakes until new ones are fetched
        setSelectedSemester(null); // Reset selectedSemester
    };

    if (!selectedProgram || selectedSemester === null) {
        return <div>Loading...</div>;
    }

    return (
        <div className="analytics-page-container">
            <h1>Analytics</h1>
            <div className="tabs-dropdowns-container">
                <Tabs
                    selectedSemester={selectedSemester}
                    onSemesterChange={(semester) => setSelectedSemester(semester)}
                    intakes={intakes}
                />
                <Dropdowns
                    selectedSemester={selectedSemester}
                    selectedProgram={selectedProgram}
                    onProgramChange={handleProgramChange}
                    programs={programs}
                    statistics={statsToUse}
                    chartData={chartsToUse}
                />
            </div>
            <div id="pdf-content">
                <Statistics
                    selectedSemester={selectedSemester}
                    selectedProgram={selectedProgram}
                    statistics={statsToUse}
                />
                <Charts
                    selectedSemester={selectedSemester}
                    selectedProgram={selectedProgram}
                    chartData={chartsToUse}
                />
            </div>
        </div>
    );
}

export default Analytics;