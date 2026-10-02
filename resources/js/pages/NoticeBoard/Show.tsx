import React from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { richTextHtml } from '@/lib/richText';
import AppIcon from '@/components/AppIcon';
import { useI18n } from '@/composables/useI18n';

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

interface NoticeBoardShowProps {
    post: PostItem;
}

export default function NoticeBoardShow({ post }: NoticeBoardShowProps) {
    const { t, bi, formatDate } = useI18n();

    return (
        <DashboardLayout>
            <Head title={bi(post.title_en, post.title_bn)} />

            <div className="mx-auto max-w-4xl space-y-6">
                <div>
                    <Link
                        href="/notices"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-accent-600 dark:text-slate-400 dark:hover:text-accent-400"
                    >
                        <AppIcon name="arrow-left" className="h-3.5 w-3.5" />
                        {t('notices.back_to_notices', {}, 'Back to Notice Board')}
                    </Link>
                </div>

                <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900">
                    <header className="border-b border-slate-100 pb-6 dark:border-slate-800">
                        <span className="inline-flex items-center gap-1 rounded-md bg-accent-50 px-2 py-0.5 text-xs font-semibold text-accent-700 dark:bg-accent-950/60 dark:text-accent-300">
                            {t('notices.official_notice', {}, 'Official Notice')}
                        </span>
                        <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
                            {bi(post.title_en, post.title_bn)}
                        </h1>
                        {post.title_bn && post.title_en && (
                            <p className="mt-1 text-base text-slate-600 dark:text-slate-400">
                                {post.title_bn}
                            </p>
                        )}
                        <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
                            {post.published_at ? t('notices.published_on', { date: formatDate(post.published_at) }, `Published on ${formatDate(post.published_at)}`) : ''}
                        </p>
                    </header>

                    {post.cover_image_url && (
                        <div className="mt-6">
                            <img
                                src={post.cover_image_url}
                                alt={bi(post.title_en, post.title_bn)}
                                className="max-h-96 w-full rounded-lg object-cover shadow-sm"
                            />
                        </div>
                    )}

                    <div
                        className="rich-text mt-6 text-sm leading-relaxed text-slate-700 dark:text-slate-300"
                        dangerouslySetInnerHTML={{ __html: richTextHtml(post.body) }}
                    />

                    {post.attachment_download_url && (
                        <div className="mt-8 flex flex-col gap-3 rounded-lg border border-accent-200 bg-accent-50/50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-accent-900/50 dark:bg-accent-950/20">
                            <div className="flex items-center gap-3">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-600 text-white">
                                    <AppIcon name="download" className="h-5 w-5" />
                                </span>
                                <div>
                                    <p className="text-xs font-semibold text-accent-900 uppercase dark:text-accent-200">
                                        {t('notices.attached_document', {}, 'Attached Document')}
                                    </p>
                                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                        {post.attachment_name || t('notices.attachment', {}, 'Notice attachment')}
                                    </p>
                                </div>
                            </div>

                            <a
                                href={post.attachment_download_url}
                                className="inline-flex items-center justify-center gap-1.5 rounded-md bg-accent-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-accent-700"
                            >
                                <AppIcon name="download" className="h-4 w-4" />
                                {t('notices.download_attachment', {}, 'Download PDF')}
                            </a>
                        </div>
                    )}
                </article>
            </div>
        </DashboardLayout>
    );
}
