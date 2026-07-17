<?php

namespace Database\Seeders;

use App\Models\Exam;
use Illuminate\Database\Seeder;

class ExamSeeder extends Seeder
{
    public function run(): void
    {
        $institutions = [1];

        foreach ($institutions as $instId) {
            Exam::insert([
                [
                    'institution_id' => $instId,
                    'session_id' => 3,
                    'name_en' => 'Half Yearly Examination 2026',
                    'name_bn' => 'অর্ধবার্ষিক পরীক্ষা ২০২৬',
                    'exam_type' => 'Half Yearly',
                    'start_date' => '2026-05-01',
                    'end_date' => '2026-05-15',
                    'is_published' => true,
                    'description' => 'Half yearly examination for all classes.',
                ],
                [
                    'institution_id' => $instId,
                    'session_id' => 3,
                    'name_en' => 'Annual Final Examination 2026',
                    'name_bn' => 'বার্ষিক পরীক্ষা ২০২৬',
                    'exam_type' => 'Final',
                    'start_date' => '2026-11-01',
                    'end_date' => '2026-11-20',
                    'is_published' => false,
                    'description' => 'Annual final examination for all classes.',
                ],
            ]);
        }
    }
}
