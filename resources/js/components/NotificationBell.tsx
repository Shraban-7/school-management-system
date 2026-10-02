import React, { useState } from 'react';
import AppIcon from '@/components/AppIcon';

interface NotificationBellProps {
    count?: number;
}

export default function NotificationBell({ count = 0 }: NotificationBellProps) {
    const [open, setOpen] = useState(false);

    return (
        <div className="relative">
            <button
                type="button"
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                aria-label="Notifications"
                onClick={() => setOpen(!open)}
            >
                <AppIcon name="bell" className="h-5 w-5" />
                {count > 0 && (
                    <span className="absolute top-1.5 right-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-600 px-1 text-[10px] leading-none font-semibold text-white">
                        {count > 9 ? '9+' : count}
                    </span>
                )}
            </button>

            {open && (
                <>
                    <div
                        className="fixed inset-0 z-30"
                        onClick={() => setOpen(false)}
                    />
                    <div className="absolute right-0 z-40 mt-2 w-80 origin-top-right overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
                        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                Notifications
                            </h3>
                            <button
                                type="button"
                                className="text-xs font-medium text-accent-600 hover:text-accent-700 dark:text-accent-400"
                            >
                                Mark all read
                            </button>
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                            <div className="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                                <AppIcon
                                    name="bell"
                                    className="mx-auto mb-2 h-8 w-8 text-slate-300 dark:text-slate-600"
                                />
                                You're all caught up
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
