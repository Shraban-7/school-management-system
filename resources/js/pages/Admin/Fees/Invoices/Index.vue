<script setup lang="ts">
import { Head, router, usePage } from '@inertiajs/vue3';
import { computed, reactive, ref } from 'vue';
import DashboardLayout from '@/layouts/DashboardLayout.vue';
import AppIcon from '@/components/AppIcon.vue';
import { useSidebarStack } from '@/composables/useNavStack';
import type { SidebarConfig } from '@/types/sidebar';

defineOptions({ layout: DashboardLayout });

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

const props = defineProps<{
    invoices: { data: InvoiceRow[] };
    filters: { status: string | null; from: string; to: string };
    statuses: { value: string; label: string }[];
    defaulters: Array<{ student_id: number; name_en: string; roll_number: string | null; class_label: string | null; overdue_amount: number; overdue_invoices: number }>;
    collectionReport: { total_collected: number; payment_count: number; by_method: Record<string, number> };
    sidebar: SidebarConfig;
}>();

useSidebarStack().set(props.sidebar);
const page = usePage();
const flash = computed(() => page.props.flash?.message ?? null);
const tab = ref<'invoices' | 'defaulters' | 'report'>('invoices');
const billingPeriod = ref(new Date().toISOString().slice(0, 7));
const showPayment = ref(false);
const paymentForm = reactive({
    student_id: '' as number | string,
    fee_invoice_id: '' as number | string | null,
    amount: '' as number | string,
    payment_method: 'cash',
    reference_number: '',
    paid_at: new Date().toISOString().slice(0, 10),
    remarks: '',
});

function generateInvoices() {
    router.post('/admin/fees/invoices/generate', {
        billing_period: billingPeriod.value,
    });
}

function openPayment(invoice: InvoiceRow) {
    paymentForm.fee_invoice_id = invoice.id;
    paymentForm.student_id = invoice.student_id;
    paymentForm.amount = invoice.balance;
    paymentForm.payment_method = 'cash';
    paymentForm.reference_number = '';
    showPayment.value = true;
}

function submitPayment() {
    router.post('/admin/fees/payments', {
        student_id: Number(paymentForm.student_id),
        fee_invoice_id: paymentForm.fee_invoice_id ? Number(paymentForm.fee_invoice_id) : null,
        amount: Number(paymentForm.amount),
        payment_method: paymentForm.payment_method,
        reference_number: paymentForm.reference_number || null,
        paid_at: paymentForm.paid_at,
        remarks: paymentForm.remarks || null,
    }, { onSuccess: () => { showPayment.value = false; } });
}

const statusClass = (status: string) =>
    status === 'paid' ? 'bg-emerald-50 text-emerald-700' : status === 'overdue' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700';
</script>

