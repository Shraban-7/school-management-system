<?php

namespace Database\Seeders;

use App\Models\AttendanceRecord;
use App\Models\ClassesAndSection;
use App\Models\Student;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class AttendanceRecordSeeder extends Seeder
{
    public function run(): void
    {
        $students = Student::where('is_active', true)->get();
        $adminUser = \App\Models\User::where('email', 'admin@example.com')->first();

        $dates = [];
        $now = Carbon::now();
        for ($d = 0; $d < 20; $d++) {
            $date = $now->copy()->subDays($d);
            if ($date->isWeekday()) {
                $dates[] = $date->format('Y-m-d');
            }
        }

        foreach ($dates as $date) {
            foreach ($students as $student) {
                $status = fake()->randomElement(['present', 'present', 'present', 'present', 'absent', 'late']);

                AttendanceRecord::create([
                    'student_id' => $student->id,
                    'classes_and_sections_id' => $student->class_id,
                    'taken_by' => $adminUser?->id,
                    'date' => $date,
                    'status' => $status,
                    'remarks' => $status === 'absent' ? fake()->randomElement(['Sick', 'Family event', 'Unknown']) : null,
                ]);
            }
        }
    }
}
