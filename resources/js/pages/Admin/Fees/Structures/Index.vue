<script setup lang="ts">
import { Head, Link, router, usePage } from '@inertiajs/vue3';
import { computed, ref } from 'vue';
import DashboardLayout from '@/layouts/DashboardLayout.vue';
import AppIcon from '@/components/AppIcon.vue';
import { useSidebarStack } from '@/composables/useNavStack';
import type { SidebarConfig } from '@/types/sidebar';

defineOptions({ layout: DashboardLayout });

interface StructureRow {
    id: number;
    fee_type: string;
    fee_type_label: string;
    name_en: string;
    name_bn: string | null;
    amount: number;
    is_active: boolean;
    class_label: string | null;
    institution_name: string | null;
    session_name: string | null;
}

const props = defineProps<{
    structures: { data: StructureRow[]; total: number };
    sidebar: SidebarConfig;
}>();

useSidebarStack().set(props.sidebar);
const page = usePage();
const flash = computed(() => page.props.flash?.message ?? null);

function destroy(id: number) {
    if (confirm('Delete this fee structure?')) {
        router.delete(`/admin/fees/structures/${id}`);
    }
}
</script>

<template>
    <div>
        <Head title="Fee Structures" />
        <div class="space-y-6">
            <header class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p class="text-xs font-semibold tracking-widest text-slate-500 uppercase dark:text-slate-400">Fees</p>
                    <h1 class="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-50">Fee structures</h1>
                    <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">Define admission, tuition, exam, and session fees per class.</p>
                </div>
                <Link href="/admin/fees/structures/create" class="inline-flex items-center gap-1.5 rounded-md bg-accent-600 px-3 py-2 text-sm font-semibold text-white hover:bg-accent-700">
                    <AppIcon name="plus" class="h-4 w-4" /> Add structure
                </Link>
            </header>

            <div v-if="flash" class="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">{{ flash }}</div>

            <section class="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
                        <thead class="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500 dark:bg-slate-950/40 dark:text-slate-400">
                            <tr>
                                <th class="px-4 py-3">Class</th>
                                <th class="px-4 py-3">Type</th>
                                <th class="px-4 py-3">Name</th>
                                <th class="px-4 py-3">Amount</th>
                                <th class="px-4 py-3">Status</th>
                                <th class="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                            <tr v-for="row in structures.data" :key="row.id" class="text-slate-700 dark:text-slate-200">
                                <td class="px-4 py-3">{{ row.class_label ?? '—' }}</td>
                                <td class="px-4 py-3 text-xs">{{ row.fee_type_label }}</td>
                                <td class="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{{ row.name_en }}</td>
                                <td class="px-4 py-3 font-mono">৳{{ row.amount.toLocaleString() }}</td>
                                <td class="px-4 py-3">
                                    <span :class="['rounded-full px-2 py-0.5 text-xs font-medium', row.is_active ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-slate-100 text-slate-500']">{{ row.is_active ? 'Active' : 'Inactive' }}</span>
                                </td>
                                <td class="px-4 py-3 text-right">
                                    <Link :href="`/admin/fees/structures/${row.id}/edit`" class="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><AppIcon name="pencil" class="h-4 w-4" /></Link>
                                    <button type="button" class="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-rose-50 hover:text-rose-600" @click="destroy(row.id)"><AppIcon name="trash" class="h-4 w-4" /></button>
                                </td>
                            </tr>
                            <tr v-if="structures.data.length === 0">
                                <td colspan="6" class="px-4 py-12 text-center text-slate-500">No fee structures yet.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    </div>
</template>
