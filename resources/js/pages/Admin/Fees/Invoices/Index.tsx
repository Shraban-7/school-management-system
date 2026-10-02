import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useState, FormEvent } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useSidebarStack } from '@/composables/useNavStack';
import { useI18n } from '@/composables/useI18n';
import type { SidebarConfig } from '@/types/sidebar';

interface InvoiceRow {
    id: number;
    invoice_number: string;
    title_en: string;
    amount: number;
    paid_amount: number;
    balance: number;
    due_date: string | null;
    status: string;
    status_label: string;
    student_name: string | null;
    student_id: number;
    roll_number: string | null;
    class_label: string | null;
}

interface Props {
    invoices: { data: InvoiceRow[] };
    filters: { status: string | null; from: string; to: string };
    statuses: { value: string; label: string }[];
    defaulters: Array<{
        student_id: number;
        name_en: string;
        roll_number: string | null;
        class_label: string | null;
        overdue_amount: number;
        overdue_invoices: number;
    }>;
    collectionReport: {
        total_collected: number;
        payment_count: number;
        by_method: Record<string, number>;
    };
    sidebar: SidebarConfig;
}

export default function Index({
    invoices,
    defaulters,
    collectionReport,
    sidebar,
}: Props) {
    const { t, isBangla, formatNumber } = useI18n();
    const sidebarStack = useSidebarStack();
    useEffect(() => {
        sidebarStack.set(sidebar);
    }, [sidebar]);

    const { flash } = usePage<{ flash?: { message?: string } }>().props;
    const [tab, setTab] = useState<'invoices' | 'defaulters' | 'report'>('invoices');
    const [billingPeriod, setBillingPeriod] = useState(
        () => new Date().toISOString().slice(0, 7),
    );
    const [showPayment, setShowPayment] = useState(false);
    const [paymentForm, setPaymentForm] = useState({
        student_id: '' as number | string,
        fee_invoice_id: '' as number | string | null,
        amount: '' as number | string,
        payment_method: 'cash',
        reference_number: '',
        paid_at: new Date().toISOString().slice(0, 10),
        remarks: '',
    });

    function generateInvoices(e: FormEvent) {
        e.preventDefault();
        router.post('/admin/fees/invoices/generate', {
            billing_period: billingPeriod,
        });
    }

    function openPayment(invoice: InvoiceRow) {
        setPaymentForm({
            fee_invoice_id: invoice.id,
            student_id: invoice.student_id,
            amount: invoice.balance,
            payment_method: 'cash',
            reference_number: '',
            paid_at: new Date().toISOString().slice(0, 10),
            remarks: '',
        });
        setShowPayment(true);
    }

    function submitPayment(e: FormEvent) {
        e.preventDefault();
        router.post(
            '/admin/fees/payments',
            {
                student_id: Number(paymentForm.student_id),
                fee_invoice_id: paymentForm.fee_invoice_id
                    ? Number(paymentForm.fee_invoice_id)
                    : null,
                amount: Number(paymentForm.amount),
                payment_method: paymentForm.payment_method,
                reference_number: paymentForm.reference_number || null,
                paid_at: paymentForm.paid_at,
                remarks: paymentForm.remarks || null,
            },
            {
                onSuccess: () => {
                    setShowPayment(false);
                },
            },
        );
    }

    const statusClass = (status: string) =>
        status === 'paid'
            ? 'bg-emerald-50 text-emerald-700'
            : status === 'overdue'
              ? 'bg-rose-50 text-rose-700'
              : 'bg-amber-50 text-amber-700';

    return (
        <DashboardLayout>
            <Head title={t('fees.invoices', undefined, 'Fee Invoices')} />
            <div className="space-y-6">
                <header>
                    <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase">
                        {t('fees.title', undefined, 'Fees')}
                    </p>
                    <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-50">
                        {t('fees.invoices', undefined, 'Invoices & collection')}
                    </h1>
                </header>

                {flash?.message && (
                    <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                        {flash.message}
                    </div>
                )}

                <div className="flex flex-wrap gap-2">
                    {[
                        ['invoices', t('fees.invoices', undefined, 'Invoices')],
                        ['defaulters', isBangla ? 'বকেয়া তালিকা' : 'Defaulters'],
                        ['report', isBangla ? 'আদায় বিবরণী' : 'Collection report'],
                    ].map(([val, label]) => (
                        <button
                            key={val}
                            type="button"
                            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                                tab === val
                                    ? 'bg-accent-600 text-white'
                                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                            onClick={() => setTab(val as any)}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {tab === 'invoices' && (
                    <div className="space-y-4">
                        <form
                            className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
                            onSubmit={generateInvoices}
                        >
                            <label className="text-sm">
                                {isBangla ? 'বিলিং মাস: ' : 'Billing month: '}
                                <input
                                    value={billingPeriod}
                                    onChange={(e) => setBillingPeriod(e.target.value)}
                                    type="month"
                                    className="ml-2 rounded-md border px-2 py-1 dark:bg-slate-950 dark:border-slate-700"
                                />
                            </label>
                            <button
                                type="submit"
                                className="rounded-md bg-accent-600 px-3 py-1.5 text-sm font-semibold text-white"
                            >
                                {isBangla ? 'মাসিক ইনভয়েস তৈরি করুন' : 'Generate monthly invoices'}
                            </button>
                        </form>
                        <section className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                            <table className="min-w-full text-sm">
                                <thead className="bg-slate-50 text-left text-xs text-slate-500 uppercase dark:bg-slate-950/40 dark:text-slate-400">
                                    <tr>
                                        <th className="px-4 py-3">{t('fees.invoice_number', undefined, 'Invoice')}</th>
                                        <th className="px-4 py-3">{t('fees.student', undefined, 'Student')}</th>
                                        <th className="px-4 py-3">{t('fees.due_date', undefined, 'Due')}</th>
                                        <th className="px-4 py-3">{isBangla ? 'বকেয়া' : 'Balance'}</th>
                                        <th className="px-4 py-3">{t('fees.status', undefined, 'Status')}</th>
                                        <th className="px-4 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.data.map((inv) => (
                                        <tr
                                            key={inv.id}
                                            className="border-t border-slate-100 dark:border-slate-800"
                                        >
                                            <td className="px-4 py-3">
                                                <div className="font-medium">
                                                    {inv.invoice_number}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    {inv.title_en}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {inv.student_name}{' '}
                                                {inv.roll_number && (
                                                    <span className="text-xs text-slate-500">
                                                        ({isBangla ? formatNumber(inv.roll_number) : inv.roll_number})
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">{inv.due_date}</td>
                                            <td className="px-4 py-3 font-mono">
                                                ৳{formatNumber(inv.balance.toLocaleString())}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusClass(
                                                        inv.status,
                                                    )}`}
                                                >
                                                    {inv.status === 'paid' ? t('fees.paid', undefined, 'Paid') : inv.status === 'unpaid' ? t('fees.unpaid', undefined, 'Unpaid') : inv.status === 'partial' ? t('fees.partial', undefined, 'Partial') : inv.status === 'overdue' ? t('fees.overdue', undefined, 'Overdue') : inv.status_label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {inv.balance > 0 && (
                                                    <button
                                                        type="button"
                                                        className="text-sm font-medium text-accent-600 hover:underline"
                                                        onClick={() => openPayment(inv)}
                                                    >
                                                        {isBangla ? 'টাকা গ্রহণ করুন' : 'Record payment'}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </section>
                    </div>
                )}

                {tab === 'defaulters' && (
                    <section className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                        <table className="min-w-full text-sm">
                            <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                                <tr>
                                    <th className="px-4 py-3">{t('fees.student', {}, 'Student')}</th>
                                    <th className="px-4 py-3">{t('fees.class', {}, 'Class')}</th>
                                    <th className="px-4 py-3">{t('fees.overdue', {}, 'Overdue')}</th>
                                    <th className="px-4 py-3">{t('fees.overdue_invoices', {}, 'Invoices')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {defaulters.map((d) => (
                                    <tr key={d.student_id} className="border-t">
                                        <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{d.name_en}</td>
                                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{d.class_label}</td>
                                        <td className="px-4 py-3 font-mono font-bold text-rose-600">
                                            ৳{formatNumber(d.overdue_amount.toLocaleString())}
                                        </td>
                                        <td className="px-4 py-3 font-mono">{formatNumber(d.overdue_invoices)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                )}

                {tab === 'report' && (
                    <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            {t('fees.total_collected', {}, 'Total Collected')}
                        </p>
                        <p className="mt-1 text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                            ৳{formatNumber(collectionReport.total_collected.toLocaleString())}
                        </p>
                        <p className="mt-2 text-sm text-slate-500">
                            {t('fees.payments_in_period', { count: formatNumber(collectionReport.payment_count) }, `${formatNumber(collectionReport.payment_count)} payment(s) in selected period`)}
                        </p>
                        <ul className="mt-4 space-y-1.5 text-sm">
                            {Object.entries(collectionReport.by_method).map(([method, amt]) => (
                                <li key={method} className="flex justify-between border-b border-slate-100 py-1.5 dark:border-slate-800">
                                    <span className="text-slate-600 dark:text-slate-400">
                                        {t(`fees.methods.${method}`, {}, method)}
                                    </span>
                                    <span className="font-mono font-semibold text-slate-900 dark:text-white">
                                        ৳{formatNumber(amt.toLocaleString())}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </div>

            {showPayment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <form
                        className="w-full max-w-md space-y-3 rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900"
                        onSubmit={submitPayment}
                    >
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                            {t('fees.record_payment', {}, 'Record payment')}
                        </h2>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            {t('fees.student_id', {}, 'Student ID')}
                            <input
                                value={paymentForm.student_id}
                                onChange={(e) =>
                                    setPaymentForm({ ...paymentForm, student_id: e.target.value })
                                }
                                type="number"
                                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                                required
                            />
                        </label>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            {t('fees.invoice_id', {}, 'Invoice ID')}
                            <input
                                value={paymentForm.fee_invoice_id ?? ''}
                                onChange={(e) =>
                                    setPaymentForm({
                                        ...paymentForm,
                                        fee_invoice_id: e.target.value,
                                    })
                                }
                                type="number"
                                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                            />
                        </label>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            {t('fees.amount', {}, 'Amount')} (৳)
                            <input
                                value={paymentForm.amount}
                                onChange={(e) =>
                                    setPaymentForm({ ...paymentForm, amount: e.target.value })
                                }
                                type="number"
                                step="0.01"
                                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                                required
                            />
                        </label>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            {t('fees.payment_method', {}, 'Method')}
                            <select
                                value={paymentForm.payment_method}
                                onChange={(e) =>
                                    setPaymentForm({
                                        ...paymentForm,
                                        payment_method: e.target.value,
                                    })
                                }
                                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                            >
                                <option value="cash">{t('fees.methods.cash', {}, 'Cash')}</option>
                                <option value="bkash">{t('fees.methods.bkash', {}, 'bKash')}</option>
                                <option value="nagad">{t('fees.methods.nagad', {}, 'Nagad')}</option>
                                <option value="rocket">{t('fees.methods.rocket', {}, 'Rocket')}</option>
                                <option value="bank_transfer">{t('fees.methods.bank_transfer', {}, 'Bank transfer')}</option>
                            </select>
                        </label>
                        {paymentForm.payment_method !== 'cash' && (
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                {t('fees.reference_no', {}, 'Reference no.')}
                                <input
                                    value={paymentForm.reference_number}
                                    onChange={(e) =>
                                       setPaymentForm({
                                           ...paymentForm,
                                           reference_number: e.target.value,
                                       })
                                    }
                                    type="text"
                                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                                    required
                                />
                            </label>
                        )}
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            {t('fees.paid_on', {}, 'Paid on')}
                            <input
                                value={paymentForm.paid_at}
                                onChange={(e) =>
                                    setPaymentForm({ ...paymentForm, paid_at: e.target.value })
                                }
                                type="date"
                                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                                required
                            />
                        </label>
                        <div className="flex justify-end gap-2 pt-3">
                            <button
                                type="button"
                                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                                onClick={() => setShowPayment(false)}
                            >
                                {t('common.cancel', {}, 'Cancel')}
                            </button>
                            <button
                                type="submit"
                                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                            >
                                {t('common.save', {}, 'Save')}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </DashboardLayout>
    );
}
