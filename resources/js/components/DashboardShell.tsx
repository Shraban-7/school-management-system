import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import KpiCard from '@/components/KpiCard';
import type { Stat } from '@/types/dashboard';
import type { AuthUser } from '@/types/auth';

interface DashboardShellProps {
    role: string;
    title: string;
    subtitle?: string;
    stats?: Stat[];
    actions?: Array<{ label: string; href: string }>;
    children?: React.ReactNode;
}

export default function DashboardShell({
    role,
    title,
    subtitle,
    stats,
    actions,
    children,
}: DashboardShellProps) {
    const page = usePage();
    const props = page.props as Record<string, unknown>;
    const auth = props.auth as { user?: AuthUser | null } | undefined;
    const user = auth?.user ?? null;
    const flash = (props.flash as { message?: string | null })?.message ?? null;

    return (
        <div className="space-y-6">
            {flash && (
                <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
                    {flash}
                </div>
            )}

            <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase dark:text-slate-400">
                        {role} dashboard
                    </p>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            Welcome back,{' '}
                            <span className="font-medium text-slate-900 dark:text-slate-100">
                                {user?.name ?? 'there'}
                            </span>
                            .{' '}
                            {subtitle}
                        </p>
                    )}
                </div>

                {actions && actions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {actions.map((action) => (
                            <Link
                                key={action.href}
                                href={action.href}
                                className="inline-flex items-center gap-1.5 rounded-md bg-accent-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-700"
                            >
                                {action.label}
                            </Link>
                        ))}
                    </div>
                )}
            </header>

            {stats && stats.length > 0 && (
                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat, i) => (
                        <KpiCard
                            key={stat.label || i}
                            label={stat.label}
                            value={stat.value}
                            icon={stat.icon}
                            trend={stat.trend}
                            trendLabel={stat.trendLabel}
                            tone={stat.tone}
                            href={stat.href}
                        />
                    ))}
                </section>
            )}

            {children}
        </div>
    );
}
