import React from 'react';
import { Link } from '@inertiajs/react';
import AppIcon from '@/components/AppIcon';
import { useI18n } from '@/composables/useI18n';

interface SubjectRow {
    subject_id: number;
    subject_en: string | null;
    subject_bn?: string | null;
    full_marks: number;
    pass_marks: number;
    written_marks: number | null;
    mcq_marks: number | null;
    practical_marks: number | null;
    total: number | null;
    grade: string;
    point: number;
    passed: boolean;
    is_absent: boolean;
}

export interface Report {
    institution: {
        name_en: string | null;
        name_bn: string | null;
        eiin_number: number | null;
        board_affiliation: string | null;
    };
    exam: {
        id: number;
        name_en: string;
        name_bn: string | null;
        exam_type: string;
        session_name: string | null;
    };
    student: {
        id: number;
        name_en: string;
        name_bn: string | null;
        roll_number: string | null;
        class_label: string | null;
        father_name: string | null;
        mother_name: string | null;
    };
    subjects: SubjectRow[];
    summary: {
        gpa: number | null;
        grade: string;
        passed: boolean | null;
        total: number;
        full_total: number;
        subject_count: number;
        failed_count: number;
        has_marks: boolean;
    };
}

interface ReportCardProps {
    report: Report;
    backHref: string;
    pdfHref: string;
}

export default function ReportCard({ report, backHref, pdfHref }: ReportCardProps) {
    const { t, bi, formatNumber } = useI18n();

    function fmt(value: number | null): string {
        if (value === null || value === undefined) return '—';
        return formatNumber(Math.round(value * 10) / 10);
    }

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        href={backHref}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                        title={t('common.back')}
                    >
                        <AppIcon name="arrow-left" className="h-5 w-5" />
                    </Link>
                    <div>
                        <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase dark:text-slate-400">
                            {t('results.sheet')}
                        </p>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                            {bi(report.student.name_en, report.student.name_bn)}
                        </h1>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            {bi(report.exam.name_en, report.exam.name_bn)}
                        </p>
                    </div>
                </div>
                <a
                    href={pdfHref}
                    className="inline-flex items-center gap-1.5 rounded-md bg-accent-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-700"
                >
                    <AppIcon name="download" className="h-4 w-4" />
                    {t('results.download_pdf')}
                </a>
            </header>

            <section className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="border-b border-slate-200 p-6 text-center dark:border-slate-800">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                        {bi(report.institution.name_en, report.institution.name_bn)}
                    </h2>
                    {report.institution.name_bn && (
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            {report.institution.name_bn}
                        </p>
                    )}
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {report.institution.eiin_number && (
                            <span>{t('settings.eiin')}: {formatNumber(report.institution.eiin_number)}</span>
                        )}
                        {report.institution.board_affiliation && (
                            <span> · {t('settings.board')}: {report.institution.board_affiliation}</span>
                        )}
                    </p>
                    <p className="mt-3 text-sm font-semibold tracking-wide text-slate-700 uppercase dark:text-slate-200">
                        {t('results.academic_transcript')}
                    </p>
                </div>

                <dl className="grid grid-cols-2 gap-x-6 gap-y-2 p-6 text-sm sm:grid-cols-4">
                    <div>
                        <dt className="text-xs text-slate-500 dark:text-slate-400">{t('results.roll')}</dt>
                        <dd className="font-medium text-slate-900 dark:text-slate-100">
                            {report.student.roll_number ? formatNumber(report.student.roll_number) : '—'}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-xs text-slate-500 dark:text-slate-400">{t('common.class')}</dt>
                        <dd className="font-medium text-slate-900 dark:text-slate-100">
                            {report.student.class_label ?? '—'}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-xs text-slate-500 dark:text-slate-400">{t('sidebar.academic_sessions')}</dt>
                        <dd className="font-medium text-slate-900 dark:text-slate-100">
                            {report.exam.session_name ?? '—'}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-xs text-slate-500 dark:text-slate-400">{t('exams.exam_type')}</dt>
                        <dd className="font-medium text-slate-900 dark:text-slate-100">
                            {report.exam.exam_type}
                        </dd>
                    </div>
                </dl>

                {!report.summary.has_marks ? (
                    <div className="px-6 pb-8">
                        <p className="rounded-lg border border-dashed border-slate-300 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                            {t('results.no_marks_recorded')}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto px-6">
                            <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
                                <thead className="text-left text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                    <tr>
                                        <th className="py-3 pr-4">{t('subjects.subject_name')}</th>
                                        <th className="px-3 py-3 text-center">{t('results.written')}</th>
                                        <th className="px-3 py-3 text-center">{t('results.mcq')}</th>
                                        <th className="px-3 py-3 text-center">{t('results.practical')}</th>
                                        <th className="px-3 py-3 text-center">{t('results.total_marks')}</th>
                                        <th className="px-3 py-3 text-center">{t('results.full')}</th>
                                        <th className="px-3 py-3 text-center">{t('results.grade')}</th>
                                        <th className="px-3 py-3 text-center">{t('results.point')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {report.subjects.map((s) => (
                                        <tr
                                            key={s.subject_id}
                                            className="text-slate-700 dark:text-slate-200"
                                        >
                                            <td className="py-3 pr-4 font-medium text-slate-900 dark:text-slate-100">
                                                {bi(s.subject_en, s.subject_bn)}
                                            </td>
                                            <td className="px-3 py-3 text-center font-mono text-xs">
                                                {s.is_absent ? '—' : fmt(s.written_marks)}
                                            </td>
                                            <td className="px-3 py-3 text-center font-mono text-xs">
                                                {s.is_absent ? '—' : fmt(s.mcq_marks)}
                                            </td>
                                            <td className="px-3 py-3 text-center font-mono text-xs">
                                                {s.is_absent ? '—' : fmt(s.practical_marks)}
                                            </td>
                                            <td className="px-3 py-3 text-center font-mono text-xs font-semibold">
                                                {s.is_absent ? t('results.absent') : fmt(s.total)}
                                            </td>
                                            <td className="px-3 py-3 text-center font-mono text-xs">
                                                {fmt(s.full_marks)}
                                            </td>
                                            <td className="px-3 py-3 text-center">
                                                <span
                                                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                                                        s.passed
                                                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                                                    }`}
                                                >
                                                    {s.grade}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3 text-center font-mono text-xs">
                                                {formatNumber(s.point.toFixed(2))}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="m-6 grid grid-cols-2 gap-4 rounded-lg bg-slate-50 p-5 sm:grid-cols-4 dark:bg-slate-950/40">
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {t('results.total_marks')}
                                </p>
                                <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                    {fmt(report.summary.total)} / {fmt(report.summary.full_total)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{t('results.gpa')}</p>
                                <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                    {report.summary.gpa === null
                                        ? '—'
                                        : formatNumber(report.summary.gpa.toFixed(2))}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{t('results.grade')}</p>
                                <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                    {report.summary.grade}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{t('fees.payment_status')}</p>
                                <p
                                    className={`text-lg font-bold ${
                                        report.summary.passed
                                            ? 'text-emerald-600 dark:text-emerald-400'
                                            : 'text-rose-600 dark:text-rose-400'
                                    }`}
                                >
                                    {report.summary.passed ? t('results.passed') : t('results.failed')}
                                </p>
                            </div>
                        </div>
                    </>
                )}
            </section>
        </div>
    );
}
