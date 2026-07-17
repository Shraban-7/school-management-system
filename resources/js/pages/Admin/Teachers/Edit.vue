<script setup lang="ts">
import { Head, Link, router, usePage } from '@inertiajs/vue3';
import { computed, reactive, ref } from 'vue';
import DashboardLayout from '@/layouts/DashboardLayout.vue';
import AppIcon from '@/components/AppIcon.vue';
import { useSidebarStack } from '@/composables/useNavStack';
import type { SidebarConfig } from '@/types/sidebar';

defineOptions({ layout: DashboardLayout });

const props = defineProps<{
    teacher: {
        id: number;
        institution_id: number;
        name_en: string;
        name_bn: string;
        gender: string;
        designation: string;
        date_of_birth: string | null;
        religion: string;
        mobile: string;
        email: string;
        qualification: string;
        subject_specialization: string;
        father_name: string;
        mother_name: string;
        nid_number: string;
        address_present: string;
        address_permanent: string;
        joining_date: string | null;
        is_active: boolean;
    };
    sidebar: SidebarConfig;
    genders: string[];
    designations: string[];
}>();

const sidebarStack = useSidebarStack();
sidebarStack.set(props.sidebar);

const page = usePage();
const flash = computed(() => page.props.flash?.message ?? null);

const form = reactive({
    name_en: props.teacher.name_en,
    name_bn: props.teacher.name_bn,
    gender: props.teacher.gender,
    designation: props.teacher.designation,
    date_of_birth: props.teacher.date_of_birth ?? '',
    religion: props.teacher.religion,
    mobile: props.teacher.mobile,
    email: props.teacher.email,
    qualification: props.teacher.qualification,
    subject_specialization: props.teacher.subject_specialization,
    father_name: props.teacher.father_name,
    mother_name: props.teacher.mother_name,
    nid_number: props.teacher.nid_number,
    address_present: props.teacher.address_present,
    address_permanent: props.teacher.address_permanent,
    joining_date: props.teacher.joining_date ?? '',
    is_active: props.teacher.is_active,
});

const errors = ref<Record<string, string>>({});

