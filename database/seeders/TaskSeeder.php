<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Task;

class TaskSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $tasks = [
            ['name' => 'Bahasa Melayu Course', 'category' => 'Courses'],
            ['name' => 'Core Courses', 'category' => 'Courses'],
            ['name' => 'Elective Courses', 'category' => 'Courses'],
            ['name' => 'Research Methodology Course', 'category' => 'Courses'],
            ['name' => 'Research Proposal', 'category' => 'Research Proposal'],
            ['name' => 'Candidature Defence', 'category' => 'Candidature Defence'],
            ['name' => 'Chapters 1, 2, and 3 of Dissertation', 'category' => 'Dissertation'],
            ['name' => 'All Chapters of Dissertation', 'category' => 'Dissertation'],
            ['name' => 'Dissertation Submission for Examination', 'category' => 'Dissertation'],
            ['name' => 'Dissertation Submission After Correction', 'category' => 'Dissertation'],
            ['name' => 'Committee of Examiners Meeting', 'category' => 'Committee of Examiners Meeting'],
            ['name' => 'Approval of Correction by JKIT', 'category' => 'Approval of Correction by JKIT'],
            ['name' => 'Senate Approval', 'category' => 'Senate Approval'],
            ['name' => 'Submission of Appointment of Supervisor Form', 'category' => 'Other Requirements'],
            ['name' => 'Residential Requirement', 'category' => 'Other Requirements'],
        ];

        foreach ($tasks as $task) {
            Task::create($task);
        }
    }
}
