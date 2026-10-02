<script setup lang="ts">
import { Head, Link, router } from '@inertiajs/vue3';
import { ref, watch } from 'vue';
import DashboardLayout from '@/layouts/DashboardLayout.vue';
import AppIcon from '@/components/AppIcon.vue';
import { useI18n } from '@/composables/useI18n';

defineOptions({ layout: DashboardLayout });

interface PostItem {
    id: number;
    title_en: string;
    title_bn?: string | null;
    slug: string;
    excerpt: string;
    published_at: string | null;
    has_attachment?: boolean;
    attachment_download_url?: string | null;
}

interface PaginatorLink {
    url: string | null;
    label: string;
    active: boolean;
}

const props = defineProps<{
    posts: {
        data: PostItem[];
        links?: PaginatorLink[];
        total?: number;
    };
    filters?: {
        search?: string;
    };
}>();

const { t, bi } = useI18n();

const search = ref(props.filters?.search ?? '');

let searchTimeout: ReturnType<typeof setTimeout> | null = null;
watch(search, (value) => {
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        router.get(
            '/notices',
            { search: value || undefined },
            { preserveState: true, replace: true },
        );
    }, 300);
});

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
        <Head title="Notice Board" />

        <div class="space-y-6">
            <header
                class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
            >
                <div>
                    <p
                        class="text-xs font-semibold tracking-widest text-slate-500 uppercase dark:text-slate-400"
                    >
                        {{ t('sidebar.communication') }}
                    </p>
                    <h1
                        class="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50"
                    >
                        {{ t('sidebar.notice_board') }}
                    </h1>
                    <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        Official circulars, exam schedules, and administrative
                        notices.
                    </p>
                </div>

                <div class="w-full sm:w-72">
                    <div class="relative">
                        <AppIcon
                            name="search"
                            class="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400"
                        />
                        <input
                            v-model="search"
                            type="search"
                            placeholder="Search notices…"
                            class="block w-full rounded-lg border border-slate-200 bg-white py-2 pr-3 pl-9 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        />
                    </div>
                </div>
            </header>

            <div v-if="posts.data.length" class="space-y-3">
                <div
                    v-for="post in posts.data"
                    :key="post.id"
                    class="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-accent-500/40 hover:shadow-md sm:flex-row sm:items-center dark:border-slate-800 dark:bg-slate-900"
                >
                    <div class="min-w-0 flex-1">
                        <div class="flex flex-wrap items-center gap-2">
                            <Link
                                :href="`/notices/${post.slug}`"
                                class="text-base font-semibold text-slate-900 transition hover:text-accent-600 dark:text-slate-100 dark:hover:text-accent-400"
                            >
                                {{ bi(post.title_en, post.title_bn) }}
                            </Link>
                            <span
                                v-if="post.has_attachment"
                                class="inline-flex items-center gap-1 rounded-md bg-accent-50 px-2 py-0.5 text-xs font-semibold text-accent-700 dark:bg-accent-950/60 dark:text-accent-300"
                            >
                                <AppIcon name="download" class="h-3 w-3" />
                                Attachment
                            </span>
                        </div>
                        <p
                            v-if="post.title_bn && post.title_en"
                            class="mt-0.5 text-xs text-slate-500 dark:text-slate-400"
                        >
                            {{ post.title_bn }}
                        </p>
                        <p
                            class="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-400"
                        >
                            {{ post.excerpt }}
                        </p>
                    </div>

                    <div
                        class="mt-3 flex items-center justify-between gap-4 sm:mt-0 sm:shrink-0 sm:flex-col sm:items-end"
                    >
                        <span
                            class="text-xs font-medium text-slate-400 dark:text-slate-500"
                        >
                            {{ formatDate(post.published_at) }}
                        </span>
                        <div class="flex items-center gap-2">
                            <a
                                v-if="post.attachment_download_url"
                                :href="post.attachment_download_url"
                                class="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                                title="Download attachment"
                            >
                                <AppIcon name="download" class="h-3.5 w-3.5" />
                                PDF
                            </a>
                            <Link
                                :href="`/notices/${post.slug}`"
                                class="inline-flex items-center gap-1 rounded-md bg-accent-600 px-3 py-1 text-xs font-semibold text-white shadow-xs transition hover:bg-accent-700"
                            >
                                View
                                <AppIcon
                                    name="arrow-right"
                                    class="h-3.5 w-3.5"
                                />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div
                v-else
                class="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
            >
                <AppIcon
                    name="megaphone"
                    class="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600"
                />
                <p class="mt-2 text-sm font-medium">
                    No notices published yet.
                </p>
                <p class="mt-1 text-xs text-slate-400">
                    Notices published by administration will appear here.
                </p>
            </div>

            <nav
                v-if="posts.links && posts.links.length > 3"
                class="flex flex-wrap justify-center gap-1 pt-4"
                aria-label="Pagination"
            >
                <template v-for="(link, index) in posts.links" :key="index">
                    <Link
                        v-if="link.url"
                        :href="link.url"
                        class="rounded-md px-3 py-1.5 text-sm transition"
                        :class="
                            link.active
                                ? 'bg-accent-600 font-semibold text-white'
                                : 'text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800'
                        "
                        v-html="link.label"
                    />
                    <span
                        v-else
                        class="px-3 py-1.5 text-sm text-slate-300 dark:text-slate-600"
                        v-html="link.label"
                    />
                </template>
            </nav>
        </div>
    </div>
</template>
