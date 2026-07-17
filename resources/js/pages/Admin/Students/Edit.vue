<script setup lang="ts">
import { Head, Link, router, usePage } from '@inertiajs/vue3';
import { computed, reactive, ref } from 'vue';
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
        institution_id: number;
        session_id: number;
        class_id: number;
        roll_number: string;
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
    };
    sidebar: SidebarConfig;
    sessions: { value: string | number; label: string }[];
    classes: { value: string | number; label: string }[];
    genders: string[];
    bloodGroups: string[];
    religions: string[];
}>();

const sidebarStack = useSidebarStack();
sidebarStack.set(props.sidebar);

const page = usePage();
const flash = computed(() => page.props.flash?.message ?? null);

const form = reactive({
    name_en: props.student.name_en,
    name_bn: props.student.name_bn,
    date_of_birth: props.student.date_of_birth,
    gender: props.student.gender,
    blood_group: props.student.blood_group,
    religion: props.student.religion,
    nationality: props.student.nationality,
    birth_certificate_number: props.student.birth_certificate_number,
    session_id: props.student.session_id,
    class_id: props.student.class_id,
    roll_number: props.student.roll_number,
    academic_year: props.student.academic_year,
    guardian_name: props.student.guardian_name,
    guardian_relation: props.student.guardian_relation,
    guardian_phone: props.student.guardian_phone,
    guardian_address: props.student.guardian_address,
    father_name_en: props.student.father_name_en,
    father_name_bn: props.student.father_name_bn,
    father_nid: props.student.father_nid,
    father_phone: props.student.father_phone,
    father_occupation: props.student.father_occupation,
    mother_name_en: props.student.mother_name_en,
    mother_name_bn: props.student.mother_name_bn,
    mother_nid: props.student.mother_nid,
    mother_phone: props.student.mother_phone,
    mother_occupation: props.student.mother_occupation,
    present_address: props.student.present_address,
    permanent_address: props.student.permanent_address,
    previous_school: props.student.previous_school,
    previous_class: props.student.previous_class,
    previous_gpa: props.student.previous_gpa ?? '',
    is_active: props.student.is_active,
});

const errors = ref<Record<string, string>>({});

function submit() {
    router.put(
        `/admin/students/${props.student.id}`,
        {
            name_en: form.name_en,
            name_bn: form.name_bn,
            date_of_birth: form.date_of_birth,
            gender: form.gender,
            blood_group: form.blood_group,
            religion: form.religion,
            nationality: form.nationality,
            birth_certificate_number: form.birth_certificate_number,
            session_id: Number(form.session_id),
            class_id: Number(form.class_id),
            roll_number: form.roll_number,
            academic_year: form.academic_year,
            guardian_name: form.guardian_name,
            guardian_relation: form.guardian_relation,
            guardian_phone: form.guardian_phone,
            guardian_address: form.guardian_address,
            father_name_en: form.father_name_en,
            father_name_bn: form.father_name_bn,
            father_nid: form.father_nid,
            father_phone: form.father_phone,
            father_occupation: form.father_occupation,
            mother_name_en: form.mother_name_en,
            mother_name_bn: form.mother_name_bn,
            mother_nid: form.mother_nid,
            mother_phone: form.mother_phone,
            mother_occupation: form.mother_occupation,
            present_address: form.present_address,
            permanent_address: form.permanent_address,
            previous_school: form.previous_school,
            previous_class: form.previous_class,
            previous_gpa:
                form.previous_gpa === '' ? null : Number(form.previous_gpa),
            is_active: form.is_active,
        },
        {
            onError: (err) => {
                errors.value = err;
            },
        },
    );
}
</script>

