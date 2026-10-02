import { Head, Link, router } from '@inertiajs/react';
import { Fragment, useEffect, useMemo, useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import AppIcon from '@/components/AppIcon';
import { useSidebarStack } from '@/composables/useNavStack';
import type { SidebarConfig } from '@/types/sidebar';

interface MarkData {
    written: number | null;
    mcq: number | null;
    practical: number | null;
    is_absent: boolean;
}

interface Props {
    exam: {
        id: number;
        name_en: string;
        name_bn: string;
        exam_type: string;
        institution_name: string;
        session_name: string;
    };
    subjects: {
        id: number;
        name_en: string;
        full_marks: number;
        pass_marks: number;
    }[];
    students: { id: number; name_en: string; roll_number: string }[];
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

    const [saving, setSaving] = useState(false);

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
        const num = val === '' ? null : Number(val);
        setGrid((prev) => ({
            ...prev,
            [k]: {
                ...(prev[k] ?? { written: null, mcq: null, practical: null, is_absent: false }),
                [field]: num,
            },
        }));
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
    }

    function save() {
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
                },
            },
        );
    }

    return (
        <DashboardLayout>
            <Head title={`Marks Entry - ${exam.name_en}`} />

            <div className="space-y-6">
                <header className="flex items-center gap-4">
                    <Link
                        href="/admin/exams"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                    >
                        <AppIcon name="arrow-left" className="h-5 w-5" />
                    </Link>
                    <div>
                        <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase dark:text-slate-400">
                            Marks entry
                        </p>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
                            {exam.name_en}
                        </h1>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            {exam.institution_name} &middot; {exam.session_name} &middot; {exam.exam_type}
                        </p>
                    </div>
                </header>

                <section className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
                            <thead className="bg-slate-50 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase dark:bg-slate-950/40 dark:text-slate-400">
                                <tr>
                                    <th className="sticky left-0 z-10 bg-slate-50 px-4 py-3 dark:bg-slate-950/40">
                                        Roll
                                    </th>
                                    <th className="sticky left-0 z-10 bg-slate-50 px-4 py-3 dark:bg-slate-950/40">
                                        Student
                                    </th>
                                    {subjects.map((subject) => (
                                        <th
                                            key={subject.id}
                                            className="px-4 py-3 text-center"
                                            colSpan={5}
                                        >
                                            {subject.name_en}
                                        </th>
                                    ))}
                                    <th className="px-4 py-3 text-center">Status</th>
                                </tr>
                                <tr className="text-xs text-slate-400 dark:text-slate-500">
                                    <th className="px-4 py-2"></th>
                                    <th className="px-4 py-2"></th>
                                    {subjects.map((subject) => (
                                        <Fragment key={subject.id}>
                                            <th className="px-2 py-2 text-center font-normal">
                                                Written
                                            </th>
                                            <th className="px-2 py-2 text-center font-normal">
                                                MCQ
                                            </th>
                                            <th className="px-2 py-2 text-center font-normal">
                                                Practical
                                            </th>
                                            <th className="px-2 py-2 text-center font-normal">
                                                Total
                                            </th>
                                            <th className="px-2 py-2 text-center font-normal">
                                                Grade
                                            </th>
                                        </Fragment>
                                    ))}
                                    <th className="px-2 py-2 text-center font-normal">
                                        Absent
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {students.map((student) => {
                                    const firstSubjectId = subjects[0]?.id ?? 0;
                                    const firstKey = key(student.id, firstSubjectId);
                                    const isStudentAbsent = grid[firstKey]?.is_absent ?? false;

                                    return (
                                        <tr
                                            key={student.id}
                                            className="text-slate-700 hover:bg-slate-50/60 dark:text-slate-200 dark:hover:bg-slate-800/40"
                                        >
                                            <td className="sticky left-0 z-10 bg-white px-4 py-3 font-mono text-xs dark:bg-slate-900">
                                                {student.roll_number}
                                            </td>
                                            <td className="sticky left-0 z-10 bg-white px-4 py-3 font-medium text-slate-900 dark:bg-slate-900 dark:text-slate-100">
                                                {student.name_en}
                                            </td>
                                            {subjects.map((subject) => {
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
                                                        <td className="px-2 py-3">
                                                            <input
                                                                value={m.written ?? ''}
                                                                onChange={(e) =>
                                                                    updateMark(k, 'written', e.target.value)
                                                                }
                                                                type="number"
                                                                min="0"
                                                                max="100"
                                                                className="h-8 w-16 rounded border border-slate-200 bg-white px-2 text-center text-xs text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 disabled:opacity-50"
                                                                disabled={m.is_absent}
                                                            />
                                                        </td>
                                                        <td className="px-2 py-3">
                                                            <input
                                                                value={m.mcq ?? ''}
                                                                onChange={(e) =>
                                                                    updateMark(k, 'mcq', e.target.value)
                                                                }
                                                                type="number"
                                                                min="0"
                                                                max="100"
                                                                className="h-8 w-16 rounded border border-slate-200 bg-white px-2 text-center text-xs text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 disabled:opacity-50"
                                                                disabled={m.is_absent}
                                                            />
                                                        </td>
                                                        <td className="px-2 py-3">
                                                            <input
                                                                value={m.practical ?? ''}
                                                                onChange={(e) =>
                                                                    updateMark(k, 'practical', e.target.value)
                                                                }
                                                                type="number"
                                                                min="0"
                                                                max="100"
                                                                className="h-8 w-16 rounded border border-slate-200 bg-white px-2 text-center text-xs text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 disabled:opacity-50"
                                                                disabled={m.is_absent}
                                                            />
                                                        </td>
                                                        <td className="px-2 py-3 text-center font-mono text-xs font-semibold text-slate-900 dark:text-slate-100">
                                                            {tot !== null ? tot : <span className="text-slate-400">—</span>}
                                                        </td>
                                                        <td className="px-2 py-3 text-center">
                                                            <span
                                                                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                                                    gl === 'F'
                                                                        ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                                                                        : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                                                }`}
                                                            >
                                                                {gl}
                                                            </span>
                                                        </td>
                                                    </Fragment>
                                                );
                                            })}
                                            <td className="px-2 py-3 text-center">
                                                <input
                                                    checked={isStudentAbsent}
                                                    onChange={(e) =>
                                                        toggleAbsent(student.id, e.target.checked)
                                                    }
                                                    type="checkbox"
                                                    className="h-4 w-4 rounded border-slate-300 text-accent-600 focus:ring-accent-500 dark:border-slate-600"
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                                {students.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={2 + subjects.length * 5 + 1}
                                            className="px-4 py-12 text-center text-sm text-slate-500 dark:text-slate-400"
                                        >
                                            No students found for this exam.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        disabled={saving}
                        className="inline-flex items-center gap-1.5 rounded-md bg-accent-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={save}
                    >
                        <AppIcon name="check" className="h-4 w-4" />
                        {saving ? 'Saving…' : 'Save marks'}
                    </button>
                    <Link
                        href="/admin/exams"
                        className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                        Back to exams
                    </Link>
                </div>
            </div>
        </DashboardLayout>
    );
}
