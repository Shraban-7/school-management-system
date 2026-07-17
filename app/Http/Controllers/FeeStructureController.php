<?php

namespace App\Http\Controllers;

use App\Enums\FeeType;
use App\Models\AcademicSession;
use App\Models\ClassesAndSection;
use App\Models\FeeStructure;
use App\Models\Institution;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FeeStructureController extends Controller
{
    public function index(): Response
    {
        $structures = FeeStructure::query()
            ->with([
                'institution:id,name_en',
                'class:id,class_level,section_name',
                'session:id,session_name',
            ])
            ->orderByDesc('created_at')
            ->paginate(20)
            ->through(fn (FeeStructure $s) => [
                'id' => $s->id,
                'fee_type' => $s->fee_type->value,
                'fee_type_label' => $s->fee_type->label(),
                'name_en' => $s->name_en,
                'name_bn' => $s->name_bn,
                'amount' => (float) $s->amount,
                'is_active' => (bool) $s->is_active,
                'class_label' => $s->class
                    ? trim($s->class->class_level.' '.$s->class->section_name)
                    : null,
                'institution_name' => $s->institution?->name_en,
                'session_name' => $s->session?->session_name,
            ]);

        return Inertia::render('Admin/Fees/Structures/Index', [
            'structures' => $structures,
            'sidebar' => app(DashboardController::class)->adminSidebar(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Fees/Structures/Create', [
            'sidebar' => app(DashboardController::class)->adminSidebar(),
            'classes' => $this->classOptions(),
            'sessions' => $this->sessionOptions(),
            'feeTypes' => $this->feeTypeOptions(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'class_id' => ['required', 'exists:classes_and_sections,id'],
            'session_id' => ['nullable', 'exists:academic_sessions,id'],
            'fee_type' => ['required', 'in:'.implode(',', array_column(FeeType::cases(), 'value'))],
            'name_en' => ['required', 'string', 'max:255'],
            'name_bn' => ['nullable', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        $validated['institution_id'] = Institution::current()->id;

        $structure = new FeeStructure;
        $structure->forceFill($validated)->save();

        return to_route('admin.fees.structures.index')
            ->with('flash.message', 'Fee structure created.');
    }

    public function edit(FeeStructure $structure): Response
    {
        return Inertia::render('Admin/Fees/Structures/Edit', [
            'structure' => [
                'id' => $structure->id,
                'institution_id' => $structure->institution_id,
                'class_id' => $structure->class_id,
                'session_id' => $structure->session_id,
                'fee_type' => $structure->fee_type->value,
                'name_en' => $structure->name_en,
                'name_bn' => $structure->name_bn,
                'amount' => (float) $structure->amount,
                'is_active' => (bool) $structure->is_active,
            ],
            'sidebar' => app(DashboardController::class)->adminSidebar(),
            'classes' => $this->classOptions(),
            'sessions' => $this->sessionOptions(),
            'feeTypes' => $this->feeTypeOptions(),
        ]);
    }

    public function update(Request $request, FeeStructure $structure): RedirectResponse
    {
        $validated = $request->validate([
            'class_id' => ['required', 'exists:classes_and_sections,id'],
            'session_id' => ['nullable', 'exists:academic_sessions,id'],
            'fee_type' => ['required', 'in:'.implode(',', array_column(FeeType::cases(), 'value'))],
            'name_en' => ['required', 'string', 'max:255'],
            'name_bn' => ['nullable', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        $validated['institution_id'] = Institution::current()->id;

        $structure->forceFill($validated)->save();

        return to_route('admin.fees.structures.index')
            ->with('flash.message', 'Fee structure updated.');
    }

    public function destroy(FeeStructure $structure): RedirectResponse
    {
        $structure->delete();

        return to_route('admin.fees.structures.index')
            ->with('flash.message', 'Fee structure deleted.');
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
        return AcademicSession::select('id', 'session_name')
            ->orderByDesc('session_name')
            ->get()
            ->map(fn (AcademicSession $s) => ['value' => $s->id, 'label' => $s->session_name])
            ->all();
    }

    /**
     * @return array<int, array{value: string, label: string}>
     */
    private function feeTypeOptions(): array
    {
        return collect(FeeType::cases())
            ->map(fn (FeeType $t) => ['value' => $t->value, 'label' => $t->label()])
            ->all();
    }
}
