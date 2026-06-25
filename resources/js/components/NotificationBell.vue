<script setup lang="ts">
import { ref } from 'vue'
import AppIcon from '@/components/AppIcon.vue'

defineProps<{
    count?: number
}>()

const open = ref(false)

function toggle() {
    open.value = !open.value
}

function close() {
    open.value = false
}
</script>

<template>
    <div class="relative">
        <button
            type="button"
            class="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            aria-label="Notifications"
            @click="toggle"
        >
            <AppIcon name="bell" class="h-5 w-5" />
            <span
                v-if="count && count > 0"
                class="absolute right-1.5 top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-600 px-1 text-[10px] font-semibold leading-none text-white"
            >
                {{ count > 9 ? '9+' : count }}
            </span>
        </button>

        <Transition
            enter-active-class="transition duration-100 ease-out"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition duration-75 ease-in"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
        >
            <div
                v-if="open"
                class="absolute right-0 z-40 mt-2 w-80 origin-top-right overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900"
            >
                <div class="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
                    <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100">Notifications</h3>
                    <button
                        type="button"
                        class="text-xs font-medium text-accent-600 hover:text-accent-700 dark:text-accent-400"
                    >
                        Mark all read
                    </button>
                </div>
                <div class="max-h-80 overflow-y-auto">
                    <div class="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                        <AppIcon name="bell" class="mx-auto mb-2 h-8 w-8 text-slate-300 dark:text-slate-600" />
                        You're all caught up
                    </div>
                </div>
            </div>
        </Transition>

        <div v-if="open" class="fixed inset-0 z-30" @click="close" />
    </div>
</template>
