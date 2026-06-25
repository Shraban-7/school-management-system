<script setup lang="ts">
import { Link, router, usePage } from '@inertiajs/vue3'
import { computed, onMounted, ref, watch } from 'vue'
import AppIcon from '@/components/AppIcon.vue'
import NotificationBell from '@/components/NotificationBell.vue'
import SearchBar from '@/components/SearchBar.vue'
import SidebarGroup from '@/components/SidebarGroup.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import UserMenu from '@/components/UserMenu.vue'
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
const currentUrl = computed(() => page.url)

const COLLAPSE_KEY = 'sidebar-collapsed'
const collapsed = ref(false)
const mobileOpen = ref(false)

onMounted(() => {
    collapsed.value = localStorage.getItem(COLLAPSE_KEY) === 'true'
})

watch(collapsed, (value) => {
    localStorage.setItem(COLLAPSE_KEY, String(value))
})

const brandInitial = computed(() => props.brand.trim().charAt(0).toUpperCase() || 'S')

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
                <Link href="/" class="flex shrink-0 items-center gap-3" :title="brand">
                    <span
                        v-if="!brandLogo"
                        class="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-accent-500 to-accent-700 text-sm font-bold text-white shadow-lg shadow-accent-900/30"
                    >
                        {{ brandInitial }}
                    </span>
                    <img
                        v-else
                        :src="brandLogo"
                        :alt="brand"
                        class="h-9 w-9 shrink-0 rounded-xl object-cover shadow-lg shadow-black/30"
                    />
                    <span
                        v-if="!collapsed"
                        class="truncate font-semibold tracking-tight text-white"
                    >
                        {{ brand }}
                    </span>
                </Link>

                <button
                    v-if="!collapsed"
                    type="button"
                    class="ml-auto inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-white/5 hover:text-white"
                    aria-label="Collapse sidebar"
                    @click="collapsed = true"
                >
                    <AppIcon name="chevron-left" class="h-4 w-4" />
                </button>
                <button
                    v-else
                    type="button"
                    class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-white/5 hover:text-white"
                    aria-label="Expand sidebar"
                    @click="collapsed = false"
                >
                    <AppIcon name="chevron-right" class="h-4 w-4" />
                </button>
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
                            <Link href="/" class="font-semibold tracking-tight text-white" @click="closeMobile">
                                {{ brand }}
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
