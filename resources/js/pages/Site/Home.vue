<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3';
import { computed } from 'vue';
import PublicLayout from '@/layouts/PublicLayout.vue';
import AppIcon from '@/components/AppIcon.vue';
import { useI18n } from '@/composables/useI18n';

defineOptions({ layout: PublicLayout });

interface PublicSchool {
    name_en: string | null;
    name_bn: string | null;
    eiin_number: string | null;
    logo_url: string | null;
    established_year: number | string | null;
    hero_tagline: string | null;
    headmaster_name_en: string | null;
    headmaster_name_bn: string | null;
    headmaster_photo_url: string | null;
}

interface PostItem {
    id: number;
    title_en: string;
    slug: string;
    excerpt: string;
    cover_image_url: string | null;
    published_at: string | null;
    has_attachment?: boolean;
}

interface Cta {
    label: string;
    href: string;
}

interface HomeSections {
    stats: boolean;
    speech: boolean;
    notices: boolean;
    activities: boolean;
    blog: boolean;
}

const props = defineProps<{
    school: PublicSchool;
    stats: { students: number; teachers: number; notices: number };
    notices: PostItem[];
    blogs: PostItem[];
    activities: PostItem[];
    speechExcerpt: string | null;
    homeCtas: Cta[];
    homeSections: HomeSections;
}>();

const { t, bi, locale } = useI18n();

