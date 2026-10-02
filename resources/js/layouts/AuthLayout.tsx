import React from 'react';
import { Link, usePage } from '@inertiajs/react';

interface AuthLayoutProps {
    brand?: string;
    brandLogo?: string;
    title?: string;
    subtitle?: string;
    header?: React.ReactNode;
    children?: React.ReactNode;
}

export default function AuthLayout({
    brand = 'SMS App',
    brandLogo = '',
    title = '',
    subtitle = '',
    header,
    children,
}: AuthLayoutProps) {
    const page = usePage();
    const props = page.props as Record<string, unknown>;
    const flash = (props.flash as { message?: string | null })?.message ?? null;

    return (
        <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
            <header className="px-6 pt-8 sm:px-10 sm:pt-12">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 font-semibold tracking-tight"
                >
                    {brandLogo && (
                        <img
                            src={brandLogo}
                            alt={brand}
                            className="h-8 w-8 rounded-lg object-cover"
                        />
                    )}
                    <span>{brand}</span>
                </Link>
            </header>

            <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
                <div className="w-full max-w-md space-y-6">
                    {(header || title || subtitle) && (
                        <div className="text-center">
                            {header ? (
                                header
                            ) : (
                                <>
                                    {title && (
                                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                                            {title}
                                        </h1>
                                    )}
                                    {subtitle && (
                                        <p className="mt-2 text-sm text-slate-600">
                                            {subtitle}
                                        </p>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {flash && (
                        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                            {flash}
                        </div>
                    )}

                    {children}
                </div>
            </div>

            <footer className="px-6 pb-6 text-center text-xs text-slate-500 sm:px-10 sm:pb-8">
                &copy; {new Date().getFullYear()} {brand}. All rights reserved.
            </footer>
        </div>
    );
}
