<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSyllabusRequest;
use App\Http\Requests\UpdateSyllabusRequest;
use App\Models\AcademicSession;
use App\Models\ClassesAndSection;
use App\Models\Syllabus;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class SyllabusController extends Controller
{
    public function index(): Response
    {
        $items = Syllabus::query()
            ->with(['class:id,class_level,section_name', 'academicSession:id,session_name'])
            ->orderByDesc('created_at')
            ->paginate(20)
            ->through(fn (Syllabus $s) => [
                'id' => $s->id,
                'title' => $s->title,
                'description' => $s->description,
                'file_url' => $s->fileUrl(),
                'class_label' => $s->class
                    ? trim($s->class->class_level.' '.$s->class->section_name)
                    : null,
                'session_name' => $s->academicSession?->session_name,
            ]);

        return Inertia::render('Admin/Syllabus/Index', [
            'sidebar' => app(DashboardController::class)->adminSidebar(),
            'syllabuses' => $items,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Syllabus/Create', [
            'sidebar' => app(DashboardController::class)->adminSidebar(),
            'classes' => $this->classOptions(),
            'sessions' => $this->sessionOptions(),
        ]);
    }

    public function store(StoreSyllabusRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        unset($validated['file']);

        $syllabus = new Syllabus;
        $syllabus->forceFill($validated);

        if ($request->hasFile('file')) {
            $syllabus->file_path = $request->file('file')->store('syllabus', 'public');
        }

        $syllabus->save();

        return to_route('admin.syllabus.index')
            ->with('flash.message', 'Syllabus created successfully.');
    }

    public function edit(Syllabus $syllabus): Response
    {
        return Inertia::render('Admin/Syllabus/Edit', [
            'sidebar' => app(DashboardController::class)->adminSidebar(),
            'syllabus' => [
                'id' => $syllabus->id,
                'class_id' => $syllabus->class_id,
                'academic_session_id' => $syllabus->academic_session_id,
                'title' => $syllabus->title,
                'description' => $syllabus->description,
                'file_url' => $syllabus->fileUrl(),
            ],
            'classes' => $this->classOptions(),
            'sessions' => $this->sessionOptions(),
        ]);
    }

    public function update(UpdateSyllabusRequest $request, Syllabus $syllabus): RedirectResponse
    {
        $validated = $request->validated();
        unset($validated['file'], $validated['remove_file']);

        $syllabus->forceFill($validated);

        if ($request->boolean('remove_file') && $syllabus->file_path) {
            Storage::disk('public')->delete($syllabus->file_path);
            $syllabus->file_path = null;
        }

        if ($request->hasFile('file')) {
            if ($syllabus->file_path) {
                Storage::disk('public')->delete($syllabus->file_path);
            }
            $syllabus->file_path = $request->file('file')->store('syllabus', 'public');
        }

        $syllabus->save();

        return to_route('admin.syllabus.index')
            ->with('flash.message', 'Syllabus updated successfully.');
    }

    public function destroy(Syllabus $syllabus): RedirectResponse
    {
        if ($syllabus->file_path) {
            Storage::disk('public')->delete($syllabus->file_path);
        }

        $syllabus->delete();

        return to_route('admin.syllabus.index')
            ->with('flash.message', 'Syllabus deleted successfully.');
    }

    /**
     * @return array<int, array{value: int, label: string}>
     */
    private function classOptions(): array
    {
        return ClassesAndSection::query()
            ->orderBy('class_level')
            ->orderBy('section_name')
            ->get()
            ->map(fn (ClassesAndSection $c) => [
                'value' => $c->id,
                'label' => trim($c->class_level.' '.$c->section_name),
            ])
            ->all();
    }

    /**
     * @return array<int, array{value: int, label: string}>
     */
    private function sessionOptions(): array
    {
        return AcademicSession::query()
            ->orderByDesc('session_name')
            ->get()
            ->map(fn (AcademicSession $s) => [
                'value' => $s->id,
                'label' => $s->session_name,
            ])
            ->all();
    }
}
