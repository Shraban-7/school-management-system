import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import AppIcon from '@/components/AppIcon';
import { useI18n } from '@/composables/useI18n';

interface Profile {
    name: string;
    email: string | null;
    phone: string;
    role: string;
    role_title: string;
    created_at: string | null;
}

interface ProfileEditProps {
    profile: Profile;
}

export default function ProfileEdit({ profile }: ProfileEditProps) {
    const page = usePage();
    const props = page.props as Record<string, unknown>;
    const flash = (props.flash as { message?: string | null })?.message ?? null;
    const { t } = useI18n();

    const [infoForm, setInfoForm] = useState({
        name: profile.name,
        email: profile.email ?? '',
        phone: profile.phone,
    });
    const [infoErrors, setInfoErrors] = useState<Record<string, string>>({});
    const [infoSaving, setInfoSaving] = useState(false);

    function submitInfo(e: React.FormEvent) {
        e.preventDefault();
        setInfoSaving(true);
        router.put(
            '/profile',
            {
                name: infoForm.name,
                email: infoForm.email || null,
                phone: infoForm.phone,
            },
            {
                preserveScroll: true,
                onError: (err) => {
                    setInfoErrors(err);
                },
                onSuccess: () => {
                    setInfoErrors({});
                },
                onFinish: () => {
                    setInfoSaving(false);
                },
            },
        );
    }

    const [passwordForm, setPasswordForm] = useState({
        current_password: '',
        password: '',
        password_confirmation: '',
    });
    const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
    const [passwordSaving, setPasswordSaving] = useState(false);

    function submitPassword(e: React.FormEvent) {
        e.preventDefault();
        setPasswordSaving(true);
        router.put('/profile/password', passwordForm, {
            preserveScroll: true,
            onError: (err) => {
                setPasswordErrors(err);
            },
            onSuccess: () => {
                setPasswordErrors({});
                setPasswordForm({
                    current_password: '',
                    password: '',
                    password_confirmation: '',
                });
            },
            onFinish: () => {
                setPasswordSaving(false);
            },
        });
    }

    const initial = profile.name.trim().charAt(0).toUpperCase() || '?';

    const inputClass =
        'mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100';
    const labelClass =
        'block text-sm font-medium text-slate-700 dark:text-slate-300';
    const errorClass = 'mt-1 text-xs text-rose-500';
    const sectionClass =
        'rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900';

    return (
        <DashboardLayout>
            <Head title={t('profile.title')} />

            <div className="mx-auto max-w-3xl space-y-6">
                <header className="flex items-center gap-4">
                    <span
                        className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-600 text-xl font-bold text-white"
                        aria-hidden="true"
                    >
                        {initial}
                    </span>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
                            {profile.name}
                        </h1>
                        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                            {profile.role_title}
                            {profile.created_at && (
                                <>
                                    {' '}·{' '}
                                    {t('profile.member_since', {
                                        date: profile.created_at,
                                    })}
                                </>
                            )}
                        </p>
                    </div>
                </header>

                {flash && (
                    <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
                        {flash}
                    </div>
                )}

                {/* Profile information */}
                <form className={sectionClass} onSubmit={submitInfo}>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {t('profile.info_title')}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {t('profile.info_help')}
                    </p>

                    <div className="mt-6 grid gap-6 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label htmlFor="name" className={labelClass}>
                                {t('profile.name')}{' '}
                                <span className="text-rose-500">*</span>
                            </label>
                            <input
                                id="name"
                                value={infoForm.name}
                                onChange={(e) =>
                                    setInfoForm((prev) => ({ ...prev, name: e.target.value }))
                                }
                                type="text"
                                className={`${inputClass} ${
                                    infoErrors.name ? 'border-rose-500' : ''
                                }`}
                            />
                            {infoErrors.name && (
                                <p className={errorClass}>{infoErrors.name}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="phone" className={labelClass}>
                                {t('profile.phone')}{' '}
                                <span className="text-rose-500">*</span>
                            </label>
                            <input
                                id="phone"
                                value={infoForm.phone}
                                onChange={(e) =>
                                    setInfoForm((prev) => ({ ...prev, phone: e.target.value }))
                                }
                                type="tel"
                                className={`${inputClass} ${
                                    infoErrors.phone ? 'border-rose-500' : ''
                                }`}
                            />
                            {infoErrors.phone && (
                                <p className={errorClass}>{infoErrors.phone}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="email" className={labelClass}>
                                {t('profile.email')}
                            </label>
                            <input
                                id="email"
                                value={infoForm.email}
                                onChange={(e) =>
                                    setInfoForm((prev) => ({ ...prev, email: e.target.value }))
                                }
                                type="email"
                                className={`${inputClass} ${
                                    infoErrors.email ? 'border-rose-500' : ''
                                }`}
                            />
                            {infoErrors.email && (
                                <p className={errorClass}>{infoErrors.email}</p>
                            )}
                        </div>
                    </div>

                    <div className="mt-6">
                        <button
                            type="submit"
                            disabled={infoSaving}
                            className="inline-flex items-center gap-1.5 rounded-md bg-accent-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-700 disabled:opacity-60"
                        >
                            <AppIcon name="check" className="h-4 w-4" />
                            {infoSaving ? t('profile.saving') : t('profile.save')}
                        </button>
                    </div>
                </form>

                {/* Change password */}
                <form className={sectionClass} onSubmit={submitPassword}>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {t('profile.password_title')}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {t('profile.password_help')}
                    </p>

                    <div className="mt-6 grid gap-6 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label htmlFor="current_password" className={labelClass}>
                                {t('profile.current_password')}{' '}
                                <span className="text-rose-500">*</span>
                            </label>
                            <input
                                id="current_password"
                                value={passwordForm.current_password}
                                onChange={(e) =>
                                    setPasswordForm((prev) => ({
                                        ...prev,
                                        current_password: e.target.value,
                                    }))
                                }
                                type="password"
                                autoComplete="current-password"
                                className={`${inputClass} ${
                                    passwordErrors.current_password ? 'border-rose-500' : ''
                                }`}
                            />
                            {passwordErrors.current_password && (
                                <p className={errorClass}>
                                    {passwordErrors.current_password}
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password" className={labelClass}>
                                {t('profile.new_password')}{' '}
                                <span className="text-rose-500">*</span>
                            </label>
                            <input
                                id="password"
                                value={passwordForm.password}
                                onChange={(e) =>
                                    setPasswordForm((prev) => ({
                                        ...prev,
                                        password: e.target.value,
                                    }))
                                }
                                type="password"
                                autoComplete="new-password"
                                className={`${inputClass} ${
                                    passwordErrors.password ? 'border-rose-500' : ''
                                }`}
                            />
                            {passwordErrors.password && (
                                <p className={errorClass}>{passwordErrors.password}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password_confirmation" className={labelClass}>
                                {t('profile.confirm_password')}{' '}
                                <span className="text-rose-500">*</span>
                            </label>
                            <input
                                id="password_confirmation"
                                value={passwordForm.password_confirmation}
                                onChange={(e) =>
                                    setPasswordForm((prev) => ({
                                        ...prev,
                                        password_confirmation: e.target.value,
                                    }))
                                }
                                type="password"
                                autoComplete="new-password"
                                className={inputClass}
                            />
                        </div>
                    </div>

                    <div className="mt-6">
                        <button
                            type="submit"
                            disabled={passwordSaving}
                            className="inline-flex items-center gap-1.5 rounded-md bg-accent-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-700 disabled:opacity-60"
                        >
                            <AppIcon name="key" className="h-4 w-4" />
                            {passwordSaving
                                ? t('profile.updating')
                                : t('profile.update_password')}
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
