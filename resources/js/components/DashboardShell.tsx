import React from 'react';
import { usePage } from '@inertiajs/react';

interface DashboardShellProps {
    role?: string;
    title?: string;
    subtitle?: string;
    stats?: unknown;
    actions?: Array<{ label: string; href: string }>;
    children?: React.ReactNode;
}

export default function DashboardShell({ children }: DashboardShellProps) {
    const page = usePage();
    const props = page.props as Record<string, unknown>;
    const flash = (props.flash as { message?: string | null })?.message ?? null;

    return (
        <div className="space-y-6">
            {flash && (
                <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-800 shadow-xs dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-200">
                    <span className="flex h-2 w-2 shrink-0 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{flash}</span>
                </div>
            )}

            {children}
        </div>
    );
}

