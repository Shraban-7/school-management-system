<script setup lang="ts">
import { Link, usePage } from '@inertiajs/vue3';
import { computed, ref } from 'vue';
import AppIcon from '@/components/AppIcon.vue';
import LanguageSwitcher from '@/components/LanguageSwitcher.vue';
import { NAV_LABEL_KEYS, useI18n } from '@/composables/useI18n';

interface PublicSchool {
    name_en?: string | null;
    name_bn?: string | null;
    eiin_number?: string | null;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
    logo_url?: string | null;
    footer_tagline?: string | null;
    nav_menu?: { label: string; href: string }[];
}

interface AuthUser {
    name?: string;
    role?: string;
}

const page = usePage();
const { t, bi } = useI18n();

const school = computed<PublicSchool>(
    () => ((page.props as Record<string, unknown>).school as PublicSchool) ?? {},
);

const schoolName = computed(() => bi(school.value.name_en, school.value.name_bn) || 'Our School');
const schoolAltName = computed(() => {
    // Show the other language under the primary name when both exist.
    const primary = schoolName.value;
    const en = school.value.name_en ?? '';
    const bn = school.value.name_bn ?? '';
    if (primary === en && bn && bn !== en) return bn;
    if (primary === bn && en && en !== bn) return en;
    return null;
});
const crestInitial = computed(() => schoolName.value.trim().charAt(0).toUpperCase() || 'S');

const user = computed<AuthUser | null>(() => {
    const auth = (page.props as Record<string, unknown>).auth as
        | { user?: AuthUser | null }
        | undefined;
    return auth?.user ?? null;
});

const dashboardHref = computed(() => {
    const role = user.value?.role;
    const known = ['admin', 'headmaster', 'teacher', 'student', 'staff', 'parent'];
    return role && known.includes(role) ? `/${role}/dashboard` : '/';
});

function translateNavLabel(href: string, fallback: string): string {
    const key = NAV_LABEL_KEYS[href];
    return key ? t(key) : fallback;
}

const navLinks = computed(() => {
    const fromSchool = school.value.nav_menu;
    const base =
        Array.isArray(fromSchool) && fromSchool.length > 0
            ? fromSchool
            : [
                  { label: 'Home', href: '/' },
                  { label: 'About', href: '/about' },
                  { label: 'Admission', href: '/admission' },
                  { label: 'Fees', href: '/fees' },
                  { label: 'Facilities', href: '/facilities' },
                  { label: 'Syllabus', href: '/syllabus' },
                  { label: 'Notices', href: '/notices' },
                  { label: 'Teachers', href: '/teachers' },
                  { label: 'Staff', href: '/staff' },
                  { label: 'Activities', href: '/activities' },
                  { label: 'Blog', href: '/blog' },
                  { label: 'Contact', href: '/contact' },
              ];

    return base.map((link) => ({
        ...link,
        label: translateNavLabel(link.href, link.label),
    }));
});

const footerLinks = computed(() => navLinks.value.filter((l) => l.href !== '/').slice(0, 8));

const mobileOpen = ref(false);

function isActive(href: string): boolean {
    const current = page.url.split('?')[0];
    if (href === '/') return current === '/';
    return current === href || current.startsWith(`${href}/`);
}
</script>

