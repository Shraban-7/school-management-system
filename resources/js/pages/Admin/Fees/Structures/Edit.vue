<script setup lang="ts">
import { Head, Link, router } from '@inertiajs/vue3';
import { reactive } from 'vue';
import DashboardLayout from '@/layouts/DashboardLayout.vue';
import AppIcon from '@/components/AppIcon.vue';
import { useSidebarStack } from '@/composables/useNavStack';
import type { SidebarConfig } from '@/types/sidebar';

defineOptions({ layout: DashboardLayout });

const props = defineProps<{
    structure: {
        id: number;
        institution_id: number;
        class_id: number;
        session_id: number | null;
        fee_type: string;
        name_en: string;
        name_bn: string | null;
        amount: number;
        is_active: boolean;
    };
    sidebar: SidebarConfig;
    classes: { value: number; label: string }[];
    sessions: { value: number; label: string }[];
    feeTypes: { value: string; label: string }[];
}>();

useSidebarStack().set(props.sidebar);

const form = reactive({ ...props.structure, name_bn: props.structure.name_bn ?? '' });

function submit() {
    router.put(`/admin/fees/structures/${props.structure.id}`, {
        class_id: Number(form.class_id),
        session_id: form.session_id ? Number(form.session_id) : null,
        fee_type: form.fee_type,
        name_en: form.name_en,
        name_bn: form.name_bn || null,
        amount: Number(form.amount),
        is_active: form.is_active,
    });
}
</script>

<template>
    <div>
        <Head title="Edit Fee Structure" />
        <div class="space-y-6">
            <header class="flex items-center gap-4">
                <Link href="/admin/fees/structures" class="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"><AppIcon name="arrow-left" class="h-5 w-5" /></Link>
                <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-50">Edit fee structure</h1>
            </header>
            <form class="max-w-xl space-y-4 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900" @submit.prevent="submit">
                <label class="block text-sm">Class<select v-model="form.class_id" class="mt-1 h-9 w-full rounded-md border px-3" required><option v-for="c in classes" :key="c.value" :value="c.value">{{ c.label }}</option></select></label>
                <label class="block text-sm">Fee type<select v-model="form.fee_type" class="mt-1 h-9 w-full rounded-md border px-3"><option v-for="t in feeTypes" :key="t.value" :value="t.value">{{ t.label }}</option></select></label>
                <label class="block text-sm">Name<input v-model="form.name_en" type="text" class="mt-1 h-9 w-full rounded-md border px-3" required /></label>
                <label class="block text-sm">Amount (BDT)<input v-model="form.amount" type="number" min="0" step="0.01" class="mt-1 h-9 w-full rounded-md border px-3" required /></label>
                <label class="flex items-center gap-2 text-sm"><input v-model="form.is_active" type="checkbox" /> Active</label>
                <button type="submit" class="rounded-md bg-accent-600 px-4 py-2 text-sm font-semibold text-white">Update</button>
            </form>
        </div>
    </div>
</template>
