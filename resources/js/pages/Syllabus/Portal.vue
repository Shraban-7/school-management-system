<script setup lang="ts">
import { Head } from '@inertiajs/vue3';
import { computed, ref } from 'vue';
import DashboardLayout from '@/layouts/DashboardLayout.vue';
import AppIcon from '@/components/AppIcon.vue';
import { useI18n } from '@/composables/useI18n';

defineOptions({ layout: DashboardLayout });

interface SyllabusItem {
    id: number;
    title: string;
    description: string | null;
    file_url: string | null;
    download_url: string | null;
    file_name: string | null;
    class_label: string | null;
    session_name: string | null;
}

const props = defineProps<{ syllabuses: SyllabusItem[] }>();

const { t } = useI18n();

const search = ref('');
const selectedClass = ref('');

const classOptions = computed(() => {
    const set = new Set<string>();
    props.syllabuses.forEach((s) => {
        if (s.class_label) set.add(s.class_label);
    });
    return Array.from(set).sort();
});

const filtered = computed(() => {
    return props.syllabuses.filter((item) => {
        const matchesSearch =
            !search.value ||
            item.title.toLowerCase().includes(search.value.toLowerCase()) ||
            (item.description &&
                item.description
                    .toLowerCase()
                    .includes(search.value.toLowerCase()));

        const matchesClass =
            !selectedClass.value || item.class_label === selectedClass.value;

        return matchesSearch && matchesClass;
    });
});
</script>

<template>
    <div>
        <Head title="Syllabus" />

        <div class="space-y-6">
            <header
                class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
            >
                <div>
                    <p
                        class="text-xs font-semibold tracking-widest text-slate-500 uppercase dark:text-slate-400"
                    >
                        {{ t('sidebar.academic') }}
                    </p>
                    <h1
                        class="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50"
                    >
                        {{ t('sidebar.syllabus') }}
                    </h1>
                    <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        Class syllabus documents and academic outlines.
                    </p>
                </div>

                <div class="flex flex-wrap items-center gap-2">
                    <div class="w-full sm:w-48">
                        <select
                            v-model="selectedClass"
                            class="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        >
                            <option value="">All classes</option>
                            <option
                                v-for="c in classOptions"
                                :key="c"
                                :value="c"
                            >
                                {{ c }}
                            </option>
                        </select>
                    </div>

                    <div class="w-full sm:w-64">
                        <input
                            v-model="search"
                            type="search"
                            placeholder="Search syllabus…"
                            class="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        />
                    </div>
                </div>
            </header>

            <div
                v-if="filtered.length"
                class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
                <div
                    v-for="item in filtered"
                    :key="item.id"
                    class="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                >
                    <div>
                        <div class="flex items-start justify-between gap-3">
                            <span
                                v-if="item.class_label"
                                class="inline-flex rounded-md bg-accent-50 px-2 py-0.5 text-xs font-semibold text-accent-700 dark:bg-accent-950/60 dark:text-accent-300"
                            >
                                {{ item.class_label }}
                            </span>
                            <span
                                v-if="item.session_name"
                                class="text-xs text-slate-400"
                            >
                                {{ item.session_name }}
                            </span>
                        </div>

                        <h2
                            class="mt-3 text-lg font-bold text-slate-900 dark:text-slate-100"
                        >
                            {{ item.title }}
                        </h2>

                        <p
                            v-if="item.description"
                            class="mt-2 line-clamp-3 text-sm text-slate-600 dark:text-slate-400"
                        >
                            {{ item.description }}
                        </p>
                    </div>

                    <div
                        class="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800"
                    >
                        <div
                            v-if="item.download_url"
                            class="flex items-center justify-between gap-2"
                        >
                            <span
                                class="truncate text-xs text-slate-400"
                                :title="item.file_name ?? ''"
                            >
                                {{ item.file_name ?? 'PDF document' }}
                            </span>
                            <a
                                :href="item.download_url"
                                class="inline-flex items-center gap-1.5 rounded-md bg-accent-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-accent-700"
                            >
                                <AppIcon name="download" class="h-3.5 w-3.5" />
                                Download
                            </a>
                        </div>
                        <span v-else class="text-xs text-slate-400"
                            >No file attached</span
                        >
                    </div>
                </div>
            </div>

            <div
                v-else
                class="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
            >
                <AppIcon
                    name="book-open"
                    class="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600"
                />
                <p class="mt-2 text-sm font-medium">
                    No syllabus documents available.
                </p>
                <p class="mt-1 text-xs text-slate-400">
                    Class syllabuses uploaded by teachers or admin will appear
                    here.
                </p>
            </div>
        </div>
    </div>
</template>
