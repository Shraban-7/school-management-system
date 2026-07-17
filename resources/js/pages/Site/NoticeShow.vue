<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3';
import PublicLayout from '@/layouts/PublicLayout.vue';
import { richTextHtml } from '@/lib/richText';
import AppIcon from '@/components/AppIcon.vue';

defineOptions({ layout: PublicLayout });

interface PostItem {
    id: number;
    title_en: string;
    title_bn: string | null;
    body: string;
    cover_image_url: string | null;
    published_at: string | null;
}

defineProps<{ post: PostItem }>();

function formatDate(date: string | null): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}
</script>

<template>
    <div>
        <Head :title="post.title_en" />

        <section class="bg-[#1e2875] text-[#f7f3e8]">
            <div class="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
                <p class="text-xs font-semibold tracking-[0.25em] text-[#c9a227] uppercase">Notice</p>
                <div class="mt-2 h-px w-16 bg-[#c9a227]" aria-hidden="true"></div>
                <h1 class="mt-5 font-serif text-3xl font-bold sm:text-4xl">{{ post.title_en }}</h1>
                <p v-if="post.title_bn" class="mt-2 text-[#f7f3e8]/80">{{ post.title_bn }}</p>
                <p v-if="post.published_at" class="mt-4 text-sm text-[#f7f3e8]/60">
                    Published {{ formatDate(post.published_at) }}
                </p>
            </div>
        </section>

        <section class="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
            <img
                v-if="post.cover_image_url"
                :src="post.cover_image_url"
                :alt="post.title_en"
                class="mb-8 w-full rounded-lg border border-[#1e2875]/10 object-cover shadow-sm"
            />

            <div class="rich-text leading-relaxed text-[#1a1a1a]/85" v-html="richTextHtml(post.body)"></div>

            <Link
                href="/notices"
                class="mt-10 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1e2875] hover:text-[#c9a227]"
            >
                <AppIcon name="arrow-left" class="h-4 w-4" />
                All notices
            </Link>
        </section>
    </div>
</template>
