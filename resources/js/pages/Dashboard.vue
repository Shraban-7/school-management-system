<script setup lang="ts">
import { Head } from '@inertiajs/vue3';
import DashboardLayout from '@/layouts/DashboardLayout.vue';
import DashboardShell from '@/components/DashboardShell.vue';
import AppIcon from '@/components/AppIcon.vue';
import { useSidebarStack } from '@/composables/useNavStack';
import type { SidebarConfig } from '@/types/sidebar';
import type { Stat, StatCard, StatStatus } from '@/types/dashboard';

defineOptions({ layout: DashboardLayout });

const props = defineProps<{
    role: string;
    title: string;
    subtitle: string;
    stats: Stat[];
    cards: StatCard[];
    sidebar: SidebarConfig;
    notificationCount?: number;
    recentActivity?: Array<{
        actor: string;
        action: string;
        target: string;
        time: string;
    }>;
}>();

const sidebarStack = useSidebarStack();
sidebarStack.set(props.sidebar);

const statusDot = (status: StatStatus): string =>
    status === 'ok' || status === 'good'
        ? 'bg-emerald-500'
        : status === 'warn'
          ? 'bg-amber-500'
          : status === 'bad' || status === 'down'
            ? 'bg-rose-500'
            : 'bg-slate-400';

const statusBadge = (status: StatStatus): string =>
    status === 'ok' || status === 'good'
        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
        : status === 'warn'
          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
          : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300';
</script>

<template>
    <div>
        <Head :title="title" />

        <DashboardShell
            :role="role"
            :title="title"
            :subtitle="subtitle"
            :stats="stats"
        >
            <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <!-- Bento: main column -->
                <div class="space-y-6 lg:col-span-2">
                    <section
                        v-for="(card, i) in cards"
                        :key="card.title ?? `card-${i}`"
                        class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                    >
                        <div
                            v-if="card.title"
                            class="flex items-center justify-between"
                        >
                            <h2
                                class="text-base font-semibold text-slate-900 dark:text-slate-100"
                            >
                                {{ card.title }}
                            </h2>
                            <button
                                type="button"
                                class="text-xs font-medium text-accent-600 hover:text-accent-700 dark:text-accent-400"
                            >
                                View all
                            </button>
                        </div>
                        <ul
                            :class="[
                                'divide-y divide-slate-100 dark:divide-slate-800',
                                card.title ? 'mt-4' : '',
                            ]"
                        >
                            <li
                                v-for="item in card.items"
                                :key="item.label"
                                class="flex items-center justify-between py-3 text-sm"
                            >
                                <span
                                    class="text-slate-700 dark:text-slate-300"
                                    >{{ item.label }}</span
                                >
                                <span
                                    v-if="item.status"
                                    :class="[
                                        'inline-flex items-center gap-2 rounded-full px-2.5 py-0.5 text-xs font-medium',
                                        statusBadge(item.status),
                                    ]"
                                >
                                    <span
                                        :class="[
                                            'h-1.5 w-1.5 rounded-full',
                                            statusDot(item.status),
                                        ]"
                                    />
                                    {{ item.value }}
                                </span>
                                <span
                                    v-else
                                    class="font-medium text-slate-900 dark:text-slate-100"
                                    >{{ item.value }}</span
                                >
                            </li>
                        </ul>
                    </section>
                </div>

                <!-- Bento: side column -->
                <aside class="space-y-6">
                    <section
                        class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                    >
                        <h2
                            class="text-base font-semibold text-slate-900 dark:text-slate-100"
                        >
                            Quick actions
                        </h2>
                        <div class="mt-4 grid grid-cols-2 gap-2">
                            <a
                                v-for="action in [
                                    {
                                        label: 'New user',
                                        href: '/admin/users',
                                        icon: 'user',
                                    },
                                    {
                                        label: 'View logs',
                                        href: '/admin/activity',
                                        icon: 'activity',
                                    },
                                    {
                                        label: 'Settings',
                                        href: '/admin/settings',
                                        icon: 'cog',
                                    },
                                    {
                                        label: 'Help',
                                        href: '#',
                                        icon: 'megaphone',
                                    },
                                ]"
                                :key="action.label"
                                :href="action.href"
                                class="flex flex-col items-start gap-2 rounded-lg border border-slate-200 p-3 text-left transition hover:border-accent-300 hover:bg-accent-50/40 dark:border-slate-800 dark:hover:border-accent-700 dark:hover:bg-accent-950/20"
                            >
                                <AppIcon
                                    :name="action.icon"
                                    class="h-5 w-5 text-accent-600 dark:text-accent-400"
                                />
                                <span
                                    class="text-sm font-medium text-slate-900 dark:text-slate-100"
                                >
                                    {{ action.label }}
                                </span>
                            </a>
                        </div>
                    </section>

                    <section
                        v-if="recentActivity && recentActivity.length"
                        class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                    >
                        <h2
                            class="text-base font-semibold text-slate-900 dark:text-slate-100"
                        >
                            Recent activity
                        </h2>
                        <ol class="mt-4 space-y-3">
                            <li
                                v-for="(item, i) in recentActivity"
                                :key="i"
                                class="flex items-start gap-3 text-sm"
                            >
                                <span
                                    class="mt-1 inline-block h-2 w-2 shrink-0 rounded-full bg-accent-500"
                                />
                                <div class="min-w-0 flex-1">
                                    <p
                                        class="truncate text-slate-900 dark:text-slate-100"
                                    >
                                        <span class="font-medium">{{
                                            item.actor
                                        }}</span>
                                        {{ item.action }}
                                        <span class="font-medium">{{
                                            item.target
                                        }}</span>
                                    </p>
                                    <p
                                        class="text-xs text-slate-500 dark:text-slate-400"
                                    >
                                        {{ item.time }}
                                    </p>
                                </div>
                            </li>
                        </ol>
                    </section>
                </aside>
            </div>
        </DashboardShell>
    </div>
</template>
