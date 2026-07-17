<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Enums\PostType;
use App\Models\AttendanceRecord;
use App\Models\Exam;
use App\Models\Post;
use App\Models\Student;
use App\Models\User;
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
        return [
            'role' => 'admin',
            'title' => 'System overview',
            'subtitle' => 'Manage users, monitor system health, and configure the platform.',
            'stats' => [
                ['label' => 'Total users', 'value' => User::count(), 'icon' => 'users', 'tone' => 'accent', 'trend' => 12, 'href' => '/admin/users'],
                ['label' => 'Active now', 'value' => '—', 'icon' => 'sparkles', 'tone' => 'success', 'trend' => 4],
                ['label' => 'System health', 'value' => 'Operational', 'icon' => 'shield', 'tone' => 'success'],
                ['label' => 'Open alerts', 'value' => 0, 'icon' => 'bell', 'tone' => 'default'],
            ],
            'cards' => [
                [
                    'title' => 'System health',
                    'items' => [
                        ['label' => 'Database', 'value' => 'Operational', 'status' => 'ok'],
                        ['label' => 'Cache', 'value' => 'Operational', 'status' => 'ok'],
                        ['label' => 'Queue', 'value' => 'Operational', 'status' => 'ok'],
                        ['label' => 'Storage', 'value' => '42% used', 'status' => 'ok'],
                    ],
                ],
            ],
            'sidebar' => $this->adminSidebar(),
            'notificationCount' => 2,
            'recentActivity' => [
                ['actor' => 'Admin', 'action' => 'updated', 'target' => 'System settings', 'time' => '2 minutes ago'],
                ['actor' => 'Headmaster', 'action' => 'joined', 'target' => 'the platform', 'time' => '1 hour ago'],
                ['actor' => 'Teacher', 'action' => 'submitted', 'target' => 'Q1 grades', 'time' => '3 hours ago'],
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    protected function headmasterData(User $user): array
    {
        return [
            'role' => 'headmaster',
            'title' => 'School overview',
            'subtitle' => 'Track academic performance, staff, and key metrics across the school.',
            'stats' => [
                ['label' => 'Students', 'value' => '—', 'icon' => 'graduation-cap', 'tone' => 'accent'],
                ['label' => 'Teachers', 'value' => '—', 'icon' => 'briefcase', 'tone' => 'success'],
                ['label' => 'Attendance today', 'value' => '—', 'icon' => 'check', 'tone' => 'warning'],
                ['label' => 'Open notices', 'value' => Post::query()->ofType(PostType::NOTICE)->published()->count(), 'icon' => 'megaphone', 'href' => '/notices'],
            ],
            'cards' => [
                [
                    'title' => 'Today at a glance',
                    'items' => [
                        ['label' => 'Students present', 'value' => '—'],
                        ['label' => 'Teachers present', 'value' => '—'],
                        ['label' => 'Classes in session', 'value' => '—'],
                    ],
                ],
            ],
            'sidebar' => $this->roleSidebar('headmaster'),
            'notificationCount' => 0,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    protected function teacherData(User $user): array
    {
        return [
            'role' => 'teacher',
            'title' => 'Your classes',
            'subtitle' => 'Manage attendance, grades, and lessons for your classes.',
            'stats' => [
                ['label' => 'Classes', 'value' => '—', 'icon' => 'book-open', 'tone' => 'accent'],
                ['label' => 'Students', 'value' => '—', 'icon' => 'users', 'tone' => 'success'],
                ['label' => 'Pending grades', 'value' => '—', 'icon' => 'pencil', 'tone' => 'warning'],
                ['label' => 'Avg. attendance', 'value' => '—', 'icon' => 'check'],
            ],
            'cards' => [
                [
                    'title' => "Today's schedule",
                    'items' => [
                        ['label' => 'No classes scheduled', 'value' => '—'],
                    ],
                ],
            ],
            'sidebar' => $this->roleSidebar('teacher'),
            'notificationCount' => 0,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    protected function studentData(User $user): array
    {
        return [
            'role' => 'student',
            'title' => 'Your learning',
            'subtitle' => 'View your classes, grades, and upcoming assignments.',
            'stats' => [
                ['label' => 'Classes', 'value' => '—', 'icon' => 'book-open', 'tone' => 'accent'],
                ['label' => 'Avg. grade', 'value' => '—', 'icon' => 'sparkles', 'tone' => 'success'],
                ['label' => 'Assignments due', 'value' => '—', 'icon' => 'clock', 'tone' => 'warning'],
                ['label' => 'Attendance', 'value' => '—', 'icon' => 'check'],
            ],
            'cards' => [
                [
                    'title' => 'Upcoming',
                    'items' => [
                        ['label' => 'No upcoming assignments', 'value' => '—'],
                    ],
                ],
            ],
            'sidebar' => $this->roleSidebar('student'),
            'notificationCount' => 0,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    protected function staffData(User $user): array
    {
        return [
            'role' => 'staff',
            'title' => 'Operations',
            'subtitle' => 'Manage day-to-day operations and tasks.',
            'stats' => [
                ['label' => 'Open tasks', 'value' => '—', 'icon' => 'check', 'tone' => 'warning'],
                ['label' => 'Completed today', 'value' => '—', 'icon' => 'sparkles', 'tone' => 'success'],
                ['label' => 'Active notices', 'value' => Post::query()->ofType(PostType::NOTICE)->published()->count(), 'icon' => 'megaphone', 'tone' => 'accent', 'href' => '/notices'],
                ['label' => 'Pending requests', 'value' => '—', 'icon' => 'clock'],
            ],
            'cards' => [
                [
                    'title' => 'Recent activity',
                    'items' => [
                        ['label' => 'No recent activity', 'value' => '—'],
                    ],
                ],
            ],
            'sidebar' => $this->roleSidebar('staff'),
            'notificationCount' => 0,
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
                    ['label' => __('ui.sidebar.school_profile'), 'href' => '/admin/settings/school', 'match' => 'admin/settings/school', 'icon' => 'globe'],
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
                    ['label' => __('ui.sidebar.exams'), 'href' => '/admin/exams', 'match' => 'admin/exams', 'icon' => 'sparkles'],
                    ['label' => __('ui.sidebar.results'), 'href' => '/admin/results', 'match' => 'admin/results', 'icon' => 'graduation-cap'],
                    ['label' => __('ui.sidebar.fee_structures'), 'href' => '/admin/fees/structures', 'match' => 'admin/fees/structures', 'icon' => 'wallet'],
                    ['label' => __('ui.sidebar.fee_invoices'), 'href' => '/admin/fees/invoices', 'match' => 'admin/fees/invoices', 'icon' => 'list'],
                    ['label' => __('ui.sidebar.attendance'), 'href' => '/admin/attendance', 'match' => 'admin/attendance', 'icon' => 'check'],
                ],
            ],
            [
                'title' => __('ui.sidebar.website'),
                'items' => [
                    ['label' => __('ui.sidebar.notices'), 'href' => '/admin/posts/notice', 'match' => 'admin/posts/notice', 'icon' => 'megaphone'],
                    ['label' => __('ui.sidebar.blog'), 'href' => '/admin/posts/blog', 'match' => 'admin/posts/blog', 'icon' => 'book-open'],
                    ['label' => __('ui.sidebar.activities'), 'href' => '/admin/posts/activity', 'match' => 'admin/posts/activity', 'icon' => 'sparkles'],
                    ['label' => __('ui.sidebar.syllabus'), 'href' => '/admin/syllabus', 'match' => 'admin/syllabus', 'icon' => 'list'],
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