<template>
    <div>
        <Head title="Fee Invoices" />
        <div class="space-y-6">
            <header>
                <p class="text-xs font-semibold uppercase tracking-widest text-slate-500">Fees</p>
                <h1 class="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-50">Invoices &amp; collection</h1>
            </header>

            <div v-if="flash" class="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{{ flash }}</div>

            <div class="flex flex-wrap gap-2">
                <button v-for="t in [['invoices','Invoices'],['defaulters','Defaulters'],['report','Collection report']] as const" :key="t[0]" type="button" :class="['rounded-md px-3 py-1.5 text-sm font-medium', tab === t[0] ? 'bg-accent-600 text-white' : 'bg-slate-100 text-slate-600']" @click="tab = t[0]">{{ t[1] }}</button>
            </div>

            <div v-if="tab === 'invoices'" class="space-y-4">
                <form class="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900" @submit.prevent="generateInvoices">
                    <label class="text-sm">Billing month<input v-model="billingPeriod" type="month" class="ml-2 rounded-md border px-2 py-1" /></label>
                    <button type="submit" class="rounded-md bg-accent-600 px-3 py-1.5 text-sm font-semibold text-white">Generate monthly invoices</button>
                </form>
                <section class="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                    <table class="min-w-full text-sm">
                        <thead class="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th class="px-4 py-3">Invoice</th><th class="px-4 py-3">Student</th><th class="px-4 py-3">Due</th><th class="px-4 py-3">Balance</th><th class="px-4 py-3">Status</th><th class="px-4 py-3"></th></tr></thead>
                        <tbody>
                            <tr v-for="inv in invoices.data" :key="inv.id" class="border-t border-slate-100 dark:border-slate-800">
                                <td class="px-4 py-3"><div class="font-medium">{{ inv.invoice_number }}</div><div class="text-xs text-slate-500">{{ inv.title_en }}</div></td>
                                <td class="px-4 py-3">{{ inv.student_name }} <span class="text-xs text-slate-500">({{ inv.roll_number }})</span></td>
                                <td class="px-4 py-3">{{ inv.due_date }}</td>
                                <td class="px-4 py-3 font-mono">৳{{ inv.balance.toLocaleString() }}</td>
                                <td class="px-4 py-3"><span :class="['rounded-full px-2 py-0.5 text-xs font-medium', statusClass(inv.status)]">{{ inv.status_label }}</span></td>
                                <td class="px-4 py-3 text-right"><button v-if="inv.balance > 0" type="button" class="text-sm font-medium text-accent-600" @click="openPayment(inv)">Record payment</button></td>
                            </tr>
                        </tbody>
                    </table>
                </section>
            </div>

            <section v-else-if="tab === 'defaulters'" class="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <table class="min-w-full text-sm"><thead class="bg-slate-50 text-xs uppercase text-slate-500"><tr><th class="px-4 py-3">Student</th><th class="px-4 py-3">Class</th><th class="px-4 py-3">Overdue</th><th class="px-4 py-3">Invoices</th></tr></thead>
                    <tbody><tr v-for="d in defaulters" :key="d.student_id" class="border-t"><td class="px-4 py-3">{{ d.name_en }}</td><td class="px-4 py-3">{{ d.class_label }}</td><td class="px-4 py-3 font-mono text-rose-600">৳{{ d.overdue_amount.toLocaleString() }}</td><td class="px-4 py-3">{{ d.overdue_invoices }}</td></tr></tbody>
                </table>
            </section>

            <section v-else class="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <p class="text-2xl font-bold">৳{{ collectionReport.total_collected.toLocaleString() }}</p>
                <p class="text-sm text-slate-500">{{ collectionReport.payment_count }} payment(s) in selected period</p>
                <ul class="mt-4 space-y-1 text-sm"><li v-for="(amt, method) in collectionReport.by_method" :key="method">{{ method }}: ৳{{ amt.toLocaleString() }}</li></ul>
            </section>
        </div>

        <div v-if="showPayment" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <form class="w-full max-w-md space-y-3 rounded-xl bg-white p-6 dark:bg-slate-900" @submit.prevent="submitPayment">
                <h2 class="text-lg font-semibold">Record payment</h2>
                <label class="block text-sm">Student ID<input v-model="paymentForm.student_id" type="number" class="mt-1 w-full rounded-md border px-3 py-2" required /></label>
                <label class="block text-sm">Invoice ID<input v-model="paymentForm.fee_invoice_id" type="number" class="mt-1 w-full rounded-md border px-3 py-2" /></label>
                <label class="block text-sm">Amount<input v-model="paymentForm.amount" type="number" step="0.01" class="mt-1 w-full rounded-md border px-3 py-2" required /></label>
                <label class="block text-sm">Method<select v-model="paymentForm.payment_method" class="mt-1 w-full rounded-md border px-3 py-2"><option value="cash">Cash</option><option value="bkash">bKash</option><option value="nagad">Nagad</option><option value="rocket">Rocket</option><option value="bank_transfer">Bank transfer</option></select></label>
                <label v-if="paymentForm.payment_method !== 'cash'" class="block text-sm">Reference no.<input v-model="paymentForm.reference_number" type="text" class="mt-1 w-full rounded-md border px-3 py-2" required /></label>
                <label class="block text-sm">Paid on<input v-model="paymentForm.paid_at" type="date" class="mt-1 w-full rounded-md border px-3 py-2" required /></label>
                <div class="flex gap-2 pt-2"><button type="submit" class="rounded-md bg-accent-600 px-4 py-2 text-sm font-semibold text-white">Save</button><button type="button" class="rounded-md border px-4 py-2 text-sm" @click="showPayment = false">Cancel</button></div>
            </form>
        </div>
    </div>
</template>
