<script setup lang="ts">
import { Link, usePage } from '@inertiajs/vue3'
import { computed } from 'vue'

const props = withDefaults(
    defineProps<{
        brand?: string
        brandLogo?: string
        title?: string
        subtitle?: string
    }>(),
    {
        brand: 'SMS App',
        brandLogo: '',
        title: '',
        subtitle: '',
    },
)

const page = usePage()
const flash = computed(() => page.props.flash?.message ?? null)

const hasHeaderSlot = computed(() => props.title !== '' || props.subtitle !== '')
</script>

<template>
    <div class="flex min-h-screen flex-col bg-slate-50 text-slate-900">
        <header class="px-6 pt-8 sm:px-10 sm:pt-12">
            <Link href="/" class="inline-flex items-center gap-2 font-semibold tracking-tight">
                <img
                    v-if="brandLogo"
                    :src="brandLogo"
                    :alt="brand"
                    class="h-8 w-8 rounded-lg object-cover"
                />
                <span>{{ brand }}</span>
            </Link>
        </header>

        <div class="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
            <div class="w-full max-w-md space-y-6">
                <div v-if="hasHeaderSlot || $slots.header" class="text-center">
                    <slot name="header">
                        <h1
                            v-if="title"
                            class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
                        >
                            {{ title }}
                        </h1>
                        <p v-if="subtitle" class="mt-2 text-sm text-slate-600">
                            {{ subtitle }}
                        </p>
                    </slot>
                </div>

                <div
                    v-if="flash"
                    class="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
                >
                    {{ flash }}
                </div>

                <slot />
            </div>
        </div>

        <footer class="px-6 pb-6 text-center text-xs text-slate-500 sm:px-10 sm:pb-8">
            &copy; {{ new Date().getFullYear() }} {{ brand }}. All rights reserved.
        </footer>
    </div>
</template>
