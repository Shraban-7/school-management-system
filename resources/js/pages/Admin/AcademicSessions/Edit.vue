<script setup lang="ts">
import { Head, Link, router } from '@inertiajs/vue3';
import { reactive, ref } from 'vue';
import DashboardLayout from '@/layouts/DashboardLayout.vue';
import AppIcon from '@/components/AppIcon.vue';
import { useSidebarStack } from '@/composables/useNavStack';
import type { SidebarConfig } from '@/types/sidebar';

defineOptions({ layout: DashboardLayout });

const props = defineProps<{
    session: {
        id: number;
        session_name: string;
        start_date: string | null;
        end_date: string | null;
        is_active: boolean;
    };
    sidebar: SidebarConfig;
}>();

const sidebarStack = useSidebarStack();
sidebarStack.set(props.sidebar);

const form = reactive({
    session_name: props.session.session_name,
    start_date: props.session.start_date ?? '',
    end_date: props.session.end_date ?? '',
    is_active: props.session.is_active,
});

const errors = ref<Record<string, string>>({});

function submit() {
    router.put(`/admin/academic-sessions/${props.session.id}`, form, {
        onError: (err) => {
            errors.value = err;
        },
    });
}
</script>

<template>
    <div>
        <Head title="Edit Academic Session" />

        <div class="space-y-6">
            <header class="flex items-center gap-4">
                <Link
                    href="/admin/academic-sessions"
                    class="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                >
                    <AppIcon name="arrow-left" class="h-5 w-5" />
                </Link>
                <div>
                    <p
                        class="text-xs font-semibold tracking-widest text-slate-500 uppercase dark:text-slate-400"
                    >
                        Management
                    </p>
                    <h1
                        class="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50"
                    >
                        Edit academic session
                    </h1>
                    <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        {{ session.session_name }}
                    </p>
                </div>
            </header>

            <form @submit.prevent="submit" class="space-y-8">
                <section
                    class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                    <h2
                        class="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100"
                    >
                        Session details
                    </h2>

                    <div class="grid gap-6 sm:grid-cols-2">
                        <div class="sm:col-span-2">
                            <label
                                for="session_name"
                                class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Session name
                                <span class="text-rose-500">*</span>
                            </label>
                            <input
                                id="session_name"
                                v-model="form.session_name"
                                type="text"
                                placeholder="e.g. 2026-2027"
                                class="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                :class="{
                                    'border-rose-500': errors.session_name,
                                }"
                            />
                            <p
                                v-if="errors.session_name"
                                class="mt-1 text-xs text-rose-500"
                            >
                                {{ errors.session_name }}
                            </p>
                        </div>

                        <div>
                            <label
                                for="start_date"
                                class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Start date <span class="text-rose-500">*</span>
                            </label>
                            <input
                                id="start_date"
                                v-model="form.start_date"
                                type="date"
                                class="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                :class="{
                                    'border-rose-500': errors.start_date,
                                }"
                            />
                            <p
                                v-if="errors.start_date"
                                class="mt-1 text-xs text-rose-500"
                            >
                                {{ errors.start_date }}
                            </p>
                        </div>

                        <div>
                            <label
                                for="end_date"
                                class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                End date <span class="text-rose-500">*</span>
                            </label>
                            <input
                                id="end_date"
                                v-model="form.end_date"
                                type="date"
                                class="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                :class="{ 'border-rose-500': errors.end_date }"
                            />
                            <p
                                v-if="errors.end_date"
                                class="mt-1 text-xs text-rose-500"
                            >
                                {{ errors.end_date }}
                            </p>
                        </div>

                        <div class="flex items-center gap-3">
                            <input
                                id="is_active"
                                v-model="form.is_active"
                                type="checkbox"
                                class="h-4 w-4 rounded border-slate-300 text-accent-600 focus:ring-accent-500 dark:border-slate-600"
                            />
                            <label
                                for="is_active"
                                class="text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Set as active session
                            </label>
                        </div>
                    </div>
                </section>

                <div class="flex items-center gap-3">
                    <button
                        type="submit"
                        class="inline-flex items-center gap-1.5 rounded-md bg-accent-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-700"
                    >
                        <AppIcon name="check" class="h-4 w-4" />
                        Save changes
                    </button>
                    <Link
                        href="/admin/academic-sessions"
                        class="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    </div>
</template>
