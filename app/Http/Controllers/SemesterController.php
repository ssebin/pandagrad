<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Semester;
use Carbon\Carbon;

class SemesterController extends Controller
{
    public function index()
    {
        $semesters = Semester::all();
        return response()->json($semesters);
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'semester' => 'required|integer',
            'academic_year' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date',
            'remarks' => 'nullable|string',
            'status' => 'required|string',
        ]);

        Semester::create($validatedData);

        return response()->json(['message' => 'Semester added successfully']);
    }

    public function update(Request $request, $id)
    {
        $semester = Semester::find($id);

        if (!$semester) {
            return response()->json(['message' => 'Semester not found'], 404);
        }

        $validatedData = $request->validate([
            'semester' => 'required|integer',
            'academic_year' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date',
            'remarks' => 'nullable|string',
            'status' => 'required|string',
        ]);

        $semester->update($validatedData);

        return response()->json(['message' => 'Semester updated successfully']);
    }

    public function destroy($id)
    {
        $semester = Semester::find($id);

        if (!$semester) {
            return response()->json(['message' => 'Semester not found'], 404);
        }

        $semester->delete();

        return response()->json(['message' => 'Semester deleted successfully']);
    }

    public function getCurrentSemester()
    {
        try {
            $today = Carbon::today();

            $currentSemester = Semester::where('start_date', '<=', $today)
                ->where('end_date', '>=', $today)
                ->first();

            if (!$currentSemester) {
                return response()->json(['message' => 'No current semester found'], 404);
            }

            return response()->json($currentSemester);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Server error', 'error' => $e->getMessage()], 500);
        }
    }

    public function calculateCurrentSemester()
    {
        $today = Carbon::today();
        $semesters = Semester::all();

        foreach ($semesters as $semester) {
            $start_date = Carbon::parse($semester->start_date);
            $end_date = Carbon::parse($semester->end_date);

            if ($today->between($start_date, $end_date)) {
                $semester->status = 'Ongoing';
            } elseif ($today->lt($start_date)) {
                $semester->status = 'Upcoming';
            } else {
                $semester->status = 'Ended';
            }

            $semester->save();
        }
    }
}
