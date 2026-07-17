<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3';
import DashboardLayout from '@/layouts/DashboardLayout.vue';
import AppIcon from '@/components/AppIcon.vue';
import { useSidebarStack } from '@/composables/useNavStack';
import type { SidebarConfig } from '@/types/sidebar';

defineOptions({ layout: DashboardLayout });

interface Child {
    id: number;
    name_en: string;
    roll_number: string | null;
    class_label: string | null;
    href: string;
}

const props = defineProps<{
    children: Child[];
    sidebar: SidebarConfig;
}>();

useSidebarStack().set(props.sidebar);
</script>

<template>
    <div>
        <Head title="Children's Results" />

        <div class="space-y-6">
            <header>
                <p
                    class="text-xs font-semibold tracking-widest text-slate-500 uppercase dark:text-slate-400"
                >
                    Results
                </p>
                <h1
                    class="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50"
                >
                    Choose a child
                </h1>
                <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    View published exam results for each of your children.
                </p>
            </header>

            <section class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Link
                    v-for="child in children"
                    :key="child.id"
                    :href="child.href"
                    class="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-accent-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-accent-700"
                >
                    <div
                        class="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-50 text-accent-600 dark:bg-accent-950/40 dark:text-accent-400"
                    >
                        <AppIcon name="user" class="h-5 w-5" />
                    </div>
                    <h2
                        class="mt-4 font-semibold text-slate-900 dark:text-slate-100"
                    >
                        {{ child.name_en }}
                    </h2>
                    <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {{ child.class_label ?? '—' }}
                        <span v-if="child.roll_number"
                            >&middot; Roll {{ child.roll_number }}</span
                        >
                    </p>
                </Link>

                <div
                    v-if="children.length === 0"
                    class="col-span-full rounded-xl border border-dashed border-slate-300 py-16 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400"
                >
                    No children are linked to your account yet.
                </div>
            </section>
        </div>
    </div>
</template>
