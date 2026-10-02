import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
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
    const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');

    // Extract unique exam types for filter dropdown
    const availableTypes = useMemo(() => {
        const types = new Set<string>();
        exams.data.forEach((e) => {
            if (e.exam_type) types.add(e.exam_type);
        });
        return Array.from(types).sort();
    }, [exams.data]);

    const stats = useMemo(() => {
        const total = exams.total;
        const published = exams.data.filter((e) => e.is_published).length;
        const draft = exams.data.filter((e) => !e.is_published).length;
        return { total, published, draft };
    }, [exams]);

    const filtered = useMemo(() => {
        return exams.data.filter((exam) => {
            // Status filter
            if (statusFilter === 'published' && !exam.is_published) return false;
            if (statusFilter === 'draft' && exam.is_published) return false;

            // Type filter
            if (typeFilter !== 'all' && exam.exam_type !== typeFilter) return false;

            // Search filter
            if (!search) return true;
            const q = search.toLowerCase();
            return (
                exam.name_en.toLowerCase().includes(q) ||
                exam.name_bn?.toLowerCase().includes(q) ||
                exam.exam_type.toLowerCase().includes(q) ||
                exam.session_name?.toLowerCase().includes(q)
            );
        });
    }, [exams.data, search, statusFilter, typeFilter]);

    function destroy(id: number, name: string) {
        if (confirm(`Are you sure you want to delete "${name}"? All associated marks will be removed.`)) {
            router.delete(`/admin/exams/${id}`);
        }
    }

    return (
        <DashboardLayout>
            <Head title="Exams & Evaluations" />

            <div className="w-full max-w-full space-y-6">
                {/* Header */}
                <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex h-6 items-center rounded-md bg-accent-500/10 px-2 text-xs font-semibold tracking-wider text-accent-700 uppercase dark:bg-accent-500/20 dark:text-accent-300">
                                Academics
                            </span>
                            <span className="text-xs text-slate-400 dark:text-slate-500">/</span>
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                Evaluations
                            </span>
                        </div>
                        <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
                            Exams & Marks
                        </h1>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            Configure exam schedules, manage student marks, and view grade distributions.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <Link
                            href="/admin/exams/create"
                            className="inline-flex items-center gap-2 rounded-xl bg-accent-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-700 focus:ring-2 focus:ring-accent-500/30 focus:outline-none dark:shadow-accent-950/40"
                        >
                            <AppIcon name="plus" className="h-4 w-4" />
                            Create Exam
                        </Link>
                    </div>
                </header>

                {/* Flash message */}
                {flash?.message && (
                    <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 shadow-xs dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200">
                        <AppIcon name="check" className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <span>{flash.message}</span>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Total Exams
                                </p>
                                <p className="mt-1.5 text-2xl font-bold text-slate-900 dark:text-slate-50">
                                    {stats.total}
                                </p>
                            </div>
                            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-50 text-accent-600 dark:bg-accent-950/50 dark:text-accent-400">
                                <AppIcon name="book-open" className="h-5 w-5" />
                            </span>
                        </div>
                    </div>

                    <div className="relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Published
                                </p>
                                <p className="mt-1.5 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                    {stats.published}
                                </p>
                            </div>
                            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                                <AppIcon name="check" className="h-5 w-5" />
                            </span>
                        </div>
                    </div>

                    <div className="relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Draft
                                </p>
                                <p className="mt-1.5 text-2xl font-bold text-slate-700 dark:text-slate-300">
                                    {stats.draft}
                                </p>
                            </div>
                            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                <AppIcon name="pencil" className="h-5 w-5" />
                            </span>
                        </div>
                    </div>
                </div>

                {/* Filter and Table Container */}
                <section className="w-full max-w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    {/* Controls Bar */}
                    <div className="flex flex-col gap-3 border-b border-slate-200/80 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
                        <div className="flex flex-1 flex-wrap items-center gap-3">
                            {/* Search box */}
                            <label className="relative flex min-w-[200px] flex-1 items-center sm:max-w-xs">
                                <AppIcon
                                    name="search"
                                    className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400 dark:text-slate-500"
                                />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    type="search"
                                    placeholder="Search exams…"
                                    className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/50 pr-3 pl-9 text-sm text-slate-900 placeholder-slate-400 transition focus:border-accent-500 focus:bg-white focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:bg-slate-900"
                                />
                                {search && (
                                    <button
                                        type="button"
                                        onClick={() => setSearch('')}
                                        className="absolute right-2.5 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                                    >
                                        <AppIcon name="close" className="h-3.5 w-3.5" />
                                    </button>
                                )}
                            </label>

                            {/* Status Filter */}
                            <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50/50 p-0.5 text-xs font-medium dark:border-slate-700 dark:bg-slate-950">
                                <button
                                    type="button"
                                    onClick={() => setStatusFilter('all')}
                                    className={`rounded-md px-2.5 py-1.5 transition ${
                                        statusFilter === 'all'
                                            ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-slate-100'
                                            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                                    }`}
                                >
                                    All
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStatusFilter('published')}
                                    className={`rounded-md px-2.5 py-1.5 transition ${
                                        statusFilter === 'published'
                                            ? 'bg-white text-emerald-700 shadow-xs dark:bg-slate-800 dark:text-emerald-400'
                                            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                                    }`}
                                >
                                    Published
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStatusFilter('draft')}
                                    className={`rounded-md px-2.5 py-1.5 transition ${
                                        statusFilter === 'draft'
                                            ? 'bg-white text-slate-700 shadow-xs dark:bg-slate-800 dark:text-slate-300'
                                            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                                    }`}
                                >
                                    Draft
                                </button>
                            </div>

                            {/* Type filter */}
                            {availableTypes.length > 0 && (
                                <select
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                    className="h-9 rounded-lg border border-slate-200 bg-slate-50/50 px-2.5 text-xs font-medium text-slate-700 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 [&>option]:bg-white dark:[&>option]:bg-slate-900"
                                >
                                    <option value="all">All Types</option>
                                    {availableTypes.map((t) => (
                                        <option key={t} value={t}>
                                            {t}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            Showing <strong className="text-slate-800 dark:text-slate-200">{filtered.length}</strong> of {exams.total} exams
                        </span>
                    </div>

                    {/* Isolated Horizontal Scroll Wrapper */}
                    <div className="w-full max-w-full overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                        <table className="w-full min-w-[760px] divide-y divide-slate-200/80 text-left text-sm dark:divide-slate-800">
                            <thead className="bg-slate-50/80 text-xs font-semibold tracking-wider text-slate-600 uppercase dark:bg-slate-950/70 dark:text-slate-300">
                                <tr>
                                    <th className="px-5 py-3.5">Exam Name</th>
                                    <th className="px-4 py-3.5">Type</th>
                                    <th className="px-4 py-3.5">Session</th>
                                    <th className="px-4 py-3.5">Dates</th>
                                    <th className="px-4 py-3.5">Status</th>
                                    <th className="px-5 py-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                                {filtered.map((exam) => (
                                    <tr
                                        key={exam.id}
                                        className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                                    >
                                        {/* Exam Name */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-500/10 text-accent-600 dark:bg-accent-500/20 dark:text-accent-400">
                                                    <AppIcon name="book-open" className="h-4 w-4" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="truncate font-semibold text-slate-900 dark:text-slate-100">
                                                        {exam.name_en}
                                                    </p>
                                                    {exam.name_bn && (
                                                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                                                            {exam.name_bn}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Exam Type */}
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 capitalize dark:bg-slate-800 dark:text-slate-300">
                                                {exam.exam_type}
                                            </span>
                                        </td>

                                        {/* Academic Session */}
                                        <td className="px-4 py-4 whitespace-nowrap text-xs font-medium text-slate-600 dark:text-slate-300">
                                            <div className="flex items-center gap-1.5">
                                                <AppIcon name="calendar" className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                                                <span>{exam.session_name || '—'}</span>
                                            </div>
                                        </td>

                                        {/* Schedule */}
                                        <td className="px-4 py-4 whitespace-nowrap text-xs text-slate-600 dark:text-slate-300">
                                            {exam.start_date || exam.end_date ? (
                                                <div className="space-y-0.5">
                                                    <div>
                                                        <span className="text-slate-400 dark:text-slate-500">From: </span>
                                                        <span className="font-medium text-slate-700 dark:text-slate-200">
                                                            {exam.start_date ?? '—'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-400 dark:text-slate-500">To: </span>
                                                        <span className="font-medium text-slate-700 dark:text-slate-200">
                                                            {exam.end_date ?? '—'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 dark:text-slate-500">Not set</span>
                                            )}
                                        </td>

                                        {/* Publication Status */}
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                    exam.is_published
                                                        ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 dark:text-emerald-400 dark:bg-emerald-500/15'
                                                        : 'bg-slate-500/10 text-slate-600 border border-slate-500/20 dark:text-slate-400 dark:bg-slate-500/15'
                                                }`}
                                            >
                                                <span
                                                    className={`h-1.5 w-1.5 rounded-full ${
                                                        exam.is_published
                                                            ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]'
                                                            : 'bg-slate-400 dark:bg-slate-500'
                                                    }`}
                                                />
                                                {exam.is_published ? 'Published' : 'Draft'}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-5 py-4 whitespace-nowrap text-right">
                                            <div className="inline-flex items-center gap-1.5">
                                                {/* Enter Marks Button */}
                                                <Link
                                                    href={`/admin/exams/${exam.id}/marks`}
                                                    className="inline-flex items-center gap-1.5 rounded-lg bg-accent-50 px-2.5 py-1.5 text-xs font-semibold text-accent-700 transition hover:bg-accent-100 focus:outline-none dark:bg-accent-950/60 dark:text-accent-300 dark:hover:bg-accent-900/60"
                                                    title="Enter student marks"
                                                >
                                                    <AppIcon name="book-open" className="h-3.5 w-3.5" />
                                                    <span>Marks</span>
                                                </Link>

                                                {/* Edit Button */}
                                                <Link
                                                    href={`/admin/exams/${exam.id}/edit`}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                                                    aria-label="Edit exam"
                                                    title="Edit exam"
                                                >
                                                    <AppIcon name="pencil" className="h-4 w-4" />
                                                </Link>

                                                {/* Delete Button */}
                                                <button
                                                    type="button"
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 focus:outline-none dark:text-slate-500 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                                                    aria-label="Delete exam"
                                                    title="Delete exam"
                                                    onClick={() => destroy(exam.id, exam.name_en)}
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
                                            colSpan={6}
                                            className="px-6 py-14 text-center text-sm text-slate-500 dark:text-slate-400"
                                        >
                                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                                                <AppIcon name="search" className="h-6 w-6" />
                                            </div>
                                            <h3 className="mt-3 font-semibold text-slate-900 dark:text-slate-100">
                                                No exams found
                                            </h3>
                                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                {search || statusFilter !== 'all' || typeFilter !== 'all'
                                                    ? 'Try adjusting your search criteria or clearing filters.'
                                                    : 'Get started by creating your first exam.'}
                                            </p>
                                            {search || statusFilter !== 'all' || typeFilter !== 'all' ? (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSearch('');
                                                        setStatusFilter('all');
                                                        setTypeFilter('all');
                                                    }}
                                                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                                                >
                                                    Clear filters
                                                </button>
                                            ) : (
                                                <Link
                                                    href="/admin/exams/create"
                                                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-accent-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-accent-700"
                                                >
                                                    <AppIcon name="plus" className="h-3.5 w-3.5" />
                                                    Create exam
                                                </Link>
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {exams.last_page > 1 && (
                        <div className="flex items-center justify-between border-t border-slate-200/80 px-4 py-3 sm:px-6 dark:border-slate-800">
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                Page <strong className="text-slate-900 dark:text-slate-100">{exams.current_page}</strong> of{' '}
                                <strong className="text-slate-900 dark:text-slate-100">{exams.last_page}</strong>
                            </span>
                            <div className="flex items-center gap-1">
                                {exams.current_page > 1 && (
                                    <Link
                                        href={`/admin/exams?page=${exams.current_page - 1}`}
                                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                                    >
                                        <AppIcon name="chevron-left" className="h-3.5 w-3.5" />
                                        Previous
                                    </Link>
                                )}
                                {exams.current_page < exams.last_page && (
                                    <Link
                                        href={`/admin/exams?page=${exams.current_page + 1}`}
                                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                                    >
                                        Next
                                        <AppIcon name="chevron-right" className="h-3.5 w-3.5" />
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </DashboardLayout>
    );
}
