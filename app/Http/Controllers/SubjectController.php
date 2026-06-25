<?php

namespace App\Http\Controllers;

use App\Models\Subject;
use App\Models\Institution;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SubjectController extends Controller
{
    public function index(Request $request): Response
    {
        $subjects = Subject::query()
            ->with('institution:id,name_en')
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->through(fn (Subject $s) => [
                'id' => $s->id,
                'name_en' => $s->name_en,
                'name_bn' => $s->name_bn,
                'code' => $s->code,
                'class_level' => $s->class_level,
                'group_stream' => $s->group_stream,
                'subject_type' => $s->subject_type,
                'full_marks' => $s->full_marks,
                'pass_marks' => $s->pass_marks,
                'is_active' => (bool) $s->is_active,
                'institution_name' => $s->relationLoaded('institution') ? $s->institution?->name_en : null,
                'created_at' => $s->created_at?->toDateString(),
            ]);

        return Inertia::render('Admin/Subjects/Index', [
            'subjects' => $subjects,
            'sidebar' => app(DashboardController::class)->adminSidebar(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Subjects/Create', [
            'sidebar' => app(DashboardController::class)->adminSidebar(),
            'institutions' => Institution::query()
                ->select('id', 'name_en')
                ->orderBy('name_en')
                ->get()
                ->map(fn (Institution $i) => [
                    'value' => $i->id,
                    'label' => $i->name_en,
                ]),
            'groupStreams' => ['Science', 'Arts', 'Commerce', 'General', 'None'],
            'subjectTypes' => ['compulsory', 'optional'],
            'classLevels' => ['Play', 'Nursery', 'KG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'institution_id' => ['required', 'exists:institutions,id'],
            'name_en' => ['required', 'string', 'max:255'],
            'name_bn' => ['required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:20'],
            'class_level' => ['required', 'string'],
            'group_stream' => ['nullable', 'string'],
            'subject_type' => ['required', 'string', 'in:compulsory,optional'],
            'full_marks' => ['required', 'numeric', 'min:1', 'max:200'],
            'pass_marks' => ['required', 'numeric', 'min:0', 'max:200'],
            'is_active' => ['boolean'],
        ]);

        $validated['pass_marks'] = min($validated['pass_marks'], $validated['full_marks']);

        $request->validate([
            'name_en' => [
                Rule::unique('subjects')
                    ->where('institution_id', $validated['institution_id'])
                    ->where('class_level', $validated['class_level']),
            ],
        ]);

        Subject::create($validated);

        return to_route('admin.subjects.index')
            ->with('flash.message', 'Subject created successfully.');
    }

    public function edit(Subject $subject): Response
    {
        return Inertia::render('Admin/Subjects/Edit', [
            'subject' => [
                'id' => $subject->id,
                'institution_id' => $subject->institution_id,
                'name_en' => $subject->name_en,
                'name_bn' => $subject->name_bn,
                'code' => $subject->code,
                'class_level' => $subject->class_level,
                'group_stream' => $subject->group_stream,
                'subject_type' => $subject->subject_type,
                'full_marks' => $subject->full_marks,
                'pass_marks' => $subject->pass_marks,
                'is_active' => (bool) $subject->is_active,
            ],
            'sidebar' => app(DashboardController::class)->adminSidebar(),
            'institutions' => Institution::query()
                ->select('id', 'name_en')
                ->orderBy('name_en')
                ->get()
                ->map(fn (Institution $i) => [
                    'value' => $i->id,
                    'label' => $i->name_en,
                ]),
            'groupStreams' => ['Science', 'Arts', 'Commerce', 'General', 'None'],
            'subjectTypes' => ['compulsory', 'optional'],
            'classLevels' => ['Play', 'Nursery', 'KG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        ]);
    }

    public function update(Request $request, Subject $subject): RedirectResponse
    {
        $validated = $request->validate([
            'institution_id' => ['required', 'exists:institutions,id'],
            'name_en' => ['required', 'string', 'max:255'],
            'name_bn' => ['required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:20'],
            'class_level' => ['required', 'string'],
            'group_stream' => ['nullable', 'string'],
            'subject_type' => ['required', 'string', 'in:compulsory,optional'],
            'full_marks' => ['required', 'numeric', 'min:1', 'max:200'],
            'pass_marks' => ['required', 'numeric', 'min:0', 'max:200'],
            'is_active' => ['boolean'],
        ]);

        $validated['pass_marks'] = min($validated['pass_marks'], $validated['full_marks']);

        $request->validate([
            'name_en' => [
                Rule::unique('subjects')
                    ->where('institution_id', $validated['institution_id'])
                    ->where('class_level', $validated['class_level'])
                    ->ignore($subject->id),
            ],
        ]);

        $subject->update($validated);

        return to_route('admin.subjects.index')
            ->with('flash.message', 'Subject updated successfully.');
    }

    public function destroy(Subject $subject): RedirectResponse
    {
        $subject->delete();

        return to_route('admin.subjects.index')
            ->with('flash.message', 'Subject deleted successfully.');
    }
}
