<script setup lang="ts">
import { Head } from '@inertiajs/vue3';
import DashboardLayout from '@/layouts/DashboardLayout.vue';
import ReportCard, { type Report } from '@/components/ReportCard.vue';
import { useSidebarStack } from '@/composables/useNavStack';
import type { SidebarConfig } from '@/types/sidebar';

defineOptions({ layout: DashboardLayout });

const props = defineProps<{
    report: Report;
    backHref: string;
    pdfHref: string;
    sidebar: SidebarConfig;
}>();

useSidebarStack().set(props.sidebar);
</script>

<template>
    <div>
        <Head :title="`Gradesheet - ${report.student.name_en}`" />
        <ReportCard
            :report="report"
            :back-href="backHref"
            :pdf-href="pdfHref"
        />
    </div>
</template>
