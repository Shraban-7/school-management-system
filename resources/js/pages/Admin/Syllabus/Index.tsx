import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import AppIcon from '@/components/AppIcon';
import { useSidebarStack } from '@/composables/useNavStack';
import type { SidebarConfig } from '@/types/sidebar';

interface SyllabusRow {
    id: number;
    title: string;
    description: string | null;
    file_url: string | null;
    class_label: string;
    session_name: string;
}

interface Props {
    sidebar: SidebarConfig;
    syllabuses: {
        data: SyllabusRow[];
        from: number | null;
        to: number | null;
        total: number;
        last_page: number;
        current_page: number;
    };
}

export default function Index({ sidebar, syllabuses }: Props) {
    const sidebarStack = useSidebarStack();
    useEffect(() => {
        sidebarStack.set(sidebar);
    }, [sidebar]);

    const { flash } = usePage<{ flash?: { message?: string } }>().props;
    const [search, setSearch] = useState('');

    const filtered = syllabuses.data.filter((s) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
            s.title.toLowerCase().includes(q) ||
            s.class_label.toLowerCase().includes(q) ||
            s.session_name.toLowerCase().includes(q)
        );
    });

    function destroy(id: number) {
        if (confirm('Are you sure you want to delete this syllabus?')) {
            router.delete(`/admin/syllabus/${id}`);
        }
    }

    return (
        <DashboardLayout>
            <Head title="Syllabus" />

            <div className="space-y-6">
                <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase dark:text-slate-400">
                            Academic
                        </p>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
                            Syllabus
                        </h1>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            Manage class syllabuses and curriculum documents.
                        </p>
                    </div>
                    <Link
                        href="/admin/syllabus/create"
                        className="inline-flex items-center gap-1.5 self-start rounded-md bg-accent-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-700 sm:self-auto"
                    >
                        <AppIcon name="plus" className="h-4 w-4" />
                        Add syllabus
                    </Link>
                </header>

                {flash?.message && (
                    <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
                        {flash.message}
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
                                placeholder="Search syllabuses…"
                                className="h-9 w-full rounded-md border border-slate-200 bg-white pr-3 pl-9 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500"
                            />
                        </label>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                            {filtered.length} of {syllabuses.total} syllabuses
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
                            <thead className="bg-slate-50 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase dark:bg-slate-950/40 dark:text-slate-400">
                                <tr>
                                    <th className="px-4 py-3">Title</th>
                                    <th className="px-4 py-3">Class</th>
                                    <th className="px-4 py-3">Session</th>
                                    <th className="px-4 py-3">File</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filtered.map((syllabus) => (
                                    <tr
                                        key={syllabus.id}
                                        className="text-slate-700 hover:bg-slate-50/60 dark:text-slate-200 dark:hover:bg-slate-800/40"
                                    >
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-slate-900 dark:text-slate-100">
                                                {syllabus.title}
                                            </p>
                                            {syllabus.description && (
                                                <p className="max-w-md truncate text-xs text-slate-500 dark:text-slate-400">
                                                    {syllabus.description}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {syllabus.class_label}
                                        </td>
                                        <td className="px-4 py-3">
                                            {syllabus.session_name}
                                        </td>
                                        <td className="px-4 py-3">
                                            {syllabus.file_url ? (
                                                <a
                                                    href={syllabus.file_url}
                                                    target="_blank"
                                                    rel="noopener"
                                                    className="inline-flex items-center gap-1.5 text-accent-600 hover:underline dark:text-accent-400"
                                                >
                                                    <AppIcon name="download" className="h-4 w-4" />
                                                    View
                                                </a>
                                            ) : (
                                                <span>—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="inline-flex items-center gap-1">
                                                <Link
                                                    href={`/admin/syllabus/${syllabus.id}/edit`}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                                                    aria-label="Edit syllabus"
                                                >
                                                    <AppIcon name="pencil" className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    type="button"
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
                                                    aria-label="Delete syllabus"
                                                    onClick={() => destroy(syllabus.id)}
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
                                            colSpan={5}
                                            className="px-4 py-12 text-center text-sm text-slate-500 dark:text-slate-400"
                                        >
                                            No syllabuses found.
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
