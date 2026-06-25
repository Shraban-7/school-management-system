<script setup lang="ts">
import { Head, Link, router } from '@inertiajs/vue3';
import { reactive, ref } from 'vue';
import DashboardLayout from '@/layouts/DashboardLayout.vue';
import AppIcon from '@/components/AppIcon.vue';
import { useSidebarStack } from '@/composables/useNavStack';
import type { SidebarConfig } from '@/types/sidebar';

defineOptions({ layout: DashboardLayout });

const props = defineProps<{
    sidebar: SidebarConfig;
    institutions: { value: number; label: string }[];
    sessions: { value: number; label: string }[];
    examTypes: string[];
}>();

const sidebarStack = useSidebarStack();
sidebarStack.set(props.sidebar);

const form = reactive({
    institution_id: '' as string | number,
    session_id: '' as string | number,
    name_en: '',
    name_bn: '',
    exam_type: '',
    start_date: '',
    end_date: '',
    is_published: false,
    description: '',
});

const errors = ref<Record<string, string>>({});

function submit() {
    router.post(
        '/admin/exams',
        {
            ...form,
            institution_id: Number(form.institution_id),
            session_id: Number(form.session_id),
        },
        {
            onError: (err) => {
                errors.value = err;
            },
        },
    );
}
</script>

<template>
    <div>
        <Head title="Create Exam" />

        <div class="space-y-6">
            <header class="flex items-center gap-4">
                <Link
                    href="/admin/exams"
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
                        Create exam
                    </h1>
                </div>
            </header>

            <form @submit.prevent="submit" class="space-y-8">
                <section
                    class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                    <h2
                        class="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100"
                    >
                        Exam details
                    </h2>

                    <div class="grid gap-6 sm:grid-cols-2">
                        <div>
                            <label
                                for="institution_id"
                                class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Institution <span class="text-rose-500">*</span>
                            </label>
                            <select
                                id="institution_id"
                                v-model="form.institution_id"
                                class="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                :class="{
                                    'border-rose-500': errors.institution_id,
                                }"
                            >
                                <option value="" disabled>
                                    Select institution
                                </option>
                                <option
                                    v-for="inst in institutions"
                                    :key="inst.value"
                                    :value="inst.value"
                                >
                                    {{ inst.label }}
                                </option>
                            </select>
                            <p
                                v-if="errors.institution_id"
                                class="mt-1 text-xs text-rose-500"
                            >
                                {{ errors.institution_id }}
                            </p>
                        </div>

                        <div>
                            <label
                                for="session_id"
                                class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Session <span class="text-rose-500">*</span>
                            </label>
                            <select
                                id="session_id"
                                v-model="form.session_id"
                                class="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                :class="{
                                    'border-rose-500': errors.session_id,
                                }"
                            >
                                <option value="" disabled>
                                    Select session
                                </option>
                                <option
                                    v-for="s in sessions"
                                    :key="s.value"
                                    :value="s.value"
                                >
                                    {{ s.label }}
                                </option>
                            </select>
                            <p
                                v-if="errors.session_id"
                                class="mt-1 text-xs text-rose-500"
                            >
                                {{ errors.session_id }}
                            </p>
                        </div>

                        <div>
                            <label
                                for="name_en"
                                class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Name (English)
                                <span class="text-rose-500">*</span>
                            </label>
                            <input
                                id="name_en"
                                v-model="form.name_en"
                                type="text"
                                placeholder="e.g. Half Yearly Exam 2026"
                                class="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                :class="{ 'border-rose-500': errors.name_en }"
                            />
                            <p
                                v-if="errors.name_en"
                                class="mt-1 text-xs text-rose-500"
                            >
                                {{ errors.name_en }}
                            </p>
                        </div>

                        <div>
                            <label
                                for="name_bn"
                                class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Name (Bangla)
                            </label>
                            <input
                                id="name_bn"
                                v-model="form.name_bn"
                                type="text"
                                placeholder="পরীক্ষার নাম"
                                class="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                :class="{ 'border-rose-500': errors.name_bn }"
                            />
                            <p
                                v-if="errors.name_bn"
                                class="mt-1 text-xs text-rose-500"
                            >
                                {{ errors.name_bn }}
                            </p>
                        </div>

                        <div>
                            <label
                                for="exam_type"
                                class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Exam type <span class="text-rose-500">*</span>
                            </label>
                            <select
                                id="exam_type"
                                v-model="form.exam_type"
                                class="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                :class="{ 'border-rose-500': errors.exam_type }"
                            >
                                <option value="" disabled>Select type</option>
                                <option
                                    v-for="t in examTypes"
                                    :key="t"
                                    :value="t"
                                >
                                    {{ t }}
                                </option>
                            </select>
                            <p
                                v-if="errors.exam_type"
                                class="mt-1 text-xs text-rose-500"
                            >
                                {{ errors.exam_type }}
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
                                id="is_published"
                                v-model="form.is_published"
                                type="checkbox"
                                class="h-4 w-4 rounded border-slate-300 text-accent-600 focus:ring-accent-500 dark:border-slate-600"
                            />
                            <label
                                for="is_published"
                                class="text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Published (visible to students & teachers)
                            </label>
                        </div>

                        <div class="sm:col-span-2">
                            <label
                                for="description"
                                class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Description
                            </label>
                            <textarea
                                id="description"
                                v-model="form.description"
                                rows="3"
                                placeholder="Optional notes about this exam…"
                                class="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                :class="{
                                    'border-rose-500': errors.description,
                                }"
                            />
                            <p
                                v-if="errors.description"
                                class="mt-1 text-xs text-rose-500"
                            >
                                {{ errors.description }}
                            </p>
                        </div>
                    </div>
                </section>

                <div class="flex items-center gap-3">
                    <button
                        type="submit"
                        class="inline-flex items-center gap-1.5 rounded-md bg-accent-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-700"
                    >
                        <AppIcon name="check" class="h-4 w-4" />
                        Create exam
                    </button>
                    <Link
                        href="/admin/exams"
                        class="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    </div>
</template>
