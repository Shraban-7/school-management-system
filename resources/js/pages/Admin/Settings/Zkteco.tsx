import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import AppIcon from '@/components/AppIcon';
import { useSidebarStack } from '@/composables/useNavStack';
import { useI18n } from '@/composables/useI18n';
import type { SidebarConfig } from '@/types/sidebar';

interface ZktecoConfig {
    id: number | null;
    name: string;
    ip_address: string;
    port: number;
    comm_key: number;
    is_enabled: boolean;
    protocol: 'udp' | 'tcp';
    mapping_field: 'roll_number' | 'id' | 'biometric_id';
    late_threshold: string;
    last_sync_at: string | null;
    last_sync_status: string | null;
    last_sync_message: string | null;
}

interface TestResult {
    success: boolean;
    message: string;
    latency_ms?: number | null;
}

interface Props {
    zkteco: ZktecoConfig;
    classes: { id: number; label: string }[];
    zkteco_test_result?: TestResult | null;
    sidebar: SidebarConfig;
}

export default function ZktecoSettingsPage({
    zkteco,
    classes,
    zkteco_test_result,
    sidebar,
}: Props) {
    const { t, formatNumber } = useI18n();
    const sidebarStack = useSidebarStack();
    useEffect(() => {
        if (sidebar) {
            sidebarStack.set(sidebar);
        }
    }, [sidebar]);

    const { flash } = usePage<{ flash?: { message?: string; error?: string } }>().props;

    const [form, setForm] = useState({
        name: zkteco.name,
        ip_address: zkteco.ip_address,
        port: zkteco.port,
        comm_key: zkteco.comm_key,
        is_enabled: zkteco.is_enabled,
        protocol: zkteco.protocol,
        mapping_field: zkteco.mapping_field,
        late_threshold: zkteco.late_threshold,
    });

    const [isSaving, setIsSaving] = useState(false);

    // Diagnostics & Sync states
    const [testResult, setTestResult] = useState<TestResult | null>(
        zkteco_test_result ?? null,
    );
    const [isTesting, setIsTesting] = useState(false);

    const [syncDate, setSyncDate] = useState(() => {
        const now = new Date();
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    });
    const [syncClass, setSyncClass] = useState<string>('');
    const [isSyncing, setIsSyncing] = useState(false);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isImporting, setIsImporting] = useState(false);

    const [copiedWebhook, setCopiedWebhook] = useState(false);

    const webhookUrl =
        typeof window !== 'undefined'
            ? `${window.location.origin}/iclock/cdata`
            : '/iclock/cdata';

    function handleSaveSettings(e: React.FormEvent) {
        e.preventDefault();
        setIsSaving(true);
        router.post('/admin/attendance/zkteco/settings', form, {
            preserveScroll: true,
            onFinish: () => setIsSaving(false),
        });
    }

    function handleTestConnection() {
        setIsTesting(true);
        setTestResult(null);

        const xsrfCookie = document.cookie
            .split('; ')
            .find((row) => row.startsWith('XSRF-TOKEN='));
        const token = xsrfCookie ? decodeURIComponent(xsrfCookie.split('=')[1]) : '';

        fetch('/admin/attendance/zkteco/test', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'X-XSRF-TOKEN': token,
            },
            body: JSON.stringify({
                ip_address: form.ip_address,
                port: form.port,
                protocol: form.protocol,
            }),
        })
            .then((res) => res.json())
            .then((data: TestResult) => {
                setTestResult(data);
            })
            .catch((err) => {
                setTestResult({
                    success: false,
                    message: 'Network error contacting terminal: ' + err.message,
                });
            })
            .finally(() => {
                setIsTesting(false);
            });
    }

    function handleDirectSync() {
        setIsSyncing(true);
        router.post(
            '/admin/attendance/zkteco/sync',
            {
                date: syncDate,
                class_id: syncClass || undefined,
            },
            {
                preserveScroll: true,
                onFinish: () => setIsSyncing(false),
            },
        );
    }

    function handleImportFile(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedFile) return;

        setIsImporting(true);
        const data = new FormData();
        data.append('log_file', selectedFile);
        data.append('date', syncDate);
        if (syncClass) {
            data.append('class_id', syncClass);
        }

        router.post('/admin/attendance/zkteco/import', data, {
            preserveScroll: true,
            onFinish: () => {
                setIsImporting(false);
                setSelectedFile(null);
            },
        });
    }

    function copyWebhookUrl() {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(webhookUrl).then(() => {
                setCopiedWebhook(true);
                setTimeout(() => setCopiedWebhook(false), 2000);
            });
        }
    }

    return (
        <DashboardLayout>
            <Head title={`${t('settings.zkteco_breadcrumb')} - ${t('settings.title')}`} />

            <div className="space-y-6">
                {/* Header */}
                <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                            <Link href="/admin/settings" className="hover:underline">
                                {t('sidebar.settings')}
                            </Link>
                            <span>/</span>
                            <span className="text-accent-600 dark:text-accent-400">{t('settings.zkteco_breadcrumb')}</span>
                        </div>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
                            {t('settings.zkteco_title')}
                        </h1>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            {t('settings.zkteco_subtitle')}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href="/admin/attendance"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                            <AppIcon name="calendar" className="h-4 w-4 text-slate-500" />
                            <span>{t('settings.go_to_attendance')}</span>
                        </Link>
                    </div>
                </header>

                {/* Notifications & Flash */}
                {flash?.message && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
                        {flash.message}
                    </div>
                )}
                {flash?.error && (
                    <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
                        {flash.error}
                    </div>
                )}

                {/* Stat Metric Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500 uppercase dark:text-slate-400">
                                {t('settings.terminal_status')}
                            </span>
                            <span
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                                    form.is_enabled
                                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                }`}
                            >
                                {form.is_enabled ? t('settings.active_enabled') : t('settings.optional_off')}
                            </span>
                        </div>
                        <p className="mt-2 text-lg font-bold text-slate-900 dark:text-slate-100 truncate">
                            {form.name}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                            {form.is_enabled ? t('settings.auto_sync_ready') : t('settings.manual_only')}
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <span className="text-xs font-semibold text-slate-500 uppercase dark:text-slate-400">
                            {t('settings.network_address')}
                        </span>
                        <p className="mt-2 font-mono text-lg font-bold text-slate-900 dark:text-slate-100">
                            {form.ip_address}:{form.port}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                            {t('settings.protocol')}: {form.protocol.toUpperCase()} • {t('settings.comm_key')}: {formatNumber(form.comm_key)}
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <span className="text-xs font-semibold text-slate-500 uppercase dark:text-slate-400">
                            {t('settings.student_matching')}
                        </span>
                        <p className="mt-2 text-lg font-bold text-slate-900 dark:text-slate-100 capitalize">
                            {form.mapping_field === 'roll_number'
                                ? t('settings.roll_number')
                                : form.mapping_field === 'id'
                                  ? t('settings.student_id')
                                  : t('settings.biometric_id')}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                            {t('settings.matching_desc')}
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <span className="text-xs font-semibold text-slate-500 uppercase dark:text-slate-400">
                            {t('settings.late_cutoff')}
                        </span>
                        <p className="mt-2 font-mono text-lg font-bold text-slate-900 dark:text-slate-100">
                            {form.late_threshold} AM
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                            {t('settings.late_cutoff_desc')}
                        </p>
                    </div>
                </div>

                {/* Main 2-Column Content */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
                    {/* Left Column: Device Configuration Form */}
                    <div className="lg:col-span-7">
                        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <div className="flex items-center gap-2.5 border-b border-slate-200 pb-4 dark:border-slate-800">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-100 text-accent-700 dark:bg-accent-950 dark:text-accent-300">
                                    <AppIcon name="settings" className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                                        {t('settings.terminal_config')}
                                    </h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {t('settings.terminal_config_desc')}
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleSaveSettings} className="mt-6 space-y-5">
                                {/* Master Integration Switch */}
                                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/40">
                                    <div>
                                        <label
                                            htmlFor="page-zkteco-toggle"
                                            className="text-sm font-bold text-slate-900 dark:text-slate-100 cursor-pointer"
                                        >
                                            {t('settings.enable_zkteco')}
                                        </label>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {t('settings.enable_zkteco_desc')}
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            id="page-zkteco-toggle"
                                            type="checkbox"
                                            checked={form.is_enabled}
                                            onChange={(e) => setForm({ ...form, is_enabled: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:bg-slate-700 peer-checked:bg-accent-600"></div>
                                    </label>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            {t('settings.terminal_name')}
                                        </label>
                                        <input
                                            type="text"
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            placeholder={t('settings.terminal_name_placeholder')}
                                            className="mt-1.5 h-10 block w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            {t('settings.terminal_ip')}
                                        </label>
                                        <input
                                            type="text"
                                            value={form.ip_address}
                                            onChange={(e) => setForm({ ...form, ip_address: e.target.value })}
                                            placeholder="192.168.1.201"
                                            className="mt-1.5 h-10 block w-full rounded-lg border border-slate-200 bg-white px-3.5 font-mono text-sm text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            {t('settings.comm_port')}
                                        </label>
                                        <input
                                            type="number"
                                            value={form.port}
                                            onChange={(e) => setForm({ ...form, port: Number(e.target.value) })}
                                            className="mt-1.5 h-10 block w-full rounded-lg border border-slate-200 bg-white px-3.5 font-mono text-sm text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            {t('settings.comm_password')}
                                        </label>
                                        <input
                                            type="number"
                                            value={form.comm_key}
                                            onChange={(e) => setForm({ ...form, comm_key: Number(e.target.value) })}
                                            className="mt-1.5 h-10 block w-full rounded-lg border border-slate-200 bg-white px-3.5 font-mono text-sm text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                        />
                                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                            {t('settings.comm_password_hint')}
                                        </span>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            {t('settings.protocol')}
                                        </label>
                                        <select
                                            value={form.protocol}
                                            onChange={(e) => setForm({ ...form, protocol: e.target.value as 'udp' | 'tcp' })}
                                            className="mt-1.5 h-10 block w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                        >
                                            <option value="udp">{t('settings.udp_protocol')}</option>
                                            <option value="tcp">{t('settings.tcp_protocol')}</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            {t('settings.student_matching')}
                                        </label>
                                        <select
                                            value={form.mapping_field}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    mapping_field: e.target.value as
                                                        | 'roll_number'
                                                        | 'id'
                                                        | 'biometric_id',
                                                })
                                            }
                                            className="mt-1.5 h-10 block w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                        >
                                            <option value="roll_number">{t('settings.roll_number_rec')}</option>
                                            <option value="id">{t('settings.student_id')}</option>
                                            <option value="biometric_id">{t('settings.biometric_id')}</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            {t('settings.late_cutoff')}
                                        </label>
                                        <input
                                            type="time"
                                            value={form.late_threshold}
                                            onChange={(e) => setForm({ ...form, late_threshold: e.target.value })}
                                            className="mt-1.5 h-10 block w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="border-t border-slate-200 pt-4 flex items-center justify-end dark:border-slate-800">
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="inline-flex items-center gap-2 rounded-lg bg-accent-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-700 disabled:opacity-50"
                                    >
                                        <AppIcon name="check" className="h-4 w-4" />
                                        <span>{isSaving ? t('common.saving') : t('settings.save_settings')}</span>
                                    </button>
                                </div>
                            </form>
                        </section>
                    </div>

                    {/* Right Column: Diagnostics, Sync & Upload Tools */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* Tool 1: Live Connection Diagnostics */}
                        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <AppIcon name="activity" className="h-4 w-4 text-accent-600 dark:text-accent-400" />
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                        {t('settings.diag_test')}
                                    </h3>
                                </div>
                                <button
                                    type="button"
                                    disabled={isTesting}
                                    onClick={handleTestConnection}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                                >
                                    <AppIcon name="activity" className="h-3.5 w-3.5" />
                                    <span>{isTesting ? t('settings.testing') : t('settings.ping_device')}</span>
                                </button>
                            </div>

                            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                                {t('settings.diag_desc')} ({form.ip_address}:{form.port}, {form.protocol.toUpperCase()})
                            </p>

                            {testResult && (
                                <div
                                    className={`mt-3 rounded-lg p-3 text-xs flex items-start gap-2.5 ${
                                        testResult.success
                                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                                            : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                                    }`}
                                >
                                    <AppIcon
                                        name={testResult.success ? 'check' : 'close'}
                                        className="h-4 w-4 shrink-0 mt-0.5"
                                    />
                                    <div>
                                        <p className="font-semibold">{testResult.message}</p>
                                        {testResult.latency_ms && (
                                            <p className="mt-1 font-mono text-[11px] opacity-90">
                                                {t('settings.latency')}: {formatNumber(testResult.latency_ms)} ms
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* Tool 2: On-Demand Attendance Sync */}
                        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <div className="flex items-center gap-2">
                                <AppIcon name="download" className="h-4 w-4 text-accent-600 dark:text-accent-400" />
                                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                    {t('settings.direct_sync')}
                                </h3>
                            </div>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                {t('settings.direct_sync_desc')}
                            </p>

                            <div className="mt-4 space-y-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        {t('settings.sync_date')}
                                    </label>
                                    <input
                                        type="date"
                                        value={syncDate}
                                        onChange={(e) => setSyncDate(e.target.value)}
                                        className="mt-1 h-9 block w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:[color-scheme:dark]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        {t('settings.target_class')}
                                    </label>
                                    <select
                                        value={syncClass}
                                        onChange={(e) => setSyncClass(e.target.value)}
                                        className="mt-1 h-9 block w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                    >
                                        <option value="">{t('settings.all_classes')}</option>
                                        {classes.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <button
                                    type="button"
                                    disabled={isSyncing || !form.is_enabled}
                                    onClick={handleDirectSync}
                                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-accent-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-accent-700 disabled:opacity-50"
                                >
                                    <AppIcon name="download" className="h-4 w-4" />
                                    <span>{isSyncing ? t('settings.pulling_logs') : t('settings.pull_logs')}</span>
                                </button>
                            </div>
                        </section>

                        {/* Tool 3: USB File Import */}
                        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <div className="flex items-center gap-2">
                                <AppIcon name="database" className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                    {t('settings.usb_import')}
                                </h3>
                            </div>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                {t('settings.usb_import_desc')}
                            </p>

                            <form onSubmit={handleImportFile} className="mt-3 space-y-3">
                                <input
                                    type="file"
                                    accept=".dat,.txt,.csv"
                                    onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                                    className="block w-full text-xs text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-slate-700 hover:file:bg-slate-200 dark:text-slate-300 dark:file:bg-slate-800 dark:file:text-slate-200"
                                />

                                <button
                                    type="submit"
                                    disabled={!selectedFile || isImporting}
                                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
                                >
                                    <AppIcon name="check" className="h-4 w-4" />
                                    <span>{isImporting ? t('settings.processing_usb') : t('settings.process_usb')}</span>
                                </button>
                            </form>
                        </section>

                        {/* Tool 4: Real-time Cloud Push (ADMS) */}
                        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <div className="flex items-center gap-2">
                                <AppIcon name="sparkles" className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                    {t('settings.adms_title')}
                                </h3>
                            </div>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                {t('settings.adms_desc')}
                            </p>

                            <div className="mt-3 flex items-center gap-2">
                                <input
                                    type="text"
                                    readOnly
                                    value={webhookUrl}
                                    className="h-8 flex-1 rounded-md border border-slate-200 bg-slate-50 px-2.5 font-mono text-[11px] text-slate-800 select-all dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                                />
                                <button
                                    type="button"
                                    onClick={copyWebhookUrl}
                                    className="h-8 px-2.5 rounded-md border border-slate-200 bg-white font-medium text-slate-700 hover:bg-slate-50 text-[11px] transition dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                >
                                    {copiedWebhook ? t('settings.copied') : t('settings.copy')}
                                </button>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
