<?php

namespace App\Http\Controllers;

use App\Models\ClassesAndSection;
use App\Models\Institution;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClassesAndSectionController extends Controller
{
    public function index(): Response
    {
        $items = ClassesAndSection::query()
            ->with('institution:id,name_en')
            ->orderBy('class_level')
            ->orderBy('section_name')
            ->paginate(20)
            ->through(fn (ClassesAndSection $c) => [
                'id' => $c->id,
                'institution_name' => $c->institution?->name_en,
                'version' => $c->version,
                'class_level' => $c->class_level,
                'group_stream' => $c->group_stream,
                'section_name' => $c->section_name,
                'room_number' => $c->room_number,
                'created_at' => $c->created_at?->toDateString(),
            ]);

        return Inertia::render('Admin/ClassesAndSections/Index', [
            'items' => $items,
            'sidebar' => app(DashboardController::class)->adminSidebar(),
        ]);
    }

    public function create(): Response
    {
        $institutions = Institution::query()
            ->select('id', 'name_en')
            ->orderBy('name_en')
            ->get()
            ->map(fn (Institution $i) => ['value' => $i->id, 'label' => $i->name_en]);

        return Inertia::render('Admin/ClassesAndSections/Create', [
            'sidebar' => app(DashboardController::class)->adminSidebar(),
            'institutions' => $institutions,
            'versions' => ['Bangla Medium', 'English Version', 'English Medium'],
            'groupStreams' => ['Science', 'Arts', 'Commerce', 'General'],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'institution_id' => ['required', 'exists:institutions,id'],
            'version' => ['required', 'string', 'max:20'],
            'class_level' => ['required', 'string', 'max:50'],
            'group_stream' => ['nullable', 'string', 'max:50'],
            'section_name' => ['required', 'string', 'max:5'],
            'room_number' => ['nullable', 'string', 'max:20'],
        ]);

        ClassesAndSection::create($validated);

        return to_route('admin.classes-and-sections.index')
            ->with('flash.message', 'Class & section created successfully.');
    }

    public function edit(ClassesAndSection $classesAndSection): Response
    {
        $institutions = Institution::query()
            ->select('id', 'name_en')
            ->orderBy('name_en')
            ->get()
            ->map(fn (Institution $i) => ['value' => $i->id, 'label' => $i->name_en]);

        return Inertia::render('Admin/ClassesAndSections/Edit', [
            'item' => [
                'id' => $classesAndSection->id,
                'institution_id' => $classesAndSection->institution_id,
                'version' => $classesAndSection->version,
                'class_level' => $classesAndSection->class_level,
                'group_stream' => $classesAndSection->group_stream,
                'section_name' => $classesAndSection->section_name,
                'room_number' => $classesAndSection->room_number,
            ],
            'sidebar' => app(DashboardController::class)->adminSidebar(),
            'institutions' => $institutions,
            'versions' => ['Bangla Medium', 'English Version', 'English Medium'],
            'groupStreams' => ['Science', 'Arts', 'Commerce', 'General'],
        ]);
    }

    public function update(Request $request, ClassesAndSection $classesAndSection): RedirectResponse
    {
        $validated = $request->validate([
            'institution_id' => ['required', 'exists:institutions,id'],
            'version' => ['required', 'string', 'max:20'],
            'class_level' => ['required', 'string', 'max:50'],
            'group_stream' => ['nullable', 'string', 'max:50'],
            'section_name' => ['required', 'string', 'max:5'],
            'room_number' => ['nullable', 'string', 'max:20'],
        ]);

        $classesAndSection->update($validated);

        return to_route('admin.classes-and-sections.index')
            ->with('flash.message', 'Class & section updated successfully.');
    }

    public function destroy(ClassesAndSection $classesAndSection): RedirectResponse
    {
        $classesAndSection->delete();

        return to_route('admin.classes-and-sections.index')
            ->with('flash.message', 'Class & section deleted successfully.');
    }
}
