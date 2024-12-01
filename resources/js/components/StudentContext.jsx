import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const StudentContext = createContext();

export const StudentProvider = ({ children }) => {
    const [studentsData, setStudentsData] = useState(null);
    const [supervisors, setSupervisors] = useState([]);
    const [currentSemester, setCurrentSemester] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [tasks, setTasks] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [nationalities, setNationalities] = useState({});
    // const [currentTasks, setCurrentTasks] = useState({});
    //const [studyPlans, setStudyPlans] = useState({});

    const fetchStudentsData = async () => {
        try {
            setIsLoading(true);

            // Add Authorization Header
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            // Fetch semester info
            const semesterResponse = await axios.get('/api/semesters', { headers });
            const semesters = semesterResponse.data;
            const currentSem = calculateCurrentSemester(semesters);
            setCurrentSemester(currentSem);

            // Fetch students with details
            const studentResponse = await axios.get('/api/students?includeDetails=true', { headers });
            const students = studentResponse.data;

            // Fetch all study plans in one API call
            // const studyPlansById = await fetchAndStoreStudyPlans(headers);
            // setStudyPlans(studyPlansById);  

            const nationalitiesById = students.reduce((acc, student) => {
                acc[student.id] = student.nationality;
                return acc;
            }, {});
            setNationalities(nationalitiesById);

            // const currentTasksById = students.reduce((acc, student) => {
            //     acc[student.id] = student.task;
            //     return acc;
            // }, {});
            // setCurrentTasks(currentTasksById);

            // // Fetch and store all study plans
            // const studyPlansById = await fetchAndStoreStudyPlans(students, headers);

            // setStudyPlans(studyPlansById); // Save all study plans to state or context

            // Calculate current semester for each student
            students.forEach(student => {
                student.currentSemester = calculateStudentSemester(student.intake, currentSem);
            });

            // Group students by intake
            const groupedStudents = students.reduce((acc, student) => {
                const intake = student.intake;
                if (!acc[intake]) {
                    acc[intake] = [];
                }
                acc[intake].push(student);
                return acc;
            }, {});

            // Sort intakes in descending order (oldest to newest)
            const sortedIntakes = Object.keys(groupedStudents).sort((a, b) => {
                const [aSem, aYearRange] = a.split(', ');
                const [bSem, bYearRange] = b.split(', ');
                const [aYearStart] = aYearRange.split('/').map(Number);
                const [bYearStart] = bYearRange.split('/').map(Number);
                const aSemNumber = parseInt(aSem.split(' ')[1]);
                const bSemNumber = parseInt(bSem.split(' ')[1]);

                if (aYearStart === bYearStart) {
                    return bSemNumber - aSemNumber;
                }
                return bYearStart - aYearStart;
            });

            const sortedGroupedStudents = {};
            sortedIntakes.forEach(intake => {
                sortedGroupedStudents[intake] = groupedStudents[intake].sort((a, b) =>
                    `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`)
                );
            });

            setStudentsData(sortedGroupedStudents);
            console.log('Students Data:', sortedGroupedStudents);
        } catch (error) {
            console.error('Failed to fetch students:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // const fetchAndStoreStudyPlans = async (headers) => {
    //     try {
    //         // Fetch all study plans for all students
    //         const response = await axios.get('/api/students/study-plans', { headers });
    //         const studyPlansById = response.data; // { studentId: [studyPlanData] }

    //         console.log('Fetched All Study Plans:', studyPlansById);
    //         return studyPlansById;
    //     } catch (error) {
    //         console.error('Error fetching all study plans:', error);
    //         return {}; // Return an empty object on error
    //     }
    // };

    // const fetchStudyPlan = async (studentId, headers) => {
    //     try {
    //         const response = await axios.get(`/api/students/${studentId}/study-plan`, { headers });
    //         console.log(`Study Plan Response for Student ID: ${studentId}`, response.data);

    //         if (response.data) {
    //             return response.data; // Return the study plan directly
    //         } else {
    //             console.log(`Study plan not found for student ID: ${studentId}`);
    //             return null; // Return null if no study plan exists
    //         }
    //     } catch (error) {
    //         console.error(`Error fetching study plan for student ID: ${studentId}`, error);
    //         return null; // Return null on error
    //     }
    // };

    // const fetchAndStoreStudyPlans = async (students, headers) => {
    //     const studyPlanPromises = students.map(student => fetchStudyPlan(student.id, headers));
    //     const studyPlans = await Promise.all(studyPlanPromises);

    //     // Create a dictionary of study plans by student ID
    //     const studyPlansById = students.reduce((acc, student, index) => {
    //         acc[student.id] = studyPlans[index] || []; // Assign fetched study plan or an empty array
    //         return acc;
    //     }, {});

    //     console.log('Study Plans by ID:', studyPlansById);
    //     return studyPlansById;
    // };

    const fetchSupervisors = async () => {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        try {
            const response = await axios.get('/api/lecturers?role=supervisor', { headers });
            setSupervisors(response.data);
        } catch (error) {
            console.error('Error fetching supervisors:', error);
        }
    };

    // const fetchTasks = async () => {
    //     const token = localStorage.getItem('token');
    //     const headers = { Authorization: `Bearer ${token}` };
    //     try {
    //         const response = await axios.get('/api/tasks', { headers });
    //         setTasks(response.data);
    //     } catch (error) {
    //         console.error('Error fetching tasks:', error);
    //     }
    // };

    const fetchTasks = async () => {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        try {
            const taskResponse = await axios.get('/api/tasks', { headers });
            setTasks(taskResponse.data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    // const fetchNationalities = async () => {
    //     const token = localStorage.getItem('token');
    //     const headers = { Authorization: `Bearer ${token}` };

    //     try {
    //         const nationalityResponse = await axios.get('/api/students/nationalities', { headers });
    //         console.log(nationalityResponse.data);
    //         setNationalities(nationalityResponse.data); // { studentId: nationality }
    //     } catch (error) {
    //         console.error('Error fetching nationalities:', error);
    //     }
    // };

    const fetchSemesters = async () => {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
    
        try {
            const response = await axios.get('/api/semesters', { headers });
            setSemesters(response.data); // Save semesters to state
        } catch (error) {
            console.error('Error fetching semesters:', error);
        }
    };

    // Calculate the current semester based on the date
    const calculateCurrentSemester = (semesters) => {
        const today = new Date();
        const currentSemester = semesters.find(semester => {
            const startDate = new Date(semester.start_date);
            const endDate = new Date(semester.end_date);
            return today >= startDate && today <= endDate;
        });

        if (!currentSemester) return { semester: null, academic_year: null };
        return { semester: currentSemester.semester, academic_year: currentSemester.academic_year };
    };

    // Calculate a student's current semester based on intake and current semester
    const calculateStudentSemester = (intake, currentSemester) => {
        const { semester: currentSem, academic_year: currentYearRange } = currentSemester;
        const [currentYearStart] = currentYearRange.split('/').map(Number);

        const [intakeSem, intakeYearRange] = intake.split(', ');
        const [intakeYearStart] = intakeYearRange.split('/').map(Number);
        const intakeSemNumber = parseInt(intakeSem.split(' ')[1]);

        let semesterCount = (currentYearStart - intakeYearStart) * 2;

        if (currentSem === 2) {
            semesterCount += 1;
        }

        if (intakeSemNumber === 2) {
            semesterCount -= 1;
        }

        return semesterCount + 1;
    };

    // Fetch data on component mount
    useEffect(() => {
        fetchStudentsData();
        fetchSupervisors();
        fetchTasks();
        fetchSemesters();
    }, []);

    return (
        <StudentContext.Provider value={{ studentsData, setStudentsData, currentSemester, isLoading, fetchStudentsData, supervisors, fetchSupervisors, tasks, nationalities, semesters, fetchSemesters, fetchTasks }}>
            {children}
        </StudentContext.Provider>
    );
};