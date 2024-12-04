// import React, { useEffect, useRef } from "react";
// import * as d3 from "d3";
// import styles from "./ProgressFlowchart.module.css";

// const ProgressFlowchart = ({ studyPlan, intake, semesters }) => {
//     // Helper function to calculate semester dates
//     const getSemesterDates = (semesterNumber) => {
//         if (!intake || !semesters) return null;

//         const [intakeSemester, intakeYearRange] = intake.split(", ");
//         const [intakeYearStart] = intakeYearRange.split("/").map(Number);
//         const intakeSemesterNumber = parseInt(intakeSemester.split(" ")[1]);

//         const totalSemestersPassed = semesterNumber - 1 + (intakeSemesterNumber - 1);
//         const yearOffset = Math.floor(totalSemestersPassed / 2);
//         const academicYearStart = intakeYearStart + yearOffset;
//         const semesterType = totalSemestersPassed % 2 === 0 ? 1 : 2;

//         const matchingSemester = semesters.find(
//             (sem) =>
//                 sem.academic_year === `${academicYearStart}/${academicYearStart + 1}` &&
//                 sem.semester === semesterType
//         );

//         const formatDate = (dateStr) => {
//             const date = new Date(dateStr);
//             return new Intl.DateTimeFormat("en-GB", {
//                 day: "numeric",
//                 month: "short",
//                 year: "numeric",
//             }).format(date);
//         };

//         return matchingSemester
//             ? {
//                 start_date: new Date(matchingSemester.start_date),
//                 end_date: new Date(matchingSemester.end_date),
//                 formatted: `${formatDate(matchingSemester.start_date)} - ${formatDate(matchingSemester.end_date)}`,
//             }
//             : null;
//     };

//     const filterUpdatesForSemester = (updates, semesterDates) => {
//         if (!semesterDates) return updates;

//         return updates.filter((update) => {
//             const completionDate = update.completion_date ? new Date(update.completion_date) : null;
//             return (
//                 completionDate &&
//                 completionDate >= semesterDates.start_date &&
//                 completionDate <= semesterDates.end_date
//             );
//         });
//     };

//     const chartRef = useRef(null);

//     useEffect(() => {
//         if (studyPlan) {
//             generateFlowchart(studyPlan);
//         }
//     }, [studyPlan]);

//     const generateFlowchart = (studyPlan) => {
//         const svg = d3.select(chartRef.current);
//         svg.selectAll("*").remove(); // Clear previous chart
//         // Example D3 logic
//     };

//     return (
//         <div className={styles.flowchartWrapper}>
//             <div className={styles.flowchartContainer}>
//                 {studyPlan.map((semesterData, index) => {
//                     const semesterDates = getSemesterDates(semesterData.semester);

//                     return (
//                         <div className={styles.semesterCard} key={index}>
//                             <h3 className={styles.semesterTitle}>
//                                 Semester {semesterData.semester}
//                                 <span className={styles.semesterDate}> [{semesterDates?.formatted || "Dates unavailable"}]
//                                 </span>
//                             </h3>
//                             <div>
//                                 {Array.isArray(semesterData.tasks)
//                                     ? semesterData.tasks.map((taskData, taskIndex) => {
//                                         const updatesToDisplay =
//                                             semesterData.tasks.filter((t) => t.name === taskData.name).length > 1
//                                                 ? filterUpdatesForSemester(taskData.progress_updates, semesterDates)
//                                                 : taskData.progress_updates;

