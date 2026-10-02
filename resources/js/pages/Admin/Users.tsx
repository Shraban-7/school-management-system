import React, { useMemo, useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import AppIcon from '@/components/AppIcon';
import { useSidebarStack } from '@/composables/useNavStack';
import { useI18n } from '@/composables/useI18n';
import type { SidebarConfig } from '@/types/sidebar';

interface UserRow {
    id: number;
    name: string;
    email: string;
    phone: string;
    role: string;
    is_active: boolean;
    created_at: string | null;
}

interface AdminUsersProps {
    users: UserRow[];
    sidebar: SidebarConfig;
}

export default function AdminUsers({ users, sidebar }: AdminUsersProps) {
    const { t, formatNumber } = useI18n();
    const sidebarStack = useSidebarStack();
    useEffect(() => {
        if (sidebar) {
            sidebarStack.set(sidebar);
        }
    }, [sidebar]);

    const page = usePage();
    const props = page.props as Record<string, unknown>;
    const flash = (props.flash as { message?: string | null })?.message ?? null;

    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');

    const roles = useMemo(
        () => Array.from(new Set(users.map((u) => u.role))),
        [users],
    );

    const filtered = useMemo(() => {
        return users.filter((user) => {
            const matchSearch =
                !search ||
                user.name.toLowerCase().includes(search.toLowerCase()) ||
                user.email.toLowerCase().includes(search.toLowerCase());
            const matchRole = !roleFilter || user.role === roleFilter;
            return matchSearch && matchRole;
        });
    }, [users, search, roleFilter]);

    function roleBadgeClass(role: string): string {
        return role === 'admin'
            ? 'bg-accent-50 text-accent-700 dark:bg-accent-950/40 dark:text-accent-300'
            : role === 'headmaster'
              ? 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300'
              : role === 'teacher'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                : role === 'student'
                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }

    return (
        <DashboardLayout>
            <Head title={t('users.title', {}, 'Users')} />

            <div className="space-y-6">
                <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase dark:text-slate-400">
                            {t('common.management', {}, 'Management')}
                        </p>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
                            {t('users.title', {}, 'Users')}
                        </h1>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            {t('users.subtitle', {}, 'Manage every account, role assignment, and access state.')}
                        </p>
                    </div>
                    <button
                        type="button"
                        className="inline-flex items-center gap-1.5 self-start rounded-md bg-accent-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-700 sm:self-auto"
                    >
                        <AppIcon name="plus" className="h-4 w-4" />
                        {t('users.invite_user', {}, 'Invite user')}
                    </button>
                </header>

                {flash && (
                    <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
                        {flash}
                    </div>
                )}

                <section className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
                        <div className="flex flex-1 items-center gap-2">
                            <label className="relative flex flex-1 items-center sm:max-w-xs">
                                <AppIcon
                                    name="search"
                                    className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400"
                                />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    type="search"
                                    placeholder={t('users.search_placeholder', {}, 'Search by name or email…')}
                                    className="h-9 w-full rounded-md border border-slate-200 bg-white pr-3 pl-9 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500"
                                />
                            </label>
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                            >
                                <option value="">{t('users.all_roles', {}, 'All roles')}</option>
                                {roles.map((role) => (
                                    <option key={role} value={role}>
                                        {t(`roles.${role}`, {}, role)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <span>
                                {formatNumber(filtered.length)} / {formatNumber(users.length)} {t('users.title', {}, 'users')}
                            </span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
                            <thead className="bg-slate-50 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase dark:bg-slate-950/40 dark:text-slate-400">
                                <tr>
                                    <th className="px-4 py-3">{t('users.user_name', {}, 'Name')}</th>
                                    <th className="px-4 py-3">{t('users.role', {}, 'Role')}</th>
                                    <th className="px-4 py-3">{t('users.phone', {}, 'Phone')}</th>
                                    <th className="px-4 py-3">{t('common.status', {}, 'Status')}</th>
                                    <th className="px-4 py-3">{t('users.joined', {}, 'Joined')}</th>
                                    <th className="px-4 py-3 text-right">{t('common.actions', {}, 'Actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filtered.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="text-slate-700 hover:bg-slate-50/60 dark:text-slate-200 dark:hover:bg-slate-800/40"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-600 text-xs font-semibold text-white">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </span>
                                                <div className="min-w-0">
                                                    <p className="truncate font-medium text-slate-900 dark:text-slate-100">
                                                        {user.name}
                                                    </p>
                                                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${roleBadgeClass(
                                                    user.role,
                                                )}`}
                                            >
                                                {t(`roles.${user.role}`, {}, user.role)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-300">
                                            {user.phone}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                                                    user.is_active
                                                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                                                }`}
                                            >
                                                <span
                                                    className={`h-1.5 w-1.5 rounded-full ${
                                                        user.is_active
                                                            ? 'bg-emerald-500'
                                                            : 'bg-slate-400'
                                                    }`}
                                                />
                                                {user.is_active ? t('common.active', {}, 'Active') : t('common.inactive', {}, 'Disabled')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                                            {user.created_at ?? '—'}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="inline-flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                                                    aria-label={t('common.edit', {}, 'Edit')}
                                                >
                                                    <AppIcon
                                                        name="pencil"
                                                        className="h-4 w-4"
                                                    />
                                                </button>
                                                <button
                                                    type="button"
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
                                                    aria-label={t('common.delete', {}, 'Delete')}
                                                >
                                                    <AppIcon
                                                        name="trash"
                                                        className="h-4 w-4"
                                                    />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-4 py-12 text-center text-sm text-slate-500 dark:text-slate-400"
                                        >
                                            {t('users.no_users', {}, 'No users match your filters.')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </DashboardLayout>
    );
}
