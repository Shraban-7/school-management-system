<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3';
import { computed } from 'vue';
import PublicLayout from '@/layouts/PublicLayout.vue';
import { useI18n } from '@/composables/useI18n';
import { richTextHtml, richTextPlain } from '@/lib/richText';

defineOptions({ layout: PublicLayout });

interface FacilityItem {
    title: string;
    body: string;
    category: string;
}

interface PublicSchool {
    name_en: string | null;
    name_bn: string | null;
    eiin_number: string | number | null;
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
    headmaster_photo_url: string | null;
    office_hours: string | null;
    facility_items: FacilityItem[];
}

const props = defineProps<{
    school: PublicSchool;
    stats: { students: number; teachers: number; classes: number };
    speechExcerpt: string | null;
}>();

const { t, bi } = useI18n();

const schoolName = computed(() => bi(props.school.name_en, props.school.name_bn));
const schoolAltName = computed(() => {
    const primary = schoolName.value;
    const en = props.school.name_en ?? '';
    const bn = props.school.name_bn ?? '';
    if (primary === en && bn && bn !== en) return bn;
    if (primary === bn && en && en !== bn) return en;
    return null;
});

const aboutHtml = computed(() => {
    const primary = bi(props.school.about_en, props.school.about_bn);
    return primary ? richTextHtml(primary) : '';
});
const facts = computed(() =>
    [
        { label: t('site.eiin'), value: props.school.eiin_number },
        { label: t('site.board'), value: props.school.board_affiliation },
        {
            label: t('site.mpo'),
            value: props.school.mpo_status ? t('site.mpo_yes') : t('site.mpo_no'),
        },
        { label: t('site.established'), value: props.school.established_year },
        { label: t('site.address'), value: props.school.address },
        { label: t('site.phone'), value: props.school.phone },
        { label: t('site.email'), value: props.school.email },
        { label: t('site.office_hours'), value: props.school.office_hours },
    ].filter((fact) => fact.value !== null && fact.value !== ''),
);

const statCards = computed(() => [
    { label: t('site.active_students'), value: props.stats.students },
    { label: t('site.teachers'), value: props.stats.teachers },
    { label: t('site.classes_sections'), value: props.stats.classes },
]);

const facilityHighlights = computed(() => (props.school.facility_items ?? []).slice(0, 4));
</script>

