<script setup lang="ts">
import { Link, router, usePage } from '@inertiajs/vue3'
import { computed, onMounted, ref, watch } from 'vue'
import AppIcon from '@/components/AppIcon.vue'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import NotificationBell from '@/components/NotificationBell.vue'
import SearchBar from '@/components/SearchBar.vue'
import SidebarGroup from '@/components/SidebarGroup.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import UserMenu from '@/components/UserMenu.vue'
import { useI18n } from '@/composables/useI18n'
import { useStacks } from '@/lib/stacks'
import type { SidebarConfig } from '@/types/sidebar'
import { cn } from '@/lib/utils'

const props = withDefaults(
    defineProps<{
        brand?: string
        brandLogo?: string
        notificationCount?: number
    }>(),
    {
        brand: 'SMS App',
        brandLogo: '',
        notificationCount: 0,
    },
)

const page = usePage()
const stacks = useStacks()
const { t, bi } = useI18n()
const currentUrl = computed(() => page.url)

interface SchoolBrand {
    name_en?: string | null
    name_bn?: string | null
    logo_url?: string | null
}

const school = computed<SchoolBrand>(
    () => ((page.props as Record<string, unknown>).school as SchoolBrand) ?? {},
)

const brandName = computed(() => bi(school.value.name_en, school.value.name_bn) || props.brand)
const brandLogoUrl = computed(() => school.value.logo_url || props.brandLogo)

const COLLAPSE_KEY = 'sidebar-collapsed'
const collapsed = ref(false)
const mobileOpen = ref(false)

onMounted(() => {
    collapsed.value = localStorage.getItem(COLLAPSE_KEY) === 'true'
})

watch(collapsed, (value) => {
    localStorage.setItem(COLLAPSE_KEY, String(value))
})

const brandInitial = computed(() => brandName.value.trim().charAt(0).toUpperCase() || 'S')

const flashError = computed(() => page.props.flash?.error ?? null)
const showErrorModal = ref(false)
const errorMessage = ref('')

watch(
    flashError,
    (value) => {
        if (value) {
            errorMessage.value = value
            showErrorModal.value = true
        }
    },
    { immediate: true },
)

function dismissError() {
    showErrorModal.value = false
}

const defaultSidebar: SidebarConfig = [
    {
        items: [
            { label: 'Overview', href: '/', icon: 'home' },
            { label: 'Profile', href: '#', icon: 'user' },
            { label: 'Settings', href: '#', icon: 'cog' },
        ],
    },
]

const sidebar = computed<SidebarConfig>(() => {
    // Globally shared sidebar (HandleInertiaRequests) wins so the menu
    // never disappears when a page forgets to set the sidebar stack.
    const shared = (page.props as Record<string, unknown>).sidebar as SidebarConfig | undefined
    if (Array.isArray(shared) && shared.length > 0) {
        return shared
    }

    const groups = stacks.get<SidebarConfig>('dashboard.sidebar')
    return groups.length > 0 ? (groups as unknown as SidebarConfig) : defaultSidebar
})

const sidebarWidth = computed(() => (collapsed.value ? 'lg:w-16' : 'lg:w-64'))
const mainOffset = computed(() => (collapsed.value ? 'lg:pl-16' : 'lg:pl-64'))

function onLogout() {
    router.post('/logout')
}

function closeMobile() {
    mobileOpen.value = false
}

const linkClass = (active: boolean) =>
    cn(
        'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        active
            ? 'bg-accent-600 text-white shadow-sm'
            : 'text-slate-300 hover:bg-white/5 hover:text-white',
    )
</script>

