<?php

use App\Http\Controllers\AcademicSessionController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClassesAndSectionController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DemoController;
use App\Http\Controllers\ExamController;
use App\Http\Controllers\InstitutionController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\TeacherController;
use Illuminate\Support\Facades\Route;

Route::get('/', [DemoController::class, 'home'])->name('home');
Route::get('/about', [DemoController::class, 'about'])->name('about');
Route::get('/contact', [DemoController::class, 'contact'])->name('contact');

Route::inertia('/welcome', 'Welcome')->name('welcome');

Route::middleware('guest')->group(function (): void {
    Route::get('/login', [AuthController::class, 'create'])->name('login');
    Route::post('/login', [AuthController::class, 'store']);
});

Route::middleware('auth')->group(function (): void {
    Route::post('/logout', [AuthController::class, 'destroy'])->name('logout');

    Route::middleware('role:admin')->group(function (): void {
        Route::get('/admin/dashboard', [DashboardController::class, 'show'])->name('admin.dashboard');
        Route::get('/admin/users', [DashboardController::class, 'users'])->name('admin.users');
        Route::get('/admin/activity', [DashboardController::class, 'activity'])->name('admin.activity');
        Route::get('/admin/settings', [DashboardController::class, 'settings'])->name('admin.settings');
        Route::get('/admin/notifications', [DashboardController::class, 'notifications'])->name('admin.notifications');

        Route::resource('/admin/institutions', InstitutionController::class)
            ->names([
                'index' => 'admin.institutions.index',
                'create' => 'admin.institutions.create',
                'store' => 'admin.institutions.store',
                'edit' => 'admin.institutions.edit',
                'update' => 'admin.institutions.update',
                'destroy' => 'admin.institutions.destroy',
            ])
            ->except(['show']);

        Route::resource('/admin/academic-sessions', AcademicSessionController::class)
            ->names([
                'index' => 'admin.academic-sessions.index',
                'create' => 'admin.academic-sessions.create',
                'store' => 'admin.academic-sessions.store',
                'edit' => 'admin.academic-sessions.edit',
                'update' => 'admin.academic-sessions.update',
                'destroy' => 'admin.academic-sessions.destroy',
            ])
            ->except(['show']);

        Route::resource('/admin/classes-and-sections', ClassesAndSectionController::class)
            ->names([
                'index' => 'admin.classes-and-sections.index',
                'create' => 'admin.classes-and-sections.create',
                'store' => 'admin.classes-and-sections.store',
                'edit' => 'admin.classes-and-sections.edit',
                'update' => 'admin.classes-and-sections.update',
                'destroy' => 'admin.classes-and-sections.destroy',
            ])
            ->except(['show']);

        Route::resource('/admin/students', StudentController::class)
            ->names([
                'index' => 'admin.students.index',
                'create' => 'admin.students.create',
                'store' => 'admin.students.store',
                'show' => 'admin.students.show',
                'edit' => 'admin.students.edit',
                'update' => 'admin.students.update',
                'destroy' => 'admin.students.destroy',
            ]);

        Route::resource('/admin/teachers', TeacherController::class)
            ->names([
                'index' => 'admin.teachers.index',
                'create' => 'admin.teachers.create',
                'store' => 'admin.teachers.store',
                'edit' => 'admin.teachers.edit',
                'update' => 'admin.teachers.update',
                'destroy' => 'admin.teachers.destroy',
            ])
            ->except(['show']);

        Route::resource('/admin/subjects', SubjectController::class)
            ->names([
                'index' => 'admin.subjects.index',
                'create' => 'admin.subjects.create',
                'store' => 'admin.subjects.store',
                'edit' => 'admin.subjects.edit',
                'update' => 'admin.subjects.update',
                'destroy' => 'admin.subjects.destroy',
            ])
            ->except(['show']);

        Route::resource('/admin/exams', ExamController::class)
            ->names([
                'index' => 'admin.exams.index',
                'create' => 'admin.exams.create',
                'store' => 'admin.exams.store',
                'edit' => 'admin.exams.edit',
                'update' => 'admin.exams.update',
                'destroy' => 'admin.exams.destroy',
            ])
            ->except(['show']);

        Route::get('/admin/exams/{exam}/marks', [ExamController::class, 'marks'])->name('admin.exams.marks');
        Route::post('/admin/exams/{exam}/marks', [ExamController::class, 'updateMarks']);

        Route::get('/admin/attendance', [AttendanceController::class, 'index'])->name('admin.attendance.index');
        Route::post('/admin/attendance', [AttendanceController::class, 'store'])->name('admin.attendance.store');
    });

    Route::middleware('role:headmaster')->get('/headmaster/dashboard', [DashboardController::class, 'show'])->name('headmaster.dashboard');
    Route::middleware('role:teacher')->get('/teacher/dashboard', [DashboardController::class, 'show'])->name('teacher.dashboard');
    Route::middleware('role:student')->get('/student/dashboard', [DashboardController::class, 'show'])->name('student.dashboard');
    Route::middleware('role:staff')->get('/staff/dashboard', [DashboardController::class, 'show'])->name('staff.dashboard');
});
