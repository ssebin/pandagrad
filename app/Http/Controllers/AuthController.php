<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\Log;
use Exception;
use App\Models\Admin;
use App\Models\Lecturer;
use App\Models\Student;
use GuzzleHttp\Client;
use App\Models\Notification;

class AuthController extends Controller
{
    // Redirect to Google for authentication
    public function redirectToGoogle()
    {
        $googleUrl = Socialite::driver('google')
            ->stateless()
            ->redirect()
            ->getTargetUrl();

        // Append 'prompt=select_account'
        $googleUrl .= '&prompt=select_account';

        return redirect()->to($googleUrl);
    }

    public function handleGoogleCallback()
    {
        try {
            // Log the entire request to check if 'code' is present
            //Log::info('Callback request data', ['request' => request()->all()]);

            // Capture the authorization code
            $authCode = request('code');
            // Log::info('Authorization code', ['code' => $authCode]);

            if (!$authCode) {
                throw new Exception('Authorization code is missing');
            }

            $client = new Client();

            // Exchange authorization code for access token
            $response = $client->post('https://oauth2.googleapis.com/token', [
                'form_params' => [
                    'code' => request('code'),
                    'client_id' => config('services.google.client_id'),
                    'client_secret' => config('services.google.client_secret'),
                    'redirect_uri' => config('services.google.redirect'),
                    'grant_type' => 'authorization_code',
                ],
            ]);

            $responseBody = json_decode($response->getBody()->getContents(), true);

            // Log the response to check if the token is received
            //Log::info('Google OAuth token response', ['response' => $responseBody]);

            // Use the access token to retrieve the user's information
            $accessToken = $responseBody['access_token'];
            $googleUser = Socialite::driver('google')->stateless()->userFromToken($accessToken);

            $email = $googleUser->email;

            $unreadNotifications = [];

            // Check if the user is an admin
            $admin = Admin::where('UMEmail', $email)->first();
            if ($admin) {
                if ($admin->Status === 'Deactivated') {
                    return redirect()->to('http://127.0.0.1:8000/unauthorized')->with('error', 'Your account is deactivated.');
                }
                $lastSeenAt = $admin->last_active_at ?? $admin->last_login_at  ?? $admin->created_at ?? '2000-01-01 00:00:00';
                $unreadNotifications = Notification::where('recipient_id', 'shared')
                    ->whereNull('read_at')
                    ->where('created_at', '>', $lastSeenAt)
                    ->get();
                $admin->update(['last_login_at' => now()]);
                $role = 'admin';
                $token = $admin->createToken('admin-token')->plainTextToken;
                // return response()->json([
                //     'token' => $token,
                //     'role' => $role,
                //     'user' => $admin,
                //     'unread_notifications' => $unreadNotifications,
                // ]);
                // Pass the role along with the token
                return redirect()->to('http://127.0.0.1:8000/process-login?token=' . $token . '&role=' . $role . '&unread_notifications=' . urlencode(json_encode($unreadNotifications)));
            }

            // Check if user is Lecturer
            //if (str_ends_with($email, '@um.edu.my')) {
            $lecturer = Lecturer::where('um_email', $email)->first();  // Assuming 'email' is the column in the lecturer table
            if ($lecturer) {
                if ($lecturer->status === 'Deactivated') {
                    return redirect()->to('http://127.0.0.1:8000/unauthorized')->with('error', 'Your account is deactivated.');
                }
                $lastSeenAt = $lecturer->last_active_at ?? $lecturer->last_login_at ?? $lecturer->created_at ?? '2000-01-01 00:00:00';
                $unreadNotifications = Notification::where('recipient_id', $lecturer->id)
                    ->whereNull('read_at')
                    ->where('created_at', '>', $lastSeenAt)
                    ->get();
                $lecturer->update(['last_login_at' => now()]);
                $role = $lecturer->role;  // Get the role from the lecturer table
                $lecturerRole = '';

                // Assign role based on the lecturer's role in the DB
                if ($role === 'supervisor') {
                    $lecturerRole = 'lecturer_supervisor';
                } elseif ($role === 'coordinator') {
                    $lecturerRole = 'lecturer_coordinator';
                } elseif ($role === 'both') {
                    $lecturerRole = 'lecturer_both';
                }
                $token = $lecturer->createToken('lecturer-token')->plainTextToken;
                // return response()->json([
                //     'token' => $token,
                //     'role' => $lecturerRole,
                //     'user' => $lecturer,
                //     'unread_notifications' => $unreadNotifications,
                // ]);
                return redirect()->to('http://127.0.0.1:8000/process-login?token=' . $token . '&role=' . $lecturerRole . '&unread_notifications=' . urlencode(json_encode($unreadNotifications)));
            }
            //}

            // Check if the user is a student
            // if (str_ends_with($email, '@siswa.um.edu.my')) {
            $student = Student::where('siswamail', $email)->first();
            if ($student) {
                if ($student->status === 'Deactivated') {
                    return redirect()->to('http://127.0.0.1:8000/unauthorized')->with('error', 'Your account is deactivated.');
                }
                $lastSeenAt = $student->last_active_at ?? $student->last_login_at  ?? $student->created_at ?? '2000-01-01 00:00:00';
                $unreadNotifications = Notification::where('recipient_id', $student->id)
                    ->whereNull('read_at')
                    ->where('created_at', '>', $lastSeenAt)
                    ->get();
                $student->update(['last_login_at' => now()]);
                $role = 'student';
                $token = $student->createToken('student-token')->plainTextToken;
                // return response()->json([
                //     'token' => $token,
                //     'role' => $role,
                //     'user' => $student,
                //     'unread_notifications' => $unreadNotifications,
                // ]);
                // Pass the role along with the token
                return redirect()->to('http://127.0.0.1:8000/process-login?token=' . $token . '&role=' . $role . '&unread_notifications=' . urlencode(json_encode($unreadNotifications)));
            } //else {
            //     return response()->json(['error' => 'Student not found'], 403);
            // }
            // }

            // In Google Callback Handler
            return redirect()->to('http://127.0.0.1:8000/unauthorized');
        } catch (Exception $e) {
            Log::error('Google authentication failed', [
                'error' => $e->getMessage(),
            ]);
            return redirect()->to('http://127.0.0.1:8000/internal-server-error');
        }
    }

