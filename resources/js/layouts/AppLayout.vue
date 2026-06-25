<script setup lang="ts">
import { computed } from 'vue'
import { Link, router, usePage } from '@inertiajs/vue3'
import Navbar from '@/components/Navbar.vue'
import { useStacks } from '@/lib/stacks'
import type { NavLink, NavAction } from '@/types/nav'
import type { AuthUser } from '@/types/auth'

const props = withDefaults(
    defineProps<{
        brand?: string
        brandLogo?: string
        sticky?: boolean
        bordered?: boolean
    }>(),
    {
        brand: 'SMS App',
        brandLogo: '',
        sticky: false,
        bordered: true,
    },
)

const page = usePage()
const stacks = useStacks()
const currentUrl = computed(() => page.url)
const user = computed<AuthUser | null>(() => page.props.auth?.user ?? null)

const dashboardByRole: Record<string, string> = {
    admin: '/admin/dashboard',
    headmaster: '/headmaster/dashboard',
    teacher: '/teacher/dashboard',
    student: '/student/dashboard',
    staff: '/staff/dashboard',
}

const dashboardUrl = computed(() =>
    user.value ? dashboardByRole[user.value.role] ?? '/' : null,
)

const defaultLinks: NavLink[] = [
    { label: 'Home', href: '/', match: 'home' },
    { label: 'About', href: '/about', match: 'about' },
    { label: 'Contact', href: '/contact', match: 'contact' },
]

const defaultActions = computed<NavAction[]>(() => {
    if (user.value) {
        const actions: NavAction[] = []
        if (dashboardUrl.value) {
            actions.push({
                label: 'Dashboard',
                href: dashboardUrl.value,
                variant: 'primary',
            })
        }
        actions.push({
            label: 'Logout',
            variant: 'secondary',
            onClick: () => router.post('/logout'),
        })
        return actions
    }
    return [{ label: 'Sign in', href: '/login', variant: 'primary' }]
})

const navItems = computed<NavLink[]>(() => {
    const items = stacks.get<NavLink>('app.nav')
    return items.length > 0 ? items : defaultLinks
})

const actionItems = computed<NavAction[]>(() => {
    const items = stacks.get<NavAction>('app.actions')
    return items.length > 0 ? items : defaultActions.value
})

const mobileItems = computed<NavLink[]>(() => {
    const items = stacks.get<NavLink>('app.mobile')
    return items.length > 0 ? items : defaultLinks
})

const mobileActionItems = computed<NavAction[]>(() => {
    const items = stacks.get<NavAction>('app.mobile-actions')
    return items.length > 0 ? items : defaultActions.value
})

const isActive = (link: NavLink): boolean => {
    if (link.active !== undefined) return link.active
    const match = link.match ?? link.href.replace(/^\//, '')
    if (match === '' || match === '/') return currentUrl.value === '/'
    return currentUrl.value === `/${match}` || currentUrl.value.startsWith(`/${match}/`)
}

const linkClass = (active: boolean): string =>
    active
        ? 'inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-slate-900 bg-slate-100'
        : 'inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-slate-600 hover:text-slate-900 hover:bg-slate-100'

const mobileLinkClass = (active: boolean): string =>
    active
        ? 'block px-3 py-2 text-base font-medium rounded-md transition-colors text-slate-900 bg-slate-100'
        : 'block px-3 py-2 text-base font-medium rounded-md transition-colors text-slate-600 hover:text-slate-900 hover:bg-slate-100'

const actionClass = (action: NavAction): string =>
    action.variant === 'primary'
        ? 'inline-flex items-center rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800'
        : 'inline-flex items-center rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100'

const mobileActionClass = (action: NavAction): string =>
    action.variant === 'primary'
        ? 'block rounded-md bg-slate-900 px-3 py-2 text-center text-sm font-semibold text-white'
        : 'block w-full rounded-md border border-slate-300 px-3 py-2 text-center text-sm font-semibold text-slate-700'
</script>

<template>
    <main class="min-h-screen bg-white text-slate-900">
        <Navbar
            :brand="brand"
            :brand-logo="brandLogo"
            variant="light"
            :sticky="sticky"
            :bordered="bordered"
            brand-href="/"
        >
            <template #nav>
                <Link
                    v-for="(link, i) in navItems"
                    :key="`nav-${i}-${link.href}`"
                    :href="link.href"
                    :class="linkClass(isActive(link))"
                    :aria-current="isActive(link) ? 'page' : undefined"
                >
                    {{ link.label }}
                </Link>
            </template>

            <template #actions>
                <template v-for="(action, i) in actionItems" :key="`action-${i}-${action.label}`">
                    <Link
                        v-if="action.href"
                        :href="action.href"
                        :class="actionClass(action)"
                    >
                        {{ action.label }}
                    </Link>
                    <button
                        v-else
                        type="button"
                        :class="actionClass(action)"
                        @click="action.onClick?.()"
                    >
                        {{ action.label }}
                    </button>
                </template>
            </template>

            <template #mobile>
                <Link
                    v-for="(link, i) in mobileItems"
                    :key="`mobile-${i}-${link.href}`"
                    :href="link.href"
                    :class="mobileLinkClass(isActive(link))"
                    :aria-current="isActive(link) ? 'page' : undefined"
                >
                    {{ link.label }}
                </Link>
            </template>

            <template #mobile-actions>
                <template v-for="(action, i) in mobileActionItems" :key="`maction-${i}-${action.label}`">
                    <Link
                        v-if="action.href"
                        :href="action.href"
                        :class="mobileActionClass(action)"
                    >
                        {{ action.label }}
                    </Link>
                    <button
                        v-else
                        type="button"
                        :class="mobileActionClass(action)"
                        @click="action.onClick?.()"
                    >
                        {{ action.label }}
                    </button>
                </template>
            </template>
        </Navbar>

        <article class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <slot />
        </article>

        <footer class="border-t border-slate-200 bg-white">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-sm text-slate-500">
                &copy; {{ new Date().getFullYear() }} {{ brand }}. All rights reserved.
            </div>
        </footer>
    </main>
</template>
