import React, { useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import AppIcon from '@/components/AppIcon';
import { useSidebarStack } from '@/composables/useNavStack';
import type { SidebarConfig } from '@/types/sidebar';

interface ExamRow {
    id: number;
    name_en: string;
    exam_type: string;
    session_name: string | null;
}

interface StudentResultsIndexProps {
    exams: ExamRow[];
    hasProfile: boolean;
    sidebar: SidebarConfig;
}

export default function StudentResultsIndex({
    exams,
    hasProfile,
    sidebar,
}: StudentResultsIndexProps) {
    const sidebarStack = useSidebarStack();
    useEffect(() => {
        if (sidebar) {
            sidebarStack.set(sidebar);
        }
    }, [sidebar]);

    return (
        <DashboardLayout>
            <Head title="My Results" />

            <div className="space-y-6">
                <header>
                    <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase dark:text-slate-400">
                        Academic
                    </p>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
                        My results
                    </h1>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        View and download your published exam gradesheets.
                    </p>
                </header>

                {!hasProfile ? (
                    <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50 p-6 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                        Your login is not yet linked to a student record. Please contact the school office.
                    </div>
                ) : (
                    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {exams.map((exam) => (
                            <Link
                                key={exam.id}
                                href={`/student/results/${exam.id}`}
                                className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-accent-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-accent-700"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-50 text-accent-600 dark:bg-accent-950/40 dark:text-accent-400">
                                    <AppIcon name="graduation-cap" className="h-5 w-5" />
                                </div>
                                <h2 className="mt-4 font-semibold text-slate-900 dark:text-slate-100">
                                    {exam.name_en}
                                </h2>
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                    {exam.exam_type}
                                    {exam.session_name && <span> · {exam.session_name}</span>}
                                </p>
                            </Link>
                        ))}

                        {exams.length === 0 && (
                            <div className="col-span-full rounded-xl border border-dashed border-slate-300 py-16 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                                No published results yet.
                            </div>
                        )}
                    </section>
                )}
            </div>
        </DashboardLayout>
    );
}
