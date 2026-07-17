<script setup lang="ts">
import { Head, Link, router, usePage } from '@inertiajs/vue3';
import { computed, ref } from 'vue';
import DashboardLayout from '@/layouts/DashboardLayout.vue';
import AppIcon from '@/components/AppIcon.vue';
import { useSidebarStack } from '@/composables/useNavStack';
import type { SidebarConfig } from '@/types/sidebar';

defineOptions({ layout: DashboardLayout });

interface PostRow {
    id: number;
    title_en: string;
    title_bn: string | null;
    slug: string;
    is_published: boolean;
    published_at: string | null;
    cover_image_url: string | null;
}

const props = defineProps<{
    sidebar: SidebarConfig;
    type: string;
    typeLabel: string;
    posts: {
        data: PostRow[];
        from: number | null;
        to: number | null;
        total: number;
        last_page: number;
        current_page: number;
    };
}>();

const sidebarStack = useSidebarStack();
sidebarStack.set(props.sidebar);

const page = usePage();
const flash = computed(() => page.props.flash?.message ?? null);

const search = ref('');

const filtered = computed(() => {
    if (!search.value) return props.posts.data;
    const q = search.value.toLowerCase();
    return props.posts.data.filter(
        (p) =>
            p.title_en.toLowerCase().includes(q) ||
            (p.title_bn ?? '').toLowerCase().includes(q),
    );
});

function destroy(id: number) {
    if (confirm(`Are you sure you want to delete this ${props.typeLabel.toLowerCase()}?`)) {
        router.delete(`/admin/posts/${props.type}/${id}`);
    }
}
</script>

<template>
    <div>
        <Head :title="typeLabel" />

        <div class="space-y-6">
            <header
                class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
            >
                <div>
                    <p
                        class="text-xs font-semibold tracking-widest text-slate-500 uppercase dark:text-slate-400"
                    >
                        Website
                    </p>
                    <h1
                        class="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50"
                    >
                        {{ typeLabel }}
                    </h1>
                    <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        Manage {{ typeLabel.toLowerCase() }} shown on the
                        website.
                    </p>
                </div>
                <Link
                    :href="`/admin/posts/${type}/create`"
                    class="inline-flex items-center gap-1.5 self-start rounded-md bg-accent-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-700 sm:self-auto"
                >
                    <AppIcon name="plus" class="h-4 w-4" />
                    Create
                </Link>
            </header>

            <div
                v-if="flash"
                class="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
            >
                {{ flash }}
            </div>

            <section
                class="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
                <div
                    class="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800"
                >
                    <label
                        class="relative flex flex-1 items-center sm:max-w-xs"
                    >
                        <AppIcon
                            name="search"
                            class="pointer-events-none absolute left-3 h-4 w-4 text-slate-400"
                        />
                        <input
                            v-model="search"
                            type="search"
                            placeholder="Search…"
                            class="h-9 w-full rounded-md border border-slate-200 bg-white pr-3 pl-9 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500"
                        />
                    </label>
                    <span class="text-xs text-slate-500 dark:text-slate-400">
                        {{ filtered.length }} of {{ posts.total }} items
                    </span>
                </div>

                <div class="overflow-x-auto">
                    <table
                        class="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800"
                    >
                        <thead
                            class="bg-slate-50 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase dark:bg-slate-950/40 dark:text-slate-400"
                        >
                            <tr>
                                <th class="px-4 py-3">Title</th>
                                <th class="px-4 py-3">Status</th>
                                <th class="px-4 py-3">Published at</th>
                                <th class="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody
                            class="divide-y divide-slate-100 dark:divide-slate-800"
                        >
                            <tr
                                v-for="post in filtered"
                                :key="post.id"
                                class="text-slate-700 hover:bg-slate-50/60 dark:text-slate-200 dark:hover:bg-slate-800/40"
                            >
                                <td class="px-4 py-3">
                                    <div class="flex items-center gap-3">
                                        <img
                                            v-if="post.cover_image_url"
                                            :src="post.cover_image_url"
                                            alt=""
                                            class="h-10 w-10 rounded-md border border-slate-200 object-cover dark:border-slate-700"
                                        />
                                        <div>
                                            <p
                                                class="font-medium text-slate-900 dark:text-slate-100"
                                            >
                                                {{ post.title_en }}
                                            </p>
                                            <p
                                                v-if="post.title_bn"
                                                class="text-xs text-slate-500 dark:text-slate-400"
                                            >
                                                {{ post.title_bn }}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-4 py-3">
                                    <span
                                        :class="[
                                            'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium',
                                            post.is_published
                                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
                                        ]"
                                    >
                                        <span
                                            :class="[
                                                'h-1.5 w-1.5 rounded-full',
                                                post.is_published
                                                    ? 'bg-emerald-500'
                                                    : 'bg-slate-400',
                                            ]"
                                        />
                                        {{
                                            post.is_published
                                                ? 'Published'
                                                : 'Draft'
                                        }}
                                    </span>
                                </td>
                                <td class="px-4 py-3 whitespace-nowrap">
                                    {{ post.published_at ?? '—' }}
                                </td>
                                <td class="px-4 py-3 text-right">
                                    <div class="inline-flex items-center gap-1">
                                        <Link
                                            :href="`/admin/posts/${type}/${post.id}/edit`"
                                            class="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                                            aria-label="Edit"
                                        >
                                            <AppIcon
                                                name="pencil"
                                                class="h-4 w-4"
                                            />
                                        </Link>
                                        <button
                                            type="button"
                                            class="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
                                            aria-label="Delete"
                                            @click="destroy(post.id)"
                                        >
                                            <AppIcon
                                                name="trash"
                                                class="h-4 w-4"
                                            />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            <tr v-if="filtered.length === 0">
                                <td
                                    colspan="4"
                                    class="px-4 py-12 text-center text-sm text-slate-500 dark:text-slate-400"
                                >
                                    No {{ typeLabel.toLowerCase() }} found.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    </div>
</template>
