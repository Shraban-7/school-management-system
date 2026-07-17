<?php

namespace App\Http\Controllers;

use App\Models\ClassesAndSection;
use App\Models\Exam;
use App\Models\Student;
use App\Models\User;
use App\Services\ResultService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Inertia\Inertia;
use Inertia\Response;

class ResultController extends Controller
{
    public function __construct(private readonly ResultService $results) {}

    // ---------------------------------------------------------------------
    // Admin
    // ---------------------------------------------------------------------

    public function index(): Response
    {
        return Inertia::render('Admin/Results/Index', [
            'exams' => $this->examList(),
            'sidebar' => app(DashboardController::class)->adminSidebar(),
        ]);
    }

    public function show(Request $request, Exam $exam): Response
    {
        $exam->load(['institution:id,name_en,name_bn', 'session:id,session_name']);

        $classId = $request->integer('class_id') ?: null;

        $tabulation = $this->results->classResults($exam, $classId);

        return Inertia::render('Admin/Results/Show', [
            'exam' => $this->examPayload($exam),
            'classes' => $this->classOptions($exam),
            'selectedClassId' => $classId,
            'columns' => $tabulation['columns'],
            'rows' => $tabulation['rows'],
            'sidebar' => app(DashboardController::class)->adminSidebar(),
        ]);
    }

    public function reportCard(Exam $exam, Student $student): Response
    {
        return Inertia::render('Admin/Results/ReportCard', [
            'report' => $this->buildReportCard($exam, $student),
            'backHref' => "/admin/results/{$exam->id}",
            'pdfHref' => "/admin/results/{$exam->id}/students/{$student->id}/pdf",
            'sidebar' => app(DashboardController::class)->adminSidebar(),
        ]);
    }

    public function reportCardPdf(Exam $exam, Student $student): HttpResponse
    {
        return $this->streamReportCardPdf($exam, $student);
    }

    // ---------------------------------------------------------------------
    // Student (read-only, own published results)
    // ---------------------------------------------------------------------

    public function studentIndex(Request $request): Response
    {
        $student = $this->studentFor($request->user());

        return Inertia::render('Student/Results/Index', [
            'exams' => $student ? $this->examList($student, publishedOnly: true) : [],
            'hasProfile' => $student !== null,
            'sidebar' => app(DashboardController::class)->studentSidebar(),
        ]);
    }

    public function studentShow(Request $request, Exam $exam): Response|RedirectResponse
    {
        $student = $this->studentFor($request->user());

        abort_unless($student !== null, 403, 'No student profile is linked to your account.');
        $this->assertPublishedFor($exam, $student);

        return Inertia::render('Student/Results/Show', [
            'report' => $this->buildReportCard($exam, $student),
            'backHref' => '/student/results',
            'pdfHref' => "/student/results/{$exam->id}/pdf",
            'sidebar' => app(DashboardController::class)->studentSidebar(),
        ]);
    }

    public function studentPdf(Request $request, Exam $exam): HttpResponse
    {
        $student = $this->studentFor($request->user());

        abort_unless($student !== null, 403);
        $this->assertPublishedFor($exam, $student);

        return $this->streamReportCardPdf($exam, $student);
    }

    // ---------------------------------------------------------------------
    // Parent (read-only, published results for their children)
    // ---------------------------------------------------------------------

    public function parentIndex(Request $request): Response
    {
        $children = $request->user()->children()->with('class:id,class_level,section_name')->get();

        return Inertia::render('Parent/Results/Index', [
            'children' => $children->map(fn (Student $c) => [
                'id' => $c->id,
                'name_en' => $c->name_en,
                'roll_number' => $c->roll_number,
                'class_label' => $c->class
                    ? trim($c->class->class_level.' '.$c->class->section_name)
                    : null,
                'href' => "/parent/children/{$c->id}/results",
            ])->all(),
            'sidebar' => app(DashboardController::class)->parentSidebar(),
        ]);
    }

    public function parentChildIndex(Request $request, Student $student): Response
    {
        $this->assertGuardianOf($request->user(), $student);

        return Inertia::render('Parent/Results/Child', [
            'student' => [
                'id' => $student->id,
                'name_en' => $student->name_en,
                'roll_number' => $student->roll_number,
            ],
            'exams' => $this->examList($student, publishedOnly: true),
            'sidebar' => app(DashboardController::class)->parentSidebar(),
        ]);
    }

    public function parentShow(Request $request, Student $student, Exam $exam): Response
    {
        $this->assertGuardianOf($request->user(), $student);
        $this->assertPublishedFor($exam, $student);

        return Inertia::render('Parent/Results/Show', [
            'report' => $this->buildReportCard($exam, $student),
            'backHref' => "/parent/children/{$student->id}/results",
            'pdfHref' => "/parent/children/{$student->id}/results/{$exam->id}/pdf",
            'sidebar' => app(DashboardController::class)->parentSidebar(),
        ]);
    }

