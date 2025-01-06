<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Student;
use App\Models\Task;
use Illuminate\Support\Facades\DB;

class StatisticsController extends Controller
{
    public function getStatistics(Request $request)
    {
        $programId = $request->query('program_id');
        $intakeId = $request->query('intake_id');

        if (!$programId || !$intakeId) {
            return response()->json(['error' => 'Missing program_id or intake_id'], 400);
        }

        // Fetch all students in the intake
        $allStudents = Student::where('intake_id', $intakeId)->count();

        // Fetch active students
        $activeStudents = Student::where('intake_id', $intakeId)
            ->where('status', 'Active')
            ->count();

        // Fetch GoT students
        $gotStudents = Student::where('intake_id', $intakeId)
            ->where('status', 'GoT')
            ->count();

        // Count distinct supervisors
        $supervisors = Student::where('intake_id', $intakeId)
            ->distinct('supervisor_id')
            ->count('supervisor_id');

        // Count students with "Dissertation" tasks
        $dissertations = Student::where('intake_id', $intakeId)
            ->where('task', 'LIKE', '%Dissertation%')
            ->count();

        return response()->json([
            'all_students' => $allStudents,
            'active_students' => $activeStudents,
            'got_students' => $gotStudents,
            'supervisors' => $supervisors,
            'dissertations' => $dissertations,
        ]);
    }

    public function getChartsData(Request $request)
    {
        $programId = $request->query('program_id');
        $intakeId = $request->query('intake_id');

        if (!$programId || !$intakeId) {
            return response()->json(['error' => 'Missing program_id or intake_id'], 400);
        }

        // Initialize chart data
        $chartsData = [
            'lineData1' => [],
            'lineData2' => [],
            'lineData3' => [],
            'doughnutData1' => [],
            'doughnutData2' => [],
            'barData' => [],
        ];

        // 1. Passed Proposal Defence
        $proposalDefence = $this->calculateCumulativeProgress($intakeId, 'proposal_defence');
        $chartsData['lineData1'] = $proposalDefence;

        // 2. Passed Candidature Defence
        $candidatureDefence = $this->calculateCumulativeProgress($intakeId, 'candidature_defence');
        $chartsData['lineData2'] = $candidatureDefence;

        // 3. Passed Dissertation
        $dissertation = $this->calculateCumulativeProgress($intakeId, 'senate_approval');
        $chartsData['lineData3'] = $dissertation;

        // 4. Student Status
        $chartsData['doughnutData1'] = $this->calculateStudentStatus($intakeId);

        // 5. GoT Status
        $chartsData['doughnutData2'] = $this->calculateGoTStatus($intakeId);

        // 6. Courses Taken
        $chartsData['barData'] = $this->calculateCoursesTaken($intakeId);

        return response()->json($chartsData);
    }

    private function calculateCumulativeProgress($intakeId, $updateType)
    {
        // Fetch the latest progress status for each student for the given update_type
        $progressUpdates = DB::table('progress_updates as pu')
            ->select('pu.student_id', 'pu.completion_date')
            ->join('students as s', 'pu.student_id', '=', 's.id') // Join with students table
            ->joinSub(
                DB::table('progress_updates')
                    ->select('student_id', DB::raw('MAX(updated_at) as latest_update'))
                    ->where('update_type', $updateType)
                    ->groupBy('student_id'),
                'latest_updates',
                function ($join) {
                    $join->on('pu.student_id', '=', 'latest_updates.student_id')
                        ->on('pu.updated_at', '=', 'latest_updates.latest_update');
                }
            )
            ->where('pu.progress_status', 'Completed')
            ->where('s.intake_id', $intakeId) // Filter by intake_id in the students table
            ->get();

        $intake = DB::table('intakes')->where('id', $intakeId)->first();
        $semesters = DB::table('semesters')->get();

        $semesterCounts = [];
        foreach ($progressUpdates as $update) {
            $completionSemester = $this->calculateCompletionSemester(
                $intake,
                $semesters,
                $update->completion_date
            );

            if (!isset($semesterCounts[$completionSemester])) {
                $semesterCounts[$completionSemester] = 0;
            }
            $semesterCounts[$completionSemester]++;
        }

        // Calculate cumulative data
        $cumulativeCounts = [];
        $total = 0;
        foreach ($semesterCounts as $sem => $count) {
            $total += $count;
            $cumulativeCounts[$sem] = $total;
        }

        return [
            'labels' => array_keys($cumulativeCounts),
            'datasets' => array_values($cumulativeCounts),
        ];
    }

    private function calculateCompletionSemester($intake, $semesters, $completionDate)
    {
        foreach ($semesters as $semester) {
            if ($completionDate >= $semester->start_date && $completionDate <= $semester->end_date) {
                $intakeYear = intval(explode('/', $intake->intake_year)[0]);
                $academicYear = intval(explode('/', $semester->academic_year)[0]);

                $semesterIndex = $semester->semester + (($academicYear - $intakeYear) * 2);
                return "Sem {$semesterIndex}";
            }
        }
        return null;
    }

    private function calculateStudentStatus($intakeId)
    {
        $students = DB::table('students')
            ->select('status')
            ->where('intake_id', $intakeId)
            ->get();

        $statusCounts = [];
        foreach ($students as $student) {
            if (!isset($statusCounts[$student->status])) {
                $statusCounts[$student->status] = 0;
            }
            $statusCounts[$student->status]++;
        }

        return [
            'labels' => array_keys($statusCounts),
            'datasets' => array_values($statusCounts),
        ];
    }

    private function calculateGoTStatus($intakeId)
    {
        $students = DB::table('students')
            ->select('status', 'track_status')
            ->where('intake_id', $intakeId)
            ->get();

        $data = [
            'GoT' => 0,
            'Non-GoT' => 0,
            'Expected to GoT' => 0,
            'Not Expected to GoT' => 0,
        ];

        foreach ($students as $student) {
            if ($student->status === 'GoT') {
                $data['GoT']++;
            } elseif ($student->status === 'Non-GoT') {
                $data['Non-GoT']++;
            } elseif (in_array($student->track_status, ['Slightly Delayed', 'On Track']) && $student->status === 'Active') {
                $data['Expected to GoT']++;
            } else {
                $data['Not Expected to GoT']++;
            }
        }

        return [
            'labels' => array_keys($data),
            'datasets' => array_values($data),
        ];
    }

    private function calculateCoursesTaken($intakeId)
    {
        // Join progress_updates with students to filter by intake_id
        $progressUpdates = DB::table('progress_updates as pu')
            ->join('students as s', 'pu.student_id', '=', 's.id') // Join with students
            ->where('s.intake_id', $intakeId) // Filter by intake_id in students table
            ->get(['pu.course_name_1', 'pu.course_name_2', 'pu.course_name_3', 'pu.course_name_4', 'pu.course_name_5']);

        $courseCounts = [];

        // Iterate through progress updates and count courses
        foreach ($progressUpdates as $update) {
            foreach (['course_name_1', 'course_name_2', 'course_name_3', 'course_name_4', 'course_name_5'] as $courseField) {
                if (!empty($update->$courseField)) {
                    if (!isset($courseCounts[$update->$courseField])) {
                        $courseCounts[$update->$courseField] = 0;
                    }
                    $courseCounts[$update->$courseField]++;
                }
            }
        }

        return [
            'labels' => array_keys($courseCounts),
            'datasets' => array_values($courseCounts),
        ];
    }
}
