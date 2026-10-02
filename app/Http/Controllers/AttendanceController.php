<?php

namespace App\Http\Controllers;

use App\Models\AttendanceRecord;
use App\Models\ClassesAndSection;
use App\Models\Student;
use App\Models\ZktecoDevice;
use App\Services\ZktecoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
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

        if (! $classId && $classes->isNotEmpty()) {
            $classId = (string) $classes->first()['id'];
        }

        $records = $classId
            ? Student::query()
                ->select([
                    'students.id',
                    'students.name_en',
                    'students.name_bn',
                    'students.roll_number',
                    'students.biometric_id',
                    'students.class_id',
                ])
                ->where('students.class_id', $classId)
                ->leftJoin('attendance_records', function ($join) use ($date) {
                    $join->on('students.id', '=', 'attendance_records.student_id')
                        ->whereDate('attendance_records.date', '=', $date);
                })
                ->addSelect([
                    'attendance_records.status as attendance_status',
                    'attendance_records.remarks as attendance_remarks',
                ])
                ->orderBy('students.roll_number')
                ->get()
                ->map(fn ($student) => [
                    'id' => $student->id,
                    'student_id' => $student->id,
                    'name_en' => $student->name_en,
                    'name_bn' => $student->name_bn,
                    'student_name' => $student->name_en ?: ($student->name_bn ?: 'Student #'.$student->roll_number),
                    'roll_number' => $student->roll_number,
                    'biometric_id' => $student->biometric_id,
                    'class_id' => $student->class_id,
                    'status' => $student->attendance_status,
                    'remarks' => $student->attendance_remarks,
                ])
            : [];

        $zkteco = ZktecoDevice::first() ?? new ZktecoDevice([
            'name' => 'Main Entrance Terminal',
            'ip_address' => '192.168.1.201',
            'port' => 4370,
            'comm_key' => 0,
            'is_enabled' => false,
            'protocol' => 'udp',
            'mapping_field' => 'roll_number',
            'late_threshold' => '09:15:00',
        ]);

        return Inertia::render('Admin/Attendance/Index', [
            'date' => $date,
            'class_id' => $classId ? (int) $classId : null,
            'classes' => $classes,
            'attendance' => $records,
            'zkteco' => [
                'id' => $zkteco->id,
                'name' => $zkteco->name,
                'ip_address' => $zkteco->ip_address,
                'port' => $zkteco->port,
                'comm_key' => $zkteco->comm_key,
                'is_enabled' => (bool) $zkteco->is_enabled,
                'protocol' => $zkteco->protocol,
                'mapping_field' => $zkteco->mapping_field,
                'late_threshold' => substr((string) ($zkteco->late_threshold ?: '09:15'), 0, 5),
                'last_sync_at' => $zkteco->last_sync_at?->format('Y-m-d H:i:s'),
                'last_sync_status' => $zkteco->last_sync_status,
                'last_sync_message' => $zkteco->last_sync_message,
            ],
            'zkteco_test_result' => session('zkteco_test_result'),
            'sidebar' => app(DashboardController::class)->adminSidebar(),
        ]);
    }

    public function zktecoSettingsPage(Request $request): Response
    {
        $device = ZktecoDevice::first() ?? new ZktecoDevice([
            'name' => 'Main Entrance Terminal',
            'ip_address' => '192.168.1.201',
            'port' => 4370,
            'comm_key' => 0,
            'is_enabled' => false,
            'protocol' => 'udp',
            'mapping_field' => 'roll_number',
            'late_threshold' => '09:15:00',
        ]);

        $classes = ClassesAndSection::query()
            ->with('institution:id,name_en')
            ->orderBy('class_level')
            ->orderBy('section_name')
            ->get()
            ->map(fn (ClassesAndSection $c) => [
                'id' => $c->id,
                'label' => $c->class_level.' '.$c->section_name.' — '.($c->institution?->name_en ?? ''),
            ]);

        return Inertia::render('Admin/Settings/Zkteco', [
            'zkteco' => [
                'id' => $device->id,
                'name' => $device->name,
                'ip_address' => $device->ip_address,
                'port' => $device->port,
                'comm_key' => $device->comm_key,
                'is_enabled' => (bool) $device->is_enabled,
                'protocol' => $device->protocol,
                'mapping_field' => $device->mapping_field,
                'late_threshold' => substr((string) ($device->late_threshold ?: '09:15'), 0, 5),
                'last_sync_at' => $device->last_sync_at?->format('Y-m-d H:i:s'),
                'last_sync_status' => $device->last_sync_status,
                'last_sync_message' => $device->last_sync_message,
            ],
            'classes' => $classes,
            'zkteco_test_result' => session('zkteco_test_result'),
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
            $attendance = AttendanceRecord::query()
                ->where('student_id', $record['student_id'])
                ->whereDate('date', $validated['date'])
                ->first() ?? new AttendanceRecord;

            $attendance->forceFill([
                'student_id' => $record['student_id'],
                'date' => $validated['date'],
                'classes_and_sections_id' => $validated['class_id'],
                'status' => $record['status'],
                'remarks' => $record['remarks'] ?? null,
                'taken_by' => $request->user()->id,
            ])->save();
        }

        return redirect()->back()
            ->with('flash.message', 'Attendance saved successfully.');
    }

    public function saveZktecoSettings(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'ip_address' => ['required', 'string', 'max:50'],
            'port' => ['required', 'integer', 'min:1', 'max:65535'],
            'comm_key' => ['nullable', 'integer', 'min:0'],
            'is_enabled' => ['required', 'boolean'],
            'protocol' => ['required', 'in:udp,tcp'],
            'mapping_field' => ['required', 'in:roll_number,id,biometric_id'],
            'late_threshold' => ['required', 'string', 'max:8'],
        ]);

        $device = ZktecoDevice::first() ?? new ZktecoDevice;
        $device->forceFill([
            'name' => $validated['name'],
            'ip_address' => $validated['ip_address'],
            'port' => $validated['port'],
            'comm_key' => $validated['comm_key'] ?? 0,
            'is_enabled' => $validated['is_enabled'],
            'protocol' => $validated['protocol'],
            'mapping_field' => $validated['mapping_field'],
            'late_threshold' => strlen($validated['late_threshold']) === 5 ? $validated['late_threshold'].':00' : $validated['late_threshold'],
        ])->save();

        return redirect()->back()->with('flash.message', 'ZKTeco device configuration updated.');
    }

    public function testZktecoConnection(Request $request, ZktecoService $zktecoService)
    {
        $validated = $request->validate([
            'ip_address' => ['required', 'string'],
            'port' => ['required', 'integer', 'min:1', 'max:65535'],
            'protocol' => ['nullable', 'in:udp,tcp'],
        ]);

        $result = $zktecoService->testConnection(
            $validated['ip_address'],
            $validated['port'],
            $validated['protocol'] ?? 'udp'
        );

        if ($request->wantsJson()) {
            return response()->json($result);
        }

        return redirect()->back()
            ->with('zkteco_test_result', $result)
            ->with($result['success'] ? 'flash.message' : 'flash.error', $result['message']);
    }

    public function syncZktecoAttendance(Request $request, ZktecoService $zktecoService): RedirectResponse
    {
        $date = $request->input('date', today()->toDateString());
        $classId = $request->input('class_id') ? (int) $request->input('class_id') : null;

        $device = ZktecoDevice::first();
        if (! $device || ! $device->is_enabled) {
            return redirect()->back()->with('flash.message', 'ZKTeco is not configured or is currently disabled.');
        }

        $pullResult = $zktecoService->pullAttendanceFromDevice($device);

        $device->last_sync_at = now();
        $device->last_sync_status = $pullResult['success'] ? 'success' : 'failed';
        $device->last_sync_message = $pullResult['message'];
        $device->save();

        if (! $pullResult['success']) {
            return redirect()->back()->with('flash.message', 'ZKTeco Sync Notice: '.$pullResult['message']);
        }

        $processResult = $zktecoService->processPunches(
            $pullResult['punches'],
            $date,
            $classId,
            $device->mapping_field,
            $device->late_threshold ?: '09:15:00',
            $request->user()->id
        );

        $msg = "Synced {$processResult['records_updated']} attendance records from ZKTeco ({$processResult['present']} present, {$processResult['late']} late).";

        return redirect()->back()->with('flash.message', $msg);
    }

    public function importZktecoFile(Request $request, ZktecoService $zktecoService): RedirectResponse
    {
        $request->validate([
            'log_file' => ['required', 'file', 'max:5120'],
            'date' => ['required', 'date'],
            'class_id' => ['nullable', 'exists:classes_and_sections,id'],
        ]);

        $file = $request->file('log_file');
        $content = file_get_contents($file->getRealPath());

        $punches = $zktecoService->parseAttendanceLogContent($content);

        if (empty($punches)) {
            return redirect()->back()->with('flash.message', 'No valid punch records found in the uploaded file. Check file format (.dat, .txt, .csv).');
        }

        $device = ZktecoDevice::first();
        $mappingField = $device?->mapping_field ?? 'roll_number';
        $lateThreshold = $device?->late_threshold ?? '09:15:00';

        $processResult = $zktecoService->processPunches(
            $punches,
            $request->input('date'),
            $request->input('class_id') ? (int) $request->input('class_id') : null,
            $mappingField,
            $lateThreshold,
            $request->user()->id
        );

        return redirect()->back()->with(
            'flash.message',
            "Imported {$processResult['records_updated']} attendance records from ZKTeco file ({$processResult['present']} present, {$processResult['late']} late)."
        );
    }

    public function admsWebhook(Request $request, ZktecoService $zktecoService): HttpResponse
    {
        if ($request->isMethod('get')) {
            return response("OK\n", 200)->header('Content-Type', 'text/plain');
        }

        $content = $request->getContent();
        $count = 0;
        if ($content) {
            $punches = $zktecoService->parseAttendanceLogContent($content);
            if (! empty($punches)) {
                $device = ZktecoDevice::first();
                $mappingField = $device?->mapping_field ?? 'roll_number';
                $lateThreshold = $device?->late_threshold ?? '09:15:00';
                $today = today()->toDateString();

                $result = $zktecoService->processPunches($punches, $today, null, $mappingField, $lateThreshold, null);
                $count = $result['records_updated'];
            }
        }

        return response("OK: {$count}\n", 200)->header('Content-Type', 'text/plain');
    }
}
