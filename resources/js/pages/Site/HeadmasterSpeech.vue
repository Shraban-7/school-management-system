<script setup lang="ts">
import { Head } from '@inertiajs/vue3';
import PublicLayout from '@/layouts/PublicLayout.vue';
import { richTextHtml } from '@/lib/richText';

defineOptions({ layout: PublicLayout });

interface PublicSchool {
    name_en: string | null;
    headmaster_name_en: string | null;
    headmaster_name_bn: string | null;
    headmaster_photo_url: string | null;
    headmaster_speech: string | null;
}

defineProps<{ school: PublicSchool }>();
</script>

<template>
    <div>
        <Head title="Headmaster's Message" />

        <section class="bg-[#1e2875] text-[#f7f3e8]">
            <div class="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
                <p class="text-xs font-semibold tracking-[0.25em] text-[#c9a227] uppercase">From the Headmaster</p>
                <div class="mt-2 h-px w-16 bg-[#c9a227]" aria-hidden="true"></div>
                <h1 class="mt-5 font-serif text-3xl font-bold sm:text-4xl">A Message to Our Community</h1>
            </div>
        </section>

        <section class="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
            <div class="flex items-center gap-5">
                <img
                    v-if="school.headmaster_photo_url"
                    :src="school.headmaster_photo_url"
                    :alt="school.headmaster_name_en ?? 'Headmaster'"
                    class="h-24 w-24 rounded-full object-cover ring-2 ring-[#c9a227]"
                />
                <div>
                    <p class="font-serif text-xl font-bold text-[#1e2875]">
                        {{ school.headmaster_name_en }}
                    </p>
                    <p v-if="school.headmaster_name_bn" class="text-sm text-[#1a1a1a]/70">
                        {{ school.headmaster_name_bn }}
                    </p>
                    <p class="mt-1 text-xs font-semibold tracking-widest text-[#c9a227] uppercase">
                        Headmaster, {{ school.name_en }}
                    </p>
                </div>
            </div>

            <div class="mt-8 border-t border-[#1e2875]/10 pt-8">
                <div v-if="school.headmaster_speech" class="rich-text leading-relaxed text-[#1a1a1a]/85" v-html="richTextHtml(school.headmaster_speech)"></div>
                <p v-else class="rounded-lg border border-dashed border-[#1e2875]/20 p-6 text-sm text-[#1a1a1a]/60">
                    The headmaster's message has not been published yet.
                </p>
            </div>
        </section>
    </div>
</template>
