<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Student;
use App\Models\Lecturer;
use App\Models\Admin;
use App\Models\StudyPlan;
use App\Models\Task;
use App\Models\Semester;
use App\Models\ProgressUpdate;
use App\Models\Notification;
use App\Events\RequestNotification;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use datetime;
use Carbon\Carbon;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user(); // Get the authenticated user

        // log::info('User:', [$user]);

        // Start the query with the supervisor relationship
        $query = Student::query()->with([
            'supervisor' => function ($query) {
                $query->select('id', 'first_name', 'last_name');
            }
        ]);

        // log::info('Initial Query:', [$query]);
        // Log::info('User Role:', ['role' => $user->role]);

        // Apply role-based filtering
        if ($user->role === 'admin') {
            // Admin: No filters, can view all students
            $query->whereNotNull('id');
        } elseif ($user->role === 'supervisor') {
            // Supervisor: Filter students they directly supervise
            $query->where('supervisor_id', $user->id);
        } elseif (in_array($user->role, ['coordinator', 'both'])) {
            // Coordinator and "both" roles: Filter by program
            $query->where('program', $user->program); // Fetch all students in the program
        } else {
            // Unauthorized role
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Execute the query and get the results
        $students = $query->get();

        // Log::info('Query Built:', ['query' => $query->toSql()]);
        // log::info('Students:', [$students]);

        // Return the filtered students as JSON
        return response()->json($students);
    }

    public function store(Request $request)
    {
        $validatedData = $this->validateStudent($request);

        // Hash the password
        $validatedData['password'] = Hash::make('password123');

        // Check if a supervisor is selected and fetch their details
        if ($request->filled('supervisor_id')) {
            $validatedData['supervisor_id'] = $request->supervisor_id;
            $lecturer = Lecturer::find($request->supervisor_id);
            if ($lecturer) {
                //$validatedData['supervisor'] = $lecturer->first_name;
            }
        } else {
            $validatedData['supervisor_id'] = null; // N/A case
            //$validatedData['supervisor'] = null;
        }

        // Create the student record
        $student = Student::create($validatedData);

        // Calculate and save the max semester
        $intake = $validatedData['intake'];
        $maxSem = $this->calculateMaxSemester($intake);
        $student->max_sem = $maxSem;
        $student->save();

        return response()->json(['message' => 'Student added successfully', 'student' => $student], 201);
    }

    public function show($id, Request $request)
    {
        $user = $request->user(); // Get the authenticated user
        $student = Student::find($id);

        log::info('User:', [$user]);
        log::info('Student:', [$student]);

        if (!$student) {
            return response()->json(['message' => 'Student not found'], 404);
        }

        // Admins can access all student details
        if ($user->role === 'admin') {
            return response()->json($student);
        }

        // Allow students to access only their own details
        if ($user->role === 'student') {
            log::info('Student ID:', [$student->id]);
            log::info('User ID:', [$user->id]);
            if ($user->id !== $student->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
            return response()->json($student);
        }

        // Role-based restrictions
        if ($user->role === 'supervisor') {
            // Supervisors can only view students they supervise
            if ($student->supervisor_id !== $user->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        } elseif (in_array($user->role, ['coordinator', 'both'])) {
            // Coordinators and both roles can only view students in their program
            if ($student->program !== $user->program) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        } else {
            // Unauthorized role
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($student);
    }

    public function update(Request $request, $id)
    {
        $student = Student::find($id);

        if (!$student) {
            return response()->json(['error' => 'Student not found'], 404);
        }

        $validatedData = $this->validateStudent($request);
        $student->update($validatedData);

        return response()->json(['message' => 'Student updated successfully']);
    }

    public function destroy($id)
    {
        $student = Student::find($id);

        if (!$student) {
            return response()->json(['error' => 'Student not found'], 404);
        }

        $student->delete();

        return response()->json(['message' => 'Student deleted successfully']);
    }

    public function updateProfilePicture(Request $request)
    {
        $request->validate([
            'profile_pic' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);

        // Get the authenticated user
        $user = auth()->user();

        if ($request->hasFile('profile_pic')) {
            $path = $request->file('profile_pic')->store('profile_pics', 'public');
            $user->profile_pic = $path;
            $user->save();

            return response()->json(['profile_pic' => $path, 'message' => 'Profile picture updated successfully.'], 200);
        } else {
            return response()->json(['message' => 'Error Updating the Profile Picture'], 400);
        }
    }

    public function getNationality($id)
    {
        $student = Student::find($id);
        if (!$student) {
            return response()->json(['error' => 'Student not found'], 404);
        }
        return response()->json(['nationality' => $student->nationality]);
    }

    private function validateStudent(Request $request)
    {
        return $request->validate([
            'first_name' => 'nullable|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'siswamail' => 'nullable|string|email|max:255',
            'supervisor_id' => 'nullable|integer',
            'status' => 'nullable|string|max:255',
            'intake' => 'nullable|string|max:255',
            'semester' => 'nullable|integer',
            'program' => 'nullable|string|max:255',
            'research' => 'nullable|string',
            'task' => 'nullable|string|max:255',
            'profile_pic' => 'nullable|string|max:255',
            'progress' => 'nullable|integer',
            'track_status' => 'nullable|string|max:255',
            'cgpa' => 'nullable|numeric|between:0,4.00',
            'matric_number' => 'nullable|string|max:255',
            'remarks' => 'nullable|string',
        ]);
    }

    public function studentsUnderSupervision()
    {
        $lecturer = auth()->user(); // Assuming logged-in lecturer
        $students = $lecturer->students; // Get all students under supervision
        return response()->json($students);
    }

    // Save student personal details
    public function register(Request $request)
    {
        try {
            // Validate the incoming request
            $validatedData = $request->validate([
                'first_name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
                'matric_number' => 'required|string|max:255',
                'intake' => 'required|string|max:255',
                'program' => 'required|string|max:255',
                'nationality' => 'required|string|max:255',
                'profile_pic' => 'nullable|file|image|max:2048', // optional
            ]);

            // Save the profile picture if provided
            if ($request->hasFile('profile_pic')) {
                $path = $request->file('profile_pic')->store('profile_pics', 'public');
                $validatedData['profile_pic'] = $path;
            }

            // Get the Siswamail from the request (already appended from localStorage)
            $siswamail = $request->input('siswamail');

            // Find the student based on siswamail
            $student = Student::where('siswamail', $siswamail)->first();

            // Check if the student exists
            if (!$student) {
                return response()->json(['error' => 'Student not found'], 404);
            }

            // Calculate the maximum semester based on intake
            $intake = $validatedData['intake']; // Expected format: 'Sem X, YYYY/YYYY'
            $maxSem = $this->calculateMaxSemester($intake);

            // Update the student data
            $student->fill($validatedData);
            $student->max_sem = $maxSem; // Set the calculated max semester
            $student->save();

            return response()->json(['message' => 'Student registered successfully'], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['error' => 'Validation error', 'messages' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Registration failed', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Calculate the maximum semester based on the intake.
     *
     * @param string $intake
     * @return string
     */
    private function calculateMaxSemester($intake)
    {
        // Parse the intake, expecting format 'sem X, YYYY/YYYY'
        preg_match('/Sem (\d), (\d{4})\/(\d{4})/', $intake, $matches);

        if (count($matches) === 4) {
            $semester = (int)$matches[1];
            $startYear = (int)$matches[2];
            $endYear = (int)$matches[3];

            // Calculate the max semester (8th semester after intake)
            for ($i = 0; $i < 7; $i++) {
                if ($semester == 1) {
                    $semester = 2;
                } else {
                    $semester = 1;
                    $startYear++;
                    $endYear++;
                }
            }

            return "Sem $semester, $startYear/$endYear";
        }

        // Return a default or error string if intake format is incorrect
        return "Invalid intake format";
    }

    // Save the study plan
    public function saveStudyPlan(Request $request)
    {
        // Check if the user is authenticated
        if (!Auth::check()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Get the authenticated user, which is a Student
        $student = Auth::user(); // This is already the Student instance

        // Log authenticated user info
        //Log::info('Authenticated User:', [$student]);

        // Validate request data
        $validatedData = $request->validate([
            'semesters_no' => 'required|integer|min:1|max:6',
            'semesters' => 'required|array',
            'semesters.*.semester' => 'required|integer',
            'semesters.*.tasks' => 'required|array',
            'semesters.*.tasks.*' => 'required|integer', // Validate that each task is an integer
        ]);

        // Convert the semesters array to JSON
        $validatedData['semesters'] = json_encode($validatedData['semesters']);

        // Check if a study plan already exists
        $studyPlan = $student->studyPlan;

        try {
            if ($studyPlan) {
                // Update the existing study plan
                $studyPlan->update($validatedData);
            } else {
                // Create a new study plan and associate it with the student
                $studyPlan = $student->studyPlan()->create($validatedData);
            }

            // Attach tasks to the study plan
            // Flatten the tasks array from semesters to a single array
            $taskIds = collect($request->semesters)
                ->pluck('tasks') // Get the tasks array
                ->flatten() // Flatten the array
                ->unique() // Ensure unique task IDs
                ->toArray(); // Convert to array

            // Attach the tasks to the study plan
            $studyPlan->tasks()->sync($taskIds); // Use sync to manage relationships

            // Set has_study_plan to true
            $student->has_study_plan = true;
            $student->save(); // Save the updated student model

            return response()->json([
                'message' => 'Study plan saved successfully',
                'study_plan' => $studyPlan,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error saving study plan:', [$e]);
            return response()->json(['message' => 'Error saving study plan'], 500);
        }
    }

    public function getStudyPlan($id)
    {
        try {
            // Fetch the study plan for the student, and eager load tasks with progress updates filtered by student_id
            $studyPlans = StudyPlan::with([
                'tasks' => function ($query) {
                    // Join the pivot table correctly with an alias
                    $query->join('study_plan_task as spt', 'spt.task_id', '=', 'tasks.id') // Join with alias 'spt'
                        ->orderBy('spt.task_id', 'asc'); // Order by the task_id from the pivot table
                },
                'tasks.progressUpdates' => function ($query) use ($id) {
                    $query->where('student_id', $id) // Filter updates by student ID
                        ->where('approved', 1); // Only include approved updates
                },
                'tasks.progressUpdates.admin'
            ])
                ->where('student_id', $id)
                ->get();

            if ($studyPlans->isEmpty()) {
                return response()->json([], 200);
            }

            // Format the study plan with tasks grouped by 
            $formattedStudyPlan = $studyPlans->flatMap(function ($plan) {
                // Decode the semesters JSON to an array
                $semesters = json_decode($plan->semesters, true);
                $tasks = $plan->tasks;

                return collect($semesters)->map(function ($semester) use ($tasks, $plan) {
                    // Filter tasks by ID for the current semester and ensure uniqueness by task ID
                    $semesterTasks = $tasks->whereIn('id', $semester['tasks'])->unique('id');

                    // Map the tasks to include their names and filtered progress updates
                    $formattedTasks = $semesterTasks->map(function ($task) {
                        return [
                            'name' => $task->name,
                            'progress_updates' => $task->progressUpdates->map(function ($update) {
                                return [
                                    'update_type' => $update->update_type,
                                    'status' => $update->status,
                                    'evidence' => $update->evidence,
                                    'original_file_name' => $update->original_file_name,
                                    'link' => $update->link,
                                    'description' => $update->description,
                                    'completion_date' => $update->completion_date,
                                    'cgpa' => $update->cgpa,
                                    'grade' => $update->grade,
                                    'progress_status' => $update->progress_status,
                                    'course_name_1' => $update->course_name_1,
                                    'course_name_2' => $update->course_name_2,
                                    'course_name_3' => $update->course_name_3,
                                    'course_name_4' => $update->course_name_4,
                                    'course_name_5' => $update->course_name_5,
                                    'grade_1' => $update->grade_1,
                                    'grade_2' => $update->grade_2,
                                    'grade_3' => $update->grade_3,
                                    'grade_4' => $update->grade_4,
                                    'grade_5' => $update->grade_5,
                                    'updated_at' => $update->updated_at,
                                    'admin' => optional($update->admin)->name,
                                    'research_topic' => $update->research_topic,
                                    'workshop_name' => $update->workshop_name,
                                    'num_courses' => $update->num_courses,
                                    'supervisor_name' => $update->supervisor_name,
                                    'max_sem' => $update->max_sem,
                                    'residential_college' => $update->residential_college,
                                    'start_date' => $update->start_date,
                                    'end_date' => $update->end_date,
                                    'admin_name' => $update->admin_name,
                                    'reason' => $update->reason,
                                    'panels' => $update->panels,
                                    'chairperson' => $update->chairperson,
                                    'pd_date' => $update->pd_date,
                                    'pd_time' => $update->pd_time,
                                    'pd_venue' => $update->pd_venue,
                                    'cd_date' => $update->cd_date,
                                    'cd_time' => $update->cd_time,
                                    'cd_venue' => $update->cd_venue,
                                ];
                            })
                        ];
                    });

                    return [
                        'semester' => $semester['semester'],
                        'tasks' => $formattedTasks,
                        'created_at' => $plan->created_at
                    ];
                });
            });

            return response()->json($formattedStudyPlan, 200);
        } catch (\Exception $e) {
            Log::error('Failed to fetch study plan: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch study plan'], 500);
        }
    }

    // public function getAllStudyPlans()
    // {
    //     try {
    //         // Fetch all study plans with their tasks and associated students
    //         $studyPlans = DB::table('study_plans')
    //             ->join('students', 'study_plans.student_id', '=', 'students.id')
    //             ->join('study_plan_task', 'study_plan_task.study_plan_id', '=', 'study_plans.id')
    //             ->join('tasks', 'study_plan_task.task_id', '=', 'tasks.id')
    //             ->select(
    //                 'study_plans.id as study_plan_id',
    //                 'study_plans.student_id',
    //                 'study_plans.semesters',
    //                 'students.siswamail',
    //                 'tasks.id as task_id',
    //                 'tasks.name as task_name'
    //             )
    //             ->get();

    //         // Group the data by student_id
    //         $groupedStudyPlans = $studyPlans->groupBy('student_id');

    //         // Format the data into a nested structure
    //         $formattedStudyPlans = $groupedStudyPlans->map(function ($plans, $studentId) {
    //             return [
    //                 'student_id' => $studentId,
    //                 'siswamail' => $plans->first()->siswamail,
    //                 'study_plans' => $plans->groupBy('study_plan_id')->map(function ($planTasks, $planId) {
    //                     return [
    //                         'study_plan_id' => $planId,
    //                         'semesters' => json_decode($planTasks->first()->semesters, true),
    //                         'tasks' => $planTasks->map(function ($task) {
    //                             return [
    //                                 'task_id' => $task->task_id,
    //                                 'task_name' => $task->task_name,
    //                             ];
    //                         }),
    //                     ];
    //                 })->values(),
    //             ];
    //         })->values();

    //         return response()->json($formattedStudyPlans, 200);
    //     } catch (\Exception $e) {
    //         Log::error('Error fetching all study plans: ' . $e->getMessage());
    //         return response()->json(['error' => 'Failed to fetch all study plans'], 500);
    //     }
    // }

    // public function getAllStudyPlans()
    // {
    //     try {
    //         // Fetch all study plans and their related data
    //         $studyPlans = StudyPlan::with([
    //             'tasks' => function ($query) {
    //                 $query->join('study_plan_task as spt', 'spt.task_id', '=', 'tasks.id') // Join with alias 'spt'
    //                     ->orderBy('spt.task_id', 'asc'); // Order by the task_id from the pivot table
    //             },
    //             'tasks.progressUpdates.admin' // Eager load admin who made changes
    //         ])->get();

    //         if ($studyPlans->isEmpty()) {
    //             return response()->json([], 200); // Return an empty array if no study plans are found
    //         }

    //         // Map the study plans by student ID
    //         $studyPlansByStudent = $studyPlans->groupBy('student_id')->map(function ($plans, $studentId) {
    //             // Combine all plans for a single student
    //             return $plans->flatMap(function ($plan) {
    //                 $semesters = json_decode($plan->semesters, true);
    //                 $tasks = $plan->tasks;

    //                 return collect($semesters)->map(function ($semester) use ($tasks) {
    //                     $semesterTasks = $tasks->whereIn('id', $semester['tasks'])->unique('id');
    //                     $formattedTasks = $semesterTasks->map(function ($task) {
    //                         return [
    //                             'name' => $task->name,
    //                             'progress_updates' => $task->progressUpdates->map(function ($update) {
    //                                 return [
    //                                     'update_type' => $update->update_type,
    //                                     'status' => $update->status,
    //                                     'evidence' => $update->evidence,
    //                                     'link' => $update->link,
    //                                     'description' => $update->description,
    //                                     'completion_date' => $update->completion_date,
    //                                     'cgpa' => $update->cgpa,
    //                                     'grade' => $update->grade,
    //                                     'progress_status' => $update->progress_status,
    //                                     'course_name_1' => $update->course_name_1,
    //                                     'course_name_2' => $update->course_name_2,
    //                                     'course_name_3' => $update->course_name_3,
    //                                     'course_name_4' => $update->course_name_4,
    //                                     'course_name_5' => $update->course_name_5,
    //                                     'grade_1' => $update->grade_1,
    //                                     'grade_2' => $update->grade_2,
    //                                     'grade_3' => $update->grade_3,
    //                                     'grade_4' => $update->grade_4,
    //                                     'grade_5' => $update->grade_5,
    //                                     'updated_at' => $update->updated_at,
    //                                     'admin' => optional($update->admin)->name,
    //                                 ];
    //                             }),
    //                         ];
    //                     });

    //                     return [
    //                         'semester' => $semester['semester'],
    //                         'tasks' => $formattedTasks
    //                     ];
    //                 });
    //             });
    //         });

    //         return response()->json($studyPlansByStudent, 200);
    //     } catch (\Exception $e) {
    //         Log::error('Failed to fetch all study plans: ' . $e->getMessage());
    //         return response()->json(['error' => 'Failed to fetch all study plans'], 500);
    //     }
    // }

    // public function updateCurrentTask($id)
    // {
    //     try {
    //         // Fetch the study plan for the student
    //         $studyPlan = StudyPlan::with([
    //             'tasks' => function ($query) {
    //                 $query->join('study_plan_task as spt', 'spt.task_id', '=', 'tasks.id')
    //                     ->orderBy('spt.task_id', 'asc'); // Ensure tasks are ordered
    //             },
    //             'tasks.progressUpdates' => function ($query) use ($id) {
    //                 $query->where('student_id', $id); // Filter progress updates by student ID
    //             }
    //         ])->where('student_id', $id)->first();

    //         if (!$studyPlan) {
    //             return response()->json(['error' => 'Study plan not found'], 404);
    //         }

    //         // Decode semesters and find tasks with updates
    //         $semesters = json_decode($studyPlan->semesters, true);
    //         $updatedTasks = $studyPlan->tasks->filter(function ($task) {
    //             return $task->progressUpdates->isNotEmpty();
    //         })->pluck('id')->toArray();

    //         // Determine the first task without updates
    //         foreach ($semesters as $semester) {
    //             foreach ($semester['tasks'] as $taskId) {
    //                 if (!in_array($taskId, $updatedTasks)) {
    //                     // Fetch the task name
    //                     $currentTask = Task::find($taskId);
    //                     if ($currentTask) {
    //                         // Update the current task in the student table
    //                         Student::where('id', $id)->update(['task' => $currentTask->name]);
    //                         return response()->json(['current_task' => $currentTask->name], 200);
    //                     }
    //                 }
    //             }
    //         }

    //         // If all tasks are updated
    //         Student::where('id', $id)->update(['task' => 'All tasks completed']);
    //         return response()->json(['current_task' => 'All tasks completed'], 200);
    //     } catch (\Exception $e) {
    //         Log::error('Failed to update current task: ' . $e->getMessage());
    //         return response()->json(['error' => 'Failed to update current task'], 500);
    //     }
    // }

    // public function updateCurrentTask($id)
    // {
    //     try {
    //         // Fetch the study plan for the student
    //         $studyPlan = StudyPlan::with([
    //             'tasks' => function ($query) {
    //                 $query->join('study_plan_task as spt', 'spt.task_id', '=', 'tasks.id')
    //                     ->orderBy('spt.task_id', 'asc'); // Ensure tasks are ordered
    //             },
    //             'tasks.progressUpdates' => function ($query) use ($id) {
    //                 $query->where('student_id', $id)->orderBy('updated_at', 'desc');
    //             }
    //         ])->where('student_id', $id)->first();

    //         if (!$studyPlan) {
    //             return response()->json(['error' => 'Study plan not found'], 404);
    //         }

    //         // Decode semesters
    //         $semesters = json_decode($studyPlan->semesters, true);

    //         // Flatten progress updates for easier handling
    //         $progressUpdates = $studyPlan->tasks->flatMap(function ($task) {
    //             return $task->progressUpdates;
    //         });

    //         // Determine completed tasks:
    //         $fullyCompletedTasks = $studyPlan->tasks->filter(function ($task) {
    //             // If progressUpdates are empty, the task is incomplete
    //             if ($task->progressUpdates->isEmpty()) {
    //                 return false;
    //             }

    //             // Check if the task's progressUpdates include "Completed" status
    //             foreach ($task->progressUpdates as $update) {
    //                 if ($update->progress_status === 'Completed') {
    //                     return true; // Explicitly completed
    //                 }
    //                 else if ($update->progress_status == 'Pending' || $update->progress_status == 'In Progress') {
    //                     return false; // Incomplete if any update is not "Completed"
    //                 }
    //             }

    //             // If no progress_status exists, consider it completed if there are updates
    //             return true; // Automatically completed if any update exists
    //         })->pluck('id')->toArray();

    //         // Determine the current task
    //         foreach ($semesters as $semester) {
    //             foreach ($semester['tasks'] as $taskId) {
    //                 // If the task is not in fullyCompletedTasks, it's the current task
    //                 if (!in_array($taskId, $fullyCompletedTasks)) {
    //                     $currentTask = Task::find($taskId);
    //                     if ($currentTask) {
    //                         Student::where('id', $id)->update(['task' => $currentTask->name]);
    //                         return response()->json(['current_task' => $currentTask->name], 200);
    //                     }
    //                 }
    //             }
    //         }

    //         // If all tasks are completed
    //         Student::where('id', $id)->update(['task' => 'All tasks completed']);
    //         return response()->json(['current_task' => 'All tasks completed'], 200);
    //     } catch (\Exception $e) {
    //         Log::error('Failed to update current task: ' . $e->getMessage());
    //         return response()->json(['error' => 'Failed to update current task'], 500);
    //     }
    // }

    public function updateCurrentTask($id)
    {
        try {
            // Fetch the study plan for the student
            $studyPlan = StudyPlan::with([
                'tasks' => function ($query) {
                    $query->join('study_plan_task as spt', 'spt.task_id', '=', 'tasks.id')
                        ->orderBy('spt.task_id', 'asc'); // Ensure tasks are ordered
                },
                'tasks.progressUpdates' => function ($query) use ($id) {
                    $query->where('student_id', $id); // Filter progress updates by student ID
                }
            ])->where('student_id', $id)->first();

            if (!$studyPlan) {
                return response()->json(['error' => 'Study plan not found'], 404);
            }

            // Decode semesters
            $semesters = json_decode($studyPlan->semesters, true);

            // Flatten progress updates for easier handling and get only the latest update per task
            $latestProgressUpdates = $studyPlan->tasks->flatMap(function ($task) {
                return $task->progressUpdates->sortByDesc('updated_at')->take(1); // Get the latest update
            });

            // Determine completed tasks:
            $fullyCompletedTasks = $studyPlan->tasks->filter(function ($task) use ($latestProgressUpdates) {
                // If progressUpdates are empty, the task is incomplete
                if ($task->progressUpdates->isEmpty()) {
                    return false;
                }

                // Get the latest progress update for this task
                $latestUpdate = $task->progressUpdates->sortByDesc('updated_at')->first();

                // Check the status of the latest update
                if ($latestUpdate->progress_status === 'Completed') {
                    return true; // Explicitly completed
                } elseif ($latestUpdate->progress_status === 'Pending' || $latestUpdate->progress_status === 'In Progress') {
                    return false; // Incomplete if the latest update is not "Completed"
                }

                // If no progress_status exists, consider it completed if there are updates
                return true; // Automatically completed if any update exists
            })->pluck('id')->toArray();

            // Determine the current task
            foreach ($semesters as $semester) {
                foreach ($semester['tasks'] as $taskId) {
                    // If the task is not in fullyCompletedTasks, it's the current task
                    if (!in_array($taskId, $fullyCompletedTasks)) {
                        $currentTask = Task::find($taskId);
                        if ($currentTask) {
                            Student::where('id', $id)->update(['task' => $currentTask->name]);
                            return response()->json(['current_task' => $currentTask->name], 200);
                        }
                    }
                }
            }

            // If all tasks are completed
            Student::where('id', $id)->update(['task' => 'All tasks completed']);
            return response()->json(['current_task' => 'All tasks completed'], 200);
        } catch (\Exception $e) {
            Log::error('Failed to update current task: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update current task'], 500);
        }
    }

    // public function calculateAndUpdateProgress($studentId)
    // {
    //     try {
    //         // Fetch the study plan for the student
    //         $studyPlan = StudyPlan::with([
    //             'tasks' => function ($query) {
    //                 $query->join('study_plan_task as spt', 'spt.task_id', '=', 'tasks.id')
    //                     ->orderBy('spt.task_id', 'asc'); // Ensure tasks are ordered
    //             },
    //             'tasks.progressUpdates' => function ($query) use ($studentId) {
    //                 $query->where('student_id', $studentId); // Filter progress updates by student ID
    //             }
    //         ])->where('student_id', $studentId)->first();

    //         if (!$studyPlan) {
    //             return; // No study plan, nothing to calculate
    //         }

    //         // Decode semesters
    //         $semesters = json_decode($studyPlan->semesters, true);

    //         // Total tasks (including repeated tasks across semesters)
    //         $totalTasks = collect($semesters)->flatMap(function ($semester) {
    //             return $semester['tasks'];
    //         })->count();

    //         // Determine completed tasks
    //         // $completedTasks = $studyPlan->tasks->filter(function ($task) {
    //         //     if ($task->progressUpdates->isEmpty()) {
    //         //         return false; // Task is incomplete if there are no updates
    //         //     }

    //         //     // Check the latest update
    //         //     $latestUpdate = $task->progressUpdates->sortByDesc('updated_at')->first();
    //         //     return $latestUpdate->progress_status === 'Completed'; // Explicitly completed
    //         // })->count();

    //         // Flatten progress updates for easier handling and get only the latest update per task
    //         $latestProgressUpdates = $studyPlan->tasks->flatMap(function ($task) {
    //             return $task->progressUpdates->sortByDesc('updated_at')->take(1); // Get the latest update
    //         });

    //         // Determine completed tasks:
    //         $fullyCompletedTasks = $studyPlan->tasks->filter(function ($task) use ($latestProgressUpdates) {
    //             // Get the latest progress update for this task
    //             $latestUpdate = $task->progressUpdates->sortByDesc('updated_at')->first();
    //             // If progressUpdates are empty, the task is incomplete
    //             if ($task->progressUpdates->isEmpty()) {
    //                 //log::info('No Progress Updates:', [$task->name]);
    //                 return false;
    //             } else if ($latestUpdate->progress_status === 'Completed') {
    //                 //log::info('Task Completed:', [$task->name]);
    //                 return true; // Explicitly completed
    //             } else if ($latestUpdate->progress_status === 'Pending' || $latestUpdate->progress_status === 'In Progress') {
    //                 //log::info('Task Incomplete:', [$task->name]);
    //                 return false; // Incomplete if the latest update is not "Completed"
    //             } else {
    //                 //log::info('Task Completed (no progress_status):', [$task->name]);
    //                 // If no progress_status exists, consider it completed if there are updates
    //                 return true; // Automatically completed if any update exists
    //             }
    //         })->unique('id')->count();
    //         //log::info('Fully Completed Tasks:', [$fullyCompletedTasks]);
    //         //log::info('Total Tasks:', [$totalTasks]);

    //         // Calculate progress percentage
    //         $progressPercentage = $totalTasks > 0 ? intval(($fullyCompletedTasks / $totalTasks) * 100) : 0;

    //         // Update the student's progress
    //         Student::where('id', $studentId)->update(['progress' => $progressPercentage]);
    //     } catch (\Exception $e) {
    //         Log::error('Failed to calculate progress: ' . $e->getMessage());
    //     }
    // }

    // private function getSemesterEndDate($semesterNumber, $intake, $semesters)
    // {
    //     if (!$intake || !$semesters) {
    //         Log::error('Missing intake or semesters data.');
    //         return null;
    //     }

    //     Log::info("Calculating semester end date for Semester {$semesterNumber}, Intake: {$intake}");

    //     // Extract intake semester and academic year
    //     [$intakeSemester, $intakeYearRange] = explode(', ', $intake);
    //     [$intakeYearStart] = explode('/', $intakeYearRange);
    //     $intakeYearStart = (int) $intakeYearStart;
    //     $intakeSemesterNumber = (int) explode(' ', $intakeSemester)[1]; // 1 for Sem 1, 2 for Sem 2

    //     // Calculate the total semesters passed from the intake semester
    //     $totalSemestersPassed = ($semesterNumber - 1) + ($intakeSemesterNumber - 1);

    //     // Calculate the academic year offset
    //     $yearOffset = floor($totalSemestersPassed / 2); // Every 2 semesters = 1 year
    //     $academicYearStart = $intakeYearStart + $yearOffset;

    //     // Determine if the semester is odd or even
    //     $semesterType = ($totalSemestersPassed % 2 === 0) ? 1 : 2; // 1 for odd semesters, 2 for even

    //     // Check if the semester is already present in the $semesters collection
    //     $matchingSemester = collect($semesters)->firstWhere(function ($sem) use ($academicYearStart, $semesterType) {
    //         return $sem['academic_year'] === "{$academicYearStart}/" . ($academicYearStart + 1)
    //             && $sem['semester'] === $semesterType;
    //     });

    //     if ($matchingSemester) {
    //         Log::info("Matching Semester Found: ", $matchingSemester);
    //         return $matchingSemester['end_date'] ?? null;
    //     }

    //     // Fallback: Fetch from database
    //     $semester = DB::table('semesters')
    //         ->where('academic_year', "{$academicYearStart}/" . ($academicYearStart + 1))
    //         ->where('semester', $semesterType)
    //         ->first();

    //     if (!$semester) {
    //         Log::warning("No matching semester found for Semester {$semesterNumber}");
    //         return null;
    //     }

    //     Log::info("Fetched Semester Metadata: ", (array) $semester);
    //     return $semester->end_date;
    // }

    public function calculateAndUpdateProgress($studentId, $currentSemester)
    {
        try {
            // Fetch the study plan and associated data
            // In your controller or service
            $studyPlan = StudyPlan::with([
                'tasks.progressUpdates' => function ($query) use ($studentId) {
                    $query->where('student_id', $studentId);
                },
            ])->where('student_id', $studentId)->first();

            if (!$studyPlan) {
                return; // No study plan, nothing to calculate
            }

            // Log::info('Study Plan:', [$studyPlan]);
            // Log::info('Current Semester:', [$currentSemester]);

            // Get the intake
            $intake = $studyPlan->student->intake;

            // Get all semesters from the database
            $semesters = Semester::all();

            // Decode the semesters from the study plan
            $studyPlanSemesters = json_decode($studyPlan->semesters, true);

            // Total tasks
            $totalTasks = collect($studyPlanSemesters)->flatMap(function ($semester) {
                return $semester['tasks'];
            })->count();

            // Calculate task statuses and progress
            $fullyCompletedTasks = 0;
            $delayedTasks = [
                'slightlyDelayed' => false,
                'veryDelayed' => false,
            ];

            foreach ($studyPlanSemesters as $studyPlanSemester) {
                $semesterNumber = $studyPlanSemester['semester'];

                // Calculate the academic year and type (odd/even) of the semester
                [$academicYearStart, $databaseSemester] = $this->getAcademicYearAndDatabaseSemester($semesterNumber, $intake);

                // Find the corresponding semester from the database
                $semester = $semesters->firstWhere(function ($sem) use ($academicYearStart, $databaseSemester) {
                    return $sem->academic_year === "{$academicYearStart}/" . ($academicYearStart + 1) &&
                        $sem->semester == $databaseSemester;
                });

                if (!$semester) {
                    Log::warning("Semester {$semesterNumber} not found in database.");
                    continue;
                }

                $semesterEndDate = $semester->end_date;

                foreach ($studyPlanSemester['tasks'] as $taskId) {
                    // Find the task in the study plan's tasks
                    $task = $studyPlan->tasks->find($taskId);

                    if (!$task) {
                        Log::warning("Task ID {$taskId} not found in study plan tasks.");
                        continue;
                    }

                    // Determine task status
                    $taskStatus = $task->determineStatus($semesterEndDate);

                    // Count completed tasks
                    if (in_array($taskStatus, ['onTrackCompleted', 'delayedCompleted'])) {
                        $fullyCompletedTasks++;
                    }

                    // Check for delayed pending tasks
                    if ($taskStatus === 'delayedPending') {
                        if ($semesterNumber < $currentSemester - 1) {
                            $delayedTasks['veryDelayed'] = true;
                        } elseif ($semesterNumber === $currentSemester - 1) {
                            $delayedTasks['slightlyDelayed'] = true;
                        }
                    }
                }
            }

            // Determine track_status
            $trackStatus = 'On Track';
            if ($delayedTasks['veryDelayed']) {
                $trackStatus = 'Very Delayed';
            } elseif ($delayedTasks['slightlyDelayed']) {
                $trackStatus = 'Slightly Delayed';
            }

            // Calculate progress percentage
            $progressPercentage = $totalTasks > 0 ? intval(($fullyCompletedTasks / $totalTasks) * 100) : 0;
            // log::info('fullyCompletedTasks:', [$fullyCompletedTasks]);
            // log::info('totalTasks:', [$totalTasks]);

            // Update the student's progress and track_status
            Student::where('id', $studentId)->update([
                'progress' => $progressPercentage,
                'track_status' => $trackStatus,
            ]);

            Log::info("Progress updated for Student ID {$studentId}: {$progressPercentage}% - {$trackStatus}");
        } catch (\Exception $e) {
            Log::error('Failed to calculate progress: ' . $e->getMessage());
        }
    }

    private function getAcademicYearAndDatabaseSemester($semesterNumber, $intake)
    {
        if (!$intake) {
            Log::error('Missing intake data.');
            return [null, null];
        }

        // Extract intake semester and academic year
        [$intakeSemester, $intakeYearRange] = explode(', ', $intake);
        [$intakeYearStart] = explode('/', $intakeYearRange);
        $intakeYearStart = (int) $intakeYearStart;
        $intakeSemesterNumber = (int) explode(' ', $intakeSemester)[1]; // 1 for Sem 1, 2 for Sem 2

        // Calculate total semesters passed
        $totalSemestersPassed = ($semesterNumber - 1) + ($intakeSemesterNumber - 1);

        // Determine the academic year offset
        $yearOffset = floor($totalSemestersPassed / 2); // Every 2 semesters = 1 year
        $academicYearStart = $intakeYearStart + $yearOffset;

        // Determine if it's an odd (1) or even (2) semester
        $databaseSemester = ($totalSemestersPassed % 2 === 0) ? 1 : 2;

        return [$academicYearStart, $databaseSemester];
    }

    // private function calculateCurrentSemester($intake, $semesters)
    // {
    //     if (!$intake || !$semesters) {
    //         Log::error('Missing intake or semesters data.');
    //         return null;
    //     }

    //     Log::info("Calculating current semester for Intake: {$intake}");

    //     // Extract intake semester and academic year
    //     [$intakeSemester, $intakeYearRange] = explode(', ', $intake);
    //     [$intakeYearStart] = explode('/', $intakeYearRange);
    //     $intakeYearStart = (int) $intakeYearStart;
    //     $intakeSemesterNumber = (int) explode(' ', $intakeSemester)[1]; // 1 for Sem 1, 2 for Sem 2

    //     // Find the starting semester for the student's intake
    //     $startSemester = collect($semesters)->first(function ($semester) use ($intakeYearStart, $intakeSemesterNumber) {
    //         return $semester->academic_year === "{$intakeYearStart}/" . ($intakeYearStart + 1) &&
    //             $semester->semester == $intakeSemesterNumber;
    //     });

    //     if (!$startSemester) {
    //         Log::error("No matching semester found for intake: {$intake}");
    //         return null;
    //     }

    //     $studentStartDate = Carbon::parse($startSemester->start_date);
    //     $currentDate = Carbon::now();

    //     // If the current date is before the student's intake, return 1
    //     if ($currentDate->lt($studentStartDate)) {
    //         return 1; // The student is in Semester 1
    //     }

    //     // Count how many semesters have passed since the intake
    //     $semesterIndex = 1; // Start from Semester 1
    //     foreach ($semesters as $semester) {
    //         $semesterStartDate = Carbon::parse($semester->start_date);
    //         $semesterEndDate = Carbon::parse($semester->end_date);

    //         if ($currentDate->between($semesterStartDate, $semesterEndDate)) {
    //             return $semesterIndex; // Return the current semester
    //         }

    //         $semesterIndex++;
    //     }

    //     // If the current date is beyond all semesters, return the total count
    //     Log::warning("Current date is beyond all semester periods; returning total semester count.");
    //     return $semesterIndex;
    // }

    // private function calculateCurrentSemester($semesters, $intake)
    // {
    //     $currentDate = new DateTime();

    //     foreach ($semesters as $semester) {
    //         $semesterEndDate = $this->getSemesterEndDate($semester['semester'], $intake, $semesters);

    //         if (!$semesterEndDate) {
    //             Log::warning("End date not found for Semester {$semester['semester']}.");
    //             continue;
    //         }

    //         $semesterEnd = new DateTime($semesterEndDate);
    //         if ($currentDate <= $semesterEnd) {
    //             return $semester['semester'];
    //         }
    //     }
    //     log::info('No matching semester found for current date, assume last semester:', [$currentDate]);
    //     // If no matching semester is found, assume the last semester
    //     return count($semesters);
    // }

    // public function getStudentProgress($studentId)
    // {
    //     try {
    //         Log::info("Fetching progress for Student ID: {$studentId}");
    //         // Fetch the study plan with tasks and progress updates
    //         $studyPlan = StudyPlan::with('tasks.progressUpdates')
    //             ->where('student_id', $studentId)
    //             ->first();

    //         if (!$studyPlan) {
    //             Log::error("Study plan not found for Student ID: {$studentId}");
    //             return response()->json(['error' => 'Study plan not found'], 404);
    //         }

    //         // Decode the semesters JSON field
    //         $semesters = json_decode($studyPlan->semesters, true);

    //         // Fetch intake information (assumed to be in the student relationship)
    //         $intake = $studyPlan->student->intake; // Ensure the `intake` field exists

    //         Log::info('Semesters:', $semesters);
    //         Log::info('Intake:', [$intake]);

    //         // Map over tasks and calculate statuses
    //         $tasksWithStatus = $studyPlan->tasks->map(function ($task) use ($semesters, $intake) {
    //             // Find the semester number for the task
    //             $taskSemesterNumber = collect($semesters)->firstWhere(function ($semester) use ($task) {
    //                 return in_array($task->id, $semester['tasks']);
    //             })['semester'] ?? null;

    //             if (!$taskSemesterNumber) {
    //                 Log::warning("Task {$task->id} is not associated with any semester.");
    //                 return [
    //                     'id' => $task->id,
    //                     'name' => $task->name,
    //                     'status' => 'unknown',
    //                 ];
    //             }

    //             // Get semester end date using the helper method
    //             $semesterEndDate = $this->getSemesterEndDate($taskSemesterNumber, $intake, $semesters);

    //             // Calculate task status
    //             $status = $task->determineStatus($semesterEndDate);

    //             Log::info("Task ID: {$task->id}, Status: {$status}");

    //             return [
    //                 'id' => $task->id,
    //                 'name' => $task->name,
    //                 'status' => $status,
    //             ];
    //         });

    //         // Return progress, track status, and task statuses
    //         return response()->json([
    //             'progress' => $studyPlan->progress,
    //             'track_status' => $studyPlan->student->track_status,
    //             'tasks' => $tasksWithStatus,
    //         ]);
    //     } catch (\Exception $e) {
    //         Log::error('Failed to fetch student progress: ' . $e->getMessage());
    //         return response()->json(['error' => 'Failed to fetch student progress'], 500);
    //     }
    // }

    public function broadcastRequestUpdate($progressUpdate, $message = null)
    {
        $student = Student::find($progressUpdate->student_id);
        $lecturer = Lecturer::where('id', $student->supervisor_id)->first();

        $currentUser = Auth::user();
        $currentUserId = $currentUser->role === 'admin' ? "shared" : $currentUser->id;
        $currentUserRole = $currentUser->role;

        $recipients = [
            [
                'role' => 'student',
                'id' => $student->id,
            ],
            [
                'role' => 'admin', // Shared identifier for all admins
                'id' => 'shared',  // Use 'shared' or similar identifier
            ],
        ];

        // Normalize roles
        $roleMapping = [
            'lecturer_both' => 'both',
            'lecturer_supervisor' => 'supervisor',
        ];

        if ($lecturer) {
            $normalizedRole = $roleMapping[$lecturer->role] ?? $lecturer->role; // Normalize lecturer role
            if (in_array($normalizedRole, ['supervisor', 'both'])) {
                $recipients[] = [
                    'role' => $normalizedRole,
                    'id' => $lecturer->id,
                ];
            }
        }

        logger('Broadcasting request update:', [
            'progressUpdateId' => $progressUpdate->id,
            'studentId' => $student->id,
            'recipients' => $recipients,
        ]);

        foreach ($recipients as $recipient) {
            $isCreatedByUser = ($recipient['id'] == $currentUserId && $recipient['role'] === $currentUserRole);

            $notificationData = [
                'progress_update_id' => $progressUpdate->id,
                'user_id' => $progressUpdate->student_id,
                'recipient_id' => $recipient['id'],
                'role' => $recipient['role'],
                'message' => $message ?? 'Request updated',
                'status' => $progressUpdate->status ?? 'Pending',
                'reason' => $progressUpdate->reason ?? null,
                'read_at' => $isCreatedByUser ? now() : null,
            ];

            Notification::create($notificationData);

            $eventData = [
                'id' => $progressUpdate->id,
                'status' => $progressUpdate->status ?? 'Pending',
                'reason' => $progressUpdate->reason ?? '',
                'progress_update_id' => $progressUpdate->id,
                'user_id' => $progressUpdate->student_id,
                'recipient_id' => $recipient['id'],
                'role' => $recipient['role'],
                'message' => $message ?? 'Request updated',
            ];

            event(new RequestNotification($eventData));
        }
    }

    public function updateProgress(Request $request, $studentId)
    {
        //Log::info('Request Data:', $request->all());
        // Validate the incoming request, including new fields
        $validatedData = $request->validate([
            'update_type' => 'required|string',
            'evidence' => 'nullable|file|mimes:jpeg,png,pdf,docx',
            'link' => 'nullable|string',
            'description' => 'nullable|string',
            'status' => 'nullable|string',
            'completion_date' => 'nullable|date',
            'cgpa' => 'nullable|numeric|min:0|max:4.00',
            'grade' => 'nullable|string|max:10',
            'research_topic' => 'nullable|string',
            'workshop_name' => 'nullable|string',
            'num_courses' => 'nullable|integer|min:1|max:5',
            'course_name_1' => 'nullable|string',
            'course_name_2' => 'nullable|string',
            'course_name_3' => 'nullable|string',
            'course_name_4' => 'nullable|string',
            'course_name_5' => 'nullable|string',
            'grade_1' => 'nullable|string|max:10',
            'grade_2' => 'nullable|string|max:10',
            'grade_3' => 'nullable|string|max:10',
            'grade_4' => 'nullable|string|max:10',
            'grade_5' => 'nullable|string|max:10',
            'supervisor_id' => 'nullable|exists:lecturers,id',
            'progress_status' => 'nullable|string',
            'num_semesters' => 'nullable|integer',
            'semesters' => 'required_if:update_type,change_study_plan|nullable|string',
            'max_sem' => 'required_if:update_type,extension_candidature_period|string',
            'residential_college' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'panels' => 'nullable|string',
            'chairperson' => 'nullable|string',
            'pd_date' => 'nullable|date',
            'pd_time' => 'nullable|string',
            'pd_venue' => 'nullable|string',
            'cd_date' => 'nullable|date',
            'cd_time' => 'nullable|string',
            'cd_venue' => 'nullable|string',
        ]);

        // Determine the user's role
        $user = $request->user();
        $isAdmin = $user->role === 'admin';
        $isStudent = $user->role === 'student';
        log::info('User Role:', [$user->role]);

        $studentID = $isStudent ? $user->id : $studentId;

        $approvalStatus = $isAdmin ? 1 : null;
        log::info('Approval Status:', [$approvalStatus]);
        log::info('Student ID from Route:', [$studentID]);

        $adminName = $request->input('admin_name', 'Admin');

        if ($request->hasFile('evidence')) {
            $file = $request->file('evidence'); // Get the file
            $evidencePath = $file->store('evidence', 'public'); // Save the file to storage

            // Capture the original file name
            $originalFileName = $file->getClientOriginalName();

            // Add both the file path and original name to the validated data
            $validatedData['evidence'] = $evidencePath;
            $validatedData['original_file_name'] = $originalFileName;
        }

        // Define the mapping of update types to task IDs
        $taskMap = [
            'bahasa_melayu_course' => 2,
            'core_courses' => 3,
            'elective_courses' => 4,
            'research_methodology_course' => 5,
            'proposal_defence' => 6,
            'candidature_defence' => 7,
            'dissertation_chapters_1_2_3' => 8,
            'dissertation_all_chapters' => 9,
            'dissertation_submission_examination' => 10,
            'dissertation_submission_correction' => 11,
            'committee_meeting' => 12,
            'jkit_correction_approval' => 13,
            'senate_approval' => 14,
            'appointment_supervisor_form' => 15,
            'residential_requirement' => 16,
            'update_status' => null, // No task ID
            'workshops_attended' => null, // No task ID
            'change_study_plan' => null, // No task ID
            'extension_candidature_period' => null, // No task ID
        ];

        // Determine task ID based on update type
        $taskId = $taskMap[$validatedData['update_type']] ?? null;

        // Insert progress update into the progress_updates table with the new fields
        $progressUpdate = ProgressUpdate::create([
            'student_id' => $studentID,
            'update_type' => $validatedData['update_type'],
            'task_id' => $taskId, // Include the task ID
            'status' => $validatedData['status'] ?? null,
            'evidence' => $validatedData['evidence'] ?? null,
            'link' => $validatedData['link'] ?? null,
            'description' => $validatedData['description'] ?? null,
            'completion_date' => $validatedData['completion_date'] ?? null,
            'cgpa' => $validatedData['cgpa'] ?? null,
            'grade' => $validatedData['grade'] ?? null,
            'research_topic' => $validatedData['research_topic'] ?? null,
            'workshop_name' => $validatedData['workshop_name'] ?? null,
            'num_courses' => $validatedData['num_courses'] ?? null,
            'course_name_1' => $validatedData['course_name_1'] ?? null,
            'course_name_2' => $validatedData['course_name_2'] ?? null,
            'course_name_3' => $validatedData['course_name_3'] ?? null,
            'course_name_4' => $validatedData['course_name_4'] ?? null,
            'course_name_5' => $validatedData['course_name_5'] ?? null,
            'grade_1' => $validatedData['grade_1'] ?? null,
            'grade_2' => $validatedData['grade_2'] ?? null,
            'grade_3' => $validatedData['grade_3'] ?? null,
            'grade_4' => $validatedData['grade_4'] ?? null,
            'grade_5' => $validatedData['grade_5'] ?? null,
            'supervisor_name' => $supervisorName ?? null,
            'progress_status' => $validatedData['progress_status'] ?? null,
            'updated_study_plan' => $validatedData['semesters'] ?? null,
            'max_sem' => $validatedData['max_sem'] ?? null,
            'residential_college' => $validatedData['residential_college'] ?? null,
            'start_date' => $validatedData['start_date'] ?? null,
            'end_date' => $validatedData['end_date'] ?? null,
            'admin_name' => $adminName,
            'original_file_name' => $validatedData['original_file_name'] ?? null,
            'approved' => $approvalStatus ?? null,
            'panels' => $validatedData['panels'] ?? null,
            'chairperson' => $validatedData['chairperson'] ?? null,
            'pd_date' => $validatedData['pd_date'] ?? null,
            'pd_time' => $validatedData['pd_time'] ?? null,
            'pd_venue' => $validatedData['pd_venue'] ?? null,
            'cd_date' => $validatedData['cd_date'] ?? null,
            'cd_time' => $validatedData['cd_time'] ?? null,
            'cd_venue' => $validatedData['cd_venue'] ?? null,
        ]);

        // // Always recalculate the current task
        // $this->updateCurrentTask($studentId);
        // $currentSemester = $request->input('currentSemester');
        // // Recalculate and update progress percentage
        // $this->calculateAndUpdateProgress($studentId, $currentSemester);

        // // Return success response
        // return response()->json(['message' => 'Progress updated successfully']);

        $currentSemester = $request->input('currentSemester');

        // Admin-specific actions (only update related models if admin is updating)
        if ($isAdmin) {
            $student = Student::find($progressUpdate->student_id);
            // Construct the message
            $message = "{$adminName} updated {$student->first_name} {$student->last_name}'s progress";
            $this->broadcastRequestUpdate((object) $progressUpdate, $message);

            $this->processAdminUpdate($validatedData, $studentID, $currentSemester);

            return response()->json(['message' => 'Progress update data created successfully']);
        }

        // If it's a student request, return a pending message
        if ($isStudent) {
            $studentName = "{$user->first_name} {$user->last_name}";
            $this->broadcastRequestUpdate($progressUpdate, "New request submitted by {$studentName}");
            return response()->json(['message' => 'Progress update request submitted successfully and is pending approval.']);
        }

        // Default fallback (should not be reached)
        return response()->json(['message' => 'Invalid request'], 400);
    }

    private function processAdminUpdate(array $validatedData, $studentId, $currentSemester)
    {
        $student = Student::find($studentId);
        if (!$student) {
            throw new \Exception('Student not found.');
        }

        if ($validatedData['update_type'] === 'change_study_plan') {
            // Validate that the study plan has the correct structure
            if (!isset($validatedData['semesters']) || empty($validatedData['semesters'])) {
                return response()->json(['message' => 'Semesters data is required for changing the study plan.'], 400);
            }

            $updatedStudyPlan = json_decode($validatedData['semesters'], true);

            if (!is_array($updatedStudyPlan) || empty($updatedStudyPlan)) {
                return response()->json(['message' => 'Invalid semesters structure'], 400);
            }

            // Optional: Validate that each semester object contains 'semester' and 'tasks' (if needed)
            foreach ($updatedStudyPlan as $semester) {
                if (!isset($semester['semester']) || !isset($semester['tasks']) || !is_array($semester['tasks'])) {
                    return response()->json(['message' => 'Invalid semester structure'], 400);
                }
            }

            // Find the student's study plan
            $studyPlan = StudyPlan::where('student_id', $studentId)->first();
            if (!$studyPlan) {
                return response()->json(['message' => 'Study plan not found'], 404);
            }

            // Update the study plan
            $studyPlan->semesters = json_encode($updatedStudyPlan); // Convert array to JSON
            $studyPlan->save();
        }

        // Handle `extension_candidature_period` updates
        if ($validatedData['update_type'] === 'extension_candidature_period') {
            if (!isset($validatedData['max_sem']) || empty($validatedData['max_sem'])) {
                return response()->json(['message' => 'New Max. Period of Candidature is required.'], 400);
            }

            // Update the student's `max_sem` field
            $student->max_sem = $validatedData['max_sem'];
            $student->save();
        }

        // Update supervisor information if a new supervisor has been selected
        if (isset($validatedData['supervisor_id'])) {
            // Get the supervisor's first name
            $supervisor = Lecturer::find($validatedData['supervisor_id']);
            if ($supervisor) {
                $supervisorName = $supervisor->first_name . ' ' . $supervisor->last_name; // Include supervisor name in progress update
                $student->supervisor_id = $validatedData['supervisor_id']; // Update supervisor_id
            }

            $student->save();
            log::info('Supervisor Updated:', [$supervisorName]);
        }

        // Update status if 'update_status' type
        if ($validatedData['update_type'] === 'update_status' && isset($validatedData['status'])) {
            $student->status = $validatedData['status'];
            $student->save();
        }

        // Update CGPA if 'core_courses' or 'elective_courses' type
        if (in_array($validatedData['update_type'], ['core_courses', 'elective_courses']) && isset($validatedData['cgpa'])) {
            $student->cgpa = $validatedData['cgpa'];
            $student->save();
        }

        // Update research topic if 'appointment_supervisor_form' type
        if ($validatedData['update_type'] === 'appointment_supervisor_form' && isset($validatedData['research_topic'])) {
            $student->research = $validatedData['research_topic'];
            $student->save();
        }

        // Update the workshops_attended column if a new workshop_name is provided
        if (isset($validatedData['workshop_name'])) {
            // Get the current workshops (if any) and append the new one
            $currentWorkshops = $student->workshops_attended ? explode(', ', $student->workshops_attended) : [];

            // Add the new workshop name to the list
            $currentWorkshops[] = $validatedData['workshop_name'];

            // Save the updated list back to the workshops_attended column
            $student->workshops_attended = implode(', ', $currentWorkshops);
            $student->save();
        }

        $this->updateCurrentTask($studentId);
        $this->calculateAndUpdateProgress($studentId, $currentSemester);

        return response()->json(['message' => 'Progress updated by admin successfully']);
    }

    private function calculateCurrentSemester()
    {
        // Get the current date
        $today = now();

        // Fetch all semesters from the database
        $semesters = Semester::all();

        // Find the semester that matches the current date
        $currentSemester = $semesters->first(function ($semester) use ($today) {
            return $today >= $semester->start_date && $today <= $semester->end_date;
        });

        if (!$currentSemester) {
            return null; // No current semester found
        }

        return [
            'semester' => $currentSemester->semester,
            'academic_year' => $currentSemester->academic_year,
        ];
    }

    private function calculateStudentSemester($intake, $currentSemester)
    {
        if (!$currentSemester || !$intake) {
            return null; // Missing data, return null
        }

        // Parse current semester and academic year
        $currentSem = $currentSemester['semester']; // 1 or 2
        $currentYearRange = $currentSemester['academic_year']; // E.g., "2024/2025"
        [$currentYearStart] = explode('/', $currentYearRange);

        // Parse intake semester and academic year
        [$intakeSem, $intakeYearRange] = explode(', ', $intake);
        [$intakeYearStart] = explode('/', $intakeYearRange);
        $intakeSemNumber = (int) filter_var($intakeSem, FILTER_SANITIZE_NUMBER_INT); // Extract number from "Sem 1" or "Sem 2"

        // Calculate the number of semesters completed
        $semesterCount = ($currentYearStart - $intakeYearStart) * 2;

        if ($currentSem === 2) {
            $semesterCount += 1; // Add one if we are in the second semester of the current year
        }

        if ($intakeSemNumber === 2) {
            $semesterCount -= 1; // Subtract one if the intake semester is the second semester
        }

        return $semesterCount + 1; // Add 1 to convert from 0-based index
    }

    public function approveUpdate($progressUpdateId)
    {
        $progressUpdate = ProgressUpdate::find($progressUpdateId);

        if (!$progressUpdate) {
            return response()->json(['message' => 'Invalid request.'], 400);
        }

        $admin = auth()->user();
        log::info('Admin:', [$admin]);
        $adminName = $admin->Name ?? 'Admin';

        // Update the approval status
        $progressUpdate->approved = 1;
        $progressUpdate->reason = null;
        $progressUpdate->admin_name = $adminName;
        $progressUpdate->save();

        // Calculate the current semester
        $currentSemesterData = $this->calculateCurrentSemester();
        $currentSemester = $currentSemesterData['semester'] ?? null;

        if (!$currentSemester) {
            return response()->json(['message' => 'Could not determine the current semester.'], 400);
        }

        // Fetch the student
        $student = Student::find($progressUpdate->student_id);
        if (!$student) {
            return response()->json(['message' => 'Student not found.'], 404);
        }
        $studentName = "{$student->first_name} {$student->last_name}";

        // Calculate the student's current semester
        $studentSemester = $this->calculateStudentSemester($student->intake, $currentSemesterData);

        // Process admin-specific updates
        $this->processAdminUpdate($progressUpdate->toArray(), $progressUpdate->student_id, $studentSemester);

        $this->broadcastRequestUpdate(
            $progressUpdate,
            "{$adminName} approved {$studentName}'s update request."
        );
        return response()->json(['message' => 'Request approved and progress updated.']);
    }

    public function rejectUpdate($progressUpdateId, Request $request)
    {
        log::info('Rejecting update for ID: ' . $progressUpdateId);
        log::info('Request Data: ', $request->all());

        $validatedData = $request->validate([
            'reason' => 'required|string',
        ]);

        $progressUpdate = ProgressUpdate::find($progressUpdateId);

        if (!$progressUpdate) {
            return response()->json(['message' => 'Invalid request.'], 400);
        }

        $admin = auth()->user();
        $adminName = $admin->name ?? 'Admin';

        $student = Student::find($progressUpdate->student_id);
        $studentName = $student ? "{$student->first_name} {$student->last_name}" : 'Student';

        // Update the approval status to rejected
        $progressUpdate->approved = 0;
        $progressUpdate->reason = $validatedData['reason'];
        $progressUpdate->save();

        $this->broadcastRequestUpdate(
            $progressUpdate,
            "{$adminName} rejected {$studentName}'s update request."
        );

        return response()->json(['message' => 'Request rejected.']);
    }

    public function pendingUpdate($progressUpdateId)
    {
        $progressUpdate = ProgressUpdate::find($progressUpdateId);

        if (!$progressUpdate) {
            return response()->json(['message' => 'Invalid request.'], 400);
        }

        // Get the admin's name
        $admin = auth()->user();
        $adminName = $admin->name ?? 'Admin';

        // Get the student's name
        $student = Student::find($progressUpdate->student_id);
        $studentName = $student ? "{$student->first_name} {$student->last_name}" : 'Student';

        // Update the approval status to rejected
        $progressUpdate->approved = null;
        $progressUpdate->reason = null;
        $progressUpdate->save();

        $this->broadcastRequestUpdate(
            $progressUpdate,
            "{$adminName} marked {$studentName}'s update request as pending."
        );

        return response()->json(['message' => 'Request pending.']);
    }

    public function updateProgressOriginal(Request $request, $studentId)
    {
        //Log::info('Request Data:', $request->all());
        // Validate the incoming request, including new fields
        $validatedData = $request->validate([
            'update_type' => 'required|string',
            'evidence' => 'nullable|file|mimes:jpeg,png,pdf,docx',
            'link' => 'nullable|string',
            'description' => 'nullable|string',
            'status' => 'nullable|string',
            'completion_date' => 'nullable|date',
            'cgpa' => 'nullable|numeric|min:0|max:4.00',
            'grade' => 'nullable|string|max:10',
            'research_topic' => 'nullable|string',
            'workshop_name' => 'nullable|string',
            'num_courses' => 'nullable|integer|min:1|max:5',
            'course_name_1' => 'nullable|string',
            'course_name_2' => 'nullable|string',
            'course_name_3' => 'nullable|string',
            'course_name_4' => 'nullable|string',
            'course_name_5' => 'nullable|string',
            'grade_1' => 'nullable|string|max:10',
            'grade_2' => 'nullable|string|max:10',
            'grade_3' => 'nullable|string|max:10',
            'grade_4' => 'nullable|string|max:10',
            'grade_5' => 'nullable|string|max:10',
            'supervisor_id' => 'nullable|exists:lecturers,id',
            'progress_status' => 'nullable|string',
            'num_semesters' => 'nullable|integer',
            'semesters' => 'required_if:update_type,change_study_plan|nullable|string',
            'max_sem' => 'required_if:update_type,extension_candidature_period|string',
            'residential_college' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
        ]);

        // Determine the user's role
        $user = $request->user(); // Get the authenticated user
        $isAdmin = $user->role === 'admin'; // Adjust based on your role logic
        $isStudent = $user->role === 'student'; // Adjust based on your role logic
        log::info('User Role:', [$user->role]);

        $approvalStatus = $isAdmin ? 1 : null;
        log::info('Approval Status:', [$approvalStatus]);

        // if ($validatedData['update_type'] === 'residential_requirement') {
        //     Log::info('Updating Residential Requirement:', [
        //         'residential_college' => $validatedData['residential_college'] ?? null,
        //         'start_date' => $validatedData['start_date'] ?? null,
        //         'end_date' => $validatedData['end_date'] ?? null,
        //     ]);
        // }

        // $validator = Validator::make($request->all(), [
        //     'update_type' => 'required|string',
        //     'semesters' => 'nullable|string',
        // ]);

        // if ($validator->fails()) {
        //     return response()->json(['errors' => $validator->errors()], 422);
        // }

        $adminName = $request->input('admin_name', 'Admin'); // Default to 'Admin' if not provided

        // Find the student
        $student = Student::find($studentId);
        if (!$student) {
            return response()->json(['message' => 'Student not found'], 404);
        }

        // Handle the file upload for 'evidence'
        // Handle the file upload for 'evidence'
        if ($request->hasFile('evidence')) {
            $file = $request->file('evidence'); // Get the file
            $evidencePath = $file->store('evidence', 'public'); // Save the file to storage

            // Capture the original file name
            $originalFileName = $file->getClientOriginalName();

            // Add both the file path and original name to the validated data
            $validatedData['evidence'] = $evidencePath;
            $validatedData['original_file_name'] = $originalFileName;
        }

        // Handle study plan updates
        if ($validatedData['update_type'] === 'change_study_plan') {
            // Validate that the study plan has the correct structure
            if (!isset($validatedData['semesters']) || empty($validatedData['semesters'])) {
                return response()->json(['message' => 'Semesters data is required for changing the study plan.'], 400);
            }

            $updatedStudyPlan = json_decode($validatedData['semesters'], true);

            if (!is_array($updatedStudyPlan) || empty($updatedStudyPlan)) {
                return response()->json(['message' => 'Invalid semesters structure'], 400);
            }

            // Optional: Validate that each semester object contains 'semester' and 'tasks' (if needed)
            foreach ($updatedStudyPlan as $semester) {
                if (!isset($semester['semester']) || !isset($semester['tasks']) || !is_array($semester['tasks'])) {
                    return response()->json(['message' => 'Invalid semester structure'], 400);
                }
            }

            // Find the student's study plan
            $studyPlan = StudyPlan::where('student_id', $studentId)->first();
            if (!$studyPlan) {
                return response()->json(['message' => 'Study plan not found'], 404);
            }

            // Update the study plan
            $studyPlan->semesters = json_encode($updatedStudyPlan); // Convert array to JSON
            $studyPlan->save();
        }

        // Handle `extension_candidature_period` updates
        if ($validatedData['update_type'] === 'extension_candidature_period') {
            if (!isset($validatedData['max_sem']) || empty($validatedData['max_sem'])) {
                return response()->json(['message' => 'New Max. Period of Candidature is required.'], 400);
            }

            // Update the student's `max_sem` field
            $student->max_sem = $validatedData['max_sem'];
            $student->save();
        }

        // Update supervisor information if a new supervisor has been selected
        if (isset($validatedData['supervisor_id'])) {
            // Get the supervisor's first name
            $supervisor = Lecturer::find($validatedData['supervisor_id']);
            if ($supervisor) {
                $supervisorName = $supervisor->first_name . ' ' . $supervisor->last_name; // Include supervisor name in progress update
                $student->supervisor_id = $validatedData['supervisor_id']; // Update supervisor_id
            }

            $student->save();
            log::info('Supervisor Updated:', [$supervisorName]);
        }

        // Define the mapping of update types to task IDs
        $taskMap = [
            'bahasa_melayu_course' => 2,
            'core_courses' => 3,
            'elective_courses' => 4,
            'research_methodology_course' => 5,
            'proposal_defence' => 6,
            'candidature_defence' => 7,
            'dissertation_chapters_1_2_3' => 8,
            'dissertation_all_chapters' => 9,
            'dissertation_submission_examination' => 10,
            'dissertation_submission_correction' => 11,
            'committee_meeting' => 12,
            'jkit_correction_approval' => 13,
            'senate_approval' => 14,
            'appointment_supervisor_form' => 15,
            'residential_requirement' => 16,
            'update_status' => null, // No task ID
            'workshops_attended' => null, // No task ID
            'change_study_plan' => null, // No task ID
            'extension_candidature_period' => null, // No task ID
        ];

        // Update status if 'update_status' type
        if ($validatedData['update_type'] === 'update_status' && isset($validatedData['status'])) {
            $student->status = $validatedData['status'];
            $student->save();
        }

        // Update CGPA if 'core_courses' or 'elective_courses' type
        if (in_array($validatedData['update_type'], ['core_courses', 'elective_courses']) && isset($validatedData['cgpa'])) {
            $student->cgpa = $validatedData['cgpa'];
            $student->save();
        }

        // Update research topic if 'appointment_supervisor_form' type
        if ($validatedData['update_type'] === 'appointment_supervisor_form' && isset($validatedData['research_topic'])) {
            $student->research = $validatedData['research_topic'];
            $student->save();
        }

        // Update the workshops_attended column if a new workshop_name is provided
        if (isset($validatedData['workshop_name'])) {
            // Get the current workshops (if any) and append the new one
            $currentWorkshops = $student->workshops_attended ? explode(', ', $student->workshops_attended) : [];

            // Add the new workshop name to the list
            $currentWorkshops[] = $validatedData['workshop_name'];

            // Save the updated list back to the workshops_attended column
            $student->workshops_attended = implode(', ', $currentWorkshops);
            $student->save();
        }

        // Determine task ID based on update type
        $taskId = $taskMap[$validatedData['update_type']] ?? null;

        // Insert progress update into the progress_updates table with the new fields
        ProgressUpdate::create([
            'student_id' => $student->id,
            'update_type' => $validatedData['update_type'],
            'task_id' => $taskId, // Include the task ID
            'status' => $validatedData['status'] ?? null,
            'evidence' => $validatedData['evidence'] ?? null,
            'link' => $validatedData['link'] ?? null,
            'description' => $validatedData['description'] ?? null,
            'completion_date' => $validatedData['completion_date'] ?? null,
            'cgpa' => $validatedData['cgpa'] ?? null,
            'grade' => $validatedData['grade'] ?? null,
            'research_topic' => $validatedData['research_topic'] ?? null,
            'workshop_name' => $validatedData['workshop_name'] ?? null,
            'num_courses' => $validatedData['num_courses'] ?? null,
            'course_name_1' => $validatedData['course_name_1'] ?? null,
            'course_name_2' => $validatedData['course_name_2'] ?? null,
            'course_name_3' => $validatedData['course_name_3'] ?? null,
            'course_name_4' => $validatedData['course_name_4'] ?? null,
            'course_name_5' => $validatedData['course_name_5'] ?? null,
            'grade_1' => $validatedData['grade_1'] ?? null,
            'grade_2' => $validatedData['grade_2'] ?? null,
            'grade_3' => $validatedData['grade_3'] ?? null,
            'grade_4' => $validatedData['grade_4'] ?? null,
            'grade_5' => $validatedData['grade_5'] ?? null,
            'supervisor_name' => $supervisorName ?? null,
            'progress_status' => $validatedData['progress_status'] ?? null,
            'updated_study_plan' => $validatedData['semesters'] ?? null,
            'max_sem' => $validatedData['max_sem'] ?? null,
            'residential_college' => $validatedData['residential_college'] ?? null,
            'start_date' => $validatedData['start_date'] ?? null,
            'end_date' => $validatedData['end_date'] ?? null,
            'admin_name' => $adminName,
            'original_file_name' => $validatedData['original_file_name'] ?? null,
            'approved' => $approvalStatus,
        ]);

        // // Always recalculate the current task
        // $this->updateCurrentTask($studentId);
        // $currentSemester = $request->input('currentSemester');
        // // Recalculate and update progress percentage
        // $this->calculateAndUpdateProgress($studentId, $currentSemester);

        // // Return success response
        // return response()->json(['message' => 'Progress updated successfully']);

        // Admin-specific actions (only update related models if admin is updating)
        if ($isAdmin) {
            // Perform actions like updating study plans, CGPA, etc.
            $this->updateCurrentTask($studentId);
            $currentSemester = $request->input('currentSemester');
            $this->calculateAndUpdateProgress($studentId, $currentSemester);

            return response()->json(['message' => 'Progress updated successfully']);
        }

        // If it's a student request, return a pending message
        if ($isStudent) {
            return response()->json(['message' => 'Progress update request submitted successfully and is pending approval.']);
        }

        // Default fallback (should not be reached)
        return response()->json(['message' => 'Invalid request'], 400);
    }
}
