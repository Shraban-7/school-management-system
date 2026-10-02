import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import AppIcon from '@/components/AppIcon';
import { useSidebarStack } from '@/composables/useNavStack';
import type { SidebarConfig } from '@/types/sidebar';

interface Props {
    subject: {
        id: number;
        name_en: string;
        name_bn: string;
        code: string;
        class_level: string;
        group_stream: string | null;
        subject_type: string;
        full_marks: number;
        pass_marks: number;
        is_active: boolean;
        institution_id: number;
    };
    sidebar: SidebarConfig;
    groupStreams: string[];
    subjectTypes: string[];
    classLevels: string[];
}

export default function SubjectsEdit({
    subject,
    sidebar,
    groupStreams,
    subjectTypes,
    classLevels,
}: Props) {
    const sidebarStack = useSidebarStack();
    useEffect(() => {
        sidebarStack.set(sidebar);
    }, [sidebar]);

    const page = usePage<any>();
    const flash = page.props.flash?.message ?? null;

    const [form, setForm] = useState({
        name_en: subject.name_en,
        name_bn: subject.name_bn,
        code: subject.code,
        class_level: subject.class_level,
        group_stream: subject.group_stream ?? '',
        subject_type: subject.subject_type,
        full_marks: subject.full_marks,
        pass_marks: subject.pass_marks,
        is_active: subject.is_active,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    function submit(e: React.FormEvent) {
        e.preventDefault();
        router.put(
            `/admin/subjects/${subject.id}`,
            {
                name_en: form.name_en,
                name_bn: form.name_bn,
                code: form.code,
                class_level: form.class_level,
                group_stream: form.group_stream || null,
                subject_type: form.subject_type,
                full_marks: Number(form.full_marks),
                pass_marks: Number(form.pass_marks),
                is_active: form.is_active,
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
            <Head title="Edit Subject" />

            <div className="space-y-6">
                <header className="flex items-center gap-4">
                    <Link
                        href="/admin/subjects"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                    >
                        <AppIcon name="arrow-left" className="h-5 w-5" />
                    </Link>
                    <div>
                        <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase dark:text-slate-400">
                            Management
                        </p>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
                            Edit subject
                        </h1>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            {subject.name_en}
                        </p>
                    </div>
                </header>

                {flash && (
                    <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
                        {flash}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-8">
                    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
                            Subject details
                        </h2>

                        <div className="grid gap-6 sm:grid-cols-2">
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
                                    className={`mt-1 block w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:bg-slate-950 dark:text-slate-100 ${
                                        errors.name_en
                                            ? 'border-rose-500 dark:border-rose-500'
                                            : 'border-slate-200 dark:border-slate-700'
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
                                    Name (Bangla) <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    id="name_bn"
                                    value={form.name_bn}
                                    onChange={(e) =>
                                        setForm({ ...form, name_bn: e.target.value })
                                    }
                                    type="text"
                                    className={`mt-1 block w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:bg-slate-950 dark:text-slate-100 ${
                                        errors.name_bn
                                            ? 'border-rose-500 dark:border-rose-500'
                                            : 'border-slate-200 dark:border-slate-700'
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
                                    htmlFor="code"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Code <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    id="code"
                                    value={form.code}
                                    onChange={(e) =>
                                        setForm({ ...form, code: e.target.value })
                                    }
                                    type="text"
                                    className={`mt-1 block w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:bg-slate-950 dark:text-slate-100 ${
                                        errors.code
                                            ? 'border-rose-500 dark:border-rose-500'
                                            : 'border-slate-200 dark:border-slate-700'
                                    }`}
                                />
                                {errors.code && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {errors.code}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="class_level"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Class level <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    id="class_level"
                                    value={form.class_level}
                                    onChange={(e) =>
                                        setForm({ ...form, class_level: e.target.value })
                                    }
                                    className={`mt-1 block w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:bg-slate-950 dark:text-slate-100 ${
                                        errors.class_level
                                            ? 'border-rose-500 dark:border-rose-500'
                                            : 'border-slate-200 dark:border-slate-700'
                                    }`}
                                >
                                    <option value="" disabled>
                                        Select class
                                    </option>
                                    {classLevels.map((cl) => (
                                        <option key={cl} value={cl}>
                                            {cl}
                                        </option>
                                    ))}
                                </select>
                                {errors.class_level && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {errors.class_level}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="group_stream"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Group / Stream
                                </label>
                                <select
                                    id="group_stream"
                                    value={form.group_stream}
                                    onChange={(e) =>
                                        setForm({ ...form, group_stream: e.target.value })
                                    }
                                    className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                >
                                    <option value="">None</option>
                                    {groupStreams.map((gs) => (
                                        <option key={gs} value={gs}>
                                            {gs}
                                        </option>
                                    ))}
                                </select>
                                {errors.group_stream && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {errors.group_stream}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="subject_type"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Subject type <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    id="subject_type"
                                    value={form.subject_type}
                                    onChange={(e) =>
                                        setForm({ ...form, subject_type: e.target.value })
                                    }
                                    className={`mt-1 block w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:bg-slate-950 dark:text-slate-100 ${
                                        errors.subject_type
                                            ? 'border-rose-500 dark:border-rose-500'
                                            : 'border-slate-200 dark:border-slate-700'
                                    }`}
                                >
                                    <option value="" disabled>
                                        Select type
                                    </option>
                                    {subjectTypes.map((st) => (
                                        <option key={st} value={st}>
                                            {st}
                                        </option>
                                    ))}
                                </select>
                                {errors.subject_type && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {errors.subject_type}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="full_marks"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Full marks <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    id="full_marks"
                                    value={form.full_marks}
                                    onChange={(e) =>
                                        setForm({ ...form, full_marks: Number(e.target.value) })
                                    }
                                    type="number"
                                    className={`mt-1 block w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:bg-slate-950 dark:text-slate-100 ${
                                        errors.full_marks
                                            ? 'border-rose-500 dark:border-rose-500'
                                            : 'border-slate-200 dark:border-slate-700'
                                    }`}
                                />
                                {errors.full_marks && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {errors.full_marks}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="pass_marks"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Pass marks <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    id="pass_marks"
                                    value={form.pass_marks}
                                    onChange={(e) =>
                                        setForm({ ...form, pass_marks: Number(e.target.value) })
                                    }
                                    type="number"
                                    className={`mt-1 block w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:bg-slate-950 dark:text-slate-100 ${
                                        errors.pass_marks
                                            ? 'border-rose-500 dark:border-rose-500'
                                            : 'border-slate-200 dark:border-slate-700'
                                    }`}
                                />
                                {errors.pass_marks && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {errors.pass_marks}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    id="is_active"
                                    checked={form.is_active}
                                    onChange={(e) =>
                                        setForm({ ...form, is_active: e.target.checked })
                                    }
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-slate-300 text-accent-600 focus:ring-accent-500 dark:border-slate-600"
                                />
                                <label
                                    htmlFor="is_active"
                                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Active
                                </label>
                            </div>
                        </div>
                    </section>

                    <div className="flex items-center gap-3">
                        <button
                            type="submit"
                            className="inline-flex items-center gap-1.5 rounded-md bg-accent-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-700"
                        >
                            <AppIcon name="check" className="h-4 w-4" />
                            Save changes
                        </button>
                        <Link
                            href="/admin/subjects"
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
