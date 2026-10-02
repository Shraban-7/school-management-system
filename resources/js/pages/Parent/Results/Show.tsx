import React, { useEffect } from 'react';
import { Head } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import ReportCard, { type Report } from '@/components/ReportCard';
import { useSidebarStack } from '@/composables/useNavStack';
import { useI18n } from '@/composables/useI18n';
import type { SidebarConfig } from '@/types/sidebar';

interface ParentResultsShowProps {
    report: Report;
    backHref: string;
    pdfHref: string;
    sidebar: SidebarConfig;
}

export default function ParentResultsShow({
    report,
    backHref,
    pdfHref,
    sidebar,
}: ParentResultsShowProps) {
    const { t, bi } = useI18n();
    const sidebarStack = useSidebarStack();
    useEffect(() => {
        if (sidebar) {
            sidebarStack.set(sidebar);
        }
    }, [sidebar]);

    return (
        <DashboardLayout>
            <Head title={`${t('results.sheet')} - ${bi(report.student.name_en, report.student.name_bn)}`} />
            <ReportCard
                report={report}
                backHref={backHref}
                pdfHref={pdfHref}
            />
        </DashboardLayout>
    );
}
