<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3';
import PublicLayout from '@/layouts/PublicLayout.vue';
import AppIcon from '@/components/AppIcon.vue';

defineOptions({ layout: PublicLayout });

interface PostItem {
    id: number;
    title_en: string;
    slug: string;
    excerpt: string;
    cover_image_url: string | null;
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
        <Head title="Blog" />

        <section class="bg-[#1e2875] text-[#f7f3e8]">
            <div class="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
                <p class="text-xs font-semibold tracking-[0.25em] text-[#c9a227] uppercase">Journal</p>
                <div class="mt-2 h-px w-16 bg-[#c9a227]" aria-hidden="true"></div>
                <h1 class="mt-5 font-serif text-3xl font-bold sm:text-4xl">Blog</h1>
            </div>
        </section>

        <section class="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
            <div v-if="posts.data.length" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <Link
                    v-for="post in posts.data"
                    :key="post.id"
                    :href="`/blog/${post.slug}`"
                    class="group overflow-hidden rounded-lg border border-[#1e2875]/10 bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                    <img
                        v-if="post.cover_image_url"
                        :src="post.cover_image_url"
                        :alt="post.title_en"
                        class="h-44 w-full object-cover"
                    />
                    <div v-else class="flex h-44 items-center justify-center bg-[#1e2875]/5">
                        <AppIcon name="book-open" class="h-10 w-10 text-[#1e2875]/30" />
                    </div>
                    <div class="p-5">
                        <p class="text-xs text-[#1a1a1a]/50">{{ formatDate(post.published_at) }}</p>
                        <h2 class="mt-1 font-serif text-lg font-bold text-[#1e2875] group-hover:text-[#c9a227]">
                            {{ post.title_en }}
                        </h2>
                        <p class="mt-2 line-clamp-3 text-sm text-[#1a1a1a]/70">{{ post.excerpt }}</p>
                    </div>
                </Link>
            </div>
            <p v-else class="rounded-lg border border-dashed border-[#1e2875]/20 p-8 text-center text-sm text-[#1a1a1a]/60">
                No blog posts have been published yet.
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
