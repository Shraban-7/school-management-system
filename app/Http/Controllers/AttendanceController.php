<?php

namespace App\Http\Controllers;

use App\Models\AttendanceRecord;
use App\Models\Student;
use App\Models\ClassesAndSection;
use App\Models\Institution;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceController extends Controller
{
    public function index(Request $request): Response
    {
        $date = $request->input('date', today()->toDateString());
        $classId = $request->input('class_id');

        $classes = ClassesAndSection::query()
            ->with('institution:id,name_en')
            ->orderBy('class_level')
            ->orderBy('section_name')
            ->get()
            ->map(fn (ClassesAndSection $c) => [
                'id' => $c->id,
                'label' => $c->class_level.' '.$c->section_name.' — '.($c->institution?->name_en ?? ''),
            ]);

        $records = Student::query()
            ->select([
                'students.id',
                'students.name_en',
                'students.name_bn',
                'students.roll_number',
                'students.class_id',
            ])
            ->when($classId, fn ($q) => $q->where('students.class_id', $classId))
            ->leftJoin('attendance_records', function ($join) use ($date) {
                $join->on('students.id', '=', 'attendance_records.student_id')
                    ->where('attendance_records.date', '=', $date);
            })
            ->addSelect([
                'attendance_records.status as attendance_status',
                'attendance_records.remarks as attendance_remarks',
            ])
            ->orderBy('students.roll_number')
            ->get()
            ->map(fn ($student) => [
                'id' => $student->id,
                'name_en' => $student->name_en,
                'name_bn' => $student->name_bn,
                'roll_number' => $student->roll_number,
                'class_id' => $student->class_id,
                'status' => $student->attendance_status,
                'remarks' => $student->attendance_remarks,
            ]);

        return Inertia::render('Admin/Attendance/Index', [
            'date' => $date,
            'classes' => $classes,
            'attendance' => $records,
            'sidebar' => app(DashboardController::class)->adminSidebar(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'date' => ['required', 'date'],
            'class_id' => ['required', 'exists:classes_and_sections,id'],
            'records' => ['required', 'array'],
            'records.*.student_id' => ['required', 'exists:students,id'],
            'records.*.status' => ['required', 'in:present,absent,late'],
            'records.*.remarks' => ['nullable', 'string', 'max:500'],
        ]);

        foreach ($validated['records'] as $record) {
            AttendanceRecord::updateOrCreate(
                [
                    'student_id' => $record['student_id'],
                    'date' => $validated['date'],
                ],
                [
                    'classes_and_sections_id' => $validated['class_id'],
                    'status' => $record['status'],
                    'remarks' => $record['remarks'] ?? null,
                    'taken_by' => $request->user()->id,
                ]
            );
        }

        return redirect()->back()
            ->with('flash.message', 'Attendance saved successfully.');
    }
}
