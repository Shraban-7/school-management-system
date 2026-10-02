import React, { useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import AppIcon from '@/components/AppIcon';
import { useSidebarStack } from '@/composables/useNavStack';
import { useI18n } from '@/composables/useI18n';
import type { SidebarConfig } from '@/types/sidebar';

interface ExamRow {
    id: number;
    name_en: string;
    name_bn?: string | null;
    exam_type: string;
    session_name: string | null;
}

interface ParentResultsChildProps {
    student: { id: number; name_en: string; name_bn?: string | null; roll_number: string | null };
    exams: ExamRow[];
    sidebar: SidebarConfig;
}

export default function ParentResultsChild({
    student,
    exams,
    sidebar,
}: ParentResultsChildProps) {
    const { t, bi } = useI18n();
    const sidebarStack = useSidebarStack();
    useEffect(() => {
        if (sidebar) {
            sidebarStack.set(sidebar);
        }
    }, [sidebar]);

    return (
        <DashboardLayout>
            <Head title={`${t('results.title')} - ${bi(student.name_en, student.name_bn)}`} />

            <div className="space-y-6">
                <header className="flex items-center gap-4">
                    <Link
                        href="/parent/results"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                        title={t('common.back')}
                    >
                        <AppIcon name="arrow-left" className="h-5 w-5" />
                    </Link>
                    <div>
                        <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase dark:text-slate-400">
                            {t('results.title')}
                        </p>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                            {bi(student.name_en, student.name_bn)}
                        </h1>
                    </div>
                </header>

                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {exams.map((exam) => (
                        <Link
                            key={exam.id}
                            href={`/parent/children/${student.id}/results/${exam.id}`}
                            className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-accent-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-accent-700"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-50 text-accent-600 dark:bg-accent-950/40 dark:text-accent-400">
                                <AppIcon name="graduation-cap" className="h-5 w-5" />
                            </div>
                            <h2 className="mt-4 font-semibold text-slate-900 dark:text-slate-100">
                                {bi(exam.name_en, exam.name_bn)}
                            </h2>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                {exam.exam_type}
                                {exam.session_name && (
                                    <span> · {exam.session_name}</span>
                                )}
                            </p>
                        </Link>
                    ))}

                    {exams.length === 0 && (
                        <div className="col-span-full rounded-xl border border-dashed border-slate-300 py-16 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                            {t('results.no_results')}
                        </div>
                    )}
                </section>
            </div>
        </DashboardLayout>
    );
}