//                                         return (
//                                             <div
//                                                 className={`${styles.taskItem} ${styles[taskData.status]}`}
//                                                 key={taskIndex}
//                                             >
//                                                 <div className={styles.dot}></div>
//                                                 <div>
//                                                     <p>{taskData.name}</p>
//                                                     {updatesToDisplay && updatesToDisplay.length > 0 ? (
//                                                         updatesToDisplay.map((update, updateIndex) => (
//                                                             <div
//                                                                 key={updateIndex}
//                                                                 className={styles.updateContainer}
//                                                             >
//                                                                 <span className={styles.status}>
//                                                                     {update.status || ""}
//                                                                 </span>
//                                                                 {update.course_name_1 && (
//                                                                     <div className={styles.courseGrade}>
//                                                                         <span>1. {update.course_name_1}</span>
//                                                                         <span> ({update.grade_1 || ""})</span>
//                                                                     </div>
//                                                                 )}
//                                                                 {update.course_name_2 && (
//                                                                     <div className={styles.courseGrade}>
//                                                                         <span>2. {update.course_name_2}</span>
//                                                                         <span> ({update.grade_2 || ""})</span>
//                                                                     </div>
//                                                                 )}
//                                                                 {update.course_name_3 && (
//                                                                     <div className={styles.courseGrade}>
//                                                                         <span>3. {update.course_name_3}</span>
//                                                                         <span> ({update.grade_3 || ""})</span>
//                                                                     </div>
//                                                                 )}
//                                                                 {update.course_name_4 && (
//                                                                     <div className={styles.courseGrade}>
//                                                                         <span>4. {update.course_name_4}</span>
//                                                                         <span> ({update.grade_4 || ""})</span>
//                                                                     </div>
//                                                                 )}
//                                                                 {update.course_name_5 && (
//                                                                     <div className={styles.courseGrade}>
//                                                                         <span>5. {update.course_name_5}</span>
//                                                                         <span> ({update.grade_5 || ""})</span>
//                                                                     </div>
//                                                                 )}
//                                                                 {update.progress_status && (
//                                                                     <div className={styles.progressStatus}>
//                                                                         Progress Status: {update.progress_status || ""}
//                                                                     </div>
//                                                                 )}
//                                                                 {update.grade && (
//                                                                     <div className={styles.finalGrade}>
//                                                                         Grade: {update.grade || ""}
//                                                                     </div>
//                                                                 )}
//                                                                 {update.description && (
//                                                                     <div className={styles.description}>
//                                                                         {update.description}
//                                                                     </div>
//                                                                 )}
//                                                                 {update.cgpa && (
//                                                                     <div className={styles.cgpa}>
//                                                                         CGPA: {update.cgpa}
//                                                                     </div>
//                                                                 )}
//                                                                 {update.update_type === "residential_requirement" && (
//                                                                     <div className={styles.residentialRequirement}>
//                                                                         <p>College: {update.residential_college || "N/A"}</p>
//                                                                         <p>
//                                                                             From{" "}
//                                                                             {update.start_date
//                                                                                 ? new Date(update.start_date).toLocaleDateString("en-US", {
//                                                                                     year: "numeric",
//                                                                                     month: "short",
//                                                                                     day: "numeric",
//                                                                                 })
//                                                                                 : "N/A"}{" "}
//                                                                             to{" "}
//                                                                             {update.end_date
//                                                                                 ? new Date(update.end_date).toLocaleDateString("en-US", {
//                                                                                     year: "numeric",
//                                                                                     month: "short",
//                                                                                     day: "numeric",
//                                                                                 })
//                                                                                 : "N/A"}
//                                                                         </p>
//                                                                     </div>
//                                                                 )}
//                                                                 {update.update_type === 'appointment_supervisor_form' && (
//                                                                     <div className={styles.supervisorDetails}>
//                                                                         {update.supervisor_name && (
//                                                                             <div>
//                                                                                 <strong>Supervisor Name:</strong> {update.supervisor_name}
//                                                                             </div>
//                                                                         )}
//                                                                         {update.research_topic && (
//                                                                             <div>
//                                                                                 <strong>Research Topic:</strong> {update.research_topic}
//                                                                             </div>
//                                                                         )}
//                                                                     </div>
//                                                                 )}
//                                                                 {update.evidence && (
//                                                                     <div>
//                                                                         <a
//                                                                             href={`/storage/evidence/${update.evidence.split(
//                                                                                 "/"
//                                                                             ).pop()}`}
//                                                                             target="_blank"
//                                                                             rel="noopener noreferrer"
//                                                                         >
//                                                                             Evidence File
//                                                                         </a>
//                                                                     </div>
//                                                                 )}
//                                                                 {update.link && (
//                                                                     <div>
//                                                                         <a
//                                                                             href={update.link}
//                                                                             target="_blank"
//                                                                             rel="noopener noreferrer"
//                                                                         >
//                                                                             External Link
//                                                                         </a>
//                                                                     </div>
//                                                                 )}
//                                                                 <div className={styles.admin}>
//                                                                     Updated by{" "}
//                                                                     {update.admin_name || "Admin"} on{" "}
//                                                                     {update.updated_at
//                                                                         ? new Date(
//                                                                             update.updated_at
//                                                                         ).toLocaleDateString("en-US", {
//                                                                             year: "numeric",
//                                                                             month: "short",
//                                                                             day: "numeric",
//                                                                         })
//                                                                         : "N/A"}
//                                                                 </div>
//                                                             </div>
//                                                         ))
//                                                     ) : (
//                                                         <span className={styles.status}></span>
//                                                     )}
//                                                 </div>
//                                             </div>
//                                         );
//                                     })
//                                     : typeof semesterData.tasks === "object"
//                                         ? Object.values(semesterData.tasks).map((taskData, taskIndex) => (
//                                             <div
//                                                 className={`${styles.taskItem} ${styles[taskData.status]}`}
//                                                 key={taskIndex}
//                                             >
//                                                 <div className={styles.dot}></div>
//                                                 <div>
//                                                     <p>{taskData.name}</p>
//                                                     {taskData.progress_updates &&
//                                                         taskData.progress_updates.length > 0 ? (
//                                                         taskData.progress_updates.map((update, updateIndex) => (
//                                                             <div
//                                                                 key={updateIndex}
//                                                                 className={styles.updateContainer}
//                                                             >
//                                                                 <span className={styles.status}>
//                                                                     {update.status || ""}
//                                                                 </span>
//                                                                 {update.course_name_1 && (
//                                                                     <div className={styles.courseGrade}>
//                                                                         <span>1. {update.course_name_1}</span>
//                                                                         <span> ({update.grade_1 || ""})</span>
//                                                                     </div>
//                                                                 )}
//                                                                 {update.course_name_2 && (
//                                                                     <div className={styles.courseGrade}>
//                                                                         <span>2. {update.course_name_2}</span>
//                                                                         <span> ({update.grade_2 || ""})</span>
//                                                                     </div>
//                                                                 )}
//                                                                 {update.course_name_3 && (
//                                                                     <div className={styles.courseGrade}>
//                                                                         <span>3. {update.course_name_3}</span>
//                                                                         <span> ({update.grade_3 || ""})</span>
//                                                                     </div>
//                                                                 )}
//                                                                 {update.course_name_4 && (
//                                                                     <div className={styles.courseGrade}>
//                                                                         <span>4. {update.course_name_4}</span>
//                                                                         <span> ({update.grade_4 || ""})</span>
//                                                                     </div>
//                                                                 )}
//                                                                 {update.course_name_5 && (
//                                                                     <div className={styles.courseGrade}>
//                                                                         <span>5. {update.course_name_5}</span>
//                                                                         <span> ({update.grade_5 || ""})</span>
//                                                                     </div>
//                                                                 )}
//                                                                 {update.progress_status && (
//                                                                     <div className={styles.progressStatus}>
//                                                                         Progress Status: {update.progress_status || ""}
//                                                                     </div>
//                                                                 )}
//                                                                 {update.grade && (
//                                                                     <div className={styles.finalGrade}>
//                                                                         Grade: {update.grade || ""}
//                                                                     </div>
//                                                                 )}
//                                                                 {update.description && (
//                                                                     <div className={styles.description}>
//                                                                         {update.description}
//                                                                     </div>
//                                                                 )}
//                                                                 {update.cgpa && <div>CGPA: {update.cgpa}</div>}
//                                                                 {update.update_type === "residential_requirement" && (
//                                                                     <div className={styles.residentialRequirement}>
//                                                                         <p>College: {update.residential_college || "N/A"}</p>
//                                                                         <p>
//                                                                             From{" "}
//                                                                             {update.start_date
//                                                                                 ? new Date(update.start_date).toLocaleDateString("en-US", {
//                                                                                     year: "numeric",
//                                                                                     month: "short",
//                                                                                     day: "numeric",
//                                                                                 })
//                                                                                 : "N/A"}{" "}
//                                                                             to{" "}
//                                                                             {update.end_date
//                                                                                 ? new Date(update.end_date).toLocaleDateString("en-US", {
//                                                                                     year: "numeric",
//                                                                                     month: "short",
//                                                                                     day: "numeric",
//                                                                                 })
//                                                                                 : "N/A"}
//                                                                         </p>
//                                                                     </div>
//                                                                 )}
//                                                                 {update.update_type === 'appointment_supervisor_form' && (
//                                                                     <div className={styles.supervisorDetails}>
//                                                                         {update.supervisor_name && (
//                                                                             <div>
//                                                                                 <strong>Supervisor Name:</strong> {update.supervisor_name}
//                                                                             </div>
//                                                                         )}
//                                                                         {update.research_topic && (
//                                                                             <div>
//                                                                                 <strong>Research Topic:</strong> {update.research_topic}
//                                                                             </div>
//                                                                         )}
//                                                                     </div>
//                                                                 )}
//                                                                 {update.evidence && (
//                                                                     <div>
//                                                                         <a href={`/storage/evidence/${update.evidence.split('/').pop()}`} target="_blank" rel="noopener noreferrer">
//                                                                             Evidence File
//                                                                         </a>
//                                                                     </div>
//                                                                 )}
//                                                                 {update.link && (
//                                                                     <div>
//                                                                         <a href={update.link} target="_blank" rel="noopener noreferrer">
//                                                                             External Link
//                                                                         </a>
//                                                                     </div>
//                                                                 )}
//                                                                 <div className={styles.admin}>
//                                                                     Updated by {update.admin_name || "Admin"} on {update.updated_at ? new Date(update.updated_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "N/A"}
//                                                                 </div>

