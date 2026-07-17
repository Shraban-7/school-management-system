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
    has_attachment?: boolean;
    attachment_download_url?: string | null;
    attachment_name?: string | null;
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
                <p class="text-xs font-semibold tracking-[0.25em] text-[#c9a227] uppercase">School Notice</p>
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

            <div
                v-if="post.attachment_download_url"
                class="mt-8 rounded-lg border border-[#1e2875]/15 bg-[#f7f3e8] p-5"
            >
                <p class="text-xs font-semibold tracking-widest text-[#1e2875] uppercase">Attachment</p>
                <p v-if="post.attachment_name" class="mt-2 text-sm text-[#1a1a1a]/70">
                    {{ post.attachment_name }}
                </p>
                <a
                    :href="post.attachment_download_url"
                    class="mt-4 inline-flex items-center gap-2 rounded bg-[#1e2875] px-4 py-2 text-sm font-semibold text-[#f7f3e8] transition-colors hover:bg-[#c9a227] hover:text-[#1a1a1a]"
                >
                    <AppIcon name="download" class="h-4 w-4" />
                    Download notice PDF
                </a>
            </div>

            <Link
                href="/notices"
                class="mt-10 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1e2875] hover:text-[#c9a227]"
            >
                <AppIcon name="arrow-left" class="h-4 w-4" />
                All school notices
            </Link>
        </section>
    </div>
</template>
