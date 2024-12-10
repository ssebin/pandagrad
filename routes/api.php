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

// Routes for authenticated users only
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/student/register', [StudentController::class, 'register']);
    Route::post('/student/study-plan', [StudentController::class, 'saveStudyPlan']);

    Route::get('/students', [StudentController::class, 'index']);
    Route::post('/students', [StudentController::class, 'store']);
    Route::get('/students/{id}', [StudentController::class, 'show']);
    Route::put('/students/{id}', [StudentController::class, 'update']);
    Route::delete('/students/{id}', [StudentController::class, 'destroy']);
    Route::get('/students/{id}/study-plan', [StudentController::class, 'getStudyPlan']);
    //Route::get('/students/study-plans', [StudentController::class, 'getAllStudyPlans']);
    Route::put('/students/{id}/update-progress', [StudentController::class, 'updateProgress']);
    Route::post('/students/{studentId}/update-progress', [StudentController::class, 'updateProgress']);
    Route::get('/tasks', [TaskController::class, 'index']);
    Route::get('/progress-updates', [ProgressUpdateController::class, 'index']);
    Route::post('/progress-updates/{progressUpdateId}/approve', [StudentController::class, 'approveUpdate']);
    Route::post('/progress-updates/{progressUpdateId}/reject', [StudentController::class, 'rejectUpdate']);
    Route::post('/progress-updates/{progressUpdateId}/pending', [StudentController::class, 'pendingUpdate']);
    //Route::post('/progress-updates/{id}/mark-as-read', [ProgressUpdateController::class, 'markAsRead']);
    Route::post('/notifications/mark-as-read/{progressUpdateId}', [NotificationController::class, 'markNotificationAsRead']);
    Route::post('/notifications/mark-as-unread/{progressUpdateId}', [NotificationController::class, 'markNotificationAsUnread']);
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'getUnreadCount']);
    // Route::get('/students/{studentId}/progress', [StudentController::class, 'getStudentProgress']);
    //Route::get('/students/{id}/nationality', [StudentController::class, 'getNationality']);
    //Route::get('/students/nationalities', [StudentController::class, 'getAllNationalities']);

    Route::get('/lecturers', [LecturerController::class, 'getSupervisors']);

    Route::get('/semesters', [SemesterController::class, 'index']);
    Route::post('/semesters', [SemesterController::class, 'store']);
    Route::put('/semesters/{id}', [SemesterController::class, 'update']);
    Route::delete('/semesters/{id}', [SemesterController::class, 'destroy']);
    Route::get('/semesters/current', [SemesterController::class, 'getCurrentSemester']);

    Route::post('/update-profile-picture', [StudentController::class, 'updateProfilePicture']);
});

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);
Route::post('/refresh', [AuthController::class, 'refresh']);

Route::middleware('auth:sanctum')->get('/me', function (Request $request) {
    return response()->json($request->user());
});

//Route::middleware('auth:sanctum')->get('/lecturer/students', [StudentController::class, 'studentsUnderSupervision']);