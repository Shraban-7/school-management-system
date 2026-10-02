import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import AppIcon from '@/components/AppIcon';
import { useSidebarStack } from '@/composables/useNavStack';
import type { SidebarConfig } from '@/types/sidebar';

interface Props {
    session: {
        id: number;
        session_name: string;
        start_date: string | null;
        end_date: string | null;
        is_active: boolean;
    };
    sidebar: SidebarConfig;
}

export default function AcademicSessionsEdit({ session, sidebar }: Props) {
    const sidebarStack = useSidebarStack();
    useEffect(() => {
        sidebarStack.set(sidebar);
    }, [sidebar]);

    const [form, setForm] = useState({
        session_name: session.session_name,
        start_date: session.start_date ?? '',
        end_date: session.end_date ?? '',
        is_active: session.is_active,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    function submit(e: React.FormEvent) {
        e.preventDefault();
        router.put(`/admin/academic-sessions/${session.id}`, form, {
            onError: (err) => {
                setErrors(err);
            },
        });
    }

    return (
        <DashboardLayout>
            <Head title="Edit Academic Session" />

            <div className="space-y-6">
                <header className="flex items-center gap-4">
                    <Link
                        href="/admin/academic-sessions"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                    >
                        <AppIcon name="arrow-left" className="h-5 w-5" />
                    </Link>
                    <div>
                        <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase dark:text-slate-400">
                            Management
                        </p>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
                            Edit academic session
                        </h1>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            {session.session_name}
                        </p>
                    </div>
                </header>

                <form onSubmit={submit} className="space-y-8">
                    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
                            Session details
                        </h2>

                        <div className="grid gap-6 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <label
                                    htmlFor="session_name"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Session name <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    id="session_name"
                                    value={form.session_name}
                                    onChange={(e) =>
                                        setForm({ ...form, session_name: e.target.value })
                                    }
                                    type="text"
                                    placeholder="e.g. 2026-2027"
                                    className={`mt-1 block w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:bg-slate-950 dark:text-slate-100 ${
                                        errors.session_name
                                            ? 'border-rose-500 dark:border-rose-500'
                                            : 'border-slate-200 dark:border-slate-700'
                                    }`}
                                />
                                {errors.session_name && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {errors.session_name}
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
                                    className={`mt-1 block w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:bg-slate-950 dark:text-slate-100 ${
                                        errors.start_date
                                            ? 'border-rose-500 dark:border-rose-500'
                                            : 'border-slate-200 dark:border-slate-700'
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
                                    className={`mt-1 block w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:bg-slate-950 dark:text-slate-100 ${
                                        errors.end_date
                                            ? 'border-rose-500 dark:border-rose-500'
                                            : 'border-slate-200 dark:border-slate-700'
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
                                    Set as active session
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
                            href="/admin/academic-sessions"
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
