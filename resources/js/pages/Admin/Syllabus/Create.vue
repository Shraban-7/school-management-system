<script setup lang="ts">
import { Head, Link, router, usePage } from '@inertiajs/vue3';
import { computed, reactive, ref } from 'vue';
import DashboardLayout from '@/layouts/DashboardLayout.vue';
import AppIcon from '@/components/AppIcon.vue';
import { useSidebarStack } from '@/composables/useNavStack';
import type { SidebarConfig } from '@/types/sidebar';

defineOptions({ layout: DashboardLayout });

interface Option {
    value: number | string;
    label: string;
}

const props = defineProps<{
    sidebar: SidebarConfig;
    classes: Option[];
    sessions: Option[];
}>();

const sidebarStack = useSidebarStack();
sidebarStack.set(props.sidebar);

const page = usePage();
const flash = computed(() => page.props.flash?.message ?? null);

const form = reactive({
    class_id: '' as number | string,
    academic_session_id: '' as number | string,
    title: '',
    description: '',
});

const file = ref<File | null>(null);
const errors = ref<Record<string, string>>({});

function onFileChange(event: Event) {
    file.value = (event.target as HTMLInputElement).files?.[0] ?? null;
}

function submit() {
    router.post(
        '/admin/syllabus',
        {
            class_id: form.class_id,
            academic_session_id: form.academic_session_id,
            title: form.title,
            description: form.description,
            file: file.value,
        },
        {
            forceFormData: true,
            onError: (err) => {
                errors.value = err;
            },
        },
    );
}

const inputClass =
    'mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100';
const labelClass =
    'block text-sm font-medium text-slate-700 dark:text-slate-300';
const errorClass = 'mt-1 text-xs text-rose-500';
</script>

<template>
    <div>
        <Head title="Create Syllabus" />

        <div class="space-y-6">
            <header class="flex items-center gap-4">
                <Link
                    href="/admin/syllabus"
                    class="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                >
                    <AppIcon name="arrow-left" class="h-5 w-5" />
                </Link>
                <div>
                    <p
                        class="text-xs font-semibold tracking-widest text-slate-500 uppercase dark:text-slate-400"
                    >
                        Website
                    </p>
                    <h1
                        class="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50"
                    >
                        Create syllabus
                    </h1>
                </div>
            </header>

            <div
                v-if="flash"
                class="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
            >
                {{ flash }}
            </div>

            <form @submit.prevent="submit" class="space-y-8">
                <section
                    class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                    <h2
                        class="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100"
                    >
                        Syllabus details
                    </h2>

                    <div class="grid gap-6 sm:grid-cols-2">
                        <div>
                            <label for="class_id" :class="labelClass">
                                Class <span class="text-rose-500">*</span>
                            </label>
                            <select
                                id="class_id"
                                v-model="form.class_id"
                                :class="[
                                    inputClass,
                                    { 'border-rose-500': errors.class_id },
                                ]"
                            >
                                <option value="" disabled>Select class</option>
                                <option
                                    v-for="cls in classes"
                                    :key="cls.value"
                                    :value="cls.value"
                                >
                                    {{ cls.label }}
                                </option>
                            </select>
                            <p v-if="errors.class_id" :class="errorClass">
                                {{ errors.class_id }}
                            </p>
                        </div>

                        <div>
                            <label
                                for="academic_session_id"
                                :class="labelClass"
                            >
                                Session <span class="text-rose-500">*</span>
                            </label>
                            <select
                                id="academic_session_id"
                                v-model="form.academic_session_id"
                                :class="[
                                    inputClass,
                                    {
                                        'border-rose-500':
                                            errors.academic_session_id,
                                    },
                                ]"
                            >
                                <option value="" disabled>
                                    Select session
                                </option>
                                <option
                                    v-for="session in sessions"
                                    :key="session.value"
                                    :value="session.value"
                                >
                                    {{ session.label }}
                                </option>
                            </select>
                            <p
                                v-if="errors.academic_session_id"
                                :class="errorClass"
                            >
                                {{ errors.academic_session_id }}
                            </p>
                        </div>

                        <div class="sm:col-span-2">
                            <label for="title" :class="labelClass">
                                Title <span class="text-rose-500">*</span>
                            </label>
                            <input
                                id="title"
                                v-model="form.title"
                                type="text"
                                :class="[
                                    inputClass,
                                    { 'border-rose-500': errors.title },
                                ]"
                            />
                            <p v-if="errors.title" :class="errorClass">
                                {{ errors.title }}
                            </p>
                        </div>

                        <div class="sm:col-span-2">
                            <label for="description" :class="labelClass">
                                Description
                            </label>
                            <textarea
                                id="description"
                                v-model="form.description"
                                rows="4"
                                :class="[
                                    inputClass,
                                    { 'border-rose-500': errors.description },
                                ]"
                            />
                            <p v-if="errors.description" :class="errorClass">
                                {{ errors.description }}
                            </p>
                        </div>

                        <div class="sm:col-span-2">
                            <label for="file" :class="labelClass">
                                File (PDF) <span class="text-rose-500">*</span>
                            </label>
                            <input
                                id="file"
                                type="file"
                                accept="application/pdf"
                                class="mt-2 block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200 dark:text-slate-400 dark:file:bg-slate-800 dark:file:text-slate-300 dark:hover:file:bg-slate-700"
                                @change="onFileChange"
                            />
                            <p v-if="errors.file" :class="errorClass">
                                {{ errors.file }}
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
                        Create syllabus
                    </button>
                    <Link
                        href="/admin/syllabus"
                        class="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    </div>
</template>
