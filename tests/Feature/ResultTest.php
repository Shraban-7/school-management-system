<?php

use App\Enums\UserRole;
use App\Helpers\GradeScale;
use App\Models\Mark;
use App\Models\User;
use App\Services\ResultService;
use Inertia\Testing\AssertableInertia as Assert;

// ---------------------------------------------------------------------------
// Grade scale
// ---------------------------------------------------------------------------

it('maps marks to the BD grading scale', function (float $marks, string $grade, float $point) {
    $result = GradeScale::calculate($marks, 100, 33);

    expect($result['grade'])->toBe($grade)
        ->and($result['point'])->toBe($point);
})->with([
    'A+ lower bound' => [80.0, 'A+', 5.00],
    'A+ upper bound' => [100.0, 'A+', 5.00],
    'A' => [75.0, 'A', 4.00],
    'A-' => [65.0, 'A-', 3.50],
    'B' => [55.0, 'B', 3.00],
    'C' => [45.0, 'C', 2.00],
    'D lower bound' => [33.0, 'D', 1.00],
    'F below 33' => [30.0, 'F', 0.00],
]);

it('fails a mark below subject pass marks even if the percentage band would pass', function () {
    // 40/100 with pass_marks 50 (e.g. a subject where the school set a higher bar)
    $result = GradeScale::calculate(40, 100, 50);

    expect($result['grade'])->toBe('F')
        ->and($result['point'])->toBe(0.00);
});

it('grades against the subject full marks, not a fixed 100', function () {
    // 40/50 = 80% => A+
    $result = GradeScale::calculate(40, 50, 17);

    expect($result['grade'])->toBe('A+')
        ->and($result['point'])->toBe(5.00);
});

// ---------------------------------------------------------------------------
// Result service
// ---------------------------------------------------------------------------

it('computes a passed combined result as the average of subject points', function () {
    $institution = makeInstitution();
    $session = makeAcademicSession();
    $exam = makeExam($institution, $session->id);
    $student = makeStudent($institution);

    $math = makeSubject($institution, ['name_en' => 'Mathematics']);
    $english = makeSubject($institution, ['name_en' => 'English']);

    makeMark($exam, $math, $student, 85);    // A+ 5.0
    makeMark($exam, $english, $student, 65); // A- 3.5

    $result = app(ResultService::class)->studentResult($student, $exam);

    expect($result['passed'])->toBeTrue()
        ->and($result['gpa'])->toBe(4.25)
        ->and($result['grade'])->toBe('A')
        ->and($result['failed_count'])->toBe(0);
});

it('fails the whole result when any subject is failed', function () {
    $institution = makeInstitution();
    $session = makeAcademicSession();
    $exam = makeExam($institution, $session->id);
    $student = makeStudent($institution);

    makeMark($exam, makeSubject($institution, ['name_en' => 'Mathematics']), $student, 90);
    makeMark($exam, makeSubject($institution, ['name_en' => 'English']), $student, 20); // F

    $result = app(ResultService::class)->studentResult($student, $exam);

    expect($result['passed'])->toBeFalse()
        ->and($result['gpa'])->toBe(0.00)
        ->and($result['grade'])->toBe('F')
        ->and($result['failed_count'])->toBe(1);
});

it('treats an absent subject as a fail', function () {
    $institution = makeInstitution();
    $session = makeAcademicSession();
    $exam = makeExam($institution, $session->id);
    $student = makeStudent($institution);

    makeMark($exam, makeSubject($institution, ['name_en' => 'Mathematics']), $student, 90);
    makeMark($exam, makeSubject($institution, ['name_en' => 'English']), $student, 0, absent: true);

    $result = app(ResultService::class)->studentResult($student, $exam);

    expect($result['passed'])->toBeFalse()
        ->and($result['gpa'])->toBe(0.00);
});

it('ranks students by GPA then total marks in class results', function () {
    $institution = makeInstitution();
    $session = makeAcademicSession();
    $exam = makeExam($institution, $session->id);
    $class = makeClass($institution);

    $math = makeSubject($institution, ['name_en' => 'Mathematics']);

    $top = makeStudent($institution, ['class_id' => $class->id, 'name_en' => 'Top Scorer']);
    $mid = makeStudent($institution, ['class_id' => $class->id, 'name_en' => 'Mid Scorer']);
    $fail = makeStudent($institution, ['class_id' => $class->id, 'name_en' => 'Failed Student']);

    makeMark($exam, $math, $top, 95);
    makeMark($exam, $math, $mid, 75);
    makeMark($exam, $math, $fail, 10);

    $tabulation = app(ResultService::class)->classResults($exam, $class->id);
    $rows = collect($tabulation['rows']);

    expect($rows->pluck('name_en')->all())
        ->toBe(['Top Scorer', 'Mid Scorer', 'Failed Student'])
        ->and($rows->first()['position'])->toBe(1)
        ->and($rows->last()['passed'])->toBeFalse();
});

