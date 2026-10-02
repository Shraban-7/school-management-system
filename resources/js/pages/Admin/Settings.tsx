import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import AppIcon from '@/components/AppIcon';
import { useSidebarStack } from '@/composables/useNavStack';
import type { SidebarConfig } from '@/types/sidebar';

type Field = {
    key: string;
    label: string;
    value: string | number | boolean;
    type: 'text' | 'email' | 'number' | 'toggle' | 'select';
    options?: string[];
};

export interface MandatorySchool {
    name_en: string | null;
    name_bn: string | null;
    eiin_number: number | string | null;
    board_affiliation: string | null;
    mpo_status: boolean;
    established_year: number | string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    logo_url: string | null;
}

interface AdminSettingsProps {
    groups?: { title: string; fields: Field[] }[];
    sidebar: SidebarConfig;
    school?: MandatorySchool;
}

export default function AdminSettings({ groups = [], sidebar, school }: AdminSettingsProps) {
    const sidebarStack = useSidebarStack();
    useEffect(() => {
        if (sidebar) {
            sidebarStack.set(sidebar);
        }
    }, [sidebar]);

    const page = usePage();
    const props = page.props as Record<string, unknown>;
    const flash = (props.flash as { message?: string | null; error?: string | null })?.message ?? null;

    const [activeTab, setActiveTab] = useState<'institution' | 'system' | 'hardware'>('institution');

    // Mandatory Institution Management Form state
    const [instForm, setInstForm] = useState({
        name_en: school?.name_en ?? '',
        name_bn: school?.name_bn ?? '',
        eiin_number: school?.eiin_number ?? '',
        board_affiliation: school?.board_affiliation ?? '',
        mpo_status: school?.mpo_status ?? false,
        established_year: school?.established_year ?? '',
        address: school?.address ?? '',
        phone: school?.phone ?? '',
        email: school?.email ?? '',
        website: school?.website ?? '',
        remove_logo: false,
    });

    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // System settings state
    const [sysValues, setSysValues] = useState<Record<string, string | number | boolean>>(() =>
        Object.fromEntries(
            groups.flatMap((group) =>
                group.fields.map((field) => [field.key, field.value]),
            ),
        ),
    );

    function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] ?? null;
        setLogoFile(file);
        if (file) {
            setLogoPreview(URL.createObjectURL(file));
            setInstForm((prev) => ({ ...prev, remove_logo: false }));
        } else {
            setLogoPreview(null);
        }
    }

    function submitInstitution(e: React.FormEvent) {
        e.preventDefault();
        setIsSaving(true);
        router.post(
            '/admin/settings',
            {
                _method: 'put',
                ...instForm,
                established_year: instForm.established_year || null,
                logo: logoFile,
            },
            {
                forceFormData: true,
                onError: (err) => {
                    setErrors(err);
                    setIsSaving(false);
                },
                onSuccess: () => {
                    setErrors({});
                    setLogoFile(null);
                    setLogoPreview(null);
                    setIsSaving(false);
                    setInstForm((prev) => ({
                        ...prev,
                        remove_logo: false,
                    }));
                },
            },
        );
    }

    const inputClass =
        'mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100';
    const labelClass = 'block text-sm font-medium text-slate-700 dark:text-slate-300';
    const sectionClass =
        'rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900';
    const sectionTitleClass = 'text-base font-semibold text-slate-900 dark:text-slate-100';
    const errorClass = 'mt-1 text-xs text-rose-500';

    return (
        <DashboardLayout>
            <Head title="Settings" />

            <div className="space-y-6">
                <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase dark:text-slate-400">
                            Management &amp; System
                        </p>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
                            Settings
                        </h1>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            Configure mandatory institutional identity for official management documents and system preferences.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/admin/settings/zkteco"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                        >
                            <AppIcon name="server" className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            ZKTeco Biometrics &amp; RFID
                        </Link>
                    </div>
                </header>

                {flash && (
                    <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200">
                        <AppIcon name="check" className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <span>{flash}</span>
                    </div>
                )}

                {/* Tab Navigation */}
                <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2 dark:border-slate-800">
                    <button
                        type="button"
                        onClick={() => setActiveTab('institution')}
                        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                            activeTab === 'institution'
                                ? 'bg-accent-600 text-white shadow-sm'
                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                        }`}
                    >
                        <AppIcon name="cog" className="h-4 w-4" />
                        Institution Profile (Mandatory)
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('system')}
                        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                            activeTab === 'system'
                                ? 'bg-accent-600 text-white shadow-sm'
                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                        }`}
                    >
                        <AppIcon name="settings" className="h-4 w-4" />
                        System Variables
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('hardware')}
                        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                            activeTab === 'hardware'
                                ? 'bg-accent-600 text-white shadow-sm'
                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                        }`}
                    >
                        <AppIcon name="server" className="h-4 w-4" />
                        Biometrics &amp; Hardware
                    </button>
                </div>

                {/* TAB 1: Mandatory Institution Profile */}
                {activeTab === 'institution' && (
                    <form onSubmit={submitInstitution} className="space-y-6">
                        <div className="rounded-lg border border-sky-200 bg-sky-50/70 p-4 text-xs text-sky-900 dark:border-sky-900/60 dark:bg-sky-950/30 dark:text-sky-200">
                            <span className="font-semibold uppercase tracking-wider">Mandatory Management Information:</span>{' '}
                            The details below are permanently printed on official student ID cards, monthly fee receipts, grade sheets, transcripts, and exam admit cards.
                        </div>

                        {/* Identity & Accreditation */}
                        <section className={sectionClass}>
                            <h2 className={sectionTitleClass}>Institutional Identity &amp; Accreditation</h2>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                Official registered details with the Ministry of Education and Education Board.
                            </p>

                            <div className="mt-5 grid gap-5 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="name_en" className={labelClass}>
                                        Institution Name (English) <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        id="name_en"
                                        type="text"
                                        required
                                        value={instForm.name_en}
                                        onChange={(e) => setInstForm((prev) => ({ ...prev, name_en: e.target.value }))}
                                        placeholder="e.g. Dhaka Muslim High School"
                                        className={`${inputClass} ${errors.name_en ? 'border-rose-500' : ''}`}
                                    />
                                    {errors.name_en && <p className={errorClass}>{errors.name_en}</p>}
                                </div>

                                <div>
                                    <label htmlFor="name_bn" className={labelClass}>
                                        Institution Name (Bangla) <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        id="name_bn"
                                        type="text"
                                        required
                                        value={instForm.name_bn}
                                        onChange={(e) => setInstForm((prev) => ({ ...prev, name_bn: e.target.value }))}
                                        placeholder="e.g. ঢাকা মুসলিম উচ্চ বিদ্যালয়"
                                        className={`${inputClass} ${errors.name_bn ? 'border-rose-500' : ''}`}
                                    />
                                    {errors.name_bn && <p className={errorClass}>{errors.name_bn}</p>}
                                </div>

                                <div>
                                    <label htmlFor="eiin_number" className={labelClass}>
                                        EIIN Number <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        id="eiin_number"
                                        type="number"
                                        required
                                        value={instForm.eiin_number}
                                        onChange={(e) => setInstForm((prev) => ({ ...prev, eiin_number: e.target.value }))}
                                        placeholder="e.g. 108201"
                                        className={`${inputClass} ${errors.eiin_number ? 'border-rose-500' : ''}`}
                                    />
                                    {errors.eiin_number && <p className={errorClass}>{errors.eiin_number}</p>}
                                </div>

                                <div>
                                    <label htmlFor="board_affiliation" className={labelClass}>
                                        Education Board Affiliation <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        id="board_affiliation"
                                        type="text"
                                        required
                                        value={instForm.board_affiliation}
                                        onChange={(e) => setInstForm((prev) => ({ ...prev, board_affiliation: e.target.value }))}
                                        placeholder="e.g. Dhaka, Rajshahi, Technical, Madrasah"
                                        className={`${inputClass} ${errors.board_affiliation ? 'border-rose-500' : ''}`}
                                    />
                                    {errors.board_affiliation && <p className={errorClass}>{errors.board_affiliation}</p>}
                                </div>

                                <div>
                                    <label htmlFor="established_year" className={labelClass}>
                                        Year Established
                                    </label>
                                    <input
                                        id="established_year"
                                        type="number"
                                        min={1800}
                                        max={2100}
                                        value={instForm.established_year}
                                        onChange={(e) => setInstForm((prev) => ({ ...prev, established_year: e.target.value }))}
                                        placeholder="e.g. 1985"
                                        className={`${inputClass} ${errors.established_year ? 'border-rose-500' : ''}`}
                                    />
                                    {errors.established_year && <p className={errorClass}>{errors.established_year}</p>}
                                </div>

                                <div className="flex items-center gap-3 pt-6">
                                    <input
                                        id="mpo_status"
                                        type="checkbox"
                                        checked={instForm.mpo_status}
                                        onChange={(e) => setInstForm((prev) => ({ ...prev, mpo_status: e.target.checked }))}
                                        className="h-4 w-4 rounded border-slate-300 text-accent-600 focus:ring-accent-500 dark:border-slate-700"
                                    />
                                    <div>
                                        <label htmlFor="mpo_status" className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                            MPO Enlisted Institution
                                        </label>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Check if the institution receives government monthly pay order (MPO) subvention.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Administrative Contact & Location */}
                        <section className={sectionClass}>
                            <h2 className={sectionTitleClass}>Administrative Contact &amp; Campus</h2>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                Official communication channels used for notices, reports, and parent communication.
                            </p>

                            <div className="mt-5 grid gap-5 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <label htmlFor="address" className={labelClass}>
                                        Campus / Institutional Address
                                    </label>
                                    <textarea
                                        id="address"
                                        rows={2}
                                        value={instForm.address}
                                        onChange={(e) => setInstForm((prev) => ({ ...prev, address: e.target.value }))}
                                        placeholder="Street, City/Upazila, District, Postal Code"
                                        className={`${inputClass} ${errors.address ? 'border-rose-500' : ''}`}
                                    />
                                    {errors.address && <p className={errorClass}>{errors.address}</p>}
                                </div>

                                <div>
                                    <label htmlFor="phone" className={labelClass}>
                                        Official Telephone / Mobile
                                    </label>
                                    <input
                                        id="phone"
                                        type="text"
                                        value={instForm.phone}
                                        onChange={(e) => setInstForm((prev) => ({ ...prev, phone: e.target.value }))}
                                        placeholder="+8801XXXXXXXXX"
                                        className={`${inputClass} ${errors.phone ? 'border-rose-500' : ''}`}
                                    />
                                    {errors.phone && <p className={errorClass}>{errors.phone}</p>}
                                </div>

                                <div>
                                    <label htmlFor="email" className={labelClass}>
                                        Official Email Address
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={instForm.email}
                                        onChange={(e) => setInstForm((prev) => ({ ...prev, email: e.target.value }))}
                                        placeholder="admin@school.edu.bd"
                                        className={`${inputClass} ${errors.email ? 'border-rose-500' : ''}`}
                                    />
                                    {errors.email && <p className={errorClass}>{errors.email}</p>}
                                </div>

                                <div className="sm:col-span-2">
                                    <label htmlFor="website" className={labelClass}>
                                        Official Website / Portal URL (Optional)
                                    </label>
                                    <input
                                        id="website"
                                        type="url"
                                        value={instForm.website}
                                        onChange={(e) => setInstForm((prev) => ({ ...prev, website: e.target.value }))}
                                        placeholder="https://school.edu.bd"
                                        className={`${inputClass} ${errors.website ? 'border-rose-500' : ''}`}
                                    />
                                    {errors.website && <p className={errorClass}>{errors.website}</p>}
                                </div>
                            </div>
                        </section>

                        {/* Institutional Logo */}
                        <section className={sectionClass}>
                            <h2 className={sectionTitleClass}>Institutional Logo &amp; Seal</h2>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                This official emblem appears on student ID cards, payment vouchers, marksheets, and report cards.
                            </p>

                            <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-start">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="flex h-24 w-24 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-2 shadow-inner dark:border-slate-700 dark:bg-slate-950">
                                        {logoPreview ? (
                                            <img
                                                src={logoPreview}
                                                alt="New logo preview"
                                                className="max-h-full max-w-full object-contain"
                                            />
                                        ) : school?.logo_url && !instForm.remove_logo ? (
                                            <img
                                                src={school.logo_url}
                                                alt="Current logo"
                                                className="max-h-full max-w-full object-contain"
                                            />
                                        ) : (
                                            <AppIcon name="cog" className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                                        )}
                                    </div>
                                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                        Current Logo
                                    </span>
                                </div>

                                <div className="flex-1 space-y-3">
                                    <div>
                                        <label htmlFor="logo_file" className={labelClass}>
                                            Upload New Logo Image
                                        </label>
                                        <input
                                            id="logo_file"
                                            type="file"
                                            accept="image/png,image/jpeg,image/webp,image/svg+xml"
                                            onChange={handleLogoChange}
                                            className="mt-1 block w-full text-xs text-slate-500 file:mr-3 file:rounded-md file:border-0 file:bg-accent-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-accent-700 hover:file:bg-accent-100 dark:file:bg-slate-800 dark:file:text-slate-200"
                                        />
                                        {errors.logo && <p className={errorClass}>{errors.logo}</p>}
                                    </div>

                                    {school?.logo_url && (
                                        <div className="flex items-center gap-2 pt-1">
                                            <input
                                                id="remove_logo"
                                                type="checkbox"
                                                checked={instForm.remove_logo}
                                                onChange={(e) => {
                                                    setInstForm((prev) => ({ ...prev, remove_logo: e.target.checked }));
                                                    if (e.target.checked) {
                                                        setLogoPreview(null);
                                                        setLogoFile(null);
                                                    }
                                                }}
                                                className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500 dark:border-slate-700"
                                            />
                                            <label htmlFor="remove_logo" className="text-xs text-rose-600 font-medium dark:text-rose-400">
                                                Remove existing institutional logo
                                            </label>
                                        </div>
                                    )}

                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Recommended: PNG or SVG with transparent background (square 300x300 px). Max size 2 MB.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="inline-flex items-center gap-2 rounded-lg bg-accent-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-700 disabled:opacity-50"
                            >
                                <AppIcon name="check" className="h-4 w-4" />
                                {isSaving ? 'Saving Changes...' : 'Save Institution Profile'}
                            </button>
                        </div>
                    </form>
                )}

                {/* TAB 2: System Variables */}
                {activeTab === 'system' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            {groups.map((group) => (
                                <section
                                    key={group.title}
                                    className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                                >
                                    <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                                        {group.title}
                                    </h2>
                                    <dl className="mt-4 space-y-4">
                                        {group.fields.map((field) => (
                                            <div
                                                key={field.key}
                                                className="flex items-center justify-between gap-4"
                                            >
                                                <label
                                                    htmlFor={`field-${field.key}`}
                                                    className="text-sm font-medium text-slate-700 dark:text-slate-200"
                                                >
                                                    {field.label}
                                                </label>
                                                <div className="max-w-xs flex-1">
                                                    {field.type === 'text' ||
                                                    field.type === 'email' ||
                                                    field.type === 'number' ? (
                                                        <input
                                                            id={`field-${field.key}`}
                                                            value={String(sysValues[field.key] ?? '')}
                                                            onChange={(e) =>
                                                                setSysValues((prev) => ({
                                                                    ...prev,
                                                                    [field.key]: e.target.value,
                                                                }))
                                                            }
                                                            type={field.type}
                                                            className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                                        />
                                                    ) : field.type === 'toggle' ? (
                                                        <button
                                                            type="button"
                                                            role="switch"
                                                            aria-checked={!!sysValues[field.key]}
                                                            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
                                                                sysValues[field.key]
                                                                    ? 'bg-accent-600'
                                                                    : 'bg-slate-200 dark:bg-slate-700'
                                                            }`}
                                                            onClick={() =>
                                                                setSysValues((prev) => ({
                                                                    ...prev,
                                                                    [field.key]: !prev[field.key],
                                                                }))
                                                            }
                                                        >
                                                            <span
                                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                                                                    sysValues[field.key]
                                                                        ? 'translate-x-6'
                                                                        : 'translate-x-1'
                                                                }`}
                                                            />
                                                        </button>
                                                    ) : null}
                                                </div>
                                            </div>
                                        ))}
                                    </dl>
                                </section>
                            ))}
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={() => alert('System parameters saved.')}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-accent-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-700"
                            >
                                <AppIcon name="check" className="h-4 w-4" />
                                Save System Defaults
                            </button>
                        </div>
                    </div>
                )}

                {/* TAB 3: Biometrics & Hardware */}
                {activeTab === 'hardware' && (
                    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-start gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                                    <AppIcon name="server" className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                                        ZKTeco Biometric Devices &amp; Attendance Hub
                                    </h2>
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                        Direct TCP/IP socket connection, USB punch log upload, and ADMS push server configuration.
                                    </p>
                                </div>
                            </div>

                            <Link
                                href="/admin/settings/zkteco"
                                className="inline-flex items-center gap-1.5 rounded-lg bg-accent-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-700"
                            >
                                <AppIcon name="cog" className="h-4 w-4" />
                                Manage ZKTeco Devices
                            </Link>
                        </div>

                        <div className="mt-6 grid gap-4 border-t border-slate-100 pt-6 sm:grid-cols-3 dark:border-slate-800">
                            <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                                <span className="text-xs font-medium text-slate-500 uppercase dark:text-slate-400">Connection Mode</span>
                                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                                    TCP/IP Socket + USB Import
                                </p>
                            </div>
                            <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                                <span className="text-xs font-medium text-slate-500 uppercase dark:text-slate-400">Supported Devices</span>
                                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                                    ZKTeco K40, IN01, UFace, F18 &amp; standard RFID
                                </p>
                            </div>
                            <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                                <span className="text-xs font-medium text-slate-500 uppercase dark:text-slate-400">Status</span>
                                <p className="mt-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                    Plug &amp; Play Ready
                                </p>
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </DashboardLayout>
    );
}
