<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Task;
use App\Models\TaskVersion;
use App\Models\Intake;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class TaskController extends Controller
{
    public function indexAll()
    {
        $tasks = Task::all();
        return response()->json($tasks);
    }

    public function index(Intake $intake)
    {
        $latestTasks = Task::where('intake_id', $intake->id)
            ->whereNotIn('id', function ($query) {
                $query->select('parent_task_id')->from('tasks')->whereNotNull('parent_task_id');
            })
            ->get();

        return response()->json($latestTasks);
    }

    public function store(Request $request, Intake $intake)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'task_weight' => 'required|integer|min:1|max:10',
        ]);

        $taskCode = Str::uuid()->toString();

        // Create the first version
        $task = $intake->tasks()->create(array_merge($validated, [
            'version_number' => 1, // First version
            'parent_task_id' => null, // No parent for the first version
            'updated_by' => auth()->id(), // The admin making the change
            'intake_id' => $intake->id, // The intake the task belongs to
            'task_code' => $taskCode,
        ]));
        return response()->json($task, 201);
    }

    public function update(Request $request, Task $task)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'task_weight' => 'required|integer|min:1',
        ]);

        $newTask = Task::create(array_merge($validated, [
            'intake_id' => $task->intake_id, // Preserve the intake association
            'version_number' => $task->version_number + 1, // Increment version
            'parent_task_id' => $task->id, // Link to the previous version
            'updated_by' => auth()->id(), // Track the admin making the update
            'task_code' => $task->task_code, // Preserve the task_code
        ]));

        return response()->json($newTask);
    }

    public function destroy(Task $task)
    {
        // Find all versions of the task in the same intake using the task_code
        $tasksToDelete = Task::where('task_code', $task->task_code)
            ->where('intake_id', $task->intake_id)
            ->get();

        foreach ($tasksToDelete as $t) {
            $t->delete();
        }

        return response()->json(['message' => 'Task deleted successfully']);
    }

    public function applyDelete(Request $request, Task $task)
    {
        $validated = $request->validate([
            'intake_ids' => 'required|array',
            'intake_ids.*' => 'exists:intakes,id',
        ]);

        foreach ($validated['intake_ids'] as $intakeId) {
            // Find all versions of the task in the specified intake
            $tasksToDelete = Task::where('task_code', $task->task_code)
                ->where('intake_id', $intakeId)
                ->get();

            foreach ($tasksToDelete as $t) {
                $t->delete();
            }
        }

        return response()->json(['message' => 'Tasks deleted successfully']);
    }

    public function applyChanges(Request $request, Task $task)
    {
        $validated = $request->validate([
            'intake_ids' => 'required|array',
            'intake_ids.*' => 'exists:intakes,id',
        ]);

        $taskData = $task->only(['name', 'category', 'task_weight']);

        foreach ($validated['intake_ids'] as $intakeId) {
            // Find the latest version of the task in the specified intake using task_code
            $existingTask = Task::where('intake_id', $intakeId)
                ->where('task_code', $task->task_code)
                ->whereNotIn('id', function ($query) {
                    $query->select('parent_task_id')->from('tasks')->whereNotNull('parent_task_id');
                })->first();

            if ($existingTask) {
                // Create a new version
                Task::create(array_merge($taskData, [
                    'intake_id' => $intakeId,
                    'version_number' => $existingTask->version_number + 1,
                    'parent_task_id' => $existingTask->id,
                    'updated_by' => auth()->id(),
                    'task_code' => $existingTask->task_code,
                ]));
            } else {
                // Create a new task with the same task_code
                Task::create(array_merge($taskData, [
                    'intake_id' => $intakeId,
                    'version_number' => $task->version_number, // Use the current task's version_number
                    'parent_task_id' => null,
                    'updated_by' => auth()->id(),
                    'task_code' => $task->task_code,
                ]));
            }
        }

        return response()->json(['message' => 'Changes applied successfully']);
    }

    public function copyTasks(Request $request)
    {
        $validated = $request->validate([
            'source_intake_id' => 'required|exists:intakes,id',
            'destination_intake_id' => 'required|exists:intakes,id',
        ]);

        $taskIdMap = [];

        // Retrieve tasks ordered by 'id' ascending
        $tasks = Task::where('intake_id', $validated['source_intake_id'])
            ->orderBy('id', 'asc')
            ->get();

        foreach ($tasks as $task) {
            // Remove the 'id' to prevent duplication issues
            $taskData = $task->toArray();
            $oldTaskId = $taskData['id'];
            unset($taskData['id']);

            // Update 'intake_id' to new intake
            $taskData['intake_id'] = $validated['destination_intake_id'];

            // Update 'parent_task_id' to new mapped id, if it exists
            if ($taskData['parent_task_id']) {
                $oldParentId = $taskData['parent_task_id'];
                if (isset($taskIdMap[$oldParentId])) {
                    $taskData['parent_task_id'] = $taskIdMap[$oldParentId];
                } else {
                    // This shouldn't happen, but if it does, set parent_task_id to null
                    $taskData['parent_task_id'] = null;
                }
            }

            // Create the new task
            $newTask = Task::create($taskData);

            // Map old task ID to new task ID
            $taskIdMap[$oldTaskId] = $newTask->id;
        }

        return response()->json(['message' => 'Tasks copied successfully']);
    }

    public function getTaskVersions(Intake $intake, $taskName)
    {
        $versions = Task::where('intake_id', $intake->id)
            ->where('name', $taskName)
            ->orderBy('version_number', 'desc')
            ->get();

        return response()->json($versions);
    }

    public function revert(Request $request, Task $task)
    {
        $revertedTask = Task::create([
            'name' => $task->name,
            'category' => $task->category,
            'task_weight' => $task->task_weight,
            'intake_id' => $task->intake_id,
            'version_number' => $task->version_number + 1, // New version
            'parent_task_id' => $task->id, // Link to the reverted version
            'updated_by' => auth()->id(), // Track the admin making the change
        ]);

        return response()->json($revertedTask);
    }
}
