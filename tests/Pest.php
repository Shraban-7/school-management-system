<?php

use App\Helpers\GradeScale;
use App\Models\AcademicSession;
use App\Models\ClassesAndSection;
use App\Models\Exam;
use App\Models\Institution;
use App\Models\Mark;
use App\Models\Student;
use App\Models\Subject;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/*
|--------------------------------------------------------------------------
| Test Case
|--------------------------------------------------------------------------
|
| The closure you provide to your test functions is always bound to a specific PHPUnit test
| case class. By default, that class is "PHPUnit\Framework\TestCase". Of course, you may
| need to change it using the "pest()" function to bind different classes or traits.
|
*/

pest()->extend(TestCase::class)
    ->use(RefreshDatabase::class)
    ->beforeEach(fn () => Institution::forgetCurrentCache())
    ->in('Feature');

/*
|--------------------------------------------------------------------------
| Expectations
|--------------------------------------------------------------------------
|
| When you're writing tests, you often need to check that values meet certain conditions. The
| "expect()" function gives you access to a set of "expectations" methods that you can use
| to assert different things. Of course, you may extend the Expectation API at any time.
|
*/

expect()->extend('toBeOne', function () {
    return $this->toBe(1);
});

/*
|--------------------------------------------------------------------------
| Functions
|--------------------------------------------------------------------------
|
| While Pest is very powerful out-of-the-box, you may have some testing code specific to your
| project that you don't want to repeat in every file. Here you can also expose helpers as
| global functions to help you to reduce the number of lines of code in your test files.
|
*/

function makeInstitution(array $overrides = []): Institution
{
    Institution::forgetCurrentCache();

    return Institution::forceCreate(array_merge([
        'name_en' => 'Test School',
        'name_bn' => 'টেস্ট স্কুল',
        'eiin_number' => random_int(100000, 999999),
        'board_affiliation' => 'Dhaka',
        'mpo_status' => true,
    ], $overrides));
}

function makeClass(Institution $institution, array $overrides = []): ClassesAndSection
{
    return ClassesAndSection::forceCreate(array_merge([
        'institution_id' => $institution->id,
        'version' => 'English',
        'class_level' => 'Class 9',
        'section_name' => 'A',
    ], $overrides));
}

function makeSubject(Institution $institution, array $overrides = []): Subject
{
    return Subject::forceCreate(array_merge([
        'institution_id' => $institution->id,
        'name_en' => 'Mathematics',
        'name_bn' => 'গণিত',
        'class_level' => 'Class 9',
        'subject_type' => 'compulsory',
        'full_marks' => 100,
        'pass_marks' => 33,
        'is_active' => true,
    ], $overrides));
}

function makeExam(Institution $institution, int $sessionId, array $overrides = []): Exam
{
    return Exam::forceCreate(array_merge([
        'institution_id' => $institution->id,
        'session_id' => $sessionId,
        'name_en' => 'Half Yearly',
        'exam_type' => 'Half Yearly',
        'start_date' => '2026-05-01',
        'end_date' => '2026-05-15',
        'is_published' => true,
    ], $overrides));
}

function makeAcademicSession(array $overrides = []): AcademicSession
{
    return AcademicSession::forceCreate(array_merge([
        'session_name' => '2026',
        'start_date' => '2026-01-01',
        'end_date' => '2026-12-31',
        'is_active' => true,
    ], $overrides));
}

function makeStudent(Institution $institution, array $overrides = []): Student
{
    static $roll = 0;
    $roll++;

    return Student::forceCreate(array_merge([
        'institution_id' => $institution->id,
        'roll_number' => (string) $roll,
        'name_en' => 'Test Student '.$roll,
        'name_bn' => 'শিক্ষার্থী '.$roll,
        'gender' => 'Male',
        'is_active' => true,
    ], $overrides));
}

function makeMark(Exam $exam, Subject $subject, Student $student, float $total, bool $absent = false): Mark
{
    $grade = $absent
        ? ['grade' => null, 'point' => null]
        : GradeScale::calculate($total, (float) $subject->full_marks, (float) $subject->pass_marks);

    return Mark::forceCreate([
        'exam_id' => $exam->id,
        'subject_id' => $subject->id,
        'student_id' => $student->id,
        'written_marks' => $absent ? null : $total,
        'mcq_marks' => $absent ? null : 0,
        'practical_marks' => $absent ? null : 0,
        'total_marks' => $absent ? null : $total,
        'grade_point' => $grade['point'],
        'grade_letter' => $grade['grade'],
        'is_absent' => $absent,
    ]);
}
