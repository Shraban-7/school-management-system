import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import AppIcon from '@/components/AppIcon';
import ZktecoModal, { type ZktecoConfig, type ZktecoTestResult } from '@/components/attendance/ZktecoModal';
import { useSidebarStack } from '@/composables/useNavStack';
import type { SidebarConfig } from '@/types/sidebar';

interface AttendanceRow {
    id: number;
    student_id?: number;
    student_name?: string;
    name_en?: string;
    name_bn?: string | null;
    roll_number: string | null;
    biometric_id?: string | null;
    class_id?: number;
    status: string | null;
    remarks: string | null;
}

interface Props {
    date: string;
    class_id?: number | null;
    classes: { id: number; label: string }[];
    attendance: AttendanceRow[];
    zkteco?: ZktecoConfig;
    zkteco_test_result?: ZktecoTestResult | null;
    sidebar: SidebarConfig;
}

function getStudentId(row: AttendanceRow): number {
    return row.student_id ?? row.id;
}

function getStudentName(row: AttendanceRow): string {
    return row.student_name || row.name_en || row.name_bn || `Student #${row.roll_number ?? row.id}`;
}

function formatDateDisplay(dateStr: string): {
    formatted: string;
    isToday: boolean;
    isYesterday: boolean;
    dayName: string;
} {
    if (!dateStr) return { formatted: '', isToday: false, isYesterday: false, dayName: '' };
    try {
        const [y, m, d] = dateStr.split('-').map(Number);
        const target = new Date(y, m - 1, d);

        const now = new Date();
        const pad = (n: number) => String(n).padStart(2, '0');
        const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = `${yesterday.getFullYear()}-${pad(yesterday.getMonth() + 1)}-${pad(yesterday.getDate())}`;

        const isToday = dateStr === todayStr;
        const isYesterday = dateStr === yesterdayStr;

        const options: Intl.DateTimeFormatOptions = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        };
        const formatted = target.toLocaleDateString('en-US', options);
        const dayName = target.toLocaleDateString('en-US', { weekday: 'short' });

        return { formatted, isToday, isYesterday, dayName };
    } catch {
        return { formatted: dateStr, isToday: false, isYesterday: false, dayName: '' };
    }
}

function shiftDate(dateStr: string, days: number): string {
    try {
        const [y, m, d] = dateStr.split('-').map(Number);
        const dt = new Date(y, m - 1, d);
        dt.setDate(dt.getDate() + days);
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
    } catch {
        return dateStr;
    }
}

