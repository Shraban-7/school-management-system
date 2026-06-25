<?php

namespace App\Http\Controllers;

use App\Models\AcademicSession;
use App\Models\ClassesAndSection;
use App\Models\Institution;
use App\Models\Student;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    public function index(Request $request): Response
    {
        $students = Student::query()
            ->with('institution:id,name_en', 'session:id,session_name', 'class:id,class_level,section_name')
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->through(fn (Student $s) => [
                'id' => $s->id,
                'name_en' => $s->name_en,
                'name_bn' => $s->name_bn,
                'roll_number' => $s->roll_number,
                'gender' => $s->gender,
                'class_name' => $s->class?->class_level,
                'section_name' => $s->class?->section_name,
                'session_name' => $s->session?->session_name,
                'institution_name' => $s->institution?->name_en,
                'is_active' => (bool) $s->is_active,
                'created_at' => $s->created_at?->toDateString(),
            ]);

        return Inertia::render('Admin/Students/Index', [
            'students' => $students,
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

        $sessions = AcademicSession::query()
            ->select('id', 'session_name')
            ->orderBy('session_name')
            ->get()
            ->map(fn (AcademicSession $s) => ['value' => $s->id, 'label' => $s->session_name]);

        $classes = ClassesAndSection::query()
            ->select('id', 'class_level', 'section_name')
            ->get()
            ->map(fn (ClassesAndSection $c) => [
                'value' => $c->id,
                'label' => "{$c->class_level} - {$c->section_name}",
            ]);

        return Inertia::render('Admin/Students/Create', [
            'sidebar' => app(DashboardController::class)->adminSidebar(),
            'institutions' => $institutions,
            'sessions' => $sessions,
            'classes' => $classes,
            'genders' => ['Male', 'Female', 'Other'],
            'bloodGroups' => ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
            'religions' => ['Islam', 'Hinduism', 'Buddhism', 'Christianity', 'Other'],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name_en' => ['required', 'string', 'max:255'],
            'name_bn' => ['required', 'string'],
            'gender' => ['required'],
            'institution_id' => ['required', 'exists:institutions,id'],
            'session_id' => ['required', 'exists:academic_sessions,id'],
            'class_id' => ['required', 'exists:classes_and_sections,id'],
            'roll_number' => ['required', 'string', 'max:20'],
            'date_of_birth' => ['nullable', 'date'],
            'blood_group' => ['nullable', 'string'],
            'religion' => ['nullable', 'string'],
            'nationality' => ['nullable', 'string'],
            'birth_certificate_number' => ['nullable', 'string'],
            'father_name_en' => ['nullable', 'string'],
            'father_name_bn' => ['nullable', 'string'],
            'father_nid' => ['nullable', 'string'],
            'father_phone' => ['nullable', 'string'],
            'father_occupation' => ['nullable', 'string'],
            'mother_name_en' => ['nullable', 'string'],
            'mother_name_bn' => ['nullable', 'string'],
            'mother_nid' => ['nullable', 'string'],
            'mother_phone' => ['nullable', 'string'],
            'mother_occupation' => ['nullable', 'string'],
            'guardian_name' => ['nullable', 'string'],
            'guardian_relation' => ['nullable', 'string'],
            'guardian_phone' => ['nullable', 'string'],
            'guardian_address' => ['nullable', 'string'],
            'present_address' => ['nullable', 'string'],
            'permanent_address' => ['nullable', 'string'],
            'previous_school' => ['nullable', 'string'],
            'previous_class' => ['nullable', 'string'],
            'previous_gpa' => ['nullable', 'numeric', 'min:0', 'max:5'],
            'academic_year' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ]);

        Student::create($validated);

        return to_route('admin.students.index')
            ->with('flash.message', 'Student created successfully.');
    }

    public function show(Student $student): Response
    {
        $student->load('institution', 'session', 'class');

        return Inertia::render('Admin/Students/Show', [
            'student' => [
                'id' => $student->id,
                'institution_id' => $student->institution_id,
                'user_id' => $student->user_id,
                'session_id' => $student->session_id,
                'class_id' => $student->class_id,
                'roll_number' => $student->roll_number,
                'name_en' => $student->name_en,
                'name_bn' => $student->name_bn,
                'date_of_birth' => $student->date_of_birth?->toDateString(),
                'gender' => $student->gender,
                'blood_group' => $student->blood_group,
                'religion' => $student->religion,
                'nationality' => $student->nationality,
                'birth_certificate_number' => $student->birth_certificate_number,
                'father_name_en' => $student->father_name_en,
                'father_name_bn' => $student->father_name_bn,
                'father_nid' => $student->father_nid,
                'father_phone' => $student->father_phone,
                'father_occupation' => $student->father_occupation,
                'mother_name_en' => $student->mother_name_en,
                'mother_name_bn' => $student->mother_name_bn,
                'mother_nid' => $student->mother_nid,
                'mother_phone' => $student->mother_phone,
                'mother_occupation' => $student->mother_occupation,
                'guardian_name' => $student->guardian_name,
                'guardian_relation' => $student->guardian_relation,
                'guardian_phone' => $student->guardian_phone,
                'guardian_address' => $student->guardian_address,
                'present_address' => $student->present_address,
                'permanent_address' => $student->permanent_address,
                'previous_school' => $student->previous_school,
                'previous_class' => $student->previous_class,
                'previous_gpa' => $student->previous_gpa,
                'academic_year' => $student->academic_year,
                'is_active' => (bool) $student->is_active,
                'created_at' => $student->created_at?->toDateTimeString(),
                'updated_at' => $student->updated_at?->toDateTimeString(),
                'institution_name' => $student->institution?->name_en,
                'session_name' => $student->session?->session_name,
                'class_level' => $student->class?->class_level,
                'class_section' => $student->class?->section_name,
            ],
            'sidebar' => app(DashboardController::class)->adminSidebar(),
        ]);
    }

    public function edit(Student $student): Response
    {
        $student->load('institution', 'session', 'class');

        $institutions = Institution::query()
            ->select('id', 'name_en')
            ->orderBy('name_en')
            ->get()
            ->map(fn (Institution $i) => ['value' => $i->id, 'label' => $i->name_en]);

        $sessions = AcademicSession::query()
            ->select('id', 'session_name')
            ->orderBy('session_name')
            ->get()
            ->map(fn (AcademicSession $s) => ['value' => $s->id, 'label' => $s->session_name]);

        $classes = ClassesAndSection::query()
            ->select('id', 'class_level', 'section_name')
            ->get()
            ->map(fn (ClassesAndSection $c) => [
                'value' => $c->id,
                'label' => "{$c->class_level} - {$c->section_name}",
            ]);

        return Inertia::render('Admin/Students/Edit', [
            'student' => [
                'id' => $student->id,
                'institution_id' => $student->institution_id,
                'user_id' => $student->user_id,
                'session_id' => $student->session_id,
                'class_id' => $student->class_id,
                'roll_number' => $student->roll_number,
                'name_en' => $student->name_en,
                'name_bn' => $student->name_bn,
                'date_of_birth' => $student->date_of_birth?->toDateString(),
                'gender' => $student->gender,
                'blood_group' => $student->blood_group,
                'religion' => $student->religion,
                'nationality' => $student->nationality,
                'birth_certificate_number' => $student->birth_certificate_number,
                'father_name_en' => $student->father_name_en,
                'father_name_bn' => $student->father_name_bn,
                'father_nid' => $student->father_nid,
                'father_phone' => $student->father_phone,
                'father_occupation' => $student->father_occupation,
                'mother_name_en' => $student->mother_name_en,
                'mother_name_bn' => $student->mother_name_bn,
                'mother_nid' => $student->mother_nid,
                'mother_phone' => $student->mother_phone,
                'mother_occupation' => $student->mother_occupation,
                'guardian_name' => $student->guardian_name,
                'guardian_relation' => $student->guardian_relation,
                'guardian_phone' => $student->guardian_phone,
                'guardian_address' => $student->guardian_address,
                'present_address' => $student->present_address,
                'permanent_address' => $student->permanent_address,
                'previous_school' => $student->previous_school,
                'previous_class' => $student->previous_class,
                'previous_gpa' => $student->previous_gpa,
                'academic_year' => $student->academic_year,
                'is_active' => (bool) $student->is_active,
            ],
            'sidebar' => app(DashboardController::class)->adminSidebar(),
            'institutions' => $institutions,
            'sessions' => $sessions,
            'classes' => $classes,
            'genders' => ['Male', 'Female', 'Other'],
            'bloodGroups' => ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
            'religions' => ['Islam', 'Hinduism', 'Buddhism', 'Christianity', 'Other'],
        ]);
    }

    public function update(Request $request, Student $student): RedirectResponse
    {
        $institutionId = $request->input('institution_id', $student->institution_id);
        $classId = $request->input('class_id', $student->class_id);

        $validated = $request->validate([
            'name_en' => ['required', 'string', 'max:255'],
            'name_bn' => ['required', 'string'],
            'gender' => ['required'],
            'institution_id' => ['required', 'exists:institutions,id'],
            'session_id' => ['required', 'exists:academic_sessions,id'],
            'class_id' => ['required', 'exists:classes_and_sections,id'],
            'roll_number' => [
                'required', 'string', 'max:20',
                "unique:students,roll_number,{$student->id},id,institution_id,{$institutionId},class_id,{$classId}",
            ],
            'date_of_birth' => ['nullable', 'date'],
            'blood_group' => ['nullable', 'string'],
            'religion' => ['nullable', 'string'],
            'nationality' => ['nullable', 'string'],
            'birth_certificate_number' => ['nullable', 'string'],
            'father_name_en' => ['nullable', 'string'],
            'father_name_bn' => ['nullable', 'string'],
            'father_nid' => ['nullable', 'string'],
            'father_phone' => ['nullable', 'string'],
            'father_occupation' => ['nullable', 'string'],
            'mother_name_en' => ['nullable', 'string'],
            'mother_name_bn' => ['nullable', 'string'],
            'mother_nid' => ['nullable', 'string'],
            'mother_phone' => ['nullable', 'string'],
            'mother_occupation' => ['nullable', 'string'],
            'guardian_name' => ['nullable', 'string'],
            'guardian_relation' => ['nullable', 'string'],
            'guardian_phone' => ['nullable', 'string'],
            'guardian_address' => ['nullable', 'string'],
            'present_address' => ['nullable', 'string'],
            'permanent_address' => ['nullable', 'string'],
            'previous_school' => ['nullable', 'string'],
            'previous_class' => ['nullable', 'string'],
            'previous_gpa' => ['nullable', 'numeric', 'min:0', 'max:5'],
            'academic_year' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ]);

        $student->update($validated);

        return to_route('admin.students.index')
            ->with('flash.message', 'Student updated successfully.');
    }

    public function destroy(Student $student): RedirectResponse
    {
        $student->delete();

        return to_route('admin.students.index')
            ->with('flash.message', 'Student deleted successfully.');
    }
}
