<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3';
import PublicLayout from '@/layouts/PublicLayout.vue';
import AppIcon from '@/components/AppIcon.vue';

defineOptions({ layout: PublicLayout });

interface PublicSchool {
    name_en: string | null;
    eiin_number: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    office_hours: string | null;
    contact_intro: string | null;
}

defineProps<{ school: PublicSchool }>();
</script>

<template>
    <div>
        <Head title="Contact" />

        <section class="bg-[#1e2875] text-[#f7f3e8]">
            <div class="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
                <p class="text-xs font-semibold tracking-[0.25em] text-[#c9a227] uppercase">Contact</p>
                <div class="mt-2 h-px w-16 bg-[#c9a227]" aria-hidden="true"></div>
                <h1 class="mt-5 font-serif text-3xl font-bold sm:text-4xl">Get in Touch</h1>
                <p class="mt-3 max-w-2xl whitespace-pre-wrap text-[#f7f3e8]/80">
                    {{
                        school.contact_intro ||
                        `The office of ${school.name_en ?? 'our school'} is open on all working days. Visit us, call, or write an email.`
                    }}
                </p>
            </div>
        </section>

        <section class="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
            <div class="grid gap-6 sm:grid-cols-2">
                <div v-if="school.address" class="rounded-lg border border-[#1e2875]/10 bg-white p-6 shadow-sm">
                    <AppIcon name="home" class="h-7 w-7 text-[#c9a227]" />
                    <p class="mt-3 text-xs font-semibold tracking-widest text-[#1e2875] uppercase">Address</p>
                    <div class="mt-2 h-px w-12 bg-[#c9a227]" aria-hidden="true"></div>
                    <p class="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[#1a1a1a]/80">{{ school.address }}</p>
                </div>

                <div v-if="school.phone" class="rounded-lg border border-[#1e2875]/10 bg-white p-6 shadow-sm">
                    <AppIcon name="phone" class="h-7 w-7 text-[#c9a227]" />
                    <p class="mt-3 text-xs font-semibold tracking-widest text-[#1e2875] uppercase">Phone</p>
                    <div class="mt-2 h-px w-12 bg-[#c9a227]" aria-hidden="true"></div>
                    <p class="mt-3 text-sm text-[#1a1a1a]/80">
                        <a :href="`tel:${school.phone}`" class="hover:text-[#1e2875]">{{ school.phone }}</a>
                    </p>
                </div>

                <div v-if="school.email" class="rounded-lg border border-[#1e2875]/10 bg-white p-6 shadow-sm">
                    <AppIcon name="mail" class="h-7 w-7 text-[#c9a227]" />
                    <p class="mt-3 text-xs font-semibold tracking-widest text-[#1e2875] uppercase">Email</p>
                    <div class="mt-2 h-px w-12 bg-[#c9a227]" aria-hidden="true"></div>
                    <p class="mt-3 text-sm text-[#1a1a1a]/80">
                        <a :href="`mailto:${school.email}`" class="hover:text-[#1e2875]">{{ school.email }}</a>
                    </p>
                </div>

                <div v-if="school.office_hours" class="rounded-lg border border-[#1e2875]/10 bg-white p-6 shadow-sm">
                    <AppIcon name="clock" class="h-7 w-7 text-[#c9a227]" />
                    <p class="mt-3 text-xs font-semibold tracking-widest text-[#1e2875] uppercase">Office hours</p>
                    <div class="mt-2 h-px w-12 bg-[#c9a227]" aria-hidden="true"></div>
                    <p class="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[#1a1a1a]/80">
                        {{ school.office_hours }}
                    </p>
                </div>

                <div v-if="school.website" class="rounded-lg border border-[#1e2875]/10 bg-white p-6 shadow-sm">
                    <AppIcon name="globe" class="h-7 w-7 text-[#c9a227]" />
                    <p class="mt-3 text-xs font-semibold tracking-widest text-[#1e2875] uppercase">Website</p>
                    <div class="mt-2 h-px w-12 bg-[#c9a227]" aria-hidden="true"></div>
                    <p class="mt-3 text-sm text-[#1a1a1a]/80">
                        <a :href="school.website" target="_blank" rel="noopener" class="hover:text-[#1e2875]">
                            {{ school.website }}
                        </a>
                    </p>
                </div>
            </div>

            <div class="mt-10 flex flex-wrap gap-4">
                <Link
                    href="/admission"
                    class="rounded bg-[#1e2875] px-5 py-2.5 text-sm font-semibold text-[#f7f3e8] transition-colors hover:bg-[#c9a227] hover:text-[#1a1a1a]"
                >
                    Admission
                </Link>
                <Link
                    href="/fees"
                    class="rounded border border-[#1e2875]/20 px-5 py-2.5 text-sm font-semibold text-[#1e2875] transition-colors hover:border-[#c9a227]"
                >
                    Fees
                </Link>
            </div>

            <p v-if="school.eiin_number" class="mt-8 text-center text-sm text-[#1a1a1a]/50">
                EIIN: {{ school.eiin_number }}
            </p>
        </section>
    </div>
</template>