function submit() {
    router.put(
        `/admin/teachers/${props.teacher.id}`,
        { ...form },
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
        <Head title="Edit Teacher" />

        <div class="space-y-6">
            <header class="flex items-center gap-4">
                <Link
                    href="/admin/teachers"
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
                        Edit teacher
                    </h1>
                    <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        {{ teacher.name_en }}
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
                        Personal information
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
                                <span class="text-rose-500">*</span>
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
                                for="date_of_birth"
                                class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Date of birth
                            </label>
                            <input
                                id="date_of_birth"
                                v-model="form.date_of_birth"
                                type="date"
                                class="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
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
                                for="religion"
                                class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Religion
                            </label>
                            <input
                                id="religion"
                                v-model="form.religion"
                                type="text"
                                class="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                :class="{ 'border-rose-500': errors.religion }"
                            />
                            <p
                                v-if="errors.religion"
                                class="mt-1 text-xs text-rose-500"
                            >
                                {{ errors.religion }}
                            </p>
                        </div>

                        <div>
                            <label
                                for="mobile"
                                class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Mobile <span class="text-rose-500">*</span>
                            </label>
                            <input
                                id="mobile"
                                v-model="form.mobile"
                                type="text"
                                class="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                :class="{ 'border-rose-500': errors.mobile }"
                            />
                            <p
                                v-if="errors.mobile"
                                class="mt-1 text-xs text-rose-500"
                            >
                                {{ errors.mobile }}
                            </p>
                        </div>

                        <div>
                            <label
                                for="email"
                                class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Email
                            </label>
                            <input
                                id="email"
                                v-model="form.email"
                                type="email"
                                class="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                :class="{ 'border-rose-500': errors.email }"
                            />
                            <p
                                v-if="errors.email"
                                class="mt-1 text-xs text-rose-500"
                            >
                                {{ errors.email }}
                            </p>
                        </div>

                        <div>
                            <label
                                for="nid_number"
                                class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                NID number
                            </label>
                            <input
                                id="nid_number"
                                v-model="form.nid_number"
                                type="text"
                                class="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                :class="{
                                    'border-rose-500': errors.nid_number,
                                }"
                            />
                            <p
                                v-if="errors.nid_number"
                                class="mt-1 text-xs text-rose-500"
                            >
                                {{ errors.nid_number }}
                            </p>
                        </div>

                        <div>
                            <label
                                for="father_name"
                                class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Father&rsquo;s name
                            </label>
                            <input
                                id="father_name"
                                v-model="form.father_name"
                                type="text"
                                class="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                :class="{
                                    'border-rose-500': errors.father_name,
                                }"
                            />
                            <p
                                v-if="errors.father_name"
                                class="mt-1 text-xs text-rose-500"
                            >
                                {{ errors.father_name }}
                            </p>
                        </div>

                        <div>
                            <label
                                for="mother_name"
                                class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Mother&rsquo;s name
                            </label>
                            <input
                                id="mother_name"
                                v-model="form.mother_name"
                                type="text"
                                class="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                :class="{
                                    'border-rose-500': errors.mother_name,
                                }"
                            />
                            <p
                                v-if="errors.mother_name"
                                class="mt-1 text-xs text-rose-500"
                            >
                                {{ errors.mother_name }}
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
                        Employment &amp; academic details
                    </h2>

                    <div class="grid gap-6 sm:grid-cols-2">
                        <div>
                            <label
                                for="designation"
                                class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Designation <span class="text-rose-500">*</span>
                            </label>
                            <select
                                id="designation"
                                v-model="form.designation"
                                class="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                :class="{
                                    'border-rose-500': errors.designation,
                                }"
                            >
                                <option value="" disabled>
                                    Select designation
                                </option>
                                <option
                                    v-for="d in designations"
                                    :key="d"
                                    :value="d"
                                >
                                    {{ d }}
                                </option>
                            </select>
                            <p
                                v-if="errors.designation"
                                class="mt-1 text-xs text-rose-500"
                            >
                                {{ errors.designation }}
                            </p>
                        </div>

                        <div>
                            <label
                                for="qualification"
                                class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Qualification
                            </label>
                            <input
                                id="qualification"
                                v-model="form.qualification"
                                type="text"
                                class="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                :class="{
                                    'border-rose-500': errors.qualification,
                                }"
                            />
                            <p
                                v-if="errors.qualification"
                                class="mt-1 text-xs text-rose-500"
                            >
                                {{ errors.qualification }}
                            </p>
                        </div>

                        <div>
                            <label
                                for="subject_specialization"
                                class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Subject specialization
                            </label>
                            <input
                                id="subject_specialization"
                                v-model="form.subject_specialization"
                                type="text"
                                class="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                :class="{
                                    'border-rose-500':
                                        errors.subject_specialization,
                                }"
                            />
                            <p
                                v-if="errors.subject_specialization"
                                class="mt-1 text-xs text-rose-500"
                            >
                                {{ errors.subject_specialization }}
                            </p>
                        </div>

                        <div>
                            <label
                                for="joining_date"
                                class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Joining date
                            </label>
                            <input
                                id="joining_date"
                                v-model="form.joining_date"
                                type="date"
                                class="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                :class="{
                                    'border-rose-500': errors.joining_date,
                                }"
                            />
                            <p
                                v-if="errors.joining_date"
                                class="mt-1 text-xs text-rose-500"
                            >
                                {{ errors.joining_date }}
                            </p>
                        </div>

                        <div>
                            <label
                                for="address_present"
                                class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Present address
                            </label>
                            <textarea
                                id="address_present"
                                v-model="form.address_present"
                                rows="3"
                                class="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                :class="{
                                    'border-rose-500': errors.address_present,
                                }"
                            />
                            <p
                                v-if="errors.address_present"
                                class="mt-1 text-xs text-rose-500"
                            >
                                {{ errors.address_present }}
                            </p>
                        </div>

                        <div>
                            <label
                                for="address_permanent"
                                class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Permanent address
                            </label>
                            <textarea
                                id="address_permanent"
                                v-model="form.address_permanent"
                                rows="3"
                                class="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                :class="{
                                    'border-rose-500': errors.address_permanent,
                                }"
                            />
                            <p
                                v-if="errors.address_permanent"
                                class="mt-1 text-xs text-rose-500"
                            >
                                {{ errors.address_permanent }}
                            </p>
                        </div>

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
                                Active teacher
                            </label>
                        </div>
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
                        href="/admin/teachers"
                        class="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    </div>
</template>
