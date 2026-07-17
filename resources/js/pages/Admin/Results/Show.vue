<script setup lang="ts">
import { Head, Link, router } from '@inertiajs/vue3';
import { ref } from 'vue';
import DashboardLayout from '@/layouts/DashboardLayout.vue';
import AppIcon from '@/components/AppIcon.vue';
import { useSidebarStack } from '@/composables/useNavStack';
import type { SidebarConfig } from '@/types/sidebar';

defineOptions({ layout: DashboardLayout });

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

const props = defineProps<{
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
}>();

useSidebarStack().set(props.sidebar);

const view = ref<'tabulation' | 'merit'>('tabulation');
const classId = ref<number | null>(props.selectedClassId);

function applyClass() {
    router.get(
        `/admin/results/${props.exam.id}`,
        classId.value ? { class_id: classId.value } : {},
        { preserveState: false, preserveScroll: true },
    );
}
</script>

<template>
    <div>
        <Head :title="`Results - ${exam.name_en}`" />

        <div class="space-y-6">
            <header class="flex items-center gap-4">
                <Link
                    href="/admin/results"
                    class="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                >
                    <AppIcon name="arrow-left" class="h-5 w-5" />
                </Link>
                <div>
                    <p
                        class="text-xs font-semibold tracking-widest text-slate-500 uppercase dark:text-slate-400"
                    >
                        Tabulation &amp; ranking
                    </p>
                    <h1
                        class="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50"
                    >
                        {{ exam.name_en }}
                    </h1>
                    <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        {{ exam.institution_name }} &middot;
                        {{ exam.exam_type }}
                        <span v-if="exam.session_name"
                            >&middot; {{ exam.session_name }}</span
                        >
                    </p>
                </div>
            </header>

            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div
                    class="inline-flex rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900"
                >
                    <button
                        type="button"
                        :class="[
                            'rounded-md px-3 py-1.5 text-sm font-medium transition',
                            view === 'tabulation'
                                ? 'bg-accent-600 text-white'
                                : 'text-slate-600 hover:text-slate-900 dark:text-slate-300',
                        ]"
                        @click="view = 'tabulation'"
                    >
                        Tabulation
                    </button>
                    <button
                        type="button"
                        :class="[
                            'rounded-md px-3 py-1.5 text-sm font-medium transition',
                            view === 'merit'
                                ? 'bg-accent-600 text-white'
                                : 'text-slate-600 hover:text-slate-900 dark:text-slate-300',
                        ]"
                        @click="view = 'merit'"
                    >
                        Merit list
                    </button>
                </div>

                <label class="flex items-center gap-2 text-sm">
                    <span class="text-slate-500 dark:text-slate-400"
                        >Class</span
                    >
                    <select
                        v-model="classId"
                        class="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                        @change="applyClass"
                    >
                        <option :value="null">All classes</option>
                        <option
                            v-for="c in classes"
                            :key="c.value"
                            :value="c.value"
                        >
                            {{ c.label }}
                        </option>
                    </select>
                </label>
            </div>

            <section
                class="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
                <div class="overflow-x-auto">
                    <!-- Tabulation -->
                    <table
                        v-if="view === 'tabulation'"
                        class="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800"
                    >
                        <thead
                            class="bg-slate-50 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase dark:bg-slate-950/40 dark:text-slate-400"
                        >
                            <tr>
                                <th class="px-4 py-3">Roll</th>
                                <th class="px-4 py-3">Student</th>
                                <th
                                    v-for="col in columns"
                                    :key="col.id"
                                    class="px-3 py-3 text-center"
                                >
                                    {{ col.name_en }}
                                </th>
                                <th class="px-3 py-3 text-center">GPA</th>
                                <th class="px-3 py-3 text-center">Result</th>
                                <th class="px-3 py-3 text-right">Sheet</th>
                            </tr>
                        </thead>
                        <tbody
                            class="divide-y divide-slate-100 dark:divide-slate-800"
                        >
                            <tr
                                v-for="row in rows"
                                :key="row.student_id"
                                class="text-slate-700 hover:bg-slate-50/60 dark:text-slate-200 dark:hover:bg-slate-800/40"
                            >
                                <td class="px-4 py-3 font-mono text-xs">
                                    {{ row.roll_number }}
                                </td>
                                <td
                                    class="px-4 py-3 font-medium text-slate-900 dark:text-slate-100"
                                >
                                    {{ row.name_en }}
                                </td>
                                <td
                                    v-for="col in columns"
                                    :key="col.id"
                                    class="px-3 py-3 text-center"
                                >
                                    <span
                                        v-if="row.subjects[col.id]"
                                        :class="[
                                            'text-xs font-semibold',
                                            row.subjects[col.id].passed
                                                ? 'text-slate-700 dark:text-slate-200'
                                                : 'text-rose-600 dark:text-rose-400',
                                        ]"
                                    >
                                        {{ row.subjects[col.id].grade }}
                                    </span>
                                    <span v-else class="text-slate-300">—</span>
                                </td>
                                <td
                                    class="px-3 py-3 text-center font-mono text-xs font-semibold"
                                >
                                    {{
                                        row.gpa === null
                                            ? '—'
                                            : row.gpa.toFixed(2)
                                    }}
                                </td>
                                <td class="px-3 py-3 text-center">
                                    <span
                                        v-if="row.has_marks"
                                        :class="[
                                            'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                                            row.passed
                                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
                                        ]"
                                    >
                                        {{ row.passed ? 'Pass' : 'Fail' }}
                                    </span>
                                    <span v-else class="text-slate-300">—</span>
                                </td>
                                <td class="px-3 py-3 text-right">
                                    <Link
                                        :href="`/admin/results/${exam.id}/students/${row.student_id}`"
                                        class="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                                        aria-label="View gradesheet"
                                    >
                                        <AppIcon name="eye" class="h-4 w-4" />
                                    </Link>
                                </td>
                            </tr>
                            <tr v-if="rows.length === 0">
                                <td
                                    :colspan="columns.length + 5"
                                    class="px-4 py-12 text-center text-sm text-slate-500 dark:text-slate-400"
                                >
                                    No students or marks found.
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <!-- Merit list -->
                    <table
                        v-else
                        class="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800"
                    >
                        <thead
                            class="bg-slate-50 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase dark:bg-slate-950/40 dark:text-slate-400"
                        >
                            <tr>
                                <th class="px-4 py-3">Position</th>
                                <th class="px-4 py-3">Roll</th>
                                <th class="px-4 py-3">Student</th>
                                <th class="px-4 py-3">Class</th>
                                <th class="px-3 py-3 text-center">Total</th>
                                <th class="px-3 py-3 text-center">GPA</th>
                                <th class="px-3 py-3 text-center">Grade</th>
                                <th class="px-3 py-3 text-center">Result</th>
                            </tr>
                        </thead>
                        <tbody
                            class="divide-y divide-slate-100 dark:divide-slate-800"
                        >
                            <tr
                                v-for="row in rows"
                                :key="row.student_id"
                                class="text-slate-700 hover:bg-slate-50/60 dark:text-slate-200 dark:hover:bg-slate-800/40"
                            >
                                <td class="px-4 py-3 font-semibold">
                                    <span v-if="row.position">{{
                                        row.position
                                    }}</span>
                                    <span v-else class="text-slate-300">—</span>
                                </td>
                                <td class="px-4 py-3 font-mono text-xs">
                                    {{ row.roll_number }}
                                </td>
                                <td
                                    class="px-4 py-3 font-medium text-slate-900 dark:text-slate-100"
                                >
                                    {{ row.name_en }}
                                </td>
                                <td
                                    class="px-4 py-3 text-xs text-slate-600 dark:text-slate-300"
                                >
                                    {{ row.class_label ?? '—' }}
                                </td>
                                <td
                                    class="px-3 py-3 text-center font-mono text-xs"
                                >
                                    {{ Math.round(row.total * 10) / 10 }}
                                </td>
                                <td
                                    class="px-3 py-3 text-center font-mono text-xs font-semibold"
                                >
                                    {{
                                        row.gpa === null
                                            ? '—'
                                            : row.gpa.toFixed(2)
                                    }}
                                </td>
                                <td class="px-3 py-3 text-center">
                                    {{ row.grade }}
                                </td>
                                <td class="px-3 py-3 text-center">
                                    <span
                                        v-if="row.has_marks"
                                        :class="[
                                            'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                                            row.passed
                                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
                                        ]"
                                    >
                                        {{ row.passed ? 'Pass' : 'Fail' }}
                                    </span>
                                    <span v-else class="text-slate-300">—</span>
                                </td>
                            </tr>
                            <tr v-if="rows.length === 0">
                                <td
                                    colspan="8"
                                    class="px-4 py-12 text-center text-sm text-slate-500 dark:text-slate-400"
                                >
                                    No students or marks found.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    </div>
</template>
