<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3';
import PublicLayout from '@/layouts/PublicLayout.vue';

defineOptions({ layout: PublicLayout });

interface PostItem {
    id: number;
    title_en: string;
    slug: string;
    excerpt: string;
    published_at: string | null;
}

interface PaginatorLink {
    url: string | null;
    label: string;
    active: boolean;
}

defineProps<{
    posts: {
        data: PostItem[];
        links?: PaginatorLink[];
    };
}>();

function formatDate(date: string | null): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}
</script>

<template>
    <div>
        <Head title="Notices" />

        <section class="bg-[#1e2875] text-[#f7f3e8]">
            <div class="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
                <p class="text-xs font-semibold tracking-[0.25em] text-[#c9a227] uppercase">Noticeboard</p>
                <div class="mt-2 h-px w-16 bg-[#c9a227]" aria-hidden="true"></div>
                <h1 class="mt-5 font-serif text-3xl font-bold sm:text-4xl">Notices</h1>
            </div>
        </section>

        <section class="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
            <ul v-if="posts.data.length" class="divide-y divide-[#1e2875]/10 rounded-lg border border-[#1e2875]/10 bg-white shadow-sm">
                <li v-for="post in posts.data" :key="post.id">
                    <Link
                        :href="`/notices/${post.slug}`"
                        class="flex flex-col gap-1 px-6 py-5 transition-colors hover:bg-[#f7f3e8] sm:flex-row sm:items-start sm:justify-between sm:gap-6"
                    >
                        <div>
                            <p class="font-serif text-lg font-bold text-[#1e2875]">{{ post.title_en }}</p>
                            <p class="mt-1 line-clamp-2 text-sm text-[#1a1a1a]/65">{{ post.excerpt }}</p>
                        </div>
                        <span class="shrink-0 text-xs font-medium text-[#1a1a1a]/50 sm:mt-1">
                            {{ formatDate(post.published_at) }}
                        </span>
                    </Link>
                </li>
            </ul>
            <p v-else class="rounded-lg border border-dashed border-[#1e2875]/20 p-8 text-center text-sm text-[#1a1a1a]/60">
                No notices have been published yet.
            </p>

            <nav v-if="posts.links && posts.links.length > 3" class="mt-8 flex flex-wrap justify-center gap-1" aria-label="Pagination">
                <template v-for="(link, index) in posts.links" :key="index">
                    <Link
                        v-if="link.url"
                        :href="link.url"
                        class="rounded px-3 py-1.5 text-sm"
                        :class="
                            link.active
                                ? 'bg-[#1e2875] font-semibold text-[#f7f3e8]'
                                : 'text-[#1a1a1a]/70 hover:bg-[#1e2875]/10'
                        "
                        v-html="link.label"
                    />
                    <span v-else class="px-3 py-1.5 text-sm text-[#1a1a1a]/35" v-html="link.label" />
                </template>
            </nav>
        </section>
    </div>
</template>
