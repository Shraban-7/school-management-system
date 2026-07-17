<script setup lang="ts">
import { Form, Head, usePage } from '@inertiajs/vue3';
import { computed } from 'vue';
import PublicLayout from '@/layouts/PublicLayout.vue';
import { useI18n } from '@/composables/useI18n';

defineOptions({ layout: PublicLayout });

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
    () => ((page.props as Record<string, unknown>).school as PublicSchool) ?? {},
);

const schoolName = computed(() => bi(school.value.name_en, school.value.name_bn) || 'Our School');
const crestInitial = computed(() => schoolName.value.trim().charAt(0).toUpperCase() || 'S');

const flash = computed(() => {
    const props = page.props as Record<string, unknown>;
    const value = props.flash as { message?: string | null; error?: string | null } | undefined;
    return { message: value?.message ?? null, error: value?.error ?? null };
});
</script>

<template>
    <div>
        <Head :title="t('nav.login')" />

        <section class="bg-[#1e2875] text-[#f7f3e8]">
            <div class="mx-auto max-w-6xl px-4 py-14 text-center sm:px-6 lg:px-8">
                <p class="text-xs font-semibold tracking-[0.25em] text-[#c9a227] uppercase">
                    {{ t('auth.portal_login') }}
                </p>
                <div class="mx-auto mt-2 h-px w-16 bg-[#c9a227]" aria-hidden="true"></div>
                <h1 class="mt-5 font-serif text-3xl font-bold sm:text-4xl">{{ t('auth.sign_in_title') }}</h1>
                <p class="mt-3 text-sm text-[#f7f3e8]/75">
                    {{ t('auth.sign_in_subtitle', { school: schoolName }) }}
                </p>
            </div>
        </section>

        <section class="mx-auto max-w-md px-4 pb-16 sm:px-6">
            <div class="-mt-7 rounded-lg border border-[#1e2875]/10 bg-white p-6 shadow-sm sm:p-8">
                <div class="flex flex-col items-center text-center">
                    <img
                        v-if="school.logo_url"
                        :src="school.logo_url"
                        :alt="schoolName"
                        class="h-16 w-16 rounded-full object-cover ring-2 ring-[#c9a227]"
                    />
                    <span
                        v-else
                        class="flex h-16 w-16 items-center justify-center rounded-full bg-[#1e2875] font-serif text-2xl font-bold text-[#f7f3e8] ring-2 ring-[#c9a227]"
                    >
                        {{ crestInitial }}
                    </span>
                    <p class="mt-3 font-serif text-lg font-bold text-[#1e2875]">{{ schoolName }}</p>
                    <p v-if="school.eiin_number" class="text-[11px] tracking-widest text-[#1a1a1a]/50 uppercase">
                        EIIN {{ school.eiin_number }}
                    </p>
                </div>

                <div
                    v-if="flash.message"
                    class="mt-6 rounded border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
                >
                    {{ flash.message }}
                </div>
                <div
                    v-if="flash.error"
                    class="mt-6 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                    {{ flash.error }}
                </div>

                <Form action="/login" method="post" #default="{ errors, processing }" class="mt-6 space-y-5">
                    <div>
                        <label for="phone" class="block text-sm font-semibold text-[#1a1a1a]/80">
                            {{ t('auth.phone') }}
                        </label>
                        <input
                            id="phone"
                            name="phone"
                            type="tel"
                            inputmode="tel"
                            autocomplete="tel"
                            required
                            autofocus
                            placeholder="+8801XXXXXXXXX"
                            :class="[
                                'mt-1.5 block w-full rounded border bg-white px-3 py-2 text-sm transition focus:ring-2 focus:outline-none',
                                errors.phone
                                    ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                                    : 'border-[#1e2875]/20 focus:border-[#1e2875] focus:ring-[#1e2875]/20',
                            ]"
                        />
                        <p v-if="errors.phone" class="mt-1 text-sm text-red-600">
                            {{ errors.phone }}
                        </p>
                    </div>

                    <div>
                        <label for="password" class="block text-sm font-semibold text-[#1a1a1a]/80">
                            {{ t('auth.password') }}
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autocomplete="current-password"
                            required
                            :class="[
                                'mt-1.5 block w-full rounded border bg-white px-3 py-2 text-sm transition focus:ring-2 focus:outline-none',
                                errors.password
                                    ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                                    : 'border-[#1e2875]/20 focus:border-[#1e2875] focus:ring-[#1e2875]/20',
                            ]"
                        />
                        <p v-if="errors.password" class="mt-1 text-sm text-red-600">
                            {{ errors.password }}
                        </p>
                    </div>

                    <div class="flex items-center">
                        <input
                            id="remember"
                            name="remember"
                            type="checkbox"
                            value="1"
                            class="h-4 w-4 rounded border-[#1e2875]/30 text-[#1e2875] focus:ring-[#1e2875]/30"
                        />
                        <label for="remember" class="ml-2 block text-sm text-[#1a1a1a]/75">
                            {{ t('auth.remember') }}
                        </label>
                    </div>

                    <button
                        type="submit"
                        :disabled="processing"
                        class="flex w-full justify-center rounded bg-[#1e2875] px-4 py-2.5 text-sm font-semibold text-[#f7f3e8] shadow-sm transition-colors hover:bg-[#c9a227] hover:text-[#1a1a1a] focus:ring-2 focus:ring-[#1e2875]/40 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {{ processing ? t('auth.signing_in') : t('auth.sign_in') }}
                    </button>
                </Form>
            </div>

            <p v-if="school.phone || school.email" class="mt-6 text-center text-xs text-[#1a1a1a]/60">
                {{ t('auth.trouble') }}
                <template v-if="school.phone"> {{ t('auth.at') }} {{ school.phone }}</template><template v-if="school.email">
                    {{ t('auth.or') }} {{ school.email }}</template>.
            </p>
        </section>
    </div>
</template>
