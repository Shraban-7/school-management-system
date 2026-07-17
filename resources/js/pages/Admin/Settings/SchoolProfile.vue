<script setup lang="ts">
import { Head, router, usePage } from '@inertiajs/vue3';
import { computed, reactive, ref } from 'vue';
import DashboardLayout from '@/layouts/DashboardLayout.vue';
import AppIcon from '@/components/AppIcon.vue';
import RichTextEditor from '@/components/RichTextEditor.vue';
import { useSidebarStack } from '@/composables/useNavStack';
import type { SidebarConfig } from '@/types/sidebar';

defineOptions({ layout: DashboardLayout });

interface School {
    name_en: string | null;
    name_bn: string | null;
    eiin_number: string | null;
    board_affiliation: string | null;
    mpo_status: boolean;
    address: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    established_year: number | string | null;
    about_en: string | null;
    about_bn: string | null;
    headmaster_name_en: string | null;
    headmaster_name_bn: string | null;
    headmaster_speech: string | null;
    admission_info: string | null;
    admission_guidelines: string | null;
    lab_facilities: string | null;
    school_facilities: string | null;
    fee_notes: string | null;
    office_hours: string | null;
    contact_intro: string | null;
    footer_tagline: string | null;
    hero_tagline: string | null;
    logo_url: string | null;
    headmaster_photo_url: string | null;
    nav_menu_raw: { label: string; href: string; enabled: boolean }[];
    home_ctas_raw: { label: string; href: string }[];
    home_sections_raw: {
        stats: boolean;
        speech: boolean;
        notices: boolean;
        activities: boolean;
        blog: boolean;
    };
    facility_items_raw: { title: string; body: string; category: string }[];
}

const props = defineProps<{
    sidebar: SidebarConfig;
    school: School;
}>();

const sidebarStack = useSidebarStack();
sidebarStack.set(props.sidebar);

const page = usePage();
const flash = computed(() => page.props.flash?.message ?? null);

const form = reactive({
    name_en: props.school.name_en ?? '',
    name_bn: props.school.name_bn ?? '',
    eiin_number: props.school.eiin_number ?? '',
    board_affiliation: props.school.board_affiliation ?? '',
    mpo_status: props.school.mpo_status ?? false,
    address: props.school.address ?? '',
    phone: props.school.phone ?? '',
    email: props.school.email ?? '',
    website: props.school.website ?? '',
    established_year: props.school.established_year ?? '',
    about_en: props.school.about_en ?? '',
    about_bn: props.school.about_bn ?? '',
    headmaster_name_en: props.school.headmaster_name_en ?? '',
    headmaster_name_bn: props.school.headmaster_name_bn ?? '',
    headmaster_speech: props.school.headmaster_speech ?? '',
    admission_info: props.school.admission_info ?? '',
    admission_guidelines: props.school.admission_guidelines ?? '',
    lab_facilities: props.school.lab_facilities ?? '',
    school_facilities: props.school.school_facilities ?? '',
    fee_notes: props.school.fee_notes ?? '',
    office_hours: props.school.office_hours ?? '',
    contact_intro: props.school.contact_intro ?? '',
    footer_tagline: props.school.footer_tagline ?? '',
    hero_tagline: props.school.hero_tagline ?? '',
    remove_logo: false,
    remove_headmaster_photo: false,
    nav_menu: (props.school.nav_menu_raw ?? []).map((i) => ({ ...i })),
    home_ctas: (props.school.home_ctas_raw ?? []).map((i) => ({ ...i })),
    home_sections: { ...(props.school.home_sections_raw ?? {
        stats: true,
        speech: true,
        notices: true,
        activities: true,
        blog: true,
    }) },
    facility_items: (props.school.facility_items_raw ?? []).map((i) => ({
        title: i.title,
        body: i.body ?? '',
        category: i.category || 'school',
    })),
});

const logoFile = ref<File | null>(null);
const headmasterPhotoFile = ref<File | null>(null);

const errors = ref<Record<string, string>>({});

function onLogoChange(event: Event) {
    logoFile.value = (event.target as HTMLInputElement).files?.[0] ?? null;
}

function onHeadmasterPhotoChange(event: Event) {
    headmasterPhotoFile.value =
        (event.target as HTMLInputElement).files?.[0] ?? null;
}

