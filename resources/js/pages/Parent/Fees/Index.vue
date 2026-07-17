<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3';
import DashboardLayout from '@/layouts/DashboardLayout.vue';
import AppIcon from '@/components/AppIcon.vue';
import { useSidebarStack } from '@/composables/useNavStack';
import type { SidebarConfig } from '@/types/sidebar';

defineOptions({ layout: DashboardLayout });

const props = defineProps<{
    children: Array<{ id: number; name_en: string; roll_number: string | null; class_label: string | null; summary: { total_due: number; invoice_count: number; overdue_count: number }; href: string }>;
    sidebar: SidebarConfig;
}>();

useSidebarStack().set(props.sidebar);
</script>

<template>
    <div>
        <Head title="Fees" />
        <div class="space-y-6">
            <header><h1 class="text-2xl font-bold text-slate-900 dark:text-slate-50">Fee status</h1></header>
            <section class="grid gap-4 sm:grid-cols-2">
                <Link v-for="child in children" :key="child.id" :href="child.href" class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-accent-300 dark:border-slate-800 dark:bg-slate-900">
                    <h2 class="font-semibold text-slate-900 dark:text-slate-100">{{ child.name_en }}</h2>
                    <p class="mt-1 text-xs text-slate-500">{{ child.class_label }}</p>
                    <p class="mt-3 text-lg font-bold" :class="child.summary.total_due > 0 ? 'text-rose-600' : 'text-emerald-600'">৳{{ child.summary.total_due.toLocaleString() }} due</p>
                    <p v-if="child.summary.overdue_count" class="text-xs text-rose-500">{{ child.summary.overdue_count }} overdue invoice(s)</p>
                </Link>
            </section>
        </div>
    </div>
</template>
