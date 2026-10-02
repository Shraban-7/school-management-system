<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3';
import DashboardLayout from '@/layouts/DashboardLayout.vue';
import { richTextHtml } from '@/lib/richText';
import AppIcon from '@/components/AppIcon.vue';
import { useI18n } from '@/composables/useI18n';

defineOptions({ layout: DashboardLayout });

interface PostItem {
    id: number;
    title_en: string;
    title_bn?: string | null;
    body: string;
    cover_image_url?: string | null;
    published_at: string | null;
    has_attachment?: boolean;
    attachment_download_url?: string | null;
    attachment_name?: string | null;
}

const props = defineProps<{ post: PostItem }>();

const { bi } = useI18n();

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
        <Head :title="bi(post.title_en, post.title_bn)" />

        <div class="mx-auto max-w-4xl space-y-6">
            <div>
                <Link
                    href="/notices"
                    class="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-accent-600 dark:text-slate-400 dark:hover:text-accent-400"
                >
                    <AppIcon name="arrow-left" class="h-3.5 w-3.5" />
                    Back to Notice Board
                </Link>
            </div>

            <article
                class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900"
            >
                <header
                    class="border-b border-slate-100 pb-6 dark:border-slate-800"
                >
                    <span
                        class="inline-flex items-center gap-1 rounded-md bg-accent-50 px-2 py-0.5 text-xs font-semibold text-accent-700 dark:bg-accent-950/60 dark:text-accent-300"
                    >
                        Official Notice
                    </span>
                    <h1
                        class="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50"
                    >
                        {{ post.title_en }}
                    </h1>
                    <p
                        v-if="post.title_bn"
                        class="mt-1 text-base text-slate-600 dark:text-slate-400"
                    >
                        {{ post.title_bn }}
                    </p>
                    <p class="mt-3 text-xs text-slate-400 dark:text-slate-500">
                        Published on {{ formatDate(post.published_at) }}
                    </p>
                </header>

                <div v-if="post.cover_image_url" class="mt-6">
                    <img
                        :src="post.cover_image_url"
                        :alt="post.title_en"
                        class="max-h-96 w-full rounded-lg object-cover shadow-sm"
                    />
                </div>

                <div
                    class="rich-text mt-6 text-sm leading-relaxed text-slate-700 dark:text-slate-300"
                    v-html="richTextHtml(post.body)"
                ></div>

                <div
                    v-if="post.attachment_download_url"
                    class="mt-8 flex flex-col gap-3 rounded-lg border border-accent-200 bg-accent-50/50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-accent-900/50 dark:bg-accent-950/20"
                >
                    <div class="flex items-center gap-3">
                        <span
                            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-600 text-white"
                        >
                            <AppIcon name="download" class="h-5 w-5" />
                        </span>
                        <div>
                            <p
                                class="text-xs font-semibold text-accent-900 uppercase dark:text-accent-200"
                            >
                                Attached Document
                            </p>
                            <p
                                class="text-sm font-medium text-slate-800 dark:text-slate-200"
                            >
                                {{
                                    post.attachment_name || 'Notice attachment'
                                }}
                            </p>
                        </div>
                    </div>

                    <a
                        :href="post.attachment_download_url"
                        class="inline-flex items-center justify-center gap-1.5 rounded-md bg-accent-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-accent-700"
                    >
                        <AppIcon name="download" class="h-4 w-4" />
                        Download PDF
                    </a>
                </div>
            </article>
        </div>
    </div>
</template>