    private function fetchUnreadNotifications($user)
    {
        $query = Notification::query();

        if ($user->role === 'admin') {
            $query->where('recipient_id', 'shared');
        } else {
            $query->where('recipient_id', $user->id);
        }

        $query->whereNull('read_at');

        if ($user->last_login_at) {
            $query->where('created_at', '>', $user->last_login_at);
        }

        return $query->get()->toArray();
    }

    // Logout function
    public function logout()
    {
        Auth::logout();
        return redirect('/');
    }

    // Traditional login method
    public function login(Request $request)
    {
        // Validate the request data
        $request->validate([
            'UMEmail' => 'required|email',
            'password' => 'required|string',
            'role' => 'required|string', // 'student', 'lecturer', 'admin'
        ]);

        $credentials = [
            'UMEmail' => $request->UMEmail,
            'password' => $request->password,
        ];

        // Try to authenticate the user based on role
        try {
            // Log::info('Login attempt', [
            //     'email' => $request->UMEmail,
            //     'role' => $request->role,
            //     'credentials' => $credentials,
            // ]);

            if ($request->role === 'admin') {
                $admin = Admin::where('UMEmail', $request->UMEmail)->first();
                if ($admin && Hash::check($request->password, $admin->Password)) {
                    if ($admin->Status === 'Deactivated') {
                        return response()->json([
                            'error' => 'Your account is deactivated.',
                        ], 403);
                    }
                    // Fetch unread notifications before updating last_login_at
                    $lastSeenAt = $admin->last_active_at ?? $admin->last_login_at  ?? $admin->created_at ?? '2000-01-01 00:00:00';
                    $unreadNotifications = Notification::where('recipient_id', 'shared')
                        ->whereNull('read_at')
                        ->where('created_at', '>', $lastSeenAt)
                        ->get();

                    $admin->update(['last_login_at' => now()]);

                    $token = $admin->createToken('admin-token')->plainTextToken;
                    return response()->json([
                        'token' => $token,
                        'user' => $admin,
                        'role' => 'admin',
                        'unread_notifications' => $unreadNotifications,
                    ]);
                }
            }

            if ($request->role === 'lecturer') {
                $lecturer = Lecturer::where('um_email', $request->UMEmail)->first();
                if ($lecturer && Hash::check($request->password, $lecturer->password)) {
                    if ($lecturer->status === 'Deactivated') {
                        return response()->json([
                            'error' => 'Your account is deactivated.',
                        ], 403);
                    }
                    // Fetch unread notifications before updating last_login_at
                    $lastSeenAt = $lecturer->last_active_at ?? $lecturer->last_login_at ?? $lecturer->created_at ?? '2000-01-01 00:00:00';
                    $unreadNotifications = Notification::where('recipient_id', $lecturer->id)
                        ->whereNull('read_at')
                        ->where('created_at', '>', $lastSeenAt)
                        ->get();

                    $lecturer->update(['last_login_at' => now()]);

                    $role = $lecturer->role;

                    $lecturerRole = $this->getLecturerRole($role); // Helper method to get role
                    //Log::info('lecturerRole: ', [$lecturerRole]);
                    $token = $lecturer->createToken('lecturer-token')->plainTextToken;
                    return response()->json([
                        'token' => $token,
                        'user' => $lecturer,
                        'role' => $lecturerRole,
                        'unread_notifications' => $unreadNotifications,
                    ]);
                }
            }

            if ($request->role === 'student') {
                $student = Student::where('siswamail', $request->UMEmail)->first();
                if ($student && Hash::check($request->password, $student->password)) {
                    if ($student->status === 'Deactivated') {
                        return response()->json([
                            'error' => 'Your account is deactivated.',
                        ], 403);
                    }
                    // Fetch unread notifications before updating last_login_at
                    $lastSeenAt = $student->last_active_at ?? $student->last_login_at ?? $student->created_at ?? '2000-01-01 00:00:00';
                    $unreadNotifications = Notification::where('recipient_id', $student->id)
                        ->whereNull('read_at')
                        ->where('created_at', '>', $lastSeenAt)
                        ->get();

                    $student->update(['last_login_at' => now()]);

                    $token = $student->createToken('student-token')->plainTextToken;
                    return response()->json([
                        'token' => $token,
                        'user' => $student,
                        'role' => 'student',
                        'unread_notifications' => $unreadNotifications,
                    ]);
                }
            }

            // If no user is found or authentication fails
            return response()->json(['error' => 'Invalid credentials or role'], 401);
        } catch (Exception $e) {
            Log::error('Login error', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Login failed'], 500);
        }
    }

    // Helper method to determine lecturer role
    private function getLecturerRole($role)
    {
        switch ($role) {
            case 'supervisor':
                return 'lecturer_supervisor';
            case 'coordinator':
                return 'lecturer_coordinator';
            case 'both':
                return 'lecturer_both';
            default:
                return null;
        }
    }

    public function refresh(Request $request)
    {
        // Check if the request has the role
        $role = $request->input('role');
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json(['error' => 'Token not provided'], 401);
        }

        // Find the user based on role and existing token
        switch ($role) {
            case 'admin':
                $admin = Admin::where('api_token', $token)->first();
                if ($admin) {
                    // Revoke the current token
                    $admin->currentAccessToken()->delete();
                    // Create a new token
                    $newToken = $admin->createToken('admin-token')->plainTextToken;

                    return response()->json([
                        'token' => $newToken,
                        'message' => 'Token refreshed successfully',
                    ]);
                }
                break;

            case 'lecturer':
                $lecturer = Lecturer::where('api_token', $token)->first();
                if ($lecturer) {
                    // Revoke the current token
                    $lecturer->currentAccessToken()->delete();
                    // Create a new token
                    $newToken = $lecturer->createToken('lecturer-token')->plainTextToken;

                    return response()->json([
                        'token' => $newToken,
                        'message' => 'Token refreshed successfully',
                    ]);
                }
                break;

            case 'student':
                $student = Student::where('api_token', $token)->first();
                if ($student) {
                    // Revoke the current token
                    $student->currentAccessToken()->delete();
                    // Create a new token
                    $newToken = $student->createToken('student-token')->plainTextToken;

                    return response()->json([
                        'token' => $newToken,
                        'message' => 'Token refreshed successfully',
                    ]);
                }
                break;

            default:
                return response()->json(['error' => 'Invalid role'], 400);
        }

        return response()->json(['error' => 'User not found or token invalid'], 404);
    }
}
