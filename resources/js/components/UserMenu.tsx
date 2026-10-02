import React, { useEffect, useRef, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import AppIcon from '@/components/AppIcon';
import ThemeToggle from '@/components/ThemeToggle';
import { useI18n } from '@/composables/useI18n';
import type { AuthUser } from '@/types/auth';

const dashboardByRole: Record<string, string> = {
    admin: '/admin/dashboard',
    headmaster: '/headmaster/dashboard',
    teacher: '/teacher/dashboard',
    student: '/student/dashboard',
    staff: '/staff/dashboard',
    parent: '/parent/dashboard',
};

const roleLabels: Record<string, string> = {
    admin: 'Admin',
    headmaster: 'Headmaster',
    teacher: 'Teacher',
    student: 'Student',
    staff: 'Staff',
    parent: 'Parent/Guardian',
};

export default function UserMenu() {
    const page = usePage();
    const props = page.props as Record<string, unknown>;
    const auth = props.auth as { user?: AuthUser | null } | undefined;
    const user = auth?.user ?? null;
    const { t } = useI18n();

    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function onDocumentClick(event: MouseEvent) {
            if (!open || !rootRef.current) return;
            if (!rootRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('click', onDocumentClick);
        return () => document.removeEventListener('click', onDocumentClick);
    }, [open]);

    const initial = user?.name?.charAt(0).toUpperCase() ?? '?';
    const dashboardUrl = user ? (dashboardByRole[user.role] ?? '/') : null;
    const roleLabel = user ? (roleLabels[user.role] ?? user.role) : 'Guest';

    function logout() {
        setOpen(false);
        router.post('/logout');
    }

    return (
        <div ref={rootRef} className="relative">
            <button
                type="button"
                className="flex items-center gap-2 rounded-md p-1 pr-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                aria-expanded={open}
                aria-haspopup="true"
                onClick={() => setOpen(!open)}
            >
                <span
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-600 text-sm font-semibold text-white"
                    aria-hidden="true"
                >
                    {initial}
                </span>
                <span className="hidden text-left sm:block">
                    <span className="block text-sm leading-tight font-medium text-slate-900 dark:text-slate-100">
                        {user?.name ?? 'Guest'}
                    </span>
                    <span className="block text-xs leading-tight text-slate-500 dark:text-slate-400">
                        {roleLabel}
                    </span>
                </span>
                <AppIcon
                    name="chevron-down"
                    className="hidden h-4 w-4 text-slate-400 sm:block"
                />
            </button>

            {open && (
                <div className="absolute right-0 z-40 mt-2 w-60 origin-top-right overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
                    <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-700">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {user?.name ?? 'Guest'}
                        </p>
                        {user?.email && (
                            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                                {user.email}
                            </p>
                        )}
                        {user?.phone && (
                            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                                {user.phone}
                            </p>
                        )}
                        <span className="mt-2 inline-flex rounded-full bg-accent-100 px-2 py-0.5 text-[11px] font-semibold text-accent-700 dark:bg-accent-900 dark:text-accent-200">
                            {roleLabel}
                        </span>
                    </div>
                    <div className="py-1">
                        {dashboardUrl && (
                            <Link
                                href={dashboardUrl}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                                onClick={() => setOpen(false)}
                            >
                                <AppIcon name="grid" className="h-4 w-4 text-slate-400" />
                                {t('nav.dashboard')}
                            </Link>
                        )}
                        <Link
                            href="/profile"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                            onClick={() => setOpen(false)}
                        >
                            <AppIcon name="user" className="h-4 w-4 text-slate-400" />
                            {t('nav.my_profile')}
                        </Link>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-200 px-4 py-2 dark:border-slate-700">
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                            {t('profile.theme')}
                        </span>
                        <ThemeToggle />
                    </div>
                    <div className="border-t border-slate-200 py-1 dark:border-slate-700">
                        <button
                            type="button"
                            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
                            onClick={logout}
                        >
                            <AppIcon name="logout" className="h-4 w-4" />
                            {t('profile.sign_out')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
