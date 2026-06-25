<script setup lang="ts">
import { Head } from '@inertiajs/vue3';
import { computed, ref } from 'vue';
import DashboardLayout from '@/layouts/DashboardLayout.vue';
import AppIcon from '@/components/AppIcon.vue';
import { useSidebarStack } from '@/composables/useNavStack';
import type { SidebarConfig } from '@/types/sidebar';

defineOptions({ layout: DashboardLayout });

type Level = 'info' | 'success' | 'warning' | 'danger';

interface Notification {
    id: number;
    title: string;
    body: string;
    time: string;
    level: Level;
    read: boolean;
}

const props = defineProps<{
    items: Notification[];
    sidebar: SidebarConfig;
}>();

const sidebarStack = useSidebarStack();
sidebarStack.set(props.sidebar);

const filter = ref<'all' | 'unread'>('all');

const filtered = computed(() =>
    filter.value === 'unread'
        ? props.items.filter((n) => !n.read)
        : props.items,
);

const unreadCount = computed(() => props.items.filter((n) => !n.read).length);

function levelClass(level: Level): string {
    switch (level) {
        case 'success':
            return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300';
        case 'warning':
            return 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300';
        case 'danger':
            return 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300';
        default:
            return 'bg-accent-50 text-accent-600 dark:bg-accent-950/40 dark:text-accent-300';
    }
}

function levelIcon(level: Level): string {
    switch (level) {
        case 'success':
            return 'check';
        case 'warning':
            return 'sparkles';
        case 'danger':
            return 'shield';
        default:
            return 'bell';
    }
}
</script>

<template>
    <div>
        <Head title="Notifications" />

        <div class="space-y-6">
            <header
                class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
            >
                <div>
                    <p
                        class="text-xs font-semibold tracking-widest text-slate-500 uppercase dark:text-slate-400"
                    >
                        System
                    </p>
                    <h1
                        class="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50"
                    >
                        Notifications
                    </h1>
                    <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        {{ unreadCount }} unread of {{ items.length }} total
                    </p>
                </div>
                <div
                    class="inline-flex rounded-md border border-slate-200 bg-white p-0.5 dark:border-slate-700 dark:bg-slate-900"
                >
                    <button
                        v-for="opt in ['all', 'unread'] as const"
                        :key="opt"
                        type="button"
                        :class="[
                            'rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition',
                            filter === opt
                                ? 'bg-accent-600 text-white shadow-sm'
                                : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100',
                        ]"
                        @click="filter = opt"
                    >
                        {{ opt }}
                    </button>
                </div>
            </header>

            <section
                class="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
                <ul class="divide-y divide-slate-100 dark:divide-slate-800">
                    <li
                        v-for="notification in filtered"
                        :key="notification.id"
                        :class="[
                            'flex items-start gap-4 px-5 py-4 transition',
                            !notification.read
                                ? 'bg-accent-50/30 dark:bg-accent-950/10'
                                : '',
                        ]"
                    >
                        <span
                            :class="[
                                'mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                                levelClass(notification.level),
                            ]"
                        >
                            <AppIcon
                                :name="levelIcon(notification.level)"
                                class="h-5 w-5"
                            />
                        </span>
                        <div class="min-w-0 flex-1">
                            <p
                                class="text-sm font-semibold text-slate-900 dark:text-slate-100"
                            >
                                {{ notification.title }}
                            </p>
                            <p
                                class="mt-0.5 text-sm text-slate-600 dark:text-slate-300"
                            >
                                {{ notification.body }}
                            </p>
                            <p
                                class="mt-1 text-xs text-slate-500 dark:text-slate-400"
                            >
                                {{ notification.time }}
                            </p>
                        </div>
                        <button
                            v-if="!notification.read"
                            type="button"
                            class="inline-flex h-7 items-center rounded-md border border-slate-200 px-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                            Mark read
                        </button>
                    </li>
                    <li
                        v-if="filtered.length === 0"
                        class="px-5 py-12 text-center text-sm text-slate-500 dark:text-slate-400"
                    >
                        No notifications to show.
                    </li>
                </ul>
            </section>
        </div>
    </div>
</template>
