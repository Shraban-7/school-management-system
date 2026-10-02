import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import AppIcon from '@/components/AppIcon';
import { useSidebarStack } from '@/composables/useNavStack';
import type { SidebarConfig } from '@/types/sidebar';

interface ExamRow {
    id: number;
    name_en: string;
    name_bn: string;
    exam_type: string;
    start_date: string | null;
    end_date: string | null;
    is_published: boolean;
    session_name: string;
    institution_name: string;
    created_at: string | null;
}

interface Props {
    exams: {
        data: ExamRow[];
        from: number;
        to: number;
        total: number;
        last_page: number;
        current_page: number;
    };
    sidebar: SidebarConfig;
}

export default function Index({ exams, sidebar }: Props) {
    const sidebarStack = useSidebarStack();
    useEffect(() => {
        sidebarStack.set(sidebar);
    }, [sidebar]);

    const { flash } = usePage<{ flash?: { message?: string } }>().props;
    const [search, setSearch] = useState('');

    const filtered = exams.data.filter((exam) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
            exam.name_en.toLowerCase().includes(q) ||
            exam.name_bn?.toLowerCase().includes(q) ||
            exam.exam_type.toLowerCase().includes(q)
        );
    });

    function destroy(id: number) {
        if (confirm('Are you sure you want to delete this exam?')) {
            router.delete(`/admin/exams/${id}`);
        }
    }

    return (
        <DashboardLayout>
            <Head title="Exams" />

            <div className="space-y-6">
                <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase dark:text-slate-400">
                            Management
                        </p>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
                            Exams
                        </h1>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            Manage exams, schedules, and mark entries.
                        </p>
                    </div>
                    <Link
                        href="/admin/exams/create"
                        className="inline-flex items-center gap-1.5 self-start rounded-md bg-accent-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-700 sm:self-auto"
                    >
                        <AppIcon name="plus" className="h-4 w-4" />
                        Add exam
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
                                placeholder="Search by name or type…"
                                className="h-9 w-full rounded-md border border-slate-200 bg-white pr-3 pl-9 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500"
                            />
                        </label>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                            {filtered.length} of {exams.total} exams
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
                            <thead className="bg-slate-50 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase dark:bg-slate-950/40 dark:text-slate-400">
                                <tr>
                                    <th className="px-4 py-3">Name</th>
                                    <th className="px-4 py-3">Type</th>
                                    <th className="px-4 py-3">Session</th>
                                    <th className="px-4 py-3">Start</th>
                                    <th className="px-4 py-3">End</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filtered.map((exam) => (
                                    <tr
                                        key={exam.id}
                                        className="text-slate-700 hover:bg-slate-50/60 dark:text-slate-200 dark:hover:bg-slate-800/40"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="min-w-0">
                                                <p className="truncate font-medium text-slate-900 dark:text-slate-100">
                                                    {exam.name_en}
                                                </p>
                                                {exam.name_bn && (
                                                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                                                        {exam.name_bn}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 capitalize dark:bg-slate-800 dark:text-slate-300">
                                                {exam.exam_type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">
                                            {exam.session_name}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">
                                            {exam.start_date ?? '—'}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">
                                            {exam.end_date ?? '—'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                                                    exam.is_published
                                                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                                }`}
                                            >
                                                <span
                                                    className={`h-1.5 w-1.5 rounded-full ${
                                                        exam.is_published
                                                            ? 'bg-emerald-500'
                                                            : 'bg-slate-400'
                                                    }`}
                                                />
                                                {exam.is_published ? 'Published' : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="inline-flex items-center gap-1">
                                                <Link
                                                    href={`/admin/exams/${exam.id}/marks`}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                                                    aria-label="Marks entry"
                                                >
                                                    <AppIcon name="book-open" className="h-4 w-4" />
                                                </Link>
                                                <Link
                                                    href={`/admin/exams/${exam.id}/edit`}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                                                    aria-label="Edit exam"
                                                >
                                                    <AppIcon name="pencil" className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    type="button"
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
                                                    aria-label="Delete exam"
                                                    onClick={() => destroy(exam.id)}
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
                                            No exams found.
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
