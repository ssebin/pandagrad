<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Intake;
use App\Models\Program;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class IntakeController extends Controller
{
    public function index(Program $program)
    {
        $intakes = $program->intakes;
        return response()->json($intakes);
    }

    public function store(Request $request, Program $program)
    {
        $validated = $request->validate([
            'intake_semester' => 'required|integer',
            'intake_year' => 'required|string|max:255',
        ]);

        $intake = $program->intakes()->create(array_merge($validated, [
            'program_id' => $program->id, // The program the intake belongs to
        ]));

        return response()->json($intake, 201);
    }

    public function update(Request $request, Intake $intake)
    {
        $validated = $request->validate([
            'intake_semester' => 'required|integer',
            'intake_year' => 'required|string|max:255',
        ]);

        $intake->update($validated);
        return response()->json($intake);
    }

    public function getIntakesWithTasks($program_id)
    {
        $intakes = Intake::where('program_id', $program_id)
            ->whereHas('tasks')
            ->get(['id', 'intake_semester', 'intake_year']);

        return response()->json($intakes);
    }

    public function destroy(Intake $intake)
    {
        // Check if the intake has any students associated with it
        if ($intake->students()->exists()) {
            // Return a 400 Bad Request response with a custom message
            return response()->json([
                'message' => 'Cannot delete intake: there are students associated with it.'
            ], 400);
        }

        // If no students are associated, proceed to delete the intake
        $intake->delete();

        return response()->json(['message' => 'Intake deleted successfully']);
    }
}
