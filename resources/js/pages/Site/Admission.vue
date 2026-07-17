<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3';
import PublicLayout from '@/layouts/PublicLayout.vue';
import { richTextHtml } from '@/lib/richText';

defineOptions({ layout: PublicLayout });

interface PublicSchool {
    name_en: string | null;
    admission_info: string | null;
    admission_guidelines: string | null;
    phone: string | null;
    email: string | null;
}

defineProps<{ school: PublicSchool }>();
</script>

<template>
    <div>
        <Head title="Admission" />

        <section class="bg-[#1e2875] text-[#f7f3e8]">
            <div class="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
                <p class="text-xs font-semibold tracking-[0.25em] text-[#c9a227] uppercase">Admission</p>
                <div class="mt-2 h-px w-16 bg-[#c9a227]" aria-hidden="true"></div>
                <h1 class="mt-5 font-serif text-3xl font-bold sm:text-4xl">Join {{ school.name_en }}</h1>
                <p class="mt-3 max-w-2xl text-[#f7f3e8]/80">
                    Admission details, documents, and step-by-step guidelines for new students.
                </p>
            </div>
        </section>

        <section class="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
            <div class="grid gap-10 lg:grid-cols-3">
                <div class="space-y-10 lg:col-span-2">
                    <div>
                        <p class="text-xs font-semibold tracking-widest text-[#1e2875] uppercase">Overview</p>
                        <div class="mt-2 h-px w-12 bg-[#c9a227]" aria-hidden="true"></div>
                        <div
                            v-if="school.admission_info"
                            class="rich-text mt-5 leading-relaxed text-[#1a1a1a]/85"
                            v-html="richTextHtml(school.admission_info)"
                        ></div>
                        <p v-else class="mt-5 text-sm text-[#1a1a1a]/60">
                            Admission overview has not been published yet.
                        </p>
                    </div>

                    <div>
                        <p class="text-xs font-semibold tracking-widest text-[#1e2875] uppercase">
                            Guidelines &amp; process
                        </p>
                        <div class="mt-2 h-px w-12 bg-[#c9a227]" aria-hidden="true"></div>
                        <div
                            v-if="school.admission_guidelines"
                            class="rich-text mt-5 leading-relaxed text-[#1a1a1a]/85"
                            v-html="richTextHtml(school.admission_guidelines)"
                        ></div>
                        <p v-else class="mt-5 text-sm text-[#1a1a1a]/60">
                            Detailed guidelines will appear here once published by the school office.
                        </p>
                    </div>
                </div>

                <aside class="space-y-6">
                    <div class="rounded-lg border border-[#1e2875]/10 bg-white p-6 shadow-sm">
                        <p class="text-xs font-semibold tracking-widest text-[#1e2875] uppercase">Fees</p>
                        <div class="mt-2 h-px w-12 bg-[#c9a227]" aria-hidden="true"></div>
                        <p class="mt-4 text-sm leading-relaxed text-[#1a1a1a]/75">
                            See admission fee, monthly tuition, and session (annual) fee by class.
                        </p>
                        <Link
                            href="/fees"
                            class="mt-4 inline-block rounded bg-[#1e2875] px-5 py-2.5 text-sm font-semibold text-[#f7f3e8] transition-colors hover:bg-[#c9a227] hover:text-[#1a1a1a]"
                        >
                            View fee structure
                        </Link>
                    </div>

                    <div class="rounded-lg border border-[#1e2875]/10 bg-white p-6 shadow-sm">
                        <p class="text-xs font-semibold tracking-widest text-[#1e2875] uppercase">
                            Have questions?
                        </p>
                        <div class="mt-2 h-px w-12 bg-[#c9a227]" aria-hidden="true"></div>
                        <p class="mt-4 text-sm text-[#1a1a1a]/75">
                            Reach the school office
                            <template v-if="school.phone"> at {{ school.phone }}</template>
                            <template v-if="school.email"> or email {{ school.email }}</template>.
                        </p>
                        <Link
                            href="/contact"
                            class="mt-4 inline-block text-sm font-semibold text-[#1e2875] underline-offset-4 hover:underline"
                        >
                            Contact page
                        </Link>
                    </div>
                </aside>
            </div>
        </section>
    </div>
</template>
