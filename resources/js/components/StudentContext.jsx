import React, { createContext, useState, useEffect, useContext } from 'react';
import { retrieveAndDecrypt } from "./storage";
import axios from 'axios';
import { useUser } from './UserContext';

export const StudentContext = createContext();

export const StudentProvider = ({ children }) => {
    const [studentsData, setStudentsData] = useState(null);
    const [supervisors, setSupervisors] = useState([]);
    const [currentSemester, setCurrentSemester] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [tasks, setTasks] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [nationalities, setNationalities] = useState({});
    const [programs, setPrograms] = useState([]);
    const [intakesByProgram, setIntakesByProgram] = useState({});
    const [tasksByIntake, setTasksByIntake] = useState({});
    const [intakesById, setIntakesById] = useState({});
    const { token } = useUser();

    const headers = { Authorization: `Bearer ${token}` };

    const fetchStudentsData = async () => {
        try {
            setIsLoading(true);

            // Fetch semester info
            const semesterResponse = await axios.get('/api/semesters', { headers });
            const semesters = semesterResponse.data;
            const currentSem = calculateCurrentSemester(semesters);
            setCurrentSemester(currentSem);

            // Fetch the current user's role
            const userResponse = await axios.get('/api/me', { headers });
            const user = userResponse.data;
            console.log('Logged-in User:', user);

            let students;

            if (user.role === 'student') {
                // Fetch details for the logged-in student
                //const studentResponse = await axios.get(`/api/students/${user.id}`, { headers });
                students = [user];

            } else {
                // Fetch students with details
                const studentResponse = await axios.get('/api/students?includeDetails=true', { headers });
                students = studentResponse.data;
            }

            const nationalitiesById = students.reduce((acc, student) => {
                acc[student.id] = student.nationality;
                return acc;
            }, {});
            setNationalities(nationalitiesById);

            // **5. Collect Unique Program IDs**
            // Collect Unique Program IDs, excluding null or undefined
            const programIds = [...new Set(
                students
                    .map(student => student.program_id)
                    .filter(programId => programId != null) // Exclude null and undefined values
            )];

            // **6. Fetch Intakes for Each Program**
            const intakePromises = programIds.map(programId =>
                axios
                    .get(`/api/programs/${programId}/intakes`, { headers })
                    .then(response => ({ programId, intakes: response.data }))
                    .catch(error => {
                        console.error(`Error fetching intakes for program ${programId}:`, error);
                        return { programId, intakes: [] }; // Return empty array on error
                    })
            );

            const intakeResults = await Promise.all(intakePromises);

            // **7. Combine All Intakes into One Array**
            const intakes = intakeResults.flatMap(result => result.intakes);

            // **8. Create a Mapping of intake_id to Intake Object**
            const intakesById = intakes.reduce((acc, intake) => {
                acc[intake.id] = intake;
                return acc;
            }, {});

            setIntakesById(intakesById);

            // **9. Attach Intake Details to Each Student**
            students.forEach(student => {
                const intake = intakesById[student.intake_id];

                if (intake) {
                    student.intake = intake; // Attach the full intake object to the student
                    student.intakeLabel = `Sem ${intake.intake_semester}, ${intake.intake_year}`;
                    student.currentSemester = calculateStudentSemester(intake, currentSem);
                } else {
                    student.intake = null;
                    student.intakeLabel = 'Unspecified';
                    student.currentSemester = null; // No intake, so no current semester
                }
            });

            // **10. Group Students by Intake Label**
            const groupedStudents = students.reduce((acc, student) => {
                const intakeLabel = student.intakeLabel;
                if (!acc[intakeLabel]) {
                    acc[intakeLabel] = [];
                }
                acc[intakeLabel].push(student);
                return acc;
            }, {});

            // **11. Sort Intakes in Descending Order**
            const sortedIntakes = Object.keys(groupedStudents).sort((a, b) => {
                if (a === 'Unspecified') return 1; // Place unspecified intakes at the end
                if (b === 'Unspecified') return -1;

                const [aSemLabel, aYearRange] = a.split(', ');
                const [bSemLabel, bYearRange] = b.split(', ');
                const aSemNumber = parseInt(aSemLabel.replace('Sem ', ''));
                const bSemNumber = parseInt(bSemLabel.replace('Sem ', ''));
                const [aYearStart] = aYearRange.split('/').map(Number);
                const [bYearStart] = bYearRange.split('/').map(Number);

                if (aYearStart === bYearStart) {
                    return bSemNumber - aSemNumber;
                }
                return bYearStart - aYearStart;
            });

            // **12. Prepare the Sorted Grouped Students Data**
            const sortedGroupedStudents = {};
            sortedIntakes.forEach(intake => {
                sortedGroupedStudents[intake] = groupedStudents[intake].sort((a, b) =>
                    `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`)
                );
            });

            // **13. Set the Students Data State**
            setStudentsData(sortedGroupedStudents);
            console.log('Students Data:', sortedGroupedStudents);

        } catch (error) {
            console.error('Failed to fetch students:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchPrograms = async () => {
        try {
            const response = await axios.get('/api/programs', { headers });
            setPrograms(response.data);
            console.log('Programs:', response.data);
        } catch (error) {
            console.error('Error fetching programs:', error);
        }
    };

    const fetchIntakes = async (programId) => {
        try {
            const response = await axios.get(`/api/programs/${programId}/intakes`, { headers });
            setIntakesByProgram((prevIntakes) => ({
                ...prevIntakes,
                [programId]: response.data,
            }));
            console.log(`Intakes for program ${programId}:`, response.data);
        } catch (error) {
            console.error(`Error fetching intakes for program ${programId}:`, error);
        }
    };

    const fetchTasks = async (intakeId) => {
        try {
            const response = await axios.get(`/api/tasks/intake/${intakeId}`, { headers });
            setTasksByIntake((prevTasks) => ({
                ...prevTasks,
                [intakeId]: response.data,
            }));
            console.log(`Tasks for intake ${intakeId}:`, response.data);
        } catch (error) {
            console.error(`Error fetching tasks for intake ${intakeId}:`, error);
        }
    };

    const fetchSupervisors = async () => {
        try {
            const response = await axios.get('/api/lecturers?role=supervisor', { headers });
            setSupervisors(response.data);
        } catch (error) {
            console.error('Error fetching supervisors:', error);
        }
    };

    const fetchAllTasks = async () => {
        try {
            const taskResponse = await axios.get('/api/tasks', { headers });
            setTasks(taskResponse.data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    const fetchSemesters = async () => {
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
        if (!intake) return null;

        const { intake_semester: intakeSem, intake_year: intakeYearRange } = intake;
        const { semester: currentSem, academic_year: currentYearRange } = currentSemester;

        const [currentYearStart] = currentYearRange.split('/').map(Number);
        const [intakeYearStart] = intakeYearRange.split('/').map(Number);

        let semesterCount = (currentYearStart - intakeYearStart) * 2;

        if (currentSem === 2) {
            semesterCount += 1;
        }

        if (intakeSem === 2) {
            semesterCount -= 1;
        }

        return semesterCount + 1;
    };

    // Fetch data on component mount
    useEffect(() => {
        if (!token) {
            console.warn('Token is missing. StudentContext not initialized.');
            return;
        }
        fetchStudentsData();
        fetchSupervisors();
        fetchSemesters();
        fetchPrograms();
        fetchAllTasks();
    }, [token]);

    return (
        <StudentContext.Provider
            value={{
                studentsData,
                setStudentsData,
                currentSemester,
                isLoading,
                fetchStudentsData,
                supervisors,
                fetchSupervisors,
                programs,
                fetchPrograms,
                intakesByProgram,
                fetchIntakes,
                tasksByIntake,
                fetchTasks,
                nationalities,
                semesters,
                fetchSemesters,
                fetchAllTasks,
                tasks,
                intakesById,
            }}>
            {children}
        </StudentContext.Provider>
    );
};