import React, { useEffect, useState } from 'react';
import AppLogo from '@/components/AppLogo';
import { cn } from '@/lib/utils';

type Variant = 'light' | 'dark' | 'transparent';

interface NavbarProps {
    brand?: string;
    brandLogo?: string;
    brandHref?: string;
    variant?: Variant;
    sticky?: boolean;
    bordered?: boolean;
    nav?: (linkClass: string) => React.ReactNode;
    actions?: React.ReactNode;
    mobile?: (linkClass: string) => React.ReactNode;
    mobileActions?: React.ReactNode;
}

export default function Navbar({
    brand = '',
    brandLogo = '',
    brandHref = '/',
    variant = 'light',
    sticky = false,
    bordered = true,
    nav,
    actions,
    mobile,
    mobileActions,
}: NavbarProps) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        if (!sticky) return;
        const onScroll = () => {
            setScrolled(window.scrollY > 8);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener('scroll', onScroll);
    }, [sticky]);

    useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileOpen]);

    const navClasses = cn(
        'z-40 w-full transition-colors duration-200',
        variant === 'dark'
            ? 'bg-slate-900 text-slate-100'
            : variant === 'transparent'
              ? 'bg-transparent text-slate-900'
              : 'bg-white text-slate-900',
        sticky && 'sticky top-0',
        sticky && scrolled && 'shadow-sm',
        bordered &&
            (variant === 'dark'
                ? 'border-b border-slate-800'
                : 'border-b border-slate-200'),
    );

    const linkHover = cn(
        'inline-flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
        variant === 'dark'
            ? 'text-slate-300 hover:bg-white/5 hover:text-white'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
    );

    return (
        <nav className={navClasses} aria-label="Primary">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Brand */}
                    <div className="flex shrink-0 items-center gap-3">
                        <a
                            href={brandHref}
                            className="flex items-center gap-2.5 text-base font-semibold tracking-tight"
                        >
                            <AppLogo
                                src={brandLogo || null}
                                name={brand}
                                size="sm"
                            />
                            {brand && <span>{brand}</span>}
                        </a>
                    </div>

                    {/* Desktop nav */}
                    {nav ? (
                        <div className="ml-6 hidden flex-1 md:flex md:items-center md:gap-1">
                            {nav(linkHover)}
                        </div>
                    ) : (
                        <div className="hidden flex-1 md:block" />
                    )}

                    {/* Right actions */}
                    {actions && (
                        <div className="hidden md:flex md:items-center md:gap-2">
                            {actions}
                        </div>
                    )}

                    {/* Mobile toggle */}
                    <button
                        type="button"
                        className={cn(
                            'rounded-md p-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 md:hidden',
                            variant === 'dark'
                                ? 'text-slate-300 hover:bg-white/5 hover:text-white focus-visible:ring-white/40 focus-visible:ring-offset-slate-900'
                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-400 focus-visible:ring-offset-white',
                        )}
                        aria-expanded={mobileOpen}
                        aria-controls="mobile-menu"
                        aria-label="Toggle menu"
                        onClick={() => setMobileOpen(!mobileOpen)}
                    >
                        {!mobileOpen ? (
                            <svg
                                className="h-6 w-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            </svg>
                        ) : (
                            <svg
                                className="h-6 w-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div
                    id="mobile-menu"
                    className={cn(
                        'border-t md:hidden',
                        variant === 'dark'
                            ? 'border-slate-800 bg-slate-900'
                            : 'border-slate-200 bg-white',
                    )}
                >
                    {mobile && (
                        <div className="space-y-1 px-4 py-3">
                            {mobile(linkHover)}
                        </div>
                    )}
                    {mobileActions && (
                        <div
                            className={cn(
                                'flex flex-col gap-2 border-t px-4 py-3',
                                variant === 'dark'
                                    ? 'border-slate-800'
                                    : 'border-slate-200',
                            )}
                        >
                            {mobileActions}
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
}
