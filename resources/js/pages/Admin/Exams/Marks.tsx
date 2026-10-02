import { Head, Link, router } from '@inertiajs/react';
import { Fragment, useEffect, useMemo, useState, useCallback } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import AppIcon from '@/components/AppIcon';
import { useSidebarStack } from '@/composables/useNavStack';
import { useDragScroll } from '@/composables/useDragScroll';
import type { SidebarConfig } from '@/types/sidebar';

interface MarkData {
    written: number | null;
    mcq: number | null;
    practical: number | null;
    is_absent: boolean;
}

interface StudentRow {
    id: number;
    name_en: string;
    roll_number: string;
    class_level?: string;
    section?: string;
}

interface Props {
    exam: {
        id: number;
        name_en: string;
        name_bn?: string;
        exam_type: string;
        institution_name?: string;
        session_name?: string;
    };
    subjects: {
        id: number;
        name_en: string;
        full_marks: number;
        pass_marks: number;
    }[];
    students: StudentRow[];
    marks: Record<string, MarkData>;
    sidebar: SidebarConfig;
}

const gradeBands = [
    { min: 80, label: 'A+' },
    { min: 70, label: 'A' },
    { min: 60, label: 'A-' },
    { min: 50, label: 'B' },
    { min: 40, label: 'C' },
    { min: 33, label: 'D' },
    { min: 0, label: 'F' },
];

function key(studentId: number, subjectId: number): string {
    return `${studentId}-${subjectId}`;
}

