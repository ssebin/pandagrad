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
        log::info('user: ' . $user);

        // Build the query
        $query = DB::table('progress_updates')
            ->join('students', 'progress_updates.student_id', '=', 'students.id')
            ->leftJoin('tasks', 'progress_updates.update_type', '=', 'tasks.unique_identifier')
            ->select(
                'progress_updates.*', // Select all fields from progress_updates
                DB::raw("CONCAT(students.first_name, ' ', students.last_name) as student_name"), // Full student name
                'tasks.name as update_name' // Task name
            )
            ->whereNotNull('tasks.name');

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
        $progressUpdates = $query->get()->map(function ($update) {
            return [
                'id' => $update->id,
                'date' => date('d M Y', strtotime($update->updated_at)), // Format the date
                'student_name' => $update->student_name,
                'update_name' => $update->update_name ?? 'N/A',
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
            ];
        });

        //log::info($progressUpdates);

        return response()->json($progressUpdates);
    }

    private function formatStatus($status)
    {
        if (is_null($status)) {
            return 'Pending';
        }

        return $status == 1 ? 'Approved' : 'Rejected';
    }

    // public function markAsRead($id)
    // {
    //     $progressUpdate = ProgressUpdate::find($id);

    //     if ($progressUpdate) {
    //         $progressUpdate->read_at = now();
    //         $progressUpdate->save();
    //         return response()->json(['message' => 'Marked as read.']);
    //     }

    //     return response()->json(['message' => 'Request not found.'], 404);
    // }
}
