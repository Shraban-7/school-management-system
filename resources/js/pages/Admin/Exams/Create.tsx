import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState, FormEvent } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import AppIcon from '@/components/AppIcon';
import { useSidebarStack } from '@/composables/useNavStack';
import type { SidebarConfig } from '@/types/sidebar';

interface Props {
    sidebar: SidebarConfig;
    sessions: { value: number; label: string }[];
    examTypes: string[];
}

export default function Create({ sidebar, sessions, examTypes }: Props) {
    const sidebarStack = useSidebarStack();
    useEffect(() => {
        sidebarStack.set(sidebar);
    }, [sidebar]);

    const [form, setForm] = useState({
        session_id: '' as string | number,
        name_en: '',
        name_bn: '',
        exam_type: '',
        start_date: '',
        end_date: '',
        is_published: false,
        description: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    function submit(e: FormEvent) {
        e.preventDefault();
        router.post(
            '/admin/exams',
            {
                ...form,
                session_id: Number(form.session_id),
            },
            {
                onError: (err) => {
                    setErrors(err);
                },
            },
        );
    }

    return (
        <DashboardLayout>
            <Head title="Create Exam" />

            <div className="space-y-6">
                <header className="flex items-center gap-4">
                    <Link
                        href="/admin/exams"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                    >
                        <AppIcon name="arrow-left" className="h-5 w-5" />
                    </Link>
                    <div>
                        <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase dark:text-slate-400">
                            Management
                        </p>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
                            Create exam
                        </h1>
                    </div>
                </header>

                <form onSubmit={submit} className="space-y-8">
                    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
                            Exam details
                        </h2>

                        <div className="grid gap-6 sm:grid-cols-2">
                            <div>
                                <label
                                    htmlFor="session_id"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Session <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    id="session_id"
                                    value={form.session_id}
                                    onChange={(e) =>
                                        setForm({ ...form, session_id: e.target.value })
                                    }
                                    className={`mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 ${
                                        errors.session_id ? 'border-rose-500' : ''
                                    }`}
                                >
                                    <option value="" disabled>
                                        Select session
                                    </option>
                                    {sessions.map((s) => (
                                        <option key={s.value} value={s.value}>
                                            {s.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.session_id && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {errors.session_id}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="name_en"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Name (English) <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    id="name_en"
                                    value={form.name_en}
                                    onChange={(e) =>
                                        setForm({ ...form, name_en: e.target.value })
                                    }
                                    type="text"
                                    placeholder="e.g. Half Yearly Exam 2026"
                                    className={`mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 ${
                                        errors.name_en ? 'border-rose-500' : ''
                                    }`}
                                />
                                {errors.name_en && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {errors.name_en}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="name_bn"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Name (Bangla)
                                </label>
                                <input
                                    id="name_bn"
                                    value={form.name_bn}
                                    onChange={(e) =>
                                        setForm({ ...form, name_bn: e.target.value })
                                    }
                                    type="text"
                                    placeholder="পরীক্ষার নাম"
                                    className={`mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 ${
                                        errors.name_bn ? 'border-rose-500' : ''
                                    }`}
                                />
                                {errors.name_bn && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {errors.name_bn}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="exam_type"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Exam type <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    id="exam_type"
                                    value={form.exam_type}
                                    onChange={(e) =>
                                        setForm({ ...form, exam_type: e.target.value })
                                    }
                                    className={`mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 ${
                                        errors.exam_type ? 'border-rose-500' : ''
                                    }`}
                                >
                                    <option value="" disabled>Select type</option>
                                    {examTypes.map((t) => (
                                        <option key={t} value={t}>
                                            {t}
                                        </option>
                                    ))}
                                </select>
                                {errors.exam_type && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {errors.exam_type}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="start_date"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Start date <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    id="start_date"
                                    value={form.start_date}
                                    onChange={(e) =>
                                        setForm({ ...form, start_date: e.target.value })
                                    }
                                    type="date"
                                    className={`mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 ${
                                        errors.start_date ? 'border-rose-500' : ''
                                    }`}
                                />
                                {errors.start_date && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {errors.start_date}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="end_date"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    End date <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    id="end_date"
                                    value={form.end_date}
                                    onChange={(e) =>
                                        setForm({ ...form, end_date: e.target.value })
                                    }
                                    type="date"
                                    className={`mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 ${
                                        errors.end_date ? 'border-rose-500' : ''
                                    }`}
                                />
                                {errors.end_date && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {errors.end_date}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    id="is_published"
                                    checked={form.is_published}
                                    onChange={(e) =>
                                        setForm({ ...form, is_published: e.target.checked })
                                    }
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-slate-300 text-accent-600 focus:ring-accent-500 dark:border-slate-600"
                                />
                                <label
                                    htmlFor="is_published"
                                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Published (visible to students & teachers)
                                </label>
                            </div>

                            <div className="sm:col-span-2">
                                <label
                                    htmlFor="description"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    value={form.description}
                                    onChange={(e) =>
                                        setForm({ ...form, description: e.target.value })
                                    }
                                    rows={3}
                                    placeholder="Optional notes about this exam…"
                                    className={`mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 ${
                                        errors.description ? 'border-rose-500' : ''
                                    }`}
                                />
                                {errors.description && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {errors.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>

                    <div className="flex items-center gap-3">
                        <button
                            type="submit"
                            className="inline-flex items-center gap-1.5 rounded-md bg-accent-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-700"
                        >
                            <AppIcon name="check" className="h-4 w-4" />
                            Create exam
                        </button>
                        <Link
                            href="/admin/exams"
                            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
