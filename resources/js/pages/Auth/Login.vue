<script setup lang="ts">
import { Form, Head, usePage } from '@inertiajs/vue3';
import { computed, ref } from 'vue';
import { useI18n } from '@/composables/useI18n';
import AppIcon from '@/components/AppIcon.vue';
import LanguageSwitcher from '@/components/LanguageSwitcher.vue';
import ThemeToggle from '@/components/ThemeToggle.vue';

interface PublicSchool {
    name_en?: string | null;
    name_bn?: string | null;
    eiin_number?: string | number | null;
    logo_url?: string | null;
    phone?: string | null;
    email?: string | null;
    office_hours?: string | null;
}

const page = usePage();
const { t, bi } = useI18n();

const school = computed<PublicSchool>(
    () =>
        ((page.props as Record<string, unknown>).school as PublicSchool) ?? {},
);

const schoolName = computed(
    () =>
        bi(school.value.name_en, school.value.name_bn) ||
        'School Management System',
);
const crestInitial = computed(
    () => schoolName.value.trim().charAt(0).toUpperCase() || 'S',
);

const flash = computed(() => {
    const props = page.props as Record<string, unknown>;
    const value = props.flash as
        | { message?: string | null; error?: string | null }
        | undefined;
    return { message: value?.message ?? null, error: value?.error ?? null };
});

const showPassword = ref(false);
const showDemoAccounts = ref(false);

const demoAccounts = [
    {
        role: 'Administrator',
        phone: '+8801100000000',
        password: 'password',
        tone: 'text-rose-600 dark:text-rose-400',
    },
    {
        role: 'Teacher',
        phone: '+8801100000002',
        password: 'password',
        tone: 'text-emerald-600 dark:text-emerald-400',
    },
    {
        role: 'Student',
        phone: '+8801100000003',
        password: 'password',
        tone: 'text-sky-600 dark:text-sky-400',
    },
    {
        role: 'Parent / Guardian',
        phone: '+8801100000005',
        password: 'password',
        tone: 'text-amber-600 dark:text-amber-400',
    },
];

const selectedPhone = ref('');
const selectedPassword = ref('');

function fillDemo(phone: string, pass: string) {
    selectedPhone.value = phone;
    selectedPassword.value = pass;
}
</script>

