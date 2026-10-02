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
    href,
}: KpiCardProps) {
    // Consistent, professional enterprise styling for all KPI cards
    const iconContainerClass =
        'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700/60';

    const trendClass =
        trend !== undefined
            ? trend >= 0
                ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300'
                : 'text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300'
            : '';

    const cardClasses = `group relative overflow-hidden flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-200 dark:border-slate-800/80 dark:bg-slate-900 ${
        href
            ? 'cursor-pointer hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm dark:hover:border-slate-700'
            : ''
    }`;

    const content = (
        <>
            <div>
                <div className="flex items-start justify-between gap-3">
                    <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                        {label}
                    </p>
                    {icon && (
                        <span
                            className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105 ${iconContainerClass}`}
                        >
                            <AppIcon name={icon} className="h-5 w-5" />
                        </span>
                    )}
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                    <p className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                        {value}
                    </p>
                </div>
            </div>

            {(trend !== undefined || trendLabel || href) && (
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs dark:border-slate-800/60">
                    <div className="flex items-center gap-1.5">
                        {trend !== undefined && (
                            <span
                                className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 font-semibold ${trendClass}`}
                            >
                                <AppIcon
                                    name={trend >= 0 ? 'trend-up' : 'trend-down'}
                                    className="h-3 w-3"
                                />
                                {Math.abs(trend)}%
                            </span>
                        )}
                        <span className="text-slate-500 dark:text-slate-400">
                            {trendLabel ?? (trend !== undefined ? 'vs last period' : '')}
                        </span>
                    </div>

                    {href && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 opacity-80 transition group-hover:translate-x-0.5 group-hover:text-slate-900 group-hover:opacity-100 dark:text-slate-400 dark:group-hover:text-slate-200">
                            View
                            <AppIcon name="arrow-right" className="h-3 w-3" />
                        </span>
                    )}
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
