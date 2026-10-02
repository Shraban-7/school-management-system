import React, { useEffect, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import AppIcon from '@/components/AppIcon';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import NotificationBell from '@/components/NotificationBell';
import SearchBar from '@/components/SearchBar';
import SidebarGroup from '@/components/SidebarGroup';
import ThemeToggle from '@/components/ThemeToggle';
import UserMenu from '@/components/UserMenu';
import { useI18n } from '@/composables/useI18n';
import { useStacks } from '@/lib/stacks';
import type { SidebarConfig } from '@/types/sidebar';

interface DashboardLayoutProps {
    brand?: string;
    brandLogo?: string;
    notificationCount?: number;
    children?: React.ReactNode;
}

interface SchoolBrand {
    name_en?: string | null;
    name_bn?: string | null;
    logo_url?: string | null;
}

const COLLAPSE_KEY = 'sidebar-collapsed';

const defaultSidebar: SidebarConfig = [
    {
        items: [
            { label: 'Overview', href: '/', icon: 'home' },
            { label: 'Profile', href: '#', icon: 'user' },
            { label: 'Settings', href: '#', icon: 'cog' },
        ],
    },
];

export default function DashboardLayout({
    brand = 'SMS App',
    brandLogo = '',
    notificationCount = 0,
    children,
}: DashboardLayoutProps) {
    const page = usePage();
    const props = page.props as Record<string, unknown>;
    const stacks = useStacks();
    const { t, bi } = useI18n();

    const [, setTick] = useState(0);
    useEffect(() => {
        return stacks.subscribe(() => setTick((v) => v + 1));
    }, [stacks]);

    const school = (props.school as SchoolBrand) ?? {};
    const brandName = bi(school.name_en, school.name_bn) || brand;
    const brandLogoUrl = school.logo_url || brandLogo;
    const brandInitial = brandName.trim().charAt(0).toUpperCase() || 'S';

    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setCollapsed(localStorage.getItem(COLLAPSE_KEY) === 'true');
        }
    }, []);

    function toggleCollapsed() {
        setCollapsed((prev) => {
            const next = !prev;
            if (typeof window !== 'undefined') {
                localStorage.setItem(COLLAPSE_KEY, String(next));
            }
            return next;
        });
    }

    const flashError = (props.flash as { error?: string | null })?.error ?? null;
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (flashError) {
            setErrorMessage(flashError);
            setShowErrorModal(true);
        }
    }, [flashError]);

    const sharedSidebar = props.sidebar as SidebarConfig | undefined;
    const stackSidebar = stacks.get<SidebarConfig>('dashboard.sidebar');
    const sidebar: SidebarConfig =
        Array.isArray(sharedSidebar) && sharedSidebar.length > 0
            ? sharedSidebar
            : stackSidebar.length > 0
              ? (stackSidebar as unknown as SidebarConfig)
              : defaultSidebar;

    const sidebarWidth = collapsed ? 'lg:w-16' : 'lg:w-64';
    const mainOffset = collapsed ? 'lg:pl-16' : 'lg:pl-64';

    return (
        <div className="flex min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
            {/* Desktop sidebar */}
            <aside
                className={`hidden bg-slate-900 text-slate-100 transition-[width] duration-200 ease-out lg:fixed lg:inset-y-0 lg:flex lg:flex-col ${sidebarWidth}`}
            >
                <div
                    className={`flex h-16 items-center border-b border-slate-800 ${
                        collapsed ? 'justify-center gap-2 px-2' : 'gap-3 px-3'
                    }`}
                >
                    <Link
                        href="/"
                        className="flex min-w-0 shrink items-center gap-3"
                        title={brandName}
                    >
                        {!brandLogoUrl ? (
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-accent-500 to-accent-700 text-sm font-bold text-white shadow-lg shadow-accent-900/30">
                                {brandInitial}
                            </span>
                        ) : (
                            <img
                                src={brandLogoUrl}
                                alt={brandName}
                                className="h-9 w-9 shrink-0 rounded-xl object-cover shadow-lg shadow-black/30"
                            />
                        )}
                        {!collapsed && (
                            <span className="truncate font-semibold tracking-tight text-white">
                                {brandName}
                            </span>
                        )}
                    </Link>
                </div>

                <SidebarGroup groups={sidebar} collapsed={collapsed} />
            </aside>

            {/* Mobile sidebar overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-50 lg:hidden"
                    role="dialog"
                    aria-modal="true"
                >
                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        onClick={() => setMobileOpen(false)}
                    />
                    <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-slate-900 text-slate-100 shadow-xl">
                        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-6">
                            <Link
                                href="/"
                                className="flex min-w-0 items-center gap-2.5 font-semibold tracking-tight text-white"
                                onClick={() => setMobileOpen(false)}
                            >
                                {brandLogoUrl && (
                                    <img
                                        src={brandLogoUrl}
                                        alt={brandName}
                                        className="h-8 w-8 shrink-0 rounded-lg object-cover"
                                    />
                                )}
                                <span className="truncate">{brandName}</span>
                            </Link>
                            <button
                                type="button"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-300 hover:bg-white/5 hover:text-white"
                                aria-label="Close menu"
                                onClick={() => setMobileOpen(false)}
                            >
                                <AppIcon name="close" className="h-5 w-5" />
                            </button>
                        </div>
                        <SidebarGroup groups={sidebar} />
                    </aside>
                </div>
            )}

            {/* Main column */}
            <div
                className={`flex flex-1 flex-col transition-[padding] duration-200 ease-out ${mainOffset}`}
            >
                {/* Topbar */}
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur sm:px-6 dark:border-slate-800 dark:bg-slate-900/80">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <button
                            type="button"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-600 transition hover:bg-slate-100 lg:hidden dark:text-slate-300 dark:hover:bg-slate-800"
                            aria-label="Open menu"
                            onClick={() => setMobileOpen(true)}
                        >
                            <AppIcon name="menu" className="h-5 w-5" />
                        </button>
                        <button
                            type="button"
                            className="hidden h-9 w-9 items-center justify-center rounded-md text-slate-600 transition hover:bg-slate-100 lg:inline-flex dark:text-slate-300 dark:hover:bg-slate-800"
                            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                            onClick={toggleCollapsed}
                        >
                            <AppIcon name="panel-left" className="h-5 w-5" />
                        </button>
                        <SearchBar placeholder="Search…" className="hidden sm:flex" />
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2">
                        <button
                            type="button"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 lg:hidden dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                            aria-label="Search"
                        >
                            <AppIcon name="search" className="h-5 w-5" />
                        </button>
                        <LanguageSwitcher variant="dashboard" />
                        <NotificationBell count={notificationCount} />
                        <ThemeToggle />
                        <span className="mx-1 hidden h-6 w-px bg-slate-200 sm:block dark:bg-slate-700" />
                        <UserMenu />
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                    {children}
                </main>
            </div>

            {/* Error modal */}
            {showErrorModal && (
                <div
                    className="fixed inset-0 z-60 flex items-center justify-center p-4"
                    role="alertdialog"
                    aria-modal="true"
                    aria-labelledby="error-modal-title"
                >
                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        onClick={() => setShowErrorModal(false)}
                    />
                    <div className="relative w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-start gap-4">
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
                                <AppIcon name="lock" className="h-5 w-5" />
                            </span>
                            <div className="min-w-0">
                                <h2
                                    id="error-modal-title"
                                    className="text-base font-semibold text-slate-900 dark:text-slate-50"
                                >
                                    {t('profile.not_authorized')}
                                </h2>
                                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                    {errorMessage}
                                </p>
                            </div>
                        </div>
                        <div className="mt-5 flex justify-end">
                            <button
                                type="button"
                                className="inline-flex items-center rounded-md bg-accent-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-700"
                                onClick={() => setShowErrorModal(false)}
                            >
                                {t('profile.ok')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