    public function parentPdf(Request $request, Student $student, Exam $exam): HttpResponse
    {
        $this->assertGuardianOf($request->user(), $student);
        $this->assertPublishedFor($exam, $student);

        return $this->streamReportCardPdf($exam, $student);
    }

    // ---------------------------------------------------------------------
    // Shared helpers
    // ---------------------------------------------------------------------

    /**
     * @return array<int, array<string, mixed>>
     */
    private function examList(?Student $student = null, bool $publishedOnly = false): array
    {
        return Exam::query()
            ->with(['session:id,session_name', 'institution:id,name_en'])
            ->when($student, fn ($q) => $q->where('institution_id', $student->institution_id))
            ->when($publishedOnly, fn ($q) => $q->where('is_published', true))
            ->orderByDesc('start_date')
            ->get()
            ->map(fn (Exam $e) => [
                'id' => $e->id,
                'name_en' => $e->name_en,
                'name_bn' => $e->name_bn,
                'exam_type' => $e->exam_type,
                'is_published' => (bool) $e->is_published,
                'session_name' => $e->session?->session_name,
                'start_date' => $e->start_date?->toDateString(),
            ])
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    private function examPayload(Exam $exam): array
    {
        return [
            'id' => $exam->id,
            'name_en' => $exam->name_en,
            'name_bn' => $exam->name_bn,
            'exam_type' => $exam->exam_type,
            'is_published' => (bool) $exam->is_published,
            'session_name' => $exam->session?->session_name,
            'institution_name' => $exam->institution?->name_en,
        ];
    }

    /**
     * @return array<int, array{value: int, label: string}>
     */
    private function classOptions(Exam $exam): array
    {
        return ClassesAndSection::query()
            ->where('institution_id', $exam->institution_id)
            ->orderBy('class_level')
            ->orderBy('section_name')
            ->get()
            ->map(fn ($c) => [
                'value' => $c->id,
                'label' => trim($c->class_level.' '.$c->section_name),
            ])
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    private function buildReportCard(Exam $exam, Student $student): array
    {
        $exam->loadMissing(['institution', 'session:id,session_name']);
        $student->loadMissing('class:id,class_level,section_name,version');

        $result = $this->results->studentResult($student, $exam);

        return [
            'institution' => [
                'name_en' => $exam->institution?->name_en,
                'name_bn' => $exam->institution?->name_bn,
                'eiin_number' => $exam->institution?->eiin_number,
                'board_affiliation' => $exam->institution?->board_affiliation,
            ],
            'exam' => [
                'id' => $exam->id,
                'name_en' => $exam->name_en,
                'name_bn' => $exam->name_bn,
                'exam_type' => $exam->exam_type,
                'session_name' => $exam->session?->session_name,
            ],
            'student' => [
                'id' => $student->id,
                'name_en' => $student->name_en,
                'name_bn' => $student->name_bn,
                'roll_number' => $student->roll_number,
                'class_label' => $student->class
                    ? trim($student->class->class_level.' '.$student->class->section_name)
                    : null,
                'father_name' => $student->father_name_en,
                'mother_name' => $student->mother_name_en,
            ],
            'subjects' => $result['subjects'],
            'summary' => [
                'gpa' => $result['gpa'],
                'grade' => $result['grade'],
                'passed' => $result['passed'],
                'total' => $result['total'],
                'full_total' => $result['full_total'],
                'subject_count' => $result['subject_count'],
                'failed_count' => $result['failed_count'],
                'has_marks' => $result['has_marks'],
            ],
        ];
    }

    private function streamReportCardPdf(Exam $exam, Student $student): HttpResponse
    {
        $report = $this->buildReportCard($exam, $student);

        $pdf = Pdf::loadView('pdf.gradesheet', ['report' => $report])
            ->setPaper('a4');

        $filename = 'gradesheet-'.$student->roll_number.'-'.$exam->id.'.pdf';

        return $pdf->download($filename);
    }

    private function studentFor(User $user): ?Student
    {
        return Student::where('user_id', $user->id)->first();
    }

    private function assertGuardianOf(User $user, Student $student): void
    {
        abort_unless(
            $user->children()->whereKey($student->id)->exists(),
            403,
            'This child is not linked to your account.'
        );
    }

    private function assertPublishedFor(Exam $exam, Student $student): void
    {
        abort_unless($exam->is_published, 404);
        abort_unless($exam->institution_id === $student->institution_id, 404);
    }
}
