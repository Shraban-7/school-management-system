<script setup lang="ts">
import { Head, Link, router, usePage } from '@inertiajs/vue3';
import { computed, ref } from 'vue';
import DashboardLayout from '@/layouts/DashboardLayout.vue';
import AppIcon from '@/components/AppIcon.vue';
import { useSidebarStack } from '@/composables/useNavStack';
import type { SidebarConfig } from '@/types/sidebar';

defineOptions({ layout: DashboardLayout });

interface SyllabusRow {
    id: number;
    title: string;
    description: string | null;
    file_url: string | null;
    class_label: string;
    session_name: string;
}

const props = defineProps<{
    sidebar: SidebarConfig;
    syllabuses: {
        data: SyllabusRow[];
        from: number | null;
        to: number | null;
        total: number;
        last_page: number;
        current_page: number;
    };
}>();

const sidebarStack = useSidebarStack();
sidebarStack.set(props.sidebar);

const page = usePage();
const flash = computed(() => page.props.flash?.message ?? null);

const search = ref('');

const filtered = computed(() => {
    if (!search.value) return props.syllabuses.data;
    const q = search.value.toLowerCase();
    return props.syllabuses.data.filter(
        (s) =>
            s.title.toLowerCase().includes(q) ||
            s.class_label.toLowerCase().includes(q) ||
            s.session_name.toLowerCase().includes(q),
    );
});

function destroy(id: number) {
    if (confirm('Are you sure you want to delete this syllabus?')) {
        router.delete(`/admin/syllabus/${id}`);
    }
}
</script>

<template>
    <div>
        <Head title="Syllabus" />

        <div class="space-y-6">
            <header
                class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
            >
                <div>
                    <p
                        class="text-xs font-semibold tracking-widest text-slate-500 uppercase dark:text-slate-400"
                    >
                        Website
                    </p>
                    <h1
                        class="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50"
                    >
                        Syllabus
                    </h1>
                    <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        Manage class syllabuses published on the website.
                    </p>
                </div>
                <Link
                    href="/admin/syllabus/create"
                    class="inline-flex items-center gap-1.5 self-start rounded-md bg-accent-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-700 sm:self-auto"
                >
                    <AppIcon name="plus" class="h-4 w-4" />
                    Add syllabus
                </Link>
            </header>

            <div
                v-if="flash"
                class="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
            >
                {{ flash }}
            </div>

            <section
                class="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
                <div
                    class="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800"
                >
                    <label
                        class="relative flex flex-1 items-center sm:max-w-xs"
                    >
                        <AppIcon
                            name="search"
                            class="pointer-events-none absolute left-3 h-4 w-4 text-slate-400"
                        />
                        <input
                            v-model="search"
                            type="search"
                            placeholder="Search syllabuses…"
                            class="h-9 w-full rounded-md border border-slate-200 bg-white pr-3 pl-9 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500"
                        />
                    </label>
                    <span class="text-xs text-slate-500 dark:text-slate-400">
                        {{ filtered.length }} of
                        {{ syllabuses.total }} syllabuses
                    </span>
                </div>

                <div class="overflow-x-auto">
                    <table
                        class="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800"
                    >
                        <thead
                            class="bg-slate-50 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase dark:bg-slate-950/40 dark:text-slate-400"
                        >
                            <tr>
                                <th class="px-4 py-3">Title</th>
                                <th class="px-4 py-3">Class</th>
                                <th class="px-4 py-3">Session</th>
                                <th class="px-4 py-3">File</th>
                                <th class="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody
                            class="divide-y divide-slate-100 dark:divide-slate-800"
                        >
                            <tr
                                v-for="syllabus in filtered"
                                :key="syllabus.id"
                                class="text-slate-700 hover:bg-slate-50/60 dark:text-slate-200 dark:hover:bg-slate-800/40"
                            >
                                <td class="px-4 py-3">
                                    <p
                                        class="font-medium text-slate-900 dark:text-slate-100"
                                    >
                                        {{ syllabus.title }}
                                    </p>
                                    <p
                                        v-if="syllabus.description"
                                        class="max-w-md truncate text-xs text-slate-500 dark:text-slate-400"
                                    >
                                        {{ syllabus.description }}
                                    </p>
                                </td>
                                <td class="px-4 py-3">
                                    {{ syllabus.class_label }}
                                </td>
                                <td class="px-4 py-3">
                                    {{ syllabus.session_name }}
                                </td>
                                <td class="px-4 py-3">
                                    <a
                                        v-if="syllabus.file_url"
                                        :href="syllabus.file_url"
                                        target="_blank"
                                        rel="noopener"
                                        class="inline-flex items-center gap-1.5 text-accent-600 hover:underline dark:text-accent-400"
                                    >
                                        <AppIcon
                                            name="download"
                                            class="h-4 w-4"
                                        />
                                        View
                                    </a>
                                    <span v-else>—</span>
                                </td>
                                <td class="px-4 py-3 text-right">
                                    <div class="inline-flex items-center gap-1">
                                        <Link
                                            :href="`/admin/syllabus/${syllabus.id}/edit`"
                                            class="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                                            aria-label="Edit syllabus"
                                        >
                                            <AppIcon
                                                name="pencil"
                                                class="h-4 w-4"
                                            />
                                        </Link>
                                        <button
                                            type="button"
                                            class="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
                                            aria-label="Delete syllabus"
                                            @click="destroy(syllabus.id)"
                                        >
                                            <AppIcon
                                                name="trash"
                                                class="h-4 w-4"
                                            />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            <tr v-if="filtered.length === 0">
                                <td
                                    colspan="5"
                                    class="px-4 py-12 text-center text-sm text-slate-500 dark:text-slate-400"
                                >
                                    No syllabuses found.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    </div>
</template>