<template>
    <div>
        <Head :title="t('nav.about')" />

        <section class="bg-[#1e2875] text-[#f7f3e8]">
            <div class="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
                <p class="text-xs font-semibold tracking-[0.25em] text-[#c9a227] uppercase">
                    {{ t('site.about_the_school') }}
                </p>
                <div class="mt-2 h-px w-16 bg-[#c9a227]" aria-hidden="true"></div>
                <h1 class="mt-5 font-serif text-3xl font-bold sm:text-4xl">{{ schoolName }}</h1>
                <p v-if="schoolAltName" class="mt-2 text-[#f7f3e8]/80">{{ schoolAltName }}</p>
            </div>
        </section>

        <section class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div class="-mt-7 grid gap-4 sm:grid-cols-3">
                <div
                    v-for="stat in statCards"
                    :key="stat.label"
                    class="rounded-lg border border-[#1e2875]/10 bg-white p-5 text-center shadow-sm"
                >
                    <p class="font-serif text-3xl font-bold text-[#1e2875]">{{ stat.value }}</p>
                    <p class="mt-1 text-xs font-semibold tracking-widest text-[#1a1a1a]/50 uppercase">{{ stat.label }}</p>
                </div>
            </div>
        </section>

        <section class="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-3 lg:px-8">
            <div class="lg:col-span-2">
                <div
                    v-if="aboutHtml"
                    class="rich-text leading-relaxed text-[#1a1a1a]/85"
                    v-html="aboutHtml"
                ></div>
                <p v-else class="rounded-lg border border-dashed border-[#1e2875]/20 p-6 text-sm text-[#1a1a1a]/60">
                    {{ t('site.about_empty') }}
                </p>

                <div v-if="speechExcerpt" class="mt-10 rounded-lg border border-[#1e2875]/10 bg-[#f7f3e8] p-6">
                    <div class="flex items-start gap-4">
                        <img
                            v-if="school.headmaster_photo_url"
                            :src="school.headmaster_photo_url"
                            :alt="bi(school.headmaster_name_en, school.headmaster_name_bn) || 'Headmaster'"
                            class="h-16 w-16 rounded-full border-2 border-[#c9a227] object-cover"
                        />
                        <div>
                            <p class="text-xs font-semibold tracking-widest text-[#1e2875] uppercase">
                                {{ t('site.from_headmaster') }}
                            </p>
                            <p class="mt-2 text-sm leading-relaxed text-[#1a1a1a]/80 italic">“{{ speechExcerpt }}”</p>
                            <p
                                v-if="bi(school.headmaster_name_en, school.headmaster_name_bn)"
                                class="mt-3 text-sm font-semibold text-[#1a1a1a]"
                            >
                                — {{ bi(school.headmaster_name_en, school.headmaster_name_bn) }}
                            </p>
                            <Link href="/headmaster" class="mt-2 inline-block text-sm font-semibold text-[#1e2875] hover:underline">
                                {{ t('site.read_full_speech') }}
                            </Link>
                        </div>
                    </div>
                </div>

                <div v-if="facilityHighlights.length" class="mt-10">
                    <p class="text-xs font-semibold tracking-widest text-[#1e2875] uppercase">
                        {{ t('site.facilities_glance') }}
                    </p>
                    <div class="mt-2 h-px w-12 bg-[#c9a227]" aria-hidden="true"></div>
                    <div class="mt-5 grid gap-4 sm:grid-cols-2">
                        <div
                            v-for="facility in facilityHighlights"
                            :key="facility.title"
                            class="rounded-lg border border-[#1e2875]/10 bg-white p-5 shadow-sm"
                        >
                            <p class="font-semibold text-[#1e2875]">{{ facility.title }}</p>
                            <p v-if="facility.body" class="mt-1 line-clamp-3 text-sm text-[#1a1a1a]/70">
                                {{ richTextPlain(facility.body) }}
                            </p>
                        </div>
                    </div>
                    <Link href="/facilities" class="mt-4 inline-block text-sm font-semibold text-[#1e2875] hover:underline">
                        {{ t('site.see_all_facilities') }}
                    </Link>
                </div>
            </div>

            <aside>
                <div class="rounded-lg border border-[#1e2875]/10 bg-white p-6 shadow-sm">
                    <p class="text-xs font-semibold tracking-widest text-[#1e2875] uppercase">
                        {{ t('site.at_a_glance') }}
                    </p>
                    <div class="mt-2 h-px w-12 bg-[#c9a227]" aria-hidden="true"></div>
                    <dl class="mt-5 space-y-4">
                        <div v-for="fact in facts" :key="fact.label">
                            <dt class="text-xs font-semibold text-[#1a1a1a]/50 uppercase">{{ fact.label }}</dt>
                            <dd class="mt-0.5 text-sm font-medium wrap-break-word text-[#1a1a1a]">{{ fact.value }}</dd>
                        </div>
                    </dl>
                </div>

                <div class="mt-4 rounded-lg border border-[#1e2875]/10 bg-white p-6 shadow-sm">
                    <p class="text-xs font-semibold tracking-widest text-[#1e2875] uppercase">
                        {{ t('nav.quick_links') }}
                    </p>
                    <div class="mt-2 h-px w-12 bg-[#c9a227]" aria-hidden="true"></div>
                    <ul class="mt-4 space-y-2 text-sm">
                        <li>
                            <Link href="/admission" class="font-medium text-[#1e2875] hover:underline">
                                {{ t('site.admission_info') }}
                            </Link>
                        </li>
                        <li>
                            <Link href="/fees" class="font-medium text-[#1e2875] hover:underline">
                                {{ t('site.fee_structure') }}
                            </Link>
                        </li>
                        <li>
                            <Link href="/teachers" class="font-medium text-[#1e2875] hover:underline">
                                {{ t('site.our_teachers') }}
                            </Link>
                        </li>
                        <li>
                            <Link href="/contact" class="font-medium text-[#1e2875] hover:underline">
                                {{ t('site.contact_office') }}
                            </Link>
                        </li>
                    </ul>
                </div>
            </aside>
        </section>
    </div>
</template>
