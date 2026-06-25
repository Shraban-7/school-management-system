<script setup lang="ts">
import { Head, Link, router, usePage } from '@inertiajs/vue3';
import { computed, reactive, ref } from 'vue';
import DashboardLayout from '@/layouts/DashboardLayout.vue';
import AppIcon from '@/components/AppIcon.vue';
import { useSidebarStack } from '@/composables/useNavStack';
import type { SidebarConfig } from '@/types/sidebar';

defineOptions({ layout: DashboardLayout });

interface AttendanceRow {
    student_id: number;
    student_name: string;
    roll_number: string;
    status: string | null;
    remarks: string | null;
}

const props = defineProps<{
    date: string;
    classes: { id: number; label: string }[];
    attendance: AttendanceRow[];
    sidebar: SidebarConfig;
}>();

const sidebarStack = useSidebarStack();
sidebarStack.set(props.sidebar);

const page = usePage();
const flash = computed(() => page.props.flash?.message ?? null);

const selectedDate = ref(props.date);
const selectedClass = ref('');

const form = reactive<Record<string, { status: string; remarks: string }>>({});

for (const row of props.attendance) {
    form[String(row.student_id)] = {
        status: row.status ?? 'present',
        remarks: row.remarks ?? '',
    };
}

function load() {
    router.get('/admin/attendance', {
        date: selectedDate.value,
        class_id: selectedClass.value,
    });
}

function save() {
    const records = props.attendance.map((row) => ({
        student_id: row.student_id,
        status: form[String(row.student_id)]?.status ?? 'present',
        remarks: form[String(row.student_id)]?.remarks ?? '',
    }));

    router.post('/admin/attendance', {
        date: selectedDate.value,
        class_id: selectedClass.value,
        records,
    });
}
</script>

<template>
    <div>
        <Head title="Attendance" />

        <div class="space-y-6">
            <header
                class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
            >
                <div>
                    <p
                        class="text-xs font-semibold tracking-widest text-slate-500 uppercase dark:text-slate-400"
                    >
                        Management
                    </p>
                    <h1
                        class="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50"
                    >
                        Attendance
                    </h1>
                    <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        Record and manage daily student attendance.
                    </p>
                </div>
            </header>

            <div
                v-if="flash"
                class="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
            >
                {{ flash }}
            </div>

            <section
                class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
                <div class="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <div>
                        <label
                            for="attendance-date"
                            class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                        >
                            Date
                        </label>
                        <input
                            id="attendance-date"
                            v-model="selectedDate"
                            type="date"
                            class="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                        />
                    </div>
                    <div>
                        <label
                            for="attendance-class"
                            class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                        >
                            Class
                        </label>
                        <select
                            id="attendance-class"
                            v-model="selectedClass"
                            class="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                        >
                            <option value="" disabled>Select class</option>
                            <option
                                v-for="c in classes"
                                :key="c.id"
                                :value="c.id"
                            >
                                {{ c.label }}
                            </option>
                        </select>
                    </div>
                    <button
                        type="button"
                        class="inline-flex items-center gap-1.5 self-end rounded-md bg-accent-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-700"
                        @click="load"
                    >
                        <AppIcon name="search" class="h-4 w-4" />
                        Load
                    </button>
                </div>
            </section>

            <section
                v-if="attendance.length > 0"
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
                                <th class="px-4 py-3">Roll</th>
                                <th class="px-4 py-3">Name</th>
                                <th class="px-4 py-3">Status</th>
                                <th class="px-4 py-3">Remarks</th>
                            </tr>
                        </thead>
                        <tbody
                            class="divide-y divide-slate-100 dark:divide-slate-800"
                        >
                            <tr
                                v-for="row in attendance"
                                :key="row.student_id"
                                class="text-slate-700 hover:bg-slate-50/60 dark:text-slate-200 dark:hover:bg-slate-800/40"
                            >
                                <td
                                    class="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-300"
                                >
                                    {{ row.roll_number }}
                                </td>
                                <td
                                    class="px-4 py-3 font-medium text-slate-900 dark:text-slate-100"
                                >
                                    {{ row.student_name }}
                                </td>
                                <td class="px-4 py-3">
                                    <div class="flex items-center gap-4">
                                        <label
                                            class="flex items-center gap-1.5 text-xs"
                                        >
                                            <input
                                                v-model="
                                                    form[String(row.student_id)]
                                                        .status
                                                "
                                                type="radio"
                                                value="present"
                                                class="h-3.5 w-3.5 border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-600"
                                            />
                                            Present
                                        </label>
                                        <label
                                            class="flex items-center gap-1.5 text-xs"
                                        >
                                            <input
                                                v-model="
                                                    form[String(row.student_id)]
                                                        .status
                                                "
                                                type="radio"
                                                value="absent"
                                                class="h-3.5 w-3.5 border-slate-300 text-rose-600 focus:ring-rose-500 dark:border-slate-600"
                                            />
                                            Absent
                                        </label>
                                        <label
                                            class="flex items-center gap-1.5 text-xs"
                                        >
                                            <input
                                                v-model="
                                                    form[String(row.student_id)]
                                                        .status
                                                "
                                                type="radio"
                                                value="late"
                                                class="h-3.5 w-3.5 border-slate-300 text-amber-600 focus:ring-amber-500 dark:border-slate-600"
                                            />
                                            Late
                                        </label>
                                    </div>
                                </td>
                                <td class="px-4 py-3">
                                    <input
                                        v-model="
                                            form[String(row.student_id)].remarks
                                        "
                                        type="text"
                                        placeholder="Optional note…"
                                        class="h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div
                    class="border-t border-slate-200 px-4 py-3 dark:border-slate-800"
                >
                    <button
                        type="button"
                        class="inline-flex items-center gap-1.5 rounded-md bg-accent-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-700"
                        @click="save"
                    >
                        <AppIcon name="check" class="h-4 w-4" />
                        Save attendance
                    </button>
                </div>
            </section>

            <section
                v-else-if="selectedClass"
                class="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
                <p class="text-sm text-slate-500 dark:text-slate-400">
                    No students found. Select a class and click "Load" to view
                    attendance.
                </p>
            </section>
        </div>
    </div>
</template>
