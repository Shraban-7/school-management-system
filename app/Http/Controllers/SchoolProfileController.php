<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateSchoolProfileRequest;
use App\Models\Institution;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;

class SchoolProfileController extends Controller
{
    public function edit(): RedirectResponse
    {
        return redirect()->route('admin.settings');
    }

    public function update(UpdateSchoolProfileRequest $request): RedirectResponse
    {
        $school = Institution::current();
        $validated = $request->validated();

        unset($validated['logo'], $validated['remove_logo']);

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

        $validated['mpo_status'] = $request->boolean('mpo_status');

        $school->forceFill($validated)->save();
        Institution::forgetCurrentCache();

        return redirect()->route('admin.settings')
            ->with('flash.message', 'Institution settings updated successfully.');
    }
}
