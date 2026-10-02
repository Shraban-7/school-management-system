import React, { useState, useEffect } from 'react';
import { Head, router, usePage, Link } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import AppIcon from '@/components/AppIcon';
import { useSidebarStack } from '@/composables/useNavStack';
import { useI18n } from '@/composables/useI18n';
import type { SidebarConfig } from '@/types/sidebar';

interface Template {
    id: number;
    title: string;
    slug: string;
    type: 'sms' | 'email' | 'both';
    subject: string | null;
    body: string;
    is_system: boolean;
    is_active: boolean;
}

interface ClassOption {
    id: number;
    class_level: string;
    section_name: string;
    version: string;
}

interface LogEntry {
    id: number;
    channel: 'sms' | 'email';
    recipient_type: string;
    recipient_to: string;
    recipient_name: string | null;
    subject: string | null;
    content: string;
    status: 'sent' | 'failed' | 'pending';
    error_message: string | null;
    created_at: string;
    sender?: { name: string; role: string } | null;
}

interface GatewaySettings {
    sms_provider: string;
    sms_api_key: string | null;
    sms_sender_id: string | null;
    sms_api_url: string | null;
    sms_enabled: boolean;
    mail_mailer: string;
    mail_host: string | null;
    mail_port: number;
    mail_username: string | null;
    mail_password?: string | null;
    mail_encryption: string | null;
    mail_from_address: string | null;
    mail_from_name: string | null;
    email_enabled: boolean;
}

interface Props {
    sidebar: SidebarConfig;
    school: {
        name_en: string;
        name_bn: string;
        eiin_number: number | string;
        board_affiliation: string;
        address: string | null;
        phone: string | null;
        logo_url: string | null;
    };
    templates: Template[];
    classes: ClassOption[];
    logs: LogEntry[];
    settings: GatewaySettings;
    stats: {
        total_sms: number;
        total_email: number;
        today_total: number;
        sms_enabled: boolean;
        email_enabled: boolean;
    };
    preselectedAudience?: string;
    preselectedClassId?: number | null;
    preselectedDate?: string;
}

