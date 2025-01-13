<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Program;
use App\Models\Intake;
use App\Models\Task;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ProgramController extends Controller
{
    public function index()
    {
        $programs = Program::all();
        return response()->json($programs);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:programs,name',
        ]);

        $program = Program::create($validated);
        return response()->json($program, 201);
    }

    public function update(Request $request, Program $program)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:programs,name,' . $program->id,
        ]);

        $program->update($validated);
        return response()->json($program);
    }

    public function duplicateProgram(Request $request, $source_program_id)
    {
        $validated = $request->validate([
            'new_program_id' => 'required|exists:programs,id',
        ]);

        // Fetch the source program's intakes and their tasks
        $intakes = Intake::where('program_id', $source_program_id)->orderBy('id', 'asc')->get();

        foreach ($intakes as $intake) {
            // Duplicate the intake for the new program
            $newIntake = $intake->replicate();
            $newIntake->program_id = $validated['new_program_id'];
            $newIntake->push(); // Save the new intake

            // Fetch tasks associated with the intake
            $tasks = Task::where('intake_id', $intake->id)
                ->orderBy('id', 'asc')
                ->get();

            foreach ($tasks as $task) {
                // Duplicate the task for the new intake
                $newTask = $task->replicate();
                $newTask->intake_id = $newIntake->id;
                $newTask->save();
            }
        }

        return response()->json(['message' => 'Program duplicated successfully.']);
    }

    public function destroy(Program $program)
    {
        // Check if the program has any students associated with it
        if ($program->students()->exists()) {
            // Return a 400 Bad Request response with a custom message
            return response()->json([
                'message' => 'Cannot delete program: there are students associated with it.'
            ], 400);
        }

        // If no students are associated, proceed to delete the program
        $program->delete();

        return response()->json(['message' => 'Program deleted successfully']);
    }
}
