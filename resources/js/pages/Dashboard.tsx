import React, { useEffect, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import DashboardShell from '@/components/DashboardShell';
import AppIcon from '@/components/AppIcon';
import AppLogo from '@/components/AppLogo';
import KpiCard from '@/components/KpiCard';
import { useSidebarStack } from '@/composables/useNavStack';
import { useI18n } from '@/composables/useI18n';
import type { SidebarConfig } from '@/types/sidebar';
import type {
    Stat,
    StatCard,
    StatStatus,
    AttendanceSummary,
    FinanceSummary,
    UpcomingExamItem,
    NoticeItem,
    ZktecoSummary,
    CommunicationSummary,
    SchoolInfo,
} from '@/types/dashboard';

interface DashboardProps {
    role: string;
    title: string;
    subtitle: string;
    stats: Stat[];
    cards: StatCard[];
    sidebar: SidebarConfig;
    notificationCount?: number;
    attendanceSummary?: AttendanceSummary;
    financeSummary?: FinanceSummary;
    upcomingExams?: UpcomingExamItem[];
    recentNotices?: NoticeItem[];
    zktecoSummary?: ZktecoSummary;
    communicationSummary?: CommunicationSummary;
    schoolInfo?: SchoolInfo;
    recentActivity?: Array<{
        actor: string;
        action: string;
        target: string;
        time: string;
    }>;
}

export default function Dashboard({
    role,
    title,
    subtitle,
    stats,
    cards,
    sidebar,
    notificationCount,
    attendanceSummary,
    financeSummary,
    upcomingExams,
    recentNotices,
    zktecoSummary,
    communicationSummary,
    schoolInfo,
    recentActivity,
}: DashboardProps) {
    const sidebarStack = useSidebarStack();
    const { t, bi, isBangla, formatNumber } = useI18n();

    useEffect(() => {
        if (sidebar) {
            sidebarStack.set(sidebar);
        }
    }, [sidebar]);

    const schoolName =
        bi(schoolInfo?.name, schoolInfo?.name_bn) ||
        schoolInfo?.name ||
        (isBangla ? 'বিদ্যালয় ব্যবস্থাপনা সিস্টেম' : 'School Management System');

    const todayDateFormatted = useMemo(() => {
        return new Intl.DateTimeFormat(isBangla ? 'bn-BD' : 'en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        }).format(new Date());
    }, [isBangla]);

    function localizeStatLabel(label: string): string {
        const map: Record<string, string> = {
            'Total students': t('dashboard.kpi_students', {}, 'Total Students'),
            'Teaching staff': t('dashboard.kpi_teachers', {}, 'Teaching Staff'),
            'Attendance today': t('dashboard.kpi_attendance', {}, 'Attendance Today'),
            'Classes & Sections': t('dashboard.kpi_classes', {}, 'Classes & Sections'),
        };
        return map[label] || label;
    }

    const statusDot = (status: StatStatus): string =>
        status === 'ok' || status === 'good'
            ? 'bg-emerald-500'
            : status === 'warn'
              ? 'bg-amber-500'
              : status === 'bad' || status === 'down'
                ? 'bg-rose-500'
                : 'bg-slate-400';

    const statusBadge = (status: StatStatus): string =>
        status === 'ok' || status === 'good'
            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/50'
            : status === 'warn'
              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/50'
              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/50';

    // Role-specific quick action buttons
    const quickActions = useMemo(() => {
        if (role === 'admin' || role === 'headmaster') {
            return [
                {
                    label: t('dashboard.take_attendance', {}, 'Take Attendance'),
                    desc: t('dashboard.take_attendance_desc', {}, 'Daily student roll call'),
                    href: '/admin/attendance',
                    icon: 'check-circle',
                    color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400',
                },
                {
                    label: t('dashboard.enroll_student', {}, 'Enroll Student'),
                    desc: t('dashboard.enroll_student_desc', {}, 'Register new admission'),
                    href: '/admin/students/create',
                    icon: 'graduation-cap',
                    color: 'text-accent-600 bg-accent-50 dark:bg-accent-950/50 dark:text-accent-400',
                },
                {
                    label: t('dashboard.faculty_staff', {}, 'Faculty & Staff'),
                    desc: t('dashboard.faculty_staff_desc', {}, 'Manage teaching directory'),
                    href: '/admin/teachers',
                    icon: 'briefcase',
                    color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 dark:text-indigo-400',
                },
                {
                    label: t('dashboard.exams_marks', {}, 'Exams & Marks'),
                    desc: t('dashboard.exams_marks_desc', {}, 'Gradebook & results'),
                    href: '/admin/exams',
                    icon: 'award',
                    color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-400',
                },
                {
                    label: t('dashboard.fee_invoices', {}, 'Fee Invoices'),
                    desc: t('dashboard.fee_invoices_desc', {}, 'Collect & track tuition'),
                    href: '/admin/fees/invoices',
                    icon: 'credit-card',
                    color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/50 dark:text-teal-400',
                },
                {
                    label: t('dashboard.send_sms_mail', {}, 'Send SMS & Mail'),
                    desc: t('dashboard.send_sms_mail_desc', {}, 'Parent broadcasts'),
                    href: '/admin/communication/messages',
                    icon: 'send',
                    color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/50 dark:text-sky-400',
                },
                {
                    label: t('dashboard.biometric_sync', {}, 'Biometric Sync'),
                    desc: t('dashboard.biometric_sync_desc', {}, 'ZKTeco device fleet'),
                    href: '/admin/settings/zkteco',
                    icon: 'server',
                    color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/50 dark:text-purple-400',
                },
                {
                    label: t('dashboard.notice_board', {}, 'Notice Board'),
                    desc: t('dashboard.notice_board_desc', {}, 'Publish circulars'),
                    href: '/notices',
                    icon: 'megaphone',
                    color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/50 dark:text-rose-400',
                },
            ];
        }

        if (role === 'teacher') {
            return [
                {
                    label: t('dashboard.enter_marks', {}, 'Mark Attendance'),
                    desc: t('dashboard.take_attendance_desc', {}, 'Record section attendance'),
                    href: '/admin/attendance',
                    icon: 'check-circle',
                    color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400',
                },
                {
                    label: t('dashboard.enter_marks', {}, 'Enter Exam Marks'),
                    desc: t('dashboard.enter_marks_desc', {}, 'Input student marks'),
                    href: '/admin/exams',
                    icon: 'pencil',
                    color: 'text-accent-600 bg-accent-50 dark:bg-accent-950/50 dark:text-accent-400',
                },
                {
                    label: t('dashboard.classes_rosters', {}, 'Classes & Sections'),
                    desc: t('dashboard.classes_rosters_desc', {}, 'View rosters & schedules'),
                    href: '/admin/classes-and-sections',
                    icon: 'book-open',
                    color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 dark:text-indigo-400',
                },
                {
                    label: t('dashboard.syllabus_materials', {}, 'Syllabus & Materials'),
                    desc: t('dashboard.syllabus_materials_desc', {}, 'Academic guides'),
                    href: '/admin/syllabus',
                    icon: 'file-text',
                    color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-400',
                },
            ];
        }

        if (role === 'student' || role === 'parent') {
            return [
                {
                    label: t('dashboard.academic_results', {}, 'Academic Results'),
                    desc: t('dashboard.academic_results_desc', {}, 'Exam report cards & GPA'),
                    href: role === 'parent' ? '/parent/dashboard' : '/student/dashboard',
                    icon: 'award',
                    color: 'text-accent-600 bg-accent-50 dark:bg-accent-950/50 dark:text-accent-400',
                },
                {
                    label: t('dashboard.school_notices', {}, 'School Notices'),
                    desc: t('dashboard.school_notices_desc', {}, 'Circulars & announcements'),
                    href: '/notices',
                    icon: 'megaphone',
                    color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/50 dark:text-sky-400',
                },
                {
                    label: t('dashboard.fee_summary', {}, 'Fee Summary'),
                    desc: t('dashboard.fee_summary_desc', {}, 'Tuition balances & payments'),
                    href: '/parent/fees',
                    icon: 'credit-card',
                    color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400',
                },
                {
                    label: t('dashboard.syllabus_download', {}, 'Syllabus Download'),
                    desc: t('dashboard.syllabus_download_desc', {}, 'Curriculum outlines'),
                    href: '/syllabus',
                    icon: 'download',
                    color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/50 dark:text-purple-400',
                },
            ];
        }

        return [
            {
                label: t('dashboard.attendance_sheet', {}, 'Attendance Sheet'),
                desc: t('dashboard.attendance_sheet_desc', {}, 'Daily attendance'),
                href: '/admin/attendance',
                icon: 'check-circle',
                color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400',
            },
            {
                label: t('dashboard.biometric_hardware', {}, 'Biometric Hardware'),
                desc: t('dashboard.biometric_hardware_desc', {}, 'ZKTeco terminal monitor'),
                href: '/admin/settings/zkteco',
                icon: 'server',
                color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/50 dark:text-purple-400',
            },
            {
                label: t('dashboard.notice_board', {}, 'Notice Board'),
                desc: t('dashboard.notice_board_desc', {}, 'Published notices'),
                href: '/notices',
                icon: 'megaphone',
                color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/50 dark:text-sky-400',
            },
            {
                label: t('dashboard.system_settings', {}, 'System Settings'),
                desc: t('dashboard.system_settings_desc', {}, 'School configuration'),
                href: '/admin/settings',
                icon: 'settings',
                color: 'text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300',
            },
        ];
    }, [role, t]);

    return (
        <DashboardLayout notificationCount={notificationCount}>
            <Head title={`${title} | ${schoolName}`} />

            <DashboardShell
                role={role}
                title={title}
                subtitle={subtitle}
                stats={stats}
            >
                {/* School & Live Time Ribbon */}
                <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 text-white shadow-sm dark:border-slate-800">
                    <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-start gap-4">
                            <AppLogo
                                src={schoolInfo?.logo_url}
                                name={schoolName}
                                size="lg"
                                className="shrink-0"
                            />
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300 backdrop-blur-xs">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        {t('dashboard.active_session')}: {schoolInfo?.session ?? '2026'}
                                    </span>
                                    {schoolInfo?.eiin && (
                                        <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-slate-300">
                                            {t('dashboard.eiin')}: {schoolInfo.eiin}
                                        </span>
                                    )}
                                </div>
                                <h2 className="mt-2 text-xl font-bold tracking-tight text-white md:text-2xl">
                                    {schoolName}
                                </h2>
                                <p className="mt-1 text-xs text-slate-300 md:text-sm">
                                    {t('dashboard.subtitle')}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                            <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-200 backdrop-blur-xs">
                                <AppIcon name="calendar" className="h-4 w-4 text-accent-400" />
                                {todayDateFormatted}
                            </span>
                            {(role === 'admin' || role === 'headmaster') && (
                                <Link
                                    href="/admin/attendance"
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-accent-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-accent-500 active:scale-95"
                                >
                                    <AppIcon name="plus" className="h-4 w-4" />
                                    {t('dashboard.take_attendance')}
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Ambient glow accent */}
                    <div className="pointer-events-none absolute -right-10 -bottom-10 h-48 w-48 rounded-full bg-accent-500/10 blur-3xl" />
                    <div className="pointer-events-none absolute left-1/3 -top-10 h-36 w-36 rounded-full bg-indigo-500/10 blur-2xl" />
                </div>

                {/* KPI Cards Row (Consistent Color & Styling) */}
                {stats && stats.length > 0 && (
                    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {stats.map((stat, i) => (
                            <KpiCard
                                key={stat.label || i}
                                label={localizeStatLabel(stat.label)}
                                value={typeof stat.value === 'number' ? formatNumber(stat.value) : stat.value}
                                icon={stat.icon}
                                trend={stat.trend}
                                trendLabel={stat.trendLabel}
                                href={stat.href}
                            />
                        ))}
                    </section>
                )}

                {/* Main Bento Layout - Balanced 50/50 2-Column Grid */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Left Column (50%) */}
                    <div className="space-y-6">
                        {/* Widget 1: Today's Live Attendance Command Gauge */}
                        {attendanceSummary && (
                            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800/80 dark:bg-slate-900">
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4 dark:border-slate-800">
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                                            <AppIcon name="check-circle" className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                                                {t('dashboard.todays_attendance')}
                                            </h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {attendanceSummary.date_formatted}
                                            </p>
                                        </div>
                                    </div>
                                    <Link
                                        href="/admin/attendance"
                                        className="inline-flex items-center gap-1 text-xs font-semibold text-accent-600 hover:text-accent-700 dark:text-accent-400"
                                    >
                                        {t('dashboard.view_attendance_sheet')}
                                        <AppIcon name="arrow-right" className="h-3 w-3" />
                                    </Link>
                                </div>

                                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                    {/* Overall Attendance Rate */}
                                    <div className="flex flex-col justify-between rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 sm:p-4 dark:border-slate-800/60 dark:bg-slate-800/40">
                                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-slate-400">
                                            {t('dashboard.rate')}
                                        </span>
                                        <div className="mt-2 flex items-baseline gap-1.5">
                                            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
                                                {attendanceSummary.marked_today > 0 ? `${formatNumber(attendanceSummary.rate)}%` : '—'}
                                            </span>
                                        </div>
                                        <div className="mt-3">
                                            <span
                                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                                                    attendanceSummary.marked_today === 0
                                                        ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                                                        : attendanceSummary.rate >= 90
                                                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                                }`}
                                            >
                                                {attendanceSummary.marked_today === 0
                                                    ? t('common.pending')
                                                    : attendanceSummary.rate >= 90
                                                      ? (isBangla ? 'উচ্চ উপস্থিতি' : 'High Turnout')
                                                      : (isBangla ? 'সন্তোষজনক' : 'Moderate Turnout')}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Present Card */}
                                    <div className="flex flex-col justify-between rounded-xl border border-emerald-100/80 bg-emerald-50/40 p-3.5 sm:p-4 dark:border-emerald-950/50 dark:bg-emerald-950/20">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider dark:text-emerald-300">
                                                {t('dashboard.present_students')}
                                            </span>
                                            <AppIcon name="check" className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <p className="mt-2 text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                                            {formatNumber(attendanceSummary.present)}
                                        </p>
                                        <span className="mt-2 text-xs text-emerald-600/80 dark:text-emerald-400/80">
                                            Marked present
                                        </span>
                                    </div>

                                    {/* Absent Card */}
                                    <div className="flex flex-col justify-between rounded-xl border border-rose-100/80 bg-rose-50/40 p-3.5 sm:p-4 dark:border-rose-950/50 dark:bg-rose-950/20">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider dark:text-rose-300">
                                                {t('dashboard.absent_students')}
                                            </span>
                                            <AppIcon name="close" className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                                        </div>
                                        <p className="mt-2 text-2xl font-bold text-rose-700 dark:text-rose-300">
                                            {formatNumber(attendanceSummary.absent)}
                                        </p>
                                        <span className="mt-2 text-xs text-rose-600/80 dark:text-rose-400/80">
                                            {isBangla ? 'অনুপস্থিতি বার্তা প্রেরিত' : 'Unexcused / notified'}
                                        </span>
                                    </div>

                                    {/* Late Card */}
                                    <div className="flex flex-col justify-between rounded-xl border border-amber-100/80 bg-amber-50/40 p-3.5 sm:p-4 dark:border-amber-950/50 dark:bg-amber-950/20">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider dark:text-amber-300">
                                                {t('dashboard.late_students')}
                                            </span>
                                            <AppIcon name="clock" className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                        </div>
                                        <p className="mt-2 text-2xl font-bold text-amber-700 dark:text-amber-300">
                                            {formatNumber(attendanceSummary.late)}
                                        </p>
                                        <span className="mt-2 text-xs text-amber-600/80 dark:text-amber-400/80">
                                            {isBangla ? 'দেরিতে আগমন' : 'Delayed arrival'}
                                        </span>
                                    </div>
                                </div>

                                {/* Stacked Progress Bar */}
                                {attendanceSummary.marked_today > 0 ? (
                                    <div className="mt-5 space-y-2">
                                        <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                                            <span>
                                                {isBangla
                                                    ? `মোট ${formatNumber(attendanceSummary.total_students)} জনের মধ্যে ${formatNumber(attendanceSummary.marked_today)} জন নিবন্ধিত`
                                                    : `Recorded ${attendanceSummary.marked_today} of ${attendanceSummary.total_students} enrolled students`}
                                            </span>
                                            <span className="font-semibold text-slate-900 dark:text-slate-100">
                                                {formatNumber(attendanceSummary.present)} {t('dashboard.present_students')} / {formatNumber(attendanceSummary.absent)} {t('dashboard.absent_students')}
                                            </span>
                                        </div>
                                        <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                            <div
                                                className="bg-emerald-500 transition-all duration-500"
                                                style={{
                                                    width: `${(attendanceSummary.present / attendanceSummary.marked_today) * 100}%`,
                                                }}
                                                title={`Present: ${attendanceSummary.present}`}
                                            />
                                            <div
                                                className="bg-amber-500 transition-all duration-500"
                                                style={{
                                                    width: `${(attendanceSummary.late / attendanceSummary.marked_today) * 100}%`,
                                                }}
                                                title={`Late: ${attendanceSummary.late}`}
                                            />
                                            <div
                                                className="bg-rose-500 transition-all duration-500"
                                                style={{
                                                    width: `${(attendanceSummary.absent / attendanceSummary.marked_today) * 100}%`,
                                                }}
                                                title={`Absent: ${attendanceSummary.absent}`}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-3.5 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-800/30 dark:text-slate-400">
                                        <div className="flex items-center gap-2">
                                            <AppIcon name="clock" className="h-4 w-4 text-amber-500" />
                                            <span>{t('dashboard.attendance_pending_note')}</span>
                                        </div>
                                        <Link
                                            href="/admin/attendance"
                                            className="font-semibold text-accent-600 hover:underline dark:text-accent-400"
                                        >
                                            {t('dashboard.take_attendance')} →
                                        </Link>
                                    </div>
                                )}
                            </section>
                        )}

                        {/* Widget 2: Fee Collections & Financial Health */}
                        {financeSummary && (
                            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800/80 dark:bg-slate-900">
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4 dark:border-slate-800">
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400">
                                            <AppIcon name="credit-card" className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                                                {t('dashboard.financial_overview')}
                                            </h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {t('dashboard.tuition_fee_collection')}
                                            </p>
                                        </div>
                                    </div>
                                    <Link
                                        href="/admin/fees/invoices"
                                        className="inline-flex items-center gap-1 text-xs font-semibold text-accent-600 hover:text-accent-700 dark:text-accent-400"
                                    >
                                        {t('dashboard.manage_fee_invoices')}
                                        <AppIcon name="arrow-right" className="h-3 w-3" />
                                    </Link>
                                </div>

                                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                                    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 sm:p-4 dark:border-slate-800/60 dark:bg-slate-800/40">
                                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-slate-400">
                                            {t('dashboard.total_billed')}
                                        </span>
                                        <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-50">
                                            {financeSummary.currency}
                                            {formatNumber(financeSummary.total_invoiced.toLocaleString(undefined, {
                                                minimumFractionDigits: 0,
                                            }))}
                                        </p>
                                        <span className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                            {isBangla ? 'সর্বমোট ধার্যকৃত ফি' : 'Cumulative fees'}
                                        </span>
                                    </div>

                                    <div className="rounded-xl border border-emerald-100/80 bg-emerald-50/30 p-3.5 sm:p-4 dark:border-emerald-950/40 dark:bg-emerald-950/20">
                                        <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider dark:text-emerald-300">
                                            {t('dashboard.collected')}
                                        </span>
                                        <p className="mt-2 text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                                            {financeSummary.currency}
                                            {formatNumber(financeSummary.total_collected.toLocaleString(undefined, {
                                                minimumFractionDigits: 0,
                                            }))}
                                        </p>
                                        <div className="mt-1 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                            <span>{formatNumber(financeSummary.collection_rate)}% {t('dashboard.collected').toLowerCase()}</span>
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-amber-100/80 bg-amber-50/30 p-3.5 sm:p-4 dark:border-amber-950/40 dark:bg-amber-950/20">
                                        <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider dark:text-amber-300">
                                            {t('dashboard.pending_dues')}
                                        </span>
                                        <p className="mt-2 text-2xl font-bold text-amber-700 dark:text-amber-300">
                                            {financeSummary.currency}
                                            {formatNumber(financeSummary.total_due.toLocaleString(undefined, {
                                                minimumFractionDigits: 0,
                                            }))}
                                        </p>
                                        <span className="mt-1 text-xs text-amber-600/80 dark:text-amber-400/80">
                                            {isBangla ? 'বকেয়া আদায় প্রক্রিয়াধীন' : 'Pending settlement'}
                                        </span>
                                    </div>
                                </div>

                                {/* Collection Progress bar */}
                                <div className="mt-4 space-y-1.5">
                                    <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                                        <span>Collection Efficiency</span>
                                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                                            {financeSummary.collection_rate}%
                                        </span>
                                    </div>
                                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                        <div
                                            className="h-full rounded-full bg-teal-500 transition-all duration-500"
                                            style={{ width: `${Math.min(100, financeSummary.collection_rate)}%` }}
                                        />
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Widget 3: Recent Notices & Circulars */}
                        {recentNotices && recentNotices.length > 0 && (
                            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800/80 dark:bg-slate-900">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 dark:border-slate-800">
                                    <div className="flex items-center gap-2">
                                        <AppIcon name="megaphone" className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                                            {t('dashboard.institutional_notices')}
                                        </h3>
                                    </div>
                                    <Link
                                        href="/notices"
                                        className="text-xs font-semibold text-accent-600 hover:text-accent-700 dark:text-accent-400"
                                    >
                                        {t('dashboard.view_notice_board')}
                                    </Link>
                                </div>

                                <div className="mt-3.5 space-y-3">
                                    {recentNotices.map((notice) => (
                                        <Link
                                            key={notice.id}
                                            href={`/notices/${notice.slug}`}
                                            className="group block rounded-xl border border-slate-100 p-3 transition hover:border-accent-300 hover:bg-accent-50/20 dark:border-slate-800 dark:hover:border-accent-700"
                                        >
                                            <p className="line-clamp-2 text-xs font-semibold text-slate-900 group-hover:text-accent-600 dark:text-slate-100 dark:group-hover:text-accent-400">
                                                {notice.title}
                                            </p>
                                            <p className="mt-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                                                <span>{notice.date}</span>
                                                <span className="font-medium text-slate-400">{notice.time}</span>
                                            </p>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Widget 4: Recent Activity Log Timeline */}
                        {recentActivity && recentActivity.length > 0 && (
                            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800/80 dark:bg-slate-900">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 dark:border-slate-800">
                                    <div className="flex items-center gap-2">
                                        <AppIcon name="activity" className="h-4 w-4 text-accent-600 dark:text-accent-400" />
                                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                                            {t('dashboard.system_activity')}
                                        </h3>
                                    </div>
                                    <Link
                                        href="/admin/activity"
                                        className="text-xs font-semibold text-accent-600 hover:text-accent-700 dark:text-accent-400"
                                    >
                                        {t('dashboard.view_all_audit')}
                                    </Link>
                                </div>
                                <ol className="mt-4 space-y-3.5">
                                    {recentActivity.map((item, i) => (
                                        <li
                                            key={i}
                                            className="flex items-start gap-3 text-xs"
                                        >
                                            <span className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full bg-accent-500 ring-4 ring-accent-500/10" />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-slate-800 dark:text-slate-200">
                                                    <span className="font-bold text-slate-900 dark:text-slate-100">
                                                        {item.actor}
                                                    </span>{' '}
                                                    {item.action}{' '}
                                                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                                                        {item.target}
                                                    </span>
                                                </p>
                                                <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                                                    {item.time}
                                                </p>
                                            </div>
                                        </li>
                                    ))}
                                </ol>
                            </section>
                        )}

                        {/* Standard Cards from backend props (Preserves Parent's Children list, Result summaries, etc.) */}
                        {cards.map((card, i) => (
                            <section
                                key={card.title ?? `card-${i}`}
                                className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800/80 dark:bg-slate-900"
                            >
                                {card.title && (
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                                            {card.title}
                                        </h3>
                                        <span className="text-xs font-medium text-slate-400">
                                            {card.items.length} {card.items.length === 1 ? 'item' : 'items'}
                                        </span>
                                    </div>
                                )}
                                <ul
                                    className={`divide-y divide-slate-100 dark:divide-slate-800/60 ${
                                        card.title ? 'mt-2' : ''
                                    }`}
                                >
                                    {card.items.map((item) => (
                                        <li
                                            key={item.label}
                                            className="flex items-center justify-between py-3 text-sm"
                                        >
                                            <span className="font-medium text-slate-700 dark:text-slate-300">
                                                {item.label}
                                            </span>
                                            {item.status ? (
                                                <span
                                                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadge(
                                                        item.status,
                                                    )}`}
                                                >
                                                    <span
                                                        className={`h-1.5 w-1.5 rounded-full ${statusDot(
                                                            item.status,
                                                        )}`}
                                                    />
                                                    {item.value}
                                                </span>
                                            ) : (
                                                <span className="font-semibold text-slate-900 dark:text-slate-100">
                                                    {item.value}
                                                </span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        ))}
                    </div>

                    {/* Right Column (50%) */}
                    <div className="space-y-6">
                        {/* Widget 5: Quick Action Command Center */}
                        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800/80 dark:bg-slate-900">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 dark:border-slate-800">
                                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                                    {t('dashboard.quick_actions', undefined, 'Quick Actions')}
                                </h3>
                                <span className="rounded-full bg-accent-50 px-2 py-0.5 text-xs font-semibold text-accent-700 dark:bg-accent-950/50 dark:text-accent-300">
                                    {isBangla ? 'শর্টকাট' : 'Shortcuts'}
                                </span>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-2.5">
                                {quickActions.map((action) => (
                                    <Link
                                        key={action.label}
                                        href={action.href}
                                        className="group relative flex flex-col justify-between rounded-xl border border-slate-200/80 p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent-300 hover:bg-slate-50/60 hover:shadow-xs dark:border-slate-800 dark:hover:border-accent-700 dark:hover:bg-slate-800/50"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span
                                                className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${action.color} transition-transform group-hover:scale-105`}
                                            >
                                                <AppIcon name={action.icon} className="h-4 w-4" />
                                            </span>
                                            <AppIcon
                                                name="arrow-right"
                                                className="h-3 w-3 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100"
                                            />
                                        </div>
                                        <div className="mt-2.5">
                                            <span className="block text-xs font-bold text-slate-900 dark:text-slate-100">
                                                {action.label}
                                            </span>
                                            <span className="mt-0.5 block text-[11px] text-slate-500 truncate dark:text-slate-400">
                                                {action.desc}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>

                        {/* Widget 6: Examinations Schedule & Marks Entry */}
                        {upcomingExams && (
                            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800/80 dark:bg-slate-900">
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4 dark:border-slate-800">
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                                            <AppIcon name="award" className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                                                {t('dashboard.upcoming_exams', undefined, 'Examinations & Terms')}
                                            </h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {isBangla ? 'পরীক্ষার সময়সূচি ও নম্বর ব্যবস্থাপনা' : 'Schedule, ongoing exams, and marks management'}
                                            </p>
                                        </div>
                                    </div>
                                    <Link
                                        href="/admin/exams"
                                        className="inline-flex items-center gap-1 text-xs font-semibold text-accent-600 hover:text-accent-700 dark:text-accent-400"
                                    >
                                        {t('dashboard.view_exam_schedules', undefined, 'View All Exams')}
                                        <AppIcon name="arrow-right" className="h-3 w-3" />
                                    </Link>
                                </div>

                                {upcomingExams.length > 0 ? (
                                    <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800/60">
                                        {upcomingExams.map((exam) => (
                                            <div
                                                key={exam.id}
                                                className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:justify-between"
                                            >
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                                                                exam.status === 'Ongoing'
                                                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                                                                    : exam.status === 'Upcoming'
                                                                      ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300'
                                                                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                                                            }`}
                                                        >
                                                            {exam.status === 'Ongoing' && (
                                                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                            )}
                                                            {exam.status === 'Ongoing' ? (isBangla ? 'চলমান' : 'Ongoing') : exam.status === 'Upcoming' ? (isBangla ? 'আসন্ন' : 'Upcoming') : exam.status}
                                                        </span>
                                                        <span className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                                                            {exam.name}
                                                        </span>
                                                    </div>
                                                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                                        <span>{isBangla ? 'সেশন: ' : 'Session: '}{exam.session}</span>
                                                        {exam.start_date && (
                                                            <>
                                                                <span>•</span>
                                                                <span>
                                                                    {exam.start_date}
                                                                    {exam.end_date ? ` ${isBangla ? 'থেকে' : 'to'} ${exam.end_date}` : ''}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 shrink-0">
                                                    {(role === 'admin' || role === 'teacher' || role === 'headmaster') && (
                                                        <Link
                                                            href={`/admin/exams/${exam.id}/marks`}
                                                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-accent-400 hover:bg-accent-50/50 hover:text-accent-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-accent-600 dark:hover:bg-accent-950/30"
                                                        >
                                                            <AppIcon name="pencil" className="h-3.5 w-3.5" />
                                                            {t('dashboard.enter_marks', undefined, 'Marks Entry')}
                                                        </Link>
                                                    )}
                                                    <Link
                                                        href={`/admin/results/${exam.id}`}
                                                        className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                                                    >
                                                        {t('exams.tabulation', undefined, 'Tabulation')}
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="mt-4 rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
                                        <AppIcon name="award" className="mx-auto h-8 w-8 text-slate-400" />
                                        <p className="mt-2 font-medium text-slate-700 dark:text-slate-300">
                                            {isBangla ? 'কোনো পরীক্ষা প্রকাশিত হয়নি' : 'No examinations published yet'}
                                        </p>
                                        <p className="text-xs">{isBangla ? 'আপনার প্রথম প্রান্তিক বা অর্ধবার্ষিক পরীক্ষা নির্ধারণ করুন।' : 'Schedule your first terminal or midterm exam.'}</p>
                                    </div>
                                )}
                            </section>
                        )}

                        {/* Widget 7: Biometric Attendance Fleet (ZKTeco) */}
                        {zktecoSummary && (role === 'admin' || role === 'headmaster' || role === 'staff') && (
                            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800/80 dark:bg-slate-900">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 dark:border-slate-800">
                                    <div className="flex items-center gap-2">
                                        <AppIcon name="server" className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                                            {isBangla ? 'বায়োমেট্রিক ডিভাইস (ZKTeco)' : 'ZKTeco Fleet'}
                                        </h3>
                                    </div>
                                    <Link
                                        href="/admin/settings/zkteco"
                                        className="text-xs font-semibold text-accent-600 hover:text-accent-700 dark:text-accent-400"
                                    >
                                        {t('sidebar.settings', undefined, 'Settings')}
                                    </Link>
                                </div>

                                <div className="mt-3.5 flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs dark:bg-slate-800/50">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`h-2.5 w-2.5 rounded-full ${
                                                zktecoSummary.online > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                                            }`}
                                        />
                                        <span className="font-medium text-slate-700 dark:text-slate-300">
                                            {isBangla 
                                                ? `${formatNumber(zktecoSummary.online)} / ${formatNumber(zktecoSummary.total)} টার্মিনাল সচল` 
                                                : `${zktecoSummary.online} of ${zktecoSummary.total} Terminals Online`}
                                        </span>
                                    </div>
                                    <Link
                                        href="/admin/settings/zkteco"
                                        className="font-medium text-purple-600 hover:underline dark:text-purple-400"
                                    >
                                        {t('attendance.sync_now', undefined, 'Sync Now')}
                                    </Link>
                                </div>

                                {zktecoSummary.devices.length > 0 ? (
                                    <div className="mt-3 space-y-2">
                                        {zktecoSummary.devices.map((device) => (
                                            <div
                                                key={device.id}
                                                className="flex items-center justify-between rounded-lg border border-slate-100 p-2.5 text-xs dark:border-slate-800"
                                            >
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-slate-900 truncate dark:text-slate-100">
                                                        {device.device_name}
                                                    </p>
                                                    <p className="text-[11px] text-slate-500 font-mono">
                                                        {device.ip_address}:{device.port}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    <span
                                                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                                            device.status === 'online'
                                                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                                        }`}
                                                    >
                                                        {device.status === 'online' ? (isBangla ? 'অনলাইন' : 'Online') : (isBangla ? 'অফলাইন' : 'Offline')}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="mt-3 rounded-lg border border-dashed border-slate-200 p-3 text-center text-xs text-slate-500 dark:border-slate-800">
                                        {isBangla ? 'এখনো কোনো বায়োমেট্রিক ডিভাইস যুক্ত করা হয়নি।' : 'No biometric devices configured yet.'}{' '}
                                        <Link
                                            href="/admin/settings/zkteco"
                                            className="font-semibold text-accent-600 hover:underline dark:text-accent-400"
                                        >
                                            {isBangla ? 'ডিভাইস যোগ করুন' : 'Add Device'}
                                        </Link>
                                    </div>
                                )}
                            </section>
                        )}

                        {/* Widget 8: Communication Broadcast Stats */}
                        {communicationSummary && (role === 'admin' || role === 'headmaster') && (
                            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800/80 dark:bg-slate-900">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 dark:border-slate-800">
                                    <div className="flex items-center gap-2">
                                        <AppIcon name="send" className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                                            {t('communication.title', undefined, 'Communication')}
                                        </h3>
                                    </div>
                                    <Link
                                        href="/admin/communication/messages"
                                        className="text-xs font-semibold text-accent-600 hover:text-accent-700 dark:text-accent-400"
                                    >
                                        {isBangla ? 'বার্তা সম্প্রচার' : 'Broadcast'}
                                    </Link>
                                </div>

                                <div className="mt-3.5 grid grid-cols-2 gap-2 text-center">
                                    <div className="rounded-xl border border-sky-100 bg-sky-50/50 p-3 dark:border-sky-950/40 dark:bg-sky-950/20">
                                        <span className="text-xs font-medium text-sky-700 dark:text-sky-300">
                                            {isBangla ? 'প্রেরিত এসএমএস' : 'SMS Sent'}
                                        </span>
                                        <p className="mt-1 text-xl font-bold text-sky-800 dark:text-sky-200">
                                            {formatNumber(communicationSummary.sms_sent)}
                                        </p>
                                    </div>
                                    <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 dark:border-indigo-950/40 dark:bg-indigo-950/20">
                                        <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">
                                            {isBangla ? 'প্রেরিত ইমেইল' : 'Emails Sent'}
                                        </span>
                                        <p className="mt-1 text-xl font-bold text-indigo-800 dark:text-indigo-200">
                                            {formatNumber(communicationSummary.email_sent)}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-3">
                                    <Link
                                        href="/admin/communication/messages"
                                        className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-sky-50 py-2 text-xs font-semibold text-sky-700 transition hover:bg-sky-100 dark:bg-sky-950/40 dark:text-sky-300 dark:hover:bg-sky-950/60"
                                    >
                                        <AppIcon name="mail" className="h-3.5 w-3.5" />
                                        {t('communication.send_message', undefined, 'Send Message Broadcast')}
                                    </Link>
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </DashboardShell>
        </DashboardLayout>
    );
}
