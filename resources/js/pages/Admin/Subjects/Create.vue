<script setup lang="ts">
import { Head, Link, router, usePage } from '@inertiajs/vue3';
import { computed, reactive, ref } from 'vue';
import DashboardLayout from '@/layouts/DashboardLayout.vue';
import AppIcon from '@/components/AppIcon.vue';
import { useSidebarStack } from '@/composables/useNavStack';
import type { SidebarConfig } from '@/types/sidebar';

defineOptions({ layout: DashboardLayout });

const props = defineProps<{
    sidebar: SidebarConfig;
    institutions: { value: number; label: string }[];
    groupStreams: string[];
    subjectTypes: string[];
    classLevels: string[];
}>();

const sidebarStack = useSidebarStack();
sidebarStack.set(props.sidebar);

const page = usePage();
const flash = computed(() => page.props.flash?.message ?? null);

const form = reactive({
    institution_id: '' as number | string,
    name_en: '',
    name_bn: '',
    code: '',
    class_level: '',
    group_stream: '',
    subject_type: '',
    full_marks: '' as number | string,
    pass_marks: '' as number | string,
    is_active: true,
});

const errors = ref<Record<string, string>>({});

function submit() {
    router.post(
        '/admin/subjects',
        {
            institution_id: Number(form.institution_id),
            name_en: form.name_en,
            name_bn: form.name_bn,
            code: form.code,
            class_level: form.class_level,
            group_stream: form.group_stream || null,
            subject_type: form.subject_type,
            full_marks: Number(form.full_marks),
            pass_marks: Number(form.pass_marks),
            is_active: form.is_active,
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
        <Head title="Create Subject" />

        <div class="space-y-6">
            <header class="flex items-center gap-4">
                <Link
                    href="/admin/subjects"
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
                        Create subject
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
                        Subject details
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
                                <span class="text-rose-500">*</span>
                            </label>
                            <input
                                id="name_bn"
                                v-model="form.name_bn"
                                type="text"
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
                                for="code"
                                class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Code <span class="text-rose-500">*</span>
                            </label>
                            <input
                                id="code"
                                v-model="form.code"
                                type="text"
                                class="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                :class="{ 'border-rose-500': errors.code }"
                            />
                            <p
                                v-if="errors.code"
                                class="mt-1 text-xs text-rose-500"
                            >
                                {{ errors.code }}
                            </p>
                        </div>

                        <div>
                            <label
                                for="class_level"
                                class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Class level <span class="text-rose-500">*</span>
                            </label>
                            <select
                                id="class_level"
                                v-model="form.class_level"
                                class="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                :class="{
                                    'border-rose-500': errors.class_level,
                                }"
                            >
                                <option value="" disabled>Select class</option>
                                <option
                                    v-for="cl in classLevels"
                                    :key="cl"
                                    :value="cl"
                                >
                                    {{ cl }}
                                </option>
                            </select>
                            <p
                                v-if="errors.class_level"
                                class="mt-1 text-xs text-rose-500"
                            >
                                {{ errors.class_level }}
                            </p>
                        </div>

                        <div>
                            <label
                                for="group_stream"
                                class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Group / Stream
                            </label>
                            <select
                                id="group_stream"
                                v-model="form.group_stream"
                                class="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                :class="{
                                    'border-rose-500': errors.group_stream,
                                }"
                            >
                                <option value="">None</option>
                                <option
                                    v-for="gs in groupStreams"
                                    :key="gs"
                                    :value="gs"
                                >
                                    {{ gs }}
                                </option>
                            </select>
                            <p
                                v-if="errors.group_stream"
                                class="mt-1 text-xs text-rose-500"
                            >
                                {{ errors.group_stream }}
                            </p>
                        </div>

                        <div>
                            <label
                                for="subject_type"
                                class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Subject type
                                <span class="text-rose-500">*</span>
                            </label>
                            <select
                                id="subject_type"
                                v-model="form.subject_type"
                                class="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                :class="{
                                    'border-rose-500': errors.subject_type,
                                }"
                            >
                                <option value="" disabled>Select type</option>
                                <option
                                    v-for="st in subjectTypes"
                                    :key="st"
                                    :value="st"
                                >
                                    {{ st }}
                                </option>
                            </select>
                            <p
                                v-if="errors.subject_type"
                                class="mt-1 text-xs text-rose-500"
                            >
                                {{ errors.subject_type }}
                            </p>
                        </div>

                        <div>
                            <label
                                for="full_marks"
                                class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Full marks <span class="text-rose-500">*</span>
                            </label>
                            <input
                                id="full_marks"
                                v-model="form.full_marks"
                                type="number"
                                class="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                :class="{
                                    'border-rose-500': errors.full_marks,
                                }"
                            />
                            <p
                                v-if="errors.full_marks"
                                class="mt-1 text-xs text-rose-500"
                            >
                                {{ errors.full_marks }}
                            </p>
                        </div>

                        <div>
                            <label
                                for="pass_marks"
                                class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Pass marks <span class="text-rose-500">*</span>
                            </label>
                            <input
                                id="pass_marks"
                                v-model="form.pass_marks"
                                type="number"
                                class="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                :class="{
                                    'border-rose-500': errors.pass_marks,
                                }"
                            />
                            <p
                                v-if="errors.pass_marks"
                                class="mt-1 text-xs text-rose-500"
                            >
                                {{ errors.pass_marks }}
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
                                Active
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
                        Create subject
                    </button>
                    <Link
                        href="/admin/subjects"
                        class="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    </div>
</template>
