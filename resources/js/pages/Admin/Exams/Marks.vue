<script setup lang="ts">
import { Head, Link, router } from '@inertiajs/vue3';
import { computed, reactive, ref } from 'vue';
import DashboardLayout from '@/layouts/DashboardLayout.vue';
import AppIcon from '@/components/AppIcon.vue';
import { useSidebarStack } from '@/composables/useNavStack';
import type { SidebarConfig } from '@/types/sidebar';

defineOptions({ layout: DashboardLayout });

interface MarkData {
    written: number | null;
    mcq: number | null;
    practical: number | null;
    is_absent: boolean;
}

const props = defineProps<{
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
}>();

const sidebarStack = useSidebarStack();
sidebarStack.set(props.sidebar);

const gradeBands = [
    { min: 80, label: 'A+' },
    { min: 70, label: 'A' },
    { min: 60, label: 'A-' },
    { min: 50, label: 'B' },
    { min: 40, label: 'C' },
    { min: 33, label: 'D' },
    { min: 0, label: 'F' },
];

const subjectById = computed(() =>
    Object.fromEntries(props.subjects.map((s) => [s.id, s])),
);

function computeGrade(total: number, subjectId: number): string {
    const subject = subjectById.value[subjectId];
    const full = subject?.full_marks || 100;
    const pass = subject?.pass_marks ?? 33;
    if (total < pass) return 'F';
    const percentage = (total / full) * 100;
    for (const g of gradeBands) {
        if (percentage >= g.min) return g.label;
    }
    return 'F';
}

function key(studentId: number, subjectId: number): string {
    return `${studentId}-${subjectId}`;
}

const grid = reactive<Record<string, MarkData>>({});

for (const student of props.students) {
    for (const subject of props.subjects) {
        const k = key(student.id, subject.id);
        const existing = props.marks[k];
        grid[k] = existing
            ? { ...existing }
            : { written: null, mcq: null, practical: null, is_absent: false };
    }
}

function total(k: string): number | null {
    const m = grid[k];
    if (!m || m.is_absent) return null;
    const w = Number(m.written) || 0;
    const mc = Number(m.mcq) || 0;
    const p = Number(m.practical) || 0;
    return w + mc + p;
}

function gradeLabel(studentId: number, subjectId: number): string {
    const t = total(key(studentId, subjectId));
    if (t === null) return '—';
    return computeGrade(t, subjectId);
}

const saving = ref(false);

