<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Models\User;
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
                ['label' => 'Open notices', 'value' => 0, 'icon' => 'megaphone'],
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
                ['label' => 'Active notices', 'value' => '—', 'icon' => 'megaphone', 'tone' => 'accent'],
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
     * @return array<int, array<string, mixed>>
     */
    public function adminSidebar(): array
    {
        return [
            [
                'title' => 'Overview',
                'items' => [
                    ['label' => 'Dashboard', 'href' => '/admin/dashboard', 'match' => 'admin/dashboard', 'icon' => 'home'],
                ],
            ],
            [
                'title' => 'Institution',
                'items' => [
                    ['label' => 'Institutions', 'href' => '/admin/institutions', 'match' => 'admin/institutions', 'icon' => 'globe'],
                    ['label' => 'Academic sessions', 'href' => '/admin/academic-sessions', 'match' => 'admin/academic-sessions', 'icon' => 'calendar'],
                    ['label' => 'Classes & sections', 'href' => '/admin/classes-and-sections', 'match' => 'admin/classes-and-sections', 'icon' => 'grid'],
                ],
            ],
            [
                'title' => 'People',
                'items' => [
                    ['label' => 'Students', 'href' => '/admin/students', 'match' => 'admin/students', 'icon' => 'graduation-cap'],
                    ['label' => 'Teachers', 'href' => '/admin/teachers', 'match' => 'admin/teachers', 'icon' => 'briefcase'],
                    ['label' => 'Users', 'href' => '/admin/users', 'match' => 'admin/users', 'icon' => 'users'],
                ],
            ],
            [
                'title' => 'Academic',
                'items' => [
                    ['label' => 'Subjects', 'href' => '/admin/subjects', 'match' => 'admin/subjects', 'icon' => 'book-open'],
                    ['label' => 'Exams', 'href' => '/admin/exams', 'match' => 'admin/exams', 'icon' => 'sparkles'],
                    ['label' => 'Attendance', 'href' => '/admin/attendance', 'match' => 'admin/attendance', 'icon' => 'check'],
                ],
            ],
            [
                'title' => 'System',
                'items' => [
                    ['label' => 'Activity log', 'href' => '/admin/activity', 'match' => 'admin/activity', 'icon' => 'activity'],
                    ['label' => 'Notifications', 'href' => '/admin/notifications', 'match' => 'admin/notifications', 'icon' => 'bell', 'badge' => 2],
                    ['label' => 'Settings', 'href' => '/admin/settings', 'match' => 'admin/settings', 'icon' => 'settings'],
                ],
            ],
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    protected function roleSidebar(string $role): array
    {
        return [
            [
                'title' => 'Overview',
                'items' => [
                    ['label' => 'Dashboard', 'href' => "/{$role}/dashboard", 'match' => "{$role}/dashboard", 'icon' => 'home'],
                ],
            ],
        ];
    }
}
