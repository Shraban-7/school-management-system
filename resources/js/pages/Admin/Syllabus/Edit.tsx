import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState, FormEvent, ChangeEvent } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import AppIcon from '@/components/AppIcon';
import { useSidebarStack } from '@/composables/useNavStack';
import type { SidebarConfig } from '@/types/sidebar';

interface Option {
    value: number | string;
    label: string;
}

interface Syllabus {
    id: number;
    class_id: number | string;
    academic_session_id: number | string;
    title: string;
    description: string | null;
    file_url: string | null;
}

interface Props {
    sidebar: SidebarConfig;
    syllabus: Syllabus;
    classes: Option[];
    sessions: Option[];
}

export default function Edit({
    sidebar,
    syllabus,
    classes,
    sessions,
}: Props) {
    const sidebarStack = useSidebarStack();
    useEffect(() => {
        sidebarStack.set(sidebar);
    }, [sidebar]);

    const { flash } = usePage<{ flash?: { message?: string } }>().props;

    const [form, setForm] = useState({
        class_id: syllabus.class_id,
        academic_session_id: syllabus.academic_session_id,
        title: syllabus.title,
        description: syllabus.description ?? '',
        remove_file: false,
    });

    const [file, setFile] = useState<File | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    function onFileChange(event: ChangeEvent<HTMLInputElement>) {
        setFile(event.target.files?.[0] ?? null);
    }

    function submit(e: FormEvent) {
        e.preventDefault();
        router.post(
            `/admin/syllabus/${syllabus.id}`,
            {
                _method: 'put',
                class_id: form.class_id,
                academic_session_id: form.academic_session_id,
                title: form.title,
                description: form.description,
                file: file,
                remove_file: form.remove_file,
            },
            {
                forceFormData: true,
                onError: (err) => {
                    setErrors(err);
                },
                onSuccess: () => {
                    setErrors({});
                    setFile(null);
                    setForm((prev) => ({ ...prev, remove_file: false }));
                },
            },
        );
    }

    const inputClass =
        'mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100';
    const labelClass =
        'block text-sm font-medium text-slate-700 dark:text-slate-300';
    const errorClass = 'mt-1 text-xs text-rose-500';

    return (
        <DashboardLayout>
            <Head title="Edit Syllabus" />

            <div className="space-y-6">
                <header className="flex items-center gap-4">
                    <Link
                        href="/admin/syllabus"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                    >
                        <AppIcon name="arrow-left" className="h-5 w-5" />
                    </Link>
                    <div>
                        <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase dark:text-slate-400">
                            Academic
                        </p>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
                            Edit syllabus
                        </h1>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            {syllabus.title}
                        </p>
                    </div>
                </header>

                {flash?.message && (
                    <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
                        {flash.message}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-8">
                    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
                            Syllabus details
                        </h2>

                        <div className="grid gap-6 sm:grid-cols-2">
                            <div>
                                <label htmlFor="class_id" className={labelClass}>
                                    Class <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    id="class_id"
                                    value={form.class_id}
                                    onChange={(e) =>
                                        setForm({ ...form, class_id: e.target.value })
                                    }
                                    className={`${inputClass} ${
                                        errors.class_id ? 'border-rose-500' : ''
                                    }`}
                                >
                                    <option value="" disabled>Select class</option>
                                    {classes.map((cls) => (
                                        <option key={cls.value} value={cls.value}>
                                            {cls.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.class_id && (
                                    <p className={errorClass}>{errors.class_id}</p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="academic_session_id"
                                    className={labelClass}
                                >
                                    Session <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    id="academic_session_id"
                                    value={form.academic_session_id}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            academic_session_id: e.target.value,
                                        })
                                    }
                                    className={`${inputClass} ${
                                        errors.academic_session_id
                                            ? 'border-rose-500'
                                            : ''
                                    }`}
                                >
                                    <option value="" disabled>
                                        Select session
                                    </option>
                                    {sessions.map((session) => (
                                        <option
                                            key={session.value}
                                            value={session.value}
                                        >
                                            {session.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.academic_session_id && (
                                    <p className={errorClass}>
                                        {errors.academic_session_id}
                                    </p>
                                )}
                            </div>

                            <div className="sm:col-span-2">
                                <label htmlFor="title" className={labelClass}>
                                    Title <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    id="title"
                                    value={form.title}
                                    onChange={(e) =>
                                        setForm({ ...form, title: e.target.value })
                                    }
                                    type="text"
                                    className={`${inputClass} ${
                                        errors.title ? 'border-rose-500' : ''
                                    }`}
                                />
                                {errors.title && (
                                    <p className={errorClass}>{errors.title}</p>
                                )}
                            </div>

                            <div className="sm:col-span-2">
                                <label htmlFor="description" className={labelClass}>
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    value={form.description}
                                    onChange={(e) =>
                                        setForm({ ...form, description: e.target.value })
                                    }
                                    rows={4}
                                    className={`${inputClass} ${
                                        errors.description ? 'border-rose-500' : ''
                                    }`}
                                />
                                {errors.description && (
                                    <p className={errorClass}>{errors.description}</p>
                                )}
                            </div>

                            <div className="sm:col-span-2">
                                <label htmlFor="file" className={labelClass}>
                                    File (PDF)
                                </label>
                                <div className="mt-2 space-y-2">
                                    {syllabus.file_url && (
                                        <a
                                            href={syllabus.file_url}
                                            target="_blank"
                                            rel="noopener"
                                            className="inline-flex items-center gap-1.5 text-sm text-accent-600 hover:underline dark:text-accent-400"
                                        >
                                            <AppIcon name="download" className="h-4 w-4" />
                                            View current file
                                        </a>
                                    )}
                                    <input
                                        id="file"
                                        type="file"
                                        accept="application/pdf"
                                        className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200 dark:text-slate-400 dark:file:bg-slate-800 dark:file:text-slate-300 dark:hover:file:bg-slate-700"
                                        onChange={onFileChange}
                                    />
                                    {errors.file && (
                                        <p className={errorClass}>{errors.file}</p>
                                    )}
                                    {syllabus.file_url && (
                                        <div className="flex items-center gap-2">
                                            <input
                                                id="remove_file"
                                                checked={form.remove_file}
                                                onChange={(e) =>
                                                    setForm({
                                                        ...form,
                                                        remove_file: e.target.checked,
                                                    })
                                                }
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-slate-300 text-accent-600 focus:ring-accent-500 dark:border-slate-600"
                                            />
                                            <label
                                                htmlFor="remove_file"
                                                className="text-sm text-slate-600 dark:text-slate-400"
                                            >
                                                Remove current file
                                            </label>
                                        </div>
                                    )}
                                </div>
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
                            href="/admin/syllabus"
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
