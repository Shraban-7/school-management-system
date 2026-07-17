<script setup lang="ts">
import { Head } from '@inertiajs/vue3';
import PublicLayout from '@/layouts/PublicLayout.vue';
import AppIcon from '@/components/AppIcon.vue';

defineOptions({ layout: PublicLayout });

interface SyllabusItem {
    id: number;
    title: string;
    description: string | null;
    file_url: string | null;
    download_url: string | null;
    file_name: string | null;
    class_label: string | null;
    session_name: string | null;
}

defineProps<{ syllabuses: SyllabusItem[] }>();
</script>

<template>
    <div>
        <Head title="Syllabus" />

        <section class="bg-[#1e2875] text-[#f7f3e8]">
            <div class="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
                <p class="text-xs font-semibold tracking-[0.25em] text-[#c9a227] uppercase">Academics</p>
                <div class="mt-2 h-px w-16 bg-[#c9a227]" aria-hidden="true"></div>
                <h1 class="mt-5 font-serif text-3xl font-bold sm:text-4xl">Class Syllabus</h1>
                <p class="mt-3 max-w-2xl text-sm text-[#f7f3e8]/75">
                    Download the official syllabus PDF for each class and academic session.
                </p>
            </div>
        </section>

        <section class="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
            <div v-if="syllabuses.length" class="grid gap-6 sm:grid-cols-2">
                <div
                    v-for="item in syllabuses"
                    :key="item.id"
                    class="flex flex-col rounded-lg border border-[#1e2875]/10 bg-white p-6 shadow-sm"
                >
                    <div class="flex items-start justify-between gap-3">
                        <div>
                            <p v-if="item.class_label" class="text-xs font-semibold tracking-widest text-[#c9a227] uppercase">
                                Class {{ item.class_label }}
                            </p>
                            <h2 class="mt-1 font-serif text-lg font-bold text-[#1e2875]">{{ item.title }}</h2>
                            <p v-if="item.session_name" class="mt-0.5 text-xs text-[#1a1a1a]/50">
                                Session {{ item.session_name }}
                            </p>
                        </div>
                        <AppIcon name="book-open" class="h-6 w-6 shrink-0 text-[#1e2875]/40" />
                    </div>

                    <p v-if="item.description" class="mt-3 flex-1 text-sm leading-relaxed text-[#1a1a1a]/70">
                        {{ item.description }}
                    </p>

                    <div v-if="item.download_url" class="mt-4 space-y-2">
                        <a
                            :href="item.download_url"
                            class="inline-flex w-fit items-center gap-2 rounded bg-[#1e2875] px-4 py-2 text-sm font-semibold text-[#f7f3e8] transition-colors hover:bg-[#c9a227] hover:text-[#1a1a1a]"
                        >
                            <AppIcon name="download" class="h-4 w-4" />
                            Download PDF
                        </a>
                        <p v-if="item.file_name" class="text-xs text-[#1a1a1a]/50">
                            {{ item.file_name }}
                        </p>
                    </div>
                </div>
            </div>
            <p v-else class="rounded-lg border border-dashed border-[#1e2875]/20 p-8 text-center text-sm text-[#1a1a1a]/60">
                Syllabus documents have not been published yet.
            </p>
        </section>
    </div>
</template>