// ---------------------------------------------------------------------------
// Routes & authorization
// ---------------------------------------------------------------------------

it('shows the admin tabulation page', function () {
    $institution = makeInstitution();
    $session = makeAcademicSession();
    $exam = makeExam($institution, $session->id);
    $student = makeStudent($institution);
    makeMark($exam, makeSubject($institution), $student, 85);

    $admin = User::factory()->create(['role' => UserRole::ADMIN]);

    $this->actingAs($admin)
        ->get("/admin/results/{$exam->id}")
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Results/Show')
            ->has('rows', 1)
            ->where('rows.0.gpa', 5)
        );
});

it('downloads a gradesheet PDF as admin', function () {
    $institution = makeInstitution();
    $session = makeAcademicSession();
    $exam = makeExam($institution, $session->id);
    $student = makeStudent($institution);
    makeMark($exam, makeSubject($institution), $student, 85);

    $admin = User::factory()->create(['role' => UserRole::ADMIN]);

    $response = $this->actingAs($admin)
        ->get("/admin/results/{$exam->id}/students/{$student->id}/pdf");

    $response->assertSuccessful();
    expect($response->headers->get('content-type'))->toContain('application/pdf');
});

it('lets a student see their own published result', function () {
    $institution = makeInstitution();
    $session = makeAcademicSession();
    $exam = makeExam($institution, $session->id);

    $user = User::factory()->create(['role' => UserRole::STUDENT]);
    $student = makeStudent($institution, ['user_id' => $user->id]);
    makeMark($exam, makeSubject($institution), $student, 85);

    $this->actingAs($user)
        ->get("/student/results/{$exam->id}")
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Student/Results/Show')
            ->where('report.summary.gpa', 5)
        );
});

it('hides unpublished exams from students', function () {
    $institution = makeInstitution();
    $session = makeAcademicSession();
    $exam = makeExam($institution, $session->id, ['is_published' => false]);

    $user = User::factory()->create(['role' => UserRole::STUDENT]);
    $student = makeStudent($institution, ['user_id' => $user->id]);
    makeMark($exam, makeSubject($institution), $student, 85);

    $this->actingAs($user)
        ->get("/student/results/{$exam->id}")
        ->assertNotFound();
});

it('lets a parent see their linked child result but not other students', function () {
    $institution = makeInstitution();
    $session = makeAcademicSession();
    $exam = makeExam($institution, $session->id);

    $child = makeStudent($institution);
    $otherStudent = makeStudent($institution);
    $subject = makeSubject($institution);
    makeMark($exam, $subject, $child, 85);
    makeMark($exam, $subject, $otherStudent, 85);

    $parent = User::factory()->create(['role' => UserRole::PARENT]);
    $child->guardians()->attach($parent->id, ['relation' => 'Father']);

    $this->actingAs($parent)
        ->get("/parent/children/{$child->id}/results/{$exam->id}")
        ->assertSuccessful();

    // 403s are converted to a redirect + flash error so the UI can show a
    // "not authorized" modal instead of Laravel's error page.
    $this->actingAs($parent)
        ->get("/parent/children/{$otherStudent->id}/results/{$exam->id}")
        ->assertRedirect(route('parent.dashboard'))
        ->assertSessionHas('flash.error');
});

it('blocks non-admin roles from admin result routes', function () {
    $institution = makeInstitution();
    $session = makeAcademicSession();
    $exam = makeExam($institution, $session->id);

    $teacher = User::factory()->create(['role' => UserRole::TEACHER]);

    $this->actingAs($teacher)
        ->get("/admin/results/{$exam->id}")
        ->assertRedirect(route('teacher.dashboard'))
        ->assertSessionHas('flash.error');
});

// ---------------------------------------------------------------------------
// Marks entry recalculation
// ---------------------------------------------------------------------------

it('recalculates grade from subject full and pass marks when saving marks', function () {
    $institution = makeInstitution();
    $session = makeAcademicSession();
    $exam = makeExam($institution, $session->id);
    $student = makeStudent($institution);
    // 50-mark subject: 40/50 = 80% should be A+
    $subject = makeSubject($institution, ['full_marks' => 50, 'pass_marks' => 17]);

    $admin = User::factory()->create(['role' => UserRole::ADMIN]);

    $this->actingAs($admin)
        ->post("/admin/exams/{$exam->id}/marks", [
            'marks' => [
                [
                    'student_id' => $student->id,
                    'subject_id' => $subject->id,
                    'written_marks' => 40,
                    'mcq_marks' => 0,
                    'practical_marks' => 0,
                    'is_absent' => false,
                ],
            ],
        ])
        ->assertRedirect();

    $mark = Mark::where('exam_id', $exam->id)
        ->where('student_id', $student->id)
        ->first();

    expect($mark->grade_letter)->toBe('A+')
        ->and((float) $mark->grade_point)->toBe(5.00)
        ->and((float) $mark->total_marks)->toBe(40.0);
});
