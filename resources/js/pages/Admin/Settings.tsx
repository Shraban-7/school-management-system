import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import AppIcon from '@/components/AppIcon';
import { useSidebarStack } from '@/composables/useNavStack';
import type { SidebarConfig } from '@/types/sidebar';

type Field = {
    key: string;
    label: string;
    value: string | number | boolean;
    type: 'text' | 'email' | 'number' | 'toggle' | 'select';
    options?: string[];
};

interface AdminSettingsProps {
    groups: { title: string; fields: Field[] }[];
    sidebar: SidebarConfig;
}

export default function AdminSettings({ groups, sidebar }: AdminSettingsProps) {
    const sidebarStack = useSidebarStack();
    useEffect(() => {
        if (sidebar) {
            sidebarStack.set(sidebar);
        }
    }, [sidebar]);

    const [values, setValues] = useState<Record<string, string | number | boolean>>(() =>
        Object.fromEntries(
            groups.flatMap((group) =>
                group.fields.map((field) => [field.key, field.value]),
            ),
        ),
    );

    return (
        <DashboardLayout>
            <Head title="Settings" />

            <div className="space-y-6">
                <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase dark:text-slate-400">
                            System
                        </p>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
                            Settings
                        </h1>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            Control application variables, integrations, and defaults.
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-4">
                            <Link
                                href="/admin/settings/school"
                                className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-700 hover:text-accent-800 dark:text-accent-300"
                            >
                                <AppIcon name="cog" className="h-4 w-4" />
                                Edit school profile
                            </Link>
                            <Link
                                href="/admin/settings/zkteco"
                                className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-700 hover:text-accent-800 dark:text-accent-300"
                            >
                                <AppIcon name="server" className="h-4 w-4" />
                                ZKTeco Biometrics &amp; RFID
                            </Link>
                        </div>
                    </div>
                    <button
                        type="button"
                        className="inline-flex items-center gap-1.5 self-start rounded-md bg-accent-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-700 sm:self-auto"
                    >
                        <AppIcon name="check" className="h-4 w-4" />
                        Save changes
                    </button>
                </header>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {groups.map((group) => (
                        <section
                            key={group.title}
                            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                        >
                            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                                {group.title}
                            </h2>
                            <dl className="mt-4 space-y-4">
                                {group.fields.map((field) => (
                                    <div
                                        key={field.key}
                                        className="flex items-center justify-between gap-4"
                                    >
                                        <label
                                            htmlFor={`field-${field.key}`}
                                            className="text-sm font-medium text-slate-700 dark:text-slate-200"
                                        >
                                            {field.label}
                                        </label>
                                        <div className="max-w-xs flex-1">
                                            {field.type === 'text' ||
                                            field.type === 'email' ||
                                            field.type === 'number' ? (
                                                <input
                                                    id={`field-${field.key}`}
                                                    value={String(values[field.key] ?? '')}
                                                    onChange={(e) =>
                                                        setValues((prev) => ({
                                                            ...prev,
                                                            [field.key]: e.target.value,
                                                        }))
                                                    }
                                                    type={field.type}
                                                    className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                                />
                                            ) : field.type === 'toggle' ? (
                                                <button
                                                    type="button"
                                                    role="switch"
                                                    aria-checked={!!values[field.key]}
                                                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
                                                        values[field.key]
                                                            ? 'bg-accent-600'
                                                            : 'bg-slate-200 dark:bg-slate-700'
                                                    }`}
                                                    onClick={() =>
                                                        setValues((prev) => ({
                                                            ...prev,
                                                            [field.key]: !prev[field.key],
                                                        }))
                                                    }
                                                >
                                                    <span
                                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                                                            values[field.key]
                                                                ? 'translate-x-6'
                                                                : 'translate-x-1'
                                                        }`}
                                                    />
                                                </button>
                                            ) : null}
                                        </div>
                                    </div>
                                ))}
                            </dl>
                        </section>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
