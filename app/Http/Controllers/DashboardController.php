<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Enums\PostType;
use App\Models\AcademicSession;
use App\Models\AttendanceRecord;
use App\Models\ClassesAndSection;
use App\Models\CommunicationLog;
use App\Models\CommunicationSetting;
use App\Models\Exam;
use App\Models\FeeInvoice;
use App\Models\Institution;
use App\Models\Post;
use App\Models\Student;
use App\Models\Syllabus;
use App\Models\Teacher;
use App\Models\User;
use App\Models\ZktecoDevice;
use App\Services\FeeService;
use App\Services\ResultService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function show(Request $request): Response
    {
        $user = $request->user();

        abort_unless($user?->role instanceof UserRole, 403);

        $data = match ($user->role) {
            UserRole::ADMIN => $this->adminData($user),
            UserRole::HEADMASTER => $this->headmasterData($user),
            UserRole::TEACHER => $this->teacherData($user),
            UserRole::STUDENT => $this->studentData($user),
            UserRole::STAFF => $this->staffData($user),
            UserRole::PARENT => $this->parentData($user),
        };

        return Inertia::render('Dashboard', $data);
    }

    public function users(Request $request): Response
    {
        abort_unless($request->user()?->role === UserRole::ADMIN, 403);

        $users = User::query()
            ->select(['id', 'name', 'email', 'phone', 'role', 'is_active', 'created_at'])
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get()
            ->map(fn (User $u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'phone' => $u->phone,
                'role' => $u->role?->value,
                'is_active' => (bool) $u->is_active,
                'created_at' => $u->created_at?->toDateTimeString(),
            ]);

        return Inertia::render('Admin/Users', [
            'users' => $users,
            'sidebar' => $this->adminSidebar(),
        ]);
    }

    public function activity(Request $request): Response
    {
        abort_unless($request->user()?->role === UserRole::ADMIN, 403);

        return Inertia::render('Admin/Activity', [
            'sidebar' => $this->adminSidebar(),
            'entries' => [
                ['actor' => 'Admin', 'action' => 'updated settings', 'target' => 'System', 'time' => '2 minutes ago', 'ip' => '127.0.0.1'],
                ['actor' => 'Admin', 'action' => 'created user', 'target' => 'staff@example.com', 'time' => '1 hour ago', 'ip' => '127.0.0.1'],
                ['actor' => 'Headmaster', 'action' => 'logged in', 'target' => 'Web', 'time' => '3 hours ago', 'ip' => '10.0.0.4'],
                ['actor' => 'Teacher', 'action' => 'submitted grades', 'target' => 'Class 9A', 'time' => '5 hours ago', 'ip' => '10.0.0.7'],
                ['actor' => 'Admin', 'action' => 'disabled user', 'target' => 'old@example.com', 'time' => 'Yesterday', 'ip' => '127.0.0.1'],
            ],
        ]);
    }

    public function settings(Request $request): Response
    {
        abort_unless($request->user()?->role === UserRole::ADMIN, 403);

        return Inertia::render('Admin/Settings', [
            'sidebar' => $this->adminSidebar(),
            'school' => Institution::current()->toAdminArray(),
            'commSettings' => CommunicationSetting::current(),
            'groups' => [
                [
                    'title' => 'General',
                    'fields' => [
                        ['key' => 'app_name', 'label' => 'Application name', 'value' => 'SMS App', 'type' => 'text'],
                        ['key' => 'support_email', 'label' => 'Support email', 'value' => 'support@example.com', 'type' => 'email'],
                        ['key' => 'timezone', 'label' => 'Default timezone', 'value' => 'UTC', 'type' => 'text'],
                    ],
                ],
                [
                    'title' => 'Notifications',
                    'fields' => [
                        ['key' => 'notify_signup', 'label' => 'Email on new sign-up', 'value' => true, 'type' => 'toggle'],
                        ['key' => 'notify_payment', 'label' => 'Email on payment events', 'value' => false, 'type' => 'toggle'],
                    ],
                ],
            ],
        ]);
    }

    public function notifications(Request $request): Response
    {
        $user = $request->user();
        abort_unless($user, 403);

        return Inertia::render('Admin/Notifications', [
            'sidebar' => $this->adminSidebar(),
            'items' => [
                ['id' => 1, 'title' => 'System update available', 'body' => 'Version 1.2.0 is ready to install.', 'time' => '2 minutes ago', 'level' => 'info', 'read' => false],
                ['id' => 2, 'title' => 'New user signed up', 'body' => 'staff@example.com just created an account.', 'time' => '1 hour ago', 'level' => 'success', 'read' => false],
                ['id' => 3, 'title' => 'Disk usage at 80%', 'body' => 'Free up space on the primary volume.', 'time' => '5 hours ago', 'level' => 'warning', 'read' => true],
                ['id' => 4, 'title' => 'Failed login attempts', 'body' => '5 failed logins from 203.0.113.42 in the last hour.', 'time' => 'Yesterday', 'level' => 'danger', 'read' => true],
            ],
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    protected function adminData(User $user): array
    {
        $totalStudents = Student::query()->count();
        $totalTeachers = Teacher::query()->count();
        $totalClasses = ClassesAndSection::query()->count();
        $totalUsers = User::query()->count();

        $attendanceSummary = $this->getAttendanceSummary();
        $financeSummary = $this->getFinanceSummary();
        $zktecoSummary = $this->getZktecoSummary();

        return [
            'role' => 'admin',
            'title' => 'School management',
            'subtitle' => 'Manage academic operations, student attendance, examinations, and fee collections.',
            'stats' => [
                ['label' => 'Total students', 'value' => $totalStudents, 'icon' => 'graduation-cap', 'tone' => 'default', 'href' => '/admin/students'],
                ['label' => 'Teaching staff', 'value' => $totalTeachers, 'icon' => 'briefcase', 'tone' => 'default', 'href' => '/admin/teachers'],
                ['label' => 'Attendance today', 'value' => $attendanceSummary['marked_today'] > 0 ? $attendanceSummary['rate'].'%' : 'Pending', 'icon' => 'check-circle', 'tone' => 'default', 'href' => '/admin/attendance'],
                ['label' => 'Classes & Sections', 'value' => $totalClasses, 'icon' => 'book-open', 'tone' => 'default', 'href' => '/admin/classes-and-sections'],
            ],
            'cards' => [],
            'sidebar' => $this->adminSidebar(),
            'notificationCount' => 2,
            'attendanceSummary' => $attendanceSummary,
            'financeSummary' => $financeSummary,
            'upcomingExams' => $this->getUpcomingExams(),
            'recentNotices' => $this->getRecentNotices(),
            'zktecoSummary' => $zktecoSummary,
            'communicationSummary' => $this->getCommunicationSummary(),
            'schoolInfo' => $this->getSchoolInfo(),
            'recentActivity' => [
                ['actor' => 'Class Teacher', 'action' => 'submitted attendance for', 'target' => 'Class 10-A', 'time' => '15 minutes ago'],
                ['actor' => 'Accounts Office', 'action' => 'issued tuition fees for', 'target' => 'Monthly Session', 'time' => '1 hour ago'],
                ['actor' => 'Exam Controller', 'action' => 'recorded grades for', 'target' => 'Terminal Exam', 'time' => '2 hours ago'],
                ['actor' => 'Notice Board', 'action' => 'published announcement for', 'target' => 'Annual Sports Day', 'time' => '4 hours ago'],
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    protected function headmasterData(User $user): array
    {
        $totalStudents = Student::query()->count();
        $totalTeachers = Teacher::query()->count();
        $totalClasses = ClassesAndSection::query()->count();
        $attendanceSummary = $this->getAttendanceSummary();

        return [
            'role' => 'headmaster',
            'title' => 'School overview',
            'subtitle' => 'Track academic performance, staff, and key metrics across the school.',
            'stats' => [
                ['label' => 'Total students', 'value' => $totalStudents, 'icon' => 'graduation-cap', 'tone' => 'default', 'href' => '/admin/students'],
                ['label' => 'Teaching staff', 'value' => $totalTeachers, 'icon' => 'briefcase', 'tone' => 'default', 'href' => '/admin/teachers'],
                ['label' => 'Attendance today', 'value' => $attendanceSummary['marked_today'] > 0 ? $attendanceSummary['rate'].'%' : 'Pending', 'icon' => 'check-circle', 'tone' => 'default', 'href' => '/admin/attendance'],
                ['label' => 'Classes & Sections', 'value' => $totalClasses, 'icon' => 'book-open', 'tone' => 'default', 'href' => '/admin/classes-and-sections'],
            ],
            'cards' => [],
            'sidebar' => $this->roleSidebar('headmaster'),
            'notificationCount' => 0,
            'attendanceSummary' => $attendanceSummary,
            'financeSummary' => $this->getFinanceSummary(),
            'upcomingExams' => $this->getUpcomingExams(),
            'recentNotices' => $this->getRecentNotices(),
            'zktecoSummary' => $this->getZktecoSummary(),
            'communicationSummary' => $this->getCommunicationSummary(),
            'schoolInfo' => $this->getSchoolInfo(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    protected function teacherData(User $user): array
    {
        $totalStudents = Student::query()->count();
        $totalClasses = ClassesAndSection::query()->count();
        $attendanceSummary = $this->getAttendanceSummary();

        return [
            'role' => 'teacher',
            'title' => 'Your academic desk',
            'subtitle' => 'Manage attendance, grades, and lessons for your classes.',
            'stats' => [
                ['label' => 'Classes', 'value' => $totalClasses, 'icon' => 'book-open', 'tone' => 'accent', 'href' => '/admin/classes-and-sections'],
                ['label' => 'Students', 'value' => $totalStudents, 'icon' => 'users', 'tone' => 'success', 'href' => '/admin/students'],
                ['label' => 'Today attendance', 'value' => $attendanceSummary['marked_today'] > 0 ? $attendanceSummary['rate'].'%' : 'Pending', 'icon' => 'check', 'tone' => 'warning', 'href' => '/admin/attendance'],
                ['label' => 'Open notices', 'value' => Post::query()->ofType(PostType::NOTICE)->published()->count(), 'icon' => 'megaphone', 'href' => '/notices'],
            ],
            'cards' => [
                [
                    'title' => "Today's summary",
                    'items' => [
                        ['label' => 'Attendance status', 'value' => $attendanceSummary['marked_today'] > 0 ? $attendanceSummary['present'].' Present' : 'Attendance pending', 'status' => $attendanceSummary['marked_today'] > 0 ? 'good' : 'warn'],
                        ['label' => 'Academic session', 'value' => $this->getSchoolInfo()['session'], 'status' => 'ok'],
                    ],
                ],
            ],
            'sidebar' => $this->roleSidebar('teacher'),
            'notificationCount' => 0,
            'attendanceSummary' => $attendanceSummary,
            'upcomingExams' => $this->getUpcomingExams(),
            'recentNotices' => $this->getRecentNotices(),
            'schoolInfo' => $this->getSchoolInfo(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    protected function studentData(User $user): array
    {
        $student = Student::where('user_id', $user->id)->with('class')->first();
        $className = $student?->class ? trim($student->class->class_level.' '.$student->class->section_name) : 'Assigned';

        return [
            'role' => 'student',
            'title' => 'Your learning portal',
            'subtitle' => 'View your classes, examination schedules, and syllabus materials.',
            'stats' => [
                ['label' => 'Class / Section', 'value' => $className, 'icon' => 'book-open', 'tone' => 'accent'],
                ['label' => 'Published exams', 'value' => Exam::where('is_published', true)->count(), 'icon' => 'sparkles', 'tone' => 'success'],
                ['label' => 'Notices', 'value' => Post::query()->ofType(PostType::NOTICE)->published()->count(), 'icon' => 'megaphone', 'tone' => 'warning', 'href' => '/notices'],
                ['label' => 'Syllabus documents', 'value' => Syllabus::count(), 'icon' => 'download', 'href' => '/syllabus'],
            ],
            'cards' => [
                [
                    'title' => 'Academic status',
                    'items' => [
                        ['label' => 'Enrolled class', 'value' => $className],
                        ['label' => 'Current session', 'value' => $this->getSchoolInfo()['session']],
                    ],
                ],
            ],
            'sidebar' => $this->roleSidebar('student'),
            'notificationCount' => 0,
            'upcomingExams' => $this->getUpcomingExams(),
            'recentNotices' => $this->getRecentNotices(),
            'schoolInfo' => $this->getSchoolInfo(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    protected function staffData(User $user): array
    {
        $attendanceSummary = $this->getAttendanceSummary();
        $zktecoSummary = $this->getZktecoSummary();

        return [
            'role' => 'staff',
            'title' => 'Operations dashboard',
            'subtitle' => 'Manage day-to-day operations, attendance logs, and school facilities.',
            'stats' => [
                ['label' => 'Students', 'value' => Student::count(), 'icon' => 'users', 'tone' => 'accent', 'href' => '/admin/students'],
                ['label' => 'Attendance today', 'value' => $attendanceSummary['marked_today'] > 0 ? $attendanceSummary['present'].' present' : 'Pending', 'icon' => 'check', 'tone' => 'success', 'href' => '/admin/attendance'],
                ['label' => 'Active notices', 'value' => Post::query()->ofType(PostType::NOTICE)->published()->count(), 'icon' => 'megaphone', 'tone' => 'warning', 'href' => '/notices'],
                ['label' => 'ZKTeco devices', 'value' => $zktecoSummary['total'], 'icon' => 'server', 'href' => '/admin/settings/zkteco'],
            ],
            'cards' => [
                [
                    'title' => 'Operational status',
                    'items' => [
                        ['label' => 'Biometric system', 'value' => $zktecoSummary['online'].' online', 'status' => 'ok'],
                        ['label' => 'Notice board', 'value' => 'Active', 'status' => 'ok'],
                    ],
                ],
            ],
            'sidebar' => $this->roleSidebar('staff'),
            'notificationCount' => 0,
            'attendanceSummary' => $attendanceSummary,
            'upcomingExams' => $this->getUpcomingExams(),
            'recentNotices' => $this->getRecentNotices(),
            'zktecoSummary' => $zktecoSummary,
            'schoolInfo' => $this->getSchoolInfo(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    protected function parentData(User $user): array
    {
        $children = $user->children()->with(['class', 'institution'])->get();
        $childIds = $children->pluck('id');

        $attendance = AttendanceRecord::query()
            ->whereIn('student_id', $childIds)
            ->get(['status']);
        $attendanceAvg = $attendance->isNotEmpty()
            ? round($attendance->where('status', 'present')->count() / $attendance->count() * 100).'%'
            : '—';

        $resultService = app(ResultService::class);
        $resultItems = $children->map(function (Student $child) use ($resultService) {
            $exam = Exam::query()
                ->where('institution_id', $child->institution_id)
                ->where('is_published', true)
                ->orderByDesc('start_date')
                ->first();

            if ($exam === null) {
                return ['label' => $child->name_en, 'value' => 'No published exam'];
            }

            $result = $resultService->studentResult($child, $exam);

            $value = match (true) {
                ! $result['has_marks'] => 'No marks yet',
                $result['passed'] === true => 'GPA '.number_format((float) $result['gpa'], 2).' ('.$result['grade'].')',
                default => 'Failed',
            };

            return ['label' => $child->name_en.' — '.$exam->name_en, 'value' => $value];
        });

        $feeService = app(FeeService::class);
        $totalFeesDue = $children->sum(fn (Student $c) => $feeService->studentDueSummary($c)['total_due']);
        $feesDueLabel = $children->isEmpty()
            ? '—'
            : '৳'.number_format($totalFeesDue, 0);

        return [
            'role' => 'parent',
            'title' => 'Your children',
            'subtitle' => 'Track attendance, results, and fee status for your children.',
            'stats' => [
                ['label' => 'Children', 'value' => $children->count(), 'icon' => 'users', 'tone' => 'accent'],
                ['label' => 'Attendance (avg)', 'value' => $attendanceAvg, 'icon' => 'check', 'tone' => 'success'],
                ['label' => 'Fees due', 'value' => $feesDueLabel, 'icon' => 'wallet', 'tone' => 'warning', 'href' => '/parent/fees'],
                ['label' => 'Published notices', 'value' => Post::query()->ofType(PostType::NOTICE)->published()->count(), 'icon' => 'bell', 'href' => '/notices'],
            ],
            'cards' => [
                [
                    'title' => 'Your children',
                    'items' => $children->isEmpty()
                        ? [['label' => 'No children linked to this account yet', 'value' => '—']]
                        : $children->map(fn (Student $c) => [
                            'label' => $c->name_en,
                            'value' => $c->class
                                ? trim($c->class->class_level.' '.$c->class->section_name)
                                : '—',
                        ])->all(),
                ],
                [
                    'title' => 'Latest results',
                    'items' => $resultItems->isEmpty()
                        ? [['label' => 'No results available yet', 'value' => '—']]
                        : $resultItems->all(),
                ],
            ],
            'sidebar' => $this->roleSidebar('parent'),
            'notificationCount' => 0,
            'attendanceSummary' => $this->getAttendanceSummary(),
            'upcomingExams' => $this->getUpcomingExams(),
            'recentNotices' => $this->getRecentNotices(),
            'schoolInfo' => $this->getSchoolInfo(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    protected function getAttendanceSummary(): array
    {
        $todayAttendance = AttendanceRecord::query()
            ->whereDate('date', today())
            ->get(['status']);

        $totalStudents = Student::query()->count();
        $markedToday = $todayAttendance->count();
        $present = $todayAttendance->where('status', 'present')->count();
        $absent = $todayAttendance->where('status', 'absent')->count();
        $late = $todayAttendance->where('status', 'late')->count();
        $rate = $markedToday > 0 ? round(($present / $markedToday) * 100, 1) : 0;

        return [
            'marked_today' => $markedToday,
            'total_students' => $totalStudents,
            'present' => $present,
            'absent' => $absent,
            'late' => $late,
            'rate' => $rate,
            'date_formatted' => now()->format('D, M d, Y'),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    protected function getFinanceSummary(): array
    {
        $totalInvoiced = (float) FeeInvoice::query()->sum('amount');
        $totalCollected = (float) FeeInvoice::query()->sum('paid_amount');
        $totalDue = max(0, $totalInvoiced - $totalCollected);
        $rate = $totalInvoiced > 0 ? round(($totalCollected / $totalInvoiced) * 100, 1) : 0;

        return [
            'total_invoiced' => $totalInvoiced,
            'total_collected' => $totalCollected,
            'total_due' => $totalDue,
            'collection_rate' => $rate,
            'currency' => '৳',
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    protected function getUpcomingExams(): array
    {
        return Exam::query()
            ->with('session')
            ->orderBy('start_date', 'desc')
            ->take(4)
            ->get()
            ->map(function (Exam $exam) {
                $today = today();
                $status = 'Upcoming';
                if ($exam->start_date && $exam->end_date) {
                    if ($today->between($exam->start_date, $exam->end_date)) {
                        $status = 'Ongoing';
                    } elseif ($today->gt($exam->end_date)) {
                        $status = 'Completed';
                    }
                }
                return [
                    'id' => $exam->id,
                    'name' => $exam->name_en,
                    'session' => $exam->session?->session_name ?? '—',
                    'start_date' => $exam->start_date?->format('M d, Y'),
                    'end_date' => $exam->end_date?->format('M d, Y'),
                    'is_published' => (bool) $exam->is_published,
                    'status' => $status,
                ];
            })
            ->values()
            ->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    protected function getRecentNotices(): array
    {
        return Post::query()
            ->ofType(PostType::NOTICE)
            ->published()
            ->latest('published_at')
            ->take(4)
            ->get(['id', 'title_en', 'published_at', 'slug'])
            ->map(fn (Post $p) => [
                'id' => $p->id,
                'title' => $p->title_en,
                'slug' => $p->slug,
                'time' => $p->published_at?->diffForHumans() ?? 'Recently',
                'date' => $p->published_at?->format('M d, Y') ?? '—',
            ])
            ->values()
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    protected function getZktecoSummary(): array
    {
        $devices = ZktecoDevice::query()
            ->select(['id', 'name', 'ip_address', 'port', 'is_enabled', 'last_sync_at', 'last_sync_status'])
            ->take(5)
            ->get()
            ->map(fn (ZktecoDevice $d) => [
                'id' => $d->id,
                'device_name' => $d->name,
                'ip_address' => $d->ip_address,
                'port' => $d->port,
                'status' => $d->is_enabled ? 'online' : 'disabled',
                'is_enabled' => (bool) $d->is_enabled,
                'last_sync_at' => $d->last_sync_at?->diffForHumans() ?? 'Never',
            ])
            ->values()
            ->all();

        $total = ZktecoDevice::count();
        $online = ZktecoDevice::where('is_enabled', true)->count();

        return [
            'total' => $total,
            'online' => $online,
            'offline' => max(0, $total - $online),
            'devices' => $devices,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    protected function getCommunicationSummary(): array
    {
        $smsSent = CommunicationLog::query()->where('channel', 'sms')->count();
        $emailSent = CommunicationLog::query()->where('channel', 'email')->count();

        return [
            'sms_sent' => $smsSent,
            'email_sent' => $emailSent,
            'total' => $smsSent + $emailSent,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    protected function getSchoolInfo(): array
    {
        $institution = null;
        try {
            $institution = Institution::query()->orderBy('id')->first();
        } catch (\Throwable) {}

        $activeSession = AcademicSession::where('is_active', true)->first();

        return [
            'name' => $institution?->name_en ?? 'School Management System',
            'name_bn' => $institution?->name_bn ?? '',
            'eiin' => $institution?->eiin_number ?? '',
            'session' => $activeSession?->session_name ?? (string) date('Y'),
            'logo_url' => $institution?->logoUrl(),
        ];
    }

    /**
     * Every role sees the full menu; unauthorized pages show a
     * "not authorized" modal instead of hiding the links (owner request).
     *
     * @return array<int, array<string, mixed>>
     */
    public function fullSidebar(string $role): array
    {
        $groups = [
            [
                'title' => __('ui.sidebar.overview'),
                'items' => [
                    ['label' => __('ui.sidebar.dashboard'), 'href' => "/{$role}/dashboard", 'match' => "{$role}/dashboard", 'icon' => 'home'],
                ],
            ],
        ];

        if ($role === 'student') {
            $groups[] = [
                'title' => __('ui.sidebar.my_academics'),
                'items' => [
                    ['label' => __('ui.sidebar.my_results'), 'href' => '/student/results', 'match' => 'student/results', 'icon' => 'sparkles'],
                ],
            ];
        }

        if ($role === 'parent') {
            $groups[] = [
                'title' => __('ui.sidebar.children'),
                'items' => [
                    ['label' => __('ui.sidebar.results'), 'href' => '/parent/results', 'match' => 'parent/results', 'icon' => 'sparkles'],
                    ['label' => __('ui.sidebar.fees'), 'href' => '/parent/fees', 'match' => 'parent/fees', 'icon' => 'wallet'],
                ],
            ];
        }

        return [
            ...$groups,
            [
                'title' => __('ui.sidebar.school'),
                'items' => [
                    ['label' => __('ui.sidebar.academic_sessions'), 'href' => '/admin/academic-sessions', 'match' => 'admin/academic-sessions', 'icon' => 'calendar'],
                    ['label' => __('ui.sidebar.classes_sections'), 'href' => '/admin/classes-and-sections', 'match' => 'admin/classes-and-sections', 'icon' => 'grid'],
                ],
            ],
            [
                'title' => __('ui.sidebar.people'),
                'items' => [
                    ['label' => __('ui.sidebar.students'), 'href' => '/admin/students', 'match' => 'admin/students', 'icon' => 'graduation-cap'],
                    ['label' => __('ui.sidebar.teachers'), 'href' => '/admin/teachers', 'match' => 'admin/teachers', 'icon' => 'briefcase'],
                    ['label' => __('ui.sidebar.users'), 'href' => '/admin/users', 'match' => 'admin/users', 'icon' => 'users'],
                ],
            ],
            [
                'title' => __('ui.sidebar.academic'),
                'items' => [
                    ['label' => __('ui.sidebar.subjects'), 'href' => '/admin/subjects', 'match' => 'admin/subjects', 'icon' => 'book-open'],
                    ['label' => __('ui.sidebar.syllabus'), 'href' => '/admin/syllabus', 'match' => 'admin/syllabus', 'icon' => 'list'],
                    ['label' => __('ui.sidebar.exams'), 'href' => '/admin/exams', 'match' => 'admin/exams', 'icon' => 'sparkles'],
                    ['label' => __('ui.sidebar.results'), 'href' => '/admin/results', 'match' => 'admin/results', 'icon' => 'graduation-cap'],
                    ['label' => __('ui.sidebar.fee_structures'), 'href' => '/admin/fees/structures', 'match' => 'admin/fees/structures', 'icon' => 'wallet'],
                    ['label' => __('ui.sidebar.fee_invoices'), 'href' => '/admin/fees/invoices', 'match' => 'admin/fees/invoices', 'icon' => 'list'],
                    ['label' => __('ui.sidebar.attendance'), 'href' => '/admin/attendance', 'match' => 'admin/attendance', 'icon' => 'check'],
                    ['label' => __('ui.sidebar.zkteco'), 'href' => '/admin/settings/zkteco', 'match' => 'admin/settings/zkteco', 'icon' => 'server'],
                ],
            ],
            [
                'title' => __('ui.sidebar.communication'),
                'items' => [
                    ['label' => __('ui.sidebar.sms_email'), 'href' => '/admin/communication/messages', 'match' => 'admin/communication/messages', 'icon' => 'mail'],
                    ['label' => __('ui.sidebar.notice_board'), 'href' => '/notices', 'match' => 'notices', 'icon' => 'megaphone'],
                    ['label' => __('ui.sidebar.manage_notices'), 'href' => '/admin/posts/notice', 'match' => 'admin/posts/notice', 'icon' => 'pencil'],
                ],
            ],
            [
                'title' => __('ui.sidebar.system'),
                'items' => [
                    ['label' => __('ui.sidebar.activity_log'), 'href' => '/admin/activity', 'match' => 'admin/activity', 'icon' => 'activity'],
                    ['label' => __('ui.sidebar.notifications'), 'href' => '/admin/notifications', 'match' => 'admin/notifications', 'icon' => 'bell', 'badge' => 2],
                    ['label' => __('ui.sidebar.settings'), 'href' => '/admin/settings', 'match' => 'admin/settings', 'icon' => 'settings'],
                ],
            ],
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function adminSidebar(): array
    {
        return $this->fullSidebar('admin');
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    protected function roleSidebar(string $role): array
    {
        return $this->fullSidebar($role);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function studentSidebar(): array
    {
        return $this->fullSidebar('student');
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function parentSidebar(): array
    {
        return $this->fullSidebar('parent');
    }
}