//                                                             </div>
//                                                         ))

//                                                     ) : (
//                                                         <span className={styles.status}></span>
//                                                     )}
//                                                 </div>
//                                             </div>
//                                         ))
//                                         : null}
//                             </div>
//                             {index < studyPlan.length && <div className={styles.line}></div>}
//                         </div>
//                     );
//                 })}
//             </div>
//             <div className={styles.legend}>
//                 <h4 className={styles.legendTitle}>LEGEND</h4>
//                 <div className={styles.legendItem}>
//                     <div className={`${styles.legendDot} ${styles.pending}`}></div>
//                     <span>Pending Task (On Track)</span>
//                 </div>
//                 <div className={styles.legendItem}>
//                     <div className={`${styles.legendDot} ${styles.pendingDelayed}`}></div>
//                     <span>Pending Task (Delayed)</span>
//                 </div>
//                 <div className={styles.legendItem}>
//                     <div className={`${styles.legendDot} ${styles.completed}`}></div>
//                     <span>Completed Task</span>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default ProgressFlowchart;
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import styles from "./ProgressFlowchart.module.css"; // Import the CSS file

const ProgressFlowchart = ({ studyPlan, intake, semesters }) => {
    // Helper function to calculate semester dates
    const getSemesterDates = (semesterNumber) => {
        if (!intake || !semesters) return null;

        // Extract intake semester and academic year
        const [intakeSemester, intakeYearRange] = intake.split(', ');
        const [intakeYearStart] = intakeYearRange.split('/').map(Number);
        const intakeSemesterNumber = parseInt(intakeSemester.split(' ')[1]); // 1 for Sem 1, 2 for Sem 2

        // Calculate the total semesters passed from the intake semester
        const totalSemestersPassed = (semesterNumber - 1) + (intakeSemesterNumber - 1);

        // Calculate the academic year offset
        const yearOffset = Math.floor(totalSemestersPassed / 2); // Every 2 semesters = 1 year
        const academicYearStart = intakeYearStart + yearOffset;

        // Determine if the semester is odd or even
        const semesterType = totalSemestersPassed % 2 === 0 ? 1 : 2; // 1 for odd semesters, 2 for even

        // Find the matching semester in the database
        const matchingSemester = semesters.find(sem =>
            sem.academic_year === `${academicYearStart}/${academicYearStart + 1}` &&
            sem.semester === semesterType
        );

        // If no matching semester is found, return null
        if (!matchingSemester) {
            // console.error(
            //     `No matching semester found for Semester ${semesterNumber}. Academic Year: ${academicYearStart}/${academicYearStart + 1}, Semester Type: ${semesterType}`
            // );
            return null;
        }

        // Format the dates
        const formatDate = (dateStr) => {
            const date = new Date(dateStr);
            return new Intl.DateTimeFormat('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            }).format(date);
        };

        // Return an object with formatted dates and raw start/end dates
        return {
            start_date: matchingSemester.start_date,
            end_date: matchingSemester.end_date,
            formatted: `${formatDate(matchingSemester.start_date)} - ${formatDate(matchingSemester.end_date)}`,
        };
    };

    const chartRef = useRef(null);

    useEffect(() => {
        if (studyPlan) {
            //console.log(studyPlan); // Inspect the structure of studyPlan
            generateFlowchart(studyPlan);
        }
    }, [studyPlan]);

    const generateFlowchart = (studyPlan) => {
        const svg = d3.select(chartRef.current);
        svg.selectAll("*").remove(); // Clear previous chart

        // Example D3 logic, but we'll focus on rendering the tasks below in the return section
    };

    const formatCreatedAtDate = (date) => {
        if (!date) return "Date unavailable";

        // Replace space with 'T' to make it ISO 8601 compatible if needed
        const isoDate = date.replace(" ", "T");

        const formattedDate = new Date(isoDate);

        if (isNaN(formattedDate.getTime())) {
            return "Invalid date"; // Fallback if parsing fails
        }

        return new Intl.DateTimeFormat("en-GB", {
            year: "numeric", month: "short", day: "numeric"
        }).format(formattedDate);
    };

    const currentDate = new Date(); // Get the current date

    // const determineStatus = (taskData, semesterEndDate) => {
    //     const currentDate = new Date();

    //     // Handle undefined or invalid semesterEndDate
    //     if (!semesterEndDate || isNaN(new Date(semesterEndDate))) {
    //         console.warn("Semester end date is unavailable; defaulting to onTrackPending.");
    //         return 'onTrackPending';
    //     }

    //     const semesterEnd = new Date(semesterEndDate);

    //     if (!taskData || !taskData.progress_updates) {
    //         return currentDate <= semesterEnd ? 'onTrackPending' : 'delayedPending';
    //     }

    //     // Get the most recent update
    //     const latestUpdate = taskData.progress_updates
    //         .map(update => ({ ...update, completion_date: new Date(update.completion_date) }))
    //         .filter(update => !isNaN(update.completion_date)) // Keep only valid dates
    //         .sort((a, b) => b.completion_date - a.completion_date)[0]; // Most recent update

    //     const progressStatus = latestUpdate?.progress_status || null;
    //     const completionDate = latestUpdate?.completion_date || null;

    //     // For special tasks, check progress status explicitly
    //     if (progressStatus === "Pending" || progressStatus === "In Progress") {
    //         return currentDate <= semesterEnd ? 'onTrackPending' : 'delayedPending';
    //     }

    //     // For all tasks, check completion date
    //     if (completionDate) {
    //         return completionDate <= semesterEnd ? 'onTrackCompleted' : 'delayedCompleted';
    //     }

    //     // Default: pending
    //     return currentDate <= semesterEnd ? 'onTrackPending' : 'delayedPending';
    // };

    const determineStatus = (taskData, lastSemesterEndDates) => {
        const currentDate = new Date();
    
        // Get the last semester's end date for the task
        const semesterEndDate = lastSemesterEndDates[taskData.name];
        if (!semesterEndDate || isNaN(new Date(semesterEndDate))) {
            //console.warn(`Semester end date unavailable for task "${taskData.name}"; defaulting to onTrackPending.`);
            return 'onTrackPending';
        }
    
        const semesterEnd = new Date(semesterEndDate);
    
        if (!taskData || !taskData.progress_updates) {
            return currentDate <= semesterEnd ? 'onTrackPending' : 'delayedPending';
        }
    
        // Get the most recent update
        const latestUpdate = taskData.progress_updates
            .map(update => ({ ...update, updated_at: new Date(update.updated_at) }))
            .filter(update => !isNaN(update.updated_at)) // Keep only valid dates
            .sort((a, b) => b.updated_at - a.updated_at)[0]; // Most recent update

        //console.log("Latest Update:", latestUpdate);
    
        const progressStatus = latestUpdate?.progress_status || null;
        const completionDate = latestUpdate?.completion_date || null;
        // console.log("Completion Date:", completionDate);
        // console.log("Semester End Date:", semesterEnd);
        // console.log("Completion Date Object:", new Date(completionDate));
    
        // For special tasks, check progress status explicitly
        if (progressStatus === "Pending" || progressStatus === "In Progress") {
            return currentDate <= semesterEnd ? 'onTrackPending' : 'delayedPending';
        }
    
        // For all tasks, check completion date
        if (completionDate) {
            const completionDateObj = new Date(completionDate);
            if (isNaN(completionDateObj)) {
                console.log("Invalid completion date:", completionDate);
                return currentDate <= semesterEnd ? 'onTrackPending' : 'delayedPending';
            }
        
            return completionDateObj <= semesterEnd ? 'onTrackCompleted' : 'delayedCompleted';
        }
    
        // Default: pending
        return currentDate <= semesterEnd ? 'onTrackPending' : 'delayedPending';
    };

    const getLastSemesterEndDates = (studyPlan, semesterData) => {
        const taskEndDates = {};
    
        studyPlan.forEach((sem) => {
            const semesterNumber = sem.semester;
            const semesterEndDate = getSemesterDates(semesterNumber)?.end_date;
    
            Object.values(sem.tasks).forEach((task) => {
                if (semesterEndDate) {
                    // Update task end date if this semester is later
                    if (!taskEndDates[task.name] || new Date(taskEndDates[task.name]) < new Date(semesterEndDate)) {
                        taskEndDates[task.name] = semesterEndDate;
                    }
                }
            });
        });
    
        return taskEndDates;
    };

    // const getMostRecentCompletionDate = (progressUpdates) => {
    //     if (!Array.isArray(progressUpdates) || progressUpdates.length === 0) {
    //         return null; // No progress updates
    //     }

    //     // Extract the most recent `completion_date`
    //     return progressUpdates
    //         .map(update => new Date(update.completion_date)) // Convert to Date objects
    //         .filter(date => !isNaN(date)) // Keep only valid dates
    //         .reduce((latest, date) => (date > latest ? date : latest), new Date(0)) // Find the most recent date
    //         .toISOString()
    //         .split('T')[0]; // Convert back to ISO string in YYYY-MM-DD format
    // };

    return (
        <div className={styles.flowchartWrapper}>
            <div className={styles.flowchartContainer}>
                {studyPlan.map((semesterData, index) => (
                    <div className={styles.semesterCard} key={index}>
                        <h3 className={styles.semesterTitle}>
                            Semester {semesterData.semester}
                            <span className={styles.semesterDate}> [{getSemesterDates(semesterData.semester)?.formatted || 'Dates unavailable'}]</span>
                        </h3>
                        <div>
                            {semesterData.semester === 1 && (
                                <div className={`${styles.taskItem} ${styles.created}`}>
                                    <div className={styles.dot}></div>
                                    <div>
                                        <p className={styles.onTrackCompleted}>Student Record Created</p>
                                        <div className={styles.recordDate}>
                                            [{formatCreatedAtDate(semesterData.created_at)}]
                                        </div>
                                    </div>
                                </div>
                            )}
                            {Array.isArray(semesterData.tasks) ? (
                                semesterData.tasks.map((taskData, taskIndex) => {
                                    const semesterEndDate = getSemesterDates(semesterData.semester)?.end_date; // Extract semester end date

                                    taskData.progress_updates = taskData.progress_updates || []; // Ensure it exists

                                    const lastSemesterEndDates = getLastSemesterEndDates(studyPlan, semesterData);
                                    // Determine the status with the updated logic
                                    const status = determineStatus(taskData, lastSemesterEndDates);
                                    //console.log(`Task "${taskData.name}" status:`, status);

                                    // console.log("Task Data:", taskData);
                                    // console.log("Semester End Date:", semesterEndDate);
                                    //console.log("Status:", status);

                                    return (
                                        <div
                                            className={`${styles.taskItem} ${styles[status]}`}
                                            key={taskIndex}
                                        >
                                            <div className={styles.dot}></div>
                                            <div>
                                                <p>
                                                    {(() => {
                                                        // Check the task name and update type
                                                        if (
                                                            ["Core Courses", "Elective Courses", "Research Methodology Course"].includes(
                                                                taskData.name
                                                            )
                                                        ) {
                                                            const updateTypeToCredits = {
                                                                "core_courses": 3, // 1 course = 3 credits
                                                                "elective_courses": 3,
                                                                "research_methodology_course": 3,
                                                            };

                                                            // Calculate credits for courses
                                                            if (taskData.progress_updates && taskData.progress_updates.length > 0) {
                                                                const uniqueCourses = new Set();

                                                                // Collect unique courses for tasks with multiple courses
                                                                taskData.progress_updates.forEach((update) => {
                                                                    if (update.course_name_1) uniqueCourses.add(update.course_name_1);
                                                                    if (update.course_name_2) uniqueCourses.add(update.course_name_2);
                                                                    if (update.course_name_3) uniqueCourses.add(update.course_name_3);
                                                                    if (update.course_name_4) uniqueCourses.add(update.course_name_4);
                                                                    if (update.course_name_5) uniqueCourses.add(update.course_name_5);
                                                                });

                                                                const courseCount =
                                                                    taskData.name === "Research Methodology Course"
                                                                        ? 1 // Fixed 1 course
                                                                        : uniqueCourses.size;

                                                                const credits = courseCount * updateTypeToCredits[taskData.name.toLowerCase().replace(/ /g, "_")];

                                                                return `${taskData.name} - ${credits} credits`;
                                                            }

                                                            // No updates, just show the task name
                                                            return taskData.name;
                                                        }

                                                        // Default for non-course-related tasks
                                                        return taskData.name;
                                                    })()}
                                                </p>

                                                {taskData.progress_updates && taskData.progress_updates.length > 0 ? (
                                                    taskData.progress_updates.map((update, updateIndex) => {
                                                        return (
                                                            <div key={updateIndex} className={styles.updateContainer}>
                                                                <span className={styles.status}>
                                                                    {update.status || ""}
                                                                </span>
                                                                {update.course_name_1 && (
                                                                    <div className={styles.courseGrade}>
                                                                        <span>1. {update.course_name_1}</span>
                                                                        <span> ({update.grade_1 || ""})</span>
                                                                    </div>
                                                                )}
                                                                {update.course_name_2 && (
                                                                    <div className={styles.courseGrade}>
                                                                        <span>2. {update.course_name_2}</span>
                                                                        <span> ({update.grade_2 || ""})</span>
                                                                    </div>
                                                                )}
                                                                {update.course_name_3 && (
                                                                    <div className={styles.courseGrade}>
                                                                        <span>3. {update.course_name_3}</span>
                                                                        <span> ({update.grade_3 || ""})</span>
                                                                    </div>
                                                                )}
                                                                {update.course_name_4 && (
                                                                    <div className={styles.courseGrade}>
                                                                        <span>4. {update.course_name_4}</span>
                                                                        <span> ({update.grade_4 || ""})</span>
                                                                    </div>
                                                                )}
                                                                {update.course_name_5 && (
                                                                    <div className={styles.courseGrade}>
                                                                        <span>5. {update.course_name_5}</span>
                                                                        <span> ({update.grade_5 || ""})</span>
                                                                    </div>
                                                                )}
                                                                {update.progress_status && (
                                                                    <div className={styles.progressStatus}>
                                                                        Progress Status: {update.progress_status || ""}
                                                                    </div>
                                                                )}
                                                                {update.grade && (
                                                                    <div className={styles.finalGrade}>
                                                                        Grade: {update.grade || ""}
                                                                    </div>
                                                                )}
                                                                <div className={styles.description}>
                                                                    {update.description || ""}
                                                                </div>
                                                                {update.cgpa && <div className={styles.cgpa}>CGPA: {update.cgpa}</div>}
                                                                {update.update_type === "residential_requirement" && (
                                                                    <div className={styles.residentialRequirement}>
                                                                        <p>College: {update.residential_college || "N/A"}</p>
                                                                        <p>
                                                                            From{" "}
                                                                            {update.start_date
                                                                                ? new Date(update.start_date).toLocaleDateString("en-US", {
                                                                                    year: "numeric",
                                                                                    month: "short",
                                                                                    day: "numeric",
                                                                                })
                                                                                : "N/A"}{" "}
                                                                            to{" "}
                                                                            {update.end_date
                                                                                ? new Date(update.end_date).toLocaleDateString("en-US", {
                                                                                    year: "numeric",
                                                                                    month: "short",
                                                                                    day: "numeric",
                                                                                })
                                                                                : "N/A"}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                                {update.update_type === 'appointment_supervisor_form' && (
                                                                    <div className={styles.supervisorDetails}>
                                                                        {update.supervisor_name && (
                                                                            <div>
                                                                                <strong>Supervisor Name:</strong> {update.supervisor_name}
                                                                            </div>
                                                                        )}
                                                                        {update.research_topic && (
                                                                            <div>
                                                                                <strong>Research Topic:</strong> {update.research_topic}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                                {update.evidence && (
                                                                    <div>
                                                                        <a href={`/storage/evidence/${update.evidence.split('/').pop()}`} target="_blank" rel="noopener noreferrer">
                                                                            Evidence File
                                                                        </a>
                                                                    </div>
                                                                )}
                                                                {update.link && (
                                                                    <div>
                                                                        <a href={update.link} target="_blank" rel="noopener noreferrer">
                                                                            External Link
                                                                        </a>
                                                                    </div>
                                                                )}
                                                                <div className={styles.admin}>
                                                                    Updated by {update.admin_name || "Admin"} [{update.updated_at ? new Date(update.updated_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "N/A"}]
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    <span className={styles.status}></span> // Empty if no progress updates
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : typeof semesterData.tasks === 'object' ? (
                                Object.values(semesterData.tasks).map((taskData, taskIndex) => {
                                    const semesterEndDate = getSemesterDates(semesterData.semester)?.end_date; // Extract semester end date

                                    taskData.progress_updates = taskData.progress_updates || []; // Ensure it exists

                                    const lastSemesterEndDates = getLastSemesterEndDates(studyPlan, semesterData);
                                    // Determine the status with the updated logic
                                    const status = determineStatus(taskData, lastSemesterEndDates);
                                    //console.log(`Task "${taskData.name}" status:`, status);

                                    // console.log("Task Data:", taskData);
                                    // console.log("Semester End Date:", semesterEndDate);
                                    //console.log("Status:", status);

                                    return (
                                        <div
                                            className={`${styles.taskItem} ${styles[status]}`}
                                            key={taskIndex}
                                        >
                                            <div className={styles.dot}></div>
                                            <div>
                                                <p>
                                                    {(() => {
                                                        // Check the task name and update type
                                                        if (
                                                            ["Core Courses", "Elective Courses", "Research Methodology Course"].includes(
                                                                taskData.name
                                                            )
                                                        ) {
                                                            const updateTypeToCredits = {
                                                                "core_courses": 3, // 1 course = 3 credits
                                                                "elective_courses": 3,
                                                                "research_methodology_course": 3,
                                                            };

                                                            // Calculate credits for courses
                                                            if (taskData.progress_updates && taskData.progress_updates.length > 0) {
                                                                const uniqueCourses = new Set();

                                                                // Collect unique courses for tasks with multiple courses
                                                                taskData.progress_updates.forEach((update) => {
                                                                    if (update.course_name_1) uniqueCourses.add(update.course_name_1);
                                                                    if (update.course_name_2) uniqueCourses.add(update.course_name_2);
                                                                    if (update.course_name_3) uniqueCourses.add(update.course_name_3);
                                                                    if (update.course_name_4) uniqueCourses.add(update.course_name_4);
                                                                    if (update.course_name_5) uniqueCourses.add(update.course_name_5);
                                                                });

                                                                const courseCount =
                                                                    taskData.name === "Research Methodology Course"
                                                                        ? 1 // Fixed 1 course
                                                                        : uniqueCourses.size;

                                                                const credits = courseCount * updateTypeToCredits[taskData.name.toLowerCase().replace(/ /g, "_")];

                                                                return `${taskData.name} - ${credits} credits`;
                                                            }

                                                            // No updates, just show the task name
                                                            return taskData.name;
                                                        }

                                                        // Default for non-course-related tasks
                                                        return taskData.name;
                                                    })()}
                                                </p>

                                                {taskData.progress_updates && taskData.progress_updates.length > 0 ? (
                                                    taskData.progress_updates.map((update, updateIndex) => (
                                                        <div key={updateIndex} className={styles.updateContainer}>

                                                            <span className={styles.status}>
                                                                {update.status || ""}
                                                            </span>
                                                            {/* <div className={styles.date}>
                                                            {update.completion_date ? new Date(update.completion_date).toLocaleDateString() : ""}
                                                        </div>                             */}
                                                            {/* Display Course Names and Grades if available */}
                                                            <div className={styles.taskGroup}>
                                                                {update.course_name_1 && (
                                                                    <div className={styles.courseGrade}>
                                                                        <span>1. {update.course_name_1}&nbsp;</span>
                                                                        <span> <strong>({update.grade_1 || ""})</strong></span>
                                                                    </div>
                                                                )}
                                                                {update.course_name_2 && (
                                                                    <div className={styles.courseGrade}>
                                                                        <span>2. {update.course_name_2}&nbsp;</span>
                                                                        <span> <strong>({update.grade_2 || ""})</strong></span>
                                                                    </div>
                                                                )}
                                                                {update.course_name_3 && (
                                                                    <div className={styles.courseGrade}>
                                                                        <span>3. {update.course_name_3}&nbsp;</span>
                                                                        <span> <strong>({update.grade_3 || ""})</strong></span>
                                                                    </div>
                                                                )}
                                                                {update.course_name_4 && (
                                                                    <div className={styles.courseGrade}>
                                                                        <span>4. {update.course_name_4}&nbsp;</span>
                                                                        <span> <strong>({update.grade_4 || ""})</strong></span>
                                                                    </div>
                                                                )}
                                                                {update.course_name_5 && (
                                                                    <div className={styles.courseGrade}>
                                                                        <span>5. {update.course_name_5}&nbsp;</span>
                                                                        <span> <strong>({update.grade_5 || ""})</strong></span>
                                                                    </div>
                                                                )}
                                                                {update.progress_status && (
                                                                    <div className={styles.progressStatus}>
                                                                        <strong>{update.progress_status || ""}</strong>
                                                                    </div>
                                                                )}
                                                                {update.grade && (
                                                                    <div className={styles.finalGrade}>
                                                                        Grade: {update.grade || ""}
                                                                    </div>
                                                                )}
                                                                <div className={styles.description}>
                                                                    {update.description || ""}
                                                                </div>
                                                                {update.cgpa && <div className={styles.cgpa}>CGPA: {update.cgpa}</div>}
                                                                {update.update_type === "residential_requirement" && (
                                                                    <div className={styles.residentialRequirement}>
                                                                        <p>College: {update.residential_college || "N/A"}</p>
                                                                        <p>
                                                                            Period:{" "}
                                                                            {update.start_date
                                                                                ? new Date(update.start_date).toLocaleDateString("en-GB", {
                                                                                    year: "numeric",
                                                                                    month: "short",
                                                                                    day: "numeric",
                                                                                })
                                                                                : "N/A"}{" "}
                                                                            {/* to{" "} */}
                                                                            {" "}-{" "}
                                                                            {update.end_date
                                                                                ? new Date(update.end_date).toLocaleDateString("en-GB", {
                                                                                    year: "numeric",
                                                                                    month: "short",
                                                                                    day: "numeric",
                                                                                })
                                                                                : "N/A"}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                                {update.update_type === 'appointment_supervisor_form' && (
                                                                    <div className={styles.supervisorDetails}>
                                                                        {update.supervisor_name && (
                                                                            <div>
                                                                                <strong>Supervisor:</strong> Dr. {update.supervisor_name}
                                                                            </div>
                                                                        )}
                                                                        {update.research_topic && (
                                                                            <div>
                                                                                <strong>Research Topic:</strong> {update.research_topic}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                                {update.evidence && (
                                                                    <div>
                                                                        <a href={`/storage/evidence/${update.evidence.split('/').pop()}`}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            style={{ color: '#0043CE', textDecoration: 'underline', fontSize: '12px', marginTop: '0px' }}
                                                                        >
                                                                            Evidence File
                                                                        </a>
                                                                    </div>
                                                                )}
                                                                {update.link && (
                                                                    <div>
                                                                        <a href={update.link}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            style={{ color: '#0043CE', textDecoration: 'underline', fontSize: '12px', marginTop: '0px' }}>
                                                                            {update.link}
                                                                        </a>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className={styles.admin}>
                                                                <i>{update.completion_date ? new Date(update.completion_date).toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" }) : "N/A"}</i>
                                                            </div>
                                                            <div className={styles.admin}>
                                                                Updated by {update.admin_name || "Admin"} [{update.updated_at ? new Date(update.updated_at).toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" }) : "N/A"}]
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <span className={styles.status}></span> // Empty if no progress updates
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p>No tasks available</p>
                            )}
                        </div>
                        {index < studyPlan.length && (
                            <div className={styles.line}></div>
                        )}
                    </div>
                ))}
            </div>
            <div className={styles.legend}>
                <h4 className={styles.legendTitle}>LEGEND</h4>
                <div className={styles.legendItem}>
                    <div className={`${styles.legendDot} ${styles.pending}`}></div>
                    <span>Pending Task (On Track)</span>
                </div>

                <div className={styles.legendItem}>
                    <div className={`${styles.legendDot} ${styles.pendingDelayed}`}></div>
                    <span>Pending Task (Delayed)</span>
                </div>
                <div className={styles.legendItem}>
                    <div className={`${styles.legendDot} ${styles.completed}`}></div>
                    <span>Completed Task (On Track)</span>
                </div>
                <div className={styles.legendItem}>
                    <div className={`${styles.legendDot} ${styles.completedDelayed}`}></div>
                    <span>Completed Task (Delayed)</span>
                </div>
            </div>
        </div>
    );
};

export default ProgressFlowchart;

// import React, { useEffect, useState } from "react";
// import Mermaid from "react-mermaid2";
// import styles from "./ProgressFlowchart.module.css";

// const ProgressFlowchart = ({ studyPlan }) => {
//     const [semesterCharts, setSemesterCharts] = useState([]);

//     useEffect(() => {
//         if (studyPlan && studyPlan.length > 0) {
//             const charts = studyPlan.map((semesterData, index) => ({
//                 id: `semester-${index}`,
//                 code: generateMermaidSyntax(semesterData, index)
//             }));
//             setSemesterCharts(charts);
//         }
//     }, [studyPlan]);

//     const generateMermaidSyntax = (semesterData, semesterIndex) => {
//         let syntax = "graph TD;\n"; // Main graph for circle nodes

//         // Create nodes for each task with circles
//         semesterData.tasks.forEach((task, taskIndex) => {
//             const taskId = `semester${semesterIndex}-task${taskIndex}`;
//             const taskName = task || `Task ${taskIndex + 1}`;

//             syntax += `${taskId}(( ))\n`; // Create a circle node for each task

//             // Link tasks sequentially within the semester
//             if (taskIndex < semesterData.tasks.length - 1) {
//                 const nextTaskId = `semester${semesterIndex}-task${taskIndex + 1}`;
//                 syntax += `${taskId} --- ${nextTaskId};\n`; // Connect tasks with lines
//             }
//         });

//         // Create a new graph for task names that displays them vertically
//         syntax += "\n\nsubgraph Task_Names [ ]\n"; // Empty label for subgraph title

//         semesterData.tasks.forEach((task, taskIndex) => {
//             const taskName = task || `Task ${taskIndex + 1}`;
//             const taskNameId = `label${semesterIndex}-task${taskIndex}`;

//             // Create a node for task names with no background
//             syntax += `${taskNameId}["${taskName}"]\n`; // Create a label node for each task name

//             // Connect task names vertically to ensure they are displayed top to bottom
//             if (taskIndex > 0) {
//                 const previousTaskNameId = `label${semesterIndex}-task${taskIndex - 1}`;
//                 syntax += `${previousTaskNameId} --- ${taskNameId};\n`; // Connect names vertically
//             }
//         });

//         syntax += "end\n"; // End the subgraph

//         // Define style for the task names to make background invisible
//         syntax += `classDef invisible fill:none,stroke:none;\n`; // Define a class for invisibility
//         syntax += `class Task_Names invisible;\n`; // Apply the invisible style to the subgraph

//         return syntax;
//     };

//     return (
//         <div className={styles.flowchartContainer}>
//             {semesterCharts.map(({ id, code }) => (
//                 <div key={id} className={styles.semesterChart}>
//                     <Mermaid chart={code} />
//                 </div>
//             ))}
//         </div>
//     );
// };

// export default ProgressFlowchart;

/*
import React, { useEffect, useState, useMemo } from "react";
import ReactFlow, { MiniMap, Controls, Background } from "react-flow-renderer";
import styles from "./ProgressFlowchart.module.css";

const ProgressFlowchart = ({ studyPlan }) => {
    const [elements, setElements] = useState([]);

    // Memoize the study plan to prevent unnecessary updates
    const memoizedStudyPlan = useMemo(() => {
        return studyPlan && studyPlan.length > 0 ? studyPlan : null;
    }, [studyPlan]); // Only recompute when studyPlan changes

    useEffect(() => {
        if (memoizedStudyPlan) {
            const newElements = generateFlowElements(memoizedStudyPlan);
            console.log("Generated Flow Elements:", newElements); // Log generated elements
            setElements(newElements);
            console.log("Tasks data: ", memoizedStudyPlan); // Ensure all tasks have labels
        } else {
            console.log("Study plan data is not available or empty.");
        }
    }, [memoizedStudyPlan]); // Depend on the memoized study plan

    const generateFlowElements = (studyPlan) => {
        const flowElements = [];
        console.log("Generating flow elements for studyPlan:", studyPlan); 

        studyPlan.forEach((semesterData, semesterIndex) => {
            const tasks = semesterData.tasks; // Access the tasks directly
            console.log(`Semester ${semesterIndex + 1}:`, tasks); // Adjusted to display semester starting from 1

            tasks.forEach((task, taskIndex) => {
                const taskId = `semester${semesterIndex + 1}-task${taskIndex}`; // Adjusted for 1-based index
                const taskName = task; // Assuming task has a property called 'name'

                // Check if taskName is valid
                if (!taskName) {
                    console.error(`Missing task name for semester ${semesterIndex + 1}, task index ${taskIndex}`);
                    return; // Skip this iteration if there's no name
                }

                // Create a circle node for each task
                flowElements.push({
                    id: taskId,
                    data: { label: taskName },
                    position: { x: 100 + semesterIndex * 200, y: 50 + taskIndex * 80 },
                    style: {
                        borderRadius: '50%',
                        background: 'lightblue',
                        width: 50,
                        height: 50,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid #007bff',
                        color: '#000',
                    },
                });

                // Connect tasks sequentially within the semester
                if (taskIndex > 0) {
                    const previousTaskId = `semester${semesterIndex + 1}-task${taskIndex - 1}`;
                    const connectionId = `link-semester${semesterIndex + 1}-${taskIndex - 1}-${taskIndex}`; // Simplified connection ID
                    flowElements.push({
                        id: connectionId,
                        source: previousTaskId,
                        target: taskId,
                        animated: true,
                        style: { stroke: '#007bff' },
                    });
                }
            });
        });

        console.log("Generated Flow Elements:", flowElements); // Log flow elements before returning
        return flowElements;
    };

    return (
        <div className={styles.flowchartContainer} style={{ height: '100vh', width: '100%' }}>
            <ReactFlow elements={elements} style={{ width: '100%', height: '100%' }}>
                <MiniMap />
                <Controls />
                <Background />
            </ReactFlow>
            {elements.length === 0 && <div>No elements to display</div>}
        </div>
    );
};

export default ProgressFlowchart;
*/
