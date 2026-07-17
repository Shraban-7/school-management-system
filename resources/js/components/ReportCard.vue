<script setup lang="ts">
import { Link } from '@inertiajs/vue3';
import AppIcon from '@/components/AppIcon.vue';

interface SubjectRow {
    subject_id: number;
    subject_en: string | null;
    full_marks: number;
    pass_marks: number;
    written_marks: number | null;
    mcq_marks: number | null;
    practical_marks: number | null;
    total: number | null;
    grade: string;
    point: number;
    passed: boolean;
    is_absent: boolean;
}

export interface Report {
    institution: {
        name_en: string | null;
        name_bn: string | null;
        eiin_number: number | null;
        board_affiliation: string | null;
    };
    exam: {
        id: number;
        name_en: string;
        name_bn: string | null;
        exam_type: string;
        session_name: string | null;
    };
    student: {
        id: number;
        name_en: string;
        name_bn: string | null;
        roll_number: string | null;
        class_label: string | null;
        father_name: string | null;
        mother_name: string | null;
    };
    subjects: SubjectRow[];
    summary: {
        gpa: number | null;
        grade: string;
        passed: boolean | null;
        total: number;
        full_total: number;
        subject_count: number;
        failed_count: number;
        has_marks: boolean;
    };
}

defineProps<{
    report: Report;
    backHref: string;
    pdfHref: string;
}>();

function fmt(value: number | null): string {
    if (value === null || value === undefined) return '—';
    return String(Math.round(value * 10) / 10);
}
</script>

