import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import AppIcon from '@/components/AppIcon';
import { useSidebarStack } from '@/composables/useNavStack';
import type { SidebarConfig } from '@/types/sidebar';

interface SubjectCell {
    grade: string;
    point: number;
    total: number | null;
    passed: boolean;
    is_absent: boolean;
}

interface Row {
    student_id: number;
    roll_number: string | null;
    name_en: string;
    class_label: string | null;
    subjects: Record<number, SubjectCell>;
    gpa: number | null;
    grade: string;
    total: number;
    passed: boolean | null;
    failed_count: number;
    position: number | null;
    has_marks: boolean;
}

interface Props {
    exam: {
        id: number;
        name_en: string;
        exam_type: string;
        session_name: string | null;
        institution_name: string | null;
        is_published: boolean;
    };
    classes: { value: number; label: string }[];
    selectedClassId: number | null;
    columns: { id: number; name_en: string | null }[];
    rows: Row[];
    sidebar: SidebarConfig;
}

export default function Show({
    exam,
    classes,
    selectedClassId,
    columns,
    rows,
    sidebar,
}: Props) {
    const sidebarStack = useSidebarStack();
    useEffect(() => {
        sidebarStack.set(sidebar);
    }, [sidebar]);

    const [view, setView] = useState<'tabulation' | 'merit'>('tabulation');
    const [classId, setClassId] = useState<number | null>(selectedClassId);

    function applyClass(newClassId: number | null) {
        setClassId(newClassId);
        router.get(
            `/admin/results/${exam.id}`,
            newClassId ? { class_id: newClassId } : {},
            { preserveState: false, preserveScroll: true },
        );
    }

    return (
        <DashboardLayout>
            <Head title={`Results - ${exam.name_en}`} />

            <div className="space-y-6">
                <header className="flex items-center gap-4">
                    <Link
                        href="/admin/results"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                    >
                        <AppIcon name="arrow-left" className="h-5 w-5" />
                    </Link>
                    <div>
                        <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase dark:text-slate-400">
                            Tabulation &amp; ranking
                        </p>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                            {exam.name_en}
                        </h1>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            {exam.institution_name} &middot; {exam.exam_type}
                            {exam.session_name && ` · ${exam.session_name}`}
                        </p>
                    </div>
                </header>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
                        <button
                            type="button"
                            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                                view === 'tabulation'
                                    ? 'bg-accent-600 text-white'
                                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
                            }`}
                            onClick={() => setView('tabulation')}
                        >
                            Tabulation
                        </button>
                        <button
                            type="button"
                            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                                view === 'merit'
                                    ? 'bg-accent-600 text-white'
                                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
                            }`}
                            onClick={() => setView('merit')}
                        >
                            Merit list
                        </button>
                    </div>

                    <label className="flex items-center gap-2 text-sm">
                        <span className="text-slate-500 dark:text-slate-400">Class</span>
                        <select
                            value={classId ?? ''}
                            onChange={(e) =>
                                applyClass(e.target.value === '' ? null : Number(e.target.value))
                            }
                            className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                        >
                            <option value="">All classes</option>
                            {classes.map((c) => (
                                <option key={c.value} value={c.value}>
                                    {c.label}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                <section className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="overflow-x-auto">
                        {view === 'tabulation' ? (
                            <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
                                <thead className="bg-slate-50 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase dark:bg-slate-950/40 dark:text-slate-400">
                                    <tr>
                                        <th className="px-4 py-3">Roll</th>
                                        <th className="px-4 py-3">Student</th>
                                        {columns.map((col) => (
                                            <th key={col.id} className="px-3 py-3 text-center">
                                                {col.name_en}
                                            </th>
                                        ))}
                                        <th className="px-3 py-3 text-center">GPA</th>
                                        <th className="px-3 py-3 text-center">Result</th>
                                        <th className="px-3 py-3 text-right">Sheet</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {rows.map((row) => (
                                        <tr
                                            key={row.student_id}
                                            className="text-slate-700 hover:bg-slate-50/60 dark:text-slate-200 dark:hover:bg-slate-800/40"
                                        >
                                            <td className="px-4 py-3 font-mono text-xs">
                                                {row.roll_number}
                                            </td>
                                            <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                                                {row.name_en}
                                            </td>
                                            {columns.map((col) => {
                                                const sub = row.subjects[col.id];
                                                return (
                                                    <td key={col.id} className="px-3 py-3 text-center">
                                                        {sub ? (
                                                            <span
                                                                className={`text-xs font-semibold ${
                                                                    sub.passed
                                                                        ? 'text-slate-700 dark:text-slate-200'
                                                                        : 'text-rose-600 dark:text-rose-400'
                                                                }`}
                                                            >
                                                                {sub.grade}
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-300">—</span>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                            <td className="px-3 py-3 text-center font-mono text-xs font-semibold">
                                                {row.gpa === null ? '—' : row.gpa.toFixed(2)}
                                            </td>
                                            <td className="px-3 py-3 text-center">
                                                {row.has_marks ? (
                                                    <span
                                                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                                            row.passed
                                                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                                                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                                                        }`}
                                                    >
                                                        {row.passed ? 'Pass' : 'Fail'}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-300">—</span>
                                                )}
                                            </td>
                                            <td className="px-3 py-3 text-right">
                                                <Link
                                                    href={`/admin/results/${exam.id}/students/${row.student_id}`}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                                                    aria-label="View gradesheet"
                                                >
                                                    <AppIcon name="eye" className="h-4 w-4" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                    {rows.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={columns.length + 5}
                                                className="px-4 py-12 text-center text-sm text-slate-500 dark:text-slate-400"
                                            >
                                                No students or marks found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        ) : (
                            <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
                                <thead className="bg-slate-50 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase dark:bg-slate-950/40 dark:text-slate-400">
                                    <tr>
                                        <th className="px-4 py-3">Position</th>
                                        <th className="px-4 py-3">Roll</th>
                                        <th className="px-4 py-3">Student</th>
                                        <th className="px-4 py-3">Class</th>
                                        <th className="px-3 py-3 text-center">Total</th>
                                        <th className="px-3 py-3 text-center">GPA</th>
                                        <th className="px-3 py-3 text-center">Grade</th>
                                        <th className="px-3 py-3 text-center">Result</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {rows.map((row) => (
                                        <tr
                                            key={row.student_id}
                                            className="text-slate-700 hover:bg-slate-50/60 dark:text-slate-200 dark:hover:bg-slate-800/40"
                                        >
                                            <td className="px-4 py-3 font-semibold">
                                                {row.position ? row.position : <span className="text-slate-300">—</span>}
                                            </td>
                                            <td className="px-4 py-3 font-mono text-xs">
                                                {row.roll_number}
                                            </td>
                                            <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                                                {row.name_en}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">
                                                {row.class_label ?? '—'}
                                            </td>
                                            <td className="px-3 py-3 text-center font-mono text-xs">
                                                {Math.round(row.total * 10) / 10}
                                            </td>
                                            <td className="px-3 py-3 text-center font-mono text-xs font-semibold">
                                                {row.gpa === null ? '—' : row.gpa.toFixed(2)}
                                            </td>
                                            <td className="px-3 py-3 text-center">
                                                {row.grade}
                                            </td>
                                            <td className="px-3 py-3 text-center">
                                                {row.has_marks ? (
                                                    <span
                                                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                                            row.passed
                                                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                                                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                                                        }`}
                                                    >
                                                        {row.passed ? 'Pass' : 'Fail'}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-300">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {rows.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={8}
                                                className="px-4 py-12 text-center text-sm text-slate-500 dark:text-slate-400"
                                            >
                                                No students or marks found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </section>
            </div>
        </DashboardLayout>
    );
}
