<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3';
import PublicLayout from '@/layouts/PublicLayout.vue';
import { richTextHtml } from '@/lib/richText';

defineOptions({ layout: PublicLayout });

interface PublicSchool {
    name_en: string | null;
}

interface FacilityItem {
    title: string;
    body: string;
    category: string;
}

defineProps<{
    school: PublicSchool;
    facilityItems: FacilityItem[];
}>();
</script>

<template>
    <div>
        <Head title="Facilities" />

        <section class="bg-[#1e2875] text-[#f7f3e8]">
            <div class="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
                <p class="text-xs font-semibold tracking-[0.25em] text-[#c9a227] uppercase">Campus</p>
                <div class="mt-2 h-px w-16 bg-[#c9a227]" aria-hidden="true"></div>
                <h1 class="mt-5 font-serif text-3xl font-bold sm:text-4xl">Facilities</h1>
                <p class="mt-3 max-w-2xl text-[#f7f3e8]/80">
                    Laboratories and school facilities at {{ school.name_en }}.
                </p>
            </div>
        </section>

        <section class="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
            <div
                v-if="facilityItems.length === 0"
                class="rounded-lg border border-dashed border-[#1e2875]/20 p-8 text-center text-sm text-[#1a1a1a]/60"
            >
                Facility details have not been published yet. Edit them under School profile.
            </div>

            <div v-else class="grid gap-8 sm:grid-cols-2">
                <article
                    v-for="(item, index) in facilityItems"
                    :key="index"
                    class="rounded-lg border border-[#1e2875]/10 bg-white p-8 shadow-sm"
                >
                    <p class="text-xs font-semibold tracking-widest text-[#1e2875] uppercase">
                        {{ item.category === 'lab' ? 'Lab' : 'Campus' }}
                    </p>
                    <div class="mt-2 h-px w-12 bg-[#c9a227]" aria-hidden="true"></div>
                    <h2 class="mt-4 font-serif text-2xl font-bold text-[#1e2875]">{{ item.title }}</h2>
                    <div
                        class="rich-text mt-5 leading-relaxed text-[#1a1a1a]/85"
                        v-html="richTextHtml(item.body)"
                    ></div>
                </article>
            </div>

            <div class="mt-12 flex flex-wrap gap-4">
                <Link
                    href="/admission"
                    class="rounded bg-[#1e2875] px-5 py-2.5 text-sm font-semibold text-[#f7f3e8] transition-colors hover:bg-[#c9a227] hover:text-[#1a1a1a]"
                >
                    Admission
                </Link>
                <Link
                    href="/activities"
                    class="rounded border border-[#1e2875]/20 px-5 py-2.5 text-sm font-semibold text-[#1e2875] transition-colors hover:border-[#c9a227]"
                >
                    Co-curricular activities
                </Link>
            </div>
        </section>
    </div>
</template>
