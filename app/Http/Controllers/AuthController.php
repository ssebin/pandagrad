<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\Admin;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'UMEmail' => 'required|email',
            'password' => 'required',
            'role' => 'required|in:admin',
        ]);

        $admin = Admin::where('UMEmail', $request->UMEmail)->first();

        if ($admin && Hash::check($request->password, $admin->Password)) {
            return response()->json(['message' => 'Login successful', 'admin' => $admin], 200);
        }

        return response()->json(['message' => 'Invalid credentials'], 401);
    }
}