function getTodayString(): string {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export default function AttendanceIndex({
    date,
    class_id,
    classes,
    attendance,
    zkteco,
    zkteco_test_result,
    sidebar,
}: Props) {
    const sidebarStack = useSidebarStack();
    useEffect(() => {
        sidebarStack.set(sidebar);
    }, [sidebar]);

    const { flash } = usePage<{ flash?: { message?: string } }>().props;

    const [selectedDate, setSelectedDate] = useState(date);
    const [selectedClass, setSelectedClass] = useState(() =>
        class_id ? String(class_id) : classes[0]?.id ? String(classes[0].id) : '',
    );
    const [isSaving, setIsSaving] = useState(false);
    const [isZktecoOpen, setIsZktecoOpen] = useState(false);

    useEffect(() => {
        if (class_id) {
            setSelectedClass(String(class_id));
        }
    }, [class_id]);

    useEffect(() => {
        setSelectedDate(date);
    }, [date]);

    const [formData, setFormData] = useState<
        Record<string, { status: string; remarks: string }>
    >(() => {
        const initial: Record<string, { status: string; remarks: string }> = {};
        for (const row of attendance) {
            const sid = getStudentId(row);
            initial[String(sid)] = {
                status: row.status || 'present',
                remarks: row.remarks || '',
            };
        }
        return initial;
    });

    useEffect(() => {
        const next: Record<string, { status: string; remarks: string }> = {};
        for (const row of attendance) {
            const sid = getStudentId(row);
            next[String(sid)] = {
                status: row.status || 'present',
                remarks: row.remarks || '',
            };
        }
        setFormData(next);
    }, [attendance]);

    function updateRowStatus(studentId: number, status: string) {
        setFormData((prev) => ({
            ...prev,
            [String(studentId)]: {
                status,
                remarks: prev[String(studentId)]?.remarks ?? '',
            },
        }));
    }

    function updateRowRemarks(studentId: number, remarks: string) {
        setFormData((prev) => ({
            ...prev,
            [String(studentId)]: {
                status: prev[String(studentId)]?.status ?? 'present',
                remarks,
            },
        }));
    }

    function markAll(status: 'present' | 'absent' | 'late') {
        setFormData((prev) => {
            const updated = { ...prev };
            for (const row of attendance) {
                const sid = getStudentId(row);
                updated[String(sid)] = {
                    status,
                    remarks: prev[String(sid)]?.remarks ?? '',
                };
            }
            return updated;
        });
    }

    function load(dateToUse?: string, classToUse?: string | number) {
        const d = dateToUse ?? selectedDate;
        const c = classToUse ?? selectedClass;
        router.get(
            '/admin/attendance',
            {
                date: d,
                class_id: c,
            },
            {
                preserveState: false,
                preserveScroll: true,
            },
        );
    }

    function handleNavigateDate(targetDate: string) {
        setSelectedDate(targetDate);
        if (selectedClass) {
            load(targetDate, selectedClass);
        }
    }

    function save() {
        const activeClass = selectedClass || (class_id ? String(class_id) : '');
        if (!activeClass) {
            alert('Please select a class before saving attendance.');
            return;
        }

        setIsSaving(true);
        const records = attendance.map((row) => {
            const sid = getStudentId(row);
            return {
                student_id: sid,
                status: formData[String(sid)]?.status || 'present',
                remarks: formData[String(sid)]?.remarks || '',
            };
        });

        router.post(
            '/admin/attendance',
            {
                date: selectedDate,
                class_id: Number(activeClass),
                records,
            },
            {
                preserveScroll: true,
                onFinish: () => setIsSaving(false),
            },
        );
    }

    // Stats calculations
    const stats = React.useMemo(() => {
        let present = 0;
        let absent = 0;
        let late = 0;

        for (const row of attendance) {
            const sid = getStudentId(row);
            const status = formData[String(sid)]?.status ?? 'present';
            if (status === 'present') present++;
            else if (status === 'absent') absent++;
            else if (status === 'late') late++;
        }

        return { total: attendance.length, present, absent, late };
    }, [attendance, formData]);

    const selectedDateInfo = React.useMemo(() => formatDateDisplay(selectedDate), [selectedDate]);
    const activeDateInfo = React.useMemo(() => formatDateDisplay(date), [date]);
    const activeClassObj = React.useMemo(
        () => classes.find((c) => String(c.id) === String(selectedClass)),
        [classes, selectedClass],
    );

    return (
        <DashboardLayout>
            <Head title="Attendance" />

            <div className="space-y-6">
                <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase dark:text-slate-400">
                            Management
                        </p>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
                            Daily Attendance
                        </h1>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            Record, track, and manage student attendance by class and section.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {/* ZKTeco Biometrics Button */}
                        <button
                            type="button"
                            onClick={() => setIsZktecoOpen(true)}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                            <span
                                className={`h-2.5 w-2.5 rounded-full ${
                                    zkteco?.is_enabled
                                        ? 'bg-emerald-500 ring-4 ring-emerald-500/20'
                                        : 'bg-slate-300 dark:bg-slate-600'
                                }`}
                            />
                            <AppIcon name="server" className="h-4 w-4 text-slate-500" />
                            <span>ZKTeco Device</span>
                            {zkteco?.is_enabled ? (
                                <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 uppercase dark:bg-emerald-950/60 dark:text-emerald-300">
                                    Ready
                                </span>
                            ) : (
                                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 uppercase dark:bg-slate-800 dark:text-slate-400">
                                    Optional
                                </span>
                            )}
                        </button>

                        <Link
                            href={`/admin/communication/messages?audience=absent_today&class_id=${selectedClass || class_id || ''}&date=${selectedDate}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 shadow-sm transition hover:bg-amber-100 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200"
                            title="Send automated SMS / Email alert to absent students' guardians"
                        >
                            <AppIcon name="megaphone" className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            <span>Notify Absentees (SMS/Email)</span>
                        </Link>

                        {attendance.length > 0 && (
                            <button
                                type="button"
                                disabled={isSaving}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-accent-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-700 disabled:opacity-50"
                                onClick={save}
                            >
                                <AppIcon name="check" className="h-4 w-4" />
                                {isSaving ? 'Saving…' : 'Save Attendance'}
                            </button>
                        )}
                    </div>
                </header>

                {flash?.message && (
                    <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
                        {flash.message}
                    </div>
                )}

                {/* Filter and selector card */}
                <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-end">
                        {/* Prominent Date Selection Section */}
                        <div className="rounded-xl border-2 border-accent-500/30 bg-accent-50/40 p-4 lg:col-span-6 dark:border-accent-500/30 dark:bg-accent-950/20">
                            <div className="flex items-center justify-between">
                                <label
                                    htmlFor="attendance-date"
                                    className="flex items-center gap-2 text-xs font-bold tracking-wider text-accent-700 uppercase dark:text-accent-300"
                                >
                                    <span className="flex h-5 w-5 items-center justify-center rounded-md bg-accent-600 text-white shadow-sm">
                                        <AppIcon name="calendar" className="h-3.5 w-3.5" />
                                    </span>
                                    <span>Attendance Date</span>
                                </label>
                                <div className="flex items-center gap-1.5">
                                    {selectedDateInfo.isToday && (
                                        <span className="inline-flex items-center rounded-full bg-emerald-600 px-2 py-0.5 text-[11px] font-bold text-white uppercase tracking-wider shadow-sm">
                                            Today
                                        </span>
                                    )}
                                    {selectedDateInfo.isYesterday && (
                                        <span className="inline-flex items-center rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-700 uppercase tracking-wider dark:bg-slate-800 dark:text-slate-300">
                                            Yesterday
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="mt-2.5 flex items-center gap-2">
                                <button
                                    type="button"
                                    title="Previous Day"
                                    onClick={() => handleNavigateDate(shiftDate(selectedDate, -1))}
                                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-100 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                                >
                                    <AppIcon name="chevron-left" className="h-5 w-5" />
                                </button>

                                <div className="relative flex-1">
                                    <input
                                        id="attendance-date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        type="date"
                                        className="block h-11 w-full rounded-lg border-2 border-slate-300 bg-white px-3.5 text-base font-semibold text-slate-900 shadow-sm transition focus:border-accent-600 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:[color-scheme:dark] dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
                                    />
                                </div>

                                <button
                                    type="button"
                                    title="Next Day"
                                    onClick={() => handleNavigateDate(shiftDate(selectedDate, 1))}
                                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-100 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                                >
                                    <AppIcon name="chevron-right" className="h-5 w-5" />
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleNavigateDate(getTodayString())}
                                    className={`h-11 px-3.5 text-xs font-bold rounded-lg border transition shadow-sm ${
                                        selectedDateInfo.isToday
                                            ? 'border-accent-600 bg-accent-600 text-white hover:bg-accent-700'
                                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    Today
                                </button>
                            </div>

                            <div className="mt-2 flex items-center justify-between text-xs">
                                <span className="font-semibold text-slate-900 dark:text-slate-100">
                                    {selectedDateInfo.formatted || selectedDate}
                                </span>
                                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                    Use arrows to switch days
                                </span>
                            </div>
                        </div>

                        {/* Class selector */}
                        <div className="lg:col-span-4">
                            <label
                                htmlFor="attendance-class"
                                className="block text-sm font-semibold text-slate-700 dark:text-slate-300"
                            >
                                Class &amp; Section
                            </label>
                            <select
                                id="attendance-class"
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                                className="mt-2 block h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                            >
                                <option value="" disabled>
                                    Select class
                                </option>
                                {classes.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Load button */}
                        <div className="lg:col-span-2">
                            <button
                                type="button"
                                className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                                onClick={() => load(selectedDate, selectedClass)}
                            >
                                <AppIcon name="search" className="h-4 w-4" />
                                <span>Load Students</span>
                            </button>
                        </div>
                    </div>
                </section>

                {attendance.length > 0 && (
                    <div className="space-y-4">
                        {/* Summary and Bulk Actions Bar */}
                        <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                    Summary:
                                </span>
                                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                    Total: {stats.total}
                                </span>
                                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                                    Present: {stats.present}
                                </span>
                                <span className="inline-flex items-center rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                                    Absent: {stats.absent}
                                </span>
                                <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                                    Late: {stats.late}
                                </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-xs text-slate-500 mr-1 dark:text-slate-400">
                                    Set all:
                                </span>
                                <button
                                    type="button"
                                    onClick={() => markAll('present')}
                                    className="rounded border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/50"
                                >
                                    All Present
                                </button>
                                <button
                                    type="button"
                                    onClick={() => markAll('absent')}
                                    className="rounded border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700 transition hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/50"
                                >
                                    All Absent
                                </button>
                                <button
                                    type="button"
                                    onClick={() => markAll('late')}
                                    className="rounded border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 transition hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-900/50"
                                >
                                    All Late
                                </button>
                            </div>
                        </div>

                        {/* Student Attendance Table */}
                        <section className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            {/* Active Attendance Context Header */}
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50/70 px-5 py-3.5 dark:border-slate-800 dark:bg-slate-950/40">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-100 text-accent-700 shadow-sm dark:bg-accent-950 dark:text-accent-300">
                                        <AppIcon name="calendar" className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-base font-bold text-slate-900 dark:text-slate-100">
                                                {activeDateInfo.formatted || date}
                                            </span>
                                            {activeDateInfo.isToday && (
                                                <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                                                    Today
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                            {activeClassObj ? activeClassObj.label : 'Attendance Sheet'}
                                        </p>
                                    </div>
                                </div>

                                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                    Showing {attendance.length} enrolled student{attendance.length !== 1 ? 's' : ''}
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
                                    <thead className="bg-slate-50 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase dark:bg-slate-950/40 dark:text-slate-400">
                                        <tr>
                                            <th className="w-20 px-4 py-3">Roll</th>
                                            <th className="px-4 py-3">Student Name</th>
                                            <th className="px-4 py-3">Attendance Status</th>
                                            <th className="px-4 py-3">Remarks / Note</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {attendance.map((row) => {
                                            const sid = getStudentId(row);
                                            const sName = getStudentName(row);
                                            const currentStatus =
                                                formData[String(sid)]?.status ?? 'present';
                                            const currentRemarks =
                                                formData[String(sid)]?.remarks ?? '';

                                            return (
                                                <tr
                                                    key={sid}
                                                    className="text-slate-700 hover:bg-slate-50/60 dark:text-slate-200 dark:hover:bg-slate-800/40"
                                                >
                                                    <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-900 dark:text-slate-100">
                                                        {row.roll_number ?? '—'}
                                                    </td>
                                                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                                                        <div>{sName}</div>
                                                        {row.name_bn && row.name_bn !== sName && (
                                                            <div className="text-xs text-slate-400">
                                                                {row.name_bn}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <label
                                                                className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium cursor-pointer transition ${
                                                                    currentStatus === 'present'
                                                                        ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-200 ring-1 ring-emerald-400/30'
                                                                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-800'
                                                                }`}
                                                            >
                                                                <input
                                                                    type="radio"
                                                                    name={`attendance-status-${sid}`}
                                                                    value="present"
                                                                    checked={currentStatus === 'present'}
                                                                    onChange={() =>
                                                                        updateRowStatus(sid, 'present')
                                                                    }
                                                                    className="h-3.5 w-3.5 border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-600"
                                                                />
                                                                Present
                                                            </label>

                                                            <label
                                                                className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium cursor-pointer transition ${
                                                                    currentStatus === 'absent'
                                                                        ? 'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-700 dark:bg-rose-950/60 dark:text-rose-200 ring-1 ring-rose-400/30'
                                                                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-800'
                                                                }`}
                                                            >
                                                                <input
                                                                    type="radio"
                                                                    name={`attendance-status-${sid}`}
                                                                    value="absent"
                                                                    checked={currentStatus === 'absent'}
                                                                    onChange={() =>
                                                                        updateRowStatus(sid, 'absent')
                                                                    }
                                                                    className="h-3.5 w-3.5 border-slate-300 text-rose-600 focus:ring-rose-500 dark:border-slate-600"
                                                                />
                                                                Absent
                                                            </label>

                                                            <label
                                                                className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium cursor-pointer transition ${
                                                                    currentStatus === 'late'
                                                                        ? 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/60 dark:text-amber-200 ring-1 ring-amber-400/30'
                                                                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-800'
                                                                }`}
                                                            >
                                                                <input
                                                                    type="radio"
                                                                    name={`attendance-status-${sid}`}
                                                                    value="late"
                                                                    checked={currentStatus === 'late'}
                                                                    onChange={() =>
                                                                        updateRowStatus(sid, 'late')
                                                                    }
                                                                    className="h-3.5 w-3.5 border-slate-300 text-amber-600 focus:ring-amber-500 dark:border-slate-600"
                                                                />
                                                                Late
                                                            </label>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            {currentRemarks?.includes('ZKTeco') && (
                                                                <span
                                                                    title={currentRemarks}
                                                                    className="inline-flex shrink-0 items-center gap-1 rounded bg-purple-50 px-2 py-0.5 text-[10px] font-semibold text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 ring-1 ring-purple-500/20"
                                                                >
                                                                    <AppIcon name="server" className="h-3 w-3" />
                                                                    <span>Biometric</span>
                                                                </span>
                                                            )}
                                                            <input
                                                                value={currentRemarks}
                                                                onChange={(e) =>
                                                                    updateRowRemarks(sid, e.target.value)
                                                                }
                                                                type="text"
                                                                placeholder="Optional note…"
                                                                className="h-8 w-full max-w-xs rounded-md border border-slate-200 bg-white px-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                                            />
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 dark:border-slate-800">
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                    {attendance.length} student{attendance.length !== 1 ? 's' : ''} in this list
                                </span>
                                <button
                                    type="button"
                                    disabled={isSaving}
                                    className="inline-flex items-center gap-1.5 rounded-md bg-accent-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-700 disabled:opacity-50"
                                    onClick={save}
                                >
                                    <AppIcon name="check" className="h-4 w-4" />
                                    {isSaving ? 'Saving…' : 'Save Attendance'}
                                </button>
                            </div>
                        </section>
                    </div>
                )}

                {attendance.length === 0 && (
                    <section className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <AppIcon name="users" className="mx-auto h-8 w-8 text-slate-400" />
                        <h3 className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                            No students found
                        </h3>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Select a class and section and click &ldquo;Load Students&rdquo; to view or record attendance.
                        </p>
                    </section>
                )}
            </div>

            <ZktecoModal
                isOpen={isZktecoOpen}
                onClose={() => setIsZktecoOpen(false)}
                date={selectedDate}
                classId={selectedClass}
                zkteco={zkteco}
                initialTestResult={zkteco_test_result}
            />
        </DashboardLayout>
    );
}
