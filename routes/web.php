<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Log;

Route::get('/', function () {
    return view('welcome');
});

// Redirect to Google login
Route::get('auth/google', [AuthController::class, 'redirectToGoogle']);

// Handle callback from Google
Route::get('auth/google/callback', [AuthController::class, 'handleGoogleCallback']);

// Logout route
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

Route::get('/{any}', function () {
    return view('welcome');
})->where('any', '.*');

Route::get('/test-log', function () {
    Log::error('Test log entry!');
    return response()->json(['message' => 'Log written!']);
});

Route::get('/test', function () {
    return 'Laravel is running!';
});
