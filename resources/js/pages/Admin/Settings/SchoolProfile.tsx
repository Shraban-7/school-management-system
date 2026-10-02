import React, { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import AppIcon from '@/components/AppIcon';
import RichTextEditor from '@/components/RichTextEditor';
import { useSidebarStack } from '@/composables/useNavStack';
import type { SidebarConfig } from '@/types/sidebar';

interface School {
    name_en: string | null;
    name_bn: string | null;
    eiin_number: string | null;
    board_affiliation: string | null;
    mpo_status: boolean;
    address: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    established_year: number | string | null;
    about_en: string | null;
    about_bn: string | null;
    headmaster_name_en: string | null;
    headmaster_name_bn: string | null;
    headmaster_speech: string | null;
    fee_notes: string | null;
    office_hours: string | null;
    hero_tagline: string | null;
    logo_url: string | null;
    headmaster_photo_url: string | null;
}

interface SchoolProfileProps {
    sidebar: SidebarConfig;
    school: School;
}

export default function SchoolProfile({ sidebar, school }: SchoolProfileProps) {
    const sidebarStack = useSidebarStack();
    useEffect(() => {
        if (sidebar) {
            sidebarStack.set(sidebar);
        }
    }, [sidebar]);

    const page = usePage();
    const props = page.props as Record<string, unknown>;
    const flash = (props.flash as { message?: string | null })?.message ?? null;

    const [form, setForm] = useState({
        name_en: school.name_en ?? '',
        name_bn: school.name_bn ?? '',
        eiin_number: school.eiin_number ?? '',
        board_affiliation: school.board_affiliation ?? '',
        mpo_status: school.mpo_status ?? false,
        address: school.address ?? '',
        phone: school.phone ?? '',
        email: school.email ?? '',
        website: school.website ?? '',
        established_year: school.established_year ?? '',
        about_en: school.about_en ?? '',
        about_bn: school.about_bn ?? '',
        headmaster_name_en: school.headmaster_name_en ?? '',
        headmaster_name_bn: school.headmaster_name_bn ?? '',
        headmaster_speech: school.headmaster_speech ?? '',
        fee_notes: school.fee_notes ?? '',
        office_hours: school.office_hours ?? '',
        hero_tagline: school.hero_tagline ?? '',
        remove_logo: false,
        remove_headmaster_photo: false,
    });

    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [headmasterPhotoFile, setHeadmasterPhotoFile] = useState<File | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    function submit(e: React.FormEvent) {
        e.preventDefault();
        router.post(
            '/admin/settings/school',
            {
                _method: 'put',
                ...form,
                established_year: form.established_year || null,
                logo: logoFile,
                headmaster_photo: headmasterPhotoFile,
            },
            {
                forceFormData: true,
                onError: (err) => {
                    setErrors(err);
                },
                onSuccess: () => {
                    setErrors({});
                    setLogoFile(null);
                    setHeadmasterPhotoFile(null);
                    setForm((prev) => ({
                        ...prev,
                        remove_logo: false,
                        remove_headmaster_photo: false,
                    }));
                },
            },
        );
    }

    const inputClass =
        'mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100';
    const labelClass =
        'block text-sm font-medium text-slate-700 dark:text-slate-300';
    const sectionClass =
        'rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900';
    const sectionTitleClass =
        'mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100';
    const errorClass = 'mt-1 text-xs text-rose-500';

    return (
        <DashboardLayout>
            <Head title="School Profile" />

            <div className="space-y-6">
                <header>
                    <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase dark:text-slate-400">
                        Settings
                    </p>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
                        School profile
                    </h1>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        Manage institutional identity, EIIN, board affiliation, and
                        administrative contact details.
                    </p>
                </header>

                {flash && (
                    <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
                        {flash}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-8">
                    {/* Identity */}
                    <section className={sectionClass}>
                        <h2 className={sectionTitleClass}>Identity</h2>

                        <div className="grid gap-6 sm:grid-cols-2">
                            <div>
                                <label htmlFor="name_en" className={labelClass}>
                                    Name (English) <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    id="name_en"
                                    value={form.name_en}
                                    onChange={(e) =>
                                        setForm((prev) => ({ ...prev, name_en: e.target.value }))
                                    }
                                    type="text"
                                    className={`${inputClass} ${
                                        errors.name_en ? 'border-rose-500' : ''
                                    }`}
                                />
                                {errors.name_en && (
                                    <p className={errorClass}>{errors.name_en}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="name_bn" className={labelClass}>
                                    Name (Bangla)
                                </label>
                                <input
                                    id="name_bn"
                                    value={form.name_bn}
                                    onChange={(e) =>
                                        setForm((prev) => ({ ...prev, name_bn: e.target.value }))
                                    }
                                    type="text"
                                    className={`${inputClass} ${
                                        errors.name_bn ? 'border-rose-500' : ''
                                    }`}
                                />
                                {errors.name_bn && (
                                    <p className={errorClass}>{errors.name_bn}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="eiin_number" className={labelClass}>
                                    EIIN number
                                </label>
                                <input
                                    id="eiin_number"
                                    value={form.eiin_number}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            eiin_number: e.target.value,
                                        }))
                                    }
                                    type="text"
                                    className={`${inputClass} ${
                                        errors.eiin_number ? 'border-rose-500' : ''
                                    }`}
                                />
                                {errors.eiin_number && (
                                    <p className={errorClass}>{errors.eiin_number}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="board_affiliation" className={labelClass}>
                                    Board affiliation
                                </label>
                                <input
                                    id="board_affiliation"
                                    value={form.board_affiliation}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            board_affiliation: e.target.value,
                                        }))
                                    }
                                    type="text"
                                    className={`${inputClass} ${
                                        errors.board_affiliation ? 'border-rose-500' : ''
                                    }`}
                                />
                                {errors.board_affiliation && (
                                    <p className={errorClass}>{errors.board_affiliation}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="established_year" className={labelClass}>
                                    Established year
                                </label>
                                <input
                                    id="established_year"
                                    value={form.established_year}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            established_year: e.target.value,
                                        }))
                                    }
                                    type="number"
                                    className={`${inputClass} ${
                                        errors.established_year ? 'border-rose-500' : ''
                                    }`}
                                />
                                {errors.established_year && (
                                    <p className={errorClass}>{errors.established_year}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="hero_tagline" className={labelClass}>
                                    Hero tagline
                                </label>
                                <input
                                    id="hero_tagline"
                                    value={form.hero_tagline}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            hero_tagline: e.target.value,
                                        }))
                                    }
                                    type="text"
                                    className={`${inputClass} ${
                                        errors.hero_tagline ? 'border-rose-500' : ''
                                    }`}
                                />
                                {errors.hero_tagline && (
                                    <p className={errorClass}>{errors.hero_tagline}</p>
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    id="mpo_status"
                                    checked={form.mpo_status}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            mpo_status: e.target.checked,
                                        }))
                                    }
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-slate-300 text-accent-600 focus:ring-accent-500 dark:border-slate-600"
                                />
                                <label htmlFor="mpo_status" className={labelClass}>
                                    MPO enlisted
                                </label>
                            </div>

                            <div className="sm:col-span-2">
                                <label htmlFor="logo" className={labelClass}>
                                    Logo
                                </label>
                                <div className="mt-2 flex items-start gap-4">
                                    {school.logo_url && (
                                        <img
                                            src={school.logo_url}
                                            alt="Current logo"
                                            className="h-16 w-16 rounded-md border border-slate-200 object-contain dark:border-slate-700"
                                        />
                                    )}
                                    <div className="flex-1 space-y-2">
                                        <input
                                            id="logo"
                                            type="file"
                                            accept="image/*"
                                            className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200 dark:text-slate-400 dark:file:bg-slate-800 dark:file:text-slate-300 dark:hover:file:bg-slate-700"
                                            onChange={(e) =>
                                                setLogoFile(e.target.files?.[0] ?? null)
                                            }
                                        />
                                        {errors.logo && (
                                            <p className={errorClass}>{errors.logo}</p>
                                        )}
                                        {school.logo_url && (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    id="remove_logo"
                                                    checked={form.remove_logo}
                                                    onChange={(e) =>
                                                        setForm((prev) => ({
                                                            ...prev,
                                                            remove_logo: e.target.checked,
                                                        }))
                                                    }
                                                    type="checkbox"
                                                    className="h-4 w-4 rounded border-slate-300 text-accent-600 focus:ring-accent-500 dark:border-slate-600"
                                                />
                                                <label
                                                    htmlFor="remove_logo"
                                                    className="text-sm text-slate-600 dark:text-slate-400"
                                                >
                                                    Remove current logo
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Contact */}
                    <section className={sectionClass}>
                        <h2 className={sectionTitleClass}>Contact</h2>

                        <div className="grid gap-6 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <label htmlFor="address" className={labelClass}>
                                    Address
                                </label>
                                <textarea
                                    id="address"
                                    value={form.address}
                                    onChange={(e) =>
                                        setForm((prev) => ({ ...prev, address: e.target.value }))
                                    }
                                    rows={2}
                                    className={`${inputClass} ${
                                        errors.address ? 'border-rose-500' : ''
                                    }`}
                                />
                                {errors.address && (
                                    <p className={errorClass}>{errors.address}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="phone" className={labelClass}>
                                    Phone
                                </label>
                                <input
                                    id="phone"
                                    value={form.phone}
                                    onChange={(e) =>
                                        setForm((prev) => ({ ...prev, phone: e.target.value }))
                                    }
                                    type="text"
                                    className={`${inputClass} ${
                                        errors.phone ? 'border-rose-500' : ''
                                    }`}
                                />
                                {errors.phone && (
                                    <p className={errorClass}>{errors.phone}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="email" className={labelClass}>
                                    Email
                                </label>
                                <input
                                    id="email"
                                    value={form.email}
                                    onChange={(e) =>
                                        setForm((prev) => ({ ...prev, email: e.target.value }))
                                    }
                                    type="email"
                                    className={`${inputClass} ${
                                        errors.email ? 'border-rose-500' : ''
                                    }`}
                                />
                                {errors.email && (
                                    <p className={errorClass}>{errors.email}</p>
                                )}
                            </div>

                            <div className="sm:col-span-2">
                                <label htmlFor="website" className={labelClass}>
                                    Website
                                </label>
                                <input
                                    id="website"
                                    value={form.website}
                                    onChange={(e) =>
                                        setForm((prev) => ({ ...prev, website: e.target.value }))
                                    }
                                    type="url"
                                    placeholder="https://example.edu.bd"
                                    className={`${inputClass} ${
                                        errors.website ? 'border-rose-500' : ''
                                    }`}
                                />
                                {errors.website && (
                                    <p className={errorClass}>{errors.website}</p>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* About */}
                    <section className={sectionClass}>
                        <h2 className={sectionTitleClass}>About</h2>

                        <div className="grid gap-6">
                            <div>
                                <label htmlFor="about_en" className={labelClass}>
                                    About (English)
                                </label>
                                <RichTextEditor
                                    value={form.about_en}
                                    onChange={(val) =>
                                        setForm((prev) => ({ ...prev, about_en: val }))
                                    }
                                    invalid={Boolean(errors.about_en)}
                                />
                                {errors.about_en && (
                                    <p className={errorClass}>{errors.about_en}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="about_bn" className={labelClass}>
                                    About (Bangla)
                                </label>
                                <RichTextEditor
                                    value={form.about_bn}
                                    onChange={(val) =>
                                        setForm((prev) => ({ ...prev, about_bn: val }))
                                    }
                                    invalid={Boolean(errors.about_bn)}
                                />
                                {errors.about_bn && (
                                    <p className={errorClass}>{errors.about_bn}</p>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Headmaster */}
                    <section className={sectionClass}>
                        <h2 className={sectionTitleClass}>Headmaster</h2>

                        <div className="grid gap-6 sm:grid-cols-2">
                            <div>
                                <label htmlFor="headmaster_name_en" className={labelClass}>
                                    Name (English)
                                </label>
                                <input
                                    id="headmaster_name_en"
                                    value={form.headmaster_name_en}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            headmaster_name_en: e.target.value,
                                        }))
                                    }
                                    type="text"
                                    className={`${inputClass} ${
                                        errors.headmaster_name_en ? 'border-rose-500' : ''
                                    }`}
                                />
                                {errors.headmaster_name_en && (
                                    <p className={errorClass}>{errors.headmaster_name_en}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="headmaster_name_bn" className={labelClass}>
                                    Name (Bangla)
                                </label>
                                <input
                                    id="headmaster_name_bn"
                                    value={form.headmaster_name_bn}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            headmaster_name_bn: e.target.value,
                                        }))
                                    }
                                    type="text"
                                    className={`${inputClass} ${
                                        errors.headmaster_name_bn ? 'border-rose-500' : ''
                                    }`}
                                />
                                {errors.headmaster_name_bn && (
                                    <p className={errorClass}>{errors.headmaster_name_bn}</p>
                                )}
                            </div>

                            <div className="sm:col-span-2">
                                <label htmlFor="headmaster_speech" className={labelClass}>
                                    Speech
                                </label>
                                <RichTextEditor
                                    value={form.headmaster_speech}
                                    onChange={(val) =>
                                        setForm((prev) => ({ ...prev, headmaster_speech: val }))
                                    }
                                    invalid={Boolean(errors.headmaster_speech)}
                                />
                                {errors.headmaster_speech && (
                                    <p className={errorClass}>{errors.headmaster_speech}</p>
                                )}
                            </div>

                            <div className="sm:col-span-2">
                                <label htmlFor="headmaster_photo" className={labelClass}>
                                    Photo
                                </label>
                                <div className="mt-2 flex items-start gap-4">
                                    {school.headmaster_photo_url && (
                                        <img
                                            src={school.headmaster_photo_url}
                                            alt="Current headmaster photo"
                                            className="h-16 w-16 rounded-md border border-slate-200 object-cover dark:border-slate-700"
                                        />
                                    )}
                                    <div className="flex-1 space-y-2">
                                        <input
                                            id="headmaster_photo"
                                            type="file"
                                            accept="image/*"
                                            className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200 dark:text-slate-400 dark:file:bg-slate-800 dark:file:text-slate-300 dark:hover:file:bg-slate-700"
                                            onChange={(e) =>
                                                setHeadmasterPhotoFile(
                                                    e.target.files?.[0] ?? null,
                                                )
                                            }
                                        />
                                        {errors.headmaster_photo && (
                                            <p className={errorClass}>
                                                {errors.headmaster_photo}
                                            </p>
                                        )}
                                        {school.headmaster_photo_url && (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    id="remove_headmaster_photo"
                                                    checked={form.remove_headmaster_photo}
                                                    onChange={(e) =>
                                                        setForm((prev) => ({
                                                            ...prev,
                                                            remove_headmaster_photo:
                                                                e.target.checked,
                                                        }))
                                                    }
                                                    type="checkbox"
                                                    className="h-4 w-4 rounded border-slate-300 text-accent-600 focus:ring-accent-500 dark:border-slate-600"
                                                />
                                                <label
                                                    htmlFor="remove_headmaster_photo"
                                                    className="text-sm text-slate-600 dark:text-slate-400"
                                                >
                                                    Remove current photo
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Campus & Operations */}
                    <section className={sectionClass}>
                        <h2 className={sectionTitleClass}>Campus &amp; Office Hours</h2>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="office_hours" className={labelClass}>
                                    Office hours
                                </label>
                                <input
                                    id="office_hours"
                                    value={form.office_hours}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            office_hours: e.target.value,
                                        }))
                                    }
                                    type="text"
                                    placeholder="e.g. Sunday to Thursday, 9:00 AM – 4:00 PM"
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label htmlFor="fee_notes" className={labelClass}>
                                    Fee payment instructions &amp; notes
                                </label>
                                <RichTextEditor
                                    value={form.fee_notes}
                                    onChange={(val) =>
                                        setForm((prev) => ({ ...prev, fee_notes: val }))
                                    }
                                    invalid={Boolean(errors.fee_notes)}
                                />
                                {errors.fee_notes && (
                                    <p className={errorClass}>{errors.fee_notes}</p>
                                )}
                            </div>
                        </div>
                    </section>

                    <div className="flex items-center gap-3">
                        <button
                            type="submit"
                            className="inline-flex items-center gap-1.5 rounded-md bg-accent-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-700"
                        >
                            <AppIcon name="check" className="h-4 w-4" />
                            Save profile
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
