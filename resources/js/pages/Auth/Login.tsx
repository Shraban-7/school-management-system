import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useI18n } from '@/composables/useI18n';
import AppIcon from '@/components/AppIcon';
import AppLogo from '@/components/AppLogo';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ThemeToggle from '@/components/ThemeToggle';

interface PublicSchool {
    name_en?: string | null;
    name_bn?: string | null;
    eiin_number?: string | number | null;
    logo_url?: string | null;
    phone?: string | null;
    email?: string | null;
    office_hours?: string | null;
}

const demoAccounts = [
    {
        role: 'Administrator',
        phone: '+8801100000000',
        password: 'password',
        tone: 'text-rose-600 dark:text-rose-400',
    },
    {
        role: 'Teacher',
        phone: '+8801100000002',
        password: 'password',
        tone: 'text-emerald-600 dark:text-emerald-400',
    },
    {
        role: 'Student',
        phone: '+8801100000003',
        password: 'password',
        tone: 'text-sky-600 dark:text-sky-400',
    },
    {
        role: 'Parent / Guardian',
        phone: '+8801100000005',
        password: 'password',
        tone: 'text-amber-600 dark:text-amber-400',
    },
];

export default function Login() {
    const page = usePage();
    const props = page.props as Record<string, unknown>;
    const { t, bi } = useI18n();

    const school = (props.school as PublicSchool) ?? {};
    const schoolName =
        bi(school.name_en, school.name_bn) || 'School Management System';
    const crestInitial = schoolName.trim().charAt(0).toUpperCase() || 'S';

    const flash = {
        message: (props.flash as { message?: string | null })?.message ?? null,
        error: (props.flash as { error?: string | null })?.error ?? null,
    };

    const [showPassword, setShowPassword] = useState(false);
    const [showDemoAccounts, setShowDemoAccounts] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        phone: '',
        password: '',
        remember: false,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/login');
    }

    function fillDemo(phone: string, pass: string) {
        setData((prev) => ({
            ...prev,
            phone,
            password: pass,
        }));
    }

    return (
        <div className="flex min-h-screen flex-col justify-between bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100">
            <Head title={t('nav.login')} />

            {/* Top navigation bar */}
            <header className="flex items-center justify-between border-b border-slate-200/60 bg-white/70 px-6 py-4 backdrop-blur-md dark:border-slate-800/60 dark:bg-slate-900/70">
                <div className="flex items-center gap-3">
                    <AppLogo
                        src={school.logo_url}
                        name={schoolName}
                        size="md"
                    />
                    <div>
                        <span className="block text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
                            {schoolName}
                        </span>
                        {school.eiin_number && (
                            <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                                EIIN {school.eiin_number}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <LanguageSwitcher variant="dashboard" />
                    <ThemeToggle />
                </div>
            </header>

            {/* Main Login Card Area */}
            <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
                <div className="w-full max-w-md space-y-6">
                    {/* Branding Card Header */}
                    <div className="text-center">
                        <div className="mb-4 inline-flex items-center justify-center">
                            <AppLogo
                                src={school.logo_url}
                                name={schoolName}
                                size="xl"
                                className="rounded-2xl ring-4 ring-white shadow-xl shadow-accent-950/20 dark:ring-slate-900"
                            />
                        </div>

                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
                            {t('auth.portal_login')}
                        </h1>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                            {t('auth.sign_in_subtitle', { school: schoolName })}
                        </p>
                    </div>

                    {/* Card container */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/40">
                        {/* Flash messages */}
                        {flash.message && (
                            <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
                                {flash.message}
                            </div>
                        )}
                        {flash.error && (
                            <div className="mb-5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
                                {flash.error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label
                                    htmlFor="phone"
                                    className="block text-xs font-semibold tracking-wider text-slate-700 uppercase dark:text-slate-300"
                                >
                                    {t('auth.phone')}
                                </label>
                                <div className="relative mt-1.5">
                                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                        <AppIcon name="phone" className="h-4 w-4" />
                                    </span>
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        inputMode="tel"
                                        autoComplete="tel"
                                        required
                                        autoFocus
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        placeholder="+8801XXXXXXXXX"
                                        className={`block w-full rounded-lg border bg-white py-2.5 pr-3 pl-9 text-sm transition focus:ring-2 focus:outline-none dark:bg-slate-950 dark:text-slate-100 ${
                                            errors.phone
                                                ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200 dark:border-rose-700'
                                                : 'border-slate-200 focus:border-accent-500 focus:ring-accent-500/20 dark:border-slate-700'
                                        }`}
                                    />
                                </div>
                                {errors.phone && (
                                    <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                                        {errors.phone}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-xs font-semibold tracking-wider text-slate-700 uppercase dark:text-slate-300"
                                >
                                    {t('auth.password')}
                                </label>
                                <div className="relative mt-1.5">
                                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                        <AppIcon name="lock" className="h-4 w-4" />
                                    </span>
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="current-password"
                                        required
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="••••••••"
                                        className={`block w-full rounded-lg border bg-white py-2.5 pr-10 pl-9 text-sm transition focus:ring-2 focus:outline-none dark:bg-slate-950 dark:text-slate-100 ${
                                            errors.password
                                                ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200 dark:border-rose-700'
                                                : 'border-slate-200 focus:border-accent-500 focus:ring-accent-500/20 dark:border-slate-700'
                                        }`}
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        <AppIcon
                                            name={showPassword ? 'eye-off' : 'eye'}
                                            className="h-4 w-4"
                                        />
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center justify-between pt-1">
                                <label className="flex cursor-pointer items-center gap-2">
                                    <input
                                        id="remember"
                                        name="remember"
                                        type="checkbox"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className="h-4 w-4 rounded border-slate-300 text-accent-600 focus:ring-accent-500/30 dark:border-slate-700 dark:bg-slate-950"
                                    />
                                    <span className="text-xs text-slate-600 dark:text-slate-400">
                                        {t('auth.remember')}
                                    </span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-accent-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent-700 focus:ring-2 focus:ring-accent-500/40 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {processing && (
                                    <AppIcon name="clock" className="h-4 w-4 animate-spin" />
                                )}
                                <span>{processing ? t('auth.signing_in') : t('auth.sign_in')}</span>
                            </button>
                        </form>

                        {/* Demo helper */}
                        <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
                            <button
                                type="button"
                                onClick={() => setShowDemoAccounts(!showDemoAccounts)}
                                className="flex w-full items-center justify-between text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                            >
                                <span>Quick Demo Accounts (Click to fill)</span>
                                <AppIcon
                                    name={showDemoAccounts ? 'chevron-up' : 'chevron-down'}
                                    className="h-3.5 w-3.5"
                                />
                            </button>

                            {showDemoAccounts && (
                                <div className="mt-3 space-y-1.5">
                                    {demoAccounts.map((demo) => (
                                        <button
                                            key={demo.phone}
                                            type="button"
                                            onClick={() => fillDemo(demo.phone, demo.password)}
                                            className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs transition hover:bg-slate-100 dark:hover:bg-slate-800"
                                        >
                                            <span className={`font-medium ${demo.tone}`}>
                                                {demo.role}
                                            </span>
                                            <span className="font-mono text-slate-500 dark:text-slate-400">
                                                {demo.phone}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer help note */}
                    {(school.phone || school.email) && (
                        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                            {t('auth.trouble')}{' '}
                            {school.phone && (
                                <>
                                    {t('auth.at')}{' '}
                                    <span className="font-semibold">{school.phone}</span>
                                </>
                            )}
                            {school.email && (
                                <>
                                    {t('auth.or')}{' '}
                                    <span className="font-semibold">{school.email}</span>
                                </>
                            )}
                            .
                        </p>
                    )}
                </div>
            </main>

            <footer className="border-t border-slate-200/40 py-4 text-center text-xs text-slate-400 dark:border-slate-800/40">
                &copy; {new Date().getFullYear()} {schoolName}. Total School Management System.
            </footer>
        </div>
    );
}
