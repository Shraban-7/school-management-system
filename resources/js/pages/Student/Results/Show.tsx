import React, { useEffect } from 'react';
import { Head } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import ReportCard, { type Report } from '@/components/ReportCard';
import { useSidebarStack } from '@/composables/useNavStack';
import { useI18n } from '@/composables/useI18n';
import type { SidebarConfig } from '@/types/sidebar';

interface StudentResultsShowProps {
    report: Report;
    backHref: string;
    pdfHref: string;
    sidebar: SidebarConfig;
}

export default function StudentResultsShow({
    report,
    backHref,
    pdfHref,
    sidebar,
}: StudentResultsShowProps) {
    const { t, bi } = useI18n();
    const sidebarStack = useSidebarStack();
    useEffect(() => {
        if (sidebar) {
            sidebarStack.set(sidebar);
        }
    }, [sidebar]);

    return (
        <DashboardLayout>
            <Head title={`${t('results.sheet')} - ${bi(report.exam.name_en, report.exam.name_bn)}`} />
            <ReportCard
                report={report}
                backHref={backHref}
                pdfHref={pdfHref}
            />
        </DashboardLayout>
    );
}