<template>
    <div class="space-y-6">
        <header class="flex items-center justify-between gap-4">
            <div class="flex items-center gap-4">
                <Link
                    :href="backHref"
                    class="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                >
                    <AppIcon name="arrow-left" class="h-5 w-5" />
                </Link>
                <div>
                    <p
                        class="text-xs font-semibold tracking-widest text-slate-500 uppercase dark:text-slate-400"
                    >
                        Gradesheet
                    </p>
                    <h1
                        class="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50"
                    >
                        {{ report.student.name_en }}
                    </h1>
                    <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        {{ report.exam.name_en }}
                    </p>
                </div>
            </div>
            <a
                :href="pdfHref"
                class="inline-flex items-center gap-1.5 rounded-md bg-accent-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-700"
            >
                <AppIcon name="download" class="h-4 w-4" />
                Download PDF
            </a>
        </header>

        <section
            class="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
            <div
                class="border-b border-slate-200 p-6 text-center dark:border-slate-800"
            >
                <h2
                    class="text-xl font-bold text-slate-900 dark:text-slate-50"
                >
                    {{ report.institution.name_en }}
                </h2>
                <p
                    v-if="report.institution.name_bn"
                    class="text-sm text-slate-600 dark:text-slate-400"
                >
                    {{ report.institution.name_bn }}
                </p>
                <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    <span v-if="report.institution.eiin_number"
                        >EIIN: {{ report.institution.eiin_number }}</span
                    >
                    <span v-if="report.institution.board_affiliation">
                        &middot; Board:
                        {{ report.institution.board_affiliation }}</span
                    >
                </p>
                <p
                    class="mt-3 text-sm font-semibold tracking-wide text-slate-700 uppercase dark:text-slate-200"
                >
                    Academic Transcript
                </p>
            </div>

            <dl
                class="grid grid-cols-2 gap-x-6 gap-y-2 p-6 text-sm sm:grid-cols-4"
            >
                <div>
                    <dt class="text-xs text-slate-500 dark:text-slate-400">
                        Roll
                    </dt>
                    <dd class="font-medium text-slate-900 dark:text-slate-100">
                        {{ report.student.roll_number ?? '—' }}
                    </dd>
                </div>
                <div>
                    <dt class="text-xs text-slate-500 dark:text-slate-400">
                        Class
                    </dt>
                    <dd class="font-medium text-slate-900 dark:text-slate-100">
                        {{ report.student.class_label ?? '—' }}
                    </dd>
                </div>
                <div>
                    <dt class="text-xs text-slate-500 dark:text-slate-400">
                        Session
                    </dt>
                    <dd class="font-medium text-slate-900 dark:text-slate-100">
                        {{ report.exam.session_name ?? '—' }}
                    </dd>
                </div>
                <div>
                    <dt class="text-xs text-slate-500 dark:text-slate-400">
                        Exam type
                    </dt>
                    <dd class="font-medium text-slate-900 dark:text-slate-100">
                        {{ report.exam.exam_type }}
                    </dd>
                </div>
            </dl>

            <div v-if="!report.summary.has_marks" class="px-6 pb-8">
                <p
                    class="rounded-lg border border-dashed border-slate-300 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400"
                >
                    No marks have been recorded for this student in this exam.
                </p>
            </div>

            <template v-else>
                <div class="overflow-x-auto px-6">
                    <table
                        class="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800"
                    >
                        <thead
                            class="text-left text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400"
                        >
                            <tr>
                                <th class="py-3 pr-4">Subject</th>
                                <th class="px-3 py-3 text-center">Written</th>
                                <th class="px-3 py-3 text-center">MCQ</th>
                                <th class="px-3 py-3 text-center">Practical</th>
                                <th class="px-3 py-3 text-center">Total</th>
                                <th class="px-3 py-3 text-center">Full</th>
                                <th class="px-3 py-3 text-center">Grade</th>
                                <th class="px-3 py-3 text-center">Point</th>
                            </tr>
                        </thead>
                        <tbody
                            class="divide-y divide-slate-100 dark:divide-slate-800"
                        >
                            <tr
                                v-for="s in report.subjects"
                                :key="s.subject_id"
                                class="text-slate-700 dark:text-slate-200"
                            >
                                <td
                                    class="py-3 pr-4 font-medium text-slate-900 dark:text-slate-100"
                                >
                                    {{ s.subject_en }}
                                </td>
                                <td class="px-3 py-3 text-center font-mono text-xs">
                                    {{ s.is_absent ? '—' : fmt(s.written_marks) }}
                                </td>
                                <td class="px-3 py-3 text-center font-mono text-xs">
                                    {{ s.is_absent ? '—' : fmt(s.mcq_marks) }}
                                </td>
                                <td class="px-3 py-3 text-center font-mono text-xs">
                                    {{
                                        s.is_absent
                                            ? '—'
                                            : fmt(s.practical_marks)
                                    }}
                                </td>
                                <td
                                    class="px-3 py-3 text-center font-mono text-xs font-semibold"
                                >
                                    {{ s.is_absent ? 'Abs' : fmt(s.total) }}
                                </td>
                                <td class="px-3 py-3 text-center font-mono text-xs">
                                    {{ fmt(s.full_marks) }}
                                </td>
                                <td class="px-3 py-3 text-center">
                                    <span
                                        :class="[
                                            'inline-flex rounded-full px-2 py-0.5 text-xs font-semibold',
                                            s.passed
                                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
                                        ]"
                                    >
                                        {{ s.grade }}
                                    </span>
                                </td>
                                <td
                                    class="px-3 py-3 text-center font-mono text-xs"
                                >
                                    {{ s.point.toFixed(2) }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div
                    class="m-6 grid grid-cols-2 gap-4 rounded-lg bg-slate-50 p-5 sm:grid-cols-4 dark:bg-slate-950/40"
                >
                    <div>
                        <p class="text-xs text-slate-500 dark:text-slate-400">
                            Total marks
                        </p>
                        <p
                            class="text-lg font-bold text-slate-900 dark:text-slate-100"
                        >
                            {{ fmt(report.summary.total) }} /
                            {{ fmt(report.summary.full_total) }}
                        </p>
                    </div>
                    <div>
                        <p class="text-xs text-slate-500 dark:text-slate-400">
                            GPA
                        </p>
                        <p
                            class="text-lg font-bold text-slate-900 dark:text-slate-100"
                        >
                            {{
                                report.summary.gpa === null
                                    ? '—'
                                    : report.summary.gpa.toFixed(2)
                            }}
                        </p>
                    </div>
                    <div>
                        <p class="text-xs text-slate-500 dark:text-slate-400">
                            Letter grade
                        </p>
                        <p
                            class="text-lg font-bold text-slate-900 dark:text-slate-100"
                        >
                            {{ report.summary.grade }}
                        </p>
                    </div>
                    <div>
                        <p class="text-xs text-slate-500 dark:text-slate-400">
                            Result
                        </p>
                        <p
                            :class="[
                                'text-lg font-bold',
                                report.summary.passed
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : 'text-rose-600 dark:text-rose-400',
                            ]"
                        >
                            {{ report.summary.passed ? 'PASSED' : 'FAILED' }}
                        </p>
                    </div>
                </div>
            </template>
        </section>
    </div>
</template>
