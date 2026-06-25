<script setup lang="ts">
import { Link, usePage } from '@inertiajs/vue3'
import { computed } from 'vue'
import AppIcon from '@/components/AppIcon.vue'
import type { SidebarItem, SidebarGroup } from '@/types/sidebar'

const props = defineProps<{
    groups: SidebarGroup[]
    collapsed?: boolean
}>()

const page = usePage()
const currentUrl = computed(() => page.url)

function isActive(item: SidebarItem): boolean {
    if (item.active !== undefined) {
        return item.active
    }
    const match = item.match ?? item.href.replace(/^\//, '')
    if (match === '' || match === '/') {
        return currentUrl.value === '/'
    }
    return (
        currentUrl.value === `/${match}` ||
        currentUrl.value.startsWith(`/${match}/`)
    )
}

function linkClass(active: boolean): string {
    return [
        'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        active
            ? 'bg-accent-600 text-white shadow-sm'
            : 'text-slate-300 hover:bg-white/5 hover:text-white',
    ].join(' ')
}
</script>

<template>
    <nav class="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-4">
        <div v-for="(group, gi) in groups" :key="gi" class="flex flex-col gap-1">
            <p
                v-if="group.title && !collapsed"
                class="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500"
            >
                {{ group.title }}
            </p>
            <Link
                v-for="(item, i) in group.items"
                :key="`${gi}-${i}-${item.href}`"
                :href="item.href"
                :class="[linkClass(isActive(item)), collapsed ? 'justify-center px-2' : '']"
                :title="collapsed ? item.label : undefined"
                :aria-current="isActive(item) ? 'page' : undefined"
            >
                <AppIcon
                    :name="item.icon"
                    :class="`h-5 w-5 shrink-0 ${isActive(item) ? 'text-white' : 'text-slate-400 group-hover:text-white'}`"
                />
                <span v-if="!collapsed" class="flex-1 truncate">{{ item.label }}</span>
                <span
                    v-if="!collapsed && item.badge"
                    class="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-600 px-1.5 text-[10px] font-semibold text-white"
                >
                    {{ item.badge }}
                </span>
            </Link>
        </div>
    </nav>
</template>
