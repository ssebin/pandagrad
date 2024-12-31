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
use App\Models\Program;
use App\Models\Intake;
use App\Events\RequestNotification;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use PhpOffice\PhpSpreadsheet\IOFactory;
use App\Mail\NewAccountNotification;
use Illuminate\Support\Facades\Mail;
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
            $query->where('program_id', $user->program_id); // Fetch all students in the program
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
        try {
            $validatedData = $this->validateStudent($request);

            // Hash the password
            $validatedData['password'] = Hash::make('password123');
            $validatedData['profile_pic'] = $validatedData['profile_pic'] ?? '/images/profile-pic.png';

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
            if ($request->filled('intake_id')) {
                $intake_id = $validatedData['intake_id'];
                $intake = Intake::find($intake_id);

                if (!$intake) {
                    // Handle the case where the intake is not found
                    return response()->json(['error' => 'Invalid intake ID'], 400);
                }

                // Calculate the max semester
                $maxSem = $this->calculateMaxSemester($intake);

                $student->max_sem = $maxSem;
            }
            $student->save();

            try {
                Mail::to($student->siswamail)->send(new NewAccountNotification($student->siswamail, 'student'));
                log::info('Email sent to ' . $student->siswamail);
            } catch (\Exception $e) {
                Log::error("Failed to send email to {$student->siswamail}: " . $e->getMessage());
            }

            return response()->json(['message' => 'Student added successfully', 'student' => $student], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            log::error('Validation error:', [$e->errors()]);
            return response()->json(['error' => 'Validation error', 'messages' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Registration failed', 'message' => $e->getMessage()], 500);
        }
    }


    public function batchCreate(Request $request)
    {
        try {
            // Validate the file input
            $request->validate([
                'file' => 'required|mimes:xlsx,xls', // Only Excel files are allowed
            ]);

            $file = $request->file('file');

            // Load the uploaded Excel file
            $spreadsheet = IOFactory::load($file->getRealPath());
            $sheet = $spreadsheet->getActiveSheet();
            $rows = $sheet->toArray(null, true, true, true);

            $students = [];
            $errors = [];
            $seenSiswamails = [];

            // Loop through rows (skipping the header)
            foreach ($rows as $index => $row) {
                //if ($index === 1) continue; // Skip the header row

                $siswamail = $row['A'] ?? null;

                Log::info("Processing Row {$index}: ", $row);

                // Validate each row
                if (!$siswamail || !str_ends_with($siswamail, '@siswa.um.edu.my')) {
                    $errors[] = "{$siswamail} (Row {$index}: invalid format)";
                    continue;
                }

                // Check for duplicates within the uploaded file
                if (in_array($siswamail, $seenSiswamails)) {
                    $errors[] = "{$siswamail} (Row {$index}: duplicated in the file)";
                    continue;
                }
                $seenSiswamails[] = $siswamail;

                // Check for duplicates in the database
                if (Student::where('siswamail', $siswamail)->exists()) {
                    $errors[] = "{$siswamail} (Row {$index}: duplicate in database)";
                    continue;
                }

                // Prepare student data
                $students[] = [
                    'siswamail' => $siswamail,
                    'password' => Hash::make('password123'), // Default password
                    'profile_pic' => '/images/profile-pic.png', // Default profile picture
                ];
            }

            // Insert valid students into the database
            if (!empty($students)) {
                Student::insert($students);

                // foreach ($students as $student) {
                //     try {
                //         Mail::to($student['siswamail'])->send(new NewAccountNotification($student['siswamail'], 'student'));
                //         log::info('Email sent to ' . $student['siswamail']);
                //     } catch (\Exception $e) {
                //         Log::error("Failed to send email to {$student['siswamail']}: " . $e->getMessage());
                //     }
                // }
            }

            log::info('Success Count:', [count($students)]);
            log::info('Error Count:', [count($errors)]);
            log::info('Errors:', [$errors]);

            // Return response
            return response()->json([
                'message' => 'Batch creation completed.',
                'success_count' => count($students),
                'error_count' => count($errors),
                'successful_entries' => $students, // Return the successfully added students
                'error_details' => $errors,       // Return the list of errors
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'An error occurred while processing the file: ' . $e->getMessage()], 500);
        }
    }

    public function show($id, Request $request)
    {
        $user = $request->user(); // Get the authenticated user
        $student = Student::find($id);

        //log::info('User:', [$user]);
        //log::info('Student:', [$student]);

        if (!$student) {
            return response()->json(['message' => 'Student not found'], 404);
        }

        // Admins can access all student details
        if ($user->role === 'admin') {
            return response()->json($student);
        }

        // Allow students to access only their own details
        if ($user->role === 'student') {
            //log::info('Student ID:', [$student->id]);
            //log::info('User ID:', [$user->id]);
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
            if ($student->program_id !== $user->program_id) {
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
        try {
            $student = Student::find($id);

            if (!$student) {
                return response()->json(['error' => 'Student not found'], 404);
            }

            $validatedData = $request->validate([
                'first_name' => 'nullable|string|max:255',
                'last_name' => 'nullable|string|max:255',
                'siswamail' => 'required|string|email|max:255|unique:students,siswamail,' . $student->id,
                'supervisor_id' => 'nullable|integer',
                'status' => 'nullable|string|max:255',
                'intake_id' => 'nullable|exists:intakes,id',
                'semester' => 'nullable|integer',
                'program_id' => 'nullable|exists:programs,id',
                'research' => 'nullable|string',
                'task' => 'nullable|string|max:255',
                'profile_pic' => 'nullable|string|max:255',
                'progress' => 'nullable|integer',
                'track_status' => 'nullable|string|max:255',
                'cgpa' => 'nullable|numeric|between:0,4.00',
                'matric_number' => 'nullable|string|max:255|unique:students,matric_number,' . $student->id,
                'remarks' => 'nullable|string',
            ]);

            // Check if the intake has been updated
            if ($validatedData['intake_id'] !== $student->intake_id) {
                $intake_id = $validatedData['intake_id'];

                // Fetch the Intake record
                $intake = Intake::find($intake_id);

                if (!$intake) {
                    // Handle the case where the intake is not found
                    return response()->json(['error' => 'Invalid intake ID'], 400);
                }

                // Calculate the max semester
                $maxSem = $this->calculateMaxSemester($intake);

                // Recalculate the max_sem based on the new intake
                $validatedData['max_sem'] = $maxSem;
            }

            $student->update($validatedData);

            return response()->json(['message' => 'Student updated successfully']);
        } catch (\Illuminate\Validation\ValidationException $e) {
            log::error('Validation error:', [$e->errors()]);
            return response()->json(['error' => 'Validation error', 'messages' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Registration failed', 'message' => $e->getMessage()], 500);
        }
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
            'siswamail' => 'required|string|email|max:255|unique:students,siswamail',
            'supervisor_id' => 'nullable|integer',
            'status' => 'nullable|string|max:255',
            'intake_id' => 'nullable|exists:intakes,id',
            'semester' => 'nullable|integer',
            'program_id' => 'nullable|exists:programs,id',
            'research' => 'nullable|string',
            'task' => 'nullable|string|max:255',
            'profile_pic' => 'nullable|string|max:255',
            'progress' => 'nullable|integer',
            'track_status' => 'nullable|string|max:255',
            'cgpa' => 'nullable|numeric|between:0,4.00',
            'matric_number' => 'nullable|string|max:255|unique:students,matric_number',
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
            // Get the Siswamail from the request (already appended from localStorage)
            $siswamail = $request->input('siswamail');

            // Validate that siswamail is present
            if (!$siswamail) {
                return response()->json(['error' => 'Siswamail is required'], 400);
            }

            // Find the student based on siswamail
            $student = Student::where('siswamail', $siswamail)->first();

            // Check if the student exists
            if (!$student) {
                return response()->json(['error' => 'Student not found'], 404);
            }

            // Validate the incoming request
            $validatedData = $request->validate([
                'first_name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
                'matric_number' => 'required|string|max:255|unique:students,matric_number,' . $student->id,
                'intake_id' => 'nullable|exists:intakes,id',
                'program_id' => 'nullable|exists:programs,id',
                'nationality' => 'required|string|max:255',
                'profile_pic' => 'nullable|file|image|max:2048', // optional
            ]);

            // Save the profile picture if provided
            if ($request->hasFile('profile_pic')) {
                $path = $request->file('profile_pic')->store('profile_pics', 'public');
                $validatedData['profile_pic'] = $path;
            } else {
                // Set default profile picture path
                $validatedData['profile_pic'] = '/images/profile-pic.png'; // Adjust the path as needed
            }

            // Get the Siswamail from the request (already appended from localStorage)
            // $siswamail = $request->input('siswamail');

            // // Find the student based on siswamail
            // $student = Student::where('siswamail', $siswamail)->first();

            // // Check if the student exists
            // if (!$student) {
            //     return response()->json(['error' => 'Student not found'], 404);
            // }

            // Assuming you have validated 'intake_id' in your $validatedData
            $intake_id = $validatedData['intake_id'];

            // Fetch the Intake record
            $intake = Intake::find($intake_id);

            if (!$intake) {
                // Handle the case where the intake is not found
                return response()->json(['error' => 'Invalid intake ID'], 400);
            }

            // Calculate the max semester
            $maxSem = $this->calculateMaxSemester($intake);

            // Update the student data
            $student->fill($validatedData);
            $student->max_sem = $maxSem; // Set the calculated max semester
            $student->save();

            // Fetch the updated student data
            $updatedStudent = Student::where('siswamail', $siswamail)
                ->with('supervisor') // Include relationships if necessary
                ->first();

            // Return the updated student data
            return response()->json($updatedStudent, 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            log::error('Validation error:', [$e->errors()]);
            return response()->json(['error' => 'Validation error', 'messages' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Registration failed', 'message' => $e->getMessage()], 500);
        }
    }

    private function calculateMaxSemester($intake)
    {

        $semester = (int)$intake->intake_semester; // 1 or 2
        $intakeYear = $intake->intake_year; // e.g., '2023/2024'

        // Split the year range into start and end years
        [$startYear, $endYear] = explode('/', $intakeYear);
        $startYear = (int)$startYear;
        $endYear = (int)$endYear;

        // Calculate the semester that is 8 semesters after the intake
        // Since the intake semester counts as the first semester,
        // we need to move forward 7 semesters to reach the "max semester"

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
                    $query->where('student_id', $id) // Filter progress updates by student ID
                        ->where('approved', 1); // Only include approved updates
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

    public function calculateAndUpdateProgress($studentId, $currentSemester)
    {
        try {
            // Fetch the study plan and associated data
            $studyPlan = StudyPlan::with([
                'tasks.progressUpdates' => function ($query) use ($studentId) {
                    $query->where('student_id', $studentId);
                },
            ])->where('student_id', $studentId)->first();

            if (!$studyPlan) {
                return; // No study plan, nothing to calculate
            }

            Log::info('Current Semester:', [$currentSemester]);

            // Get the intake of the student
            $student = $studyPlan->student()->with('intake')->first();

            if (!$student) {
                Log::error('Student not found.');
                return response()->json(['error' => 'Student not found'], 404);
            }

            $intake = $student->intake;

            if (!$intake) {
                Log::error('Intake not found.');
                return response()->json(['error' => 'Intake not found'], 404);
            }

            // Get all semesters from the database
            $semesters = Semester::all();

            // Decode the semesters from the study plan
            $studyPlanSemesters = json_decode($studyPlan->semesters, true);

            // Initialize total task weight and completed task weight
            $totalTaskWeight = 0;
            $completedTaskWeight = 0;

            $delayedTasks = [
                'slightlyDelayed' => false,
                'veryDelayed' => false,
            ];

            // Build a mapping from task ID to earliest semester number
            $taskSemesterMap = [];

            foreach ($studyPlanSemesters as $studyPlanSemester) {
                $semesterNumber = $studyPlanSemester['semester'];

                foreach ($studyPlanSemester['tasks'] as $taskId) {
                    if (!isset($taskSemesterMap[$taskId]) || $semesterNumber < $taskSemesterMap[$taskId]) {
                        $taskSemesterMap[$taskId] = $semesterNumber;
                    }
                }
            }

            // Collect unique task IDs
            $uniqueTaskIds = array_keys($taskSemesterMap);

            // Calculate total task weight
            foreach ($uniqueTaskIds as $taskId) {
                $task = $studyPlan->tasks->find($taskId);

                if (!$task) {
                    Log::warning("Task ID {$taskId} not found in study plan tasks.");
                    continue;
                }

                // Add the task's weight to totalTaskWeight
                $totalTaskWeight += $task->task_weight ?? 0;
                Log::info('Task Name:', [$task->name]);
            }

            // Loop to determine completed tasks and sum their weights
            foreach ($uniqueTaskIds as $taskId) {
                $task = $studyPlan->tasks->find($taskId);

                if (!$task) {
                    Log::warning("Task ID {$taskId} not found in study plan tasks.");
                    continue;
                }

                $semesterNumber = $taskSemesterMap[$taskId];

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

                // Get the latest update for this task
                $latestUpdate = $task->progressUpdates->sortByDesc('updated_at')->first();
                $taskStatus = $task->determineStatus($semesterEndDate);
                Log::info('Task Name:', [$task->name]);
                Log::info('Task Status:', [$taskStatus]);

                // Check for delayed pending tasks
                if ($taskStatus === 'delayedPending') {
                    if ($semesterNumber < $currentSemester - 1) {
                        $delayedTasks['veryDelayed'] = true;
                        Log::info('Very Delayed Task:', [$task->name]);
                    } elseif ($semesterNumber === $currentSemester - 1) {
                        $delayedTasks['slightlyDelayed'] = true;
                        Log::info('Slightly Delayed Task:', [$task->name]);
                    }
                }

                if ($latestUpdate && $latestUpdate->approved === 1) {
                    // If task is completed, add its weight to completedTaskWeight
                    if (in_array($taskStatus, ['onTrackCompleted', 'delayedCompleted'])) {
                        $completedTaskWeight += $task->task_weight ?? 0;
                        Log::info('Completed Task:', [$task->name]);
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

            // Calculate progress percentage based on task weights
            $progressPercentage = $totalTaskWeight > 0 ? intval(($completedTaskWeight / $totalTaskWeight) * 100) : 0;
            Log::info('Completed Task Weight:', [$completedTaskWeight]);
            Log::info('Total Task Weight:', [$totalTaskWeight]);
            Log::info('Progress Percentage:', [$progressPercentage]);

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

    // public function calculateAndUpdateProgress($studentId, $currentSemester)
    // {
    //     try {
    //         $studyPlan = StudyPlan::with([
    //             'tasks.progressUpdates' => function ($query) use ($studentId) {
    //                 $query->where('student_id', $studentId);
    //             },
    //         ])->where('student_id', $studentId)->first();

    //         if (!$studyPlan) {
    //             return; // No study plan, nothing to calculate
    //         }

    //         // Log::info('Study Plan:', [$studyPlan]);
    //         // Log::info('Current Semester:', [$currentSemester]);

    //         // Get the intake of the student
    //         $student = $studyPlan->student()->with('intake')->first();

    //         if (!$student) {
    //             Log::error('Student not found.');
    //             return response()->json(['error' => 'Student not found'], 404);
    //         }

    //         $intake = $student->intake;

    //         if (!$intake) {
    //             Log::error('Intake not found.');
    //             return response()->json(['error' => 'Intake not found'], 404);
    //         }

    //         // Get all semesters from the database
    //         $semesters = Semester::all();

    //         // Decode the semesters from the study plan
    //         $studyPlanSemesters = json_decode($studyPlan->semesters, true);

    //         // Total tasks
    //         // $totalTasks = collect($studyPlanSemesters)->flatMap(function ($semester) {
    //         //     return $semester['tasks'];
    //         // })->count();

    //         // Calculate task statuses and progress
    //         //$fullyCompletedTasks = 0;
    //         $delayedTasks = [
    //             'slightlyDelayed' => false,
    //             'veryDelayed' => false,
    //         ];

    //         $totalTaskWeight = 0;
    //         $completedTaskWeight = 0;

    //         // Build a mapping from task ID to earliest semester number
    //         $taskSemesterMap = [];

    //         foreach ($studyPlanSemesters as $studyPlanSemester) {
    //             $semesterNumber = $studyPlanSemester['semester'];

    //             // Calculate the academic year and type (odd/even) of the semester
    //             [$academicYearStart, $databaseSemester] = $this->getAcademicYearAndDatabaseSemester($semesterNumber, $intake);

    //             // Find the corresponding semester from the database
    //             $semester = $semesters->firstWhere(function ($sem) use ($academicYearStart, $databaseSemester) {
    //                 return $sem->academic_year === "{$academicYearStart}/" . ($academicYearStart + 1) &&
    //                     $sem->semester == $databaseSemester;
    //             });

    //             if (!$semester) {
    //                 Log::warning("Semester {$semesterNumber} not found in database.");
    //                 continue;
    //             }

    //             $semesterEndDate = $semester->end_date;

    //             foreach ($studyPlanSemester['tasks'] as $taskId) {
    //                 // Find the task in the study plan's tasks
    //                 $task = $studyPlan->tasks->find($taskId);

    //                 if (!$task) {
    //                     Log::warning("Task ID {$taskId} not found in study plan tasks.");
    //                     continue;
    //                 }

    //                 // Add the task's weight to totalTaskWeight
    //                 $totalTaskWeight += $task->task_weight ?? 0;
    //                 log::info('Task: ', [$task->name]);

    //                 // Get the latest update for this task
    //                 $latestUpdate = $task->progressUpdates->sortByDesc('updated_at')->first();

    //                 // Skip the task if there are no updates
    //                 if (!$latestUpdate) {
    //                     continue;
    //                 }

    //                 // Check the status of the latest update
    //                 if ($latestUpdate->approved === 1) {
    //                     // Determine task status
    //                     $taskStatus = $task->determineStatus($semesterEndDate);
    //                     // log::info('Task Status:', [$taskStatus]);

    //                     // Count completed tasks
    //                     if (in_array($taskStatus, ['onTrackCompleted', 'delayedCompleted'])) {
    //                         $completedTaskWeight += $task->task_weight ?? 0;
    //                         log::info('Fully Completed Task:', [$task->name]);
    //                     }

    //                     // Check for delayed pending tasks
    //                     if ($taskStatus === 'delayedPending') {
    //                         if ($semesterNumber < $currentSemester - 1) {
    //                             $delayedTasks['veryDelayed'] = true;
    //                             log::info('Very Delayed Pending Task:', [$task->name]);
    //                         } elseif ($semesterNumber === $currentSemester - 1) {
    //                             $delayedTasks['slightlyDelayed'] = true;
    //                             log::info('Slightly Delayed Pending Task:', [$task->name]);
    //                         }
    //                     }
    //                 }
    //             }
    //             // Handle cases where the student is beyond the study plan
    //             $lastStudyPlanSemester = count($studyPlanSemesters);
    //             if ($currentSemester > $lastStudyPlanSemester) {
    //                 foreach ($studyPlanSemesters as $studyPlanSemester) {
    //                     $semesterNumber = $studyPlanSemester['semester'];

    //                     foreach ($studyPlanSemester['tasks'] as $taskId) {
    //                         $task = $studyPlan->tasks->find($taskId);

    //                         if (!$task || $task->progressUpdates->isEmpty()) {
    //                             continue;
    //                         }

    //                         $latestUpdate = $task->progressUpdates->sortByDesc('updated_at')->first();
    //                         if ($latestUpdate->approved !== 1) {
    //                             continue;
    //                         }

    //                         if ($semesterNumber === $lastStudyPlanSemester) {
    //                             $delayedTasks['slightlyDelayed'] = true;
    //                         } elseif ($semesterNumber < $lastStudyPlanSemester) {
    //                             $delayedTasks['veryDelayed'] = true;
    //                         }
    //                     }
    //                 }
    //             }
    //         }

    //         // Determine track_status
    //         $trackStatus = 'On Track';
    //         if ($delayedTasks['veryDelayed']) {
    //             $trackStatus = 'Very Delayed';
    //         } elseif ($delayedTasks['slightlyDelayed']) {
    //             $trackStatus = 'Slightly Delayed';
    //         }

    //         log::info('Total Task Weight:', [$totalTaskWeight]);
    //         log::info('Completed Task Weight:', [$completedTaskWeight]);

    //         // Calculate progress percentage
    //         $progressPercentage = $totalTaskWeight > 0 ? intval(($completedTaskWeight / $totalTaskWeight) * 100) : 0;

    //         log::info('Progrss Percentage:', [$progressPercentage]);

    //         // Update the student's progress and track_status
    //         Student::where('id', $studentId)->update([
    //             'progress' => $progressPercentage,
    //             'track_status' => $trackStatus,
    //         ]);

    //         Log::info("Progress updated for Student ID {$studentId}: {$progressPercentage}% - {$trackStatus}");
    //     } catch (\Exception $e) {
    //         Log::error('Failed to calculate progress: ' . $e->getMessage());
    //     }
    // }

    private function getAcademicYearAndDatabaseSemester($semesterNumber, $intake)
    {
        if (!$intake) {
            Log::error('Missing intake data.');
            return [null, null];
        }

        // Extract intake semester number and intake year
        $intakeSemesterNumber = (int) $intake->intake_semester; // 1 or 2
        $intakeYearRange = $intake->intake_year; // e.g., '2023/2024'

        // Extract the starting year of the intake academic year
        [$intakeYearStart] = explode('/', $intakeYearRange);
        $intakeYearStart = (int) $intakeYearStart;

        // Calculate total semesters passed since intake
        $totalSemestersPassed = ($semesterNumber - 1);

        // Calculate the sequence number from the intake semester
        $intakeSemesterSequence = $intakeSemesterNumber - 1; // 0 for Sem 1, 1 for Sem 2

        // Total semester sequence number
        $totalSemesterSequenceNumber = $intakeSemesterSequence + $totalSemestersPassed;

        // Calculate the academic year offset
        $yearOffset = floor($totalSemesterSequenceNumber / 2); // Every 2 semesters = 1 year

        // Determine the academic year start
        $academicYearStart = $intakeYearStart + $yearOffset;

        // Determine the semester number in the current academic year
        $databaseSemester = ($totalSemesterSequenceNumber % 2) + 1; // 1 or 2

        return [$academicYearStart, $databaseSemester];
    }

    // private function getAcademicYearAndDatabaseSemester($semesterNumber, $intake)
    // {
    //     if (!$intake) {
    //         Log::error('Missing intake data.');
    //         return [null, null];
    //     }

    //     // Extract intake semester and academic year
    //     [$intakeSemester, $intakeYearRange] = explode(', ', $intake);
    //     [$intakeYearStart] = explode('/', $intakeYearRange);
    //     $intakeYearStart = (int) $intakeYearStart;
    //     $intakeSemesterNumber = (int) explode(' ', $intakeSemester)[1]; // 1 for Sem 1, 2 for Sem 2

    //     // Calculate total semesters passed
    //     $totalSemestersPassed = ($semesterNumber - 1) + ($intakeSemesterNumber - 1);

    //     // Determine the academic year offset
    //     $yearOffset = floor($totalSemestersPassed / 2); // Every 2 semesters = 1 year
    //     $academicYearStart = $intakeYearStart + $yearOffset;

    //     // Determine if it's an odd (1) or even (2) semester
    //     $databaseSemester = ($totalSemestersPassed % 2 === 0) ? 1 : 2;

    //     return [$academicYearStart, $databaseSemester];
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

        // Determine notification type based on the message content
        $notificationType = $this->determineNotificationType($message);

        logger('Broadcasting request update:', [
            'progressUpdateId' => $progressUpdate->id,
            'studentId' => $student->id,
            'recipients' => $recipients,
        ]);

        foreach ($recipients as $recipient) {
            //$isCreatedByUser = ($recipient['id'] == $currentUserId && $recipient['role'] === $currentUserRole);

            $isCreatedByUser = false;

            // Handle Admins
            if ($recipient['role'] === 'admin' && $recipient['id'] === 'shared' && $currentUser->role === 'admin') {
                $isCreatedByUser = true;
            }

            // Handle Lecturers with normalized roles
            $normalizedCurrentUserRole = $roleMapping[$currentUser->role] ?? $currentUser->role;

            if ($recipient['id'] == $currentUserId && $recipient['role'] === $normalizedCurrentUserRole) {
                $isCreatedByUser = true;
            }

            log::info('Recipient:', [$recipient]);
            log::info('Is Created By User:', [$isCreatedByUser]);

            $notificationData = [
                'progress_update_id' => $progressUpdate->id,
                'user_id' => $progressUpdate->student_id,
                'recipient_id' => $recipient['id'],
                'role' => $recipient['role'],
                'message' => $message ?? 'Request updated',
                'status' => $progressUpdate->status ?? 'Pending',
                'reason' => $progressUpdate->reason ?? null,
                'type' => $notificationType,
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
                'type' => $notificationType,
            ];

            event(new RequestNotification($eventData));
        }
    }

    private function determineNotificationType($message)
    {
        if (str_contains($message, 'approved')) {
            return 'success';
        } elseif (str_contains($message, 'pending')) {
            return 'warning';
        } elseif (str_contains($message, 'rejected')) {
            return 'error';
        } elseif (str_contains($message, 'directly updated')) {
            return 'info';
        } elseif (str_contains($message, 'New request submitted')) {
            return 'request';
        }

        return 'info'; // Default to info
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

        if (isset($validatedData['supervisor_id'])) {
            // Get the supervisor's first name
            $supervisor = Lecturer::find($validatedData['supervisor_id']);
            if ($supervisor) {
                $supervisorName = $supervisor->first_name . ' ' . $supervisor->last_name; // Include supervisor name in progress update
            }
            log::info('Supervisor Updated:', [$supervisorName]);
        }

        // Define the mapping of update types to task IDs
        // $taskMap = [
        //     'bahasa_melayu_course' => 2,
        //     'core_courses' => 3,
        //     'elective_courses' => 4,
        //     'research_methodology_course' => 5,
        //     'proposal_defence' => 6,
        //     'candidature_defence' => 7,
        //     'dissertation_chapters_1_2_3' => 8,
        //     'dissertation_all_chapters' => 9,
        //     'dissertation_submission_examination' => 10,
        //     'dissertation_submission_correction' => 11,
        //     'committee_meeting' => 12,
        //     'jkit_correction_approval' => 13,
        //     'senate_approval' => 14,
        //     'appointment_supervisor_form' => 15,
        //     'residential_requirement' => 16,
        //     'update_status' => null, // No task ID
        //     'workshops_attended' => null, // No task ID
        //     'change_study_plan' => null, // No task ID
        //     'extension_candidature_period' => null, // No task ID
        // ];

        // // Determine task ID based on update type
        // $taskId = $taskMap[$validatedData['update_type']] ?? null;

        $notMappedUpdateTypes = [
            'update_status',
            'workshops_attended',
            'change_study_plan',
            'extension_candidature_period',
        ];

        if (in_array($validatedData['update_type'], $notMappedUpdateTypes)) {
            $taskId = null;
        } else {
            // Fetch the student's study plan
            $studyPlan = StudyPlan::where('student_id', $studentId)->first();

            if ($studyPlan) {
                // Decode the 'semesters' JSON to get an array
                $semesters = json_decode($studyPlan->semesters, true);

                if (is_array($semesters)) {
                    // Collect all task IDs from the semesters
                    $taskIds = collect($semesters)
                        ->pluck('tasks')       // Get arrays of task IDs from each semester
                        ->flatten()            // Flatten into a single array
                        ->unique()             // Remove duplicates
                        ->filter(function ($value) {
                            return !empty($value) && is_numeric($value);
                        })
                        ->map(function ($id) {
                            return intval($id);
                        })
                        ->toArray();

                    // Fetch tasks with these IDs
                    $tasks = Task::whereIn('id', $taskIds)->get();

                    // Now find the task matching the 'unique_identifier'
                    $task = $tasks->firstWhere('unique_identifier', $validatedData['update_type']);

                    if ($task) {
                        $taskId = $task->id;
                    } else {
                        // Task not found in study plan
                        return response()->json(['error' => 'Task not found in student\'s study plan'], 400);
                    }
                } else {
                    // Semesters data is invalid
                    return response()->json(['error' => 'Invalid study plan data'], 400);
                }
            } else {
                // No study plan found
                return response()->json(['error' => 'Student has no study plan'], 400);
            }
        }

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
            'supervisor_id' => $validatedData['supervisor_id'] ?? null,
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
            $message = "{$adminName} directly updated {$student->first_name} {$student->last_name}'s progress";
            $this->broadcastRequestUpdate((object) $progressUpdate, $message);

            $this->processAdminUpdate($validatedData, $studentID, $currentSemester, $progressUpdate->id);

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

    private function processAdminUpdate(array $validatedData, $studentId, $currentSemester, $progressUpdateId)
    {
        $student = Student::find($studentId);
        if (!$student) {
            throw new \Exception('Student not found.');
        }

        $rollbackData = [];

        if ($validatedData['update_type'] === 'change_study_plan') {
            // Validate that the study plan has the correct structure
            if (!isset($validatedData['semesters']) || empty($validatedData['semesters'])) {
                log::error('Semesters data is required for changing the study plan.');
                return response()->json(['message' => 'Semesters data is required for changing the study plan.'], 400);
            }

            $updatedStudyPlan = json_decode($validatedData['semesters'], true);
            log::info('Updated Study Plan:', [$updatedStudyPlan]);

            if (!is_array($updatedStudyPlan) || empty($updatedStudyPlan)) {
                log::error('Invalid semesters structure');
                return response()->json(['message' => 'Invalid semesters structure'], 400);
            }

            // Find the student's study plan
            $studyPlan = StudyPlan::where('student_id', $studentId)->first();
            log::info('Study Plan:', [$studyPlan]);
            if (!$studyPlan) {
                log::error('Study plan not found');
                return response()->json(['message' => 'Study plan not found'], 404);
            }

            // --- Start of code to handle task ID updates ---

            // Step 1: Fetch the old tasks associated with the study plan before changes
            $oldTasks = $studyPlan->tasks()->get();

            // Build a mapping of unique_identifier to old task ID
            $oldTaskMap = $oldTasks->mapWithKeys(function ($task) {
                return [$task->unique_identifier => $task->id];
            });

            $rollbackData['study_plan'] = $studyPlan->semesters;
            $rollbackData['old_task_ids'] = $oldTaskMap; // Stores unique_identifier => old_task_id

            // Update the study plan
            $studyPlan->semesters = json_encode($updatedStudyPlan); // Convert array to JSON
            log::info('Updated Study Plan:', [$studyPlan->semesters]);
            // Assuming $studyPlan is your StudyPlan model instance
            // Extract task IDs from $updatedStudyPlan (which is an array)
            $newTaskIds = collect($updatedStudyPlan)
                ->pluck('tasks')    // Get the lists of tasks arrays
                ->flatten()         // Flatten into one list
                ->filter()          // Remove nulls and empty values
                ->filter(function ($value) {
                    return !empty($value) && is_numeric($value) && intval($value) > 0;
                })
                ->map(function ($id) {
                    return intval($id);
                })
                ->unique();
            // Check if $newTaskIds is not empty
            if ($newTaskIds->isEmpty()) {
                Log::error('No valid task IDs found in the updated study plan.');
                return response()->json(['message' => 'No valid task IDs found in the updated study plan.'], 400);
            }
            // Sync the tasks in the pivot table
            $studyPlan->tasks()->sync($newTaskIds->all());
            $studyPlan->save();

            // Step 3: Fetch the new tasks associated with the updated study plan
            $newTasks = $studyPlan->tasks()->get();

            // Build a mapping of unique_identifier to new task ID
            $newTaskMap = $newTasks->mapWithKeys(function ($task) {
                return [$task->unique_identifier => $task->id];
            });

            // Step 4: Build the mapping of old task IDs to new task IDs via unique_identifier
            $taskIdMapping = []; // old_task_id => new_task_id
            foreach ($oldTaskMap as $unique_identifier => $oldTaskId) {
                if (isset($newTaskMap[$unique_identifier])) {
                    $newTaskId = $newTaskMap[$unique_identifier];
                    $taskIdMapping[$oldTaskId] = $newTaskId;
                }
            }
            // Step 5: Update the progress_updates to reference the new task IDs
            foreach ($taskIdMapping as $oldTaskId => $newTaskId) {
                ProgressUpdate::where('student_id', $studentId)
                    ->where('task_id', $oldTaskId)
                    ->update(['task_id' => $newTaskId]);
            }

            // Save rollback data for progress updates
            $rollbackData['task_id_mapping'] = $taskIdMapping;
        }

        // Handle `extension_candidature_period` updates
        if ($validatedData['update_type'] === 'extension_candidature_period') {
            if (!isset($validatedData['max_sem']) || empty($validatedData['max_sem'])) {
                return response()->json(['message' => 'New Max. Period of Candidature is required.'], 400);
            }

            $rollbackData['max_sem'] = $student->max_sem;
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
                $rollbackData['supervisor_id'] = $student->supervisor_id;
                $student->supervisor_id = $validatedData['supervisor_id']; // Update supervisor_id
            }

            $student->save();
            log::info('Supervisor Updated:', [$supervisorName]);
        }

        // Update status if 'update_status' type
        if ($validatedData['update_type'] === 'update_status' && isset($validatedData['status'])) {
            $rollbackData['status'] = $student->status;
            $student->status = $validatedData['status'];
            $student->save();
        }

        // Update CGPA if 'core_courses' or 'elective_courses' type
        if (in_array($validatedData['update_type'], ['core_courses', 'elective_courses']) && isset($validatedData['cgpa'])) {
            $rollbackData['cgpa'] = $student->cgpa;
            $student->cgpa = $validatedData['cgpa'];
            $student->save();
        }

        // Update research topic if 'appointment_supervisor_form' type
        if ($validatedData['update_type'] === 'appointment_supervisor_form' || $validatedData['update_type'] === 'submission_of_appointment_of_supervisor_form') {
            if (isset($validatedData['research_topic'])) {
                $rollbackData['research'] = $student->research;
                $student->research = $validatedData['research_topic'];
                $student->save();
            }
        }

        // Update the workshops_attended column if a new workshop_name is provided
        if (isset($validatedData['workshop_name'])) {
            // Get the current workshops (if any) and append the new one
            $currentWorkshops = $student->workshops_attended ? explode(', ', $student->workshops_attended) : [];
            $rollbackData['workshops_attended'] = $currentWorkshops;

            // Add the new workshop name to the list
            $currentWorkshops[] = $validatedData['workshop_name'];

            // Save the updated list back to the workshops_attended column
            $student->workshops_attended = implode(', ', $currentWorkshops);
            $student->save();
        }

        $progressUpdate = ProgressUpdate::find($progressUpdateId);
        if ($progressUpdate) {
            $progressUpdate->rollback_data = json_encode($rollbackData); // Save rollback data
            $progressUpdate->save();
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
        $currentSem = (int) $currentSemester['semester']; // 1 or 2
        $currentYearRange = $currentSemester['academic_year']; // E.g., "2024/2025"
        [$currentYearStart] = explode('/', $currentYearRange);
        $currentYearStart = (int) $currentYearStart;

        // Extract intake semester and academic year from the Intake model
        $intakeSemNumber = (int) $intake->intake_semester; // 1 or 2
        $intakeYearRange = $intake->intake_year; // e.g., '2023/2024'
        [$intakeYearStart] = explode('/', $intakeYearRange);
        $intakeYearStart = (int) $intakeYearStart;

        // Calculate the number of semesters completed
        $semesterCount = ($currentYearStart - $intakeYearStart) * 2;

        if ($currentSem == 2) {
            $semesterCount += 1; // Add one if we are in the second semester of the current year
        }

        if ($intakeSemNumber == 2) {
            $semesterCount -= 1; // Subtract one if the intake semester is the second semester
        }

        return $semesterCount + 1; // Add 1 to convert from 0-based index to human-readable semester number
    }

    // private function calculateStudentSemester($intake, $currentSemester)
    // {
    //     if (!$currentSemester || !$intake) {
    //         return null; // Missing data, return null
    //     }

    //     // Parse current semester and academic year
    //     $currentSem = $currentSemester['semester']; // 1 or 2
    //     $currentYearRange = $currentSemester['academic_year']; // E.g., "2024/2025"
    //     [$currentYearStart] = explode('/', $currentYearRange);

    //     // Parse intake semester and academic year
    //     [$intakeSem, $intakeYearRange] = explode(', ', $intake);
    //     [$intakeYearStart] = explode('/', $intakeYearRange);
    //     $intakeSemNumber = (int) filter_var($intakeSem, FILTER_SANITIZE_NUMBER_INT); // Extract number from "Sem 1" or "Sem 2"

    //     // Calculate the number of semesters completed
    //     $semesterCount = ($currentYearStart - $intakeYearStart) * 2;

    //     if ($currentSem === 2) {
    //         $semesterCount += 1; // Add one if we are in the second semester of the current year
    //     }

    //     if ($intakeSemNumber === 2) {
    //         $semesterCount -= 1; // Subtract one if the intake semester is the second semester
    //     }

    //     return $semesterCount + 1; // Add 1 to convert from 0-based index
    // }

    public function approveUpdate($progressUpdateId)
    {
        $progressUpdate = ProgressUpdate::find($progressUpdateId);

        if (!$progressUpdate) {
            return response()->json(['message' => 'Invalid request.'], 400);
        }

        // if ($progressUpdate->approved == 1) {
        //     return response()->json(['message' => 'This update has already been approved.'], 400);
        // }

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

        $intake = Intake::find($student->intake_id);
        if (!$intake) {
            // Handle the case where the intake is not found
            return response()->json(['error' => 'Invalid intake ID'], 400);
        }
        $studentSemester = $this->calculateStudentSemester($intake, $currentSemesterData);

        // Process admin-specific updates
        $this->processAdminUpdate($progressUpdate->toArray(), $progressUpdate->student_id, $studentSemester, $progressUpdateId);

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

        // if ($progressUpdate->approved == 0) {
        //     return response()->json(['message' => 'This update has already been rejected.'], 400);
        // }

        $rollbackData = json_decode($progressUpdate->rollback_data, true);

        if ($rollbackData) {
            $this->rollbackChanges($rollbackData, $progressUpdate->student_id);
        }

        $admin = auth()->user();
        $adminName = $admin->Name ?? 'Admin';

        $student = Student::find($progressUpdate->student_id);
        $studentName = $student ? "{$student->first_name} {$student->last_name}" : 'Student';

        // Update the approval status to rejected
        $progressUpdate->approved = 0;
        $progressUpdate->reason = $validatedData['reason'];
        $progressUpdate->save();

        // Calculate the current semester
        $currentSemesterData = $this->calculateCurrentSemester();
        $currentSemester = $currentSemesterData['semester'] ?? null;

        if (!$currentSemester) {
            return response()->json(['message' => 'Could not determine the current semester.'], 400);
        }

        $intake = Intake::find($student->intake_id);
        if (!$intake) {
            // Handle the case where the intake is not found
            return response()->json(['error' => 'Invalid intake ID'], 400);
        }
        $currentSemester = $this->calculateStudentSemester($intake, $currentSemesterData);

        $this->updateCurrentTask($progressUpdate->student_id);
        $this->calculateAndUpdateProgress($progressUpdate->student_id, $currentSemester);

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

        // if ($progressUpdate->approved == null) {
        //     return response()->json(['message' => 'This update has already been marked as pending.'], 400);
        // }

        $rollbackData = json_decode($progressUpdate->rollback_data, true);

        if ($rollbackData) {
            $this->rollbackChanges($rollbackData, $progressUpdate->student_id);
            StudyPlan::where('student_id', $progressUpdate->student_id)->first()->refresh();
        }

        // Get the admin's name
        $admin = auth()->user();
        $adminName = $admin->Name ?? 'Admin';

        // Get the student's name
        $student = Student::find($progressUpdate->student_id);
        $studentName = $student ? "{$student->first_name} {$student->last_name}" : 'Student';

        // Update the approval status to rejected
        $progressUpdate->approved = null;
        $progressUpdate->reason = null;
        $progressUpdate->save();

        // Calculate the current semester
        $currentSemesterData = $this->calculateCurrentSemester();
        $currentSemester = $currentSemesterData['semester'] ?? null;

        if (!$currentSemester) {
            return response()->json(['message' => 'Could not determine the current semester.'], 400);
        }

        $intake = Intake::find($student->intake_id);
        if (!$intake) {
            // Handle the case where the intake is not found
            return response()->json(['error' => 'Invalid intake ID'], 400);
        }
        $currentSemester = $this->calculateStudentSemester($intake, $currentSemesterData);

        $progressUpdate = ProgressUpdate::find($progressUpdateId);

        $this->updateCurrentTask($progressUpdate->student_id);
        $this->calculateAndUpdateProgress($progressUpdate->student_id, $currentSemester);

        $this->broadcastRequestUpdate(
            $progressUpdate,
            "{$adminName} marked {$studentName}'s update request as pending."
        );

        return response()->json(['message' => 'Request pending.']);
    }

    private function rollbackChanges(array $rollbackData, $studentId)
    {
        $student = Student::find($studentId);
        if (!$student) {
            throw new \Exception('Student not found.');
        }

        if (isset($rollbackData['study_plan'])) {
            $studyPlan = StudyPlan::where('student_id', $studentId)->first();
            if ($studyPlan) {
                $studyPlan->semesters = $rollbackData['study_plan'];
                $studyPlan->save();

                // Get the old task IDs
                $oldTaskMap = collect($rollbackData['old_task_ids']);
                // Extract old task IDs
                $oldTaskIdsArray = $oldTaskMap->values()->all(); // Get the IDs

                // Sync the tasks in the pivot table to the old tasks
                $studyPlan->tasks()->sync($oldTaskIdsArray);

                // Reverse the task ID mapping
                $taskIdMapping = $rollbackData['task_id_mapping'];
                $reversedTaskIdMapping = array_flip($taskIdMapping);

                // Update the progress_updates to reference the old task IDs
                foreach ($reversedTaskIdMapping as $newTaskId => $oldTaskId) {
                    ProgressUpdate::where('student_id', $studentId)
                        ->where('task_id', $newTaskId)
                        ->update(['task_id' => $oldTaskId]);
                }
            }
        }

        if (isset($rollbackData['max_sem'])) {
            $student->max_sem = $rollbackData['max_sem'];
        }

        if (isset($rollbackData['supervisor_id'])) {
            $student->supervisor_id = $rollbackData['supervisor_id'];
        }

        if (isset($rollbackData['status'])) {
            $student->status = $rollbackData['status'];
        }

        if (isset($rollbackData['cgpa'])) {
            $student->cgpa = $rollbackData['cgpa'];
        }

        if (isset($rollbackData['research'])) {
            $student->research = $rollbackData['research'];
        }

        if (isset($rollbackData['workshops_attended'])) {
            $student->workshops_attended = implode(', ', $rollbackData['workshops_attended']);
        }

        $student->save();
    }
}
