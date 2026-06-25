<?php

namespace App\Http\Controllers;

use App\Models\Institution;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InstitutionController extends Controller
{
    public function index(Request $request): Response
    {
        $institutions = Institution::query()
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->through(fn (Institution $i) => [
                'id' => $i->id,
                'name_en' => $i->name_en,
                'name_bn' => $i->name_bn,
                'eiin_number' => $i->eiin_number,
                'board_affiliation' => $i->board_affiliation,
                'mpo_status' => (bool) $i->mpo_status,
                'created_at' => $i->created_at?->toDateString(),
            ]);

        return Inertia::render('Admin/Institutions/Index', [
            'institutions' => $institutions,
            'sidebar' => app(DashboardController::class)->adminSidebar(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Institutions/Create', [
            'sidebar' => app(DashboardController::class)->adminSidebar(),
            'boards' => ['Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Barisal', 'Sylhet', 'Rangpur', 'Mymensingh', 'Madrasah', 'Technical', 'BTEB'],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name_en' => ['required', 'string', 'max:255'],
            'name_bn' => ['required', 'string', 'max:255'],
            'eiin_number' => ['required', 'integer', 'unique:institutions,eiin_number'],
            'board_affiliation' => ['required', 'string', 'max:50'],
            'mpo_status' => ['boolean'],
        ]);

        Institution::create($validated);

        return to_route('admin.institutions.index')
            ->with('flash.message', 'Institution created successfully.');
    }

    public function edit(Institution $institution): Response
    {
        return Inertia::render('Admin/Institutions/Edit', [
            'institution' => [
                'id' => $institution->id,
                'name_en' => $institution->name_en,
                'name_bn' => $institution->name_bn,
                'eiin_number' => $institution->eiin_number,
                'board_affiliation' => $institution->board_affiliation,
                'mpo_status' => (bool) $institution->mpo_status,
            ],
            'sidebar' => app(DashboardController::class)->adminSidebar(),
            'boards' => ['Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Barisal', 'Sylhet', 'Rangpur', 'Mymensingh', 'Madrasah', 'Technical', 'BTEB'],
        ]);
    }

    public function update(Request $request, Institution $institution): RedirectResponse
    {
        $validated = $request->validate([
            'name_en' => ['required', 'string', 'max:255'],
            'name_bn' => ['required', 'string', 'max:255'],
            'eiin_number' => ['required', 'integer', "unique:institutions,eiin_number,{$institution->id}"],
            'board_affiliation' => ['required', 'string', 'max:50'],
            'mpo_status' => ['boolean'],
        ]);

        $institution->update($validated);

        return to_route('admin.institutions.index')
            ->with('flash.message', 'Institution updated successfully.');
    }

    public function destroy(Institution $institution): RedirectResponse
    {
        $institution->delete();

        return to_route('admin.institutions.index')
            ->with('flash.message', 'Institution deleted successfully.');
    }
}
