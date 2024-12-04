<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;
use DateTime;

class Task extends Model
{
    use HasFactory;
    protected $fillable = ['name', 'category'];

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
        return $this->belongsTo(Admin::class); // Assuming you have an Admin model
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

        if ($this->progressUpdates->isEmpty()) {
            return $currentDate <= $semesterEnd ? 'onTrackPending' : 'delayedPending';
        }

        // Get the most recent valid update
        $latestUpdate = $this->progressUpdates
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
        // Log::info('Latest Update: ' . json_encode($latestUpdate)); // Log as JSON for better debugging
        // Log::info('Completion Date: ' . ($completionDate ? $completionDate->format('Y-m-d H:i:s') : 'null'));
        // Log::info('Semester End Date: ' . $semesterEnd->format('Y-m-d H:i:s'));

        // Special case: tasks with specific progress statuses
        if (in_array($progressStatus, ['Pending', 'In Progress'])) {
            return $currentDate <= $semesterEnd ? 'onTrackPending' : 'delayedPending';
        }

        // Check completion date
        if ($completionDate <= $semesterEnd) {
            return 'onTrackCompleted';
        } else {
            return 'delayedCompleted';
        }
    }
}
