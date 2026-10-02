import { Head } from '@inertiajs/react';
import { useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import ReportCard, { type Report } from '@/components/ReportCard';
import { useSidebarStack } from '@/composables/useNavStack';
import type { SidebarConfig } from '@/types/sidebar';

interface Props {
    report: Report;
    backHref: string;
    pdfHref: string;
    sidebar: SidebarConfig;
}

export default function ReportCardPage({ report, backHref, pdfHref, sidebar }: Props) {
    const sidebarStack = useSidebarStack();
    useEffect(() => {
        sidebarStack.set(sidebar);
    }, [sidebar]);

    return (
        <DashboardLayout>
            <Head title={`Gradesheet - ${report.student.name_en}`} />
            <ReportCard
                report={report}
                backHref={backHref}
                pdfHref={pdfHref}
            />
        </DashboardLayout>
    );
}