function submit() {
    router.post(
        '/admin/settings/school',
        {
            _method: 'put',
            name_en: form.name_en,
            name_bn: form.name_bn,
            eiin_number: form.eiin_number,
            board_affiliation: form.board_affiliation,
            mpo_status: form.mpo_status,
            address: form.address,
            phone: form.phone,
            email: form.email,
            website: form.website,
            established_year: form.established_year || null,
            about_en: form.about_en,
            about_bn: form.about_bn,
            headmaster_name_en: form.headmaster_name_en,
            headmaster_name_bn: form.headmaster_name_bn,
            headmaster_speech: form.headmaster_speech,
            admission_info: form.admission_info,
            admission_guidelines: form.admission_guidelines,
            lab_facilities: form.lab_facilities,
            school_facilities: form.school_facilities,
            fee_notes: form.fee_notes,
            office_hours: form.office_hours,
            contact_intro: form.contact_intro,
            footer_tagline: form.footer_tagline,
            hero_tagline: form.hero_tagline,
            nav_menu: form.nav_menu,
            home_ctas: form.home_ctas,
            home_sections: form.home_sections,
            facility_items: form.facility_items,
            logo: logoFile.value,
            headmaster_photo: headmasterPhotoFile.value,
            remove_logo: form.remove_logo,
            remove_headmaster_photo: form.remove_headmaster_photo,
        },
        {
            forceFormData: true,
            onError: (err) => {
                errors.value = err;
            },
            onSuccess: () => {
                errors.value = {};
                logoFile.value = null;
                headmasterPhotoFile.value = null;
                form.remove_logo = false;
                form.remove_headmaster_photo = false;
            },
        },
    );
}

function addNavItem() {
    form.nav_menu.push({ label: '', href: '/', enabled: true });
}

function removeNavItem(index: number) {
    form.nav_menu.splice(index, 1);
}

function addHomeCta() {
    form.home_ctas.push({ label: '', href: '/' });
}

function removeHomeCta(index: number) {
    form.home_ctas.splice(index, 1);
}

function addFacilityItem() {
    form.facility_items.push({ title: '', body: '', category: 'school' });
}

function removeFacilityItem(index: number) {
    form.facility_items.splice(index, 1);
}

const inputClass =
    'mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100';
const labelClass =
    'block text-sm font-medium text-slate-700 dark:text-slate-300';
const sectionClass =
    'rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900';
const sectionTitleClass =
    'mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100';
const errorClass = 'mt-1 text-xs text-rose-500';
</script>