<template>
    <div
        class="flex min-h-screen flex-col justify-between bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100"
    >
        <Head :title="t('nav.login')" />

        <!-- Top navigation bar -->
        <header
            class="flex items-center justify-between border-b border-slate-200/60 bg-white/70 px-6 py-4 backdrop-blur-md dark:border-slate-800/60 dark:bg-slate-900/70"
        >
            <div class="flex items-center gap-3">
                <img
                    v-if="school.logo_url"
                    :src="school.logo_url"
                    :alt="schoolName"
                    class="h-9 w-9 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                />
                <span
                    v-else
                    class="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-600 text-sm font-bold text-white shadow-xs"
                >
                    {{ crestInitial }}
                </span>
                <div>
                    <span
                        class="block text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100"
                    >
                        {{ schoolName }}
                    </span>
                    <span
                        v-if="school.eiin_number"
                        class="text-[10px] font-semibold tracking-wider text-slate-400 uppercase"
                    >
                        EIIN {{ school.eiin_number }}
                    </span>
                </div>
            </div>

            <div class="flex items-center gap-2">
                <LanguageSwitcher variant="dashboard" />
                <ThemeToggle />
            </div>
        </header>

        <!-- Main Login Card Area -->
        <main
            class="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8"
        >
            <div class="w-full max-w-md space-y-6">
                <!-- Branding Card Header -->
                <div class="text-center">
                    <div
                        class="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-accent-500 to-accent-700 text-2xl font-bold text-white shadow-lg ring-4 shadow-accent-600/20 ring-white dark:ring-slate-900"
                    >
                        <img
                            v-if="school.logo_url"
                            :src="school.logo_url"
                            :alt="schoolName"
                            class="h-16 w-16 rounded-2xl object-cover"
                        />
                        <span v-else>{{ crestInitial }}</span>
                    </div>

                    <h1
                        class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50"
                    >
                        {{ t('auth.portal_login') }}
                    </h1>
                    <p class="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        {{ t('auth.sign_in_subtitle', { school: schoolName }) }}
                    </p>
                </div>

                <!-- Card container -->
                <div
                    class="rounded-2xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/40"
                >
                    <!-- Flash messages -->
                    <div
                        v-if="flash.message"
                        class="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
                    >
                        {{ flash.message }}
                    </div>
                    <div
                        v-if="flash.error"
                        class="mb-5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300"
                    >
                        {{ flash.error }}
                    </div>

                    <Form
                        action="/login"
                        method="post"
                        #default="{ errors, processing }"
                        class="space-y-4"
                    >
                        <div>
                            <label
                                for="phone"
                                class="block text-xs font-semibold tracking-wider text-slate-700 uppercase dark:text-slate-300"
                            >
                                {{ t('auth.phone') }}
                            </label>
                            <div class="relative mt-1.5">
                                <span
                                    class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"
                                >
                                    <AppIcon name="phone" class="h-4 w-4" />
                                </span>
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    inputmode="tel"
                                    autocomplete="tel"
                                    required
                                    autofocus
                                    :value="selectedPhone"
                                    @input="
                                        selectedPhone = (
                                            $event.target as HTMLInputElement
                                        ).value
                                    "
                                    placeholder="+8801XXXXXXXXX"
                                    :class="[
                                        'block w-full rounded-lg border bg-white py-2.5 pr-3 pl-9 text-sm transition focus:ring-2 focus:outline-none dark:bg-slate-950 dark:text-slate-100',
                                        errors.phone
                                            ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200 dark:border-rose-700'
                                            : 'border-slate-200 focus:border-accent-500 focus:ring-accent-500/20 dark:border-slate-700',
                                    ]"
                                />
                            </div>
                            <p
                                v-if="errors.phone"
                                class="mt-1 text-xs text-rose-600 dark:text-rose-400"
                            >
                                {{ errors.phone }}
                            </p>
                        </div>

                        <div>
                            <label
                                for="password"
                                class="block text-xs font-semibold tracking-wider text-slate-700 uppercase dark:text-slate-300"
                            >
                                {{ t('auth.password') }}
                            </label>
                            <div class="relative mt-1.5">
                                <span
                                    class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"
                                >
                                    <AppIcon name="lock" class="h-4 w-4" />
                                </span>
                                <input
                                    id="password"
                                    name="password"
                                    :type="showPassword ? 'text' : 'password'"
                                    autocomplete="current-password"
                                    required
                                    :value="selectedPassword"
                                    @input="
                                        selectedPassword = (
                                            $event.target as HTMLInputElement
                                        ).value
                                    "
                                    placeholder="••••••••"
                                    :class="[
                                        'block w-full rounded-lg border bg-white py-2.5 pr-10 pl-9 text-sm transition focus:ring-2 focus:outline-none dark:bg-slate-950 dark:text-slate-100',
                                        errors.password
                                            ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200 dark:border-rose-700'
                                            : 'border-slate-200 focus:border-accent-500 focus:ring-accent-500/20 dark:border-slate-700',
                                    ]"
                                />
                                <button
                                    type="button"
                                    class="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                    @click="showPassword = !showPassword"
                                    :aria-label="
                                        showPassword
                                            ? 'Hide password'
                                            : 'Show password'
                                    "
                                >
                                    <AppIcon
                                        :name="showPassword ? 'eye-off' : 'eye'"
                                        class="h-4 w-4"
                                    />
                                </button>
                            </div>
                            <p
                                v-if="errors.password"
                                class="mt-1 text-xs text-rose-600 dark:text-rose-400"
                            >
                                {{ errors.password }}
                            </p>
                        </div>

                        <div class="flex items-center justify-between pt-1">
                            <label
                                class="flex cursor-pointer items-center gap-2"
                            >
                                <input
                                    id="remember"
                                    name="remember"
                                    type="checkbox"
                                    value="1"
                                    class="h-4 w-4 rounded border-slate-300 text-accent-600 focus:ring-accent-500/30 dark:border-slate-700 dark:bg-slate-950"
                                />
                                <span
                                    class="text-xs text-slate-600 dark:text-slate-400"
                                >
                                    {{ t('auth.remember') }}
                                </span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            :disabled="processing"
                            class="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-accent-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent-700 focus:ring-2 focus:ring-accent-500/40 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <AppIcon
                                v-if="processing"
                                name="clock"
                                class="h-4 w-4 animate-spin"
                            />
                            <span>{{
                                processing
                                    ? t('auth.signing_in')
                                    : t('auth.sign_in')
                            }}</span>
                        </button>
                    </Form>

                    <!-- Demo helper dropdown/toggle for convenient review -->
                    <div
                        class="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800"
                    >
                        <button
                            type="button"
                            @click="showDemoAccounts = !showDemoAccounts"
                            class="flex w-full items-center justify-between text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                        >
                            <span>Quick Demo Accounts (Click to fill)</span>
                            <AppIcon
                                :name="
                                    showDemoAccounts
                                        ? 'chevron-up'
                                        : 'chevron-down'
                                "
                                class="h-3.5 w-3.5"
                            />
                        </button>

                        <div v-if="showDemoAccounts" class="mt-3 space-y-1.5">
                            <button
                                v-for="demo in demoAccounts"
                                :key="demo.phone"
                                type="button"
                                @click="fillDemo(demo.phone, demo.password)"
                                class="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs transition hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <span class="font-medium" :class="demo.tone">{{
                                    demo.role
                                }}</span>
                                <span
                                    class="font-mono text-slate-500 dark:text-slate-400"
                                    >{{ demo.phone }}</span
                                >
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Footer help note -->
                <p
                    v-if="school.phone || school.email"
                    class="text-center text-xs text-slate-500 dark:text-slate-400"
                >
                    {{ t('auth.trouble') }}
                    <template v-if="school.phone">
                        {{ t('auth.at') }}
                        <span class="font-semibold">{{
                            school.phone
                        }}</span></template
                    >
                    <template v-if="school.email">
                        {{ t('auth.or') }}
                        <span class="font-semibold">{{
                            school.email
                        }}</span></template
                    >.
                </p>
            </div>
        </main>

        <!-- Page footer -->
        <footer
            class="border-t border-slate-200/40 py-4 text-center text-xs text-slate-400 dark:border-slate-800/40"
        >
            &copy; {{ new Date().getFullYear() }} {{ schoolName }}. Total School
            Management System.
        </footer>
    </div>
</template>
