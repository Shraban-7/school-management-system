<script setup lang="ts">
import { Head } from '@inertiajs/vue3';
import { ref } from 'vue';
import DashboardLayout from '@/layouts/DashboardLayout.vue';
import AppIcon from '@/components/AppIcon.vue';
import { useSidebarStack } from '@/composables/useNavStack';
import type { SidebarConfig } from '@/types/sidebar';

defineOptions({ layout: DashboardLayout });

type Field = {
    key: string;
    label: string;
    value: string | number | boolean;
    type: 'text' | 'email' | 'number' | 'toggle' | 'select';
    options?: string[];
};

const props = defineProps<{
    groups: { title: string; fields: Field[] }[];
    sidebar: SidebarConfig;
}>();

const sidebarStack = useSidebarStack();
sidebarStack.set(props.sidebar);

const values = ref<Record<string, string | number | boolean>>(
    Object.fromEntries(
        props.groups.flatMap((group) =>
            group.fields.map((field) => [field.key, field.value]),
        ),
    ),
);
</script>

<template>
    <div>
        <Head title="Settings" />

        <div class="space-y-6">
            <header
                class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
            >
                <div>
                    <p
                        class="text-xs font-semibold tracking-widest text-slate-500 uppercase dark:text-slate-400"
                    >
                        System
                    </p>
                    <h1
                        class="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50"
                    >
                        Settings
                    </h1>
                    <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        Control application variables, integrations, and
                        defaults.
                    </p>
                </div>
                <button
                    type="button"
                    class="inline-flex items-center gap-1.5 self-start rounded-md bg-accent-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-700 sm:self-auto"
                >
                    <AppIcon name="check" class="h-4 w-4" />
                    Save changes
                </button>
            </header>

            <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <section
                    v-for="group in groups"
                    :key="group.title"
                    class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                    <h2
                        class="text-base font-semibold text-slate-900 dark:text-slate-100"
                    >
                        {{ group.title }}
                    </h2>
                    <dl class="mt-4 space-y-4">
                        <div
                            v-for="field in group.fields"
                            :key="field.key"
                            class="flex items-center justify-between gap-4"
                        >
                            <label
                                :for="`field-${field.key}`"
                                class="text-sm font-medium text-slate-700 dark:text-slate-200"
                            >
                                {{ field.label }}
                            </label>
                            <div class="max-w-xs flex-1">
                                <input
                                    v-if="
                                        field.type === 'text' ||
                                        field.type === 'email' ||
                                        field.type === 'number'
                                    "
                                    :id="`field-${field.key}`"
                                    v-model="values[field.key]"
                                    :type="field.type"
                                    class="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                />
                                <button
                                    v-else-if="field.type === 'toggle'"
                                    type="button"
                                    role="switch"
                                    :aria-checked="!!values[field.key]"
                                    :class="[
                                        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition',
                                        values[field.key]
                                            ? 'bg-accent-600'
                                            : 'bg-slate-200 dark:bg-slate-700',
                                    ]"
                                    @click="
                                        values[field.key] = !values[field.key]
                                    "
                                >
                                    <span
                                        :class="[
                                            'inline-block h-4 w-4 transform rounded-full bg-white transition',
                                            values[field.key]
                                                ? 'translate-x-6'
                                                : 'translate-x-1',
                                        ]"
                                    />
                                </button>
                            </div>
                        </div>
                    </dl>
                </section>
            </div>
        </div>
    </div>
</template>
