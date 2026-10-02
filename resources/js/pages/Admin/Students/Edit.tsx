import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import AppIcon from '@/components/AppIcon';
import { useSidebarStack } from '@/composables/useNavStack';
import type { SidebarConfig } from '@/types/sidebar';

interface Props {
    student: {
        id: number;
        name_en: string;
        name_bn: string;
        date_of_birth: string;
        gender: string;
        blood_group: string;
        religion: string;
        nationality: string;
        birth_certificate_number: string;
        institution_id: number;
        session_id: number;
        class_id: number;
        roll_number: string;
        academic_year: string;
        guardian_name: string;
        guardian_relation: string;
        guardian_phone: string;
        guardian_address: string;
        father_name_en: string;
        father_name_bn: string;
        father_nid: string;
        father_phone: string;
        father_occupation: string;
        mother_name_en: string;
        mother_name_bn: string;
        mother_nid: string;
        mother_phone: string;
        mother_occupation: string;
        present_address: string;
        permanent_address: string;
        previous_school: string;
        previous_class: string;
        previous_gpa: number | null;
        is_active: boolean;
    };
    sidebar: SidebarConfig;
    sessions: { value: string | number; label: string }[];
    classes: { value: string | number; label: string }[];
    genders: string[];
    bloodGroups: string[];
    religions: string[];
}

