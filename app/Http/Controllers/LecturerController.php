<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;

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

    public function index()
    {
        // Fetch and return all lecturers
        $lecturers = Lecturer::all();
        return response()->json($lecturers);
    }

    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'first_name' => 'required|string',
                'last_name' => 'required|string',
                'um_email' => 'required|string|email|unique:lecturers,um_email',
                'status' => 'required|string',
                'role' => 'required|string',
                'program' => 'required|string',
                'remarks' => 'nullable|string',
            ]);

            $validatedData['password'] = Hash::make('password123');

            Lecturer::create($validatedData);

            return response()->json(['message' => 'Lecturer added successfully']);
        } catch (\Illuminate\Validation\ValidationException $e) {
            log::error($e->errors());
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            log::error($e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $lecturer = Lecturer::find($id);

        if (!$lecturer) {
            return response()->json(['message' => 'Lecturer not found'], 404);
        }

        $validatedData = $request->validate([
            'first_name' => 'required|string',
            'last_name' => 'required|string',
            'um_email' => 'required|string|email',
            'status' => 'required|string',
            'role' => 'required|string',
            'program' => 'required|string',
            'remarks' => 'nullable|string',
        ]);

        $lecturer->update($validatedData);

        return response()->json(['message' => 'Lecturer updated successfully']);
    }

    public function destroy($id)
    {
        try {
            $lecturer = Lecturer::find($id);

            if (!$lecturer) {
                return response()->json(['error' => 'Lecturer not found'], 404);
            }

            $lecturer->delete();

            return response()->json(['message' => 'Lecturer deleted successfully']);
        } catch (\Exception $e) {
            log::error($e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
