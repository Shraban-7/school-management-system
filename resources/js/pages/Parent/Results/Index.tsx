import React, { useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import AppIcon from '@/components/AppIcon';
import { useSidebarStack } from '@/composables/useNavStack';
import { useI18n } from '@/composables/useI18n';
import type { SidebarConfig } from '@/types/sidebar';

interface Child {
    id: number;
    name_en: string;
    name_bn?: string | null;
    roll_number: string | null;
    class_label: string | null;
    href: string;
}

interface ParentResultsIndexProps {
    children: Child[];
    sidebar: SidebarConfig;
}

export default function ParentResultsIndex({
    children,
    sidebar,
}: ParentResultsIndexProps) {
    const { t, bi, formatNumber } = useI18n();
    const sidebarStack = useSidebarStack();
    useEffect(() => {
        if (sidebar) {
            sidebarStack.set(sidebar);
        }
    }, [sidebar]);

    return (
        <DashboardLayout>
            <Head title={`${t('results.title')} - ${t('results.choose_child')}`} />

            <div className="space-y-6">
                <header>
                    <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase dark:text-slate-400">
                        {t('results.title')}
                    </p>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
                        {t('results.choose_child')}
                    </h1>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        {t('results.parent_results_subtitle')}
                    </p>
                </header>

                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {children.map((child) => (
                        <Link
                            key={child.id}
                            href={child.href}
                            className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-accent-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-accent-700"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-50 text-accent-600 dark:bg-accent-950/40 dark:text-accent-400">
                                <AppIcon name="user" className="h-5 w-5" />
                            </div>
                            <h2 className="mt-4 font-semibold text-slate-900 dark:text-slate-100">
                                {bi(child.name_en, child.name_bn)}
                            </h2>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                {child.class_label ?? '—'}
                                {child.roll_number && (
                                    <span> · {t('results.roll')} {formatNumber(child.roll_number)}</span>
                                )}
                            </p>
                        </Link>
                    ))}

                    {children.length === 0 && (
                        <div className="col-span-full rounded-xl border border-dashed border-slate-300 py-16 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                            {t('results.no_children_linked')}
                        </div>
                    )}
                </section>
            </div>
        </DashboardLayout>
    );
}
