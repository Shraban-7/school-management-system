import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import AppIcon from '@/components/AppIcon';

export interface ZktecoConfig {
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

export interface ZktecoTestResult {
    success: boolean;
    message: string;
    latency_ms?: number | null;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    date: string;
    classId: string | number;
    zkteco?: ZktecoConfig;
    initialTestResult?: ZktecoTestResult | null;
}

export default function ZktecoModal({
    isOpen,
    onClose,
    date,
    classId,
    zkteco,
    initialTestResult,
}: Props) {
    const [activeTab, setActiveTab] = useState<'sync' | 'settings'>('sync');

    const [form, setForm] = useState({
        name: zkteco?.name ?? 'Main Entrance Terminal',
        ip_address: zkteco?.ip_address ?? '192.168.1.201',
        port: zkteco?.port ?? 4370,
        comm_key: zkteco?.comm_key ?? 0,
        is_enabled: zkteco?.is_enabled ?? false,
        protocol: zkteco?.protocol ?? 'udp',
        mapping_field: zkteco?.mapping_field ?? 'roll_number',
        late_threshold: zkteco?.late_threshold ?? '09:15',
    });

    useEffect(() => {
        if (zkteco) {
            setForm({
                name: zkteco.name,
                ip_address: zkteco.ip_address,
                port: zkteco.port,
                comm_key: zkteco.comm_key,
                is_enabled: zkteco.is_enabled,
                protocol: zkteco.protocol,
                mapping_field: zkteco.mapping_field,
                late_threshold: zkteco.late_threshold,
            });
        }
    }, [zkteco]);

    const [testResult, setTestResult] = useState<ZktecoTestResult | null>(
        initialTestResult ?? null,
    );
    const [isTesting, setIsTesting] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [copiedWebhook, setCopiedWebhook] = useState(false);

    if (!isOpen) return null;

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
            .then((data: ZktecoTestResult) => {
                setTestResult(data);
            })
            .catch((err) => {
                setTestResult({
                    success: false,
                    message: 'Network error while contacting testing endpoint: ' + err.message,
                });
            })
            .finally(() => {
                setIsTesting(false);
            });
    }

    function handleSyncDevice() {
        setIsSyncing(true);
        router.post(
            '/admin/attendance/zkteco/sync',
            {
                date,
                class_id: classId || undefined,
            },
            {
                preserveScroll: true,
                onFinish: () => {
                    setIsSyncing(false);
                },
            },
        );
    }

    function handleSaveSettings(e: React.FormEvent) {
        e.preventDefault();
        setIsSaving(true);
        router.post('/admin/attendance/zkteco/settings', form, {
            preserveScroll: true,
            onFinish: () => {
                setIsSaving(false);
            },
        });
    }

    function handleImportFile(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedFile) return;

        setIsImporting(true);
        const data = new FormData();
        data.append('log_file', selectedFile);
        data.append('date', date);
        if (classId) {
            data.append('class_id', String(classId));
        }

