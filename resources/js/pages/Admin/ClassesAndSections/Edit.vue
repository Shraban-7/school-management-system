<script setup lang="ts">
import { Head, Link, router } from '@inertiajs/vue3';
import { reactive, ref } from 'vue';
import DashboardLayout from '@/layouts/DashboardLayout.vue';
import AppIcon from '@/components/AppIcon.vue';
import { useSidebarStack } from '@/composables/useNavStack';
import type { SidebarConfig } from '@/types/sidebar';

defineOptions({ layout: DashboardLayout });

const props = defineProps<{
    item: {
        id: number;
        institution_id: number;
        version: string;
        class_level: string;
        group_stream: string | null;
        section_name: string;
        room_number: string | null;
    };
    sidebar: SidebarConfig;
    institutions: { value: number; label: string }[];
    versions: string[];
    groupStreams: string[];
}>();

const sidebarStack = useSidebarStack();
sidebarStack.set(props.sidebar);

const form = reactive({
    institution_id: props.item.institution_id,
    version: props.item.version,
    class_level: props.item.class_level,
    group_stream: props.item.group_stream ?? '',
    section_name: props.item.section_name,
    room_number: props.item.room_number ?? '',
});

const errors = ref<Record<string, string>>({});

function submit() {
    router.put(
        `/admin/classes-and-sections/${props.item.id}`,
        {
            ...form,
            institution_id: Number(form.institution_id),
            group_stream: form.group_stream || null,
            room_number: form.room_number || null,
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
        <Head title="Edit Class & Section" />

        <div class="space-y-6">
            <header class="flex items-center gap-4">
                <Link
                    href="/admin/classes-and-sections"
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
                        Edit class & section
                    </h1>
                    <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        {{ item.class_level }} - {{ item.section_name }}
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
                        Class & section details
                    </h2>

                    <div class="grid gap-6 sm:grid-cols-2">
                        <div class="sm:col-span-2">
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
                                for="version"
                                class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Version <span class="text-rose-500">*</span>
                            </label>
                            <select
                                id="version"
                                v-model="form.version"
                                class="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                :class="{ 'border-rose-500': errors.version }"
                            >
                                <option value="" disabled>
                                    Select version
                                </option>
                                <option
                                    v-for="v in versions"
                                    :key="v"
                                    :value="v"
                                >
                                    {{ v }}
                                </option>
                            </select>
                            <p
                                v-if="errors.version"
                                class="mt-1 text-xs text-rose-500"
                            >
                                {{ errors.version }}
                            </p>
                        </div>

                        <div>
                            <label
                                for="class_level"
                                class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Class level <span class="text-rose-500">*</span>
                            </label>
                            <input
                                id="class_level"
                                v-model="form.class_level"
                                type="text"
                                placeholder="e.g. Class 9, XI (College)"
                                class="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                :class="{
                                    'border-rose-500': errors.class_level,
                                }"
                            />
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
                                Group / stream
                            </label>
                            <select
                                id="group_stream"
                                v-model="form.group_stream"
                                class="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                            >
                                <option value="">
                                    None (primary / general)
                                </option>
                                <option
                                    v-for="g in groupStreams"
                                    :key="g"
                                    :value="g"
                                >
                                    {{ g }}
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
                                for="section_name"
                                class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Section <span class="text-rose-500">*</span>
                            </label>
                            <input
                                id="section_name"
                                v-model="form.section_name"
                                type="text"
                                placeholder="e.g. A, B, C"
                                maxlength="5"
                                class="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                :class="{
                                    'border-rose-500': errors.section_name,
                                }"
                            />
                            <p
                                v-if="errors.section_name"
                                class="mt-1 text-xs text-rose-500"
                            >
                                {{ errors.section_name }}
                            </p>
                        </div>

                        <div>
                            <label
                                for="room_number"
                                class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Room number
                            </label>
                            <input
                                id="room_number"
                                v-model="form.room_number"
                                type="text"
                                placeholder="e.g. 201"
                                class="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                            />
                            <p
                                v-if="errors.room_number"
                                class="mt-1 text-xs text-rose-500"
                            >
                                {{ errors.room_number }}
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
                        Save changes
                    </button>
                    <Link
                        href="/admin/classes-and-sections"
                        class="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    </div>
</template>
