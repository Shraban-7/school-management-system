<?php

use App\Http\Controllers\AcademicSessionController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClassesAndSectionController;
use App\Http\Controllers\CommunicationController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExamController;
use App\Http\Controllers\FeeInvoiceController;
use App\Http\Controllers\FeePaymentController;
use App\Http\Controllers\FeeStructureController;
use App\Http\Controllers\LocaleController;
use App\Http\Controllers\NoticeController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ResultController;
use App\Http\Controllers\SchoolProfileController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\SyllabusController;
use App\Http\Controllers\TeacherController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/', function (Request $request) {
    if ($user = $request->user()) {
        return redirect($user->dashboardRoute());
    }

    return redirect()->route('login');
})->name('home');

Route::post('/locale', [LocaleController::class, 'update'])->name('locale.update');

Route::middleware('guest')->group(function (): void {
    Route::get('/login', [AuthController::class, 'create'])->name('login');
    Route::post('/login', [AuthController::class, 'store']);
});

Route::middleware('auth')->group(function (): void {
    Route::post('/logout', [AuthController::class, 'destroy'])->name('logout');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::put('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::put('/profile/password', [ProfileController::class, 'updatePassword'])->name('profile.password');

    // Institutional Notice Board
    Route::get('/notices', [NoticeController::class, 'index'])->name('notices');
    Route::get('/notices/{slug}', [NoticeController::class, 'show'])->name('notices.show');
    Route::get('/notices/{slug}/download', [NoticeController::class, 'downloadNoticeAttachment'])->name('notices.download');

    // Academic Syllabuses
    Route::get('/syllabus', [SyllabusController::class, 'portalIndex'])->name('syllabus');
    Route::get('/syllabus/{syllabus}/download', [SyllabusController::class, 'download'])->name('syllabus.download');

    Route::middleware('role:admin')->group(function (): void {
        Route::get('/admin/dashboard', [DashboardController::class, 'show'])->name('admin.dashboard');
        Route::get('/admin/users', [DashboardController::class, 'users'])->name('admin.users');
        Route::get('/admin/activity', [DashboardController::class, 'activity'])->name('admin.activity');
        Route::get('/admin/settings', [DashboardController::class, 'settings'])->name('admin.settings');
        Route::put('/admin/settings', [SchoolProfileController::class, 'update'])->name('admin.settings.update');
        Route::get('/admin/notifications', [DashboardController::class, 'notifications'])->name('admin.notifications');

        Route::get('/admin/settings/school', [SchoolProfileController::class, 'edit'])->name('admin.settings.school.edit');
        Route::put('/admin/settings/school', [SchoolProfileController::class, 'update'])->name('admin.settings.school.update');
        Route::get('/admin/settings/zkteco', [AttendanceController::class, 'zktecoSettingsPage'])->name('admin.settings.zkteco');

        // Communication (SMS & Custom Email Broadcast, Templates, Settings)
        Route::get('/admin/communication/messages', [CommunicationController::class, 'index'])->name('admin.communication.index');
        Route::post('/admin/communication/messages/send', [CommunicationController::class, 'send'])->name('admin.communication.send');
        Route::post('/admin/communication/templates', [CommunicationController::class, 'storeTemplate'])->name('admin.communication.templates.store');
        Route::put('/admin/communication/templates/{template}', [CommunicationController::class, 'updateTemplate'])->name('admin.communication.templates.update');
        Route::delete('/admin/communication/templates/{template}', [CommunicationController::class, 'destroyTemplate'])->name('admin.communication.templates.destroy');
        Route::put('/admin/communication/settings', [CommunicationController::class, 'updateSettings'])->name('admin.communication.settings.update');

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

        Route::get('/admin/results', [ResultController::class, 'index'])->name('admin.results.index');
        Route::get('/admin/results/{exam}', [ResultController::class, 'show'])->name('admin.results.show');
        Route::get('/admin/results/{exam}/students/{student}', [ResultController::class, 'reportCard'])->name('admin.results.report-card');
        Route::get('/admin/results/{exam}/students/{student}/pdf', [ResultController::class, 'reportCardPdf'])->name('admin.results.report-card.pdf');

        Route::get('/admin/attendance', [AttendanceController::class, 'index'])->name('admin.attendance.index');
        Route::post('/admin/attendance', [AttendanceController::class, 'store'])->name('admin.attendance.store');
        Route::post('/admin/attendance/zkteco/settings', [AttendanceController::class, 'saveZktecoSettings'])->name('admin.attendance.zkteco.settings');
        Route::post('/admin/attendance/zkteco/test', [AttendanceController::class, 'testZktecoConnection'])->name('admin.attendance.zkteco.test');
        Route::post('/admin/attendance/zkteco/sync', [AttendanceController::class, 'syncZktecoAttendance'])->name('admin.attendance.zkteco.sync');
        Route::post('/admin/attendance/zkteco/import', [AttendanceController::class, 'importZktecoFile'])->name('admin.attendance.zkteco.import');

        Route::resource('/admin/fees/structures', FeeStructureController::class)
            ->names([
                'index' => 'admin.fees.structures.index',
                'create' => 'admin.fees.structures.create',
                'store' => 'admin.fees.structures.store',
                'edit' => 'admin.fees.structures.edit',
                'update' => 'admin.fees.structures.update',
                'destroy' => 'admin.fees.structures.destroy',
            ])
            ->except(['show'])
            ->parameters(['structures' => 'structure']);

        Route::get('/admin/fees/invoices', [FeeInvoiceController::class, 'index'])->name('admin.fees.invoices.index');
        Route::post('/admin/fees/invoices/generate', [FeeInvoiceController::class, 'generate'])->name('admin.fees.invoices.generate');
        Route::post('/admin/fees/payments', [FeePaymentController::class, 'store'])->name('admin.fees.payments.store');

        Route::get('/admin/posts/{type}', [PostController::class, 'index'])->name('admin.posts.index');
        Route::get('/admin/posts/{type}/create', [PostController::class, 'create'])->name('admin.posts.create');
        Route::post('/admin/posts/{type}', [PostController::class, 'store'])->name('admin.posts.store');
        Route::get('/admin/posts/{type}/{post}/edit', [PostController::class, 'edit'])->name('admin.posts.edit');
        Route::put('/admin/posts/{type}/{post}', [PostController::class, 'update'])->name('admin.posts.update');
        Route::delete('/admin/posts/{type}/{post}', [PostController::class, 'destroy'])->name('admin.posts.destroy');

        Route::resource('/admin/syllabus', SyllabusController::class)
            ->names([
                'index' => 'admin.syllabus.index',
                'create' => 'admin.syllabus.create',
                'store' => 'admin.syllabus.store',
                'edit' => 'admin.syllabus.edit',
                'update' => 'admin.syllabus.update',
                'destroy' => 'admin.syllabus.destroy',
            ])
            ->except(['show'])
            ->parameters(['syllabus' => 'syllabus']);
    });

    Route::middleware('role:headmaster')->get('/headmaster/dashboard', [DashboardController::class, 'show'])->name('headmaster.dashboard');
    Route::middleware('role:teacher')->get('/teacher/dashboard', [DashboardController::class, 'show'])->name('teacher.dashboard');
    Route::middleware('role:staff')->get('/staff/dashboard', [DashboardController::class, 'show'])->name('staff.dashboard');

    Route::middleware('role:student')->group(function (): void {
        Route::get('/student/dashboard', [DashboardController::class, 'show'])->name('student.dashboard');
        Route::get('/student/results', [ResultController::class, 'studentIndex'])->name('student.results.index');
        Route::get('/student/results/{exam}', [ResultController::class, 'studentShow'])->name('student.results.show');
        Route::get('/student/results/{exam}/pdf', [ResultController::class, 'studentPdf'])->name('student.results.pdf');
    });

    Route::middleware('role:parent')->group(function (): void {
        Route::get('/parent/dashboard', [DashboardController::class, 'show'])->name('parent.dashboard');
        Route::get('/parent/results', [ResultController::class, 'parentIndex'])->name('parent.results.index');
        Route::get('/parent/children/{student}/results', [ResultController::class, 'parentChildIndex'])->name('parent.results.child');
        Route::get('/parent/children/{student}/results/{exam}', [ResultController::class, 'parentShow'])->name('parent.results.show');
        Route::get('/parent/children/{student}/results/{exam}/pdf', [ResultController::class, 'parentPdf'])->name('parent.results.pdf');
        Route::get('/parent/fees', [FeeInvoiceController::class, 'parentIndex'])->name('parent.fees.index');
        Route::get('/parent/children/{student}/fees', [FeeInvoiceController::class, 'parentChild'])->name('parent.fees.child');
    });
});

Route::any('/iclock/cdata', [AttendanceController::class, 'admsWebhook'])->name('attendance.zkteco.adms');

