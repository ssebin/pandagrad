<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Lecturer;

class LecturerController extends Controller
{
    public function getSupervisors(Request $request)
    {
        $role = $request->query('role');

        // Check if the role is supervisor and fetch lecturers with role of 'supervisor' or 'both'
        if ($role === 'supervisor') {
            $lecturers = Lecturer::whereIn('role', ['supervisor', 'both'])->get();
            return response()->json($lecturers);
        }

        return response()->json([], 400); // Return a bad request if role is invalid
    }
}