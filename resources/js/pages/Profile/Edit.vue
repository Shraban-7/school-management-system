<script setup lang="ts">
import { Head, router, usePage } from '@inertiajs/vue3';
import { computed, reactive, ref } from 'vue';
import DashboardLayout from '@/layouts/DashboardLayout.vue';
import AppIcon from '@/components/AppIcon.vue';
import { useI18n } from '@/composables/useI18n';

defineOptions({ layout: DashboardLayout });

interface Profile {
    name: string;
    email: string | null;
    phone: string;
    role: string;
    role_title: string;
    created_at: string | null;
}

const props = defineProps<{ profile: Profile }>();

const page = usePage();
const flash = computed(() => page.props.flash?.message ?? null);
const { t } = useI18n();

const infoForm = reactive({
    name: props.profile.name,
    email: props.profile.email ?? '',
    phone: props.profile.phone,
});
const infoErrors = ref<Record<string, string>>({});
const infoSaving = ref(false);

function submitInfo() {
    infoSaving.value = true;
    router.put(
        '/profile',
        {
            name: infoForm.name,
            email: infoForm.email || null,
            phone: infoForm.phone,
        },
        {
            preserveScroll: true,
            onError: (err) => {
                infoErrors.value = err;
            },
            onSuccess: () => {
                infoErrors.value = {};
            },
            onFinish: () => {
                infoSaving.value = false;
            },
        },
    );
}

const passwordForm = reactive({
    current_password: '',
    password: '',
    password_confirmation: '',
});
const passwordErrors = ref<Record<string, string>>({});
const passwordSaving = ref(false);

function submitPassword() {
    passwordSaving.value = true;
    router.put('/profile/password', passwordForm, {
        preserveScroll: true,
        onError: (err) => {
            passwordErrors.value = err;
        },
        onSuccess: () => {
            passwordErrors.value = {};
            passwordForm.current_password = '';
            passwordForm.password = '';
            passwordForm.password_confirmation = '';
        },
        onFinish: () => {
            passwordSaving.value = false;
        },
    });
}

const initial = computed(() => props.profile.name.trim().charAt(0).toUpperCase() || '?');

const inputClass =
    'mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100';
const labelClass = 'block text-sm font-medium text-slate-700 dark:text-slate-300';
const errorClass = 'mt-1 text-xs text-rose-500';
const sectionClass =
    'rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900';
</script>

<template>
    <div>
        <Head :title="t('profile.title')" />

        <div class="mx-auto max-w-3xl space-y-6">
            <header class="flex items-center gap-4">
                <span
                    class="flex h-14 w-14 items-center justify-center rounded-full bg-accent-600 text-xl font-bold text-white"
                    aria-hidden="true"
                >
                    {{ initial }}
                </span>
                <div>
                    <h1 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
                        {{ profile.name }}
                    </h1>
                    <p class="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                        {{ profile.role_title }}
                        <template v-if="profile.created_at">
                            · {{ t('profile.member_since', { date: profile.created_at }) }}
                        </template>
                    </p>
                </div>
            </header>

            <div
                v-if="flash"
                class="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
            >
                {{ flash }}
            </div>

            <!-- Profile information -->
            <form :class="sectionClass" @submit.prevent="submitInfo">
                <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">{{ t('profile.info_title') }}</h2>
                <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {{ t('profile.info_help') }}
                </p>

                <div class="mt-6 grid gap-6 sm:grid-cols-2">
                    <div class="sm:col-span-2">
                        <label for="name" :class="labelClass">{{ t('profile.name') }} <span class="text-rose-500">*</span></label>
                        <input
                            id="name"
                            v-model="infoForm.name"
                            type="text"
                            :class="[inputClass, { 'border-rose-500': infoErrors.name }]"
                        />
                        <p v-if="infoErrors.name" :class="errorClass">{{ infoErrors.name }}</p>
                    </div>

                    <div>
                        <label for="phone" :class="labelClass">{{ t('profile.phone') }} <span class="text-rose-500">*</span></label>
                        <input
                            id="phone"
                            v-model="infoForm.phone"
                            type="tel"
                            :class="[inputClass, { 'border-rose-500': infoErrors.phone }]"
                        />
                        <p v-if="infoErrors.phone" :class="errorClass">{{ infoErrors.phone }}</p>
                    </div>

                    <div>
                        <label for="email" :class="labelClass">{{ t('profile.email') }}</label>
                        <input
                            id="email"
                            v-model="infoForm.email"
                            type="email"
                            :class="[inputClass, { 'border-rose-500': infoErrors.email }]"
                        />
                        <p v-if="infoErrors.email" :class="errorClass">{{ infoErrors.email }}</p>
                    </div>
                </div>

                <div class="mt-6">
                    <button
                        type="submit"
                        :disabled="infoSaving"
                        class="inline-flex items-center gap-1.5 rounded-md bg-accent-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-700 disabled:opacity-60"
                    >
                        <AppIcon name="check" class="h-4 w-4" />
                        {{ infoSaving ? t('profile.saving') : t('profile.save') }}
                    </button>
                </div>
            </form>

            <!-- Change password -->
            <form :class="sectionClass" @submit.prevent="submitPassword">
                <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">{{ t('profile.password_title') }}</h2>
                <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {{ t('profile.password_help') }}
                </p>

                <div class="mt-6 grid gap-6 sm:grid-cols-2">
                    <div class="sm:col-span-2">
                        <label for="current_password" :class="labelClass">
                            {{ t('profile.current_password') }} <span class="text-rose-500">*</span>
                        </label>
                        <input
                            id="current_password"
                            v-model="passwordForm.current_password"
                            type="password"
                            autocomplete="current-password"
                            :class="[inputClass, { 'border-rose-500': passwordErrors.current_password }]"
                        />
                        <p v-if="passwordErrors.current_password" :class="errorClass">
                            {{ passwordErrors.current_password }}
                        </p>
                    </div>

                    <div>
                        <label for="password" :class="labelClass">
                            {{ t('profile.new_password') }} <span class="text-rose-500">*</span>
                        </label>
                        <input
                            id="password"
                            v-model="passwordForm.password"
                            type="password"
                            autocomplete="new-password"
                            :class="[inputClass, { 'border-rose-500': passwordErrors.password }]"
                        />
                        <p v-if="passwordErrors.password" :class="errorClass">{{ passwordErrors.password }}</p>
                    </div>

                    <div>
                        <label for="password_confirmation" :class="labelClass">
                            {{ t('profile.confirm_password') }} <span class="text-rose-500">*</span>
                        </label>
                        <input
                            id="password_confirmation"
                            v-model="passwordForm.password_confirmation"
                            type="password"
                            autocomplete="new-password"
                            :class="inputClass"
                        />
                    </div>
                </div>

                <div class="mt-6">
                    <button
                        type="submit"
                        :disabled="passwordSaving"
                        class="inline-flex items-center gap-1.5 rounded-md bg-accent-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-700 disabled:opacity-60"
                    >
                        <AppIcon name="key" class="h-4 w-4" />
                        {{ passwordSaving ? t('profile.updating') : t('profile.update_password') }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>