export default function StudentsEdit({
    student,
    sidebar,
    sessions,
    classes,
    genders,
    bloodGroups,
    religions,
}: Props) {
    const sidebarStack = useSidebarStack();
    useEffect(() => {
        sidebarStack.set(sidebar);
    }, [sidebar]);

    const page = usePage<any>();
    const flash = page.props.flash?.message ?? null;

    const [form, setForm] = useState({
        name_en: student.name_en,
        name_bn: student.name_bn,
        date_of_birth: student.date_of_birth,
        gender: student.gender,
        blood_group: student.blood_group,
        religion: student.religion,
        nationality: student.nationality,
        birth_certificate_number: student.birth_certificate_number,
        session_id: student.session_id,
        class_id: student.class_id,
        roll_number: student.roll_number,
        academic_year: student.academic_year,
        guardian_name: student.guardian_name,
        guardian_relation: student.guardian_relation,
        guardian_phone: student.guardian_phone,
        guardian_address: student.guardian_address,
        father_name_en: student.father_name_en,
        father_name_bn: student.father_name_bn,
        father_nid: student.father_nid,
        father_phone: student.father_phone,
        father_occupation: student.father_occupation,
        mother_name_en: student.mother_name_en,
        mother_name_bn: student.mother_name_bn,
        mother_nid: student.mother_nid,
        mother_phone: student.mother_phone,
        mother_occupation: student.mother_occupation,
        present_address: student.present_address,
        permanent_address: student.permanent_address,
        previous_school: student.previous_school,
        previous_class: student.previous_class,
        previous_gpa: student.previous_gpa ?? '',
        is_active: student.is_active,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    function updateField(key: string, value: any) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        router.put(
            `/admin/students/${student.id}`,
            {
                name_en: form.name_en,
                name_bn: form.name_bn,
                date_of_birth: form.date_of_birth,
                gender: form.gender,
                blood_group: form.blood_group,
                religion: form.religion,
                nationality: form.nationality,
                birth_certificate_number: form.birth_certificate_number,
                session_id: Number(form.session_id),
                class_id: Number(form.class_id),
                roll_number: form.roll_number,
                academic_year: form.academic_year,
                guardian_name: form.guardian_name,
                guardian_relation: form.guardian_relation,
                guardian_phone: form.guardian_phone,
                guardian_address: form.guardian_address,
                father_name_en: form.father_name_en,
                father_name_bn: form.father_name_bn,
                father_nid: form.father_nid,
                father_phone: form.father_phone,
                father_occupation: form.father_occupation,
                mother_name_en: form.mother_name_en,
                mother_name_bn: form.mother_name_bn,
                mother_nid: form.mother_nid,
                mother_phone: form.mother_phone,
                mother_occupation: form.mother_occupation,
                present_address: form.present_address,
                permanent_address: form.permanent_address,
                previous_school: form.previous_school,
                previous_class: form.previous_class,
                previous_gpa: form.previous_gpa ? Number(form.previous_gpa) : null,
                is_active: form.is_active,
            },
            {
                onError: (err) => {
                    setErrors(err);
                },
            },
        );
    }

    return (
        <DashboardLayout>
            <Head title="Edit Student" />

            <div className="space-y-6">
                <header className="flex items-center gap-4">
                    <Link
                        href="/admin/students"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                    >
                        <AppIcon name="arrow-left" className="h-5 w-5" />
                    </Link>
                    <div>
                        <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase dark:text-slate-400">
                            Management
                        </p>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
                            Edit student
                        </h1>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            {student.name_en}
                        </p>
                    </div>
                </header>

                {flash && (
                    <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
                        {flash}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-8">
                    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
                            Personal Information
                        </h2>

                        <div className="grid gap-6 sm:grid-cols-2">
                            <div>
                                <label
                                    htmlFor="name_en"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Name (English) <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    id="name_en"
                                    value={form.name_en}
                                    onChange={(e) => updateField('name_en', e.target.value)}
                                    type="text"
                                    className={`mt-1 block w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:bg-slate-950 dark:text-slate-100 ${
                                        errors.name_en
                                            ? 'border-rose-500 dark:border-rose-500'
                                            : 'border-slate-200 dark:border-slate-700'
                                    }`}
                                />
                                {errors.name_en && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {errors.name_en}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="name_bn"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Name (Bangla)
                                </label>
                                <input
                                    id="name_bn"
                                    value={form.name_bn}
                                    onChange={(e) => updateField('name_bn', e.target.value)}
                                    type="text"
                                    className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                />
                                {errors.name_bn && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {errors.name_bn}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="date_of_birth"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Date of birth <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    id="date_of_birth"
                                    value={form.date_of_birth}
                                    onChange={(e) =>
                                        updateField('date_of_birth', e.target.value)
                                    }
                                    type="date"
                                    className={`mt-1 block w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:bg-slate-950 dark:text-slate-100 ${
                                        errors.date_of_birth
                                            ? 'border-rose-500 dark:border-rose-500'
                                            : 'border-slate-200 dark:border-slate-700'
                                    }`}
                                />
                                {errors.date_of_birth && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {errors.date_of_birth}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="gender"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Gender <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    id="gender"
                                    value={form.gender}
                                    onChange={(e) => updateField('gender', e.target.value)}
                                    className={`mt-1 block w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:bg-slate-950 dark:text-slate-100 ${
                                        errors.gender
                                            ? 'border-rose-500 dark:border-rose-500'
                                            : 'border-slate-200 dark:border-slate-700'
                                    }`}
                                >
                                    <option value="" disabled>
                                        Select gender
                                    </option>
                                    {genders.map((g) => (
                                        <option key={g} value={g}>
                                            {g}
                                        </option>
                                    ))}
                                </select>
                                {errors.gender && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {errors.gender}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="blood_group"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Blood group
                                </label>
                                <select
                                    id="blood_group"
                                    value={form.blood_group}
                                    onChange={(e) =>
                                        updateField('blood_group', e.target.value)
                                    }
                                    className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                >
                                    <option value="" disabled>
                                        Select blood group
                                    </option>
                                    {bloodGroups.map((bg) => (
                                        <option key={bg} value={bg}>
                                            {bg}
                                        </option>
                                    ))}
                                </select>
                                {errors.blood_group && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {errors.blood_group}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="religion"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Religion
                                </label>
                                <select
                                    id="religion"
                                    value={form.religion}
                                    onChange={(e) => updateField('religion', e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                >
                                    <option value="" disabled>
                                        Select religion
                                    </option>
                                    {religions.map((r) => (
                                        <option key={r} value={r}>
                                            {r}
                                        </option>
                                    ))}
                                </select>
                                {errors.religion && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {errors.religion}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="nationality"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Nationality
                                </label>
                                <input
                                    id="nationality"
                                    value={form.nationality}
                                    onChange={(e) =>
                                        updateField('nationality', e.target.value)
                                    }
                                    type="text"
                                    className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                />
                                {errors.nationality && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {errors.nationality}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="birth_certificate_number"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Birth certificate number
                                </label>
                                <input
                                    id="birth_certificate_number"
                                    value={form.birth_certificate_number}
                                    onChange={(e) =>
                                        updateField(
                                            'birth_certificate_number',
                                            e.target.value,
                                        )
                                    }
                                    type="text"
                                    className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                />
                                {errors.birth_certificate_number && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {errors.birth_certificate_number}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="session_id"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Session <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    id="session_id"
                                    value={form.session_id}
                                    onChange={(e) =>
                                        updateField('session_id', e.target.value)
                                    }
                                    className={`mt-1 block w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:bg-slate-950 dark:text-slate-100 ${
                                        errors.session_id
                                            ? 'border-rose-500 dark:border-rose-500'
                                            : 'border-slate-200 dark:border-slate-700'
                                    }`}
                                >
                                    <option value="" disabled>
                                        Select session
                                    </option>
                                    {sessions.map((s) => (
                                        <option key={s.value} value={s.value}>
                                            {s.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.session_id && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {errors.session_id}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="class_id"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Class <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    id="class_id"
                                    value={form.class_id}
                                    onChange={(e) =>
                                        updateField('class_id', e.target.value)
                                    }
                                    className={`mt-1 block w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:bg-slate-950 dark:text-slate-100 ${
                                        errors.class_id
                                            ? 'border-rose-500 dark:border-rose-500'
                                            : 'border-slate-200 dark:border-slate-700'
                                    }`}
                                >
                                    <option value="" disabled>
                                        Select class
                                    </option>
                                    {classes.map((c) => (
                                        <option key={c.value} value={c.value}>
                                            {c.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.class_id && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {errors.class_id}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="roll_number"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Roll number
                                </label>
                                <input
                                    id="roll_number"
                                    value={form.roll_number}
                                    onChange={(e) =>
                                        updateField('roll_number', e.target.value)
                                    }
                                    type="text"
                                    className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                />
                                {errors.roll_number && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {errors.roll_number}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="academic_year"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Academic year
                                </label>
                                <input
                                    id="academic_year"
                                    value={form.academic_year}
                                    onChange={(e) =>
                                        updateField('academic_year', e.target.value)
                                    }
                                    type="text"
                                    className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                />
                                {errors.academic_year && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {errors.academic_year}
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>

                    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
                            Parent/Guardian Information
                        </h2>

                        <div className="grid gap-6 sm:grid-cols-2">
                            <div>
                                <label
                                    htmlFor="guardian_name"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Guardian name
                                </label>
                                <input
                                    id="guardian_name"
                                    value={form.guardian_name}
                                    onChange={(e) =>
                                        updateField('guardian_name', e.target.value)
                                    }
                                    type="text"
                                    className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                />
                                {errors.guardian_name && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {errors.guardian_name}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="guardian_relation"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Guardian relation
                                </label>
                                <input
                                    id="guardian_relation"
                                    value={form.guardian_relation}
                                    onChange={(e) =>
                                        updateField('guardian_relation', e.target.value)
                                    }
                                    type="text"
                                    className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                />
                                {errors.guardian_relation && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {errors.guardian_relation}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="guardian_phone"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Guardian phone
                                </label>
                                <input
                                    id="guardian_phone"
                                    value={form.guardian_phone}
                                    onChange={(e) =>
                                        updateField('guardian_phone', e.target.value)
                                    }
                                    type="text"
                                    className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                />
                                {errors.guardian_phone && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {errors.guardian_phone}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="guardian_address"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Guardian address
                                </label>
                                <input
                                    id="guardian_address"
                                    value={form.guardian_address}
                                    onChange={(e) =>
                                        updateField('guardian_address', e.target.value)
                                    }
                                    type="text"
                                    className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                />
                                {errors.guardian_address && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {errors.guardian_address}
                                    </p>
                                )}
                            </div>
                        </div>

                        <hr className="my-6 border-slate-200 dark:border-slate-700" />

                        <h3 className="mb-4 text-base font-semibold text-slate-800 dark:text-slate-200">
                            Father's information
                        </h3>

                        <div className="grid gap-6 sm:grid-cols-2">
                            <div>
                                <label
                                    htmlFor="father_name_en"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Father's name (English)
                                </label>
                                <input
                                    id="father_name_en"
                                    value={form.father_name_en}
                                    onChange={(e) =>
                                        updateField('father_name_en', e.target.value)
                                    }
                                    type="text"
                                    className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                />
                                {errors.father_name_en && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {errors.father_name_en}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="father_name_bn"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Father's name (Bangla)
                                </label>
                                <input
                                    id="father_name_bn"
                                    value={form.father_name_bn}
                                    onChange={(e) =>
                                        updateField('father_name_bn', e.target.value)
                                    }
                                    type="text"
                                    className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                />
                                {errors.father_name_bn && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {errors.father_name_bn}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="father_nid"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Father's NID
                                </label>
                                <input
                                    id="father_nid"
                                    value={form.father_nid}
                                    onChange={(e) =>
                                        updateField('father_nid', e.target.value)
                                    }
                                    type="text"
                                    className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                />
                                {errors.father_nid && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {errors.father_nid}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="father_phone"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Father's phone
                                </label>
                                <input
                                    id="father_phone"
                                    value={form.father_phone}
                                    onChange={(e) =>
                                        updateField('father_phone', e.target.value)
                                    }
                                    type="text"
                                    className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                />
                                {errors.father_phone && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {errors.father_phone}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="father_occupation"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Father's occupation
                                </label>
                                <input
                                    id="father_occupation"
                                    value={form.father_occupation}
                                    onChange={(e) =>
                                        updateField('father_occupation', e.target.value)
                                    }
                                    type="text"
                                    className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                />
                                {errors.father_occupation && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {errors.father_occupation}
                                    </p>
                                )}
                            </div>
                        </div>

                        <hr className="my-6 border-slate-200 dark:border-slate-700" />

                        <h3 className="mb-4 text-base font-semibold text-slate-800 dark:text-slate-200">
                            Mother's information
                        </h3>

                        <div className="grid gap-6 sm:grid-cols-2">
                            <div>
                                <label
                                    htmlFor="mother_name_en"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Mother's name (English)
                                </label>
                                <input
                                    id="mother_name_en"
                                    value={form.mother_name_en}
                                    onChange={(e) =>
                                        updateField('mother_name_en', e.target.value)
                                    }
                                    type="text"
                                    className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                />
                                {errors.mother_name_en && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {errors.mother_name_en}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="mother_name_bn"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Mother's name (Bangla)
                                </label>
                                <input
                                    id="mother_name_bn"
                                    value={form.mother_name_bn}
                                    onChange={(e) =>
                                        updateField('mother_name_bn', e.target.value)
                                    }
                                    type="text"
                                    className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                />
                                {errors.mother_name_bn && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {errors.mother_name_bn}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="mother_nid"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Mother's NID
                                </label>
                                <input
                                    id="mother_nid"
                                    value={form.mother_nid}
                                    onChange={(e) =>
                                        updateField('mother_nid', e.target.value)
                                    }
                                    type="text"
                                    className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                />
                                {errors.mother_nid && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {errors.mother_nid}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="mother_phone"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Mother's phone
                                </label>
                                <input
                                    id="mother_phone"
                                    value={form.mother_phone}
                                    onChange={(e) =>
                                        updateField('mother_phone', e.target.value)
                                    }
                                    type="text"
                                    className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                />
                                {errors.mother_phone && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {errors.mother_phone}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="mother_occupation"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Mother's occupation
                                </label>
                                <input
                                    id="mother_occupation"
                                    value={form.mother_occupation}
                                    onChange={(e) =>
                                        updateField('mother_occupation', e.target.value)
                                    }
                                    type="text"
                                    className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                />
                                {errors.mother_occupation && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {errors.mother_occupation}
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>

                    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
                            Address
                        </h2>

                        <div className="grid gap-6 sm:grid-cols-2">
                            <div>
                                <label
                                    htmlFor="present_address"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Present address
                                </label>
                                <textarea
                                    id="present_address"
                                    value={form.present_address}
                                    onChange={(e) =>
                                        updateField('present_address', e.target.value)
                                    }
                                    rows={3}
                                    className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                />
                                {errors.present_address && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {errors.present_address}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="permanent_address"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Permanent address
                                </label>
                                <textarea
                                    id="permanent_address"
                                    value={form.permanent_address}
                                    onChange={(e) =>
                                        updateField('permanent_address', e.target.value)
                                    }
                                    rows={3}
                                    className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                />
                                {errors.permanent_address && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {errors.permanent_address}
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>

                    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
                            Previous Education
                        </h2>

                        <div className="grid gap-6 sm:grid-cols-2">
                            <div>
                                <label
                                    htmlFor="previous_school"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Previous school
                                </label>
                                <input
                                    id="previous_school"
                                    value={form.previous_school}
                                    onChange={(e) =>
                                        updateField('previous_school', e.target.value)
                                    }
                                    type="text"
                                    className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                />
                                {errors.previous_school && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {errors.previous_school}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="previous_class"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Previous class
                                </label>
                                <input
                                    id="previous_class"
                                    value={form.previous_class}
                                    onChange={(e) =>
                                        updateField('previous_class', e.target.value)
                                    }
                                    type="text"
                                    className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                />
                                {errors.previous_class && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {errors.previous_class}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="previous_gpa"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Previous GPA
                                </label>
                                <input
                                    id="previous_gpa"
                                    value={form.previous_gpa}
                                    onChange={(e) =>
                                        updateField('previous_gpa', e.target.value)
                                    }
                                    type="number"
                                    step="0.01"
                                    className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                />
                                {errors.previous_gpa && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {errors.previous_gpa}
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>

                    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center gap-3">
                            <input
                                id="is_active"
                                checked={form.is_active}
                                onChange={(e) => updateField('is_active', e.target.checked)}
                                type="checkbox"
                                className="h-4 w-4 rounded border-slate-300 text-accent-600 focus:ring-accent-500 dark:border-slate-600"
                            />
                            <label
                                htmlFor="is_active"
                                className="text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Active student
                            </label>
                        </div>
                    </section>

                    <div className="flex items-center gap-3">
                        <button
                            type="submit"
                            className="inline-flex items-center gap-1.5 rounded-md bg-accent-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-700"
                        >
                            <AppIcon name="check" className="h-4 w-4" />
                            Save changes
                        </button>
                        <Link
                            href="/admin/students"
                            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
