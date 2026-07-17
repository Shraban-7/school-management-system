<?php

namespace App\Services;

use App\Helpers\GradeScale;
use App\Models\Exam;
use App\Models\Mark;
use App\Models\Student;
use Illuminate\Support\Collection;

/**
 * Turns raw marks into Bangladesh-style GPA results.
 *
 * Rules applied (school default — confirm against the board before assuming
 * they are exact, see FEATURES.md):
 *  - Each subject is graded from total_marks against the subject's own
 *    full_marks / pass_marks (A+ 80-100 = 5.0 … D 33-39 = 1.0, F below pass).
 *  - Failing (or being absent in) ANY subject fails the whole result and the
 *    combined GPA becomes 0.00 — this is the standard SSC/HSC rule.
 *  - Combined GPA (when passed) is the average of subject grade points,
 *    rounded to 2 decimals. The optional-/4th-subject grace-point adjustment
 *    used by some public boards is NOT applied — flag for owner if needed.
 */
class ResultService
{
    /**
     * Evaluate a single subject mark into a grade row.
     *
     * @return array<string, mixed>
     */
    public function evaluateMark(Mark $mark): array
    {
        $subject = $mark->subject;
        $full = (float) ($subject?->full_marks ?: 100);
        $pass = (float) ($subject?->pass_marks ?: 33);

        $base = [
            'subject_id' => $mark->subject_id,
            'subject_en' => $subject?->name_en,
            'subject_bn' => $subject?->name_bn,
            'full_marks' => $full,
            'pass_marks' => $pass,
            'written_marks' => $mark->is_absent ? null : (float) $mark->written_marks,
            'mcq_marks' => $mark->is_absent ? null : (float) $mark->mcq_marks,
            'practical_marks' => $mark->is_absent ? null : (float) $mark->practical_marks,
        ];

        if ($mark->is_absent) {
            return $base + [
                'total' => null,
                'grade' => 'Abs',
                'point' => 0.00,
                'passed' => false,
                'is_absent' => true,
            ];
        }

        $total = (float) $mark->total_marks;
        $grade = GradeScale::calculate($total, $full, $pass);

        return $base + [
            'total' => $total,
            'grade' => $grade['grade'],
            'point' => $grade['point'],
            'passed' => $total >= $pass,
            'is_absent' => false,
        ];
    }

    /**
     * Aggregate a collection of evaluated subject rows into an overall result.
     *
     * @param  Collection<int, array<string, mixed>>  $subjects
     * @return array<string, mixed>
     */
    public function summarize(Collection $subjects): array
    {
        if ($subjects->isEmpty()) {
            return [
                'subject_count' => 0,
                'total' => 0.0,
                'full_total' => 0.0,
                'failed_count' => 0,
                'gpa' => null,
                'grade' => 'N/A',
                'passed' => null,
            ];
        }

        $failed = $subjects->where('passed', false)->count();
        $totalObtained = (float) $subjects->whereNotNull('total')->sum('total');
        $fullTotal = (float) $subjects->sum('full_marks');

        if ($failed > 0) {
            return [
                'subject_count' => $subjects->count(),
                'total' => $totalObtained,
                'full_total' => $fullTotal,
                'failed_count' => $failed,
                'gpa' => 0.00,
                'grade' => 'F',
                'passed' => false,
            ];
        }

        $gpa = round((float) $subjects->avg('point'), 2);

        return [
            'subject_count' => $subjects->count(),
            'total' => $totalObtained,
            'full_total' => $fullTotal,
            'failed_count' => 0,
            'gpa' => $gpa,
            'grade' => GradeScale::letterFromGpa($gpa),
            'passed' => true,
        ];
    }

    /**
     * Full report card for one student in one exam.
     *
     * @return array<string, mixed>
     */
    public function studentResult(Student $student, Exam $exam): array
    {
        $marks = Mark::query()
            ->where('exam_id', $exam->id)
            ->where('student_id', $student->id)
            ->with('subject')
            ->get();

        $subjects = $marks
            ->map(fn (Mark $m) => $this->evaluateMark($m))
            ->sortBy('subject_en')
            ->values();

        return $this->summarize($subjects) + [
            'subjects' => $subjects->all(),
            'has_marks' => $marks->isNotEmpty(),
        ];
    }

    /**
     * Class/section tabulation for an exam: a ranked list of students with
     * their per-subject grades and overall result.
     *
     * @return array{columns: array<int, array{id: int, name_en: ?string}>, rows: array<int, array<string, mixed>>}
     */
    public function classResults(Exam $exam, ?int $classId = null): array
    {
        $students = Student::query()
            ->where('institution_id', $exam->institution_id)
            ->where('is_active', true)
            ->when($classId, fn ($q) => $q->where('class_id', $classId))
            ->with('class:id,class_level,section_name')
            ->orderBy('roll_number')
            ->get();

        $marksByStudent = Mark::query()
            ->where('exam_id', $exam->id)
            ->whereIn('student_id', $students->pluck('id'))
            ->with('subject')
            ->get()
            ->groupBy('student_id');

        $columns = collect();

        $rows = $students->map(function (Student $student) use ($marksByStudent, $columns) {
            $evaluated = ($marksByStudent[$student->id] ?? collect())
                ->map(fn (Mark $m) => $this->evaluateMark($m))
                ->sortBy('subject_en')
                ->values();

            foreach ($evaluated as $row) {
                if ($row['subject_id'] && ! $columns->has($row['subject_id'])) {
                    $columns->put($row['subject_id'], [
                        'id' => $row['subject_id'],
                        'name_en' => $row['subject_en'],
                    ]);
                }
            }

            $summary = $this->summarize($evaluated);

            return [
                'student_id' => $student->id,
                'roll_number' => $student->roll_number,
                'name_en' => $student->name_en,
                'name_bn' => $student->name_bn,
                'class_label' => $student->class
                    ? trim($student->class->class_level.' '.$student->class->section_name)
                    : null,
                'subjects' => $evaluated->keyBy('subject_id')->all(),
                'gpa' => $summary['gpa'],
                'grade' => $summary['grade'],
                'total' => $summary['total'],
                'full_total' => $summary['full_total'],
                'passed' => $summary['passed'],
                'failed_count' => $summary['failed_count'],
                'has_marks' => $evaluated->isNotEmpty(),
            ];
        });

        $ranked = $rows
            ->sort(function (array $a, array $b) {
                if ($a['passed'] !== $b['passed']) {
                    return $a['passed'] ? -1 : 1;
                }

                return ($b['gpa'] <=> $a['gpa']) ?: ($b['total'] <=> $a['total']);
            })
            ->values();

        $position = 0;
        $ranked = $ranked->map(function (array $row) use (&$position) {
            $position++;
            $row['position'] = $row['has_marks'] ? $position : null;

            return $row;
        });

        return [
            'columns' => $columns->values()->all(),
            'rows' => $ranked->all(),
        ];
    }
}