export default function Marks({ exam, subjects, students, marks, sidebar }: Props) {
    const sidebarStack = useSidebarStack();
    useEffect(() => {
        sidebarStack.set(sidebar);
    }, [sidebar]);

    const subjectById = useMemo(
        () => Object.fromEntries(subjects.map((s) => [s.id, s])),
        [subjects],
    );

    // Initial state
    const [grid, setGrid] = useState<Record<string, MarkData>>(() => {
        const initial: Record<string, MarkData> = {};
        for (const student of students) {
            for (const subject of subjects) {
                const k = key(student.id, subject.id);
                const existing = marks[k];
                initial[k] = existing
                    ? { ...existing }
                    : { written: null, mcq: null, practical: null, is_absent: false };
            }
        }
        return initial;
    });

    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [saving, setSaving] = useState(false);
    const [searchStudent, setSearchStudent] = useState('');
    const [selectedSubjectId, setSelectedSubjectId] = useState<number | 'all'>('all');
    const [classFilter, setClassFilter] = useState<string>('all');

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
        const timer = setTimeout(() => {
            checkScrollLimits();
        }, 60);
        return () => clearTimeout(timer);
    }, [selectedSubjectId, searchStudent, classFilter, checkScrollLimits]);

    // Available classes for filter
    const availableClasses = useMemo(() => {
        const set = new Set<string>();
        students.forEach((s) => {
            if (s.class_level) {
                const label = s.section ? `${s.class_level} - ${s.section}` : s.class_level;
                set.add(label);
            }
        });
        return Array.from(set).sort();
    }, [students]);

    // Grade computation
    function computeGrade(tot: number, subjectId: number): string {
        const subject = subjectById[subjectId];
        const full = subject?.full_marks || 100;
        const pass = subject?.pass_marks ?? 33;
        if (tot < pass) return 'F';
        const percentage = (tot / full) * 100;
        for (const g of gradeBands) {
            if (percentage >= g.min) return g.label;
        }
        return 'F';
    }

    function getTotal(k: string): number | null {
        const m = grid[k];
        if (!m || m.is_absent) return null;
        if (m.written === null && m.mcq === null && m.practical === null) return null;
        const w = Number(m.written) || 0;
        const mc = Number(m.mcq) || 0;
        const p = Number(m.practical) || 0;
        return w + mc + p;
    }

    function getGradeLabel(studentId: number, subjectId: number): string {
        const t = getTotal(key(studentId, subjectId));
        if (t === null) return '—';
        return computeGrade(t, subjectId);
    }

    function updateMark(
        k: string,
        field: 'written' | 'mcq' | 'practical',
        val: string,
    ) {
        const num = val === '' ? null : Math.max(0, Number(val));
        setGrid((prev) => ({
            ...prev,
            [k]: {
                ...(prev[k] ?? { written: null, mcq: null, practical: null, is_absent: false }),
                [field]: num,
            },
        }));
        setHasUnsavedChanges(true);
    }

    function toggleAbsent(studentId: number, isAbsent: boolean) {
        setGrid((prev) => {
            const next = { ...prev };
            for (const subject of subjects) {
                const k = key(studentId, subject.id);
                next[k] = {
                    ...(prev[k] ?? { written: null, mcq: null, practical: null, is_absent: false }),
                    is_absent: isAbsent,
                };
            }
            return next;
        });
        setHasUnsavedChanges(true);
    }

    function markAllPresent() {
        setGrid((prev) => {
            const next = { ...prev };
            for (const student of students) {
                for (const subject of subjects) {
                    const k = key(student.id, subject.id);
                    if (next[k]?.is_absent) {
                        next[k] = { ...next[k], is_absent: false };
                    }
                }
            }
            return next;
        });
        setHasUnsavedChanges(true);
    }

    const save = useCallback(() => {
        setSaving(true);
        const marksPayload: {
            student_id: number;
            subject_id: number;
            written_marks: number | null;
            mcq_marks: number | null;
            practical_marks: number | null;
            is_absent: boolean;
        }[] = [];

        for (const student of students) {
            for (const subject of subjects) {
                const k = key(student.id, subject.id);
                const m = grid[k];
                if (m) {
                    marksPayload.push({
                        student_id: student.id,
                        subject_id: subject.id,
                        written_marks: m.written,
                        mcq_marks: m.mcq,
                        practical_marks: m.practical,
                        is_absent: m.is_absent,
                    });
                }
            }
        }

        router.post(
            `/admin/exams/${exam.id}/marks`,
            { marks: marksPayload },
            {
                onFinish: () => {
                    setSaving(false);
                    setHasUnsavedChanges(false);
                },
            },
        );
    }, [exam.id, grid, students, subjects]);

    // Keyboard shortcut: Ctrl + S or Cmd + S to save
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                save();
            }
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [save]);

    // Filter students by search and class
    const filteredStudents = useMemo(() => {
        return students.filter((s) => {
            if (classFilter !== 'all') {
                const label = s.section ? `${s.class_level} - ${s.section}` : s.class_level;
                if (label !== classFilter) return false;
            }
            if (!searchStudent) return true;
            const q = searchStudent.toLowerCase();
            return (
                s.name_en.toLowerCase().includes(q) ||
                s.roll_number?.toLowerCase().includes(q)
            );
        });
    }, [students, searchStudent, classFilter]);

    // Statistics
    const stats = useMemo(() => {
        let totalEntries = 0;
        let filledEntries = 0;
        let absentCount = 0;

        for (const student of students) {
            const isAbsent = subjects.some((sub) => grid[key(student.id, sub.id)]?.is_absent);
            if (isAbsent) {
                absentCount++;
            }
            for (const subject of subjects) {
                totalEntries++;
                const m = grid[key(student.id, subject.id)];
                if (m && (m.written !== null || m.mcq !== null || m.practical !== null || m.is_absent)) {
                    filledEntries++;
                }
            }
        }

        const completionPercent = totalEntries > 0 ? Math.round((filledEntries / totalEntries) * 100) : 0;
        return {
            totalStudents: students.length,
            subjectsCount: subjects.length,
            absentCount,
            completionPercent,
        };
    }, [students, subjects, grid]);

    // Determine which subjects to display (all or just the selected one)
    const displayedSubjects = useMemo(() => {
        if (selectedSubjectId === 'all') return subjects;
        return subjects.filter((s) => s.id === selectedSubjectId);
    }, [subjects, selectedSubjectId]);

    const isSingleSubject = selectedSubjectId !== 'all';

    // Helper to check if a student is absent
    const checkIsAbsent = useCallback(
        (studentId: number) => {
            return subjects.some((sub) => grid[key(studentId, sub.id)]?.is_absent);
        },
        [subjects, grid],
    );

    // Subject color themes for visual distinction between subject columns
    const subjectThemes = [
        {
            headerBg: 'bg-indigo-50/90 dark:bg-indigo-950/40',
            headerText: 'text-indigo-900 dark:text-indigo-200',
            badgeBg: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300',
            colBg: 'bg-indigo-50/20 dark:bg-indigo-950/10',
            subHeaderBg: 'bg-indigo-50/60 dark:bg-indigo-950/30',
        },
        {
            headerBg: 'bg-emerald-50/90 dark:bg-emerald-950/40',
            headerText: 'text-emerald-900 dark:text-emerald-200',
            badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300',
            colBg: 'bg-emerald-50/20 dark:bg-emerald-950/10',
            subHeaderBg: 'bg-emerald-50/60 dark:bg-emerald-950/30',
        },
        {
            headerBg: 'bg-amber-50/90 dark:bg-amber-950/40',
            headerText: 'text-amber-900 dark:text-amber-200',
            badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300',
            colBg: 'bg-amber-50/20 dark:bg-amber-950/10',
            subHeaderBg: 'bg-amber-50/60 dark:bg-amber-950/30',
        },
        {
            headerBg: 'bg-sky-50/90 dark:bg-sky-950/40',
            headerText: 'text-sky-900 dark:text-sky-200',
            badgeBg: 'bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300',
            colBg: 'bg-sky-50/20 dark:bg-sky-950/10',
            subHeaderBg: 'bg-sky-50/60 dark:bg-sky-950/30',
        },
        {
            headerBg: 'bg-purple-50/90 dark:bg-purple-950/40',
            headerText: 'text-purple-900 dark:text-purple-200',
            badgeBg: 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300',
            colBg: 'bg-purple-50/20 dark:bg-purple-950/10',
            subHeaderBg: 'bg-purple-50/60 dark:bg-purple-950/30',
        },
        {
            headerBg: 'bg-rose-50/90 dark:bg-rose-950/40',
            headerText: 'text-rose-900 dark:text-rose-200',
            badgeBg: 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300',
            colBg: 'bg-rose-50/20 dark:bg-rose-950/10',
            subHeaderBg: 'bg-rose-50/60 dark:bg-rose-950/30',
        },
    ];

    return (
        <DashboardLayout>
            <Head title={`Marks Entry: ${exam.name_en}`} />

            <div className="w-full max-w-full space-y-6">
                {/* Header */}
                <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/admin/exams"
                            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-xs transition hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                            title="Back to exams"
                        >
                            <AppIcon name="arrow-left" className="h-5 w-5" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center rounded-md bg-accent-500/10 px-2 py-0.5 text-xs font-semibold tracking-wider text-accent-700 uppercase dark:bg-accent-500/20 dark:text-accent-300">
                                    Marks Evaluation
                                </span>
                                {hasUnsavedChanges && (
                                    <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 shadow-xs">
                                        <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                                        Unsaved changes
                                    </span>
                                )}
                            </div>
                            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
                                {exam.name_en}
                            </h1>
                            <p className="mt-0.5 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
                                <span>{exam.session_name || 'Academic Session'}</span>
                                {exam.exam_type && (
                                    <>
                                        <span className="mx-2">&middot;</span>
                                        <span className="capitalize">{exam.exam_type}</span>
                                    </>
                                )}
                                {exam.institution_name && (
                                    <>
                                        <span className="mx-2">&middot;</span>
                                        <span>{exam.institution_name}</span>
                                    </>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2.5">
                        <button
                            type="button"
                            onClick={markAllPresent}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 shadow-xs transition hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                            <AppIcon name="check" className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                            Mark All Present
                        </button>

                        <button
                            type="button"
                            disabled={saving}
                            onClick={save}
                            className="inline-flex items-center gap-2 rounded-xl bg-accent-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-700 focus:ring-2 focus:ring-accent-500/30 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:shadow-accent-950/40"
                        >
                            <AppIcon name="check" className="h-4 w-4" />
                            <span>{saving ? 'Saving Marks…' : 'Save Marks'}</span>
                            <kbd className="hidden sm:inline-block rounded bg-accent-700/60 px-1.5 py-0.5 text-[10px] font-mono text-accent-100">
                                ⌘S
                            </kbd>
                        </button>
                    </div>
                </header>

                {/* Metrics / Overview Row */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                    <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Total Students
                        </p>
                        <p className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-50">
                            {stats.totalStudents}
                        </p>
                    </div>
                    <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Subjects
                        </p>
                        <p className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-50">
                            {stats.subjectsCount}
                        </p>
                    </div>
                    <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Progress
                        </p>
                        <div className="mt-1 flex items-baseline gap-2">
                            <span className="text-xl font-bold text-accent-600 dark:text-accent-400">
                                {stats.completionPercent}%
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">recorded</span>
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Absent
                        </p>
                        <p className="mt-1 text-xl font-bold text-rose-600 dark:text-rose-400">
                            {stats.absentCount}
                        </p>
                    </div>
                </div>

                {/* Subject Selector Tabs: Allows switching between All Subjects matrix vs Focused Single Subject */}
                <div className="w-full max-w-full overflow-hidden rounded-xl border border-slate-200/80 bg-white p-2 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-thin">
                        <span className="px-2.5 py-1 text-xs font-semibold text-slate-400 dark:text-slate-500 whitespace-nowrap">
                            Subject View:
                        </span>
                        <button
                            type="button"
                            onClick={() => setSelectedSubjectId('all')}
                            className={`rounded-lg px-3 py-1.5 font-semibold whitespace-nowrap transition ${
                                selectedSubjectId === 'all'
                                    ? 'bg-accent-600 text-white shadow-xs'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                            }`}
                        >
                            All Subjects ({subjects.length})
                        </button>
                        {subjects.map((sub, idx) => {
                            const isSelected = selectedSubjectId === sub.id;
                            const theme = subjectThemes[idx % subjectThemes.length];
                            return (
                                <button
                                    key={sub.id}
                                    type="button"
                                    onClick={() => setSelectedSubjectId(sub.id)}
                                    className={`rounded-lg px-3 py-1.5 font-medium whitespace-nowrap transition flex items-center gap-1.5 ${
                                        isSelected
                                            ? 'bg-accent-600 text-white shadow-xs'
                                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    <span className="h-2 w-2 rounded-full bg-accent-500" />
                                    <span>{sub.name_en}</span>
                                    <span className="opacity-75 text-[11px]">({sub.full_marks})</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Filter and Table Container */}
                <section className="w-full max-w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    {/* Secondary Filters Bar */}
                    <div className="flex flex-col gap-3 border-b border-slate-200/80 p-3.5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
                        <div className="flex flex-1 flex-wrap items-center gap-2.5">
                            {/* Student Search */}
                            <label className="relative flex min-w-[200px] flex-1 items-center sm:max-w-xs">
                                <AppIcon
                                    name="search"
                                    className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400 dark:text-slate-500"
                                />
                                <input
                                    value={searchStudent}
                                    onChange={(e) => setSearchStudent(e.target.value)}
                                    type="search"
                                    placeholder="Search student or roll…"
                                    className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/50 pr-3 pl-9 text-xs text-slate-900 placeholder-slate-400 transition focus:border-accent-500 focus:bg-white focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:bg-slate-900"
                                />
                                {searchStudent && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchStudent('')}
                                        className="absolute right-2.5 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                                    >
                                        <AppIcon name="close" className="h-3.5 w-3.5" />
                                    </button>
                                )}
                            </label>

                            {/* Class Filter */}
                            {availableClasses.length > 0 && (
                                <select
                                    value={classFilter}
                                    onChange={(e) => setClassFilter(e.target.value)}
                                    className="h-9 rounded-lg border border-slate-200 bg-slate-50/50 px-2.5 text-xs font-medium text-slate-700 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 [&>option]:bg-white dark:[&>option]:bg-slate-900"
                                >
                                    <option value="all">All Classes</option>
                                    {availableClasses.map((c) => (
                                        <option key={c} value={c}>
                                            Class: {c}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
                            <span>
                                Showing <strong className="text-slate-800 dark:text-slate-200">{filteredStudents.length}</strong> of {students.length} students
                            </span>
                            {isSingleSubject ? (
                                <span className="rounded-md bg-accent-50 px-2 py-0.5 font-medium text-accent-700 dark:bg-accent-950/60 dark:text-accent-300">
                                    Single Subject View
                                </span>
                            ) : (
                                <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                    All Subjects Matrix ({subjects.length} subjects)
                                </span>
                            )}

                            {/* Quick Drag & Click Scroll Controls */}
                            <div className="flex items-center gap-1 ml-1 sm:border-l sm:border-slate-200 sm:pl-2.5 dark:sm:border-slate-800">
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
                        </div>
                    </div>

                    {/* Table Viewport with Controlled Drag Scroll and Zero Screen Shift */}
                    <div className="relative w-full max-w-full">
                        {/* Shadow indicator on left edge after pinned student column */}
                        {canScrollLeft && (
                            <div className="pointer-events-none absolute inset-y-0 left-[16.25rem] w-6 bg-gradient-to-r from-black/10 to-transparent z-25 dark:from-black/40" />
                        )}
                        {/* Shadow indicator on right edge when more content can be scrolled */}
                        {canScrollRight && (
                            <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/10 to-transparent z-25 dark:from-black/40" />
                        )}

                        <div
                            ref={tableScrollRef}
                            className={`w-full max-w-full overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 transition-colors ${
                                isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'
                            }`}
                        >
                            <table className="min-w-max w-full text-left text-sm border-separate border-spacing-0">
                            {/* Sticky Table Header */}
                            <thead className="sticky top-0 z-30">
                                {/* Top Header Row */}
                                <tr>
                                    {/* Pinned Roll Column Header (spans 2 rows) */}
                                    <th
                                        rowSpan={2}
                                        className="sticky left-0 top-0 z-40 w-16 min-w-[4.25rem] max-w-[4.25rem] bg-slate-100 dark:bg-slate-900 border-b-2 border-r border-slate-300 dark:border-slate-700 px-3 py-3 text-center text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider"
                                    >
                                        Roll
                                    </th>

                                    {/* Pinned Student Name Column Header (spans 2 rows) */}
                                    <th
                                        rowSpan={2}
                                        className="sticky left-[4.25rem] top-0 z-40 w-48 min-w-[12rem] max-w-[12rem] bg-slate-100 dark:bg-slate-900 border-b-2 border-r-2 border-slate-300 dark:border-slate-700 px-4 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider shadow-[4px_0_10px_-2px_rgba(0,0,0,0.06)] dark:shadow-[4px_0_10px_-2px_rgba(0,0,0,0.4)]"
                                    >
                                        Student Name
                                    </th>

                                    {/* Subjects Group Headers */}
                                    {displayedSubjects.map((subject, idx) => {
                                        const theme = subjectThemes[idx % subjectThemes.length];
                                        return (
                                            <th
                                                key={subject.id}
                                                colSpan={5}
                                                className={`border-b border-r-2 border-slate-300 dark:border-slate-700 px-4 py-2.5 text-center ${theme.headerBg}`}
                                            >
                                                <div className="flex items-center justify-center gap-2">
                                                    <span className={`font-bold text-sm ${theme.headerText}`}>
                                                        {subject.name_en}
                                                    </span>
                                                    <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${theme.badgeBg}`}>
                                                        Full: {subject.full_marks} / Pass: {subject.pass_marks}
                                                    </span>
                                                </div>
                                            </th>
                                        );
                                    })}

                                    {/* Absent Status Header (spans 2 rows) */}
                                    <th
                                        rowSpan={2}
                                        className="w-20 min-w-[5rem] max-w-[5rem] bg-slate-100 dark:bg-slate-900 border-b-2 border-slate-300 dark:border-slate-700 px-3 py-3 text-center text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider"
                                    >
                                        Absent
                                    </th>
                                </tr>

                                {/* Sub Header Row: Sub-component Mark Columns */}
                                <tr>
                                    {displayedSubjects.map((subject, idx) => {
                                        const theme = subjectThemes[idx % subjectThemes.length];
                                        return (
                                            <Fragment key={subject.id}>
                                                <th className={`w-20 min-w-[5rem] px-2 py-2 text-center text-[11px] font-semibold text-slate-600 dark:text-slate-400 border-b-2 border-slate-300 dark:border-slate-700 ${theme.subHeaderBg}`}>
                                                    Theory
                                                </th>
                                                <th className={`w-20 min-w-[5rem] px-2 py-2 text-center text-[11px] font-semibold text-slate-600 dark:text-slate-400 border-b-2 border-slate-300 dark:border-slate-700 ${theme.subHeaderBg}`}>
                                                    MCQ
                                                </th>
                                                <th className={`w-20 min-w-[5rem] px-2 py-2 text-center text-[11px] font-semibold text-slate-600 dark:text-slate-400 border-b-2 border-slate-300 dark:border-slate-700 ${theme.subHeaderBg}`}>
                                                    Prac.
                                                </th>
                                                <th className="w-18 min-w-[4.5rem] px-2 py-2 text-center text-[11px] font-bold text-slate-800 dark:text-slate-200 bg-slate-100/90 dark:bg-slate-800 border-b-2 border-slate-300 dark:border-slate-700">
                                                    Total
                                                </th>
                                                <th className="w-18 min-w-[4.5rem] border-r-2 border-b-2 border-slate-300 dark:border-slate-700 px-2 py-2 text-center text-[11px] font-bold text-slate-800 dark:text-slate-200 bg-slate-100/90 dark:bg-slate-800">
                                                    Grade
                                                </th>
                                            </Fragment>
                                        );
                                    })}
                                </tr>
                            </thead>

                            {/* Table Body */}
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                                {filteredStudents.map((student) => {
                                    const isStudentAbsent = checkIsAbsent(student.id);

                                    return (
                                        <tr
                                            key={student.id}
                                            className={`group transition-colors duration-150 ${
                                                isStudentAbsent
                                                    ? 'bg-rose-50/50 dark:bg-rose-950/25'
                                                    : 'hover:bg-accent-50/40 dark:hover:bg-accent-950/20'
                                            }`}
                                        >
                                            {/* Pinned Roll Number */}
                                            <td className="sticky left-0 z-20 w-16 min-w-[4.25rem] max-w-[4.25rem] bg-white dark:bg-slate-900 px-3 py-3 text-center font-mono text-xs font-semibold text-slate-700 dark:text-slate-200 border-r border-b border-slate-200 dark:border-slate-800 transition-colors duration-150 group-hover:bg-slate-50 dark:group-hover:bg-slate-800">
                                                {student.roll_number || '—'}
                                            </td>

                                            {/* Pinned Student Name */}
                                            <td className="sticky left-[4.25rem] z-20 w-48 min-w-[12rem] max-w-[12rem] bg-white dark:bg-slate-900 px-4 py-3 border-r-2 border-b border-slate-300 dark:border-slate-700 shadow-[4px_0_10px_-2px_rgba(0,0,0,0.06)] dark:shadow-[4px_0_10px_-2px_rgba(0,0,0,0.4)] transition-colors duration-150 group-hover:bg-slate-50 dark:group-hover:bg-slate-800">
                                                <div className="min-w-0">
                                                    <p className="truncate font-semibold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                                                        {student.name_en}
                                                    </p>
                                                    {student.class_level && (
                                                        <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                                                            Class: {student.class_level}
                                                            {student.section ? ` (${student.section})` : ''}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Subject Mark Entries */}
                                            {displayedSubjects.map((subject, idx) => {
                                                const theme = subjectThemes[idx % subjectThemes.length];
                                                const k = key(student.id, subject.id);
                                                const m = grid[k] ?? {
                                                    written: null,
                                                    mcq: null,
                                                    practical: null,
                                                    is_absent: false,
                                                };
                                                const gl = getGradeLabel(student.id, subject.id);
                                                const tot = getTotal(k);

                                                return (
                                                    <Fragment key={subject.id}>
                                                        {/* Written Marks */}
                                                        <td className={`px-2 py-2.5 text-center border-b border-slate-200 dark:border-slate-800 ${theme.colBg}`}>
                                                            <input
                                                                value={m.written ?? ''}
                                                                onChange={(e) =>
                                                                    updateMark(k, 'written', e.target.value)
                                                                }
                                                                type="number"
                                                                min="0"
                                                                max={subject.full_marks}
                                                                placeholder="—"
                                                                disabled={isStudentAbsent}
                                                                className="h-8 w-16 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-1 text-center font-mono text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-300 dark:placeholder-slate-600 shadow-2xs transition-all hover:border-slate-400 dark:hover:border-slate-500 focus:border-accent-500 focus:bg-white focus:ring-2 focus:ring-accent-500/25 focus:outline-none dark:focus:bg-slate-900 disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-950 disabled:opacity-40"
                                                            />
                                                        </td>

                                                        {/* MCQ Marks */}
                                                        <td className={`px-2 py-2.5 text-center border-b border-slate-200 dark:border-slate-800 ${theme.colBg}`}>
                                                            <input
                                                                value={m.mcq ?? ''}
                                                                onChange={(e) =>
                                                                    updateMark(k, 'mcq', e.target.value)
                                                                }
                                                                type="number"
                                                                min="0"
                                                                max={subject.full_marks}
                                                                placeholder="—"
                                                                disabled={isStudentAbsent}
                                                                className="h-8 w-16 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-1 text-center font-mono text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-300 dark:placeholder-slate-600 shadow-2xs transition-all hover:border-slate-400 dark:hover:border-slate-500 focus:border-accent-500 focus:bg-white focus:ring-2 focus:ring-accent-500/25 focus:outline-none dark:focus:bg-slate-900 disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-950 disabled:opacity-40"
                                                            />
                                                        </td>

                                                        {/* Practical Marks */}
                                                        <td className={`px-2 py-2.5 text-center border-b border-slate-200 dark:border-slate-800 ${theme.colBg}`}>
                                                            <input
                                                                value={m.practical ?? ''}
                                                                onChange={(e) =>
                                                                    updateMark(k, 'practical', e.target.value)
                                                                }
                                                                type="number"
                                                                min="0"
                                                                max={subject.full_marks}
                                                                placeholder="—"
                                                                disabled={isStudentAbsent}
                                                                className="h-8 w-16 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-1 text-center font-mono text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-300 dark:placeholder-slate-600 shadow-2xs transition-all hover:border-slate-400 dark:hover:border-slate-500 focus:border-accent-500 focus:bg-white focus:ring-2 focus:ring-accent-500/25 focus:outline-none dark:focus:bg-slate-900 disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-950 disabled:opacity-40"
                                                            />
                                                        </td>

                                                        {/* Total Marks */}
                                                        <td className="px-2 py-2.5 text-center bg-slate-50/70 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800">
                                                            <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                                                                {isStudentAbsent ? (
                                                                    <span className="text-rose-500 dark:text-rose-400">ABS</span>
                                                                ) : tot !== null ? (
                                                                    tot
                                                                ) : (
                                                                    <span className="text-slate-300 dark:text-slate-600">—</span>
                                                                )}
                                                            </span>
                                                        </td>

                                                        {/* Grade Label with Distinct Group Border */}
                                                        <td className="border-r-2 border-b border-slate-300 dark:border-slate-700 px-2 py-2.5 text-center bg-slate-50/70 dark:bg-slate-900/60">
                                                            {isStudentAbsent ? (
                                                                <span className="inline-flex rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                                                                    F
                                                                </span>
                                                            ) : gl !== '—' ? (
                                                                <span
                                                                    className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                                                                        gl === 'F'
                                                                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                                                                            : gl === 'A+' || gl === 'A'
                                                                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                                                                              : gl === 'A-' || gl === 'B'
                                                                                ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300 border-sky-300 dark:border-sky-800'
                                                                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                                                                    }`}
                                                                >
                                                                    {gl}
                                                                </span>
                                                            ) : (
                                                                <span className="text-slate-300 dark:text-slate-600">—</span>
                                                            )}
                                                        </td>
                                                    </Fragment>
                                                );
                                            })}

                                            {/* Absent Checkbox */}
                                            <td className="px-3 py-2.5 text-center border-b border-slate-200 dark:border-slate-800">
                                                <input
                                                    checked={isStudentAbsent}
                                                    onChange={(e) =>
                                                        toggleAbsent(student.id, e.target.checked)
                                                    }
                                                    type="checkbox"
                                                    title={`Mark ${student.name_en} absent`}
                                                    className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500 dark:border-slate-700 dark:bg-slate-950 dark:checked:bg-rose-600 cursor-pointer"
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}

                                {filteredStudents.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={2 + displayedSubjects.length * 5 + 1}
                                            className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400"
                                        >
                                            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                                                <AppIcon name="search" className="h-5 w-5" />
                                            </div>
                                            <p className="mt-2 font-medium text-slate-800 dark:text-slate-200">
                                                No students found
                                            </p>
                                            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                                {searchStudent || classFilter !== 'all'
                                                    ? 'Try adjusting your search query or class filter.'
                                                    : 'No students enrolled for this exam.'}
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Bottom Action Footer with Unsaved Status & Save Button */}
                    <div className="flex flex-col gap-3 border-t border-slate-200/80 bg-slate-50/60 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-950/40">
                        <div className="flex items-center gap-2">
                            {hasUnsavedChanges ? (
                                <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
                                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                                    You have unsaved changes. Don't forget to save before leaving.
                                </span>
                            ) : (
                                <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                                    <AppIcon name="check" className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                    All marks are saved.
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <Link
                                href="/admin/exams"
                                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100"
                            >
                                Back to exams
                            </Link>

                            <button
                                type="button"
                                disabled={saving}
                                onClick={save}
                                className="inline-flex items-center gap-2 rounded-xl bg-accent-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-accent-700 focus:ring-2 focus:ring-accent-500/30 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:shadow-accent-950/40"
                            >
                                <AppIcon name="check" className="h-3.5 w-3.5" />
                                {saving ? 'Saving…' : 'Save Marks'}
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </DashboardLayout>
    );
}
