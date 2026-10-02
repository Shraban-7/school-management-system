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
        session_id: (sessions[0]?.value ?? '') as string | number,
        name_en: '',
        name_bn: '',
        exam_type: examTypes[0] ?? '',
        start_date: '',
        end_date: '',
        is_published: false,
        description: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    function submit(e: FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        router.post(
            '/admin/exams',
            {
                ...form,
                session_id: Number(form.session_id),
            },
            {
                onError: (err) => {
                    setErrors(err);
                    setSubmitting(false);
                },
                onFinish: () => {
                    setSubmitting(false);
                },
            },
        );
    }

    return (
        <DashboardLayout>
            <Head title="Create Exam" />

            <div className="mx-auto max-w-4xl space-y-6">
                {/* Header */}
                <header className="flex items-center gap-4">
                    <Link
                        href="/admin/exams"
                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-xs transition hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                        title="Back to exams"
                    >
                        <AppIcon name="arrow-left" className="h-5 w-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center rounded-md bg-accent-500/10 px-2 py-0.5 text-xs font-semibold tracking-wider text-accent-700 uppercase dark:bg-accent-500/20 dark:text-accent-300">
                                Exams & Evaluations
                            </span>
                            <span className="text-xs text-slate-400 dark:text-slate-500">/</span>
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                New Exam
                            </span>
                        </div>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
                            Create New Exam
                        </h1>
                        <p className="mt-0.5 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
                            Schedule a new examination term, set timeline dates, and configure visibility.
                        </p>
                    </div>
                </header>

                <form onSubmit={submit} className="space-y-6">
                    {/* Primary Details Card */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="border-b border-slate-200/80 px-6 py-4 dark:border-slate-800">
                            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                                Examination Details
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Basic identification and category information for the exam.
                            </p>
                        </div>

                        <div className="grid gap-6 p-6 sm:grid-cols-2">
                            {/* Academic Session */}
                            <div>
                                <label
                                    htmlFor="session_id"
                                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider dark:text-slate-300"
                                >
                                    Academic Session <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    id="session_id"
                                    value={form.session_id}
                                    onChange={(e) =>
                                        setForm({ ...form, session_id: e.target.value })
                                    }
                                    className={`mt-1.5 block w-full rounded-xl border bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-accent-500 focus:bg-white focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:bg-slate-900 [&>option]:bg-white dark:[&>option]:bg-slate-900 ${
                                        errors.session_id ? 'border-rose-500 dark:border-rose-500' : 'border-slate-200'
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
                                    <p className="mt-1.5 text-xs text-rose-500 dark:text-rose-400">
                                        {errors.session_id}
                                    </p>
                                )}
                            </div>

                            {/* Exam Type */}
                            <div>
                                <label
                                    htmlFor="exam_type"
                                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider dark:text-slate-300"
                                >
                                    Exam Type <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    id="exam_type"
                                    value={form.exam_type}
                                    onChange={(e) =>
                                        setForm({ ...form, exam_type: e.target.value })
                                    }
                                    className={`mt-1.5 block w-full rounded-xl border bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-accent-500 focus:bg-white focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:bg-slate-900 [&>option]:bg-white dark:[&>option]:bg-slate-900 ${
                                        errors.exam_type ? 'border-rose-500 dark:border-rose-500' : 'border-slate-200'
                                    }`}
                                >
                                    <option value="" disabled>Select exam type</option>
                                    {examTypes.map((t) => (
                                        <option key={t} value={t}>
                                            {t}
                                        </option>
                                    ))}
                                </select>
                                {errors.exam_type && (
                                    <p className="mt-1.5 text-xs text-rose-500 dark:text-rose-400">
                                        {errors.exam_type}
                                    </p>
                                )}
                            </div>

                            {/* Name English */}
                            <div>
                                <label
                                    htmlFor="name_en"
                                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider dark:text-slate-300"
                                >
                                    Exam Name (English) <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    id="name_en"
                                    value={form.name_en}
                                    onChange={(e) =>
                                        setForm({ ...form, name_en: e.target.value })
                                    }
                                    type="text"
                                    placeholder="e.g. Annual Examination 2026"
                                    className={`mt-1.5 block w-full rounded-xl border bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition focus:border-accent-500 focus:bg-white focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:bg-slate-900 ${
                                        errors.name_en ? 'border-rose-500 dark:border-rose-500' : 'border-slate-200'
                                    }`}
                                />
                                {errors.name_en && (
                                    <p className="mt-1.5 text-xs text-rose-500 dark:text-rose-400">
                                        {errors.name_en}
                                    </p>
                                )}
                            </div>

                            {/* Name Bangla */}
                            <div>
                                <label
                                    htmlFor="name_bn"
                                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider dark:text-slate-300"
                                >
                                    Exam Name (Bangla)
                                </label>
                                <input
                                    id="name_bn"
                                    value={form.name_bn}
                                    onChange={(e) =>
                                        setForm({ ...form, name_bn: e.target.value })
                                    }
                                    type="text"
                                    placeholder="যেমন: বার্ষিক পরীক্ষা ২০২৬"
                                    className={`mt-1.5 block w-full rounded-xl border bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition focus:border-accent-500 focus:bg-white focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:bg-slate-900 ${
                                        errors.name_bn ? 'border-rose-500 dark:border-rose-500' : 'border-slate-200'
                                    }`}
                                />
                                {errors.name_bn && (
                                    <p className="mt-1.5 text-xs text-rose-500 dark:text-rose-400">
                                        {errors.name_bn}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Timeline & Schedule Card */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="border-b border-slate-200/80 px-6 py-4 dark:border-slate-800">
                            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                                Schedule & Visibility
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Set start and end dates and configure publish status.
                            </p>
                        </div>

                        <div className="grid gap-6 p-6 sm:grid-cols-2">
                            {/* Start Date */}
                            <div>
                                <label
                                    htmlFor="start_date"
                                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider dark:text-slate-300"
                                >
                                    Start Date <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    id="start_date"
                                    value={form.start_date}
                                    onChange={(e) =>
                                        setForm({ ...form, start_date: e.target.value })
                                    }
                                    type="date"
                                    className={`mt-1.5 block w-full rounded-xl border bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 [color-scheme:light] dark:[color-scheme:dark] transition focus:border-accent-500 focus:bg-white focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:bg-slate-900 ${
                                        errors.start_date ? 'border-rose-500 dark:border-rose-500' : 'border-slate-200'
                                    }`}
                                />
                                {errors.start_date && (
                                    <p className="mt-1.5 text-xs text-rose-500 dark:text-rose-400">
                                        {errors.start_date}
                                    </p>
                                )}
                            </div>

                            {/* End Date */}
                            <div>
                                <label
                                    htmlFor="end_date"
                                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider dark:text-slate-300"
                                >
                                    End Date <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    id="end_date"
                                    value={form.end_date}
                                    onChange={(e) =>
                                        setForm({ ...form, end_date: e.target.value })
                                    }
                                    type="date"
                                    className={`mt-1.5 block w-full rounded-xl border bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 [color-scheme:light] dark:[color-scheme:dark] transition focus:border-accent-500 focus:bg-white focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:bg-slate-900 ${
                                        errors.end_date ? 'border-rose-500 dark:border-rose-500' : 'border-slate-200'
                                    }`}
                                />
                                {errors.end_date && (
                                    <p className="mt-1.5 text-xs text-rose-500 dark:text-rose-400">
                                        {errors.end_date}
                                    </p>
                                )}
                            </div>

                            {/* Published Toggle Card */}
                            <div className="sm:col-span-2">
                                <label className="flex items-start gap-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 cursor-pointer transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/60 dark:hover:bg-slate-800/40">
                                    <input
                                        id="is_published"
                                        checked={form.is_published}
                                        onChange={(e) =>
                                            setForm({ ...form, is_published: e.target.checked })
                                        }
                                        type="checkbox"
                                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-accent-600 focus:ring-accent-500 dark:border-slate-700 dark:bg-slate-950"
                                    />
                                    <div className="min-w-0">
                                        <span className="block text-sm font-semibold text-slate-900 dark:text-slate-100">
                                            Publish Examination
                                        </span>
                                        <span className="block text-xs text-slate-500 dark:text-slate-400">
                                            When enabled, this exam and its schedule will be visible to students, guardians, and teachers. Leave unchecked to save as draft.
                                        </span>
                                    </div>
                                </label>
                            </div>

                            {/* Description */}
                            <div className="sm:col-span-2">
                                <label
                                    htmlFor="description"
                                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider dark:text-slate-300"
                                >
                                    Description & Instructions
                                </label>
                                <textarea
                                    id="description"
                                    value={form.description}
                                    onChange={(e) =>
                                        setForm({ ...form, description: e.target.value })
                                    }
                                    rows={3}
                                    placeholder="Optional instructions, room details, or notes about this exam…"
                                    className={`mt-1.5 block w-full rounded-xl border bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition focus:border-accent-500 focus:bg-white focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:bg-slate-900 ${
                                        errors.description ? 'border-rose-500 dark:border-rose-500' : 'border-slate-200'
                                    }`}
                                />
                                {errors.description && (
                                    <p className="mt-1.5 text-xs text-rose-500 dark:text-rose-400">
                                        {errors.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Submit Bar */}
                    <div className="flex items-center gap-3">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex items-center gap-2 rounded-xl bg-accent-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-700 focus:ring-2 focus:ring-accent-500/30 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:shadow-accent-950/40"
                        >
                            <AppIcon name="check" className="h-4 w-4" />
                            {submitting ? 'Creating Exam…' : 'Create Exam'}
                        </button>
                        <Link
                            href="/admin/exams"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
