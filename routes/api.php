<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\LecturerController;
use App\Http\Controllers\SemesterController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\ProgressUpdateController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\ProgramController;
use App\Http\Controllers\IntakeController;
use App\Http\Controllers\StatisticsController;

// Routes for authenticated users only
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/student/register', [StudentController::class, 'register']);
    Route::post('/student/study-plan', [StudentController::class, 'saveStudyPlan']);

    Route::get('/students', [StudentController::class, 'index']);
    Route::post('/students', [StudentController::class, 'store']);
    Route::get('/students/{id}', [StudentController::class, 'show']);
    Route::put('/students/{id}', [StudentController::class, 'update']);
    Route::delete('/students/{id}', [StudentController::class, 'destroy']);
    Route::post('/students/batch', [StudentController::class, 'batchCreate']);

    Route::get('/students/{id}/study-plan', [StudentController::class, 'getStudyPlan']);
    Route::put('/students/{id}/update-progress', [StudentController::class, 'updateProgress']);
    Route::post('/students/{studentId}/update-progress', [StudentController::class, 'updateProgress']);

    Route::get('/tasks', [TaskController::class, 'indexAll']);

    Route::get('/progress-updates', [ProgressUpdateController::class, 'index']);
    Route::post('/progress-updates/{progressUpdateId}/approve', [StudentController::class, 'approveUpdate']);
    Route::post('/progress-updates/{progressUpdateId}/reject', [StudentController::class, 'rejectUpdate']);
    Route::post('/progress-updates/{progressUpdateId}/pending', [StudentController::class, 'pendingUpdate']);

    Route::post('/notifications/mark-as-read/{progressUpdateId}', [NotificationController::class, 'markNotificationAsRead']);
    Route::post('/notifications/mark-as-unread/{progressUpdateId}', [NotificationController::class, 'markNotificationAsUnread']);
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'getUnreadCount']);
    Route::get('/notifications/since-last-login', [NotificationController::class, 'getUnreadNotificationsSinceLastLogin']);

    Route::get('/lecturers', [LecturerController::class, 'getSupervisors']);
    Route::get('/lecturers/all', [LecturerController::class, 'index']);
    Route::post('/lecturers', [LecturerController::class, 'store']);
    Route::put('/lecturers/{id}', [LecturerController::class, 'update']);
    Route::delete('/lecturers/{id}', [LecturerController::class, 'destroy']);

    Route::get('/admins', [AdminController::class, 'index']);
    Route::post('/admins', [AdminController::class, 'store']);
    Route::put('/admins/{AdminID}', [AdminController::class, 'update']);
    Route::delete('/admins/{AdminID}', [AdminController::class, 'destroy']);

    Route::get('/semesters', [SemesterController::class, 'index']);
    Route::post('/semesters', [SemesterController::class, 'store']);
    Route::put('/semesters/{id}', [SemesterController::class, 'update']);
    Route::delete('/semesters/{id}', [SemesterController::class, 'destroy']);
    Route::get('/semesters/current', [SemesterController::class, 'getCurrentSemester']);

    Route::post('/update-profile-picture', [StudentController::class, 'updateProfilePicture']);

    Route::get('/programs', [ProgramController::class, 'index']); // List all programs
    Route::post('/programs', [ProgramController::class, 'store']); // Add a new program
    Route::put('/programs/{program}', [ProgramController::class, 'update']); // Edit a program
    Route::delete('/programs/{program}', [ProgramController::class, 'destroy']); // Delete a program
    Route::post('/programs/{source_program}/duplicate', [ProgramController::class, 'duplicateProgram']); // Duplicate a program

    Route::get('/programs/{program}/intakes', [IntakeController::class, 'index']); // List intakes for a program
    Route::post('/programs/{program}/intakes', [IntakeController::class, 'store']); // Add a new intake
    Route::put('/programs/intakes/{intake}', [IntakeController::class, 'update']); // Edit an intake
    Route::delete('/programs/intakes/{intake}', [IntakeController::class, 'destroy']); // Delete an intake
    Route::get('/programs/{program}/intakes-with-tasks', [IntakeController::class, 'getIntakesWithTasks']); // List intakes for a program with tasks

    Route::get('/tasks/intake/{intakeId}', [TaskController::class, 'index']); // List tasks for an intake
    Route::post('/tasks/intake/{intake}', [TaskController::class, 'store']); // Add a new task
    Route::put('/tasks/{task}', [TaskController::class, 'update']); // Edit a task
    Route::delete('/tasks/{task}', [TaskController::class, 'destroy']); // Delete a task
    Route::post('/tasks/{task}/apply-changes', [TaskController::class, 'applyChanges']); // Apply task changes to intakes
    Route::post('/tasks/{task}/apply-delete', [TaskController::class, 'applyDelete']); // Apply task deletion to intakes
    Route::post('/tasks/copy-tasks', [TaskController::class, 'copyTasks']); // Copy tasks to a new intake
    Route::get('/tasks/{task}/versions', [TaskController::class, 'getTaskVersions']); // Get all versions of a task
    Route::get('/tasks/{task}/latest-version-number', [TaskController::class, 'getLatestVersionNumber']); // Get the latest version number of a task
    Route::post('/tasks/{task}/revert', [TaskController::class, 'revert']);

    Route::get('/statistics', [StatisticsController::class, 'getStatistics']);
    Route::get('/charts', [StatisticsController::class, 'getChartsData']);
});

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);
Route::post('/refresh', [AuthController::class, 'refresh']);

Route::middleware('auth:sanctum')->get('/me', function (Request $request) {
    return response()->json($request->user());
});

Route::get('/test-api', function () {
    return response()->json(['message' => 'API is working']);
});
