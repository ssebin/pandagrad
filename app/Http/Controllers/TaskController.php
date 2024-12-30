<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Task;
use App\Models\TaskVersion;
use App\Models\Intake;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class TaskController extends Controller
{
    public function indexAll()
    {
        $tasks = Task::all();
        return response()->json($tasks);
    }

    public function index($intakeId)
    {
        $sub = Task::where('intake_id', $intakeId)
            ->select('task_code', DB::raw('MAX(version_number) as max_version'))
            ->groupBy('task_code');

        $latestTasks = Task::joinSub($sub, 'latest_versions', function ($join) {
            $join->on('tasks.task_code', '=', 'latest_versions.task_code')
                ->on('tasks.version_number', '=', 'latest_versions.max_version');
        })
            ->where('tasks.intake_id', $intakeId)
            ->get(['tasks.*']);

        return response()->json($latestTasks);
    }

    // public function index(Intake $intake)
    // {
    //     $latestTasks = Task::where('intake_id', $intake->id)
    //         ->whereNotIn('id', function ($query) {
    //             $query->select('parent_task_id')->from('tasks')->whereNotNull('parent_task_id');
    //         })
    //         ->get();

    //     return response()->json($latestTasks);
    // }

    public function store(Request $request, Intake $intake)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'task_weight' => 'required|integer|min:1|max:10',
            'apply_to_option' => 'required|string|in:this,all,custom',
            'selected_intake_ids' => 'nullable|array',
            'selected_intake_ids.*' => 'exists:intakes,id',
        ]);

        $taskCode = Str::uuid()->toString();

        // Create the first version
        $task = $intake->tasks()->create(array_merge($validated, [
            'version_number' => 1, // First version
            'unique_identifier' => Str::slug($validated['name'], '_'),
            'parent_task_id' => null, // No parent for the first version
            'updated_by' => auth()->id(), // The admin making the change
            'intake_id' => $intake->id, // The intake the task belongs to
            'task_code' => $taskCode,
            'apply_to_option' => $validated['apply_to_option'],
            'selected_intake_ids' => isset($validated['selected_intake_ids']) ? json_encode($validated['selected_intake_ids']) : null,
        ]));
        return response()->json($task, 201);
    }

    public function update(Request $request, Task $task)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'task_weight' => 'required|integer|min:1',
            'apply_to_option' => 'required|string|in:this,all,custom',
            'selected_intake_ids' => 'nullable|array',
            'selected_intake_ids.*' => 'exists:intakes,id',
        ]);

        $latestVersionNumber = Task::where('task_code', $task->task_code)->max('version_number') ?? 0;
        $newVersionNumber = $latestVersionNumber + 1;

        $newTask = Task::create(array_merge($validated, [
            'intake_id' => $task->intake_id, // Preserve the intake association
            'unique_identifier' => $task->unique_identifier, // Preserve the unique_identifier
            'version_number' => $newVersionNumber,
            'parent_task_id' => $task->id, // Link to the previous version
            'updated_by' => auth()->id(), // Track the admin making the update
            'task_code' => $task->task_code, // Preserve the task_code
            'apply_to_option' => $validated['apply_to_option'],
            'selected_intake_ids' => isset($validated['selected_intake_ids']) ? json_encode($validated['selected_intake_ids']) : null,
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
            'apply_to_option' => 'required|string|in:this,all,custom',
        ]);

        $taskData = $task->only(['name', 'category', 'task_weight']);

        $selectedIntakeIds = $validated['intake_ids'];
        $applyToOption = $validated['apply_to_option'];

        foreach ($validated['intake_ids'] as $intakeId) {
            if ($intakeId == $task->intake_id) {
                continue;
            }

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
                    'version_number' => $task->version_number,
                    'unique_identifier' => $task->unique_identifier,
                    'parent_task_id' => $existingTask->id,
                    'updated_by' => auth()->id(),
                    'task_code' => $existingTask->task_code,
                    'apply_to_option' => $applyToOption,
                    'selected_intake_ids' => json_encode($selectedIntakeIds),
                ]));
            } else {
                // Create a new task with the same task_code
                Task::create(array_merge($taskData, [
                    'intake_id' => $intakeId,
                    'version_number' => $task->version_number, // Use the current task's version_number
                    'parent_task_id' => null,
                    'updated_by' => auth()->id(),
                    'task_code' => $task->task_code,
                    'apply_to_option' => $applyToOption,
                    'selected_intake_ids' => json_encode($selectedIntakeIds),
                    'unique_identifier' => $task->unique_identifier,
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

    public function getTaskVersions(Task $task)
    {
        $versions = Task::where('task_code', $task->task_code)
            ->where('intake_id', $task->intake_id)
            ->with('admin')
            ->orderBy('version_number', 'desc')
            ->get();

        return response()->json($versions);
    }

    public function getLatestVersionNumber(Task $task)
    {
        $latestVersion = Task::where('task_code', $task->task_code)
            ->where('intake_id', $task->intake_id)
            ->orderBy('version_number', 'desc')
            ->first();

        return response()->json(['latest_version_number' => $latestVersion->version_number]);
    }

    public function revert(Request $request, Task $task)
    {
        // Get the latest global version number for the task_code
        $latestVersionNumber = Task::where('task_code', $task->task_code)->max('version_number') ?? 0;
        $newVersionNumber = $latestVersionNumber + 1;

        // Get the intakes where the revert should be applied
        $applyToOption = $task->apply_to_option;
        $selectedIntakeIds = json_decode($task->selected_intake_ids, true);

        if ($applyToOption === 'all') {
            // Get all intakes for the program
            $intakeIds = Intake::where('program_id', $task->intake->program_id)->pluck('id')->toArray();
        } elseif ($applyToOption === 'custom') {
            // Use the selected_intake_ids
            $intakeIds = $selectedIntakeIds ?? [];
        } else {
            // 'this' intake only
            $intakeIds = [$task->intake_id];
        }

        foreach ($intakeIds as $intakeId) {
            // Find the latest task in this intake
            $latestTaskInIntake = Task::where('task_code', $task->task_code)
                ->where('intake_id', $intakeId)
                ->orderBy('version_number', 'desc')
                ->first();

            if ($latestTaskInIntake) {
                // Create a new version copying data from the selected task
                $newVersion = Task::create([
                    'name' => $task->name,
                    'category' => $task->category,
                    'task_weight' => $task->task_weight,
                    'intake_id' => $intakeId,
                    'version_number' => $newVersionNumber,
                    'parent_task_id' => $latestTaskInIntake->id,
                    'updated_by' => auth()->id(),
                    'task_code' => $task->task_code,
                    'apply_to_option' => $task->apply_to_option,
                    'selected_intake_ids' => $task->selected_intake_ids,
                    'unique_identifier' => $task->unique_identifier,
                ]);
            } else {
                // If no existing task in this intake, skip this intake
                continue;
            }
        }

        return response()->json(['message' => 'Task reverted successfully']);
    }
}
