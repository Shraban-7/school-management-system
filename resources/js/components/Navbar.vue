<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { cn } from '@/lib/utils';

type Variant = 'light' | 'dark' | 'transparent';

const props = withDefaults(
    defineProps<{
        brand?: string;
        brandLogo?: string;
        brandHref?: string;
        variant?: Variant;
        sticky?: boolean;
        bordered?: boolean;
    }>(),
    {
        brand: '',
        brandLogo: '',
        brandHref: '/',
        variant: 'light',
        sticky: false,
        bordered: true,
    },
);

const mobileOpen = ref(false);
const scrolled = ref(false);

const onScroll = () => {
    scrolled.value = window.scrollY > 8;
};

onMounted(() => {
    if (props.sticky) {
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }
});

onBeforeUnmount(() => {
    window.removeEventListener('scroll', onScroll);
    document.body.style.overflow = '';
});

watch(mobileOpen, (open) => {
    document.body.style.overflow = open ? 'hidden' : '';
});

const navClasses = cn(
    'z-40 w-full transition-colors duration-200',
    props.variant === 'dark'
        ? 'bg-slate-900 text-slate-100'
        : props.variant === 'transparent'
          ? 'bg-transparent text-slate-900'
          : 'bg-white text-slate-900',
    props.sticky && 'sticky top-0',
    props.sticky && scrolled && 'shadow-sm',
    props.bordered &&
        (props.variant === 'dark'
            ? 'border-b border-slate-800'
            : 'border-b border-slate-200'),
);

const linkHover = cn(
    'inline-flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
    props.variant === 'dark'
        ? 'text-slate-300 hover:bg-white/5 hover:text-white'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
);
</script>

<template>
    <nav :class="navClasses" aria-label="Primary">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div class="flex h-16 items-center justify-between">
                <!-- Brand -->
                <div class="flex shrink-0 items-center gap-3">
                    <a
                        :href="brandHref"
                        class="flex items-center gap-2 text-base font-semibold tracking-tight"
                    >
                        <img
                            v-if="brandLogo"
                            :src="brandLogo"
                            :alt="brand"
                            class="h-8 w-8 rounded-lg object-cover"
                        />
                        <span v-if="brand">{{ brand }}</span>
                    </a>
                </div>

                <!-- Desktop nav -->
                <div
                    v-if="$slots.nav"
                    class="ml-6 hidden flex-1 md:flex md:items-center md:gap-1"
                >
                    <slot name="nav" :link-class="linkHover" />
                </div>
                <div v-else class="hidden flex-1 md:block" />

                <!-- Right actions -->
                <div
                    v-if="$slots.actions"
                    class="hidden md:flex md:items-center md:gap-2"
                >
                    <slot name="actions" />
                </div>

                <!-- Mobile toggle -->
                <button
                    type="button"
                    class="rounded-md p-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 md:hidden"
                    :class="
                        variant === 'dark'
                            ? 'text-slate-300 hover:bg-white/5 hover:text-white focus-visible:ring-white/40 focus-visible:ring-offset-slate-900'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-400 focus-visible:ring-offset-white'
                    "
                    :aria-expanded="mobileOpen"
                    aria-controls="mobile-menu"
                    aria-label="Toggle menu"
                    @click="mobileOpen = !mobileOpen"
                >
                    <svg
                        v-if="!mobileOpen"
                        class="h-6 w-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M4 6h16M4 12h16M4 18h16"
                        />
                    </svg>
                    <svg
                        v-else
                        class="h-6 w-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
            </div>
        </div>

        <!-- Mobile menu -->
        <Transition name="mob">
            <div
                v-if="mobileOpen"
                id="mobile-menu"
                class="border-t md:hidden"
                :class="
                    variant === 'dark'
                        ? 'border-slate-800 bg-slate-900'
                        : 'border-slate-200 bg-white'
                "
            >
                <div class="space-y-1 px-4 py-3">
                    <slot name="mobile" :link-class="linkHover" />
                </div>
                <div
                    v-if="$slots['mobile-actions']"
                    class="flex flex-col gap-2 border-t px-4 py-3"
                    :class="
                        variant === 'dark'
                            ? 'border-slate-800'
                            : 'border-slate-200'
                    "
                >
                    <slot name="mobile-actions" />
                </div>
            </div>
        </Transition>
    </nav>
</template>

<style scoped>
.mob-enter-active,
.mob-leave-active {
    transition:
        max-height 0.25s ease,
        opacity 0.2s ease;
    overflow: hidden;
}
.mob-enter-from,
.mob-leave-to {
    max-height: 0;
    opacity: 0;
}
.mob-enter-to,
.mob-leave-from {
    max-height: 600px;
    opacity: 1;
}
</style>
