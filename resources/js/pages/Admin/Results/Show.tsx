import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import AppIcon from '@/components/AppIcon';
import { useSidebarStack } from '@/composables/useNavStack';
import { useDragScroll } from '@/composables/useDragScroll';
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
    const [search, setSearch] = useState('');

    const {
        ref: tableScrollRef,
        isDragging,
        canScrollLeft,
        canScrollRight,
        scrollToLeft,
        scrollToRight,
        checkScrollLimits,
    } = useDragScroll({ speed: 1.15 });

    useEffect(() => {
        if (view === 'tabulation') {
            const timer = setTimeout(() => {
                checkScrollLimits();
            }, 60);
            return () => clearTimeout(timer);
        }
    }, [view, classId, search, columns, checkScrollLimits]);

    function applyClass(newClassId: number | null) {
        setClassId(newClassId);
        router.get(
            `/admin/results/${exam.id}`,
            newClassId ? { class_id: newClassId } : {},
            { preserveState: false, preserveScroll: true },
        );
    }

    const filteredRows = rows.filter((r) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
            r.name_en.toLowerCase().includes(q) ||
            r.roll_number?.toLowerCase().includes(q) ||
            r.class_label?.toLowerCase().includes(q)
        );
    });

    return (
        <DashboardLayout>
            <Head title={`Results & Tabulation - ${exam.name_en}`} />

            <div className="w-full max-w-full space-y-6">
                {/* Header */}
                <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/admin/results"
                            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-xs transition hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                            title="Back to results"
                        >
                            <AppIcon name="arrow-left" className="h-5 w-5" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center rounded-md bg-accent-500/10 px-2 py-0.5 text-xs font-semibold tracking-wider text-accent-700 uppercase dark:bg-accent-500/20 dark:text-accent-300">
                                    Results & Tabulation
                                </span>
                                <span className="text-xs text-slate-400 dark:text-slate-500">/</span>
                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                    {exam.exam_type}
                                </span>
                            </div>
                            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
                                {exam.name_en}
                            </h1>
                            <p className="mt-0.5 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
                                <span>{exam.session_name || 'Academic Session'}</span>
                                {exam.institution_name && (
                                    <>
                                        <span className="mx-2">&middot;</span>
                                        <span>{exam.institution_name}</span>
                                    </>
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <Link
                            href={`/admin/exams/${exam.id}/marks`}
                            className="inline-flex items-center gap-2 rounded-xl bg-accent-50 px-4 py-2 text-xs font-semibold text-accent-700 shadow-2xs transition hover:bg-accent-100 dark:bg-accent-950/60 dark:text-accent-300 dark:hover:bg-accent-900/60"
                        >
                            <AppIcon name="book-open" className="h-4 w-4" />
                            <span>Edit Marks</span>
                        </Link>
                    </div>
                </header>

                {/* Filter and Tab Bar */}
                <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex flex-wrap items-center gap-2.5">
                        {/* Tab Switcher */}
                        <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50/70 p-1 dark:border-slate-700 dark:bg-slate-950">
                            <button
                                type="button"
                                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                                    view === 'tabulation'
                                        ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-slate-100'
                                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                                }`}
                                onClick={() => setView('tabulation')}
                            >
                                Tabulation Sheet
                            </button>
                            <button
                                type="button"
                                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                                    view === 'merit'
                                        ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-slate-100'
                                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                                }`}
                                onClick={() => setView('merit')}
                            >
                                Merit List
                            </button>
                        </div>

                        {/* Search Input */}
                        <label className="relative flex min-w-[180px] items-center">
                            <AppIcon
                                name="search"
                                className="pointer-events-none absolute left-3 h-3.5 w-3.5 text-slate-400 dark:text-slate-500"
                            />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                type="search"
                                placeholder="Filter students…"
                                className="h-8.5 w-full rounded-lg border border-slate-200 bg-slate-50/50 pr-3 pl-8 text-xs text-slate-900 placeholder-slate-400 transition focus:border-accent-500 focus:bg-white focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:bg-slate-900"
                            />
                        </label>
                    </div>

                    {/* Class Selector & Quick Scroll Buttons */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Class:</span>
                            <select
                                value={classId ?? ''}
                                onChange={(e) =>
                                    applyClass(e.target.value === '' ? null : Number(e.target.value))
                                }
                                className="h-8.5 rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-xs font-medium text-slate-700 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 [&>option]:bg-white dark:[&>option]:bg-slate-900"
                            >
                                <option value="">All classes</option>
                                {classes.map((c) => (
                                    <option key={c.value} value={c.value}>
                                        {c.label}
                                    </option>
                                ))}
                            </select>
                            <span className="text-xs text-slate-400 dark:text-slate-500">
                                ({filteredRows.length} students)
                            </span>
                        </div>

                        {view === 'tabulation' && (
                            <div className="flex items-center gap-1 sm:border-l sm:border-slate-200 sm:pl-3 dark:sm:border-slate-800">
                                <span className="hidden lg:inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 dark:text-slate-500 mr-1 select-none">
                                    <span>Drag table or</span>
                                </span>
                                <button
                                    type="button"
                                    onClick={scrollToLeft}
                                    disabled={!canScrollLeft}
                                    className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                                    title="Scroll table left"
                                    aria-label="Scroll left"
                                >
                                    <AppIcon name="chevron-left" className="h-3.5 w-3.5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={scrollToRight}
                                    disabled={!canScrollRight}
                                    className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                                    title="Scroll table right"
                                    aria-label="Scroll right"
                                >
                                    <AppIcon name="chevron-right" className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Table Section */}
                <section className="w-full max-w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="relative w-full max-w-full">
                        {/* Shadow indicator on left edge after pinned student column */}
                        {view === 'tabulation' && canScrollLeft && (
                            <div className="pointer-events-none absolute inset-y-0 left-[16.25rem] w-6 bg-gradient-to-r from-black/10 to-transparent z-25 dark:from-black/40" />
                        )}
                        {/* Shadow indicator on right edge when more content can be scrolled */}
                        {view === 'tabulation' && canScrollRight && (
                            <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/10 to-transparent z-25 dark:from-black/40" />
                        )}

                        <div
                            ref={tableScrollRef}
                            className={`w-full max-w-full overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 transition-colors ${
                                view === 'tabulation' ? (isDragging ? 'cursor-grabbing select-none' : 'cursor-grab') : ''
                            }`}
                        >
                        {view === 'tabulation' ? (
                            <table className="min-w-max w-full text-left text-sm border-separate border-spacing-0">
                                <thead className="sticky top-0 z-30 bg-slate-100 dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                                    <tr>
                                        {/* Pinned Roll */}
                                        <th className="sticky left-0 top-0 z-40 w-16 min-w-[4.25rem] bg-slate-100 dark:bg-slate-900 px-3 py-3.5 text-center border-b-2 border-r border-slate-300 dark:border-slate-700">
                                            Roll
                                        </th>
                                        {/* Pinned Student Name */}
                                        <th className="sticky left-[4.25rem] top-0 z-40 w-48 min-w-[12rem] bg-slate-100 dark:bg-slate-900 px-4 py-3.5 border-b-2 border-r-2 border-slate-300 dark:border-slate-700 shadow-[4px_0_10px_-2px_rgba(0,0,0,0.06)] dark:shadow-[4px_0_10px_-2px_rgba(0,0,0,0.4)]">
                                            Student
                                        </th>
                                        {/* Subject Columns */}
                                        {columns.map((col) => (
                                            <th
                                                key={col.id}
                                                className="w-24 min-w-[6rem] px-3 py-3.5 text-center border-b-2 border-r border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60"
                                            >
                                                <div className="truncate" title={col.name_en ?? ''}>
                                                    {col.name_en}
                                                </div>
                                            </th>
                                        ))}
                                        <th className="w-20 min-w-[5rem] px-3 py-3.5 text-center border-b-2 border-r border-slate-200 dark:border-slate-800">
                                            Total
                                        </th>
                                        <th className="w-18 min-w-[4.5rem] px-3 py-3.5 text-center border-b-2 border-r border-slate-200 dark:border-slate-800">
                                            GPA
                                        </th>
                                        <th className="w-20 min-w-[5rem] px-3 py-3.5 text-center border-b-2 border-r border-slate-200 dark:border-slate-800">
                                            Result
                                        </th>
                                        <th className="w-16 min-w-[4rem] px-3 py-3.5 text-right border-b-2 border-slate-300 dark:border-slate-700">
                                            Sheet
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                                    {filteredRows.map((row) => (
                                        <tr
                                            key={row.student_id}
                                            className="group transition-colors duration-150 hover:bg-accent-50/40 dark:hover:bg-accent-950/20"
                                        >
                                            {/* Pinned Roll */}
                                            <td className="sticky left-0 z-20 w-16 min-w-[4.25rem] bg-white dark:bg-slate-900 px-3 py-3 text-center font-mono text-xs font-semibold text-slate-700 dark:text-slate-200 border-r border-b border-slate-200 dark:border-slate-800 transition-colors duration-150 group-hover:bg-slate-50 dark:group-hover:bg-slate-800">
                                                {row.roll_number || '—'}
                                            </td>

                                            {/* Pinned Student Name */}
                                            <td className="sticky left-[4.25rem] z-20 w-48 min-w-[12rem] bg-white dark:bg-slate-900 px-4 py-3 border-r-2 border-b border-slate-300 dark:border-slate-700 shadow-[4px_0_10px_-2px_rgba(0,0,0,0.06)] dark:shadow-[4px_0_10px_-2px_rgba(0,0,0,0.4)] transition-colors duration-150 group-hover:bg-slate-50 dark:group-hover:bg-slate-800">
                                                <div className="min-w-0">
                                                    <p className="truncate font-semibold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                                                        {row.name_en}
                                                    </p>
                                                    {row.class_label && (
                                                        <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                                                            {row.class_label}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Subject Cells */}
                                            {columns.map((col) => {
                                                const sub = row.subjects[col.id];
                                                return (
                                                    <td
                                                        key={col.id}
                                                        className="px-2 py-2.5 text-center border-r border-b border-slate-200 dark:border-slate-800"
                                                    >
                                                        {sub ? (
                                                            <div className="inline-flex flex-col items-center">
                                                                <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-100">
                                                                    {sub.is_absent ? (
                                                                        <span className="text-rose-500 dark:text-rose-400">ABS</span>
                                                                    ) : sub.total !== null ? (
                                                                        sub.total
                                                                    ) : (
                                                                        '—'
                                                                    )}
                                                                </span>
                                                                <span
                                                                    className={`mt-0.5 inline-flex rounded-full px-2 py-0.2 text-[10px] font-bold border ${
                                                                        !sub.passed || sub.is_absent
                                                                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                                                                            : sub.grade === 'A+' || sub.grade === 'A'
                                                                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                                                                              : sub.grade === 'A-' || sub.grade === 'B'
                                                                                ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300 border-sky-300 dark:border-sky-800'
                                                                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                                                                    }`}
                                                                >
                                                                    {sub.grade}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-300 dark:text-slate-600">—</span>
                                                        )}
                                                    </td>
                                                );
                                            })}

                                            {/* Total */}
                                            <td className="px-3 py-3 text-center font-mono text-xs font-bold text-slate-900 dark:text-slate-100 border-r border-b border-slate-200 dark:border-slate-800">
                                                {row.has_marks ? Math.round(row.total * 10) / 10 : <span className="text-slate-300">—</span>}
                                            </td>

                                            {/* GPA */}
                                            <td className="px-3 py-3 text-center font-mono text-xs font-semibold text-slate-800 dark:text-slate-200 border-r border-b border-slate-200 dark:border-slate-800">
                                                {row.gpa === null ? '—' : row.gpa.toFixed(2)}
                                            </td>

                                            {/* Result Badge */}
                                            <td className="px-3 py-3 text-center border-r border-b border-slate-200 dark:border-slate-800">
                                                {row.has_marks ? (
                                                    <span
                                                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
                                                            row.passed
                                                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                                                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                                                        }`}
                                                    >
                                                        {row.passed ? 'Pass' : 'Fail'}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-300 dark:text-slate-600">—</span>
                                                )}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-3 py-3 text-right border-b border-slate-200 dark:border-slate-800">
                                                <Link
                                                    href={`/admin/results/${exam.id}/students/${row.student_id}`}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                                                    aria-label="View gradesheet"
                                                    title="View student gradesheet"
                                                >
                                                    <AppIcon name="eye" className="h-4 w-4" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}

                                    {filteredRows.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={columns.length + 6}
                                                className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400"
                                            >
                                                No students or marks found for this criteria.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        ) : (
                            /* Merit List View */
                            <table className="w-full text-left text-sm divide-y divide-slate-200 dark:divide-slate-800">
                                <thead className="bg-slate-100 dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                                    <tr>
                                        <th className="px-4 py-3.5">Position</th>
                                        <th className="px-4 py-3.5">Roll</th>
                                        <th className="px-4 py-3.5">Student</th>
                                        <th className="px-4 py-3.5">Class</th>
                                        <th className="px-3 py-3.5 text-center">Total</th>
                                        <th className="px-3 py-3.5 text-center">GPA</th>
                                        <th className="px-3 py-3.5 text-center">Grade</th>
                                        <th className="px-3 py-3.5 text-center">Result</th>
                                        <th className="px-3 py-3.5 text-right">Sheet</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                                    {filteredRows.map((row) => (
                                        <tr
                                            key={row.student_id}
                                            className="transition-colors hover:bg-accent-50/40 dark:hover:bg-accent-950/20"
                                        >
                                            <td className="px-4 py-3.5 font-bold">
                                                {row.position ? (
                                                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent-100 text-accent-800 dark:bg-accent-900/60 dark:text-accent-300 text-xs">
                                                        {row.position}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-300">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3.5 font-mono text-xs font-semibold text-slate-700 dark:text-slate-200">
                                                {row.roll_number || '—'}
                                            </td>
                                            <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-slate-100">
                                                {row.name_en}
                                            </td>
                                            <td className="px-4 py-3.5 text-xs text-slate-600 dark:text-slate-300">
                                                {row.class_label ?? '—'}
                                            </td>
                                            <td className="px-3 py-3.5 text-center font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                                                {Math.round(row.total * 10) / 10}
                                            </td>
                                            <td className="px-3 py-3.5 text-center font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
                                                {row.gpa === null ? '—' : row.gpa.toFixed(2)}
                                            </td>
                                            <td className="px-3 py-3.5 text-center">
                                                <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                                                    {row.grade}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3.5 text-center">
                                                {row.has_marks ? (
                                                    <span
                                                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                                                            row.passed
                                                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                                                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                                                        }`}
                                                    >
                                                        {row.passed ? 'Pass' : 'Fail'}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-300">—</span>
                                                )}
                                            </td>
                                            <td className="px-3 py-3.5 text-right">
                                                <Link
                                                    href={`/admin/results/${exam.id}/students/${row.student_id}`}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                                                    aria-label="View gradesheet"
                                                    title="View student gradesheet"
                                                >
                                                    <AppIcon name="eye" className="h-4 w-4" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredRows.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={9}
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
                    </div>
                </section>
            </div>
        </DashboardLayout>
    );
}
