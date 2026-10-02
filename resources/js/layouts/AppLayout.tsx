import React, { useEffect, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import Navbar from '@/components/Navbar';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useI18n } from '@/composables/useI18n';
import { useStacks } from '@/lib/stacks';
import type { NavLink, NavAction } from '@/types/nav';
import type { AuthUser } from '@/types/auth';

interface AppLayoutProps {
    brand?: string;
    brandLogo?: string;
    sticky?: boolean;
    bordered?: boolean;
    children?: React.ReactNode;
}

const dashboardByRole: Record<string, string> = {
    admin: '/admin/dashboard',
    headmaster: '/headmaster/dashboard',
    teacher: '/teacher/dashboard',
    student: '/student/dashboard',
    staff: '/staff/dashboard',
};

export default function AppLayout({
    brand = 'SMS App',
    brandLogo = '',
    sticky = false,
    bordered = true,
    children,
}: AppLayoutProps) {
    const page = usePage();
    const props = page.props as Record<string, unknown>;
    const auth = props.auth as { user?: AuthUser | null } | undefined;
    const user = auth?.user ?? null;
    const { t, bi } = useI18n();
    const stacks = useStacks();
    const [, setTick] = useState(0);

    useEffect(() => {
        return stacks.subscribe(() => setTick((t) => t + 1));
    }, [stacks]);

    const defaultLinks: NavLink[] = [
        { label: t('nav.home', {}, 'Home'), href: '/', match: 'home' },
        { label: t('nav.about', {}, 'About'), href: '/about', match: 'about' },
        { label: t('nav.contact', {}, 'Contact'), href: '/contact', match: 'contact' },
    ];

    const currentUrl = page.url;
    const dashboardUrl = user ? (dashboardByRole[user.role] ?? '/') : null;

    const defaultActions: NavAction[] = user
        ? [
              ...(dashboardUrl
                  ? [
                        {
                            label: t('nav.dashboard', {}, 'Dashboard'),
                            href: dashboardUrl,
                            variant: 'primary' as const,
                        },
                    ]
                  : []),
              {
                  label: t('nav.logout', {}, 'Logout'),
                  variant: 'secondary' as const,
                  onClick: () => router.post('/logout'),
              },
          ]
        : [{ label: t('auth.sign_in', {}, 'Sign in'), href: '/login', variant: 'primary' as const }];

    const navItems = stacks.get<NavLink>('app.nav');
    const links = navItems.length > 0 ? navItems : defaultLinks;

    const actionItems = stacks.get<NavAction>('app.actions');
    const actions = actionItems.length > 0 ? actionItems : defaultActions;

    const mobileItems = stacks.get<NavLink>('app.mobile');
    const mLinks = mobileItems.length > 0 ? mobileItems : defaultLinks;

    const mobileActionItems = stacks.get<NavAction>('app.mobile-actions');
    const mActions = mobileActionItems.length > 0 ? mobileActionItems : defaultActions;

    const isActive = (link: NavLink): boolean => {
        if (link.active !== undefined) return link.active;
        const match = link.match ?? link.href.replace(/^\//, '');
        if (match === '' || match === '/') return currentUrl === '/';
        return currentUrl === `/${match}` || currentUrl.startsWith(`/${match}/`);
    };

    const linkClass = (active: boolean): string =>
        active
            ? 'inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-slate-900 bg-slate-100'
            : 'inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-slate-600 hover:text-slate-900 hover:bg-slate-100';

    const mobileLinkClass = (active: boolean): string =>
        active
            ? 'block px-3 py-2 text-base font-medium rounded-md transition-colors text-slate-900 bg-slate-100'
            : 'block px-3 py-2 text-base font-medium rounded-md transition-colors text-slate-600 hover:text-slate-900 hover:bg-slate-100';

    const actionClass = (action: NavAction): string =>
        action.variant === 'primary'
            ? 'inline-flex items-center rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800'
            : 'inline-flex items-center rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100';

    const mobileActionClass = (action: NavAction): string =>
        action.variant === 'primary'
            ? 'block rounded-md bg-slate-900 px-3 py-2 text-center text-sm font-semibold text-white'
            : 'block w-full rounded-md border border-slate-300 px-3 py-2 text-center text-sm font-semibold text-slate-700';

    return (
        <main className="min-h-screen bg-white text-slate-900">
            <Navbar
                brand={brand}
                brandLogo={brandLogo}
                variant="light"
                sticky={sticky}
                bordered={bordered}
                brandHref="/"
                nav={() => (
                    <>
                        {links.map((link, i) => (
                            <Link
                                key={`nav-${i}-${link.href}`}
                                href={link.href}
                                className={linkClass(isActive(link))}
                                aria-current={isActive(link) ? 'page' : undefined}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </>
                )}
                actions={
                    <div className="flex items-center gap-3">
                        <LanguageSwitcher variant="public" />
                        {actions.map((act, i) =>
                            act.href ? (
                                <Link
                                    key={`action-${i}-${act.label}`}
                                    href={act.href}
                                    className={actionClass(act)}
                                >
                                    {act.label}
                                </Link>
                            ) : (
                                <button
                                    key={`action-${i}-${act.label}`}
                                    type="button"
                                    className={actionClass(act)}
                                    onClick={() => act.onClick?.()}
                                >
                                    {act.label}
                                </button>
                            ),
                        )}
                    </div>
                }
                mobile={() => (
                    <>
                        {mLinks.map((link, i) => (
                            <Link
                                key={`mobile-${i}-${link.href}`}
                                href={link.href}
                                className={mobileLinkClass(isActive(link))}
                                aria-current={isActive(link) ? 'page' : undefined}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </>
                )}
                mobileActions={
                    <div className="space-y-2">
                        <div className="flex justify-center pb-2">
                            <LanguageSwitcher variant="public" />
                        </div>
                        {mActions.map((act, i) =>
                            act.href ? (
                                <Link
                                    key={`maction-${i}-${act.label}`}
                                    href={act.href}
                                    className={mobileActionClass(act)}
                                >
                                    {act.label}
                                </Link>
                            ) : (
                                <button
                                    key={`maction-${i}-${act.label}`}
                                    type="button"
                                    className={mobileActionClass(act)}
                                    onClick={() => act.onClick?.()}
                                >
                                    {act.label}
                                </button>
                            ),
                        )}
                    </div>
                }
            />

            <article className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {children}
            </article>

            <footer className="border-t border-slate-200 bg-white">
                <div className="mx-auto max-w-7xl px-4 py-6 text-sm text-slate-500 sm:px-6 lg:px-8">
                    &copy; {new Date().getFullYear()} {brand}. {t('site.rights', {}, 'All rights reserved.')}
                </div>
            </footer>
        </main>
    );
}
