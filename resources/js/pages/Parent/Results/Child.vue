<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3';
import DashboardLayout from '@/layouts/DashboardLayout.vue';
import AppIcon from '@/components/AppIcon.vue';
import { useSidebarStack } from '@/composables/useNavStack';
import type { SidebarConfig } from '@/types/sidebar';

defineOptions({ layout: DashboardLayout });

interface ExamRow {
    id: number;
    name_en: string;
    exam_type: string;
    session_name: string | null;
}

const props = defineProps<{
    student: { id: number; name_en: string; roll_number: string | null };
    exams: ExamRow[];
    sidebar: SidebarConfig;
}>();

useSidebarStack().set(props.sidebar);
</script>

<template>
    <div>
        <Head :title="`Results - ${student.name_en}`" />

        <div class="space-y-6">
            <header class="flex items-center gap-4">
                <Link
                    href="/parent/results"
                    class="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                >
                    <AppIcon name="arrow-left" class="h-5 w-5" />
                </Link>
                <div>
                    <p
                        class="text-xs font-semibold tracking-widest text-slate-500 uppercase dark:text-slate-400"
                    >
                        Results
                    </p>
                    <h1
                        class="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50"
                    >
                        {{ student.name_en }}
                    </h1>
                </div>
            </header>

            <section class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Link
                    v-for="exam in exams"
                    :key="exam.id"
                    :href="`/parent/children/${student.id}/results/${exam.id}`"
                    class="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-accent-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-accent-700"
                >
                    <div
                        class="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-50 text-accent-600 dark:bg-accent-950/40 dark:text-accent-400"
                    >
                        <AppIcon name="graduation-cap" class="h-5 w-5" />
                    </div>
                    <h2
                        class="mt-4 font-semibold text-slate-900 dark:text-slate-100"
                    >
                        {{ exam.name_en }}
                    </h2>
                    <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {{ exam.exam_type }}
                        <span v-if="exam.session_name"
                            >&middot; {{ exam.session_name }}</span
                        >
                    </p>
                </Link>

                <div
                    v-if="exams.length === 0"
                    class="col-span-full rounded-xl border border-dashed border-slate-300 py-16 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400"
                >
                    No published results yet.
                </div>
            </section>
        </div>
    </div>
</template>
