<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\ProgressUpdate;

class ProgressUpdateController extends Controller
{
    public function index()
    {
        $user = Auth::user(); // Get the authenticated user

        $generalUpdateNames = [
            'update_status' => 'Update Student Status',
            'workshops_attended' => 'Workshops Attended',
            'change_study_plan' => 'Change Study Plan',
            'extension_candidature_period' => 'Extension of Candidature Period',
        ];

        $latestTasksSubquery = DB::table('tasks')
            ->select('unique_identifier', 'intake_id', DB::raw('MAX(version_number) as latest_version_number'))
            ->groupBy('unique_identifier', 'intake_id');

        $query = DB::table('progress_updates')
            ->join('students', 'progress_updates.student_id', '=', 'students.id')
            ->leftJoinSub($latestTasksSubquery, 'latest_tasks', function ($join) {
                $join->on('progress_updates.update_type', '=', 'latest_tasks.unique_identifier')
                    ->on('students.intake_id', '=', 'latest_tasks.intake_id');
            })
            ->leftJoin('tasks', function ($join) {
                $join->on('tasks.unique_identifier', '=', 'latest_tasks.unique_identifier')
                    ->on('tasks.intake_id', '=', 'latest_tasks.intake_id')
                    ->on('tasks.version_number', '=', 'latest_tasks.latest_version_number');
            })
            ->select(
                'progress_updates.*',
                'students.id as student_id', // Include student_id
                DB::raw("CONCAT(students.first_name, ' ', students.last_name) as student_name"),
                'tasks.name as task_update_name'
            );

        // Filter data based on user role
        if ($user->role === 'admin') {
            // Admin can see all progress updates, no additional filtering required
        } elseif ($user->role === 'supervisor' || $user->role === 'both') {
            // Lecturer can only see updates of students under their supervision
            $query->where('students.supervisor_id', $user->id);
        } elseif ($user->role === 'student') {
            // Student can only see their own updates
            $query->where('students.id', $user->id);
        } else {
            // Unauthorized role
            return response()->json(['message' => 'Unauthorized access.'], 403);
        }

        // Fetch the data and format it
        $progressUpdates = $query->get()->map(function ($update) use ($generalUpdateNames) {

            $updateName = $update->task_update_name ?? $generalUpdateNames[$update->update_type] ?? 'Unknown Update';

            return [
                'id' => $update->id,
                'student_id' => $update->student_id,
                'date' => date('d M Y', strtotime($update->updated_at)), // Format the date
                'student_name' => $update->student_name,
                'update_name' => $updateName,
                'cgpa' => $update->cgpa ?? null,
                'num_courses' => $update->num_courses ?? null,
                'course_name_1' => $update->course_name_1 ?? null,
                'course_name_2' => $update->course_name_2 ?? null,
                'course_name_3' => $update->course_name_3 ?? null,
                'course_name_4' => $update->course_name_4 ?? null,
                'course_name_5' => $update->course_name_5 ?? null,
                'supervisor_name' => $update->supervisor_name ?? null,
                'research_topic' => $update->research_topic ?? null,
                'grade_1' => $update->grade_1 ?? null,
                'grade_2' => $update->grade_2 ?? null,
                'grade_3' => $update->grade_3 ?? null,
                'grade_4' => $update->grade_4 ?? null,
                'grade_5' => $update->grade_5 ?? null,
                'progress_status' => $update->progress_status ?? null,
                'grade' => $update->grade ?? null,
                'max_sem' => $update->max_sem ?? null,
                'residential_college' => $update->residential_college ?? null,
                'start_date' => $update->start_date ?? null,
                'end_date' => $update->end_date ?? null,
                'evidence' => $update->evidence ? [
                    'name' => $update->original_file_name,
                    'path' => $update->evidence
                ] : null,
                'link' => $update->link,
                'description' => $update->description,
                'completion_date' => $update->completion_date ?? null,
                'student_status' => $update->status ?? null,
                'status' => $this->formatStatus($update->approved),
                'reason' => $update->reason ?? null,
                'panels' => $update->panels ?? null,
                'chairperson' => $update->chairperson ?? null,
                'pd_date' => $update->pd_date ?? null,
                'pd_time' => $update->pd_time ?? null,
                'pd_venue' => $update->pd_venue ?? null,
                'cd_date' => $update->cd_date ?? null,
                'cd_time' => $update->cd_time ?? null,
                'cd_venue' => $update->cd_venue ?? null,
                'supervisor_id' => $update->supervisor_id ?? null,
                'workshop_name' => $update->workshop_name ?? null,
                'updated_study_plan' => $update->updated_study_plan ?? null,
            ];
        });

        return response()->json($progressUpdates);
    }

    private function formatStatus($status)
    {
        if (is_null($status)) {
            return 'Pending';
        }

        return $status == 1 ? 'Approved' : 'Rejected';
    }
}