function formatDate(date: string | null): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString(locale.value === 'bn' ? 'bn-BD' : 'en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

const schoolName = computed(() => bi(props.school.name_en, props.school.name_bn));
const schoolAltName = computed(() => {
    const primary = schoolName.value;
    const en = props.school.name_en ?? '';
    const bn = props.school.name_bn ?? '';
    if (primary === en && bn && bn !== en) return bn;
    if (primary === bn && en && en !== bn) return en;
    return null;
});

const primaryCta = props.homeCtas[0] ?? null;
const secondaryCtas = props.homeCtas.slice(1);
</script>

<template>
    <div>
        <Head :title="t('nav.home')" />

        <section class="bg-[#1e2875] text-[#f7f3e8]">
            <div class="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
                <div class="flex flex-wrap items-center gap-3">
                    <img
                        v-if="school.logo_url"
                        :src="school.logo_url"
                        :alt="schoolName"
                        class="h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-[#c9a227]"
                    />
                    <div>
                        <p class="text-xs font-semibold tracking-[0.25em] text-[#c9a227] uppercase">
                            <template v-if="school.established_year">
                                {{ t('home.established', { year: school.established_year }) }}
                            </template>
                            <template v-else>{{ t('home.welcome') }}</template>
                        </p>
                        <p
                            v-if="school.eiin_number"
                            class="mt-1 text-[11px] font-semibold tracking-widest text-[#f7f3e8]/60 uppercase"
                        >
                            EIIN {{ school.eiin_number }}
                        </p>
                    </div>
                </div>
                <div class="mt-4 h-px w-16 bg-[#c9a227]" aria-hidden="true"></div>

                <h1 class="mt-6 max-w-3xl font-serif text-4xl leading-tight font-bold sm:text-5xl lg:text-6xl">
                    {{ schoolName }}
                </h1>
                <p v-if="schoolAltName" class="mt-3 text-lg text-[#f7f3e8]/80">
                    {{ schoolAltName }}
                </p>
                <p v-if="school.hero_tagline" class="mt-6 max-w-2xl text-lg leading-relaxed text-[#f7f3e8]/90">
                    {{ school.hero_tagline }}
                </p>

                <div v-if="homeCtas.length" class="mt-10 flex flex-wrap gap-4">
                    <Link
                        v-if="primaryCta"
                        :href="primaryCta.href"
                        class="rounded bg-[#c9a227] px-6 py-3 text-sm font-semibold text-[#1a1a1a] transition-colors hover:bg-[#f7f3e8]"
                    >
                        {{ primaryCta.label }}
                    </Link>
                    <Link
                        v-for="cta in secondaryCtas"
                        :key="cta.href + cta.label"
                        :href="cta.href"
                        class="rounded border border-[#f7f3e8]/40 px-6 py-3 text-sm font-semibold text-[#f7f3e8] transition-colors hover:border-[#c9a227] hover:text-[#c9a227]"
                    >
                        {{ cta.label }}
                    </Link>
                </div>
            </div>
        </section>

        <section
            v-if="homeSections.stats"
            class="border-b border-[#1e2875]/10 bg-[#f7f3e8]"
        >
            <div class="mx-auto grid max-w-6xl grid-cols-1 divide-y divide-[#1e2875]/10 px-4 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-6 lg:px-8">
                <div class="flex items-center gap-4 py-8 sm:justify-center">
                    <AppIcon name="users" class="h-8 w-8 text-[#c9a227]" />
                    <div>
                        <p class="font-serif text-3xl font-bold text-[#1e2875]">{{ stats.students }}</p>
                        <p class="text-sm text-[#1a1a1a]/60">{{ t('home.students') }}</p>
                    </div>
                </div>
                <div class="flex items-center gap-4 py-8 sm:justify-center">
                    <AppIcon name="graduation-cap" class="h-8 w-8 text-[#c9a227]" />
                    <div>
                        <p class="font-serif text-3xl font-bold text-[#1e2875]">{{ stats.teachers }}</p>
                        <p class="text-sm text-[#1a1a1a]/60">{{ t('home.teachers') }}</p>
                    </div>
                </div>
                <div class="flex items-center gap-4 py-8 sm:justify-center">
                    <AppIcon name="megaphone" class="h-8 w-8 text-[#c9a227]" />
                    <div>
                        <p class="font-serif text-3xl font-bold text-[#1e2875]">{{ stats.notices }}</p>
                        <p class="text-sm text-[#1a1a1a]/60">{{ t('home.notices_published') }}</p>
                    </div>
                </div>
            </div>
        </section>

        <section
            v-if="homeSections.speech || homeSections.notices"
            class="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-5 lg:px-8"
        >
            <div v-if="homeSections.speech && speechExcerpt" class="lg:col-span-2">
                <p class="text-xs font-semibold tracking-widest text-[#1e2875] uppercase">{{ t('home.from_headmaster') }}</p>
                <div class="mt-2 h-px w-12 bg-[#c9a227]" aria-hidden="true"></div>

                <div class="mt-6 rounded-lg border border-[#1e2875]/10 bg-white p-6 shadow-sm">
                    <div class="flex items-center gap-4">
                        <img
                            v-if="school.headmaster_photo_url"
                            :src="school.headmaster_photo_url"
                            :alt="bi(school.headmaster_name_en, school.headmaster_name_bn) || t('home.headmaster')"
                            class="h-14 w-14 rounded-full object-cover ring-2 ring-[#c9a227]"
                        />
                        <div>
                            <p class="font-serif font-bold text-[#1e2875]">
                                {{ bi(school.headmaster_name_en, school.headmaster_name_bn) }}
                            </p>
                            <p class="text-xs text-[#1a1a1a]/60">{{ t('home.headmaster') }}</p>
                        </div>
                    </div>
                    <p class="mt-4 text-sm leading-relaxed text-[#1a1a1a]/80">
                        {{ speechExcerpt }}
                    </p>
                    <Link
                        href="/headmaster"
                        class="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1e2875] hover:text-[#c9a227]"
                    >
                        {{ t('home.read_full_message') }}
                        <AppIcon name="arrow-right" class="h-4 w-4" />
                    </Link>
                </div>
            </div>

            <div
                v-if="homeSections.notices"
                :class="homeSections.speech && speechExcerpt ? 'lg:col-span-3' : 'lg:col-span-5'"
            >
                <div class="flex items-end justify-between">
                    <div>
                        <p class="text-xs font-semibold tracking-widest text-[#1e2875] uppercase">{{ t('home.noticeboard') }}</p>
                        <div class="mt-2 h-px w-12 bg-[#c9a227]" aria-hidden="true"></div>
                        <h2 class="mt-4 font-serif text-2xl font-bold text-[#1a1a1a]">{{ t('home.latest_notices') }}</h2>
                    </div>
                    <Link href="/notices" class="text-sm font-semibold text-[#1e2875] hover:text-[#c9a227]">
                        {{ t('home.all_notices') }}
                    </Link>
                </div>

                <ul v-if="notices.length" class="mt-6 divide-y divide-[#1e2875]/10 rounded-lg border border-[#1e2875]/10 bg-white shadow-sm">
                    <li v-for="notice in notices" :key="notice.id">
                        <Link
                            :href="`/notices/${notice.slug}`"
                            class="flex items-start justify-between gap-4 px-5 py-4 transition-colors hover:bg-[#f7f3e8]"
                        >
                            <div>
                                <div class="flex flex-wrap items-center gap-2">
                                    <p class="font-medium text-[#1a1a1a]">{{ notice.title_en }}</p>
                                    <span
                                        v-if="notice.has_attachment"
                                        class="inline-flex items-center gap-1 rounded bg-[#1e2875]/10 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-[#1e2875] uppercase"
                                    >
                                        PDF
                                    </span>
                                </div>
                                <p class="mt-1 line-clamp-1 text-sm text-[#1a1a1a]/60">{{ notice.excerpt }}</p>
                            </div>
                            <span class="shrink-0 text-xs text-[#1a1a1a]/50">
                                {{ formatDate(notice.published_at) }}
                            </span>
                        </Link>
                    </li>
                </ul>
                <p v-else class="mt-6 rounded-lg border border-dashed border-[#1e2875]/20 p-6 text-sm text-[#1a1a1a]/60">
                    {{ t('home.no_notices') }}
                </p>
            </div>
        </section>

        <section v-if="homeSections.activities && activities.length" class="bg-white">
            <div class="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
                <div class="flex items-end justify-between">
                    <div>
                        <p class="text-xs font-semibold tracking-widest text-[#1e2875] uppercase">{{ t('home.school_life') }}</p>
                        <div class="mt-2 h-px w-12 bg-[#c9a227]" aria-hidden="true"></div>
                        <h2 class="mt-4 font-serif text-2xl font-bold text-[#1a1a1a]">{{ t('home.recent_activities') }}</h2>
                    </div>
                    <Link href="/activities" class="text-sm font-semibold text-[#1e2875] hover:text-[#c9a227]">
                        {{ t('home.all_activities') }}
                    </Link>
                </div>

                <div class="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <Link
                        v-for="activity in activities"
                        :key="activity.id"
                        :href="`/activities/${activity.slug}`"
                        class="group overflow-hidden rounded-lg border border-[#1e2875]/10 bg-[#f7f3e8] shadow-sm transition-shadow hover:shadow-md"
                    >
                        <img
                            v-if="activity.cover_image_url"
                            :src="activity.cover_image_url"
                            :alt="activity.title_en"
                            class="h-44 w-full object-cover"
                        />
                        <div v-else class="flex h-44 items-center justify-center bg-[#1e2875]/5">
                            <AppIcon name="activity" class="h-10 w-10 text-[#1e2875]/30" />
                        </div>
                        <div class="p-5">
                            <p class="text-xs text-[#1a1a1a]/50">{{ formatDate(activity.published_at) }}</p>
                            <h3 class="mt-1 font-serif text-lg font-bold text-[#1e2875] group-hover:text-[#c9a227]">
                                {{ activity.title_en }}
                            </h3>
                            <p class="mt-2 line-clamp-2 text-sm text-[#1a1a1a]/70">{{ activity.excerpt }}</p>
                        </div>
                    </Link>
                </div>
            </div>
        </section>

        <section v-if="homeSections.blog && blogs.length" class="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
            <div class="flex items-end justify-between">
                <div>
                    <p class="text-xs font-semibold tracking-widest text-[#1e2875] uppercase">{{ t('home.journal') }}</p>
                    <div class="mt-2 h-px w-12 bg-[#c9a227]" aria-hidden="true"></div>
                    <h2 class="mt-4 font-serif text-2xl font-bold text-[#1a1a1a]">{{ t('home.from_blog') }}</h2>
                </div>
                <Link href="/blog" class="text-sm font-semibold text-[#1e2875] hover:text-[#c9a227]">
                    {{ t('home.all_posts') }}
                </Link>
            </div>

            <div class="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <Link
                    v-for="blog in blogs"
                    :key="blog.id"
                    :href="`/blog/${blog.slug}`"
                    class="group overflow-hidden rounded-lg border border-[#1e2875]/10 bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                    <img
                        v-if="blog.cover_image_url"
                        :src="blog.cover_image_url"
                        :alt="blog.title_en"
                        class="h-44 w-full object-cover"
                    />
                    <div v-else class="flex h-44 items-center justify-center bg-[#1e2875]/5">
                        <AppIcon name="book-open" class="h-10 w-10 text-[#1e2875]/30" />
                    </div>
                    <div class="p-5">
                        <p class="text-xs text-[#1a1a1a]/50">{{ formatDate(blog.published_at) }}</p>
                        <h3 class="mt-1 font-serif text-lg font-bold text-[#1e2875] group-hover:text-[#c9a227]">
                            {{ blog.title_en }}
                        </h3>
                        <p class="mt-2 line-clamp-2 text-sm text-[#1a1a1a]/70">{{ blog.excerpt }}</p>
                    </div>
                </Link>
            </div>
        </section>
    </div>
</template>