export default function CommunicationIndex({
    sidebar,
    school,
    templates,
    classes,
    logs,
    settings,
    stats,
    preselectedAudience = 'all_guardians',
    preselectedClassId = null,
    preselectedDate,
}: Props) {
    const { t, bi, formatNumber, formatDate, locale } = useI18n();
    const sidebarStack = useSidebarStack();
    useEffect(() => {
        if (sidebar) {
            sidebarStack.set(sidebar);
        }
    }, [sidebar]);

    const page = usePage();
    const props = page.props as Record<string, unknown>;
    const flash = (props.flash as { message?: string | null; error?: string | null })?.message ?? null;

    const [activeTab, setActiveTab] = useState<'broadcast' | 'templates' | 'gateways' | 'logs'>('broadcast');

    // Broadcast Form state
    const [channel, setChannel] = useState<'sms' | 'email' | 'both'>('both');
    const [audience, setAudience] = useState<string>(preselectedAudience);
    const [classId, setClassId] = useState<string>(preselectedClassId ? String(preselectedClassId) : '');
    const [date, setDate] = useState<string>(preselectedDate || new Date().toISOString().split('T')[0]);
    const [customRecipient, setCustomRecipient] = useState('');
    const [selectedTemplateSlug, setSelectedTemplateSlug] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [amount, setAmount] = useState('৳ 0');
    const [isSending, setIsSending] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Template Creation modal state
    const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
    const [newTemplate, setNewTemplate] = useState({
        title: '',
        type: 'both' as 'sms' | 'email' | 'both',
        subject: '',
        body: '',
    });

    // Gateway Form state
    const [gwForm, setGwForm] = useState<GatewaySettings>({ ...settings });
    const [isSavingGw, setIsSavingGw] = useState(false);

    // Live preview modal for custom email
    const [showEmailPreview, setShowEmailPreview] = useState(false);

    function applyTemplate(slug: string) {
        setSelectedTemplateSlug(slug);
        const t = templates.find((item) => item.slug === slug);
        if (t) {
            setMessage(t.body);
            if (t.subject) {
                setSubject(t.subject);
            }
            if (t.type === 'sms') {
                setChannel('sms');
            } else if (t.type === 'email') {
                setChannel('email');
            }
        }
    }

    function insertPlaceholder(placeholder: string) {
        setMessage((prev) => prev + placeholder);
    }

    function submitBroadcast(e: React.FormEvent) {
        e.preventDefault();
        setIsSending(true);

        router.post(
            '/admin/communication/messages/send',
            {
                channel,
                audience,
                class_id: classId ? parseInt(classId, 10) : null,
                date,
                custom_recipient: customRecipient,
                subject: channel === 'sms' ? null : subject,
                message,
                amount,
            },
            {
                onError: (err) => {
                    setErrors(err);
                    setIsSending(false);
                },
                onSuccess: () => {
                    setIsSending(false);
                    setErrors({});
                    if (audience === 'custom') {
                        setCustomRecipient('');
                    }
                },
            },
        );
    }

    function submitNewTemplate(e: React.FormEvent) {
        e.preventDefault();
        router.post(
            '/admin/communication/templates',
            { ...newTemplate },
            {
                onSuccess: () => {
                    setIsCreatingTemplate(false);
                    setNewTemplate({ title: '', type: 'both', subject: '', body: '' });
                },
            },
        );
    }

    function deleteTemplate(id: number) {
        if (!confirm(t('common.confirm_delete'))) {
            return;
        }
        router.delete(`/admin/communication/templates/${id}`);
    }

    function submitGateways(e: React.FormEvent) {
        e.preventDefault();
        setIsSavingGw(true);
        router.put(
            '/admin/communication/settings',
            { ...gwForm },
            {
                onSuccess: () => setIsSavingGw(false),
                onError: () => setIsSavingGw(false),
            },
        );
    }

    // SMS length calculator
    const isUnicode = /[^\u0000-\u00ff]/.test(message);
    const smsLength = message.length;
    const maxCharsPerSms = isUnicode ? 70 : 160;
    const smsCount = smsLength > 0 ? Math.ceil(smsLength / maxCharsPerSms) : 0;

    const inputClass =
        'mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100';
    const labelClass = 'block text-sm font-medium text-slate-700 dark:text-slate-300';
    const sectionClass =
        'rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900';
    const errorClass = 'mt-1 text-xs text-rose-500';

    return (
        <DashboardLayout>
            <Head title={t('sidebar.sms_email')} />

            <div className="space-y-6">
                {/* Header */}
                <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <Link
                                href="/admin/settings"
                                className="text-xs font-semibold tracking-widest text-slate-500 uppercase hover:text-accent-600 dark:text-slate-400"
                            >
                                {t('sidebar.settings')}
                            </Link>
                            <span className="text-xs text-slate-400">/</span>
                            <span className="text-xs font-semibold tracking-widest text-accent-600 uppercase dark:text-accent-400">
                                {t('sidebar.communication')}
                            </span>
                        </div>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
                            {t('sidebar.sms_email')}
                        </h1>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            {t('communication.subtitle')}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setActiveTab('gateways')}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                        >
                            <AppIcon name="cog" className="h-4 w-4" />
                            {t('communication.gateway_credentials')}
                        </button>
                    </div>
                </header>

                {/* Flash Banner */}
                {flash && (
                    <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200">
                        <AppIcon name="check" className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <span>{flash}</span>
                    </div>
                )}

                {/* Stats Summary Bar */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                            <span>{t('communication.total_sms_sent')}</span>
                            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                        </div>
                        <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                            {formatNumber(stats.total_sms)}
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            {t('communication.gateway')}: {settings.sms_provider.toUpperCase()}
                        </span>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                            <span>{t('communication.total_email_sent')}</span>
                            <span className="inline-block h-2 w-2 rounded-full bg-sky-500" />
                        </div>
                        <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                            {formatNumber(stats.total_email)}
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            {t('communication.mailer')}: {settings.mail_mailer.toUpperCase()}
                        </span>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                            <span>{t('communication.today_dispatches')}</span>
                            <AppIcon name="clock" className="h-3.5 w-3.5 text-accent-500" />
                        </div>
                        <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                            {formatNumber(stats.today_total)}
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">{t('communication.activity_today')}</span>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                            <span>{t('communication.system_gateways')}</span>
                            <AppIcon name="server" className="h-3.5 w-3.5 text-emerald-500" />
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                            <span
                                className={`rounded px-1.5 py-0.5 text-xs font-semibold ${
                                    stats.sms_enabled
                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                        : 'bg-slate-100 text-slate-500'
                                }`}
                            >
                                {t('communication.sms')} {stats.sms_enabled ? 'ON' : 'OFF'}
                            </span>
                            <span
                                className={`rounded px-1.5 py-0.5 text-xs font-semibold ${
                                    stats.email_enabled
                                        ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300'
                                        : 'bg-slate-100 text-slate-500'
                                }`}
                            >
                                {t('communication.email')} {stats.email_enabled ? 'ON' : 'OFF'}
                            </span>
                        </div>
                        <span className="mt-1 block text-[11px] text-slate-500 dark:text-slate-400">
                            {stats.sms_enabled && stats.email_enabled ? t('communication.both_active') : t('communication.check_config')}
                        </span>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2 dark:border-slate-800">
                    <button
                        type="button"
                        onClick={() => setActiveTab('broadcast')}
                        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                            activeTab === 'broadcast'
                                ? 'bg-accent-600 text-white shadow-sm'
                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                        }`}
                    >
                        <AppIcon name="megaphone" className="h-4 w-4" />
                        {t('communication.compose_broadcast')}
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('templates')}
                        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                            activeTab === 'templates'
                                ? 'bg-accent-600 text-white shadow-sm'
                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                        }`}
                    >
                        <AppIcon name="list" className="h-4 w-4" />
                        {t('communication.templates_tab')} ({formatNumber(templates.length)})
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('gateways')}
                        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                            activeTab === 'gateways'
                                ? 'bg-accent-600 text-white shadow-sm'
                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                        }`}
                    >
                        <AppIcon name="cog" className="h-4 w-4" />
                        {t('communication.gateways_tab')}
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('logs')}
                        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                            activeTab === 'logs'
                                ? 'bg-accent-600 text-white shadow-sm'
                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                        }`}
                    >
                        <AppIcon name="activity" className="h-4 w-4" />
                        {t('communication.logs_tab')} ({formatNumber(logs.length)})
                    </button>
                </div>

                {/* TAB 1: COMPOSE & BROADCAST */}
                {activeTab === 'broadcast' && (
                    <form onSubmit={submitBroadcast} className="space-y-6">
                        <div className="grid gap-6 lg:grid-cols-3">
                            {/* Left column: Setup & Target */}
                            <div className="space-y-6 lg:col-span-2">
                                <section className={sectionClass}>
                                    <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                                        {t('communication.step_channel_recipients')}
                                    </h2>

                                    {/* Channel selection */}
                                    <div className="mt-4">
                                        <label className={labelClass}>{t('communication.transmission_channel')}</label>
                                        <div className="mt-2 grid grid-cols-3 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setChannel('sms')}
                                                className={`flex items-center justify-center gap-2 rounded-lg border p-3 text-sm font-semibold transition ${
                                                    channel === 'sms'
                                                        ? 'border-accent-600 bg-accent-50 text-accent-700 dark:border-accent-500 dark:bg-accent-950/40 dark:text-accent-300'
                                                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300'
                                                }`}
                                            >
                                                <AppIcon name="phone" className="h-4 w-4" />
                                                {t('communication.sms_only')}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setChannel('email')}
                                                className={`flex items-center justify-center gap-2 rounded-lg border p-3 text-sm font-semibold transition ${
                                                    channel === 'email'
                                                        ? 'border-accent-600 bg-accent-50 text-accent-700 dark:border-accent-500 dark:bg-accent-950/40 dark:text-accent-300'
                                                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300'
                                                }`}
                                            >
                                                <AppIcon name="mail" className="h-4 w-4" />
                                                {t('communication.email_only')}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setChannel('both')}
                                                className={`flex items-center justify-center gap-2 rounded-lg border p-3 text-sm font-semibold transition ${
                                                    channel === 'both'
                                                        ? 'border-accent-600 bg-accent-50 text-accent-700 dark:border-accent-500 dark:bg-accent-950/40 dark:text-accent-300'
                                                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300'
                                                }`}
                                            >
                                                <AppIcon name="megaphone" className="h-4 w-4" />
                                                {t('communication.both')}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Audience selection */}
                                    <div className="mt-5">
                                        <label className={labelClass}>{t('communication.target_audience')}</label>
                                        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                                            {[
                                                { id: 'all_guardians', label: t('communication.all_guardians'), icon: 'users' },
                                                { id: 'class', label: t('communication.specific_class'), icon: 'graduation-cap' },
                                                { id: 'absent_today', label: t('communication.absent_today'), icon: 'bell' },
                                                { id: 'teachers', label: t('communication.teachers_staff'), icon: 'briefcase' },
                                                { id: 'custom', label: t('communication.custom_recipient'), icon: 'user' },
                                            ].map((item) => (
                                                <button
                                                    key={item.id}
                                                    type="button"
                                                    onClick={() => setAudience(item.id)}
                                                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                                                        audience === item.id
                                                            ? 'border-accent-600 bg-accent-600 text-white shadow-sm'
                                                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300'
                                                    }`}
                                                >
                                                    <AppIcon name={item.icon as any} className="h-3.5 w-3.5" />
                                                    {item.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Sub-selectors depending on audience */}
                                    {audience === 'class' && (
                                        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                                            <label htmlFor="classId" className={labelClass}>
                                                {t('communication.select_class')} <span className="text-rose-500">*</span>
                                            </label>
                                            <select
                                                id="classId"
                                                value={classId}
                                                onChange={(e) => setClassId(e.target.value)}
                                                required
                                                className={inputClass}
                                            >
                                                <option value="">{t('communication.choose_class')}</option>
                                                {classes.map((c) => (
                                                    <option key={c.id} value={c.id}>
                                                        {c.class_level} - {c.section_name} ({c.version})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {audience === 'absent_today' && (
                                        <div className="mt-4 grid gap-4 rounded-lg border border-amber-200 bg-amber-50/70 p-4 sm:grid-cols-2 dark:border-amber-900/60 dark:bg-amber-950/30">
                                            <div>
                                                <label htmlFor="absent_date" className={labelClass}>
                                                    {t('attendance.date')}
                                                </label>
                                                <input
                                                    id="absent_date"
                                                    type="date"
                                                    value={date}
                                                    onChange={(e) => setDate(e.target.value)}
                                                    className={inputClass}
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="absent_class" className={labelClass}>
                                                    {t('communication.filter_class')}
                                                </label>
                                                <select
                                                    id="absent_class"
                                                    value={classId}
                                                    onChange={(e) => setClassId(e.target.value)}
                                                    className={inputClass}
                                                >
                                                    <option value="">{t('common.all_classes')}</option>
                                                    {classes.map((c) => (
                                                        <option key={c.id} value={c.id}>
                                                            {c.class_level} - {c.section_name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <p className="text-xs text-amber-800 sm:col-span-2 dark:text-amber-200">
                                                {t('communication.absentees_notice')}
                                            </p>
                                        </div>
                                    )}

                                    {audience === 'custom' && (
                                        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                                            <label htmlFor="custom_recipient" className={labelClass}>
                                                {t('communication.phone_or_email')} <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                id="custom_recipient"
                                                type="text"
                                                required
                                                value={customRecipient}
                                                onChange={(e) => setCustomRecipient(e.target.value)}
                                                placeholder="e.g. +8801711000000 or parent@gmail.com"
                                                className={inputClass}
                                            />
                                        </div>
                                    )}
                                </section>

                                {/* Message Content */}
                                <section className={sectionClass}>
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                                            {t('communication.step_compose')}
                                        </h2>

                                        {/* Template selector */}
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-slate-500">{t('communication.template_label')}</span>
                                            <select
                                                value={selectedTemplateSlug}
                                                onChange={(e) => applyTemplate(e.target.value)}
                                                className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                                            >
                                                <option value="">{t('communication.choose_template')}</option>
                                                {templates.map((t) => (
                                                    <option key={t.slug} value={t.slug}>
                                                        {t.title} ({t.type.toUpperCase()})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Placeholders quick pills */}
                                    <div className="mt-4">
                                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                            {t('communication.insert_placeholders')}
                                        </span>
                                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                                            {[
                                                '{student_name}',
                                                '{guardian_name}',
                                                '{class_name}',
                                                '{school_name}',
                                                '{date}',
                                                '{amount}',
                                            ].map((chip) => (
                                                <button
                                                    key={chip}
                                                    type="button"
                                                    onClick={() => insertPlaceholder(chip)}
                                                    className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-mono font-medium text-accent-700 hover:bg-accent-50 dark:border-slate-800 dark:bg-slate-950 dark:text-accent-300"
                                                >
                                                    + {chip}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Email Subject field */}
                                    {channel !== 'sms' && (
                                        <div className="mt-4">
                                            <label htmlFor="subject" className={labelClass}>
                                                {t('communication.subject')} <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                id="subject"
                                                type="text"
                                                required
                                                value={subject}
                                                onChange={(e) => setSubject(e.target.value)}
                                                placeholder="e.g. Official Notice from School Administration"
                                                className={`${inputClass} ${errors.subject ? 'border-rose-500' : ''}`}
                                            />
                                            {errors.subject && <p className={errorClass}>{errors.subject}</p>}
                                        </div>
                                    )}

                                    {/* Due amount for Fee reminders */}
                                    {selectedTemplateSlug === 'fee_reminder' && (
                                        <div className="mt-4">
                                            <label htmlFor="due_amount" className={labelClass}>
                                                {t('communication.due_amount')} ({'{amount}'})
                                            </label>
                                            <input
                                                id="due_amount"
                                                type="text"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                placeholder="e.g. ৳ 3,500"
                                                className={inputClass}
                                            />
                                        </div>
                                    )}

                                    {/* Message Body */}
                                    <div className="mt-4">
                                        <div className="flex items-center justify-between">
                                            <label htmlFor="message" className={labelClass}>
                                                {t('communication.message_body')} <span className="text-rose-500">*</span>
                                            </label>
                                            {channel !== 'email' && (
                                                <span
                                                    className={`text-xs ${
                                                        smsCount > 1
                                                            ? 'text-amber-600 font-semibold'
                                                            : 'text-slate-500'
                                                    }`}
                                                >
                                                    {formatNumber(smsLength)} / {formatNumber(maxCharsPerSms)} {t('communication.characters')} ({formatNumber(smsCount)} {t('communication.sms')}
                                                    {isUnicode ? ' - Unicode' : ''})
                                                </span>
                                            )}
                                        </div>
                                        <textarea
                                            id="message"
                                            rows={6}
                                            required
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Write message content here..."
                                            className={`${inputClass} ${errors.message ? 'border-rose-500' : ''}`}
                                        />
                                        {errors.message && <p className={errorClass}>{errors.message}</p>}
                                    </div>

                                    {/* Actions */}
                                    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                                        {channel !== 'sms' ? (
                                            <button
                                                type="button"
                                                onClick={() => setShowEmailPreview(true)}
                                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                            >
                                                <AppIcon name="eye" className="h-4 w-4" />
                                                {t('communication.preview_email')}
                                            </button>
                                        ) : (
                                            <div />
                                        )}

                                        <button
                                            type="submit"
                                            disabled={isSending || !message.trim()}
                                            className="inline-flex items-center gap-2 rounded-lg bg-accent-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-700 disabled:opacity-50"
                                        >
                                            <AppIcon name="megaphone" className="h-4 w-4" />
                                            {isSending ? t('communication.sending') : t('communication.send_now')}
                                        </button>
                                    </div>
                                </section>
                            </div>

                            {/* Right column: Quick Guide & Info */}
                            <div className="space-y-6">
                                <section className={sectionClass}>
                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                        {t('communication.guidance_title')}
                                    </h3>
                                    <ul className="mt-3 space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
                                        <li className="flex items-start gap-2">
                                            <AppIcon name="check" className="h-4 w-4 shrink-0 text-emerald-500" />
                                            <span>{t('communication.guidance_guardians')}</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <AppIcon name="check" className="h-4 w-4 shrink-0 text-emerald-500" />
                                            <span>{t('communication.guidance_absentees')}</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <AppIcon name="check" className="h-4 w-4 shrink-0 text-emerald-500" />
                                            <span>{t('communication.guidance_branded')}</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <AppIcon name="check" className="h-4 w-4 shrink-0 text-emerald-500" />
                                            <span>{t('communication.guidance_placeholders')}</span>
                                        </li>
                                    </ul>
                                </section>

                                {/* Mini Email Shell Preview */}
                                <section className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        {t('communication.live_email_preview')}
                                    </span>
                                    <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3 text-xs shadow-sm dark:border-slate-800 dark:bg-slate-900">
                                        <div className="border-b border-indigo-500 pb-2 text-center">
                                            {school.logo_url ? (
                                                <img
                                                    src={school.logo_url}
                                                    alt="School Logo"
                                                    className="mx-auto h-8 max-w-[100px] object-contain"
                                                />
                                            ) : (
                                                <div className="font-bold text-slate-900 dark:text-slate-100">
                                                    {bi(school.name_en, school.name_bn)}
                                                </div>
                                            )}
                                            <span className="text-[10px] text-slate-400">
                                                EIIN: {formatNumber(school.eiin_number)}
                                            </span>
                                        </div>
                                        <div className="py-2.5">
                                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                                                {subject || 'Subject will appear here'}
                                            </span>
                                            <p className="mt-1 line-clamp-4 whitespace-pre-line text-slate-600 dark:text-slate-400">
                                                {message || 'Type your message to preview...'}
                                            </p>
                                        </div>
                                        <div className="border-t border-slate-100 pt-2 text-center text-[10px] text-slate-400 dark:border-slate-800">
                                            © {formatNumber(new Date().getFullYear())} {bi(school.name_en, school.name_bn)}
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </form>
                )}

                {/* TAB 2: TEMPLATES LIBRARY */}
                {activeTab === 'templates' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                    {t('communication.templates_title')}
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {t('communication.templates_subtitle')}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsCreatingTemplate(true)}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-accent-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-accent-700"
                            >
                                <AppIcon name="plus" className="h-4 w-4" />
                                {t('communication.add_template')}
                            </button>
                        </div>

                        {/* Modal / Card for New Template */}
                        {isCreatingTemplate && (
                            <form onSubmit={submitNewTemplate} className={`${sectionClass} border-accent-300 ring-2 ring-accent-500/20`}>
                                <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                        {t('communication.create_template')}
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={() => setIsCreatingTemplate(false)}
                                        className="text-slate-400 hover:text-slate-600"
                                    >
                                        <AppIcon name="close" className="h-4 w-4" />
                                    </button>
                                </div>

                                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className={labelClass}>{t('communication.template_title')}</label>
                                        <input
                                            type="text"
                                            required
                                            value={newTemplate.title}
                                            onChange={(e) => setNewTemplate((prev) => ({ ...prev, title: e.target.value }))}
                                            placeholder="e.g. Science Fair Invitation"
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>{t('communication.channel_type')}</label>
                                        <select
                                            value={newTemplate.type}
                                            onChange={(e) => setNewTemplate((prev) => ({ ...prev, type: e.target.value as any }))}
                                            className={inputClass}
                                        >
                                            <option value="both">{t('communication.both')}</option>
                                            <option value="email">{t('communication.email_only')}</option>
                                            <option value="sms">{t('communication.sms_only')}</option>
                                        </select>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className={labelClass}>{t('communication.subject')}</label>
                                        <input
                                            type="text"
                                            value={newTemplate.subject}
                                            onChange={(e) => setNewTemplate((prev) => ({ ...prev, subject: e.target.value }))}
                                            placeholder="Subject line for email notifications"
                                            className={inputClass}
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className={labelClass}>{t('communication.template_body')}</label>
                                        <textarea
                                            rows={4}
                                            required
                                            value={newTemplate.body}
                                            onChange={(e) => setNewTemplate((prev) => ({ ...prev, body: e.target.value }))}
                                            placeholder="Dear {guardian_name}, we are pleased to invite you..."
                                            className={inputClass}
                                        />
                                    </div>
                                </div>

                                <div className="mt-4 flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreatingTemplate(false)}
                                        className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                    >
                                        {t('common.cancel')}
                                    </button>
                                    <button
                                        type="submit"
                                        className="rounded-lg bg-accent-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-accent-700"
                                    >
                                        {t('common.save')}
                                    </button>
                                </div>
                            </form>
                        )}

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {templates.map((tpl) => (
                                <div
                                    key={tpl.id}
                                    className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
                                >
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <span
                                                className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${
                                                    tpl.type === 'sms'
                                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                                        : tpl.type === 'email'
                                                        ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300'
                                                        : 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                                                }`}
                                            >
                                                {tpl.type}
                                            </span>
                                            {tpl.is_system ? (
                                                <span className="text-[10px] font-medium text-slate-400">{t('communication.system_builtin')}</span>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => deleteTemplate(tpl.id)}
                                                    className="text-xs text-rose-500 hover:underline"
                                                >
                                                    {t('common.delete')}
                                                </button>
                                            )}
                                        </div>
                                        <h3 className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                                            {tpl.title}
                                        </h3>
                                        {tpl.subject && (
                                            <p className="mt-1 text-xs text-slate-500 italic dark:text-slate-400">
                                                Subj: {tpl.subject}
                                            </p>
                                        )}
                                        <p className="mt-2 line-clamp-4 whitespace-pre-line text-xs text-slate-600 dark:text-slate-300">
                                            {tpl.body}
                                        </p>
                                    </div>

                                    <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                applyTemplate(tpl.slug);
                                                setActiveTab('broadcast');
                                            }}
                                            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                                        >
                                            <AppIcon name="megaphone" className="h-3.5 w-3.5" />
                                            {t('communication.use_for_broadcast')}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* TAB 3: GATEWAYS & SMTP SETTINGS */}
                {activeTab === 'gateways' && (
                    <form onSubmit={submitGateways} className="space-y-6">
                        <div className="grid gap-6 lg:grid-cols-2">
                            {/* SMS Gateway Settings */}
                            <section className={sectionClass}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <AppIcon name="phone" className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                                            {t('communication.sms_gw_config')}
                                        </h2>
                                    </div>
                                    <label className="flex items-center gap-2 text-xs font-semibold">
                                        <input
                                            type="checkbox"
                                            checked={gwForm.sms_enabled}
                                            onChange={(e) => setGwForm((prev) => ({ ...prev, sms_enabled: e.target.checked }))}
                                            className="h-4 w-4 rounded border-slate-300 text-accent-600"
                                        />
                                        {t('communication.enable_sms')}
                                    </label>
                                </div>
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                    {t('communication.sms_gw_help')}
                                </p>

                                <div className="mt-5 space-y-4">
                                    <div>
                                        <label className={labelClass}>{t('communication.sms_provider')}</label>
                                        <select
                                            value={gwForm.sms_provider}
                                            onChange={(e) => setGwForm((prev) => ({ ...prev, sms_provider: e.target.value }))}
                                            className={inputClass}
                                        >
                                            <option value="generic_http">Generic HTTP POST / GET API</option>
                                            <option value="bulksmsbd">BulkSMS BD</option>
                                            <option value="greenweb">Greenweb SMS</option>
                                            <option value="twilio">Twilio</option>
                                            <option value="simulator">Development Simulator (Logs only)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className={labelClass}>{t('communication.api_url')}</label>
                                        <input
                                            type="text"
                                            value={gwForm.sms_api_url ?? ''}
                                            onChange={(e) => setGwForm((prev) => ({ ...prev, sms_api_url: e.target.value }))}
                                            placeholder="https://api.sms-provider.com/v2/send"
                                            className={inputClass}
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClass}>{t('communication.api_key')}</label>
                                        <input
                                            type="password"
                                            value={gwForm.sms_api_key ?? ''}
                                            onChange={(e) => setGwForm((prev) => ({ ...prev, sms_api_key: e.target.value }))}
                                            placeholder="••••••••••••••••"
                                            className={inputClass}
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClass}>{t('communication.sender_id')}</label>
                                        <input
                                            type="text"
                                            value={gwForm.sms_sender_id ?? ''}
                                            onChange={(e) => setGwForm((prev) => ({ ...prev, sms_sender_id: e.target.value }))}
                                            placeholder="e.g. DGMHS or approved sender name"
                                            className={inputClass}
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Email / SMTP Settings */}
                            <section className={sectionClass}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <AppIcon name="mail" className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                                        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                                            {t('communication.smtp_config')}
                                        </h2>
                                    </div>
                                    <label className="flex items-center gap-2 text-xs font-semibold">
                                        <input
                                            type="checkbox"
                                            checked={gwForm.email_enabled}
                                            onChange={(e) => setGwForm((prev) => ({ ...prev, email_enabled: e.target.checked }))}
                                            className="h-4 w-4 rounded border-slate-300 text-accent-600"
                                        />
                                        {t('communication.enable_email')}
                                    </label>
                                </div>
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                    {t('communication.smtp_help')}
                                </p>

                                <div className="mt-5 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelClass}>{t('communication.mailer_transport')}</label>
                                            <select
                                                value={gwForm.mail_mailer}
                                                onChange={(e) => setGwForm((prev) => ({ ...prev, mail_mailer: e.target.value }))}
                                                className={inputClass}
                                            >
                                                <option value="smtp">SMTP</option>
                                                <option value="mailgun">Mailgun</option>
                                                <option value="ses">Amazon SES</option>
                                                <option value="log">Local Log (Testing)</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className={labelClass}>{t('communication.smtp_host')}</label>
                                            <input
                                                type="text"
                                                value={gwForm.mail_host ?? ''}
                                                onChange={(e) => setGwForm((prev) => ({ ...prev, mail_host: e.target.value }))}
                                                placeholder="smtp.mailtrap.io"
                                                className={inputClass}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelClass}>{t('communication.smtp_port')}</label>
                                            <input
                                                type="number"
                                                value={gwForm.mail_port}
                                                onChange={(e) => setGwForm((prev) => ({ ...prev, mail_port: parseInt(e.target.value, 10) || 587 }))}
                                                className={inputClass}
                                            />
                                        </div>

                                        <div>
                                            <label className={labelClass}>{t('communication.encryption')}</label>
                                            <select
                                                value={gwForm.mail_encryption ?? 'tls'}
                                                onChange={(e) => setGwForm((prev) => ({ ...prev, mail_encryption: e.target.value }))}
                                                className={inputClass}
                                            >
                                                <option value="tls">TLS</option>
                                                <option value="ssl">SSL</option>
                                                <option value="null">None</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelClass}>{t('communication.username')}</label>
                                            <input
                                                type="text"
                                                value={gwForm.mail_username ?? ''}
                                                onChange={(e) => setGwForm((prev) => ({ ...prev, mail_username: e.target.value }))}
                                                placeholder="smtp-user"
                                                className={inputClass}
                                            />
                                        </div>

                                        <div>
                                            <label className={labelClass}>{t('auth.password')}</label>
                                            <input
                                                type="password"
                                                value={gwForm.mail_password ?? ''}
                                                onChange={(e) => setGwForm((prev) => ({ ...prev, mail_password: e.target.value }))}
                                                placeholder="••••••••"
                                                className={inputClass}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelClass}>{t('communication.from_email')}</label>
                                            <input
                                                type="email"
                                                value={gwForm.mail_from_address ?? ''}
                                                onChange={(e) => setGwForm((prev) => ({ ...prev, mail_from_address: e.target.value }))}
                                                placeholder="noreply@school.edu.bd"
                                                className={inputClass}
                                            />
                                        </div>

                                        <div>
                                            <label className={labelClass}>{t('communication.from_name')}</label>
                                            <input
                                                type="text"
                                                value={gwForm.mail_from_name ?? ''}
                                                onChange={(e) => setGwForm((prev) => ({ ...prev, mail_from_name: e.target.value }))}
                                                placeholder={school.name_en}
                                                className={inputClass}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={isSavingGw}
                                className="inline-flex items-center gap-2 rounded-lg bg-accent-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-700 disabled:opacity-50"
                            >
                                <AppIcon name="check" className="h-4 w-4" />
                                {isSavingGw ? t('communication.saving_gateways') : t('communication.save_gateways')}
                            </button>
                        </div>
                    </form>
                )}

                {/* TAB 4: DELIVERY LOGS & HISTORY */}
                {activeTab === 'logs' && (
                    <section className={sectionClass}>
                        <div className="flex items-center justify-between pb-4">
                            <div>
                                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                                    {t('communication.logs_title')}
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {t('communication.logs_subtitle')}
                                </p>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
                                        <th className="py-2.5 font-semibold">{t('communication.channel')}</th>
                                        <th className="py-2.5 font-semibold">{t('communication.recipient')}</th>
                                        <th className="py-2.5 font-semibold">{t('communication.audience_type')}</th>
                                        <th className="py-2.5 font-semibold">{t('communication.preview')}</th>
                                        <th className="py-2.5 font-semibold">{t('communication.sent_at')}</th>
                                        <th className="py-2.5 font-semibold">{t('common.status')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {logs.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-8 text-center text-slate-400">
                                                {t('communication.no_messages')}
                                            </td>
                                        </tr>
                                    ) : (
                                        logs.map((log) => (
                                            <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/40">
                                                <td className="py-3 font-semibold">
                                                    <span
                                                        className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                                                            log.channel === 'sms'
                                                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                                                : 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300'
                                                        }`}
                                                    >
                                                        {log.channel === 'sms' ? (
                                                            <AppIcon name="phone" className="h-3 w-3" />
                                                        ) : (
                                                            <AppIcon name="mail" className="h-3 w-3" />
                                                        )}
                                                        {log.channel === 'sms' ? t('communication.sms') : t('communication.email')}
                                                    </span>
                                                </td>
                                                <td className="py-3">
                                                    <div className="font-medium text-slate-800 dark:text-slate-200">
                                                        {log.recipient_to}
                                                    </div>
                                                    {log.recipient_name && (
                                                        <div className="text-[11px] text-slate-400">
                                                            {log.recipient_name}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-3 text-slate-500 uppercase font-mono text-[10px]">
                                                    {log.recipient_type}
                                                </td>
                                                <td className="py-3 max-w-xs">
                                                    {log.subject && (
                                                        <div className="font-medium text-slate-800 truncate dark:text-slate-200">
                                                            {log.subject}
                                                        </div>
                                                    )}
                                                    <p className="truncate text-slate-500 dark:text-slate-400">
                                                        {log.content}
                                                    </p>
                                                </td>
                                                <td className="py-3 text-slate-500 whitespace-nowrap">
                                                    {new Date(log.created_at).toLocaleString(locale === 'bn' ? 'bn-BD' : 'en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </td>
                                                <td className="py-3">
                                                    <span
                                                        className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                                                            log.status === 'sent'
                                                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                                                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                                                        }`}
                                                    >
                                                        {log.status === 'sent' ? t('communication.status_delivered') : t('communication.status_failed')}
                                                    </span>
                                                    {log.error_message && (
                                                        <div className="text-[10px] text-rose-500 max-w-[150px] truncate" title={log.error_message}>
                                                            {log.error_message}
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {/* MODAL: FULL BRANDED EMAIL PREVIEW */}
                {showEmailPreview && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
                        <div className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
                            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                    {t('communication.preview_modal_title')}
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setShowEmailPreview(false)}
                                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                                >
                                    <AppIcon name="close" className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950">
                                <div className="rounded-xl border border-slate-200 bg-white shadow-md dark:border-slate-800 dark:bg-slate-900">
                                    {/* Header */}
                                    <div className="border-b-2 border-indigo-600 p-6 text-center">
                                        {school.logo_url && (
                                            <img
                                                src={school.logo_url}
                                                alt="Logo"
                                                className="mx-auto h-12 max-w-[140px] object-contain"
                                            />
                                        )}
                                        <h2 className="mt-2 text-lg font-bold text-slate-900 dark:text-slate-100">
                                            {bi(school.name_en, school.name_bn)}
                                        </h2>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            EIIN: {formatNumber(school.eiin_number)} • {school.board_affiliation}
                                        </p>
                                    </div>

                                    {/* Subject */}
                                    <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-3 dark:border-slate-800 dark:bg-slate-950">
                                        <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                                            {subject || 'Subject: Notification'}
                                        </h4>
                                    </div>

                                    {/* Body */}
                                    <div className="p-6 text-sm leading-relaxed text-slate-700 whitespace-pre-line dark:text-slate-300">
                                        {message || 'Your email content will be rendered here with formatted layout and dynamic variables.'}
                                    </div>

                                    {/* Footer */}
                                    <div className="border-t border-slate-100 bg-slate-50/70 p-4 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-950">
                                        <p className="font-semibold text-slate-700 dark:text-slate-300">{bi(school.name_en, school.name_bn)}</p>
                                        <p className="mt-0.5">{school.address} • Tel: {school.phone}</p>
                                        <p className="mt-1 text-[11px] text-slate-400">
                                            © {formatNumber(new Date().getFullYear())} {bi(school.name_en, school.name_bn)}. {t('site.rights')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end border-t border-slate-200 px-6 py-3 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setShowEmailPreview(false)}
                                    className="rounded-lg bg-accent-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-accent-700"
                                >
                                    {t('common.close')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
