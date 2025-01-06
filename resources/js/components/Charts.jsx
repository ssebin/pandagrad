import React, { useEffect, useState } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Import Chart.js and the components you need
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { count, lab } from 'd3';

// Register the components with Chart.js
ChartJS.register(
    CategoryScale,  // x-axis category scaling
    LinearScale,    // y-axis linear scaling
    PointElement,   // for points in line charts
    LineElement,    // for line elements
    BarElement,     // for bar charts
    ArcElement,     // for doughnut and pie charts
    Title,
    Tooltip,
    Legend
);

export const chartsData = {
    'MSE (ST)': {
        sem1: {
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
                    'Personal Leave', 'Withdrawn', 'Terminated (I)', 'Terminated (F)'
                ],
                datasets: [
                    {
                        label: 'Student Status',
                        data: [50, 30, 40, 20, 10, 5, 2, 1],
                        backgroundColor: [
                            '#36A2EB', '#FF6384', '#4BC0C0', '#FFCE56',
                            '#FF9F40', '#9966FF', '#000000', '#FF0000'
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
        sem2: {
            lineData1: {
                labels: ['Sem 2', 'Sem 3', 'Sem 4'],
                datasets: [
                    {
                        label: 'Passed Proposal Defence',
                        data: [40, 65, 100],
                        counts: [20, 32, 50],
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
                        data: [20, 45, 70, 85, 100],
                        counts: [10, 22, 35, 42, 50],
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
                        data: [10, 25, 50, 70, 90, 100],
                        counts: [5, 12, 25, 35, 45, 50],
                        backgroundColor: 'rgba(255,159,64,0.4)',
                        borderColor: 'rgba(255,159,64,1)',
                        fill: true,
                    },
                ],
            },
            doughnutData1: {
                labels: [
                    'GoT', 'Non-GoT', 'Active', 'Inactive',
                    'Personal Leave', 'Withdrawn', 'Terminated (I)', 'Terminated (F)'
                ],
                datasets: [
                    {
                        data: [60, 25, 45, 15, 8, 4, 2, 1],
                        backgroundColor: [
                            '#36A2EB', '#FF6384', '#4BC0C0', '#FFCE56',
                            '#FF9F40', '#9966FF', '#000000', '#FF0000'
                        ],
                    },
                ],
            },
            barData: {
                labels: ['WXX7001', 'WXX7002', 'WXX7015', 'WXX7016', 'WXX7017', 'WXX7018', 'WXX7019'],
                datasets: [
                    {
                        label: 'Courses Taken',
                        data: [28, 32, 38, 22, 28, 18, 12],
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
                        data: [60, 12, 20, 8],
                        backgroundColor: ['#4A90E2', '#50E3C2', '#9013FE', '#B8E986'],
                    },
                ],
            },
        },
        sem3: {
            lineData1: {
                labels: ['Sem 2', 'Sem 3', 'Sem 4'],
                datasets: [
                    {
                        label: 'Passed Proposal Defence',
                        data: [55, 75, 100],
                        counts: [30, 45, 50],
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
                        data: [35, 45, 80, 90, 100],
                        count: [20, 30, 50, 55, 60],
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
                        data: [20, 40, 60, 80, 100],
                        count: [10, 20, 30, 40, 50],
                        backgroundColor: 'rgba(255,159,64,0.4)',
                        borderColor: 'rgba(255,159,64,1)',
                        fill: true,
                    },
                ],
            },
            doughnutData1: {
                labels: [
                    'GoT', 'Non-GoT', 'Active', 'Inactive',
                    'Personal Leave', 'Withdrawn', 'Terminated (I)', 'Terminated (F)'
                ],
                datasets: [
                    {
                        data: [70, 20, 40, 10, 6, 3, 1, 0],
                        backgroundColor: [
                            '#36A2EB', '#FF6384', '#4BC0C0', '#FFCE56',
                            '#FF9F40', '#9966FF', '#000000', '#FF0000'
                        ],
                    },
                ],
            },
            barData: {
                labels: ['WXX7001', 'WXX7002', 'WXX7015', 'WXX7016', 'WXX7017', 'WXX7018', 'WXX7019'],
                datasets: [
                    {
                        label: 'Courses Taken',
                        data: [30, 35, 40, 25, 30, 20, 15],
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
                        data: [70, 10, 15, 5],
                        backgroundColor: ['#4A90E2', '#50E3C2', '#9013FE', '#B8E986'],
                    },
                ],
            },
        },

        sem4: {
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
                        data: [10, 30, 70, 90, 100],
                        counts: [5, 15, 35, 45, 50],
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
                        data: [5, 15, 40, 70, 90, 100],
                        counts: [2, 7, 20, 35, 45, 50],
                        backgroundColor: 'rgba(255,159,64,0.4)',
                        borderColor: 'rgba(255,159,64,1)',
                        fill: true,
                    },
                ],
            },
            doughnutData1: {
                labels: [
                    'GoT', 'Non-GoT', 'Active', 'Inactive',
                    'Personal Leave', 'Withdrawn', 'Terminated (I)', 'Terminated (F)'
                ],
                datasets: [
                    {
                        data: [50, 30, 40, 20, 10, 5, 2, 1],
                        backgroundColor: [
                            '#36A2EB', '#FF6384', '#4BC0C0', '#FFCE56',
                            '#FF9F40', '#9966FF', '#000000', '#FF0000'
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
                        data: [50, 15, 25, 10],
                        backgroundColor: ['#4A90E2', '#50E3C2', '#9013FE', '#B8E986'],
                    },
                ],
            },
        },
        sem5: {
            lineData1: {
                labels: ['Sem 2', 'Sem 3', 'Sem 4'],
                datasets: [
                    {
                        label: 'Passed Proposal Defence',
                        data: [40, 65, 100],
                        counts: [20, 32, 50],
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
                        data: [20, 45, 70, 85, 100],
                        counts: [10, 22, 35, 42, 50],
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
                        data: [10, 25, 50, 70, 90, 100],
                        counts: [5, 12, 25, 35, 45, 50],
                        backgroundColor: 'rgba(255,159,64,0.4)',
                        borderColor: 'rgba(255,159,64,1)',
                        fill: true,
                    },
                ],
            },
            doughnutData1: {
                labels: [
                    'GoT', 'Non-GoT', 'Active', 'Inactive',
                    'Personal Leave', 'Withdrawn', 'Terminated (I)', 'Terminated (F)'
                ],
                datasets: [
                    {
                        data: [60, 25, 45, 15, 8, 4, 2, 1],
                        backgroundColor: [
                            '#36A2EB', '#FF6384', '#4BC0C0', '#FFCE56',
                            '#FF9F40', '#9966FF', '#000000', '#FF0000'
                        ],
                    },
                ],
            },
            barData: {
                labels: ['WXX7001', 'WXX7002', 'WXX7015', 'WXX7016', 'WXX7017', 'WXX7018', 'WXX7019'],
                datasets: [
                    {
                        label: 'Courses Taken',
                        data: [28, 32, 38, 22, 28, 18, 12],
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
                        data: [60, 12, 20, 8],
                        backgroundColor: ['#4A90E2', '#50E3C2', '#9013FE', '#B8E986'],
                    },
                ],
            },
        },
        sem6: {
            lineData1: {
                labels: ['Sem 2', 'Sem 3', 'Sem 4'],
                datasets: [
                    {
                        label: 'Passed Proposal Defence',
                        data: [55, 75, 100],
                        counts: [30, 45, 50],
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
                        data: [35, 60, 80, 90, 100],
                        counts: [20, 35, 45, 50, 55],
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
                        data: [20, 40, 60, 72, 80, 100],
                        counts: [10, 20, 30, 36, 40, 50],
                        backgroundColor: 'rgba(255,159,64,0.4)',
                        borderColor: 'rgba(255,159,64,1)',
                        fill: true,
                    },
                ],
            },
            doughnutData1: {
                labels: [
                    'GoT', 'Non-GoT', 'Active', 'Inactive',
                    'Personal Leave', 'Withdrawn', 'Terminated (I)', 'Terminated (F)'
                ],
                datasets: [
                    {
                        data: [70, 20, 40, 10, 6, 3, 1, 0],
                        backgroundColor: [
                            '#36A2EB', '#FF6384', '#4BC0C0', '#FFCE56',
                            '#FF9F40', '#9966FF', '#000000', '#FF0000'
                        ],
                    },
                ],
            },
            barData: {
                labels: ['WXX7001', 'WXX7002', 'WXX7015', 'WXX7016', 'WXX7017', 'WXX7018', 'WXX7019'],
                datasets: [
                    {
                        label: 'Courses Taken',
                        data: [30, 35, 40, 25, 30, 20, 15],
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
                        data: [70, 10, 15, 5],
                        backgroundColor: ['#4A90E2', '#50E3C2', '#9013FE', '#B8E986'],
                    },
                ],
            },
        },
        sem7: {
            lineData1: {
                labels: ['Sem 2', 'Sem 3', 'Sem 4'],
                datasets: [
                    {
                        label: 'Passed Proposal Defence',
                        data: [36, 60, 100],
                        counts: [18, 30, 50],
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
                        data: [32, 50, 80, 90, 100],
                        counts: [16, 25, 40, 45, 50],
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
                        data: [12, 30, 60, 80, 90, 100],
                        counts: [6, 15, 30, 40, 45, 50],
                        backgroundColor: 'rgba(255,159,64,0.4)',
                        borderColor: 'rgba(255,159,64,1)',
                        fill: true,
                    },
                ],
            },
            doughnutData1: {
                labels: [
                    'GoT', 'Non-GoT', 'Active', 'Inactive',
                    'Personal Leave', 'Withdrawn', 'Terminated (I)', 'Terminated (F)'
                ],
                datasets: [
                    {
                        data: [70, 20, 40, 10, 6, 3, 1, 0],
                        backgroundColor: [
                            '#36A2EB', '#FF6384', '#4BC0C0', '#FFCE56',
                            '#FF9F40', '#9966FF', '#000000', '#FF0000'
                        ],
                    },
                ],
            },
            barData: {
                labels: ['WXX7001', 'WXX7002', 'WXX7015', 'WXX7016', 'WXX7017', 'WXX7018', 'WXX7019'],
                datasets: [
                    {
                        label: 'Courses Taken',
                        data: [30, 35, 40, 25, 30, 20, 15],
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
                        data: [70, 10, 15, 5],
                        backgroundColor: ['#4A90E2', '#50E3C2', '#9013FE', '#B8E986'],
                    },
                ],
            },
        },
    },
    'MCS (AC)': {
        sem2: {
            lineData1: {
                labels: ['Sem 2', 'Sem 3', 'Sem 4'],
                datasets: [
                    {
                        label: 'Passed Proposal Defence',
                        data: [20, 50, 100],
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
                        backgroundColor: 'rgba(255,159,64,0.4)',
                        borderColor: 'rgba(255,159,64,1)',
                        fill: true,
                    },
                ],
            },
            doughnutData1: {
                labels: [
                    'GoT', 'Non-GoT', 'Active', 'Inactive',
                    'Personal Leave', 'Withdrawn', 'Terminated (I)', 'Terminated (F)'
                ],
                datasets: [
                    {
                        data: [50, 30, 40, 20, 10, 5, 2, 1],
                        backgroundColor: [
                            '#36A2EB', '#FF6384', '#4BC0C0', '#FFCE56',
                            '#FF9F40', '#9966FF', '#000000', '#FF0000'
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
                        data: [50, 15, 25, 10],
                        backgroundColor: ['#4A90E2', '#50E3C2', '#9013FE', '#B8E986'],
                    },
                ],
            },
        },
        sem4: {
            lineData1: {
                labels: ['Sem 2', 'Sem 3', 'Sem 4'],
                datasets: [
                    {
                        label: 'Passed Proposal Defence',
                        data: [40, 65, 85],
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
                        data: [20, 45, 70, 85, 100],
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
                        data: [10, 25, 50, 70, 90, 100],
                        backgroundColor: 'rgba(255,159,64,0.4)',
                        borderColor: 'rgba(255,159,64,1)',
                        fill: true,
                    },
                ],
            },
            doughnutData1: {
                labels: [
                    'GoT', 'Non-GoT', 'Active', 'Inactive',
                    'Personal Leave', 'Withdrawn', 'Terminated (I)', 'Terminated (F)'
                ],
                datasets: [
                    {
                        data: [60, 25, 45, 15, 8, 4, 2, 1],
                        backgroundColor: [
                            '#36A2EB', '#FF6384', '#4BC0C0', '#FFCE56',
                            '#FF9F40', '#9966FF', '#000000', '#FF0000'
                        ],
                    },
                ],
            },
            barData: {
                labels: ['WXX7001', 'WXX7002', 'WXX7015', 'WXX7016', 'WXX7017', 'WXX7018', 'WXX7019'],
                datasets: [
                    {
                        label: 'Courses Taken',
                        data: [28, 32, 38, 22, 28, 18, 12],
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
                        data: [60, 12, 20, 8],
                        backgroundColor: ['#4A90E2', '#50E3C2', '#9013FE', '#B8E986'],
                    },
                ],
            },
        },
        sem6: {
            lineData1: {
                labels: ['Sem 2', 'Sem 3', 'Sem 4'],
                datasets: [
                    {
                        label: 'Passed Proposal Defence',
                        data: [55, 75, 100],
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
                        data: [35, 45, 80, 90, 100],
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
                        data: [20, 40, 60, 80, 100],
                        backgroundColor: 'rgba(255,159,64,0.4)',
                        borderColor: 'rgba(255,159,64,1)',
                        fill: true,
                    },
                ],
            },
            doughnutData1: {
                labels: [
                    'GoT', 'Non-GoT', 'Active', 'Inactive',
                    'Personal Leave', 'Withdrawn', 'Terminated (I)', 'Terminated (F)'
                ],
                datasets: [
                    {
                        data: [70, 20, 40, 10, 6, 3, 1, 0],
                        backgroundColor: [
                            '#36A2EB', '#FF6384', '#4BC0C0', '#FFCE56',
                            '#FF9F40', '#9966FF', '#000000', '#FF0000'
                        ],
                    },
                ],
            },
            barData: {
                labels: ['WXX7001', 'WXX7002', 'WXX7015', 'WXX7016', 'WXX7017', 'WXX7018', 'WXX7019'],
                datasets: [
                    {
                        label: 'Courses Taken',
                        data: [30, 35, 40, 25, 30, 20, 15],
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
                        data: [70, 10, 15, 5],
                        backgroundColor: ['#4A90E2', '#50E3C2', '#9013FE', '#B8E986'],
                    },
                ],
            },
        },

        sem7: {
            lineData1: {
                labels: ['Sem 2', 'Sem 3', 'Sem 4'],
                datasets: [
                    {
                        label: 'Passed Proposal Defence',
                        data: [20, 50, 100],
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
                        data: [10, 30, 70, 90, 100],
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
                        data: [5, 15, 40, 70, 90, 100],
                        backgroundColor: 'rgba(255,159,64,0.4)',
                        borderColor: 'rgba(255,159,64,1)',
                        fill: true,
                    },
                ],
            },
            doughnutData1: {
                labels: [
                    'GoT', 'Non-GoT', 'Active', 'Inactive',
                    'Personal Leave', 'Withdrawn', 'Terminated (I)', 'Terminated (F)'
                ],
                datasets: [
                    {
                        data: [50, 30, 40, 20, 10, 5, 2, 1],
                        backgroundColor: [
                            '#36A2EB', '#FF6384', '#4BC0C0', '#FFCE56',
                            '#FF9F40', '#9966FF', '#000000', '#FF0000'
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
                        data: [50, 15, 25, 10],
                        backgroundColor: ['#4A90E2', '#50E3C2', '#9013FE', '#B8E986'],
                    },
                ],
            },
        },
        sem3: {
            lineData1: {
                labels: ['Sem 2', 'Sem 3', 'Sem 4'],
                datasets: [
                    {
                        label: 'Passed Proposal Defence',
                        data: [40, 65, 100],
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
                        data: [20, 45, 70, 85, 100],
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
                        data: [10, 25, 50, 70, 90, 100],
                        backgroundColor: 'rgba(255,159,64,0.4)',
                        borderColor: 'rgba(255,159,64,1)',
                        fill: true,
                    },
                ],
            },
            doughnutData1: {
                labels: [
                    'GoT', 'Non-GoT', 'Active', 'Inactive',
                    'Personal Leave', 'Withdrawn', 'Terminated (I)', 'Terminated (F)'
                ],
                datasets: [
                    {
                        data: [60, 25, 45, 15, 8, 4, 2, 1],
                        backgroundColor: [
                            '#36A2EB', '#FF6384', '#4BC0C0', '#FFCE56',
                            '#FF9F40', '#9966FF', '#000000', '#FF0000'
                        ],
                    },
                ],
            },
            barData: {
                labels: ['WXX7001', 'WXX7002', 'WXX7015', 'WXX7016', 'WXX7017', 'WXX7018', 'WXX7019'],
                datasets: [
                    {
                        label: 'Courses Taken',
                        data: [28, 32, 38, 22, 28, 18, 12],
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
                        data: [60, 12, 20, 8],
                        backgroundColor: ['#4A90E2', '#50E3C2', '#9013FE', '#B8E986'],
                    },
                ],
            },
        },
        sem5: {
            lineData1: {
                labels: ['Sem 2', 'Sem 3', 'Sem 4'],
                datasets: [
                    {
                        label: 'Passed Proposal Defence',
                        data: [55, 75, 100],
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
                        data: [35, 60, 80, 90, 100],
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
                        data: [20, 40, 60, 72, 80, 100],
                        backgroundColor: 'rgba(255,159,64,0.4)',
                        borderColor: 'rgba(255,159,64,1)',
                        fill: true,
                    },
                ],
            },
            doughnutData1: {
                labels: [
                    'GoT', 'Non-GoT', 'Active', 'Inactive',
                    'Personal Leave', 'Withdrawn', 'Terminated (I)', 'Terminated (F)'
                ],
                datasets: [
                    {
                        data: [70, 20, 40, 10, 6, 3, 1, 0],
                        backgroundColor: [
                            '#36A2EB', '#FF6384', '#4BC0C0', '#FFCE56',
                            '#FF9F40', '#9966FF', '#000000', '#FF0000'
                        ],
                    },
                ],
            },
            barData: {
                labels: ['WXX7001', 'WXX7002', 'WXX7015', 'WXX7016', 'WXX7017', 'WXX7018', 'WXX7019'],
                datasets: [
                    {
                        label: 'Courses Taken',
                        data: [30, 35, 40, 25, 30, 20, 15],
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
                        data: [70, 10, 15, 5],
                        backgroundColor: ['#4A90E2', '#50E3C2', '#9013FE', '#B8E986'],
                    },
                ],
            },
        },
        sem1: {
            lineData1: {
                labels: ['Sem 2', 'Sem 3', 'Sem 4'],
                datasets: [
                    {
                        label: 'Passed Proposal Defence',
                        data: [36, 60, 100],
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
                        data: [32, 50, 80, 90, 100],
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
                        data: [12, 30, 60, 80, 90, 100],
                        backgroundColor: 'rgba(255,159,64,0.4)',
                        borderColor: 'rgba(255,159,64,1)',
                        fill: true,
                    },
                ],
            },
            doughnutData1: {
                labels: [
                    'GoT', 'Non-GoT', 'Active', 'Inactive',
                    'Personal Leave', 'Withdrawn', 'Terminated (I)', 'Terminated (F)'
                ],
                datasets: [
                    {
                        data: [70, 20, 40, 10, 6, 3, 1, 0],
                        backgroundColor: [
                            '#36A2EB', '#FF6384', '#4BC0C0', '#FFCE56',
                            '#FF9F40', '#9966FF', '#000000', '#FF0000'
                        ],
                    },
                ],
            },
            barData: {
                labels: ['WXX7001', 'WXX7002', 'WXX7015', 'WXX7016', 'WXX7017', 'WXX7018', 'WXX7019'],
                datasets: [
                    {
                        label: 'Courses Taken',
                        data: [30, 35, 40, 25, 30, 20, 15],
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
                        data: [70, 10, 15, 5],
                        backgroundColor: ['#4A90E2', '#50E3C2', '#9013FE', '#B8E986'],
                    },
                ],
            },
        },
    },
};

function Charts({ selectedSemester, selectedProgram, chartData }) {
    const semesterData2 = {
        'MSE (ST)': {
            sem1: {
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
                        'Personal Leave', 'Withdrawn', 'Terminated (I)', 'Terminated (F)'
                    ],
                    datasets: [
                        {
                            data: [50, 30, 40, 20, 10, 5, 2, 1],
                            backgroundColor: [
                                '#36A2EB', '#FF6384', '#4BC0C0', '#FFCE56',
                                '#FF9F40', '#9966FF', '#000000', '#FF0000'
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
                            data: [50, 15, 25, 10],
                            backgroundColor: ['#4A90E2', '#50E3C2', '#9013FE', '#B8E986'],
                        },
                    ],
                },
            },
            sem2: {
                lineData1: {
                    labels: ['Sem 2', 'Sem 3', 'Sem 4'],
                    datasets: [
                        {
                            label: 'Passed Proposal Defence',
                            data: [40, 65, 100],
                            counts: [20, 32, 50],
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
                            data: [20, 45, 70, 85, 100],
                            counts: [10, 22, 35, 42, 50],
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
                            data: [10, 25, 50, 70, 90, 100],
                            counts: [5, 12, 25, 35, 45, 50],
                            backgroundColor: 'rgba(255,159,64,0.4)',
                            borderColor: 'rgba(255,159,64,1)',
                            fill: true,
                        },
                    ],
                },
                doughnutData1: {
                    labels: [
                        'GoT', 'Non-GoT', 'Active', 'Inactive',
                        'Personal Leave', 'Withdrawn', 'Terminated (I)', 'Terminated (F)'
                    ],
                    datasets: [
                        {
                            data: [60, 25, 45, 15, 8, 4, 2, 1],
                            backgroundColor: [
                                '#36A2EB', '#FF6384', '#4BC0C0', '#FFCE56',
                                '#FF9F40', '#9966FF', '#000000', '#FF0000'
                            ],
                        },
                    ],
                },
                barData: {
                    labels: ['WXX7001', 'WXX7002', 'WXX7015', 'WXX7016', 'WXX7017', 'WXX7018', 'WXX7019'],
                    datasets: [
                        {
                            label: 'Courses Taken',
                            data: [28, 32, 38, 22, 28, 18, 12],
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
                            data: [60, 12, 20, 8],
                            backgroundColor: ['#4A90E2', '#50E3C2', '#9013FE', '#B8E986'],
                        },
                    ],
                },
            },
            sem3: {
                lineData1: {
                    labels: ['Sem 2', 'Sem 3', 'Sem 4'],
                    datasets: [
                        {
                            label: 'Passed Proposal Defence',
                            data: [55, 75, 100],
                            counts: [30, 45, 50],
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
                            data: [35, 45, 80, 90, 100],
                            count: [20, 30, 50, 55, 60],
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
                            data: [20, 40, 60, 80, 100],
                            count: [10, 20, 30, 40, 50],
                            backgroundColor: 'rgba(255,159,64,0.4)',
                            borderColor: 'rgba(255,159,64,1)',
                            fill: true,
                        },
                    ],
                },
                doughnutData1: {
                    labels: [
                        'GoT', 'Non-GoT', 'Active', 'Inactive',
                        'Personal Leave', 'Withdrawn', 'Terminated (I)', 'Terminated (F)'
                    ],
                    datasets: [
                        {
                            data: [70, 20, 40, 10, 6, 3, 1, 0],
                            backgroundColor: [
                                '#36A2EB', '#FF6384', '#4BC0C0', '#FFCE56',
                                '#FF9F40', '#9966FF', '#000000', '#FF0000'
                            ],
                        },
                    ],
                },
                barData: {
                    labels: ['WXX7001', 'WXX7002', 'WXX7015', 'WXX7016', 'WXX7017', 'WXX7018', 'WXX7019'],
                    datasets: [
                        {
                            label: 'Courses Taken',
                            data: [30, 35, 40, 25, 30, 20, 15],
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
                            data: [70, 10, 15, 5],
                            backgroundColor: ['#4A90E2', '#50E3C2', '#9013FE', '#B8E986'],
                        },
                    ],
                },
            },

            sem4: {
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
                            data: [10, 30, 70, 90, 100],
                            counts: [5, 15, 35, 45, 50],
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
                            data: [5, 15, 40, 70, 90, 100],
                            counts: [2, 7, 20, 35, 45, 50],
                            backgroundColor: 'rgba(255,159,64,0.4)',
                            borderColor: 'rgba(255,159,64,1)',
                            fill: true,
                        },
                    ],
                },
                doughnutData1: {
                    labels: [
                        'GoT', 'Non-GoT', 'Active', 'Inactive',
                        'Personal Leave', 'Withdrawn', 'Terminated (I)', 'Terminated (F)'
                    ],
                    datasets: [
                        {
                            data: [50, 30, 40, 20, 10, 5, 2, 1],
                            backgroundColor: [
                                '#36A2EB', '#FF6384', '#4BC0C0', '#FFCE56',
                                '#FF9F40', '#9966FF', '#000000', '#FF0000'
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
                            data: [50, 15, 25, 10],
                            backgroundColor: ['#4A90E2', '#50E3C2', '#9013FE', '#B8E986'],
                        },
                    ],
                },
            },
            sem5: {
                lineData1: {
                    labels: ['Sem 2', 'Sem 3', 'Sem 4'],
                    datasets: [
                        {
                            label: 'Passed Proposal Defence',
                            data: [40, 65, 100],
                            counts: [20, 32, 50],
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
                            data: [20, 45, 70, 85, 100],
                            counts: [10, 22, 35, 42, 50],
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
                            data: [10, 25, 50, 70, 90, 100],
                            counts: [5, 12, 25, 35, 45, 50],
                            backgroundColor: 'rgba(255,159,64,0.4)',
                            borderColor: 'rgba(255,159,64,1)',
                            fill: true,
                        },
                    ],
                },
                doughnutData1: {
                    labels: [
                        'GoT', 'Non-GoT', 'Active', 'Inactive',
                        'Personal Leave', 'Withdrawn', 'Terminated (I)', 'Terminated (F)'
                    ],
                    datasets: [
                        {
                            data: [60, 25, 45, 15, 8, 4, 2, 1],
                            backgroundColor: [
                                '#36A2EB', '#FF6384', '#4BC0C0', '#FFCE56',
                                '#FF9F40', '#9966FF', '#000000', '#FF0000'
                            ],
                        },
                    ],
                },
                barData: {
                    labels: ['WXX7001', 'WXX7002', 'WXX7015', 'WXX7016', 'WXX7017', 'WXX7018', 'WXX7019'],
                    datasets: [
                        {
                            label: 'Courses Taken',
                            data: [28, 32, 38, 22, 28, 18, 12],
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
                            data: [60, 12, 20, 8],
                            backgroundColor: ['#4A90E2', '#50E3C2', '#9013FE', '#B8E986'],
                        },
                    ],
                },
            },
            sem6: {
                lineData1: {
                    labels: ['Sem 2', 'Sem 3', 'Sem 4'],
                    datasets: [
                        {
                            label: 'Passed Proposal Defence',
                            data: [55, 75, 100],
                            counts: [30, 45, 50],
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
                            data: [35, 60, 80, 90, 100],
                            counts: [20, 35, 45, 50, 55],
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
                            data: [20, 40, 60, 72, 80, 100],
                            counts: [10, 20, 30, 36, 40, 50],
                            backgroundColor: 'rgba(255,159,64,0.4)',
                            borderColor: 'rgba(255,159,64,1)',
                            fill: true,
                        },
                    ],
                },
                doughnutData1: {
                    labels: [
                        'GoT', 'Non-GoT', 'Active', 'Inactive',
                        'Personal Leave', 'Withdrawn', 'Terminated (I)', 'Terminated (F)'
                    ],
                    datasets: [
                        {
                            data: [70, 20, 40, 10, 6, 3, 1, 0],
                            backgroundColor: [
                                '#36A2EB', '#FF6384', '#4BC0C0', '#FFCE56',
                                '#FF9F40', '#9966FF', '#000000', '#FF0000'
                            ],
                        },
                    ],
                },
                barData: {
                    labels: ['WXX7001', 'WXX7002', 'WXX7015', 'WXX7016', 'WXX7017', 'WXX7018', 'WXX7019'],
                    datasets: [
                        {
                            label: 'Courses Taken',
                            data: [30, 35, 40, 25, 30, 20, 15],
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
                            data: [70, 10, 15, 5],
                            backgroundColor: ['#4A90E2', '#50E3C2', '#9013FE', '#B8E986'],
                        },
                    ],
                },
            },
            sem7: {
                lineData1: {
                    labels: ['Sem 2', 'Sem 3', 'Sem 4'],
                    datasets: [
                        {
                            label: 'Passed Proposal Defence',
                            data: [36, 60, 100],
                            counts: [18, 30, 50],
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
                            data: [32, 50, 80, 90, 100],
                            counts: [16, 25, 40, 45, 50],
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
                            data: [12, 30, 60, 80, 90, 100],
                            counts: [6, 15, 30, 40, 45, 50],
                            backgroundColor: 'rgba(255,159,64,0.4)',
                            borderColor: 'rgba(255,159,64,1)',
                            fill: true,
                        },
                    ],
                },
                doughnutData1: {
                    labels: [
                        'GoT', 'Non-GoT', 'Active', 'Inactive',
                        'Personal Leave', 'Withdrawn', 'Terminated (I)', 'Terminated (F)'
                    ],
                    datasets: [
                        {
                            data: [70, 20, 40, 10, 6, 3, 1, 0],
                            backgroundColor: [
                                '#36A2EB', '#FF6384', '#4BC0C0', '#FFCE56',
                                '#FF9F40', '#9966FF', '#000000', '#FF0000'
                            ],
                        },
                    ],
                },
                barData: {
                    labels: ['WXX7001', 'WXX7002', 'WXX7015', 'WXX7016', 'WXX7017', 'WXX7018', 'WXX7019'],
                    datasets: [
                        {
                            label: 'Courses Taken',
                            data: [30, 35, 40, 25, 30, 20, 15],
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
                            data: [70, 10, 15, 5],
                            backgroundColor: ['#4A90E2', '#50E3C2', '#9013FE', '#B8E986'],
                        },
                    ],
                },
            },
        },
        'MCS (AC)': {
            sem2: {
                lineData1: {
                    labels: ['Sem 2', 'Sem 3', 'Sem 4'],
                    datasets: [
                        {
                            label: 'Passed Proposal Defence',
                            data: [20, 50, 100],
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
                            backgroundColor: 'rgba(255,159,64,0.4)',
                            borderColor: 'rgba(255,159,64,1)',
                            fill: true,
                        },
                    ],
                },
                doughnutData1: {
                    labels: [
                        'GoT', 'Non-GoT', 'Active', 'Inactive',
                        'Personal Leave', 'Withdrawn', 'Terminated (I)', 'Terminated (F)'
                    ],
                    datasets: [
                        {
                            data: [50, 30, 40, 20, 10, 5, 2, 1],
                            backgroundColor: [
                                '#36A2EB', '#FF6384', '#4BC0C0', '#FFCE56',
                                '#FF9F40', '#9966FF', '#000000', '#FF0000'
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
                            data: [50, 15, 25, 10],
                            backgroundColor: ['#4A90E2', '#50E3C2', '#9013FE', '#B8E986'],
                        },
                    ],
                },
            },
            sem4: {
                lineData1: {
                    labels: ['Sem 2', 'Sem 3', 'Sem 4'],
                    datasets: [
                        {
                            label: 'Passed Proposal Defence',
                            data: [40, 65, 85],
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
                            data: [20, 45, 70, 85, 100],
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
                            data: [10, 25, 50, 70, 90, 100],
                            backgroundColor: 'rgba(255,159,64,0.4)',
                            borderColor: 'rgba(255,159,64,1)',
                            fill: true,
                        },
                    ],
                },
                doughnutData1: {
                    labels: [
                        'GoT', 'Non-GoT', 'Active', 'Inactive',
                        'Personal Leave', 'Withdrawn', 'Terminated (I)', 'Terminated (F)'
                    ],
                    datasets: [
                        {
                            data: [60, 25, 45, 15, 8, 4, 2, 1],
                            backgroundColor: [
                                '#36A2EB', '#FF6384', '#4BC0C0', '#FFCE56',
                                '#FF9F40', '#9966FF', '#000000', '#FF0000'
                            ],
                        },
                    ],
                },
                barData: {
                    labels: ['WXX7001', 'WXX7002', 'WXX7015', 'WXX7016', 'WXX7017', 'WXX7018', 'WXX7019'],
                    datasets: [
                        {
                            label: 'Courses Taken',
                            data: [28, 32, 38, 22, 28, 18, 12],
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
                            data: [60, 12, 20, 8],
                            backgroundColor: ['#4A90E2', '#50E3C2', '#9013FE', '#B8E986'],
                        },
                    ],
                },
            },
            sem6: {
                lineData1: {
                    labels: ['Sem 2', 'Sem 3', 'Sem 4'],
                    datasets: [
                        {
                            label: 'Passed Proposal Defence',
                            data: [55, 75, 100],
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
                            data: [35, 45, 80, 90, 100],
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
                            data: [20, 40, 60, 80, 100],
                            backgroundColor: 'rgba(255,159,64,0.4)',
                            borderColor: 'rgba(255,159,64,1)',
                            fill: true,
                        },
                    ],
                },
                doughnutData1: {
                    labels: [
                        'GoT', 'Non-GoT', 'Active', 'Inactive',
                        'Personal Leave', 'Withdrawn', 'Terminated (I)', 'Terminated (F)'
                    ],
                    datasets: [
                        {
                            data: [70, 20, 40, 10, 6, 3, 1, 0],
                            backgroundColor: [
                                '#36A2EB', '#FF6384', '#4BC0C0', '#FFCE56',
                                '#FF9F40', '#9966FF', '#000000', '#FF0000'
                            ],
                        },
                    ],
                },
                barData: {
                    labels: ['WXX7001', 'WXX7002', 'WXX7015', 'WXX7016', 'WXX7017', 'WXX7018', 'WXX7019'],
                    datasets: [
                        {
                            label: 'Courses Taken',
                            data: [30, 35, 40, 25, 30, 20, 15],
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
                            data: [70, 10, 15, 5],
                            backgroundColor: ['#4A90E2', '#50E3C2', '#9013FE', '#B8E986'],
                        },
                    ],
                },
            },

            sem7: {
                lineData1: {
                    labels: ['Sem 2', 'Sem 3', 'Sem 4'],
                    datasets: [
                        {
                            label: 'Passed Proposal Defence',
                            data: [20, 50, 100],
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
                            data: [10, 30, 70, 90, 100],
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
                            data: [5, 15, 40, 70, 90, 100],
                            backgroundColor: 'rgba(255,159,64,0.4)',
                            borderColor: 'rgba(255,159,64,1)',
                            fill: true,
                        },
                    ],
                },
                doughnutData1: {
                    labels: [
                        'GoT', 'Non-GoT', 'Active', 'Inactive',
                        'Personal Leave', 'Withdrawn', 'Terminated (I)', 'Terminated (F)'
                    ],
                    datasets: [
                        {
                            data: [50, 30, 40, 20, 10, 5, 2, 1],
                            backgroundColor: [
                                '#36A2EB', '#FF6384', '#4BC0C0', '#FFCE56',
                                '#FF9F40', '#9966FF', '#000000', '#FF0000'
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
                            data: [50, 15, 25, 10],
                            backgroundColor: ['#4A90E2', '#50E3C2', '#9013FE', '#B8E986'],
                        },
                    ],
                },
            },
            sem3: {
                lineData1: {
                    labels: ['Sem 2', 'Sem 3', 'Sem 4'],
                    datasets: [
                        {
                            label: 'Passed Proposal Defence',
                            data: [40, 65, 100],
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
                            data: [20, 45, 70, 85, 100],
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
                            data: [10, 25, 50, 70, 90, 100],
                            backgroundColor: 'rgba(255,159,64,0.4)',
                            borderColor: 'rgba(255,159,64,1)',
                            fill: true,
                        },
                    ],
                },
                doughnutData1: {
                    labels: [
                        'GoT', 'Non-GoT', 'Active', 'Inactive',
                        'Personal Leave', 'Withdrawn', 'Terminated (I)', 'Terminated (F)'
                    ],
                    datasets: [
                        {
                            data: [60, 25, 45, 15, 8, 4, 2, 1],
                            backgroundColor: [
                                '#36A2EB', '#FF6384', '#4BC0C0', '#FFCE56',
                                '#FF9F40', '#9966FF', '#000000', '#FF0000'
                            ],
                        },
                    ],
                },
                barData: {
                    labels: ['WXX7001', 'WXX7002', 'WXX7015', 'WXX7016', 'WXX7017', 'WXX7018', 'WXX7019'],
                    datasets: [
                        {
                            label: 'Courses Taken',
                            data: [28, 32, 38, 22, 28, 18, 12],
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
                            data: [60, 12, 20, 8],
                            backgroundColor: ['#4A90E2', '#50E3C2', '#9013FE', '#B8E986'],
                        },
                    ],
                },
            },
            sem5: {
                lineData1: {
                    labels: ['Sem 2', 'Sem 3', 'Sem 4'],
                    datasets: [
                        {
                            label: 'Passed Proposal Defence',
                            data: [55, 75, 100],
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
                            data: [35, 60, 80, 90, 100],
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
                            data: [20, 40, 60, 72, 80, 100],
                            backgroundColor: 'rgba(255,159,64,0.4)',
                            borderColor: 'rgba(255,159,64,1)',
                            fill: true,
                        },
                    ],
                },
                doughnutData1: {
                    labels: [
                        'GoT', 'Non-GoT', 'Active', 'Inactive',
                        'Personal Leave', 'Withdrawn', 'Terminated (I)', 'Terminated (F)'
                    ],
                    datasets: [
                        {
                            data: [70, 20, 40, 10, 6, 3, 1, 0],
                            backgroundColor: [
                                '#36A2EB', '#FF6384', '#4BC0C0', '#FFCE56',
                                '#FF9F40', '#9966FF', '#000000', '#FF0000'
                            ],
                        },
                    ],
                },
                barData: {
                    labels: ['WXX7001', 'WXX7002', 'WXX7015', 'WXX7016', 'WXX7017', 'WXX7018', 'WXX7019'],
                    datasets: [
                        {
                            label: 'Courses Taken',
                            data: [30, 35, 40, 25, 30, 20, 15],
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
                            data: [70, 10, 15, 5],
                            backgroundColor: ['#4A90E2', '#50E3C2', '#9013FE', '#B8E986'],
                        },
                    ],
                },
            },
            sem1: {
                lineData1: {
                    labels: ['Sem 2', 'Sem 3', 'Sem 4'],
                    datasets: [
                        {
                            label: 'Passed Proposal Defence',
                            data: [36, 60, 100],
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
                            data: [32, 50, 80, 90, 100],
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
                            data: [12, 30, 60, 80, 90, 100],
                            backgroundColor: 'rgba(255,159,64,0.4)',
                            borderColor: 'rgba(255,159,64,1)',
                            fill: true,
                        },
                    ],
                },
                doughnutData1: {
                    labels: [
                        'GoT', 'Non-GoT', 'Active', 'Inactive',
                        'Personal Leave', 'Withdrawn', 'Terminated (I)', 'Terminated (F)'
                    ],
                    datasets: [
                        {
                            data: [70, 20, 40, 10, 6, 3, 1, 0],
                            backgroundColor: [
                                '#36A2EB', '#FF6384', '#4BC0C0', '#FFCE56',
                                '#FF9F40', '#9966FF', '#000000', '#FF0000'
                            ],
                        },
                    ],
                },
                barData: {
                    labels: ['WXX7001', 'WXX7002', 'WXX7015', 'WXX7016', 'WXX7017', 'WXX7018', 'WXX7019'],
                    datasets: [
                        {
                            label: 'Courses Taken',
                            data: [30, 35, 40, 25, 30, 20, 15],
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
                            data: [70, 10, 15, 5],
                            backgroundColor: ['#4A90E2', '#50E3C2', '#9013FE', '#B8E986'],
                        },
                    ],
                },
            },
        },
    };

    if (!chartData || Object.keys(chartData).length === 0) {
        return <p>No chart data available for the selected program and semester.</p>;
    }

    const {
        lineData1,
        lineData2,
        lineData3,
        doughnutData1,
        barData,
        doughnutData2,
    } = chartData;

    const lineOptions = {
        maintainAspectRatio: false,
        scales: {
            y: {
                min: 0, // Start at 0%
                max: 100, // End at 100%
                ticks: {
                    callback: function (value) {
                        return value + '%';
                    },
                },
            },
        },
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const value = context.parsed.y; // Percentage value
                        const actualCount = context.dataset?.counts?.[context.dataIndex]; // Actual count
                        const studentText = actualCount === 1 ? 'student' : 'students'; // Singular/Plural
                        return `${value}% (${actualCount} ${studentText})`;
                    },
                },
            },
        },
    };

    const barOptions = {
        maintainAspectRatio: false,
        layout: {
            padding: {
                top: 0,
                bottom: 60,
                left: 20,
                right: 20,
            },
        },
        scales: {
            y: {
                beginAtZero: true, // Start at 0
                ticks: {
                    precision: 0, // Show whole numbers only
                },
            },
        },
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const count = context.parsed.y || 0; // Number of students
                        const studentText = count === 1 ? 'student' : 'students'; // Singular/Plural
                        return `${count} ${studentText}`;
                    },
                },
            },
        },
    };

    const doughnutOptions = {
        maintainAspectRatio: false,
        layout: {
            padding: {
                top: 0,
                bottom: 60,
                left: 20,
                right: 20,
            },
        },
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const label = context.label || ''; // Get the label
                        const value = context.raw; // Get the raw value of the data

                        // If "No Data," only show the label without data
                        if (label === 'No Data') {
                            return '0';
                        }

                        const studentText = value === 1 ? 'student' : 'students'; // Singular/Plural
                        return `${label}: ${value} ${studentText}`;
                    },
                },
            },
        },
    };

    return (
        <div className="charts">
            <div className="chart">
                <h3 className='analytics-h3'>Passed Proposal Defence</h3>
                <div className="chart-container">
                    <Line data={lineData1} options={lineOptions} />
                </div>
            </div>
            <div className="chart">
                <h3 className='analytics-h3'>Passed Candidature Defence</h3>
                <div className="chart-container">
                    <Line data={lineData2} options={lineOptions} />
                </div>
            </div>
            <div className="chart">
                <h3 className='analytics-h3'>Passed Dissertation</h3>
                <div className="chart-container">
                    <Line data={lineData3} options={lineOptions} />
                </div>
            </div>
            <div className="chart">
                <div className="chart-container">
                    <h3 className='analytics-h3'>Student Status</h3>
                    <Doughnut data={doughnutData1} options={doughnutOptions} />
                </div>
            </div>
            <div className="chart">
                <div className="chart-container">
                    <h3 className='analytics-h3'>Courses Taken</h3>
                    <Bar data={barData} options={barOptions} />
                </div>
            </div>
            <div className="chart">
                <div className="chart-container">
                    <h3 className='analytics-h3'>GoT Status</h3>
                    <Doughnut data={doughnutData2} options={doughnutOptions} />
                </div>
            </div>
        </div>
    );
}