<template>
    <div>
        <Head title="School Profile" />

        <div class="space-y-6">
            <header>
                <p
                    class="text-xs font-semibold tracking-widest text-slate-500 uppercase dark:text-slate-400"
                >
                    Settings
                </p>
                <h1
                    class="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50"
                >
                    School profile
                </h1>
                <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    Manage the school's public information shown on the
                    website.
                </p>
            </header>

            <div
                v-if="flash"
                class="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
            >
                {{ flash }}
            </div>

            <form @submit.prevent="submit" class="space-y-8">
                <!-- Identity -->
                <section :class="sectionClass">
                    <h2 :class="sectionTitleClass">Identity</h2>

                    <div class="grid gap-6 sm:grid-cols-2">
                        <div>
                            <label for="name_en" :class="labelClass">
                                Name (English)
                                <span class="text-rose-500">*</span>
                            </label>
                            <input
                                id="name_en"
                                v-model="form.name_en"
                                type="text"
                                :class="[
                                    inputClass,
                                    { 'border-rose-500': errors.name_en },
                                ]"
                            />
                            <p v-if="errors.name_en" :class="errorClass">
                                {{ errors.name_en }}
                            </p>
                        </div>

                        <div>
                            <label for="name_bn" :class="labelClass">
                                Name (Bangla)
                            </label>
                            <input
                                id="name_bn"
                                v-model="form.name_bn"
                                type="text"
                                :class="[
                                    inputClass,
                                    { 'border-rose-500': errors.name_bn },
                                ]"
                            />
                            <p v-if="errors.name_bn" :class="errorClass">
                                {{ errors.name_bn }}
                            </p>
                        </div>

                        <div>
                            <label for="eiin_number" :class="labelClass">
                                EIIN number
                            </label>
                            <input
                                id="eiin_number"
                                v-model="form.eiin_number"
                                type="text"
                                :class="[
                                    inputClass,
                                    { 'border-rose-500': errors.eiin_number },
                                ]"
                            />
                            <p v-if="errors.eiin_number" :class="errorClass">
                                {{ errors.eiin_number }}
                            </p>
                        </div>

                        <div>
                            <label for="board_affiliation" :class="labelClass">
                                Board affiliation
                            </label>
                            <input
                                id="board_affiliation"
                                v-model="form.board_affiliation"
                                type="text"
                                :class="[
                                    inputClass,
                                    {
                                        'border-rose-500':
                                            errors.board_affiliation,
                                    },
                                ]"
                            />
                            <p
                                v-if="errors.board_affiliation"
                                :class="errorClass"
                            >
                                {{ errors.board_affiliation }}
                            </p>
                        </div>

                        <div>
                            <label for="established_year" :class="labelClass">
                                Established year
                            </label>
                            <input
                                id="established_year"
                                v-model="form.established_year"
                                type="number"
                                :class="[
                                    inputClass,
                                    {
                                        'border-rose-500':
                                            errors.established_year,
                                    },
                                ]"
                            />
                            <p
                                v-if="errors.established_year"
                                :class="errorClass"
                            >
                                {{ errors.established_year }}
                            </p>
                        </div>

                        <div>
                            <label for="hero_tagline" :class="labelClass">
                                Hero tagline
                            </label>
                            <input
                                id="hero_tagline"
                                v-model="form.hero_tagline"
                                type="text"
                                :class="[
                                    inputClass,
                                    { 'border-rose-500': errors.hero_tagline },
                                ]"
                            />
                            <p v-if="errors.hero_tagline" :class="errorClass">
                                {{ errors.hero_tagline }}
                            </p>
                        </div>

                        <div class="flex items-center gap-3">
                            <input
                                id="mpo_status"
                                v-model="form.mpo_status"
                                type="checkbox"
                                class="h-4 w-4 rounded border-slate-300 text-accent-600 focus:ring-accent-500 dark:border-slate-600"
                            />
                            <label for="mpo_status" :class="labelClass">
                                MPO enlisted
                            </label>
                        </div>

                        <div class="sm:col-span-2">
                            <label for="logo" :class="labelClass">Logo</label>
                            <div class="mt-2 flex items-start gap-4">
                                <img
                                    v-if="school.logo_url"
                                    :src="school.logo_url"
                                    alt="Current logo"
                                    class="h-16 w-16 rounded-md border border-slate-200 object-contain dark:border-slate-700"
                                />
                                <div class="flex-1 space-y-2">
                                    <input
                                        id="logo"
                                        type="file"
                                        accept="image/*"
                                        class="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200 dark:text-slate-400 dark:file:bg-slate-800 dark:file:text-slate-300 dark:hover:file:bg-slate-700"
                                        @change="onLogoChange"
                                    />
                                    <p v-if="errors.logo" :class="errorClass">
                                        {{ errors.logo }}
                                    </p>
                                    <div
                                        v-if="school.logo_url"
                                        class="flex items-center gap-2"
                                    >
                                        <input
                                            id="remove_logo"
                                            v-model="form.remove_logo"
                                            type="checkbox"
                                            class="h-4 w-4 rounded border-slate-300 text-accent-600 focus:ring-accent-500 dark:border-slate-600"
                                        />
                                        <label
                                            for="remove_logo"
                                            class="text-sm text-slate-600 dark:text-slate-400"
                                        >
                                            Remove current logo
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Contact -->
                <section :class="sectionClass">
                    <h2 :class="sectionTitleClass">Contact</h2>

                    <div class="grid gap-6 sm:grid-cols-2">
                        <div class="sm:col-span-2">
                            <label for="address" :class="labelClass">
                                Address
                            </label>
                            <textarea
                                id="address"
                                v-model="form.address"
                                rows="2"
                                :class="[
                                    inputClass,
                                    { 'border-rose-500': errors.address },
                                ]"
                            />
                            <p v-if="errors.address" :class="errorClass">
                                {{ errors.address }}
                            </p>
                        </div>

                        <div>
                            <label for="phone" :class="labelClass">
                                Phone
                            </label>
                            <input
                                id="phone"
                                v-model="form.phone"
                                type="text"
                                :class="[
                                    inputClass,
                                    { 'border-rose-500': errors.phone },
                                ]"
                            />
                            <p v-if="errors.phone" :class="errorClass">
                                {{ errors.phone }}
                            </p>
                        </div>

                        <div>
                            <label for="email" :class="labelClass">
                                Email
                            </label>
                            <input
                                id="email"
                                v-model="form.email"
                                type="email"
                                :class="[
                                    inputClass,
                                    { 'border-rose-500': errors.email },
                                ]"
                            />
                            <p v-if="errors.email" :class="errorClass">
                                {{ errors.email }}
                            </p>
                        </div>

                        <div class="sm:col-span-2">
                            <label for="website" :class="labelClass">
                                Website
                            </label>
                            <input
                                id="website"
                                v-model="form.website"
                                type="url"
                                placeholder="https://example.edu.bd"
                                :class="[
                                    inputClass,
                                    { 'border-rose-500': errors.website },
                                ]"
                            />
                            <p v-if="errors.website" :class="errorClass">
                                {{ errors.website }}
                            </p>
                        </div>
                    </div>
                </section>

                <!-- About -->
                <section :class="sectionClass">
                    <h2 :class="sectionTitleClass">About</h2>

                    <div class="grid gap-6">
                        <div>
                            <label for="about_en" :class="labelClass">
                                About (English)
                            </label>
                            <RichTextEditor
                                v-model="form.about_en"
                                :invalid="Boolean(errors.about_en)"
                            />
                            <p v-if="errors.about_en" :class="errorClass">
                                {{ errors.about_en }}
                            </p>
                        </div>

                        <div>
                            <label for="about_bn" :class="labelClass">
                                About (Bangla)
                            </label>
                            <RichTextEditor
                                v-model="form.about_bn"
                                :invalid="Boolean(errors.about_bn)"
                            />
                            <p v-if="errors.about_bn" :class="errorClass">
                                {{ errors.about_bn }}
                            </p>
                        </div>
                    </div>
                </section>

                <!-- Headmaster -->
                <section :class="sectionClass">
                    <h2 :class="sectionTitleClass">Headmaster</h2>

                    <div class="grid gap-6 sm:grid-cols-2">
                        <div>
                            <label for="headmaster_name_en" :class="labelClass">
                                Name (English)
                            </label>
                            <input
                                id="headmaster_name_en"
                                v-model="form.headmaster_name_en"
                                type="text"
                                :class="[
                                    inputClass,
                                    {
                                        'border-rose-500':
                                            errors.headmaster_name_en,
                                    },
                                ]"
                            />
                            <p
                                v-if="errors.headmaster_name_en"
                                :class="errorClass"
                            >
                                {{ errors.headmaster_name_en }}
                            </p>
                        </div>

                        <div>
                            <label for="headmaster_name_bn" :class="labelClass">
                                Name (Bangla)
                            </label>
                            <input
                                id="headmaster_name_bn"
                                v-model="form.headmaster_name_bn"
                                type="text"
                                :class="[
                                    inputClass,
                                    {
                                        'border-rose-500':
                                            errors.headmaster_name_bn,
                                    },
                                ]"
                            />
                            <p
                                v-if="errors.headmaster_name_bn"
                                :class="errorClass"
                            >
                                {{ errors.headmaster_name_bn }}
                            </p>
                        </div>

                        <div class="sm:col-span-2">
                            <label for="headmaster_speech" :class="labelClass">
                                Speech
                            </label>
                            <RichTextEditor
                                v-model="form.headmaster_speech"
                                :invalid="Boolean(errors.headmaster_speech)"
                            />
                            <p
                                v-if="errors.headmaster_speech"
                                :class="errorClass"
                            >
                                {{ errors.headmaster_speech }}
                            </p>
                        </div>

                        <div class="sm:col-span-2">
                            <label for="headmaster_photo" :class="labelClass">
                                Photo
                            </label>
                            <div class="mt-2 flex items-start gap-4">
                                <img
                                    v-if="school.headmaster_photo_url"
                                    :src="school.headmaster_photo_url"
                                    alt="Current headmaster photo"
                                    class="h-16 w-16 rounded-md border border-slate-200 object-cover dark:border-slate-700"
                                />
                                <div class="flex-1 space-y-2">
                                    <input
                                        id="headmaster_photo"
                                        type="file"
                                        accept="image/*"
                                        class="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200 dark:text-slate-400 dark:file:bg-slate-800 dark:file:text-slate-300 dark:hover:file:bg-slate-700"
                                        @change="onHeadmasterPhotoChange"
                                    />
                                    <p
                                        v-if="errors.headmaster_photo"
                                        :class="errorClass"
                                    >
                                        {{ errors.headmaster_photo }}
                                    </p>
                                    <div
                                        v-if="school.headmaster_photo_url"
                                        class="flex items-center gap-2"
                                    >
                                        <input
                                            id="remove_headmaster_photo"
                                            v-model="
                                                form.remove_headmaster_photo
                                            "
                                            type="checkbox"
                                            class="h-4 w-4 rounded border-slate-300 text-accent-600 focus:ring-accent-500 dark:border-slate-600"
                                        />
                                        <label
                                            for="remove_headmaster_photo"
                                            class="text-sm text-slate-600 dark:text-slate-400"
                                        >
                                            Remove current photo
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Admission -->
                <section :class="sectionClass">
                    <h2 :class="sectionTitleClass">Admission</h2>

                    <div class="space-y-4">
                        <div>
                            <label for="admission_info" :class="labelClass">
                                Admission overview
                            </label>
                            <RichTextEditor
                                v-model="form.admission_info"
                                :invalid="Boolean(errors.admission_info)"
                            />
                            <p v-if="errors.admission_info" :class="errorClass">
                                {{ errors.admission_info }}
                            </p>
                        </div>
                        <div>
                            <label for="admission_guidelines" :class="labelClass">
                                Admission guidelines &amp; process
                            </label>
                            <RichTextEditor
                                v-model="form.admission_guidelines"
                                :invalid="Boolean(errors.admission_guidelines)"
                            />
                            <p
                                v-if="errors.admission_guidelines"
                                :class="errorClass"
                            >
                                {{ errors.admission_guidelines }}
                            </p>
                        </div>
                    </div>
                </section>

                <!-- Facilities -->
                <section :class="sectionClass">
                    <h2 :class="sectionTitleClass">Facilities</h2>

                    <div class="space-y-4">
                        <div>
                            <label for="lab_facilities" :class="labelClass">
                                Lab facilities
                            </label>
                            <RichTextEditor
                                v-model="form.lab_facilities"
                                :invalid="Boolean(errors.lab_facilities)"
                            />
                            <p v-if="errors.lab_facilities" :class="errorClass">
                                {{ errors.lab_facilities }}
                            </p>
                        </div>
                        <div>
                            <label for="school_facilities" :class="labelClass">
                                School facilities
                            </label>
                            <RichTextEditor
                                v-model="form.school_facilities"
                                :invalid="Boolean(errors.school_facilities)"
                            />
                            <p
                                v-if="errors.school_facilities"
                                :class="errorClass"
                            >
                                {{ errors.school_facilities }}
                            </p>
                        </div>
                    </div>
                </section>

                <!-- Public fee notes -->
                <section :class="sectionClass">
                    <h2 :class="sectionTitleClass">Public fee notes</h2>
                    <p class="mb-4 text-sm text-slate-500 dark:text-slate-400">
                        Shown on the public Fees page. Actual amounts come from
                        Fee structures (admission, monthly tuition, session,
                        exam).
                    </p>
                    <div>
                        <label for="fee_notes" :class="labelClass">
                            Fee notes / payment instructions
                        </label>
                        <RichTextEditor
                            v-model="form.fee_notes"
                            :invalid="Boolean(errors.fee_notes)"
                        />
                        <p v-if="errors.fee_notes" :class="errorClass">
                            {{ errors.fee_notes }}
                        </p>
                    </div>
                </section>

                <!-- Contact & office -->
                <section :class="sectionClass">
                    <h2 :class="sectionTitleClass">Contact page</h2>
                    <div class="space-y-4">
                        <div>
                            <label for="contact_intro" :class="labelClass">Contact intro</label>
                            <textarea
                                id="contact_intro"
                                v-model="form.contact_intro"
                                rows="3"
                                :class="inputClass"
                            />
                        </div>
                        <div>
                            <label for="office_hours" :class="labelClass">Office hours</label>
                            <textarea
                                id="office_hours"
                                v-model="form.office_hours"
                                rows="2"
                                :class="inputClass"
                            />
                        </div>
                        <div>
                            <label for="footer_tagline" :class="labelClass">Footer tagline</label>
                            <input
                                id="footer_tagline"
                                v-model="form.footer_tagline"
                                type="text"
                                :class="inputClass"
                            />
                        </div>
                    </div>
                </section>

                <!-- Dynamic facility cards -->
                <section :class="sectionClass">
                    <div class="mb-4 flex items-center justify-between gap-3">
                        <h2 :class="sectionTitleClass" class="mb-0">Facility cards</h2>
                        <button
                            type="button"
                            class="inline-flex items-center gap-1 rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
                            @click="addFacilityItem"
                        >
                            <AppIcon name="plus" class="h-4 w-4" />
                            Add card
                        </button>
                    </div>
                    <p class="mb-4 text-sm text-slate-500">
                        Each card appears on the public Facilities page. Category: lab or school.
                    </p>
                    <div
                        v-for="(item, index) in form.facility_items"
                        :key="index"
                        class="mb-4 space-y-3 rounded-lg border border-slate-100 p-4 dark:border-slate-800"
                    >
                        <div class="flex gap-3">
                            <input
                                v-model="item.title"
                                type="text"
                                placeholder="Title"
                                :class="inputClass"
                                class="flex-1"
                            />
                            <select v-model="item.category" :class="inputClass" class="w-32">
                                <option value="lab">Lab</option>
                                <option value="school">School</option>
                            </select>
                            <button
                                type="button"
                                class="rounded-md p-2 text-rose-600 hover:bg-rose-50"
                                @click="removeFacilityItem(index)"
                            >
                                <AppIcon name="trash" class="h-4 w-4" />
                            </button>
                        </div>
                        <textarea
                            v-model="item.body"
                            rows="3"
                            placeholder="Description"
                            :class="inputClass"
                        />
                    </div>
                </section>

                <!-- Navigation -->
                <section :class="sectionClass">
                    <div class="mb-4 flex items-center justify-between gap-3">
                        <h2 :class="sectionTitleClass" class="mb-0">Website menu</h2>
                        <button
                            type="button"
                            class="inline-flex items-center gap-1 rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium"
                            @click="addNavItem"
                        >
                            <AppIcon name="plus" class="h-4 w-4" />
                            Add link
                        </button>
                    </div>
                    <div
                        v-for="(item, index) in form.nav_menu"
                        :key="index"
                        class="mb-3 flex flex-wrap items-center gap-2"
                    >
                        <input
                            v-model="item.label"
                            type="text"
                            placeholder="Label"
                            :class="inputClass"
                            class="min-w-[8rem] flex-1"
                        />
                        <input
                            v-model="item.href"
                            type="text"
                            placeholder="/path"
                            :class="inputClass"
                            class="min-w-[8rem] flex-1"
                        />
                        <label class="flex items-center gap-1.5 text-sm text-slate-600">
                            <input v-model="item.enabled" type="checkbox" class="rounded" />
                            Show
                        </label>
                        <button
                            type="button"
                            class="rounded-md p-2 text-rose-600 hover:bg-rose-50"
                            @click="removeNavItem(index)"
                        >
                            <AppIcon name="trash" class="h-4 w-4" />
                        </button>
                    </div>
                </section>

                <!-- Home CTAs & sections -->
                <section :class="sectionClass">
                    <h2 :class="sectionTitleClass">Home page</h2>
                    <div class="mb-4 flex flex-wrap gap-4 text-sm">
                        <label
                            v-for="key in (['stats', 'speech', 'notices', 'activities', 'blog'] as const)"
                            :key="key"
                            class="flex items-center gap-1.5 capitalize"
                        >
                            <input v-model="form.home_sections[key]" type="checkbox" class="rounded" />
                            {{ key }}
                        </label>
                    </div>
                    <div class="mb-3 flex items-center justify-between">
                        <p class="text-sm font-medium text-slate-700 dark:text-slate-300">Hero buttons (CTAs)</p>
                        <button
                            type="button"
                            class="inline-flex items-center gap-1 rounded-md border border-slate-200 px-3 py-1.5 text-sm"
                            @click="addHomeCta"
                        >
                            <AppIcon name="plus" class="h-4 w-4" />
                            Add CTA
                        </button>
                    </div>
                    <div
                        v-for="(cta, index) in form.home_ctas"
                        :key="index"
                        class="mb-2 flex gap-2"
                    >
                        <input v-model="cta.label" type="text" placeholder="Label" :class="inputClass" class="flex-1" />
                        <input v-model="cta.href" type="text" placeholder="/path" :class="inputClass" class="flex-1" />
                        <button
                            type="button"
                            class="rounded-md p-2 text-rose-600 hover:bg-rose-50"
                            @click="removeHomeCta(index)"
                        >
                            <AppIcon name="trash" class="h-4 w-4" />
                        </button>
                    </div>
                </section>

                <div class="flex items-center gap-3">
                    <button
                        type="submit"
                        class="inline-flex items-center gap-1.5 rounded-md bg-accent-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-700"
                    >
                        <AppIcon name="check" class="h-4 w-4" />
                        Save profile
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>
