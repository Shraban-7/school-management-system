import React, { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import AppIcon from '@/components/AppIcon';
import { useSidebarStack } from '@/composables/useNavStack';
import type { SidebarConfig } from '@/types/sidebar';

interface AttendanceRow {
    student_id: number;
    student_name: string;
    roll_number: string;
    status: string | null;
    remarks: string | null;
}

interface Props {
    date: string;
    classes: { id: number; label: string }[];
    attendance: AttendanceRow[];
    sidebar: SidebarConfig;
}

export default function AttendanceIndex({ date, classes, attendance, sidebar }: Props) {
    const sidebarStack = useSidebarStack();
    useEffect(() => {
        sidebarStack.set(sidebar);
    }, [sidebar]);

    const page = usePage<any>();
    const flash = page.props.flash?.message ?? null;

    const [selectedDate, setSelectedDate] = useState(date);
    const [selectedClass, setSelectedClass] = useState('');

    const [formData, setFormData] = useState<
        Record<string, { status: string; remarks: string }>
    >(() => {
        const initial: Record<string, { status: string; remarks: string }> = {};
        for (const row of attendance) {
            initial[String(row.student_id)] = {
                status: row.status ?? 'present',
                remarks: row.remarks ?? '',
            };
        }
        return initial;
    });

    useEffect(() => {
        const next: Record<string, { status: string; remarks: string }> = {};
        for (const row of attendance) {
            next[String(row.student_id)] = {
                status: row.status ?? 'present',
                remarks: row.remarks ?? '',
            };
        }
        setFormData(next);
    }, [attendance]);

    function updateRowStatus(studentId: number, status: string) {
        setFormData((prev) => ({
            ...prev,
            [String(studentId)]: {
                ...prev[String(studentId)],
                status,
            },
        }));
    }

    function updateRowRemarks(studentId: number, remarks: string) {
        setFormData((prev) => ({
            ...prev,
            [String(studentId)]: {
                ...prev[String(studentId)],
                remarks,
            },
        }));
    }

    function load() {
        router.get('/admin/attendance', {
            date: selectedDate,
            class_id: selectedClass,
        });
    }

    function save() {
        const records = attendance.map((row) => ({
            student_id: row.student_id,
            status: formData[String(row.student_id)]?.status ?? 'present',
            remarks: formData[String(row.student_id)]?.remarks ?? '',
        }));

        router.post('/admin/attendance', {
            date: selectedDate,
            class_id: selectedClass,
            records,
        });
    }

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
                            Attendance
                        </h1>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            Record and manage daily student attendance.
                        </p>
                    </div>
                </header>

                {flash && (
                    <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
                        {flash}
                    </div>
                )}

                <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                        <div>
                            <label
                                htmlFor="attendance-date"
                                className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Date
                            </label>
                            <input
                                id="attendance-date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                type="date"
                                className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="attendance-class"
                                className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Class
                            </label>
                            <select
                                id="attendance-class"
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                                className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
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
                        <button
                            type="button"
                            className="inline-flex items-center gap-1.5 self-end rounded-md bg-accent-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-700"
                            onClick={load}
                        >
                            <AppIcon name="search" className="h-4 w-4" />
                            Load
                        </button>
                    </div>
                </section>

                {attendance.length > 0 && (
                    <section className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
                                <thead className="bg-slate-50 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase dark:bg-slate-950/40 dark:text-slate-400">
                                <tr>
                                    <th className="px-4 py-3">Roll</th>
                                    <th className="px-4 py-3">Name</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Remarks</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {attendance.map((row) => (
                                    <tr
                                        key={row.student_id}
                                        className="text-slate-700 hover:bg-slate-50/60 dark:text-slate-200 dark:hover:bg-slate-800/40"
                                    >
                                        <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-300">
                                            {row.roll_number}
                                        </td>
                                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                                            {row.student_name}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-4">
                                                <label className="flex items-center gap-1.5 text-xs">
                                                    <input
                                                        type="radio"
                                                        name={`status-${row.student_id}`}
                                                        value="present"
                                                        checked={
                                                            (formData[String(row.student_id)]?.status ??
                                                                'present') === 'present'
                                                        }
                                                        onChange={() =>
                                                            updateRowStatus(row.student_id, 'present')
                                                        }
                                                        className="h-3.5 w-3.5 border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-600"
                                                    />
                                                    Present
                                                </label>
                                                <label className="flex items-center gap-1.5 text-xs">
                                                    <input
                                                        type="radio"
                                                        name={`status-${row.student_id}`}
                                                        value="absent"
                                                        checked={
                                                            formData[String(row.student_id)]?.status ===
                                                            'absent'
                                                        }
                                                        onChange={() =>
                                                            updateRowStatus(row.student_id, 'absent')
                                                        }
                                                        className="h-3.5 w-3.5 border-slate-300 text-rose-600 focus:ring-rose-500 dark:border-slate-600"
                                                    />
                                                    Absent
                                                </label>
                                                <label className="flex items-center gap-1.5 text-xs">
                                                    <input
                                                        type="radio"
                                                        name={`status-${row.student_id}`}
                                                        value="late"
                                                        checked={
                                                            formData[String(row.student_id)]?.status ===
                                                            'late'
                                                        }
                                                        onChange={() =>
                                                            updateRowStatus(row.student_id, 'late')
                                                        }
                                                        className="h-3.5 w-3.5 border-slate-300 text-amber-600 focus:ring-amber-500 dark:border-slate-600"
                                                    />
                                                    Late
                                                </label>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                                value={formData[String(row.student_id)]?.remarks ?? ''}
                                                onChange={(e) =>
                                                    updateRowRemarks(row.student_id, e.target.value)
                                                }
                                                type="text"
                                                placeholder="Optional note…"
                                                className="h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="border-t border-slate-200 px-4 py-3 dark:border-slate-800">
                        <button
                            type="button"
                            className="inline-flex items-center gap-1.5 rounded-md bg-accent-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-700"
                            onClick={save}
                        >
                            <AppIcon name="check" className="h-4 w-4" />
                            Save attendance
                        </button>
                    </div>
                </section>
                )}

                {attendance.length === 0 && selectedClass && (
                    <section className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            No students found. Select a class and click "Load" to view attendance.
                        </p>
                    </section>
                )}
            </div>
        </DashboardLayout>
    );
}
