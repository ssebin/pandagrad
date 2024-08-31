<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Student;

class StudentController extends Controller
{
    public function index()
    {
        $students = Student::all();
        return response()->json($students);
    }

    public function store(Request $request)
    {
        $validatedData = $this->validateStudent($request);

        $student = Student::create($validatedData);

        return response()->json(['message' => 'Student added successfully', 'student' => $student], 201);
    }

    public function show($id)
    {
        $student = Student::find($id);

        if (!$student) {
            return response()->json(['message' => 'Student not found'], 404);
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

    private function validateStudent(Request $request)
    {
        return $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'siswamail' => 'required|string|email|max:255',
            'supervisor' => 'required|string|max:255',
            'status' => 'required|string|max:255',
            'intake' => 'required|string|max:255',
            'semester' => 'required|integer',
            'program' => 'required|string|max:255',
            'research' => 'required|string',
            'task' => 'required|string|max:255',
            'profile_pic' => 'nullable|string|max:255',
            'progress' => 'required|integer',
            'track_status' => 'required|string|max:255',
            'cgpa' => 'required|numeric|between:0,4.00',
            'matric_number' => 'required|string|max:255',
            'remarks' => 'nullable|string',
        ]);
    }
}