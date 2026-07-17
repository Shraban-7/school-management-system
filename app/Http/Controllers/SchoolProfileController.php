<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateSchoolProfileRequest;
use App\Models\Institution;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class SchoolProfileController extends Controller
{
    public function edit(): Response
    {
        return Inertia::render('Admin/Settings/SchoolProfile', [
            'sidebar' => app(DashboardController::class)->adminSidebar(),
            'school' => Institution::current()->toAdminArray(),
        ]);
    }

    public function update(UpdateSchoolProfileRequest $request): RedirectResponse
    {
        $school = Institution::current();
        $validated = $request->validated();

        unset($validated['logo'], $validated['headmaster_photo'], $validated['remove_logo'], $validated['remove_headmaster_photo']);

        if ($request->boolean('remove_logo') && $school->logo_path) {
            Storage::disk('public')->delete($school->logo_path);
            $validated['logo_path'] = null;
        }

        if ($request->hasFile('logo')) {
            if ($school->logo_path) {
                Storage::disk('public')->delete($school->logo_path);
            }
            $validated['logo_path'] = $request->file('logo')->store('school', 'public');
        }

        if ($request->boolean('remove_headmaster_photo') && $school->headmaster_photo_path) {
            Storage::disk('public')->delete($school->headmaster_photo_path);
            $validated['headmaster_photo_path'] = null;
        }

        if ($request->hasFile('headmaster_photo')) {
            if ($school->headmaster_photo_path) {
                Storage::disk('public')->delete($school->headmaster_photo_path);
            }
            $validated['headmaster_photo_path'] = $request->file('headmaster_photo')->store('school', 'public');
        }

        $validated['mpo_status'] = $request->boolean('mpo_status');

        $school->forceFill($validated)->save();
        Institution::forgetCurrentCache();

        return to_route('admin.settings.school.edit')
            ->with('flash.message', 'School profile updated successfully.');
    }
}
