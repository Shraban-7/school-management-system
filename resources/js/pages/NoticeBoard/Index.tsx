import React, { useEffect, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import AppIcon from '@/components/AppIcon';
import { useI18n } from '@/composables/useI18n';

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

interface NoticeBoardIndexProps {
    posts: {
        data: PostItem[];
        links?: PaginatorLink[];
        total?: number;
    };
    filters?: {
        search?: string;
    };
}

export default function NoticeBoardIndex({ posts, filters }: NoticeBoardIndexProps) {
    const { t, bi, formatDate, formatNumber } = useI18n();
    const [search, setSearch] = useState(filters?.search ?? '');

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (search !== (filters?.search ?? '')) {
                router.get(
                    '/notices',
                    { search: search || undefined },
                    { preserveState: true, replace: true },
                );
            }
        }, 300);
        return () => clearTimeout(timeout);
    }, [search, filters?.search]);

    return (
        <DashboardLayout>
            <Head title={t('notices.title', {}, 'Notice Board')} />

            <div className="space-y-6">
                <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase dark:text-slate-400">
                            {t('sidebar.communication', {}, 'Communication')}
                        </p>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
                            {t('notices.title', {}, 'Notice Board')}
                        </h1>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            {t('notices.subtitle', {}, 'Official circulars, exam schedules, and administrative notices.')}
                        </p>
                    </div>

                    <div className="w-full sm:w-72">
                        <div className="relative">
                            <AppIcon
                                name="search"
                                className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400"
                            />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                type="search"
                                placeholder={t('notices.search_placeholder', {}, 'Search notices…')}
                                className="block w-full rounded-lg border border-slate-200 bg-white py-2 pr-3 pl-9 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                            />
                        </div>
                    </div>
                </header>

                {posts.data.length > 0 ? (
                    <div className="space-y-3">
                        {posts.data.map((post) => (
                            <div
                                key={post.id}
                                className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-accent-500/40 hover:shadow-md sm:flex-row sm:items-center dark:border-slate-800 dark:bg-slate-900"
                            >
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Link
                                            href={`/notices/${post.slug}`}
                                            className="text-base font-semibold text-slate-900 transition hover:text-accent-600 dark:text-slate-100 dark:hover:text-accent-400"
                                        >
                                            {bi(post.title_en, post.title_bn)}
                                        </Link>
                                        {post.has_attachment && (
                                            <span className="inline-flex items-center gap-1 rounded-md bg-accent-50 px-2 py-0.5 text-xs font-semibold text-accent-700 dark:bg-accent-950/60 dark:text-accent-300">
                                                <AppIcon name="download" className="h-3 w-3" />
                                                {t('notices.attachment', {}, 'Attachment')}
                                            </span>
                                        )}
                                    </div>
                                    {post.title_bn && post.title_en && (
                                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                            {post.title_bn}
                                        </p>
                                    )}
                                    <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
                                        {post.excerpt}
                                    </p>
                                </div>

                                <div className="mt-3 flex items-center justify-between gap-4 sm:mt-0 sm:shrink-0 sm:flex-col sm:items-end">
                                    <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                                        {post.published_at ? formatDate(post.published_at) : ''}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        {post.attachment_download_url && (
                                            <a
                                                href={post.attachment_download_url}
                                                className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                                                title={t('notices.download_attachment', {}, 'Download attachment')}
                                            >
                                                <AppIcon name="download" className="h-3.5 w-3.5" />
                                                PDF
                                            </a>
                                        )}
                                        <Link
                                            href={`/notices/${post.slug}`}
                                            className="inline-flex items-center gap-1 rounded-md bg-accent-600 px-3 py-1 text-xs font-semibold text-white shadow-xs transition hover:bg-accent-700"
                                        >
                                            {t('common.view', {}, 'View')}
                                            <AppIcon
                                                name="arrow-right"
                                                className="h-3.5 w-3.5"
                                            />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                        <AppIcon
                            name="megaphone"
                            className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600"
                        />
                        <p className="mt-2 text-sm font-medium">
                            {t('notices.no_notices', {}, 'No notices published yet.')}
                        </p>
                    </div>
                )}

                {posts.links && posts.links.length > 3 && (
                    <nav
                        className="flex flex-wrap justify-center gap-1 pt-4"
                        aria-label="Pagination"
                    >
                        {posts.links.map((link, index) =>
                            link.url ? (
                                <Link
                                    key={index}
                                    href={link.url}
                                    className={`rounded-md px-3 py-1.5 text-sm transition ${
                                        link.active
                                            ? 'bg-accent-600 font-semibold text-white'
                                            : 'text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: !isNaN(Number(link.label)) ? formatNumber(link.label) : link.label }}
                                />
                            ) : (
                                <span
                                    key={index}
                                    className="px-3 py-1.5 text-sm text-slate-300 dark:text-slate-600"
                                    dangerouslySetInnerHTML={{ __html: !isNaN(Number(link.label)) ? formatNumber(link.label) : link.label }}
                                />
                            ),
                        )}
                    </nav>
                )}
            </div>
        </DashboardLayout>
    );
}
