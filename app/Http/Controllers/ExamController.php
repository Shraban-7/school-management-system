<?php

namespace App\Http\Controllers;

use App\Helpers\GradeScale;
use App\Models\AcademicSession;
use App\Models\Exam;
use App\Models\Institution;
use App\Models\Mark;
use App\Models\Student;
use App\Models\Subject;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ExamController extends Controller
{
    public function index(Request $request): Response
    {
        $exams = Exam::query()
            ->with(['institution:id,name_en', 'session:id,session_name'])
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->through(fn (Exam $e) => [
                'id' => $e->id,
                'name_en' => $e->name_en,
                'name_bn' => $e->name_bn,
                'exam_type' => $e->exam_type,
                'start_date' => $e->start_date?->toDateString(),
                'end_date' => $e->end_date?->toDateString(),
                'is_published' => (bool) $e->is_published,
                'session_name' => $e->session?->session_name,
                'institution_name' => $e->institution?->name_en,
                'created_at' => $e->created_at?->toDateString(),
            ]);

        return Inertia::render('Admin/Exams/Index', [
            'exams' => $exams,
            'sidebar' => app(DashboardController::class)->adminSidebar(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Exams/Create', [
            'sidebar' => app(DashboardController::class)->adminSidebar(),
            'institutions' => Institution::select('id', 'name_en')
                ->orderBy('name_en')
                ->get()
                ->map(fn (Institution $i) => ['value' => $i->id, 'label' => $i->name_en]),
            'sessions' => AcademicSession::select('id', 'session_name')
                ->orderBy('session_name', 'desc')
                ->get()
                ->map(fn (AcademicSession $s) => ['value' => $s->id, 'label' => $s->session_name]),
            'examTypes' => ['Half Yearly', 'Final', 'Test Exam', 'Pre-Test', 'Model Test', 'Annual', 'Mid Term', 'Quarterly'],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'institution_id' => ['required', 'exists:institutions,id'],
            'session_id' => ['required', 'exists:academic_sessions,id'],
            'name_en' => ['required', 'string', 'max:255'],
            'name_bn' => ['nullable', 'string', 'max:255'],
            'exam_type' => ['required', 'string', 'max:30'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'is_published' => ['boolean'],
            'description' => ['nullable', 'string'],
        ]);

        Exam::create($validated);

        return to_route('admin.exams.index')
            ->with('flash.message', 'Exam created successfully.');
    }

    public function edit(Exam $exam): Response
    {
        $exam->load(['institution', 'session']);

        return Inertia::render('Admin/Exams/Edit', [
            'exam' => [
                'id' => $exam->id,
                'institution_id' => $exam->institution_id,
                'session_id' => $exam->session_id,
                'name_en' => $exam->name_en,
                'name_bn' => $exam->name_bn,
                'exam_type' => $exam->exam_type,
                'start_date' => $exam->start_date?->toDateString(),
                'end_date' => $exam->end_date?->toDateString(),
                'is_published' => (bool) $exam->is_published,
                'description' => $exam->description,
            ],
            'sidebar' => app(DashboardController::class)->adminSidebar(),
            'institutions' => Institution::select('id', 'name_en')
                ->orderBy('name_en')
                ->get()
                ->map(fn (Institution $i) => ['value' => $i->id, 'label' => $i->name_en]),
            'sessions' => AcademicSession::select('id', 'session_name')
                ->orderBy('session_name', 'desc')
                ->get()
                ->map(fn (AcademicSession $s) => ['value' => $s->id, 'label' => $s->session_name]),
            'examTypes' => ['Half Yearly', 'Final', 'Test Exam', 'Pre-Test', 'Model Test', 'Annual', 'Mid Term', 'Quarterly'],
        ]);
    }

    public function update(Request $request, Exam $exam): RedirectResponse
    {
        $validated = $request->validate([
            'institution_id' => ['required', 'exists:institutions,id'],
            'session_id' => ['required', 'exists:academic_sessions,id'],
            'name_en' => ['required', 'string', 'max:255'],
            'name_bn' => ['nullable', 'string', 'max:255'],
            'exam_type' => ['required', 'string', 'max:30'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'is_published' => ['boolean'],
            'description' => ['nullable', 'string'],
        ]);

        $exam->update($validated);

        return to_route('admin.exams.index')
            ->with('flash.message', 'Exam updated successfully.');
    }

    public function destroy(Exam $exam): RedirectResponse
    {
        $exam->delete();

        return to_route('admin.exams.index')
            ->with('flash.message', 'Exam deleted successfully.');
    }

    public function marks(Exam $exam): Response
    {
        $exam->load(['institution:id,name_en', 'session:id,session_name']);

        $subjects = Subject::query()
            ->where('institution_id', $exam->institution_id)
            ->select('id', 'name_en')
            ->orderBy('name_en')
            ->get()
            ->toArray();

        $students = Student::query()
            ->where('institution_id', $exam->institution_id)
            ->select('id', 'name_en', 'roll_number', 'class_id')
            ->with('class:id,class_level,section_name')
            ->orderBy('roll_number')
            ->get()
            ->map(fn (Student $s) => [
                'id' => $s->id,
                'name_en' => $s->name_en,
                'roll_number' => $s->roll_number,
                'class_level' => $s->class?->class_level,
                'section' => $s->class?->section_name,
            ])
            ->values()
            ->all();

        $existingMarks = Mark::query()
            ->where('exam_id', $exam->id)
            ->get()
            ->keyBy(fn (Mark $m) => $m->student_id . '_' . $m->subject_id)
            ->map(fn (Mark $m) => [
                'written_marks' => (float) $m->written_marks,
                'mcq_marks' => (float) $m->mcq_marks,
                'practical_marks' => (float) $m->practical_marks,
                'is_absent' => (bool) $m->is_absent,
                'remarks' => $m->remarks,
            ]);

        return Inertia::render('Admin/Exams/Marks', [
            'exam' => [
                'id' => $exam->id,
                'name_en' => $exam->name_en,
                'exam_type' => $exam->exam_type,
                'institution_name' => $exam->institution?->name_en,
                'session_name' => $exam->session?->session_name,
            ],
            'subjects' => $subjects,
            'students' => $students,
            'marks' => $existingMarks,
            'sidebar' => app(DashboardController::class)->adminSidebar(),
        ]);
    }

    public function updateMarks(Request $request, Exam $exam): RedirectResponse
    {
        $validated = $request->validate([
            'marks' => ['required', 'array'],
            'marks.*.student_id' => ['required', 'exists:students,id'],
            'marks.*.subject_id' => ['required', 'exists:subjects,id'],
            'marks.*.written_marks' => ['nullable', 'numeric', 'min:0'],
            'marks.*.mcq_marks' => ['nullable', 'numeric', 'min:0'],
            'marks.*.practical_marks' => ['nullable', 'numeric', 'min:0'],
            'marks.*.is_absent' => ['boolean'],
            'marks.*.remarks' => ['nullable', 'string', 'max:500'],
        ]);

        foreach ($validated['marks'] as $entry) {
            $written = (float) ($entry['written_marks'] ?? 0);
            $mcq = (float) ($entry['mcq_marks'] ?? 0);
            $practical = (float) ($entry['practical_marks'] ?? 0);
            $total = $written + $mcq + $practical;
            $isAbsent = (bool) ($entry['is_absent'] ?? false);

            $grade = $isAbsent
                ? ['grade' => null, 'point' => null]
                : GradeScale::calculate($total);

            Mark::updateOrCreate(
                [
                    'exam_id' => $exam->id,
                    'subject_id' => $entry['subject_id'],
                    'student_id' => $entry['student_id'],
                ],
                [
                    'written_marks' => $written,
                    'mcq_marks' => $mcq,
                    'practical_marks' => $practical,
                    'total_marks' => $total,
                    'grade_letter' => $grade['grade'],
                    'grade_point' => $grade['point'],
                    'is_absent' => $isAbsent,
                    'remarks' => $entry['remarks'] ?? null,
                ]
            );
        }

        return to_route('admin.exams.marks', ['exam' => $exam->id])
            ->with('flash.message', 'Marks updated successfully.');
    }
}
