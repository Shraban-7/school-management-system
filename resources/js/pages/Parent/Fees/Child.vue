<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3';
import DashboardLayout from '@/layouts/DashboardLayout.vue';
import AppIcon from '@/components/AppIcon.vue';
import { useSidebarStack } from '@/composables/useNavStack';
import type { SidebarConfig } from '@/types/sidebar';

defineOptions({ layout: DashboardLayout });

const props = defineProps<{
    student: { id: number; name_en: string; roll_number: string | null };
    summary: { total_due: number; invoice_count: number; overdue_count: number };
    invoices: Array<{ id: number; invoice_number: string; title_en: string; amount: number; paid_amount: number; balance: number; due_date: string | null; status: string; status_label: string }>;
    sidebar: SidebarConfig;
}>();

useSidebarStack().set(props.sidebar);
</script>

<template>
    <div>
        <Head :title="`Fees - ${student.name_en}`" />
        <div class="space-y-6">
            <header class="flex items-center gap-4">
                <Link href="/parent/fees" class="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"><AppIcon name="arrow-left" class="h-5 w-5" /></Link>
                <div><h1 class="text-2xl font-bold text-slate-900 dark:text-slate-50">{{ student.name_en }}</h1><p class="text-sm text-slate-500">Total due: ৳{{ summary.total_due.toLocaleString() }}</p></div>
            </header>
            <section class="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <table class="min-w-full text-sm"><thead class="bg-slate-50 text-xs uppercase text-slate-500"><tr><th class="px-4 py-3">Invoice</th><th class="px-4 py-3">Due date</th><th class="px-4 py-3">Amount</th><th class="px-4 py-3">Balance</th><th class="px-4 py-3">Status</th></tr></thead>
                    <tbody><tr v-for="inv in invoices" :key="inv.id" class="border-t"><td class="px-4 py-3">{{ inv.title_en }}</td><td class="px-4 py-3">{{ inv.due_date }}</td><td class="px-4 py-3 font-mono">৳{{ inv.amount.toLocaleString() }}</td><td class="px-4 py-3 font-mono">৳{{ inv.balance.toLocaleString() }}</td><td class="px-4 py-3">{{ inv.status_label }}</td></tr></tbody>
                </table>
            </section>
            <p class="text-xs text-slate-500">Pay at the school office or via bKash/Nagad and share the reference number with the accounts section.</p>
        </div>
    </div>
</template>
