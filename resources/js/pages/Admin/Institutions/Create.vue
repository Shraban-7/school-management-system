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
    boards: string[];
}>();

const sidebarStack = useSidebarStack();
sidebarStack.set(props.sidebar);

const page = usePage();
const flash = computed(() => page.props.flash?.message ?? null);

const form = reactive({
    name_en: '',
    name_bn: '',
    eiin_number: '' as string | number,
    board_affiliation: '',
    mpo_status: false,
});

const errors = ref<Record<string, string>>({});

function submit() {
    router.post(
        '/admin/institutions',
        {
            name_en: form.name_en,
            name_bn: form.name_bn,
            eiin_number: Number(form.eiin_number),
            board_affiliation: form.board_affiliation,
            mpo_status: form.mpo_status,
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
        <Head title="Create Institution" />

        <div class="space-y-6">
            <header class="flex items-center gap-4">
                <Link
                    href="/admin/institutions"
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
                        Create institution
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
                        Institution details
                    </h2>

                    <div class="grid gap-6 sm:grid-cols-2">
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
                                for="eiin_number"
                                class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                EIIN number <span class="text-rose-500">*</span>
                            </label>
                            <input
                                id="eiin_number"
                                v-model="form.eiin_number"
                                type="number"
                                class="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                :class="{
                                    'border-rose-500': errors.eiin_number,
                                }"
                            />
                            <p
                                v-if="errors.eiin_number"
                                class="mt-1 text-xs text-rose-500"
                            >
                                {{ errors.eiin_number }}
                            </p>
                        </div>

                        <div>
                            <label
                                for="board_affiliation"
                                class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Board affiliation
                                <span class="text-rose-500">*</span>
                            </label>
                            <select
                                id="board_affiliation"
                                v-model="form.board_affiliation"
                                class="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                :class="{
                                    'border-rose-500': errors.board_affiliation,
                                }"
                            >
                                <option value="" disabled>Select board</option>
                                <option
                                    v-for="board in boards"
                                    :key="board"
                                    :value="board"
                                >
                                    {{ board }}
                                </option>
                            </select>
                            <p
                                v-if="errors.board_affiliation"
                                class="mt-1 text-xs text-rose-500"
                            >
                                {{ errors.board_affiliation }}
                            </p>
                        </div>

                        <div class="flex items-center gap-3">
                            <input
                                id="mpo_status"
                                v-model="form.mpo_status"
                                type="checkbox"
                                class="h-4 w-4 rounded border-slate-300 text-accent-600 focus:ring-accent-500 dark:border-slate-600"
                            />
                            <label
                                for="mpo_status"
                                class="text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                MPO status (Monthly Pay Order eligible)
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
                        Create institution
                    </button>
                    <Link
                        href="/admin/institutions"
                        class="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    </div>
</template>
