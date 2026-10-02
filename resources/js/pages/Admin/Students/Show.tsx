import React, { useEffect } from 'react';
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
        roll_number: string | number;
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
        institution_name: string;
        session_name: string;
        class_level: string;
        class_section: string;
    };
    sidebar: SidebarConfig;
}

function initial(name: string): string {
    return name.charAt(0).toUpperCase();
}

export default function StudentsShow({ student, sidebar }: Props) {
    const sidebarStack = useSidebarStack();
    useEffect(() => {
        sidebarStack.set(sidebar);
    }, [sidebar]);

    const page = usePage<any>();
    const flash = page.props.flash?.message ?? null;

    function destroy() {
        if (confirm('Are you sure you want to delete this student?')) {
            router.delete(`/admin/students/${student.id}`);
        }
    }

    return (
        <DashboardLayout>
            <Head title={student.name_en} />

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
                            {student.name_en}
                        </h1>
                    </div>
                </header>

                {flash && (
                    <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
                        {flash}
                    </div>
                )}

                <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex flex-col items-center gap-4 border-b border-slate-200 p-6 sm:flex-row dark:border-slate-800">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-100 text-2xl font-bold text-accent-700 dark:bg-accent-950/40 dark:text-accent-300">
                            {initial(student.name_en)}
                        </div>
                        <div className="text-center sm:text-left">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                                {student.name_en}
                            </h2>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                {student.name_bn}
                            </p>
                            <div className="mt-1">
                                <span
                                    className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                                        student.is_active
                                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                    }`}
                                >
                                    <span
                                        className={`h-1.5 w-1.5 rounded-full ${
                                            student.is_active
                                                ? 'bg-emerald-500'
                                                : 'bg-slate-400'
                                        }`}
                                    />
                                    {student.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 sm:ml-auto">
                            <Link
                                href={`/admin/students/${student.id}/edit`}
                                className="inline-flex items-center gap-1.5 rounded-md bg-accent-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-700"
                            >
                                <AppIcon name="pencil" className="h-4 w-4" />
                                Edit
                            </Link>
                            <button
                                type="button"
                                className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-rose-600 shadow-sm transition hover:bg-rose-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-rose-950/30"
                                onClick={destroy}
                            >
                                <AppIcon name="trash" className="h-4 w-4" />
                                Delete
                            </button>
                        </div>
                    </div>

                    <div className="grid gap-6 p-6 sm:grid-cols-2">
                        <section>
                            <h3 className="mb-3 text-sm font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                Personal Information
                            </h3>
                            <dl className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <dt className="text-slate-500 dark:text-slate-400">
                                        Name (English)
                                    </dt>
                                    <dd className="font-medium text-slate-900 dark:text-slate-100">
                                        {student.name_en}
                                    </dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-slate-500 dark:text-slate-400">
                                        Name (Bangla)
                                    </dt>
                                    <dd className="font-medium text-slate-900 dark:text-slate-100">
                                        {student.name_bn || '—'}
                                    </dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-slate-500 dark:text-slate-400">
                                        Date of birth
                                    </dt>
                                    <dd className="font-medium text-slate-900 dark:text-slate-100">
                                        {student.date_of_birth}
                                    </dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-slate-500 dark:text-slate-400">
                                        Gender
                                    </dt>
                                    <dd className="font-medium text-slate-900 capitalize dark:text-slate-100">
                                        {student.gender}
                                    </dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-slate-500 dark:text-slate-400">
                                        Blood group
                                    </dt>
                                    <dd className="font-medium text-slate-900 dark:text-slate-100">
                                        {student.blood_group || '—'}
                                    </dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-slate-500 dark:text-slate-400">
                                        Religion
                                    </dt>
                                    <dd className="font-medium text-slate-900 dark:text-slate-100">
                                        {student.religion || '—'}
                                    </dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-slate-500 dark:text-slate-400">
                                        Nationality
                                    </dt>
                                    <dd className="font-medium text-slate-900 dark:text-slate-100">
                                        {student.nationality || '—'}
                                    </dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-slate-500 dark:text-slate-400">
                                        Birth certificate
                                    </dt>
                                    <dd className="font-mono text-xs font-medium text-slate-900 dark:text-slate-100">
                                        {student.birth_certificate_number || '—'}
                                    </dd>
                                </div>
                            </dl>
                        </section>

                        <section>
                            <h3 className="mb-3 text-sm font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                Academic Information
                            </h3>
                            <dl className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <dt className="text-slate-500 dark:text-slate-400">
                                        Institution
                                    </dt>
                                    <dd className="font-medium text-slate-900 dark:text-slate-100">
                                        {student.institution_name}
                                    </dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-slate-500 dark:text-slate-400">
                                        Session
                                    </dt>
                                    <dd className="font-medium text-slate-900 dark:text-slate-100">
                                        {student.session_name}
                                    </dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-slate-500 dark:text-slate-400">Class</dt>
                                    <dd className="font-medium text-slate-900 dark:text-slate-100">
                                        {student.class_level}
                                    </dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-slate-500 dark:text-slate-400">
                                        Section
                                    </dt>
                                    <dd className="font-medium text-slate-900 dark:text-slate-100">
                                        {student.class_section}
                                    </dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-slate-500 dark:text-slate-400">
                                        Roll number
                                    </dt>
                                    <dd className="font-mono font-medium text-slate-900 dark:text-slate-100">
                                        {student.roll_number}
                                    </dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-slate-500 dark:text-slate-400">
                                        Academic year
                                    </dt>
                                    <dd className="font-medium text-slate-900 dark:text-slate-100">
                                        {student.academic_year || '—'}
                                    </dd>
                                </div>
                            </dl>
                        </section>

                        <section className="sm:col-span-2">
                            <h3 className="mb-3 text-sm font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                Parent/Guardian Information
                            </h3>
                            <div className="grid gap-6 sm:grid-cols-3">
                                <div>
                                    <h4 className="mb-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                                        Father
                                    </h4>
                                    <dl className="space-y-1.5 text-sm">
                                        <div className="flex justify-between">
                                            <dt className="text-slate-500 dark:text-slate-400">
                                                Name (EN)
                                            </dt>
                                            <dd className="font-medium text-slate-900 dark:text-slate-100">
                                                {student.father_name_en || '—'}
                                            </dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-slate-500 dark:text-slate-400">
                                                Name (BN)
                                            </dt>
                                            <dd className="font-medium text-slate-900 dark:text-slate-100">
                                                {student.father_name_bn || '—'}
                                            </dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-slate-500 dark:text-slate-400">
                                                NID
                                            </dt>
                                            <dd className="font-mono text-xs font-medium text-slate-900 dark:text-slate-100">
                                                {student.father_nid || '—'}
                                            </dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-slate-500 dark:text-slate-400">
                                                Phone
                                            </dt>
                                            <dd className="font-medium text-slate-900 dark:text-slate-100">
                                                {student.father_phone || '—'}
                                            </dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-slate-500 dark:text-slate-400">
                                                Occupation
                                            </dt>
                                            <dd className="font-medium text-slate-900 dark:text-slate-100">
                                                {student.father_occupation || '—'}
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                                <div>
                                    <h4 className="mb-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                                        Mother
                                    </h4>
                                    <dl className="space-y-1.5 text-sm">
                                        <div className="flex justify-between">
                                            <dt className="text-slate-500 dark:text-slate-400">
                                                Name (EN)
                                            </dt>
                                            <dd className="font-medium text-slate-900 dark:text-slate-100">
                                                {student.mother_name_en || '—'}
                                            </dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-slate-500 dark:text-slate-400">
                                                Name (BN)
                                            </dt>
                                            <dd className="font-medium text-slate-900 dark:text-slate-100">
                                                {student.mother_name_bn || '—'}
                                            </dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-slate-500 dark:text-slate-400">
                                                NID
                                            </dt>
                                            <dd className="font-mono text-xs font-medium text-slate-900 dark:text-slate-100">
                                                {student.mother_nid || '—'}
                                            </dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-slate-500 dark:text-slate-400">
                                                Phone
                                            </dt>
                                            <dd className="font-medium text-slate-900 dark:text-slate-100">
                                                {student.mother_phone || '—'}
                                            </dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-slate-500 dark:text-slate-400">
                                                Occupation
                                            </dt>
                                            <dd className="font-medium text-slate-900 dark:text-slate-100">
                                                {student.mother_occupation || '—'}
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                                <div>
                                    <h4 className="mb-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                                        Guardian
                                    </h4>
                                    <dl className="space-y-1.5 text-sm">
                                        <div className="flex justify-between">
                                            <dt className="text-slate-500 dark:text-slate-400">
                                                Name
                                            </dt>
                                            <dd className="font-medium text-slate-900 dark:text-slate-100">
                                                {student.guardian_name || '—'}
                                            </dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-slate-500 dark:text-slate-400">
                                                Relation
                                            </dt>
                                            <dd className="font-medium text-slate-900 dark:text-slate-100">
                                                {student.guardian_relation || '—'}
                                            </dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-slate-500 dark:text-slate-400">
                                                Phone
                                            </dt>
                                            <dd className="font-medium text-slate-900 dark:text-slate-100">
                                                {student.guardian_phone || '—'}
                                            </dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-slate-500 dark:text-slate-400">
                                                Address
                                            </dt>
                                            <dd className="font-medium text-slate-900 dark:text-slate-100">
                                                {student.guardian_address || '—'}
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="mb-3 text-sm font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                Address
                            </h3>
                            <dl className="space-y-2 text-sm">
                                <div>
                                    <dt className="text-slate-500 dark:text-slate-400">
                                        Present address
                                    </dt>
                                    <dd className="mt-0.5 font-medium text-slate-900 dark:text-slate-100">
                                        {student.present_address || '—'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-slate-500 dark:text-slate-400">
                                        Permanent address
                                    </dt>
                                    <dd className="mt-0.5 font-medium text-slate-900 dark:text-slate-100">
                                        {student.permanent_address || '—'}
                                    </dd>
                                </div>
                            </dl>
                        </section>

                        <section>
                            <h3 className="mb-3 text-sm font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                Previous Education
                            </h3>
                            <dl className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <dt className="text-slate-500 dark:text-slate-400">
                                        School
                                    </dt>
                                    <dd className="font-medium text-slate-900 dark:text-slate-100">
                                        {student.previous_school || '—'}
                                    </dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-slate-500 dark:text-slate-400">Class</dt>
                                    <dd className="font-medium text-slate-900 dark:text-slate-100">
                                        {student.previous_class || '—'}
                                    </dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-slate-500 dark:text-slate-400">GPA</dt>
                                    <dd className="font-medium text-slate-900 dark:text-slate-100">
                                        {student.previous_gpa ?? '—'}
                                    </dd>
                                </div>
                            </dl>
                        </section>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
