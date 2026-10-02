import React, { useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import AppIcon from '@/components/AppIcon';
import { useSidebarStack } from '@/composables/useNavStack';
import { useI18n } from '@/composables/useI18n';
import type { SidebarConfig } from '@/types/sidebar';

interface Invoice {
    id: number;
    invoice_number: string;
    title_en: string;
    title_bn?: string | null;
    amount: number;
    paid_amount: number;
    balance: number;
    due_date: string | null;
    status: string;
    status_label: string;
}

interface ParentFeesChildProps {
    student: { id: number; name_en: string; name_bn?: string | null; roll_number: string | null };
    summary: {
        total_due: number;
        invoice_count: number;
        overdue_count: number;
    };
    invoices: Invoice[];
    sidebar: SidebarConfig;
}

export default function ParentFeesChild({
    student,
    summary,
    invoices,
    sidebar,
}: ParentFeesChildProps) {
    const { t, bi, formatNumber } = useI18n();
    const sidebarStack = useSidebarStack();
    useEffect(() => {
        if (sidebar) {
            sidebarStack.set(sidebar);
        }
    }, [sidebar]);

    return (
        <DashboardLayout>
            <Head title={`${t('fees.invoices')} - ${bi(student.name_en, student.name_bn)}`} />
            <div className="space-y-6">
                <header className="flex items-center gap-4">
                    <Link
                        href="/parent/fees"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"
                        title={t('common.back')}
                    >
                        <AppIcon name="arrow-left" className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                            {bi(student.name_en, student.name_bn)}
                        </h1>
                        <p className="text-sm text-slate-500">
                            {t('results.total_due', { amount: formatNumber(summary.total_due.toLocaleString()) })}
                        </p>
                    </div>
                </header>
                <section className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                    <table className="min-w-full text-sm">
                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                            <tr>
                                <th className="px-4 py-3">{t('results.invoice')}</th>
                                <th className="px-4 py-3">{t('fees.due_date')}</th>
                                <th className="px-4 py-3">{t('fees.amount')}</th>
                                <th className="px-4 py-3">{t('results.balance')}</th>
                                <th className="px-4 py-3">{t('fees.payment_status')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map((inv) => (
                                <tr key={inv.id} className="border-t">
                                    <td className="px-4 py-3">{bi(inv.title_en, inv.title_bn)}</td>
                                    <td className="px-4 py-3">{inv.due_date}</td>
                                    <td className="px-4 py-3 font-mono">
                                        ৳{formatNumber(inv.amount.toLocaleString())}
                                    </td>
                                    <td className="px-4 py-3 font-mono">
                                        ৳{formatNumber(inv.balance.toLocaleString())}
                                    </td>
                                    <td className="px-4 py-3">{inv.status_label}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
                <p className="text-xs text-slate-500">
                    {t('results.parent_fee_notice')}
                </p>
            </div>
        </DashboardLayout>
    );
}
