<?php

namespace Database\Seeders;

use App\Models\ClassesAndSection;
use Illuminate\Database\Seeder;

class ClassesAndSectionSeeder extends Seeder
{
    public function run(): void
    {
        $classes = [];
        $institutions = [1];
        $levels = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
        $sections = ['A', 'B', 'C'];

        foreach ($institutions as $instId) {
            foreach ($levels as $level) {
                foreach ($sections as $sec) {
                    $classes[] = [
                        'institution_id' => $instId,
                        'version' => 'Bangla Medium',
                        'class_level' => $level,
                        'group_stream' => in_array($level, ['Class 9', 'Class 10']) ? 'Science' : null,
                        'section_name' => $sec,
                        'room_number' => rand(101, 310),
                    ];
                }
            }
        }

        ClassesAndSection::insert($classes);
    }
}
