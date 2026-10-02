import React, { useEffect } from 'react';
import { Head } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import ReportCard, { type Report } from '@/components/ReportCard';
import { useSidebarStack } from '@/composables/useNavStack';
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
    const sidebarStack = useSidebarStack();
    useEffect(() => {
        if (sidebar) {
            sidebarStack.set(sidebar);
        }
    }, [sidebar]);

    return (
        <DashboardLayout>
            <Head title={`Result - ${report.student.name_en}`} />
            <ReportCard
                report={report}
                backHref={backHref}
                pdfHref={pdfHref}
            />
        </DashboardLayout>
    );
}