        router.post('/admin/attendance/zkteco/import', data, {
            preserveScroll: true,
            onFinish: () => {
                setIsImporting(false);
                setSelectedFile(null);
            },
        });
    }

    const webhookUrl =
        typeof window !== 'undefined'
            ? `${window.location.origin}/iclock/cdata`
            : '/iclock/cdata';

    function copyWebhookUrl() {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(webhookUrl).then(() => {
                setCopiedWebhook(true);
                setTimeout(() => setCopiedWebhook(false), 2000);
            });
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/70 px-6 py-4 dark:border-slate-800 dark:bg-slate-950/40">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-100 text-accent-700 shadow-sm dark:bg-accent-950 dark:text-accent-300">
                            <AppIcon name="server" className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                                    ZKTeco Biometrics &amp; RFID
                                </h2>
                                {form.is_enabled ? (
                                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 uppercase dark:bg-emerald-950 dark:text-emerald-300">
                                        Enabled
                                    </span>
                                ) : (
                                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500 uppercase dark:bg-slate-800 dark:text-slate-400">
                                        Optional
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Plug &amp; play hardware integration for fingerprints, facial recognition, and RFID cards.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    >
                        <AppIcon name="close" className="h-5 w-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-200 px-6 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <button
                        type="button"
                        onClick={() => setActiveTab('sync')}
                        className={`flex items-center gap-2 border-b-2 py-3 text-sm font-semibold transition ${
                            activeTab === 'sync'
                                ? 'border-accent-600 text-accent-600 dark:border-accent-400 dark:text-accent-400'
                                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                    >
                        <AppIcon name="activity" className="h-4 w-4" />
                        <span>Quick Sync &amp; USB Import</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('settings')}
                        className={`ml-6 flex items-center gap-2 border-b-2 py-3 text-sm font-semibold transition ${
                            activeTab === 'settings'
                                ? 'border-accent-600 text-accent-600 dark:border-accent-400 dark:text-accent-400'
                                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                    >
                        <AppIcon name="settings" className="h-4 w-4" />
                        <span>Device Configuration</span>
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-6 overflow-y-auto space-y-6">
                    {activeTab === 'sync' && (
                        <div className="space-y-6">
                            {/* Option 1: Direct Network Sync */}
                            <section className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/30">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                            <AppIcon name="server" className="h-4 w-4 text-accent-600 dark:text-accent-400" />
                                            <span>Direct Terminal Network Sync</span>
                                        </h3>
                                        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                                            Connects to terminal at{' '}
                                            <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                                                {form.ip_address}:{form.port}
                                            </span>{' '}
                                            ({form.protocol.toUpperCase()}) and pulls punch records for{' '}
                                            <span className="font-bold text-accent-700 dark:text-accent-300">{date}</span>.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        disabled={isTesting}
                                        onClick={handleTestConnection}
                                        className="shrink-0 inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                                    >
                                        <AppIcon name="activity" className="h-3.5 w-3.5 text-slate-500" />
                                        <span>{isTesting ? 'Testing…' : 'Test Ping'}</span>
                                    </button>
                                </div>

                                {testResult && (
                                    <div
                                        className={`mt-3 rounded-lg p-3 text-xs flex items-start gap-2 ${
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
                                                <p className="mt-0.5 opacity-90 font-mono text-[11px]">
                                                    Response time: {testResult.latency_ms} ms
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3 dark:border-slate-800">
                                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                        {zkteco?.last_sync_at ? (
                                            <>Last synced: {zkteco.last_sync_at} ({zkteco.last_sync_status})</>
                                        ) : (
                                            <>No previous sync recorded.</>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        disabled={isSyncing || !form.is_enabled}
                                        onClick={handleSyncDevice}
                                        className="inline-flex items-center gap-1.5 rounded-lg bg-accent-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-accent-700 disabled:opacity-50"
                                    >
                                        <AppIcon name="download" className="h-4 w-4" />
                                        <span>{isSyncing ? 'Pulling from Device…' : 'Sync Attendance Now'}</span>
                                    </button>
                                </div>

                                {!form.is_enabled && (
                                    <p className="mt-2 text-[11px] text-amber-600 dark:text-amber-400">
                                        ZKTeco is currently disabled. Go to the "Device Configuration" tab to enable it.
                                    </p>
                                )}
                            </section>

                            {/* Option 2: USB Attlog File Import */}
                            <section className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/30">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                    <AppIcon name="database" className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                    <span>USB Flash Drive Import (.dat, .txt, .csv)</span>
                                </h3>
                                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                                    If the terminal is offline or on an isolated local network, export logs from the device USB port (usually creates <code className="rounded bg-slate-200 px-1 py-0.5 font-mono dark:bg-slate-800">1_attlog.dat</code>) and upload it here.
                                </p>

                                <form onSubmit={handleImportFile} className="mt-3 space-y-3">
                                    <div className="flex flex-col sm:flex-row items-center gap-3">
                                        <input
                                            type="file"
                                            accept=".dat,.txt,.csv"
                                            onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                                            className="block w-full text-xs text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-200 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-slate-700 hover:file:bg-slate-300 dark:text-slate-300 dark:file:bg-slate-800 dark:file:text-slate-200 dark:hover:file:bg-slate-700"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!selectedFile || isImporting}
                                            className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
                                        >
                                            <AppIcon name="check" className="h-4 w-4" />
                                            <span>{isImporting ? 'Importing…' : 'Process File'}</span>
                                        </button>
                                    </div>
                                    {selectedFile && (
                                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                                            Ready to parse {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB) for {date}.
                                        </p>
                                    )}
                                </form>
                            </section>

                            {/* Option 3: ADMS Cloud Server Push Info */}
                            <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 text-xs">
                                <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                                    <AppIcon name="sparkles" className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                    <span>Real-Time Cloud Push (ADMS / iClock)</span>
                                </h4>
                                <p className="mt-1 text-slate-600 dark:text-slate-400">
                                    To receive live biometric punches in real-time as students scan their fingerprint or RFID card, enter this server endpoint in your ZKTeco device&rsquo;s <strong>Cloud Server / ADMS</strong> settings:
                                </p>
                                <div className="mt-2 flex items-center gap-2">
                                    <input
                                        type="text"
                                        readOnly
                                        value={webhookUrl}
                                        className="h-8 flex-1 rounded-md border border-slate-200 bg-slate-50 px-2.5 font-mono text-[11px] text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 select-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={copyWebhookUrl}
                                        className="h-8 px-2.5 rounded-md border border-slate-200 bg-white font-medium text-slate-700 hover:bg-slate-50 text-[11px] transition dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                    >
                                        {copiedWebhook ? 'Copied!' : 'Copy URL'}
                                    </button>
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <form onSubmit={handleSaveSettings} className="space-y-5">
                            {/* Enable Toggle */}
                            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/30">
                                <div>
                                    <label
                                        htmlFor="zkteco-enabled-toggle"
                                        className="text-sm font-bold text-slate-900 dark:text-slate-100 cursor-pointer"
                                    >
                                        Enable ZKTeco Integration
                                    </label>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Keep optional. Turn on when connecting hardware or syncing attendance logs.
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        id="zkteco-enabled-toggle"
                                        type="checkbox"
                                        checked={form.is_enabled}
                                        onChange={(e) => setForm({ ...form, is_enabled: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:bg-slate-700 peer-checked:bg-accent-600"></div>
                                </label>
                            </div>

                            {/* Device Info */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        Terminal Name
                                    </label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        placeholder="e.g. Main Gate Terminal"
                                        className="mt-1 h-9 block w-full rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        Terminal IP Address
                                    </label>
                                    <input
                                        type="text"
                                        value={form.ip_address}
                                        onChange={(e) => setForm({ ...form, ip_address: e.target.value })}
                                        placeholder="192.168.1.201"
                                        className="mt-1 h-9 block w-full rounded-md border border-slate-200 bg-white px-3 font-mono text-xs text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        Port (Default: 4370)
                                    </label>
                                    <input
                                        type="number"
                                        value={form.port}
                                        onChange={(e) => setForm({ ...form, port: Number(e.target.value) })}
                                        className="mt-1 h-9 block w-full rounded-md border border-slate-200 bg-white px-3 font-mono text-xs text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        Comm Key / Password
                                    </label>
                                    <input
                                        type="number"
                                        value={form.comm_key}
                                        onChange={(e) => setForm({ ...form, comm_key: Number(e.target.value) })}
                                        className="mt-1 h-9 block w-full rounded-md border border-slate-200 bg-white px-3 font-mono text-xs text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        Protocol
                                    </label>
                                    <select
                                        value={form.protocol}
                                        onChange={(e) => setForm({ ...form, protocol: e.target.value as 'udp' | 'tcp' })}
                                        className="mt-1 h-9 block w-full rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                    >
                                        <option value="udp">UDP (Standard ZKTeco)</option>
                                        <option value="tcp">TCP</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        Student ID Match Field
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
                                        className="mt-1 h-9 block w-full rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                    >
                                        <option value="roll_number">Class Roll Number (Default)</option>
                                        <option value="id">Database Student ID</option>
                                        <option value="biometric_id">RFID Card / Biometric ID</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        Late Arrival Cutoff Time
                                    </label>
                                    <input
                                        type="time"
                                        value={form.late_threshold}
                                        onChange={(e) => setForm({ ...form, late_threshold: e.target.value })}
                                        className="mt-1 h-9 block w-full rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                    />
                                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                        Punches after this time will be marked as Late.
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-accent-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-accent-700 disabled:opacity-50"
                                >
                                    <AppIcon name="check" className="h-4 w-4" />
                                    <span>{isSaving ? 'Saving…' : 'Save Configuration'}</span>
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
