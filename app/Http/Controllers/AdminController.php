<?php

namespace App\Http\Controllers;
use App\Models\Student;

use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function index()
    {
        // Fetch and return all students
        $students = Student::all();
        return response()->json($students);
    }
}
