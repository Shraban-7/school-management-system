import { Head, Link } from '@inertiajs/react';
import { useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import AppIcon from '@/components/AppIcon';
import { useSidebarStack } from '@/composables/useNavStack';
import { useI18n } from '@/composables/useI18n';
import type { SidebarConfig } from '@/types/sidebar';

interface ExamRow {
    id: number;
    name_en: string;
    name_bn: string | null;
    exam_type: string;
    is_published: boolean;
    session_name: string | null;
    start_date: string | null;
}

interface Props {
    exams: ExamRow[];
    sidebar: SidebarConfig;
}

export default function Index({ exams, sidebar }: Props) {
    const { t, bi } = useI18n();
    const sidebarStack = useSidebarStack();
    useEffect(() => {
        sidebarStack.set(sidebar);
    }, [sidebar]);

    return (
        <DashboardLayout>
            <Head title={t('results.title', {}, 'Results')} />

            <div className="space-y-6">
                <header>
                    <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase dark:text-slate-400">
                        {t('sidebar.academic', {}, 'Academic')}
                    </p>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
                        {t('results.title', {}, 'Results & gradesheets')}
                    </h1>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        {t('results.subtitle', {}, 'Select an exam to view tabulation, class ranking, and printable gradesheets.')}
                    </p>
                </header>

                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {exams.map((exam) => (
                        <Link
                            key={exam.id}
                            href={`/admin/results/${exam.id}`}
                            className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-accent-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-accent-700"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-50 text-accent-600 dark:bg-accent-950/40 dark:text-accent-400">
                                    <AppIcon name="graduation-cap" className="h-5 w-5" />
                                </div>
                                <span
                                    className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                                        exam.is_published
                                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                    }`}
                                >
                                    {exam.is_published ? t('exams.published', {}, 'Published') : t('exams.draft', {}, 'Draft')}
                                </span>
                            </div>
                            <h2 className="mt-4 font-semibold text-slate-900 dark:text-slate-100">
                                {bi(exam.name_en, exam.name_bn)}
                            </h2>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                {exam.exam_type}
                                {exam.session_name && ` · ${exam.session_name}`}
                            </p>
                        </Link>
                    ))}

                    {exams.length === 0 && (
                        <div className="col-span-full rounded-xl border border-dashed border-slate-300 py-16 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                            {t('results.no_results', {}, 'No exams found. Create an exam and enter marks first.')}
                        </div>
                    )}
                </section>
            </div>
        </DashboardLayout>
    );
}