<template>
    <div>
        <Head title="Edit Student" />

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
                        Edit student
                    </h1>
                    <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        {{ student.name_en }}
                    </p>
                </div>
            </header>

            <div
                v-if="flash"
                class="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
            >
                {{ flash }}
            </div>

            <form @submit.prevent="submit" class="space-y-8">
                <section
                    class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                    <h2
                        class="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100"
                    >
                        Personal Information
                    </h2>

                    <div class="grid gap-6 sm:grid-cols-2">
                        <div>
                            <label
                                for="name_en"
                                class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Name (English)
                                <span class="text-rose-500">*</span>
                            </label>
                            <input
                                id="name_en"
                                v-model="form.name_en"
                                type="text"
                                class="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                :class="{ 'border-rose-500': errors.name_en }"
                            />
                            <p
                                v-if="errors.name_en"
                                class="mt-1 text-xs text-rose-500"
                            >
                                {{ errors.name_en }}
                            </p>
                        </div>

                        <div>
                            <label
                                for="name_bn"
                                class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Name (Bangla)
                            </label>
                            <input
                                id="name_bn"
                                v-model="form.name_bn"
                                type="text"
                                class="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                :class="{ 'border-rose-500': errors.name_bn }"
                            />
                            <p
                                v-if="errors.name_bn"
                                class="mt-1 text-xs text-rose-500"
                            >
                                {{ errors.name_bn }}
                            </p>
                        </div>

                        <div>
                            <label
                                for="date_of_birth"
                                class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Date of birth
                                <span class="text-rose-500">*</span>
                            </label>
                            <input
                                id="date_of_birth"
                                v-model="form.date_of_birth"
                                type="date"
                                class="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                :class="{
                                    'border-rose-500': errors.date_of_birth,
                                }"
                            />
                            <p
                                v-if="errors.date_of_birth"
                                class="mt-1 text-xs text-rose-500"
                            >
                                {{ errors.date_of_birth }}
                            </p>
                        </div>

                        <div>
                            <label
                                for="gender"
                                class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Gender <span class="text-rose-500">*</span>
                            </label>
                            <select
                                id="gender"
                                v-model="form.gender"
                                class="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                :class="{ 'border-rose-500': errors.gender }"
                            >
                                <option value="" disabled>Select gender</option>
                                <option
                                    v-for="g in genders"
                                    :key="g"
                                    :value="g"
                                >
                                    {{ g }}
                                </option>
                            </select>
                            <p
                                v-if="errors.gender"
                                class="mt-1 text-xs text-rose-500"
                            >
                                {{ errors.gender }}
                            </p>
                        </div>

                        <div>
                            <label
                                for="blood_group"
                                class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Blood group
                            </label>
                            <select
                                id="blood_group"
                                v-model="form.blood_group"
                                class="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                :class="{
                                    'border-rose-500': errors.blood_group,
                                }"
                            >
                                <option value="" disabled>
                                    Select blood group
                                </option>
                                <option
                                    v-for="bg in bloodGroups"
                                    :key="bg"
                                    :value="bg"
                                >
                                    {{ bg }}
                                </option>
                            </select>
                            <p
                                v-if="errors.blood_group"
                                class="mt-1 text-xs text-rose-500"
                            >
                                {{ errors.blood_group }}
                            </p>
                        </div>

                        <div>
                            <label
                                for="religion"
                                class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Religion
                            </label>
                            <select
                                id="religion"
                                v-model="form.religion"
                                class="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                :class="{ 'border-rose-500': errors.religion }"
                            >
                                <option value="" disabled>
                                    Select religion
                                </option>
                                <option
                                    v-for="r in religions"
                                    :key="r"
                                    :value="r"
                                >
                                    {{ r }}
                                </option>
                            </select>
                            <p
                                v-if="errors.religion"
                                class="mt-1 text-xs text-rose-500"
                            >
                                {{ errors.religion }}
                            </p>
                        </div>

                        <div>
                            <label
                                for="nationality"
                                class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Nationality
                            </label>
                            <input
                                id="nationality"
                                v-model="form.nationality"
                                type="text"
                                class="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                :class="{
                                    'border-rose-500': errors.nationality,
                                }"
                            />
                            <p
                                v-if="errors.nationality"
                                class="mt-1 text-xs text-rose-500"
                            >
                                {{ errors.nationality }}
                            </p>
                        </div>

                        <div>
                            <label
                                for="birth_certificate_number"
                                class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Birth certificate number
                            </label>
                            <input
                                id="birth_certificate_number"
                                v-model="form.birth_certificate_number"
                                type="text"
                                class="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                :class="{
                                    'border-rose-500':
                                        errors.birth_certificate_number,
                                }"
                            />
                            <p
                                v-if="errors.birth_certificate_number"
                                class="mt-1 text-xs text-rose-500"
                            >
                                {{ errors.birth_certificate_number }}
                            </p>
                        </div>

                        <div>
                            <label
                                for="session_id"
                                class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Session <span class="text-rose-500">*</span>
                            </label>
                            <select
                                id="session_id"
                                v-model="form.session_id"
                                class="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                :class="{
                                    'border-rose-500': errors.session_id,
                                }"
                            >
                                <option value="" disabled>
                                    Select session
                                </option>
                                <option
                                    v-for="s in sessions"
                                    :key="s.value"
                                    :value="s.value"
                                >
                                    {{ s.label }}
                                </option>
                            </select>
                            <p
                                v-if="errors.session_id"
                                class="mt-1 text-xs text-rose-500"
                            >
                                {{ errors.session_id }}
                            </p>
                        </div>

                        <div>
                            <label
                                for="class_id"
                                class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Class <span class="text-rose-500">*</span>
                            </label>
                            <select
                                id="class_id"
                                v-model="form.class_id"
                                class="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                :class="{ 'border-rose-500': errors.class_id }"
                            >
                                <option value="" disabled>Select class</option>
                                <option
                                    v-for="c in classes"
                                    :key="c.value"
                                    :value="c.value"
                                >
                                    {{ c.label }}
                                </option>
                            </select>
                            <p
                                v-if="errors.class_id"
                                class="mt-1 text-xs text-rose-500"
                            >
                                {{ errors.class_id }}
                            </p>
                        </div>

                        <div>
                            <label
                                for="roll_number"
                                class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Roll number
                            </label>
                            <input
                                id="roll_number"
                                v-model="form.roll_number"
                                type="text"
                                class="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                :class="{
                                    'border-rose-500': errors.roll_number,
                                }"
                            />
                            <p
                                v-if="errors.roll_number"
                                class="mt-1 text-xs text-rose-500"
                            >
                                {{ errors.roll_number }}
                            </p>
                        </div>

                        <div>
                            <label
                                for="academic_year"
                                class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Academic year
                            </label>
                            <input
                                id="academic_year"
                                v-model="form.academic_year"
                                type="text"
                                class="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                :class="{
                                    'border-rose-500': errors.academic_year,
                                }"
                            />
                            <p
                                v-if="errors.academic_year"
                                class="mt-1 text-xs text-rose-500"
                            >
                                {{ errors.academic_year }}
                            </p>
                        </div>
                    </div>
                </section>

                <section
                    class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                    <h2
                        class="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100"
                    >
                        Parent/Guardian Information
                    </h2>

                    <div class="grid gap-6 sm:grid-cols-2">
                        <div>
                            <label
                                for="guardian_name"
                                class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Guardian name
                            </label>
                            <input
                                id="guardian_name"
                                v-model="form.guardian_name"
                                type="text"
                                class="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                :class="{
                                    'border-rose-500': errors.guardian_name,
                                }"
                            />
                            <p
                                v-if="errors.guardian_name"
                                class="mt-1 text-xs text-rose-500"
                            >
                                {{ errors.guardian_name }}
                            </p>
                        </div>

                        <div>
                            <label
                                for="guardian_relation"
                                class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Guardian relation
                            </label>
                            <input
                                id="guardian_relation"
                                v-model="form.guardian_relation"
                                type="text"
                                class="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                :class="{
                                    'border-rose-500': errors.guardian_relation,
                                }"
                            />
                            <p
                                v-if="errors.guardian_relation"
                                class="mt-1 text-xs text-rose-500"
                            >
                                {{ errors.guardian_relation }}
                            </p>
                        </div>

                        <div>
                            <label
                                for="guardian_phone"
                                class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Guardian phone
                            </label>
                            <input
                                id="guardian_phone"
                                v-model="form.guardian_phone"
                                type="text"
                                class="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                :class="{
                                    'border-rose-500': errors.guardian_phone,
                                }"
                            />
                            <p
                                v-if="errors.guardian_phone"
                                class="mt-1 text-xs text-rose-500"
                            >
                                {{ errors.guardian_phone }}
                            </p>
                        </div>

                        <div>
                            <label
                                for="guardian_address"
                                class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Guardian address
                            </label>
                            <input
                                id="guardian_address"
                                v-model="form.guardian_address"
                                type="text"
                                class="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                :class="{
                                    'border-rose-500': errors.guardian_address,
                                }"
                            />
                            <p
                                v-if="errors.guardian_address"
                                class="mt-1 text-xs text-rose-500"
                            >
                                {{ errors.guardian_address }}
                            </p>
                        </div>
                    </div>

                    <hr class="my-6 border-slate-200 dark:border-slate-700" />

                    <h3
                        class="mb-4 text-base font-semibold text-slate-800 dark:text-slate-200"
                    >
                        Father's information
                    </h3>

                    <div class="grid gap-6 sm:grid-cols-2">
                        <div>
                            <label
                                for="father_name_en"
                                class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Father's name (English)
                            </label>
                            <input
                                id="father_name_en"
                                v-model="form.father_name_en"
                                type="text"
                                class="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                :class="{
                                    'border-rose-500': errors.father_name_en,
                                }"
                            />
                            <p
                                v-if="errors.father_name_en"
                                class="mt-1 text-xs text-rose-500"
                            >
                                {{ errors.father_name_en }}
                            </p>
                        </div>

                        <div>
                            <label
                                for="father_name_bn"
                                class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Father's name (Bangla)
                            </label>
                            <input
                                id="father_name_bn"
                                v-model="form.father_name_bn"
                                type="text"
                                class="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                :class="{
                                    'border-rose-500': errors.father_name_bn,
                                }"
                            />
                            <p
                                v-if="errors.father_name_bn"
                                class="mt-1 text-xs text-rose-500"
                            >
                                {{ errors.father_name_bn }}
                            </p>
                        </div>

                        <div>
                            <label
                                for="father_nid"
                                class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Father's NID
                            </label>
                            <input
                                id="father_nid"
                                v-model="form.father_nid"
                                type="text"
                                class="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                :class="{
                                    'border-rose-500': errors.father_nid,
                                }"
                            />
                            <p
                                v-if="errors.father_nid"
                                class="mt-1 text-xs text-rose-500"
                            >
                                {{ errors.father_nid }}
                            </p>
                        </div>

                        <div>
                            <label
                                for="father_phone"
                                class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Father's phone
                            </label>
                            <input
                                id="father_phone"
                                v-model="form.father_phone"
                                type="text"
                                class="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                :class="{
                                    'border-rose-500': errors.father_phone,
                                }"
                            />
                            <p
                                v-if="errors.father_phone"
                                class="mt-1 text-xs text-rose-500"
                            >
                                {{ errors.father_phone }}
                            </p>
                        </div>

                        <div>
                            <label
                                for="father_occupation"
                                class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Father's occupation
                            </label>
                            <input
                                id="father_occupation"
                                v-model="form.father_occupation"
                                type="text"
                                class="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                :class="{
                                    'border-rose-500': errors.father_occupation,
                                }"
                            />
                            <p
                                v-if="errors.father_occupation"
                                class="mt-1 text-xs text-rose-500"
                            >
                                {{ errors.father_occupation }}
                            </p>
                        </div>
                    </div>

                    <hr class="my-6 border-slate-200 dark:border-slate-700" />

                    <h3
                        class="mb-4 text-base font-semibold text-slate-800 dark:text-slate-200"
                    >
                        Mother's information
                    </h3>

                    <div class="grid gap-6 sm:grid-cols-2">
                        <div>
                            <label
                                for="mother_name_en"
                                class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Mother's name (English)
                            </label>
                            <input
                                id="mother_name_en"
                                v-model="form.mother_name_en"
                                type="text"
                                class="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                :class="{
                                    'border-rose-500': errors.mother_name_en,
                                }"
                            />
                            <p
                                v-if="errors.mother_name_en"
                                class="mt-1 text-xs text-rose-500"
                            >
                                {{ errors.mother_name_en }}
                            </p>
                        </div>

                        <div>
                            <label
                                for="mother_name_bn"
                                class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Mother's name (Bangla)
                            </label>
                            <input
                                id="mother_name_bn"
                                v-model="form.mother_name_bn"
                                type="text"
                                class="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                :class="{
                                    'border-rose-500': errors.mother_name_bn,
                                }"
                            />
                            <p
                                v-if="errors.mother_name_bn"
                                class="mt-1 text-xs text-rose-500"
                            >
                                {{ errors.mother_name_bn }}
                            </p>
                        </div>

                        <div>
                            <label
                                for="mother_nid"
                                class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Mother's NID
                            </label>
                            <input
                                id="mother_nid"
                                v-model="form.mother_nid"
                                type="text"
                                class="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                :class="{
                                    'border-rose-500': errors.mother_nid,
                                }"
                            />
                            <p
                                v-if="errors.mother_nid"
                                class="mt-1 text-xs text-rose-500"
                            >
                                {{ errors.mother_nid }}
                            </p>
                        </div>

                        <div>
                            <label
                                for="mother_phone"
                                class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Mother's phone
                            </label>
                            <input
                                id="mother_phone"
                                v-model="form.mother_phone"
                                type="text"
                                class="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                :class="{
                                    'border-rose-500': errors.mother_phone,
                                }"
                            />
                            <p
                                v-if="errors.mother_phone"
                                class="mt-1 text-xs text-rose-500"
                            >
                                {{ errors.mother_phone }}
                            </p>
                        </div>

                        <div>
                            <label
                                for="mother_occupation"
                                class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Mother's occupation
                            </label>
                            <input
                                id="mother_occupation"
                                v-model="form.mother_occupation"
                                type="text"
                                class="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                :class="{
                                    'border-rose-500': errors.mother_occupation,
                                }"
                            />
                            <p
                                v-if="errors.mother_occupation"
                                class="mt-1 text-xs text-rose-500"
                            >
                                {{ errors.mother_occupation }}
                            </p>
                        </div>
                    </div>
                </section>

                <section
                    class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                    <h2
                        class="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100"
                    >
                        Address
                    </h2>

                    <div class="grid gap-6 sm:grid-cols-2">
                        <div>
                            <label
                                for="present_address"
                                class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Present address
                            </label>
                            <textarea
                                id="present_address"
                                v-model="form.present_address"
                                rows="3"
                                class="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                :class="{
                                    'border-rose-500': errors.present_address,
                                }"
                            />
                            <p
                                v-if="errors.present_address"
                                class="mt-1 text-xs text-rose-500"
                            >
                                {{ errors.present_address }}
                            </p>
                        </div>

                        <div>
                            <label
                                for="permanent_address"
                                class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Permanent address
                            </label>
                            <textarea
                                id="permanent_address"
                                v-model="form.permanent_address"
                                rows="3"
                                class="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                :class="{
                                    'border-rose-500': errors.permanent_address,
                                }"
                            />
                            <p
                                v-if="errors.permanent_address"
                                class="mt-1 text-xs text-rose-500"
                            >
                                {{ errors.permanent_address }}
                            </p>
                        </div>
                    </div>
                </section>

                <section
                    class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                    <h2
                        class="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100"
                    >
                        Previous Education
                    </h2>

                    <div class="grid gap-6 sm:grid-cols-2">
                        <div>
                            <label
                                for="previous_school"
                                class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Previous school
                            </label>
                            <input
                                id="previous_school"
                                v-model="form.previous_school"
                                type="text"
                                class="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                :class="{
                                    'border-rose-500': errors.previous_school,
                                }"
                            />
                            <p
                                v-if="errors.previous_school"
                                class="mt-1 text-xs text-rose-500"
                            >
                                {{ errors.previous_school }}
                            </p>
                        </div>

                        <div>
                            <label
                                for="previous_class"
                                class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Previous class
                            </label>
                            <input
                                id="previous_class"
                                v-model="form.previous_class"
                                type="text"
                                class="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                :class="{
                                    'border-rose-500': errors.previous_class,
                                }"
                            />
                            <p
                                v-if="errors.previous_class"
                                class="mt-1 text-xs text-rose-500"
                            >
                                {{ errors.previous_class }}
                            </p>
                        </div>

                        <div>
                            <label
                                for="previous_gpa"
                                class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Previous GPA
                            </label>
                            <input
                                id="previous_gpa"
                                v-model="form.previous_gpa"
                                type="number"
                                step="0.01"
                                class="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                :class="{
                                    'border-rose-500': errors.previous_gpa,
                                }"
                            />
                            <p
                                v-if="errors.previous_gpa"
                                class="mt-1 text-xs text-rose-500"
                            >
                                {{ errors.previous_gpa }}
                            </p>
                        </div>
                    </div>
                </section>

                <section
                    class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                    <div class="flex items-center gap-3">
                        <input
                            id="is_active"
                            v-model="form.is_active"
                            type="checkbox"
                            class="h-4 w-4 rounded border-slate-300 text-accent-600 focus:ring-accent-500 dark:border-slate-600"
                        />
                        <label
                            for="is_active"
                            class="text-sm font-medium text-slate-700 dark:text-slate-300"
                        >
                            Active student
                        </label>
                    </div>
                </section>

                <div class="flex items-center gap-3">
                    <button
                        type="submit"
                        class="inline-flex items-center gap-1.5 rounded-md bg-accent-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-700"
                    >
                        <AppIcon name="check" class="h-4 w-4" />
                        Save changes
                    </button>
                    <Link
                        href="/admin/students"
                        class="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    </div>
</template>
