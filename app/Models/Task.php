<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use DateTime;

class Task extends Model
{
    use HasFactory;
    protected $fillable = ['name', 'category', 'task_weight', 'intake_id', 'version_number', 'parent_task_id', 'unique_identifier', 'updated_by', 'task_code', 'apply_to_option', 'selected_intake_ids',];
    public $timestamps = true;

    public function studyPlans()
    {
        return $this->belongsToMany(StudyPlan::class);
    }

    public function progressUpdates()
    {
        return $this->hasMany(ProgressUpdate::class);
    }

    public function admin()
    {
        return $this->belongsTo(Admin::class, 'updated_by', 'AdminID');
    }

    public function intake()
    {
        return $this->belongsTo(Intake::class);
    }

    public function previousVersion()
    {
        return $this->belongsTo(Task::class, 'parent_task_id');
    }

    public function nextVersions()
    {
        return $this->hasMany(Task::class, 'parent_task_id');
    }

    public function determineStatus($semesterEndDate)
    {
        $currentDate = new DateTime();

        // Handle undefined or invalid semesterEndDate
        if (!$semesterEndDate) {
            Log::warning("Semester end date is unavailable; defaulting to onTrackPending.");
            return 'onTrackPending';
        }

        $semesterEnd = new DateTime($semesterEndDate);

        // Exclude progress updates marked as pending
        $validProgressUpdates = $this->progressUpdates->filter(function ($update) {
            return $update->approved === 1;
        });

        if ($validProgressUpdates->isEmpty()) {
            return $currentDate <= $semesterEnd ? 'onTrackPending' : 'delayedPending';
        }

        // Get the most recent valid update
        $latestUpdate = $validProgressUpdates
            ->filter(function ($update) {
                return $update->updated_at !== null && strtotime($update->updated_at) !== false;
            })
            ->sortByDesc(function ($update) {
                return strtotime($update->updated_at);
            })
            ->first();

        if (!$latestUpdate) {
            return $currentDate <= $semesterEnd ? 'onTrackPending' : 'delayedPending';
        }

        $progressStatus = $latestUpdate->progress_status ?? null;
        $completionDate = $latestUpdate->completion_date
            ? new DateTime($latestUpdate->completion_date)
            : null;
        Log::info('Latest Update: ' . json_encode($latestUpdate)); // Log as JSON for better debugging

        // Special case: tasks with specific progress statuses
        if (in_array($progressStatus, ['Pending', 'In Progress'])) {
            return $currentDate <= $semesterEnd ? 'onTrackPending' : 'delayedPending';
        }

        // Check completion date
        if ($completionDate <= $semesterEnd) {
            log::info('Task completed on time');
            return 'onTrackCompleted';
        } else {
            log::info('Task completed after semester end date');
            return 'delayedCompleted';
        }
    }
}
