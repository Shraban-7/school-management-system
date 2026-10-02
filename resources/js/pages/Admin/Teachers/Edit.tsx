import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import AppIcon from '@/components/AppIcon';
import { useSidebarStack } from '@/composables/useNavStack';
import type { SidebarConfig } from '@/types/sidebar';

interface Props {
    teacher: {
        id: number;
        institution_id: number;
        name_en: string;
        name_bn: string;
        gender: string;
        designation: string;
        date_of_birth: string | null;
        religion: string;
        mobile: string;
        email: string;
        qualification: string;
        subject_specialization: string;
        father_name: string;
        mother_name: string;
        nid_number: string;
        address_present: string;
        address_permanent: string;
        joining_date: string | null;
        is_active: boolean;
    };
    sidebar: SidebarConfig;
    genders: string[];
    designations: string[];
}

export default function TeachersEdit({
    teacher,
    sidebar,
    genders,
    designations,
}: Props) {
    const sidebarStack = useSidebarStack();
    useEffect(() => {
        sidebarStack.set(sidebar);
    }, [sidebar]);

    const page = usePage<any>();
    const flash = page.props.flash?.message ?? null;

    const [form, setForm] = useState({
        name_en: teacher.name_en,
        name_bn: teacher.name_bn,
        gender: teacher.gender,
        designation: teacher.designation,
        date_of_birth: teacher.date_of_birth ?? '',
        religion: teacher.religion,
        mobile: teacher.mobile,
        email: teacher.email,
        qualification: teacher.qualification,
        subject_specialization: teacher.subject_specialization,
        father_name: teacher.father_name,
        mother_name: teacher.mother_name,
        nid_number: teacher.nid_number,
        address_present: teacher.address_present,
        address_permanent: teacher.address_permanent,
        joining_date: teacher.joining_date ?? '',
        is_active: teacher.is_active,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    function submit(e: React.FormEvent) {
        e.preventDefault();
        router.put(`/admin/teachers/${teacher.id}`, form, {
            onError: (err) => {
                setErrors(err);
            },
        });
    }

    return (
        <DashboardLayout>
            <Head title="Edit Teacher" />

            <div className="space-y-6">
                <header className="flex items-center gap-4">
                    <Link
                        href="/admin/teachers"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                    >
                        <AppIcon name="arrow-left" className="h-5 w-5" />
                    </Link>
                    <div>
                        <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase dark:text-slate-400">
                            Management
                        </p>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
                            Edit teacher
                        </h1>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            {teacher.name_en}
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
                            Personal information
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
                                    onChange={(e) =>
                                        setForm({ ...form, name_en: e.target.value })
                                    }
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
                                    Name (Bangla) <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    id="name_bn"
                                    value={form.name_bn}
                                    onChange={(e) =>
                                        setForm({ ...form, name_bn: e.target.value })
                                    }
                                    type="text"
                                    className={`mt-1 block w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:bg-slate-950 dark:text-slate-100 ${
                                        errors.name_bn
                                            ? 'border-rose-500 dark:border-rose-500'
                                            : 'border-slate-200 dark:border-slate-700'
                                    }`}
                                />
                                {errors.name_bn && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {errors.name_bn}
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
                                    onChange={(e) =>
                                        setForm({ ...form, gender: e.target.value })
                                    }
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
                                    htmlFor="date_of_birth"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Date of birth
                                </label>
                                <input
                                    id="date_of_birth"
                                    value={form.date_of_birth}
                                    onChange={(e) =>
                                        setForm({ ...form, date_of_birth: e.target.value })
                                    }
                                    type="date"
                                    className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                />
                                {errors.date_of_birth && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {errors.date_of_birth}
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
                                <input
                                    id="religion"
                                    value={form.religion}
                                    onChange={(e) =>
                                        setForm({ ...form, religion: e.target.value })
                                    }
                                    type="text"
                                    className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                />
                                {errors.religion && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {errors.religion}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="mobile"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Mobile <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    id="mobile"
                                    value={form.mobile}
                                    onChange={(e) =>
                                        setForm({ ...form, mobile: e.target.value })
                                    }
                                    type="text"
                                    className={`mt-1 block w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:bg-slate-950 dark:text-slate-100 ${
                                        errors.mobile
                                            ? 'border-rose-500 dark:border-rose-500'
                                            : 'border-slate-200 dark:border-slate-700'
                                    }`}
                                />
                                {errors.mobile && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {errors.mobile}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Email
                                </label>
                                <input
                                    id="email"
                                    value={form.email}
                                    onChange={(e) =>
                                        setForm({ ...form, email: e.target.value })
                                    }
                                    type="email"
                                    className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                />
                                {errors.email && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="nid_number"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    NID number
                                </label>
                                <input
                                    id="nid_number"
                                    value={form.nid_number}
                                    onChange={(e) =>
                                        setForm({ ...form, nid_number: e.target.value })
                                    }
                                    type="text"
                                    className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                />
                                {errors.nid_number && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {errors.nid_number}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="father_name"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Father's name
                                </label>
                                <input
                                    id="father_name"
                                    value={form.father_name}
                                    onChange={(e) =>
                                        setForm({ ...form, father_name: e.target.value })
                                    }
                                    type="text"
                                    className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                />
                                {errors.father_name && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {errors.father_name}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="mother_name"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Mother's name
                                </label>
                                <input
                                    id="mother_name"
                                    value={form.mother_name}
                                    onChange={(e) =>
                                        setForm({ ...form, mother_name: e.target.value })
                                    }
                                    type="text"
                                    className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                />
                                {errors.mother_name && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {errors.mother_name}
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>

                    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
                            Employment &amp; academic details
                        </h2>

                        <div className="grid gap-6 sm:grid-cols-2">
                            <div>
                                <label
                                    htmlFor="designation"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Designation <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    id="designation"
                                    value={form.designation}
                                    onChange={(e) =>
                                        setForm({ ...form, designation: e.target.value })
                                    }
                                    className={`mt-1 block w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:bg-slate-950 dark:text-slate-100 ${
                                        errors.designation
                                            ? 'border-rose-500 dark:border-rose-500'
                                            : 'border-slate-200 dark:border-slate-700'
                                    }`}
                                >
                                    <option value="" disabled>
                                        Select designation
                                    </option>
                                    {designations.map((d) => (
                                        <option key={d} value={d}>
                                            {d}
                                        </option>
                                    ))}
                                </select>
                                {errors.designation && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {errors.designation}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="qualification"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Qualification
                                </label>
                                <input
                                    id="qualification"
                                    value={form.qualification}
                                    onChange={(e) =>
                                        setForm({ ...form, qualification: e.target.value })
                                    }
                                    type="text"
                                    className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                />
                                {errors.qualification && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {errors.qualification}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="subject_specialization"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Subject specialization
                                </label>
                                <input
                                    id="subject_specialization"
                                    value={form.subject_specialization}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            subject_specialization: e.target.value,
                                        })
                                    }
                                    type="text"
                                    className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                />
                                {errors.subject_specialization && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {errors.subject_specialization}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="joining_date"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Joining date
                                </label>
                                <input
                                    id="joining_date"
                                    value={form.joining_date}
                                    onChange={(e) =>
                                        setForm({ ...form, joining_date: e.target.value })
                                    }
                                    type="date"
                                    className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                />
                                {errors.joining_date && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {errors.joining_date}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="address_present"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Present address
                                </label>
                                <textarea
                                    id="address_present"
                                    value={form.address_present}
                                    onChange={(e) =>
                                        setForm({ ...form, address_present: e.target.value })
                                    }
                                    rows={3}
                                    className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                />
                                {errors.address_present && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {errors.address_present}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="address_permanent"
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Permanent address
                                </label>
                                <textarea
                                    id="address_permanent"
                                    value={form.address_permanent}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            address_permanent: e.target.value,
                                        })
                                    }
                                    rows={3}
                                    className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                />
                                {errors.address_permanent && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {errors.address_permanent}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    id="is_active"
                                    checked={form.is_active}
                                    onChange={(e) =>
                                        setForm({ ...form, is_active: e.target.checked })
                                    }
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-slate-300 text-accent-600 focus:ring-accent-500 dark:border-slate-600"
                                />
                                <label
                                    htmlFor="is_active"
                                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Active teacher
                                </label>
                            </div>
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
                            href="/admin/teachers"
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