<template>
    <div class="flex min-h-screen flex-col bg-[#f7f3e8] text-[#1a1a1a]">
        <div class="h-1 bg-[#c9a227]" aria-hidden="true"></div>

        <header class="sticky top-0 z-40 border-b border-[#1e2875]/10 bg-[#f7f3e8]/95 backdrop-blur">
            <div class="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
                <Link href="/" class="flex min-w-0 shrink items-center gap-3" :title="schoolName">
                    <img
                        v-if="school.logo_url"
                        :src="school.logo_url"
                        :alt="schoolName"
                        class="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-[#c9a227]"
                    />
                    <span
                        v-else
                        class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1e2875] font-serif text-xl font-bold text-[#f7f3e8] ring-2 ring-[#c9a227]"
                    >
                        {{ crestInitial }}
                    </span>
                    <span class="min-w-0">
                        <span class="block truncate font-serif text-lg leading-tight font-bold text-[#1e2875]">
                            {{ schoolName }}
                        </span>
                        <span
                            v-if="school.eiin_number"
                            class="block truncate text-[11px] tracking-widest whitespace-nowrap text-[#1a1a1a]/60 uppercase"
                        >
                            EIIN {{ school.eiin_number }}
                        </span>
                    </span>
                </Link>

                <nav
                    class="hidden min-w-0 flex-1 flex-wrap items-center justify-end gap-x-0.5 gap-y-1 xl:flex"
                    aria-label="Main navigation"
                >
                    <Link
                        v-for="link in navLinks"
                        :key="link.href"
                        :href="link.href"
                        class="rounded px-2 py-1.5 text-sm font-medium whitespace-nowrap transition-colors"
                        :class="
                            isActive(link.href)
                                ? 'bg-[#1e2875] text-[#f7f3e8]'
                                : 'text-[#1a1a1a]/80 hover:bg-[#1e2875]/10 hover:text-[#1e2875]'
                        "
                    >
                        {{ link.label }}
                    </Link>
                </nav>

                <div class="hidden shrink-0 items-center gap-2 xl:flex">
                    <LanguageSwitcher />
                    <template v-if="user">
                        <Link
                            :href="dashboardHref"
                            class="rounded border border-[#1e2875] px-3.5 py-1.5 text-sm font-semibold text-[#1e2875] transition-colors hover:bg-[#1e2875] hover:text-[#f7f3e8]"
                        >
                            {{ t('nav.dashboard') }}
                        </Link>
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            class="rounded px-3 py-1.5 text-sm font-medium text-[#1a1a1a]/70 transition-colors hover:text-[#1e2875]"
                        >
                            {{ t('nav.logout') }}
                        </Link>
                    </template>
                    <Link
                        v-else
                        href="/login"
                        class="rounded bg-[#1e2875] px-4 py-1.5 text-sm font-semibold text-[#f7f3e8] transition-colors hover:bg-[#c9a227] hover:text-[#1a1a1a]"
                    >
                        {{ t('nav.login') }}
                    </Link>
                </div>

                <div class="flex items-center gap-1 xl:hidden">
                    <LanguageSwitcher />
                    <button
                        type="button"
                        class="rounded p-2 text-[#1e2875] hover:bg-[#1e2875]/10"
                        :aria-expanded="mobileOpen"
                        aria-label="Toggle menu"
                        @click="mobileOpen = !mobileOpen"
                    >
                        <AppIcon :name="mobileOpen ? 'close' : 'menu'" class="h-6 w-6" />
                    </button>
                </div>
            </div>

            <div v-if="mobileOpen" class="border-t border-[#1e2875]/10 bg-[#f7f3e8] xl:hidden">
                <nav class="mx-auto max-w-6xl space-y-1 px-4 py-4 sm:px-6" aria-label="Mobile navigation">
                    <Link
                        v-for="link in navLinks"
                        :key="link.href"
                        :href="link.href"
                        class="block rounded px-3 py-2 text-sm font-medium"
                        :class="
                            isActive(link.href)
                                ? 'bg-[#1e2875] text-[#f7f3e8]'
                                : 'text-[#1a1a1a]/80 hover:bg-[#1e2875]/10'
                        "
                        @click="mobileOpen = false"
                    >
                        {{ link.label }}
                    </Link>

                    <div class="mt-3 border-t border-[#1e2875]/10 pt-3">
                        <template v-if="user">
                            <Link
                                :href="dashboardHref"
                                class="block rounded px-3 py-2 text-sm font-semibold text-[#1e2875] hover:bg-[#1e2875]/10"
                                @click="mobileOpen = false"
                            >
                                {{ t('nav.dashboard') }}
                            </Link>
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                class="block w-full rounded px-3 py-2 text-left text-sm font-medium text-[#1a1a1a]/70 hover:bg-[#1e2875]/10"
                            >
                                {{ t('nav.logout') }}
                            </Link>
                        </template>
                        <Link
                            v-else
                            href="/login"
                            class="block rounded bg-[#1e2875] px-3 py-2 text-center text-sm font-semibold text-[#f7f3e8]"
                            @click="mobileOpen = false"
                        >
                            {{ t('nav.login') }}
                        </Link>
                    </div>
                </nav>
            </div>
        </header>

        <main class="flex-1">
            <slot />
        </main>

        <footer class="bg-[#1e2875] text-[#f7f3e8]">
            <div class="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
                <div>
                    <p class="font-serif text-lg font-bold">{{ schoolName }}</p>
                    <div class="mt-2 h-px w-12 bg-[#c9a227]" aria-hidden="true"></div>
                    <p v-if="schoolAltName" class="mt-3 text-sm text-[#f7f3e8]/80">
                        {{ schoolAltName }}
                    </p>
                    <p v-if="school.footer_tagline" class="mt-3 text-sm text-[#f7f3e8]/70">
                        {{ school.footer_tagline }}
                    </p>
                    <p v-if="school.eiin_number" class="mt-1 text-sm text-[#f7f3e8]/60">
                        EIIN: {{ school.eiin_number }}
                    </p>
                </div>

                <div>
                    <p class="text-xs font-semibold tracking-widest text-[#c9a227] uppercase">
                        {{ t('nav.contact_section') }}
                    </p>
                    <div class="mt-2 h-px w-12 bg-[#c9a227]" aria-hidden="true"></div>
                    <ul class="mt-3 space-y-2 text-sm text-[#f7f3e8]/80">
                        <li v-if="school.address" class="flex items-start gap-2">
                            <AppIcon name="home" class="mt-0.5 h-4 w-4 shrink-0 text-[#c9a227]" />
                            <span>{{ school.address }}</span>
                        </li>
                        <li v-if="school.phone" class="flex items-center gap-2">
                            <AppIcon name="phone" class="h-4 w-4 shrink-0 text-[#c9a227]" />
                            <span>{{ school.phone }}</span>
                        </li>
                        <li v-if="school.email" class="flex items-center gap-2">
                            <AppIcon name="mail" class="h-4 w-4 shrink-0 text-[#c9a227]" />
                            <span>{{ school.email }}</span>
                        </li>
                    </ul>
                </div>

                <div>
                    <p class="text-xs font-semibold tracking-widest text-[#c9a227] uppercase">
                        {{ t('nav.quick_links') }}
                    </p>
                    <div class="mt-2 h-px w-12 bg-[#c9a227]" aria-hidden="true"></div>
                    <ul class="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <li v-for="link in footerLinks" :key="link.href">
                            <Link
                                :href="link.href"
                                class="text-[#f7f3e8]/80 transition-colors hover:text-[#c9a227]"
                            >
                                {{ link.label }}
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>

            <div class="border-t border-[#f7f3e8]/10">
                <p class="mx-auto max-w-6xl px-4 py-4 text-center text-xs text-[#f7f3e8]/60 sm:px-6 lg:px-8">
                    &copy; {{ new Date().getFullYear() }} {{ schoolName }}. {{ t('site.rights') }}
                </p>
            </div>
        </footer>
    </div>
</template>
