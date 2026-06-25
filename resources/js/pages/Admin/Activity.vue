<script setup lang="ts">
import { Head } from '@inertiajs/vue3';
import DashboardLayout from '@/layouts/DashboardLayout.vue';
import AppIcon from '@/components/AppIcon.vue';
import { useSidebarStack } from '@/composables/useNavStack';
import type { SidebarConfig } from '@/types/sidebar';

defineOptions({ layout: DashboardLayout });

interface ActivityEntry {
    actor: string;
    action: string;
    target: string;
    time: string;
    ip: string;
}

const props = defineProps<{
    entries: ActivityEntry[];
    sidebar: SidebarConfig;
}>();

const sidebarStack = useSidebarStack();
sidebarStack.set(props.sidebar);
</script>

<template>
    <div>
        <Head title="Activity log" />

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
                        Activity log
                    </h1>
                    <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        Every action that matters, recorded for security and
                        compliance.
                    </p>
                </div>
                <div class="flex items-center gap-2">
                    <button
                        type="button"
                        class="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                        <AppIcon name="filter" class="h-4 w-4" />
                        Filter
                    </button>
                    <button
                        type="button"
                        class="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                        <AppIcon name="download" class="h-4 w-4" />
                        Export
                    </button>
                </div>
            </header>

            <section
                class="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
                <ol class="divide-y divide-slate-100 dark:divide-slate-800">
                    <li
                        v-for="(entry, i) in entries"
                        :key="i"
                        class="flex items-start gap-4 px-5 py-4"
                    >
                        <span
                            class="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full bg-accent-500"
                        />
                        <div class="min-w-0 flex-1">
                            <p
                                class="text-sm text-slate-900 dark:text-slate-100"
                            >
                                <span class="font-semibold">{{
                                    entry.actor
                                }}</span>
                                {{ entry.action }}
                                <span class="font-medium">{{
                                    entry.target
                                }}</span>
                            </p>
                            <div
                                class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400"
                            >
                                <span class="inline-flex items-center gap-1">
                                    <AppIcon name="clock" class="h-3.5 w-3.5" />
                                    {{ entry.time }}
                                </span>
                                <span
                                    class="inline-flex items-center gap-1 font-mono"
                                >
                                    <AppIcon name="globe" class="h-3.5 w-3.5" />
                                    {{ entry.ip }}
                                </span>
                            </div>
                        </div>
                    </li>
                </ol>
            </section>
        </div>
    </div>
</template>