<template>
    <div class="flex min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <!-- Desktop sidebar -->
        <aside
            :class="[
                'hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 bg-slate-900 text-slate-100 transition-[width] duration-200 ease-out',
                sidebarWidth,
            ]"
        >
            <div
                :class="[
                    'flex h-16 items-center border-b border-slate-800',
                    collapsed ? 'justify-center gap-2 px-2' : 'gap-3 px-3',
                ]"
            >
                <Link href="/" class="flex min-w-0 shrink items-center gap-3" :title="brandName">
                    <span
                        v-if="!brandLogoUrl"
                        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-accent-500 to-accent-700 text-sm font-bold text-white shadow-lg shadow-accent-900/30"
                    >
                        {{ brandInitial }}
                    </span>
                    <img
                        v-else
                        :src="brandLogoUrl"
                        :alt="brandName"
                        class="h-9 w-9 shrink-0 rounded-xl object-cover shadow-lg shadow-black/30"
                    />
                    <span
                        v-if="!collapsed"
                        class="truncate font-semibold tracking-tight text-white"
                    >
                        {{ brandName }}
                    </span>
                </Link>
            </div>

            <SidebarGroup :groups="sidebar" :collapsed="collapsed" />
        </aside>

        <!-- Mobile sidebar (overlay) -->
        <Transition
            enter-active-class="transition-opacity duration-200"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="transition-opacity duration-200"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
        >
            <div
                v-if="mobileOpen"
                class="fixed inset-0 z-50 lg:hidden"
                role="dialog"
                aria-modal="true"
            >
                <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="closeMobile" />
                <Transition
                    appear
                    enter-active-class="transition-transform duration-200 ease-out"
                    enter-from-class="-translate-x-full"
                    enter-to-class="translate-x-0"
                    leave-active-class="transition-transform duration-200 ease-in"
                    leave-from-class="translate-x-0"
                    leave-to-class="-translate-x-full"
                >
                    <aside
                        class="absolute inset-y-0 left-0 flex w-72 flex-col bg-slate-900 text-slate-100 shadow-xl"
                    >
                        <div class="flex h-16 items-center justify-between border-b border-slate-800 px-6">
                            <Link
                                href="/"
                                class="flex min-w-0 items-center gap-2.5 font-semibold tracking-tight text-white"
                                @click="closeMobile"
                            >
                                <img
                                    v-if="brandLogoUrl"
                                    :src="brandLogoUrl"
                                    :alt="brandName"
                                    class="h-8 w-8 shrink-0 rounded-lg object-cover"
                                />
                                <span class="truncate">{{ brandName }}</span>
                            </Link>
                            <button
                                type="button"
                                class="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-300 hover:bg-white/5 hover:text-white"
                                aria-label="Close menu"
                                @click="closeMobile"
                            >
                                <AppIcon name="close" class="h-5 w-5" />
                            </button>
                        </div>
                        <SidebarGroup :groups="sidebar" />
                    </aside>
                </Transition>
            </div>
        </Transition>

        <!-- Main column -->
        <div :class="['flex flex-1 flex-col transition-[padding] duration-200 ease-out', mainOffset]">
            <!-- Topbar -->
            <header
                class="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur sm:px-6 dark:border-slate-800 dark:bg-slate-900/80"
            >
                <div class="flex items-center gap-2 sm:gap-3">
                    <button
                        type="button"
                        class="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-600 transition hover:bg-slate-100 lg:hidden dark:text-slate-300 dark:hover:bg-slate-800"
                        aria-label="Open menu"
                        @click="mobileOpen = true"
                    >
                        <AppIcon name="menu" class="h-5 w-5" />
                    </button>
                    <button
                        type="button"
                        class="hidden h-9 w-9 items-center justify-center rounded-md text-slate-600 transition hover:bg-slate-100 lg:inline-flex dark:text-slate-300 dark:hover:bg-slate-800"
                        :aria-label="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
                        :title="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
                        @click="collapsed = !collapsed"
                    >
                        <AppIcon name="panel-left" class="h-5 w-5" />
                    </button>
                    <SearchBar placeholder="Search…" class="hidden sm:flex" />
                </div>

                <div class="flex items-center gap-1 sm:gap-2">
                    <button
                        type="button"
                        class="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 lg:hidden dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                        aria-label="Search"
                    >
                        <AppIcon name="search" class="h-5 w-5" />
                    </button>
                    <LanguageSwitcher variant="dashboard" />
                    <a
                        href="/"
                        target="_blank"
                        rel="noopener"
                        class="hidden items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 sm:inline-flex dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                    >
                        <AppIcon name="globe" class="h-4 w-4" />
                        {{ t('nav.go_to_website') }}
                    </a>
                    <a
                        href="/"
                        target="_blank"
                        rel="noopener"
                        class="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 sm:hidden dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                        :aria-label="t('nav.go_to_website')"
                    >
                        <AppIcon name="globe" class="h-5 w-5" />
                    </a>
                    <NotificationBell :count="notificationCount" />
                    <ThemeToggle />
                    <span class="mx-1 hidden h-6 w-px bg-slate-200 sm:block dark:bg-slate-700" />
                    <UserMenu />
                </div>
            </header>

            <!-- Content -->
            <main class="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                <slot />
            </main>
        </div>

        <!-- Not-authorized / error modal -->
        <Transition
            enter-active-class="transition-opacity duration-150"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="transition-opacity duration-150"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
        >
            <div
                v-if="showErrorModal"
                class="fixed inset-0 z-60 flex items-center justify-center p-4"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="error-modal-title"
            >
                <div
                    class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    @click="dismissError"
                />
                <div
                    class="relative w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
                >
                    <div class="flex items-start gap-4">
                        <span
                            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400"
                        >
                            <AppIcon name="lock" class="h-5 w-5" />
                        </span>
                        <div class="min-w-0">
                            <h2
                                id="error-modal-title"
                                class="text-base font-semibold text-slate-900 dark:text-slate-50"
                            >
                                {{ t('profile.not_authorized') }}
                            </h2>
                            <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                {{ errorMessage }}
                            </p>
                        </div>
                    </div>
                    <div class="mt-5 flex justify-end">
                        <button
                            type="button"
                            class="inline-flex items-center rounded-md bg-accent-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-700"
                            @click="dismissError"
                        >
                            {{ t('profile.ok') }}
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </div>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
    transition: opacity 0.2s ease;
}
.slide-enter-active aside,
.slide-leave-active aside {
    transition: transform 0.25s ease;
}
.slide-enter-from,
.slide-leave-to {
    opacity: 0;
}
.slide-enter-from aside,
.slide-leave-to aside {
    transform: translateX(-100%);
}
</style>
