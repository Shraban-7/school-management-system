<script setup lang="ts">
import { Head, Link, router, usePage } from '@inertiajs/vue3';
import { computed } from 'vue';
import DashboardLayout from '@/layouts/DashboardLayout.vue';
import AppIcon from '@/components/AppIcon.vue';
import { useSidebarStack } from '@/composables/useNavStack';
import type { SidebarConfig } from '@/types/sidebar';

defineOptions({ layout: DashboardLayout });

const props = defineProps<{
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
}>();

const sidebarStack = useSidebarStack();
sidebarStack.set(props.sidebar);

const page = usePage();
const flash = computed(() => page.props.flash?.message ?? null);

function initial(name: string): string {
    return name.charAt(0).toUpperCase();
}

function destroy() {
    if (confirm('Are you sure you want to delete this student?')) {
        router.delete(`/admin/students/${props.student.id}`);
    }
}
</script>

<template>
    <div>
        <Head :title="student.name_en" />

        <div class="space-y-6">
            <header class="flex items-center gap-4">
                <Link
                    href="/admin/students"
                    class="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                >
                    <AppIcon name="arrow-left" class="h-5 w-5" />
                </Link>
                <div>
                    <p
                        class="text-xs font-semibold tracking-widest text-slate-500 uppercase dark:text-slate-400"
                    >
                        Management
                    </p>
                    <h1
                        class="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50"
                    >
                        {{ student.name_en }}
                    </h1>
                </div>
            </header>

            <div
                v-if="flash"
                class="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
            >
                {{ flash }}
            </div>

            <div
                class="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
                <div
                    class="flex flex-col items-center gap-4 border-b border-slate-200 p-6 sm:flex-row dark:border-slate-800"
                >
                    <div
                        class="flex h-16 w-16 items-center justify-center rounded-full bg-accent-100 text-2xl font-bold text-accent-700 dark:bg-accent-950/40 dark:text-accent-300"
                    >
                        {{ initial(student.name_en) }}
                    </div>
                    <div class="text-center sm:text-left">
                        <h2
                            class="text-xl font-bold text-slate-900 dark:text-slate-50"
                        >
                            {{ student.name_en }}
                        </h2>
                        <p class="text-sm text-slate-600 dark:text-slate-400">
                            {{ student.name_bn }}
                        </p>
                        <div class="mt-1">
                            <span
                                :class="[
                                    'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium',
                                    student.is_active
                                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
                                ]"
                            >
                                <span
                                    :class="[
                                        'h-1.5 w-1.5 rounded-full',
                                        student.is_active
                                            ? 'bg-emerald-500'
                                            : 'bg-slate-400',
                                    ]"
                                />
                                {{ student.is_active ? 'Active' : 'Inactive' }}
                            </span>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 sm:ml-auto">
                        <Link
                            :href="`/admin/students/${student.id}/edit`"
                            class="inline-flex items-center gap-1.5 rounded-md bg-accent-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-700"
                        >
                            <AppIcon name="pencil" class="h-4 w-4" />
                            Edit
                        </Link>
                        <button
                            type="button"
                            class="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-rose-600 shadow-sm transition hover:bg-rose-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-rose-950/30"
                            @click="destroy"
                        >
                            <AppIcon name="trash" class="h-4 w-4" />
                            Delete
                        </button>
                    </div>
                </div>

                <div class="grid gap-6 p-6 sm:grid-cols-2">
                    <section>
                        <h3
                            class="mb-3 text-sm font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400"
                        >
                            Personal Information
                        </h3>
                        <dl class="space-y-2 text-sm">
                            <div class="flex justify-between">
                                <dt class="text-slate-500 dark:text-slate-400">
                                    Name (English)
                                </dt>
                                <dd
                                    class="font-medium text-slate-900 dark:text-slate-100"
                                >
                                    {{ student.name_en }}
                                </dd>
                            </div>
                            <div class="flex justify-between">
                                <dt class="text-slate-500 dark:text-slate-400">
                                    Name (Bangla)
                                </dt>
                                <dd
                                    class="font-medium text-slate-900 dark:text-slate-100"
                                >
                                    {{ student.name_bn || '—' }}
                                </dd>
                            </div>
                            <div class="flex justify-between">
                                <dt class="text-slate-500 dark:text-slate-400">
                                    Date of birth
                                </dt>
                                <dd
                                    class="font-medium text-slate-900 dark:text-slate-100"
                                >
                                    {{ student.date_of_birth }}
                                </dd>
                            </div>
                            <div class="flex justify-between">
                                <dt class="text-slate-500 dark:text-slate-400">
                                    Gender
                                </dt>
                                <dd
                                    class="font-medium text-slate-900 capitalize dark:text-slate-100"
                                >
                                    {{ student.gender }}
                                </dd>
                            </div>
                            <div class="flex justify-between">
                                <dt class="text-slate-500 dark:text-slate-400">
                                    Blood group
                                </dt>
                                <dd
                                    class="font-medium text-slate-900 dark:text-slate-100"
                                >
                                    {{ student.blood_group || '—' }}
                                </dd>
                            </div>
                            <div class="flex justify-between">
                                <dt class="text-slate-500 dark:text-slate-400">
                                    Religion
                                </dt>
                                <dd
                                    class="font-medium text-slate-900 dark:text-slate-100"
                                >
                                    {{ student.religion || '—' }}
                                </dd>
                            </div>
                            <div class="flex justify-between">
                                <dt class="text-slate-500 dark:text-slate-400">
                                    Nationality
                                </dt>
                                <dd
                                    class="font-medium text-slate-900 dark:text-slate-100"
                                >
                                    {{ student.nationality || '—' }}
                                </dd>
                            </div>
                            <div class="flex justify-between">
                                <dt class="text-slate-500 dark:text-slate-400">
                                    Birth certificate
                                </dt>
                                <dd
                                    class="font-mono text-xs font-medium text-slate-900 dark:text-slate-100"
                                >
                                    {{
                                        student.birth_certificate_number || '—'
                                    }}
                                </dd>
                            </div>
                        </dl>
                    </section>

                    <section>
                        <h3
                            class="mb-3 text-sm font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400"
                        >
                            Academic Information
                        </h3>
                        <dl class="space-y-2 text-sm">
                            <div class="flex justify-between">
                                <dt class="text-slate-500 dark:text-slate-400">
                                    Institution
                                </dt>
                                <dd
                                    class="font-medium text-slate-900 dark:text-slate-100"
                                >
                                    {{ student.institution_name }}
                                </dd>
                            </div>
                            <div class="flex justify-between">
                                <dt class="text-slate-500 dark:text-slate-400">
                                    Session
                                </dt>
                                <dd
                                    class="font-medium text-slate-900 dark:text-slate-100"
                                >
                                    {{ student.session_name }}
                                </dd>
                            </div>
                            <div class="flex justify-between">
                                <dt class="text-slate-500 dark:text-slate-400">
                                    Class
                                </dt>
                                <dd
                                    class="font-medium text-slate-900 dark:text-slate-100"
                                >
                                    {{ student.class_level }}
                                </dd>
                            </div>
                            <div class="flex justify-between">
                                <dt class="text-slate-500 dark:text-slate-400">
                                    Section
                                </dt>
                                <dd
                                    class="font-medium text-slate-900 dark:text-slate-100"
                                >
                                    {{ student.class_section }}
                                </dd>
                            </div>
                            <div class="flex justify-between">
                                <dt class="text-slate-500 dark:text-slate-400">
                                    Roll number
                                </dt>
                                <dd
                                    class="font-mono font-medium text-slate-900 dark:text-slate-100"
                                >
                                    {{ student.roll_number }}
                                </dd>
                            </div>
                            <div class="flex justify-between">
                                <dt class="text-slate-500 dark:text-slate-400">
                                    Academic year
                                </dt>
                                <dd
                                    class="font-medium text-slate-900 dark:text-slate-100"
                                >
                                    {{ student.academic_year || '—' }}
                                </dd>
                            </div>
                        </dl>
                    </section>

                    <section class="sm:col-span-2">
                        <h3
                            class="mb-3 text-sm font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400"
                        >
                            Parent/Guardian Information
                        </h3>
                        <div class="grid gap-6 sm:grid-cols-3">
                            <div>
                                <h4
                                    class="mb-2 text-xs font-semibold text-slate-600 dark:text-slate-300"
                                >
                                    Father
                                </h4>
                                <dl class="space-y-1.5 text-sm">
                                    <div class="flex justify-between">
                                        <dt
                                            class="text-slate-500 dark:text-slate-400"
                                        >
                                            Name (EN)
                                        </dt>
                                        <dd
                                            class="font-medium text-slate-900 dark:text-slate-100"
                                        >
                                            {{ student.father_name_en || '—' }}
                                        </dd>
                                    </div>
                                    <div class="flex justify-between">
                                        <dt
                                            class="text-slate-500 dark:text-slate-400"
                                        >
                                            Name (BN)
                                        </dt>
                                        <dd
                                            class="font-medium text-slate-900 dark:text-slate-100"
                                        >
                                            {{ student.father_name_bn || '—' }}
                                        </dd>
                                    </div>
                                    <div class="flex justify-between">
                                        <dt
                                            class="text-slate-500 dark:text-slate-400"
                                        >
                                            NID
                                        </dt>
                                        <dd
                                            class="font-mono text-xs font-medium text-slate-900 dark:text-slate-100"
                                        >
                                            {{ student.father_nid || '—' }}
                                        </dd>
                                    </div>
                                    <div class="flex justify-between">
                                        <dt
                                            class="text-slate-500 dark:text-slate-400"
                                        >
                                            Phone
                                        </dt>
                                        <dd
                                            class="font-medium text-slate-900 dark:text-slate-100"
                                        >
                                            {{ student.father_phone || '—' }}
                                        </dd>
                                    </div>
                                    <div class="flex justify-between">
                                        <dt
                                            class="text-slate-500 dark:text-slate-400"
                                        >
                                            Occupation
                                        </dt>
                                        <dd
                                            class="font-medium text-slate-900 dark:text-slate-100"
                                        >
                                            {{
                                                student.father_occupation || '—'
                                            }}
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                            <div>
                                <h4
                                    class="mb-2 text-xs font-semibold text-slate-600 dark:text-slate-300"
                                >
                                    Mother
                                </h4>
                                <dl class="space-y-1.5 text-sm">
                                    <div class="flex justify-between">
                                        <dt
                                            class="text-slate-500 dark:text-slate-400"
                                        >
                                            Name (EN)
                                        </dt>
                                        <dd
                                            class="font-medium text-slate-900 dark:text-slate-100"
                                        >
                                            {{ student.mother_name_en || '—' }}
                                        </dd>
                                    </div>
                                    <div class="flex justify-between">
                                        <dt
                                            class="text-slate-500 dark:text-slate-400"
                                        >
                                            Name (BN)
                                        </dt>
                                        <dd
                                            class="font-medium text-slate-900 dark:text-slate-100"
                                        >
                                            {{ student.mother_name_bn || '—' }}
                                        </dd>
                                    </div>
                                    <div class="flex justify-between">
                                        <dt
                                            class="text-slate-500 dark:text-slate-400"
                                        >
                                            NID
                                        </dt>
                                        <dd
                                            class="font-mono text-xs font-medium text-slate-900 dark:text-slate-100"
                                        >
                                            {{ student.mother_nid || '—' }}
                                        </dd>
                                    </div>
                                    <div class="flex justify-between">
                                        <dt
                                            class="text-slate-500 dark:text-slate-400"
                                        >
                                            Phone
                                        </dt>
                                        <dd
                                            class="font-medium text-slate-900 dark:text-slate-100"
                                        >
                                            {{ student.mother_phone || '—' }}
                                        </dd>
                                    </div>
                                    <div class="flex justify-between">
                                        <dt
                                            class="text-slate-500 dark:text-slate-400"
                                        >
                                            Occupation
                                        </dt>
                                        <dd
                                            class="font-medium text-slate-900 dark:text-slate-100"
                                        >
                                            {{
                                                student.mother_occupation || '—'
                                            }}
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                            <div>
                                <h4
                                    class="mb-2 text-xs font-semibold text-slate-600 dark:text-slate-300"
                                >
                                    Guardian
                                </h4>
                                <dl class="space-y-1.5 text-sm">
                                    <div class="flex justify-between">
                                        <dt
                                            class="text-slate-500 dark:text-slate-400"
                                        >
                                            Name
                                        </dt>
                                        <dd
                                            class="font-medium text-slate-900 dark:text-slate-100"
                                        >
                                            {{ student.guardian_name || '—' }}
                                        </dd>
                                    </div>
                                    <div class="flex justify-between">
                                        <dt
                                            class="text-slate-500 dark:text-slate-400"
                                        >
                                            Relation
                                        </dt>
                                        <dd
                                            class="font-medium text-slate-900 dark:text-slate-100"
                                        >
                                            {{
                                                student.guardian_relation || '—'
                                            }}
                                        </dd>
                                    </div>
                                    <div class="flex justify-between">
                                        <dt
                                            class="text-slate-500 dark:text-slate-400"
                                        >
                                            Phone
                                        </dt>
                                        <dd
                                            class="font-medium text-slate-900 dark:text-slate-100"
                                        >
                                            {{ student.guardian_phone || '—' }}
                                        </dd>
                                    </div>
                                    <div class="flex justify-between">
                                        <dt
                                            class="text-slate-500 dark:text-slate-400"
                                        >
                                            Address
                                        </dt>
                                        <dd
                                            class="font-medium text-slate-900 dark:text-slate-100"
                                        >
                                            {{
                                                student.guardian_address || '—'
                                            }}
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h3
                            class="mb-3 text-sm font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400"
                        >
                            Address
                        </h3>
                        <dl class="space-y-2 text-sm">
                            <div>
                                <dt class="text-slate-500 dark:text-slate-400">
                                    Present address
                                </dt>
                                <dd
                                    class="mt-0.5 font-medium text-slate-900 dark:text-slate-100"
                                >
                                    {{ student.present_address || '—' }}
                                </dd>
                            </div>
                            <div>
                                <dt class="text-slate-500 dark:text-slate-400">
                                    Permanent address
                                </dt>
                                <dd
                                    class="mt-0.5 font-medium text-slate-900 dark:text-slate-100"
                                >
                                    {{ student.permanent_address || '—' }}
                                </dd>
                            </div>
                        </dl>
                    </section>

                    <section>
                        <h3
                            class="mb-3 text-sm font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400"
                        >
                            Previous Education
                        </h3>
                        <dl class="space-y-2 text-sm">
                            <div class="flex justify-between">
                                <dt class="text-slate-500 dark:text-slate-400">
                                    School
                                </dt>
                                <dd
                                    class="font-medium text-slate-900 dark:text-slate-100"
                                >
                                    {{ student.previous_school || '—' }}
                                </dd>
                            </div>
                            <div class="flex justify-between">
                                <dt class="text-slate-500 dark:text-slate-400">
                                    Class
                                </dt>
                                <dd
                                    class="font-medium text-slate-900 dark:text-slate-100"
                                >
                                    {{ student.previous_class || '—' }}
                                </dd>
                            </div>
                            <div class="flex justify-between">
                                <dt class="text-slate-500 dark:text-slate-400">
                                    GPA
                                </dt>
                                <dd
                                    class="font-medium text-slate-900 dark:text-slate-100"
                                >
                                    {{ student.previous_gpa ?? '—' }}
                                </dd>
                            </div>
                        </dl>
                    </section>
                </div>
            </div>
        </div>
    </div>
</template>