export default Charts;

// // const data = semesterData[selectedProgram]?.[selectedSemester] || [];

// // if (!Object.keys(data).length) {
// //     return <p>No data available for the selected program and semester.</p>;
// // }

// // Fallback for missing or zero data
// const isDataEmpty = (data) => {
//     if (!data || Object.keys(data).length === 0) return true;

//     // Check for all required keys and ensure datasets are not empty
//     const keys = ['lineData1', 'lineData2', 'lineData3', 'doughnutData1', 'barData', 'doughnutData2'];

//     return keys.every((key) => {
//         const chart = data[key];
//         if (!chart || !chart.datasets) return true; // If missing or no datasets, consider it empty

//         return chart.datasets.every((dataset) => {
//             return !dataset.data || dataset.data.length === 0 || dataset.data.every((value) => value === 0);
//         });
//     });
// };


// console.log('chartData: ', chartData);

// if (!chartData || Object.keys(chartData).length === 0) {
//     return <p>Loading charts...</p>;
// }

// if (isDataEmpty(chartData)) {
//     return <p>No chart data available for the selected program and semester.</p>;
// }


// const {
//     lineData1 = { labels: [], datasets: [] },
//     lineData2 = { labels: [], datasets: [] },
//     lineData3 = { labels: [], datasets: [] },
//     doughnutData1 = { labels: [], datasets: [] },
//     doughnutData2 = { labels: [], datasets: [] },
//     barData = { labels: [], datasets: [] },
// } = chartData || {};