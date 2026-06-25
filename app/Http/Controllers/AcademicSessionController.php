<?php

namespace App\Http\Controllers;

use App\Models\AcademicSession;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AcademicSessionController extends Controller
{
    public function index(Request $request): Response
    {
        $sessions = AcademicSession::query()
            ->orderBy('start_date', 'desc')
            ->paginate(15)
            ->through(fn (AcademicSession $s) => [
                'id' => $s->id,
                'session_name' => $s->session_name,
                'start_date' => $s->start_date?->toDateString(),
                'end_date' => $s->end_date?->toDateString(),
                'is_active' => (bool) $s->is_active,
                'created_at' => $s->created_at?->toDateString(),
            ]);

        return Inertia::render('Admin/AcademicSessions/Index', [
            'sessions' => $sessions,
            'sidebar' => app(DashboardController::class)->adminSidebar(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/AcademicSessions/Create', [
            'sidebar' => app(DashboardController::class)->adminSidebar(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'session_name' => ['required', 'string', 'max:50'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'is_active' => ['boolean'],
        ]);

        if ($validated['is_active'] ?? false) {
            AcademicSession::where('is_active', true)->update(['is_active' => false]);
        }

        AcademicSession::create($validated);

        return to_route('admin.academic-sessions.index')
            ->with('flash.message', 'Academic session created successfully.');
    }

    public function edit(AcademicSession $academicSession): Response
    {
        return Inertia::render('Admin/AcademicSessions/Edit', [
            'session' => [
                'id' => $academicSession->id,
                'session_name' => $academicSession->session_name,
                'start_date' => $academicSession->start_date?->toDateString(),
                'end_date' => $academicSession->end_date?->toDateString(),
                'is_active' => (bool) $academicSession->is_active,
            ],
            'sidebar' => app(DashboardController::class)->adminSidebar(),
        ]);
    }

    public function update(Request $request, AcademicSession $academicSession): RedirectResponse
    {
        $validated = $request->validate([
            'session_name' => ['required', 'string', 'max:50'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'is_active' => ['boolean'],
        ]);

        if ($validated['is_active'] ?? false) {
            AcademicSession::where('is_active', true)->where('id', '!=', $academicSession->id)->update(['is_active' => false]);
        }

        $academicSession->update($validated);

        return to_route('admin.academic-sessions.index')
            ->with('flash.message', 'Academic session updated successfully.');
    }

    public function destroy(AcademicSession $academicSession): RedirectResponse
    {
        $academicSession->delete();

        return to_route('admin.academic-sessions.index')
            ->with('flash.message', 'Academic session deleted successfully.');
    }
}
