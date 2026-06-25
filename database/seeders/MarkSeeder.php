<?php

namespace Database\Seeders;

use App\Helpers\GradeScale;
use App\Models\Exam;
use App\Models\Mark;
use App\Models\Student;
use App\Models\Subject;
use Illuminate\Database\Seeder;

class MarkSeeder extends Seeder
{
    public function run(): void
    {
        $exams = Exam::where('is_published', true)->get();
        $students = Student::where('is_active', true)->get();
        $subjects = Subject::where('is_active', true)->get();

        foreach ($exams as $exam) {
            foreach ($students as $student) {
                $classSubjects = $subjects->where('institution_id', $exam->institution_id);

                foreach ($classSubjects as $subject) {
                    $written = round(rand(20, 70) + rand(0, 99) / 100, 1);
                    $mcq = round(rand(10, 28) + rand(0, 99) / 100, 1);
                    $practical = round(rand(5, 18) + rand(0, 99) / 100, 1);
                    $total = $written + $mcq + $practical;
                    $result = GradeScale::calculate($total, 100);
                    $isAbsent = fake()->boolean(10);

                    Mark::create([
                        'exam_id' => $exam->id,
                        'subject_id' => $subject->id,
                        'student_id' => $student->id,
                        'written_marks' => $isAbsent ? null : $written,
                        'mcq_marks' => $isAbsent ? null : $mcq,
                        'practical_marks' => $isAbsent ? null : $practical,
                        'total_marks' => $isAbsent ? null : $total,
                        'grade_point' => $isAbsent ? null : $result['point'],
                        'grade_letter' => $isAbsent ? null : $result['grade'],
                        'is_absent' => $isAbsent,
                        'remarks' => $isAbsent ? 'Absent' : null,
                    ]);
                }
            }
        }
    }
}
