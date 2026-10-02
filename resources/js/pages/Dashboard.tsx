import React, { useEffect } from 'react';
import { Head } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import DashboardShell from '@/components/DashboardShell';
import AppIcon from '@/components/AppIcon';
import { useSidebarStack } from '@/composables/useNavStack';
import type { SidebarConfig } from '@/types/sidebar';
import type { Stat, StatCard, StatStatus } from '@/types/dashboard';

interface DashboardProps {
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
}

export default function Dashboard({
    role,
    title,
    subtitle,
    stats,
    cards,
    sidebar,
    notificationCount,
    recentActivity,
}: DashboardProps) {
    const sidebarStack = useSidebarStack();
    useEffect(() => {
        if (sidebar) {
            sidebarStack.set(sidebar);
        }
    }, [sidebar]);

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

    return (
        <DashboardLayout notificationCount={notificationCount}>
            <Head title={title} />

            <DashboardShell
                role={role}
                title={title}
                subtitle={subtitle}
                stats={stats}
            >
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Bento: main column */}
                    <div className="space-y-6 lg:col-span-2">
                        {cards.map((card, i) => (
                            <section
                                key={card.title ?? `card-${i}`}
                                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                            >
                                {card.title && (
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                                            {card.title}
                                        </h2>
                                        <button
                                            type="button"
                                            className="text-xs font-medium text-accent-600 hover:text-accent-700 dark:text-accent-400"
                                        >
                                            View all
                                        </button>
                                    </div>
                                )}
                                <ul
                                    className={`divide-y divide-slate-100 dark:divide-slate-800 ${
                                        card.title ? 'mt-4' : ''
                                    }`}
                                >
                                    {card.items.map((item) => (
                                        <li
                                            key={item.label}
                                            className="flex items-center justify-between py-3 text-sm"
                                        >
                                            <span className="text-slate-700 dark:text-slate-300">
                                                {item.label}
                                            </span>
                                            {item.status ? (
                                                <span
                                                    className={`inline-flex items-center gap-2 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadge(
                                                        item.status,
                                                    )}`}
                                                >
                                                    <span
                                                        className={`h-1.5 w-1.5 rounded-full ${statusDot(
                                                            item.status,
                                                        )}`}
                                                    />
                                                    {item.value}
                                                </span>
                                            ) : (
                                                <span className="font-medium text-slate-900 dark:text-slate-100">
                                                    {item.value}
                                                </span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        ))}
                    </div>

                    {/* Bento: side column */}
                    <aside className="space-y-6">
                        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                                Quick actions
                            </h2>
                            <div className="mt-4 grid grid-cols-2 gap-2">
                                {[
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
                                ].map((action) => (
                                    <a
                                        key={action.label}
                                        href={action.href}
                                        className="flex flex-col items-start gap-2 rounded-lg border border-slate-200 p-3 text-left transition hover:border-accent-300 hover:bg-accent-50/40 dark:border-slate-800 dark:hover:border-accent-700 dark:hover:bg-accent-950/20"
                                    >
                                        <AppIcon
                                            name={action.icon}
                                            className="h-5 w-5 text-accent-600 dark:text-accent-400"
                                        />
                                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                            {action.label}
                                        </span>
                                    </a>
                                ))}
                            </div>
                        </section>

                        {recentActivity && recentActivity.length > 0 && (
                            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                                    Recent activity
                                </h2>
                                <ol className="mt-4 space-y-3">
                                    {recentActivity.map((item, i) => (
                                        <li
                                            key={i}
                                            className="flex items-start gap-3 text-sm"
                                        >
                                            <span className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full bg-accent-500" />
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-slate-900 dark:text-slate-100">
                                                    <span className="font-medium">
                                                        {item.actor}
                                                    </span>{' '}
                                                    {item.action}{' '}
                                                    <span className="font-medium">
                                                        {item.target}
                                                    </span>
                                                </p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    {item.time}
                                                </p>
                                            </div>
                                        </li>
                                    ))}
                                </ol>
                            </section>
                        )}
                    </aside>
                </div>
            </DashboardShell>
        </DashboardLayout>
    );
}
