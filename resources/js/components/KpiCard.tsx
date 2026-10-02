import React from 'react';
import AppIcon from '@/components/AppIcon';

interface KpiCardProps {
    label: string;
    value: string | number;
    icon?: string;
    trend?: number;
    trendLabel?: string;
    tone?: 'default' | 'accent' | 'success' | 'warning' | 'danger';
    href?: string;
}

export default function KpiCard({
    label,
    value,
    icon,
    trend,
    trendLabel,
    tone = 'default',
    href,
}: KpiCardProps) {
    let toneClass = 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300';
    if (tone === 'accent') {
        toneClass = 'bg-accent-50 text-accent-600 dark:bg-accent-950/40 dark:text-accent-300';
    } else if (tone === 'success') {
        toneClass = 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300';
    } else if (tone === 'warning') {
        toneClass = 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300';
    } else if (tone === 'danger') {
        toneClass = 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300';
    }

    const trendClass =
        trend !== undefined
            ? trend >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            : '';

    const cardClasses = `group relative flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition dark:border-slate-800 dark:bg-slate-900 ${
        href ? 'hover:border-accent-300 hover:shadow dark:hover:border-accent-700' : ''
    }`;

    const content = (
        <>
            <div className="flex items-start justify-between">
                <p className="text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400">
                    {label}
                </p>
                {icon && (
                    <span
                        className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${toneClass}`}
                    >
                        <AppIcon name={icon} className="h-5 w-5" />
                    </span>
                )}
            </div>
            <p className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                {value}
            </p>
            {(trend !== undefined || trendLabel) && (
                <div className="flex items-center gap-1.5 text-xs">
                    {trend !== undefined && (
                        <span className={`inline-flex items-center gap-0.5 font-medium ${trendClass}`}>
                            <AppIcon
                                name={trend >= 0 ? 'trend-up' : 'trend-down'}
                                className="h-3.5 w-3.5"
                            />
                            {Math.abs(trend)}%
                        </span>
                    )}
                    <span className="text-slate-500 dark:text-slate-400">
                        {trendLabel ?? 'vs last period'}
                    </span>
                </div>
            )}
        </>
    );

    if (href) {
        return (
            <a href={href} className={cardClasses}>
                {content}
            </a>
        );
    }

    return <div className={cardClasses}>{content}</div>;
}
