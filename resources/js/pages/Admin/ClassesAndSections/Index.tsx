import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import AppIcon from '@/components/AppIcon';
import { useSidebarStack } from '@/composables/useNavStack';
import { useI18n } from '@/composables/useI18n';
import type { SidebarConfig } from '@/types/sidebar';

interface ItemRow {
    id: number;
    institution_name: string;
    version: string;
    class_level: string;
    group_stream: string | null;
    section_name: string;
    room_number: string | null;
    created_at: string | null;
}

interface Props {
    items: {
        data: ItemRow[];
        from: number;
        to: number;
        total: number;
        last_page: number;
        current_page: number;
    };
    sidebar: SidebarConfig;
}

export default function ClassesAndSectionsIndex({ items, sidebar }: Props) {
    const { t, isBangla, formatNumber } = useI18n();
    const sidebarStack = useSidebarStack();
    useEffect(() => {
        sidebarStack.set(sidebar);
    }, [sidebar]);

    const page = usePage<any>();
    const [search, setSearch] = useState('');
    const flash = page.props.flash?.message ?? null;

    const filtered = !search
        ? items.data
        : items.data.filter(
              (item) =>
                  item.institution_name?.toLowerCase().includes(search.toLowerCase()) ||
                  item.class_level?.toLowerCase().includes(search.toLowerCase()) ||
                  item.section_name?.toLowerCase().includes(search.toLowerCase()) ||
                  item.version?.toLowerCase().includes(search.toLowerCase()),
          );

    function destroy(id: number) {
        if (confirm(isBangla ? 'আপনি কি নিশ্চিত যে আপনি এই শ্রেণি ও শাখা মুছে ফেলতে চান?' : 'Are you sure you want to delete this class & section?')) {
            router.delete(`/admin/classes-and-sections/${id}`);
        }
    }

    return (
        <DashboardLayout>
            <Head title={t('classes.title', undefined, 'Classes & Sections')} />

            <div className="space-y-6">
                <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase dark:text-slate-400">
                            {isBangla ? 'ব্যবস্থাপনা' : 'Management'}
                        </p>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
                            {t('classes.title', undefined, 'Classes & Sections')}
                        </h1>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            {isBangla ? 'প্রতিষ্ঠানসমূহের শ্রেণি, গ্রুপ এবং শাখা পরিচালনা করুন।' : 'Manage class levels, groups, and sections across institutions.'}
                        </p>
                    </div>
                    <Link
                        href="/admin/classes-and-sections/create"
                        className="inline-flex items-center gap-1.5 self-start rounded-md bg-accent-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-700 sm:self-auto"
                    >
                        <AppIcon name="plus" className="h-4 w-4" />
                        {t('classes.add_class', undefined, 'Add class & section')}
                    </Link>
                </header>

                {flash && (
                    <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
                        {flash}
                    </div>
                )}

                <section className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
                        <label className="relative flex flex-1 items-center sm:max-w-xs">
                            <AppIcon
                                name="search"
                                className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400"
                            />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                type="search"
                                placeholder={isBangla ? 'শ্রেণি বা শাখা খুঁজুন…' : 'Search classes…'}
                                className="h-9 w-full rounded-md border border-slate-200 bg-white pr-3 pl-9 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500"
                            />
                        </label>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                            {isBangla ? `${formatNumber(filtered.length)} / ${formatNumber(items.total)} টি তথ্য` : `${filtered.length} of ${items.total} entries`}
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
                            <thead className="bg-slate-50 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase dark:bg-slate-950/40 dark:text-slate-400">
                                <tr>
                                    <th className="px-4 py-3">{t('teachers.institution', undefined, 'Institution')}</th>
                                    <th className="px-4 py-3">{isBangla ? 'ভার্সন' : 'Version'}</th>
                                    <th className="px-4 py-3">{t('classes.class_name', undefined, 'Class')}</th>
                                    <th className="px-4 py-3">{isBangla ? 'বিভাগ/গ্রুপ' : 'Group'}</th>
                                    <th className="px-4 py-3">{t('classes.section_name', undefined, 'Section')}</th>
                                    <th className="px-4 py-3">{t('classes.room_number', undefined, 'Room')}</th>
                                    <th className="px-4 py-3 text-right">{t('common.actions', undefined, 'Actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filtered.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="text-slate-700 hover:bg-slate-50/60 dark:text-slate-200 dark:hover:bg-slate-800/40"
                                    >
                                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                                            {item.institution_name ?? '—'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                                {item.version}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">{item.class_level}</td>
                                        <td className="px-4 py-3">
                                            {item.group_stream ? (
                                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                                    {item.group_stream}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-slate-400 dark:text-slate-500">
                                                    —
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 font-semibold">
                                            {item.section_name}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                                            {item.room_number ? (isBangla ? formatNumber(item.room_number) : item.room_number) : '—'}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="inline-flex items-center gap-1">
                                                <Link
                                                    href={`/admin/classes-and-sections/${item.id}/edit`}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                                                    aria-label={t('common.edit', undefined, 'Edit')}
                                                    title={t('common.edit', undefined, 'Edit')}
                                                >
                                                    <AppIcon name="pencil" className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    type="button"
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
                                                    aria-label={t('common.delete', undefined, 'Delete')}
                                                    title={t('common.delete', undefined, 'Delete')}
                                                    onClick={() => destroy(item.id)}
                                                >
                                                    <AppIcon name="trash" className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-4 py-12 text-center text-sm text-slate-500 dark:text-slate-400"
                                        >
                                            {isBangla ? 'কোনো তথ্য পাওয়া যায়নি।' : 'No entries found.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </DashboardLayout>
    );
}
