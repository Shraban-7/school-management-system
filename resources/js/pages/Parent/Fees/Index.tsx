import React, { useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useSidebarStack } from '@/composables/useNavStack';
import type { SidebarConfig } from '@/types/sidebar';

interface ChildSummary {
    id: number;
    name_en: string;
    roll_number: string | null;
    class_label: string | null;
    summary: {
        total_due: number;
        invoice_count: number;
        overdue_count: number;
    };
    href: string;
}

interface ParentFeesIndexProps {
    children: ChildSummary[];
    sidebar: SidebarConfig;
}

export default function ParentFeesIndex({
    children,
    sidebar,
}: ParentFeesIndexProps) {
    const sidebarStack = useSidebarStack();
    useEffect(() => {
        if (sidebar) {
            sidebarStack.set(sidebar);
        }
    }, [sidebar]);

    return (
        <DashboardLayout>
            <Head title="Fees" />
            <div className="space-y-6">
                <header>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                        Fee status
                    </h1>
                </header>
                <section className="grid gap-4 sm:grid-cols-2">
                    {children.map((child) => (
                        <Link
                            key={child.id}
                            href={child.href}
                            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-accent-300 dark:border-slate-800 dark:bg-slate-900"
                        >
                            <h2 className="font-semibold text-slate-900 dark:text-slate-100">
                                {child.name_en}
                            </h2>
                            <p className="mt-1 text-xs text-slate-500">
                                {child.class_label}
                            </p>
                            <p
                                className={`mt-3 text-lg font-bold ${
                                    child.summary.total_due > 0
                                        ? 'text-rose-600'
                                        : 'text-emerald-600'
                                }`}
                            >
                                ৳{child.summary.total_due.toLocaleString()} due
                            </p>
                            {child.summary.overdue_count > 0 && (
                                <p className="text-xs text-rose-500">
                                    {child.summary.overdue_count} overdue invoice(s)
                                </p>
                            )}
                        </Link>
                    ))}
                </section>
            </div>
        </DashboardLayout>
    );
}