function save() {
    saving.value = true;
    const marks: {
        student_id: number;
        subject_id: number;
        written_marks: number | null;
        mcq_marks: number | null;
        practical_marks: number | null;
        is_absent: boolean;
    }[] = [];
    for (const student of props.students) {
        for (const subject of props.subjects) {
            const k = key(student.id, subject.id);
            const m = grid[k];
            if (m) {
                marks.push({
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
        `/admin/exams/${props.exam.id}/marks`,
        { marks },
        {
            onFinish: () => {
                saving.value = false;
            },
        },
    );
}
</script>

<template>
    <div>
        <Head :title="`Marks Entry - ${exam.name_en}`" />

        <div class="space-y-6">
            <header class="flex items-center gap-4">
                <Link
                    href="/admin/exams"
                    class="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                >
                    <AppIcon name="arrow-left" class="h-5 w-5" />
                </Link>
                <div>
                    <p
                        class="text-xs font-semibold tracking-widest text-slate-500 uppercase dark:text-slate-400"
                    >
                        Marks entry
                    </p>
                    <h1
                        class="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50"
                    >
                        {{ exam.name_en }}
                    </h1>
                    <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        {{ exam.institution_name }} &middot;
                        {{ exam.session_name }} &middot; {{ exam.exam_type }}
                    </p>
                </div>
            </header>

            <section
                class="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
                <div class="overflow-x-auto">
                    <table
                        class="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800"
                    >
                        <thead
                            class="bg-slate-50 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase dark:bg-slate-950/40 dark:text-slate-400"
                        >
                            <tr>
                                <th
                                    class="sticky left-0 z-10 bg-slate-50 px-4 py-3 dark:bg-slate-950/40"
                                >
                                    Roll
                                </th>
                                <th
                                    class="sticky left-0 z-10 bg-slate-50 px-4 py-3 dark:bg-slate-950/40"
                                >
                                    Student
                                </th>
                                <template
                                    v-for="subject in subjects"
                                    :key="subject.id"
                                >
                                    <th
                                        class="px-4 py-3 text-center"
                                        colspan="5"
                                    >
                                        {{ subject.name_en }}
                                    </th>
                                </template>
                                <th class="px-4 py-3 text-center">Status</th>
                            </tr>
                            <tr
                                class="text-xs text-slate-400 dark:text-slate-500"
                            >
                                <th class="px-4 py-2"></th>
                                <th class="px-4 py-2"></th>
                                <template
                                    v-for="subject in subjects"
                                    :key="subject.id"
                                >
                                    <th
                                        class="px-2 py-2 text-center font-normal"
                                    >
                                        Written
                                    </th>
                                    <th
                                        class="px-2 py-2 text-center font-normal"
                                    >
                                        MCQ
                                    </th>
                                    <th
                                        class="px-2 py-2 text-center font-normal"
                                    >
                                        Practical
                                    </th>
                                    <th
                                        class="px-2 py-2 text-center font-normal"
                                    >
                                        Total
                                    </th>
                                    <th
                                        class="px-2 py-2 text-center font-normal"
                                    >
                                        Grade
                                    </th>
                                </template>
                                <th class="px-2 py-2 text-center font-normal">
                                    Absent
                                </th>
                            </tr>
                        </thead>
                        <tbody
                            class="divide-y divide-slate-100 dark:divide-slate-800"
                        >
                            <tr
                                v-for="student in students"
                                :key="student.id"
                                class="text-slate-700 hover:bg-slate-50/60 dark:text-slate-200 dark:hover:bg-slate-800/40"
                            >
                                <td
                                    class="sticky left-0 z-10 bg-white px-4 py-3 font-mono text-xs dark:bg-slate-900"
                                >
                                    {{ student.roll_number }}
                                </td>
                                <td
                                    class="sticky left-0 z-10 bg-white px-4 py-3 font-medium text-slate-900 dark:bg-slate-900 dark:text-slate-100"
                                >
                                    {{ student.name_en }}
                                </td>
                                <template
                                    v-for="subject in subjects"
                                    :key="subject.id"
                                >
                                    <td class="px-2 py-3">
                                        <input
                                            v-model.number="
                                                grid[
                                                    key(student.id, subject.id)
                                                ].written
                                            "
                                            type="number"
                                            min="0"
                                            max="100"
                                            class="h-8 w-16 rounded border border-slate-200 bg-white px-2 text-center text-xs text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                            :disabled="
                                                grid[
                                                    key(student.id, subject.id)
                                                ]?.is_absent
                                            "
                                        />
                                    </td>
                                    <td class="px-2 py-3">
                                        <input
                                            v-model.number="
                                                grid[
                                                    key(student.id, subject.id)
                                                ].mcq
                                            "
                                            type="number"
                                            min="0"
                                            max="100"
                                            class="h-8 w-16 rounded border border-slate-200 bg-white px-2 text-center text-xs text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                            :disabled="
                                                grid[
                                                    key(student.id, subject.id)
                                                ]?.is_absent
                                            "
                                        />
                                    </td>
                                    <td class="px-2 py-3">
                                        <input
                                            v-model.number="
                                                grid[
                                                    key(student.id, subject.id)
                                                ].practical
                                            "
                                            type="number"
                                            min="0"
                                            max="100"
                                            class="h-8 w-16 rounded border border-slate-200 bg-white px-2 text-center text-xs text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                            :disabled="
                                                grid[
                                                    key(student.id, subject.id)
                                                ]?.is_absent
                                            "
                                        />
                                    </td>
                                    <td
                                        class="px-2 py-3 text-center font-mono text-xs font-semibold text-slate-900 dark:text-slate-100"
                                    >
                                        <span
                                            v-if="
                                                total(
                                                    key(student.id, subject.id),
                                                ) !== null
                                            "
                                            >{{
                                                total(
                                                    key(student.id, subject.id),
                                                )
                                            }}</span
                                        >
                                        <span v-else class="text-slate-400"
                                            >—</span
                                        >
                                    </td>
                                    <td class="px-2 py-3 text-center">
                                        <span
                                            :class="[
                                                'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                                                gradeLabel(
                                                    student.id,
                                                    subject.id,
                                                ) === 'F'
                                                    ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                                                    : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
                                            ]"
                                        >
                                            {{
                                                gradeLabel(
                                                    student.id,
                                                    subject.id,
                                                )
                                            }}
                                        </span>
                                    </td>
                                </template>
                                <td class="px-2 py-3 text-center">
                                    <input
                                        v-model="
                                            grid[
                                                key(
                                                    student.id,
                                                    subjects[0]?.id ?? 0,
                                                )
                                            ].is_absent
                                        "
                                        type="checkbox"
                                        class="h-4 w-4 rounded border-slate-300 text-accent-600 focus:ring-accent-500 dark:border-slate-600"
                                        :true-value="true"
                                        :false-value="false"
                                    />
                                </td>
                            </tr>
                            <tr v-if="students.length === 0">
                                <td
                                    :colspan="2 + subjects.length * 5 + 1"
                                    class="px-4 py-12 text-center text-sm text-slate-500 dark:text-slate-400"
                                >
                                    No students found for this exam.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <div class="flex items-center gap-3">
                <button
                    type="button"
                    :disabled="saving"
                    class="inline-flex items-center gap-1.5 rounded-md bg-accent-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-50"
                    @click="save"
                >
                    <AppIcon name="check" class="h-4 w-4" />
                    {{ saving ? 'Saving…' : 'Save marks' }}
                </button>
                <Link
                    href="/admin/exams"
                    class="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                    Back to exams
                </Link>
            </div>
        </div>
    </div>
</template>
