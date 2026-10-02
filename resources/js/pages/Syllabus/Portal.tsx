import React, { useMemo, useState } from 'react';
import { Head } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import AppIcon from '@/components/AppIcon';
import { useI18n } from '@/composables/useI18n';

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

interface SyllabusPortalProps {
    syllabuses: SyllabusItem[];
}

export default function SyllabusPortal({ syllabuses }: SyllabusPortalProps) {
    const { t } = useI18n();

    const [search, setSearch] = useState('');
    const [selectedClass, setSelectedClass] = useState('');

    const classOptions = useMemo(() => {
        const set = new Set<string>();
        syllabuses.forEach((s) => {
            if (s.class_label) set.add(s.class_label);
        });
        return Array.from(set).sort();
    }, [syllabuses]);

    const filtered = useMemo(() => {
        return syllabuses.filter((item) => {
            const matchesSearch =
                !search ||
                item.title.toLowerCase().includes(search.toLowerCase()) ||
                (item.description &&
                    item.description.toLowerCase().includes(search.toLowerCase()));

            const matchesClass =
                !selectedClass || item.class_label === selectedClass;

            return matchesSearch && matchesClass;
        });
    }, [syllabuses, search, selectedClass]);

    return (
        <DashboardLayout>
            <Head title={t('sidebar.syllabus')} />

            <div className="space-y-6">
                <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase dark:text-slate-400">
                            {t('sidebar.academic')}
                        </p>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
                            {t('sidebar.syllabus')}
                        </h1>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            {t('syllabus.subtitle')}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <div className="w-full sm:w-48">
                            <select
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                                className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                            >
                                <option value="">{t('common.all_classes')}</option>
                                {classOptions.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="w-full sm:w-64">
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                type="search"
                                placeholder={t('syllabus.search_placeholder')}
                                className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                            />
                        </div>
                    </div>
                </header>

                {filtered.length > 0 ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {filtered.map((item) => (
                            <div
                                key={item.id}
                                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                            >
                                <div>
                                    <div className="flex items-start justify-between gap-3">
                                        {item.class_label && (
                                            <span className="inline-flex rounded-md bg-accent-50 px-2 py-0.5 text-xs font-semibold text-accent-700 dark:bg-accent-950/60 dark:text-accent-300">
                                                {item.class_label}
                                            </span>
                                        )}
                                        {item.session_name && (
                                            <span className="text-xs text-slate-400">
                                                {item.session_name}
                                            </span>
                                        )}
                                    </div>

                                    <h2 className="mt-3 text-lg font-bold text-slate-900 dark:text-slate-100">
                                        {item.title}
                                    </h2>

                                    {item.description && (
                                        <p className="mt-2 line-clamp-3 text-sm text-slate-600 dark:text-slate-400">
                                            {item.description}
                                        </p>
                                    )}
                                </div>

                                <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
                                    {item.download_url ? (
                                        <div className="flex items-center justify-between gap-2">
                                            <span
                                                className="truncate text-xs text-slate-400"
                                                title={item.file_name ?? ''}
                                            >
                                                {item.file_name ?? t('syllabus.pdf_doc')}
                                            </span>
                                            <a
                                                href={item.download_url}
                                                className="inline-flex items-center gap-1.5 rounded-md bg-accent-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-accent-700"
                                            >
                                                <AppIcon name="download" className="h-3.5 w-3.5" />
                                                {t('common.download')}
                                            </a>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-slate-400">
                                            {t('syllabus.no_file')}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                        <AppIcon
                            name="book-open"
                            className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600"
                        />
                        <p className="mt-2 text-sm font-medium">
                            {t('syllabus.no_syllabus')}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                            {t('syllabus.empty_help')}
                        </p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
