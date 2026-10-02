import React, { useEffect } from 'react';
import { Head } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import AppIcon from '@/components/AppIcon';
import { useSidebarStack } from '@/composables/useNavStack';
import { useI18n } from '@/composables/useI18n';
import type { SidebarConfig } from '@/types/sidebar';

interface ActivityEntry {
    actor: string;
    action: string;
    target: string;
    time: string;
    ip: string;
}

interface AdminActivityProps {
    entries: ActivityEntry[];
    sidebar: SidebarConfig;
}

export default function AdminActivity({ entries, sidebar }: AdminActivityProps) {
    const { t } = useI18n();
    const sidebarStack = useSidebarStack();
    useEffect(() => {
        if (sidebar) {
            sidebarStack.set(sidebar);
        }
    }, [sidebar]);

    return (
        <DashboardLayout>
            <Head title={t('activity.title', {}, 'Activity log')} />

            <div className="space-y-6">
                <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase dark:text-slate-400">
                            {t('common.management', {}, 'Management')}
                        </p>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
                            {t('activity.title', {}, 'Activity log')}
                        </h1>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            {t('activity.subtitle', {}, 'Every action that matters, recorded for security and compliance.')}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                            <AppIcon name="filter" className="h-4 w-4" />
                            {t('common.filter', {}, 'Filter')}
                        </button>
                        <button
                            type="button"
                            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                            <AppIcon name="download" className="h-4 w-4" />
                            {t('common.export', {}, 'Export')}
                        </button>
                    </div>
                </header>

                <section className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <ol className="divide-y divide-slate-100 dark:divide-slate-800">
                        {entries.map((entry, i) => (
                            <li key={i} className="flex items-start gap-4 px-5 py-4">
                                <span className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full bg-accent-500" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm text-slate-900 dark:text-slate-100">
                                        <span className="font-semibold">{entry.actor}</span>{' '}
                                        {entry.action}{' '}
                                        <span className="font-medium">{entry.target}</span>
                                    </p>
                                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                                        <span className="inline-flex items-center gap-1">
                                            <AppIcon name="clock" className="h-3.5 w-3.5" />
                                            {entry.time}
                                        </span>
                                        <span className="inline-flex items-center gap-1 font-mono">
                                            <AppIcon name="globe" className="h-3.5 w-3.5" />
                                            {entry.ip}
                                        </span>
                                    </div>
                                </div>
                            </li>
                        ))}
                        {entries.length === 0 && (
                            <li className="px-5 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
                                {t('activity.no_activity', {}, 'No activity entries found.')}
                            </li>
                        )}
                    </ol>
                </section>
            </div>
        </DashboardLayout>
    );
}
