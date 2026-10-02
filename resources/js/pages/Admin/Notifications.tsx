import React, { useMemo, useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import AppIcon from '@/components/AppIcon';
import { useSidebarStack } from '@/composables/useNavStack';
import { useI18n } from '@/composables/useI18n';
import type { SidebarConfig } from '@/types/sidebar';

type Level = 'info' | 'success' | 'warning' | 'danger';

interface Notification {
    id: number;
    title: string;
    body: string;
    time: string;
    level: Level;
    read: boolean;
}

interface AdminNotificationsProps {
    items: Notification[];
    sidebar: SidebarConfig;
}

export default function AdminNotifications({
    items,
    sidebar,
}: AdminNotificationsProps) {
    const { t, formatNumber } = useI18n();
    const sidebarStack = useSidebarStack();
    useEffect(() => {
        if (sidebar) {
            sidebarStack.set(sidebar);
        }
    }, [sidebar]);

    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    const filtered = useMemo(() => {
        return filter === 'unread' ? items.filter((n) => !n.read) : items;
    }, [filter, items]);

    const unreadCount = useMemo(() => items.filter((n) => !n.read).length, [items]);

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

    return (
        <DashboardLayout>
            <Head title={t('notifications.title', {}, 'Notifications')} />

            <div className="space-y-6">
                <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase dark:text-slate-400">
                            {t('sidebar.system', {}, 'System')}
                        </p>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
                            {t('notifications.title', {}, 'Notifications')}
                        </h1>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            {t('notifications.unread_count', { unread: formatNumber(unreadCount), total: formatNumber(items.length) }, `${formatNumber(unreadCount)} unread of ${formatNumber(items.length)} total`)}
                        </p>
                    </div>
                    <div className="inline-flex rounded-md border border-slate-200 bg-white p-0.5 dark:border-slate-700 dark:bg-slate-900">
                        <button
                            type="button"
                            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                                filter === 'all'
                                    ? 'bg-accent-600 text-white shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100'
                            }`}
                            onClick={() => setFilter('all')}
                        >
                            {t('common.all', {}, 'All')}
                        </button>
                        <button
                            type="button"
                            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                                filter === 'unread'
                                    ? 'bg-accent-600 text-white shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100'
                            }`}
                            onClick={() => setFilter('unread')}
                        >
                            {t('notifications.unread', {}, 'Unread')}
                        </button>
                    </div>
                </header>

                <section className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filtered.map((notification) => (
                            <li
                                key={notification.id}
                                className={`flex items-start gap-4 px-5 py-4 transition ${
                                    !notification.read
                                        ? 'bg-accent-50/30 dark:bg-accent-950/10'
                                        : ''
                                }`}
                            >
                                <span
                                    className={`mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${levelClass(
                                        notification.level,
                                    )}`}
                                >
                                    <AppIcon
                                        name={levelIcon(notification.level)}
                                        className="h-5 w-5"
                                    />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                        {notification.title}
                                    </p>
                                    <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">
                                        {notification.body}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                        {notification.time}
                                    </p>
                                </div>
                                {!notification.read && (
                                    <button
                                        type="button"
                                        className="inline-flex h-7 items-center rounded-md border border-slate-200 px-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                                    >
                                        {t('notifications.mark_read', {}, 'Mark read')}
                                    </button>
                                )}
                            </li>
                        ))}
                        {filtered.length === 0 && (
                            <li className="px-5 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
                                {t('notifications.no_notifications', {}, 'No notifications to show.')}
                            </li>
                        )}
                    </ul>
                </section>
            </div>
        </DashboardLayout>
    );
}
