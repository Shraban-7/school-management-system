import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import AppIcon from '@/components/AppIcon';
import { useSidebarStack } from '@/composables/useNavStack';
import type { SidebarConfig } from '@/types/sidebar';

interface Props {
    sidebar: SidebarConfig;
    versions: string[];
    groupStreams: string[];
}

export default function ClassesAndSectionsCreate({ sidebar, versions, groupStreams }: Props) {
    const sidebarStack = useSidebarStack();
    useEffect(() => {
        sidebarStack.set(sidebar);
    }, [sidebar]);

    const [form, setForm] = useState({
        version: '',
        class_level: '',
        group_stream: '',
        section_name: '',
        room_number: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    function submit(e: React.FormEvent) {
        e.preventDefault();
        router.post(
            '/admin/classes-and-sections',
            {
                ...form,
                group_stream: form.group_stream || null,
                room_number: form.room_number || null,
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
            <Head title="Create Class & Section" />

            <div className="space-y-6">
                <header className="flex items-center gap-4">
                    <Link
                        href="/admin/classes-and-sections"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                    >
                        <AppIcon name="arrow-left" className="h-5 w-5" />
                    </Link>
                    <div>
                        <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase dark:text-slate-400">
                            Management
                        </p>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
                            Create class & section
                        </h1>
                    </div>
                </header>

                <form onSubmit={submit} className="space-y-8">
                    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
                            Class & section details
                        </h2>

                        <div className="grid gap-6 sm:grid-cols-2">
                            <div>
                                <label
                                    htmlFor="version"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Version <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    id="version"
                                    value={form.version}
                                    onChange={(e) =>
                                        setForm({ ...form, version: e.target.value })
                                    }
                                    className={`mt-1 block w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:bg-slate-950 dark:text-slate-100 ${
                                        errors.version
                                            ? 'border-rose-500 dark:border-rose-500'
                                            : 'border-slate-200 dark:border-slate-700'
                                    }`}
                                >
                                    <option value="" disabled>
                                        Select version
                                    </option>
                                    {versions.map((v) => (
                                        <option key={v} value={v}>
                                            {v}
                                        </option>
                                    ))}
                                </select>
                                {errors.version && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {errors.version}
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
                                <input
                                    id="class_level"
                                    value={form.class_level}
                                    onChange={(e) =>
                                        setForm({ ...form, class_level: e.target.value })
                                    }
                                    type="text"
                                    placeholder="e.g. Class 9, XI (College)"
                                    className={`mt-1 block w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:bg-slate-950 dark:text-slate-100 ${
                                        errors.class_level
                                            ? 'border-rose-500 dark:border-rose-500'
                                            : 'border-slate-200 dark:border-slate-700'
                                    }`}
                                />
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
                                    Group / stream
                                </label>
                                <select
                                    id="group_stream"
                                    value={form.group_stream}
                                    onChange={(e) =>
                                        setForm({ ...form, group_stream: e.target.value })
                                    }
                                    className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                >
                                    <option value="">None (primary / general)</option>
                                    {groupStreams.map((g) => (
                                        <option key={g} value={g}>
                                            {g}
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
                                    htmlFor="section_name"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Section <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    id="section_name"
                                    value={form.section_name}
                                    onChange={(e) =>
                                        setForm({ ...form, section_name: e.target.value })
                                    }
                                    type="text"
                                    placeholder="e.g. A, B, C"
                                    maxLength={5}
                                    className={`mt-1 block w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:bg-slate-950 dark:text-slate-100 ${
                                        errors.section_name
                                            ? 'border-rose-500 dark:border-rose-500'
                                            : 'border-slate-200 dark:border-slate-700'
                                    }`}
                                />
                                {errors.section_name && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {errors.section_name}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="room_number"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Room number
                                </label>
                                <input
                                    id="room_number"
                                    value={form.room_number}
                                    onChange={(e) =>
                                        setForm({ ...form, room_number: e.target.value })
                                    }
                                    type="text"
                                    placeholder="e.g. 201"
                                    className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                />
                                {errors.room_number && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {errors.room_number}
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
                            Create class & section
                        </button>
                        <Link
                            href="/admin/classes-and-sections"
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
