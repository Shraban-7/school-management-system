<?php

namespace App\Http\Controllers;

use App\Models\Teacher;
use App\Models\Institution;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TeacherController extends Controller
{
    public function index(Request $request): Response
    {
        $teachers = Teacher::with('institution:id,name_en')
            ->paginate(15)
            ->through(fn ($teacher) => [
                'id' => $teacher->id,
                'name_en' => $teacher->name_en,
                'name_bn' => $teacher->name_bn,
                'designation' => $teacher->designation,
                'qualification' => $teacher->qualification,
                'subject_specialization' => $teacher->subject_specialization,
                'mobile' => $teacher->mobile,
                'email' => $teacher->email,
                'gender' => $teacher->gender,
                'is_active' => $teacher->is_active,
                'institution_name' => $teacher->institution->name_en ?? null,
                'joining_date' => $teacher->joining_date,
                'created_at' => $teacher->created_at,
            ]);

        return Inertia::render('Admin/Teachers/Index', [
            'teachers' => $teachers,
            'sidebar' => app(DashboardController::class)->adminSidebar(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Teachers/Create', [
            'genders' => ['Male', 'Female', 'Other'],
            'designations' => [
                'Principal',
                'Vice Principal',
                'Assistant Teacher',
                'Senior Teacher',
                'Lecturer',
                'Demonstrator',
                'IT Coordinator',
                'Librarian',
                'Clerk',
                'Accountant',
                'Peon',
                'Other',
            ],
            'sidebar' => app(DashboardController::class)->adminSidebar(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name_en' => 'required|string',
            'name_bn' => 'required|string',
            'designation' => 'required|string',
            'gender' => 'required|string|in:Male,Female,Other',
            'father_name' => 'nullable|string',
            'mother_name' => 'nullable|string',
            'date_of_birth' => 'nullable|date',
            'religion' => 'nullable|string',
            'mobile' => 'nullable|string',
            'email' => 'nullable|email',
            'address_present' => 'nullable|string',
            'address_permanent' => 'nullable|string',
            'nid_number' => 'nullable|string|unique:teachers,nid_number',
            'qualification' => 'nullable|string',
            'subject_specialization' => 'nullable|string',
            'joining_date' => 'nullable|date',
            'is_active' => 'boolean',
        ]);

        $validated['institution_id'] = Institution::current()->id;

        (new Teacher)->forceFill($validated)->save();

        return redirect()->route('admin.teachers.index')
            ->with('success', 'Teacher created successfully.');
    }

    public function edit(Teacher $teacher): Response
    {
        $teacher->load('institution');

        return Inertia::render('Admin/Teachers/Edit', [
            'teacher' => [
                'id' => $teacher->id,
                'institution_id' => $teacher->institution_id,
                'name_en' => $teacher->name_en,
                'name_bn' => $teacher->name_bn,
                'designation' => $teacher->designation,
                'gender' => $teacher->gender,
                'father_name' => $teacher->father_name,
                'mother_name' => $teacher->mother_name,
                'date_of_birth' => $teacher->date_of_birth,
                'religion' => $teacher->religion,
                'mobile' => $teacher->mobile,
                'email' => $teacher->email,
                'address_present' => $teacher->address_present,
                'address_permanent' => $teacher->address_permanent,
                'nid_number' => $teacher->nid_number,
                'qualification' => $teacher->qualification,
                'subject_specialization' => $teacher->subject_specialization,
                'joining_date' => $teacher->joining_date,
                'is_active' => (bool) $teacher->is_active,
            ],
            'genders' => ['Male', 'Female', 'Other'],
            'designations' => [
                'Principal',
                'Vice Principal',
                'Assistant Teacher',
                'Senior Teacher',
                'Lecturer',
                'Demonstrator',
                'IT Coordinator',
                'Librarian',
                'Clerk',
                'Accountant',
                'Peon',
                'Other',
            ],
            'sidebar' => app(DashboardController::class)->adminSidebar(),
        ]);
    }

    public function update(Request $request, Teacher $teacher): RedirectResponse
    {
        $validated = $request->validate([
            'name_en' => 'required|string',
            'name_bn' => 'required|string',
            'designation' => 'required|string',
            'gender' => 'required|string|in:Male,Female,Other',
            'father_name' => 'nullable|string',
            'mother_name' => 'nullable|string',
            'date_of_birth' => 'nullable|date',
            'religion' => 'nullable|string',
            'mobile' => 'nullable|string',
            'email' => 'nullable|email',
            'address_present' => 'nullable|string',
            'address_permanent' => 'nullable|string',
            'nid_number' => 'nullable|string|unique:teachers,nid_number,' . $teacher->id,
            'qualification' => 'nullable|string',
            'subject_specialization' => 'nullable|string',
            'joining_date' => 'nullable|date',
            'is_active' => 'boolean',
        ]);

        $validated['institution_id'] = Institution::current()->id;

        $teacher->forceFill($validated)->save();

        return redirect()->route('admin.teachers.index')
            ->with('success', 'Teacher updated successfully.');
    }

    public function destroy(Teacher $teacher): RedirectResponse
    {
        $teacher->delete();

        return redirect()->route('admin.teachers.index')
            ->with('success', 'Teacher deleted successfully.');
    }
}
