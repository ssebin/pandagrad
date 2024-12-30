<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Task;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AssignTaskCodes extends Command
{
    protected $signature = 'tasks:assign_task_codes';
    protected $description = 'Assign task_code to existing tasks';

    public function handle()
    {
        $this->info('Starting to assign task_code to tasks...');

        // Disable query logging and events for performance
        DB::connection()->disableQueryLog();
        Task::withoutEvents(function () {
            // Get all tasks that don't have a task_code
            $tasksWithoutTaskCode = Task::whereNull('task_code')->get();

            $processedTaskIds = [];

            foreach ($tasksWithoutTaskCode as $task) {
                if (in_array($task->id, $processedTaskIds)) {
                    continue; // Skip if already processed
                }

                // Start from the root of the version chain
                $rootTask = $task;
                while ($rootTask->parent_task_id) {
                    $rootTask = Task::find($rootTask->parent_task_id);
                    if (!$rootTask) {
                        break;
                    }
                }

                if (!$rootTask) {
                    $this->error('Could not find root task for task ID: ' . $task->id);
                    continue;
                }

                // Generate a unique task_code
                $taskCode = Str::uuid()->toString();

                // Assign task_code to the root task
                $rootTask->task_code = $taskCode;
                $rootTask->save();

                $processedTaskIds[] = $rootTask->id;

                // Traverse the version chain and assign task_code
                $this->assignTaskCodeToChain($rootTask, $taskCode, $processedTaskIds);
            }
        });

        $this->info('Task codes assigned successfully.');
    }

    private function assignTaskCodeToChain($task, $taskCode, &$processedTaskIds)
    {
        // Get all versions where parent_task_id is this task's id
        $childTasks = Task::where('parent_task_id', $task->id)->get();

        foreach ($childTasks as $childTask) {
            if (in_array($childTask->id, $processedTaskIds)) {
                continue;
            }

            $childTask->task_code = $taskCode;
            $childTask->save();

            $processedTaskIds[] = $childTask->id;

            // Recursively process any further versions
            $this->assignTaskCodeToChain($childTask, $taskCode, $processedTaskIds);
        }
    }
}
