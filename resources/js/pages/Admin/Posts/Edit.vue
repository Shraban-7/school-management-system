<script setup lang="ts">
import { Head, Link, router, usePage } from '@inertiajs/vue3';
import { computed, reactive, ref } from 'vue';
import DashboardLayout from '@/layouts/DashboardLayout.vue';
import AppIcon from '@/components/AppIcon.vue';
import RichTextEditor from '@/components/RichTextEditor.vue';
import { useSidebarStack } from '@/composables/useNavStack';
import type { SidebarConfig } from '@/types/sidebar';

defineOptions({ layout: DashboardLayout });

interface Post {
    id: number;
    title_en: string;
    title_bn: string | null;
    body: string;
    is_published: boolean;
    published_at: string | null;
    cover_image_url: string | null;
    attachment_name: string | null;
    attachment_download_url: string | null;
}

const props = defineProps<{
    sidebar: SidebarConfig;
    type: string;
    typeLabel: string;
    post: Post;
}>();

const sidebarStack = useSidebarStack();
sidebarStack.set(props.sidebar);

const page = usePage();
const flash = computed(() => page.props.flash?.message ?? null);

const form = reactive({
    title_en: props.post.title_en,
    title_bn: props.post.title_bn ?? '',
    body: props.post.body,
    is_published: props.post.is_published,
    published_at: props.post.published_at ?? '',
    remove_cover_image: false,
    remove_attachment: false,
});

const coverImageFile = ref<File | null>(null);
const attachmentFile = ref<File | null>(null);
const errors = ref<Record<string, string>>({});

function onCoverImageChange(event: Event) {
    coverImageFile.value =
        (event.target as HTMLInputElement).files?.[0] ?? null;
}

function onAttachmentChange(event: Event) {
    attachmentFile.value =
        (event.target as HTMLInputElement).files?.[0] ?? null;
}

function submit() {
    router.post(
        `/admin/posts/${props.type}/${props.post.id}`,
        {
            _method: 'put',
            title_en: form.title_en,
            title_bn: form.title_bn,
            body: form.body,
            is_published: form.is_published,
            published_at: form.published_at || null,
            cover_image: coverImageFile.value,
            remove_cover_image: form.remove_cover_image,
            attachment: attachmentFile.value,
            remove_attachment: form.remove_attachment,
        },
        {
            forceFormData: true,
            onError: (err) => {
                errors.value = err;
            },
            onSuccess: () => {
                errors.value = {};
                coverImageFile.value = null;
                attachmentFile.value = null;
                form.remove_cover_image = false;
                form.remove_attachment = false;
            },
        },
    );
}

const inputClass =
    'mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100';
const labelClass =
    'block text-sm font-medium text-slate-700 dark:text-slate-300';
const errorClass = 'mt-1 text-xs text-rose-500';
</script>

<template>
    <div>
        <Head :title="`Edit ${typeLabel}`" />

        <div class="space-y-6">
            <header class="flex items-center gap-4">
                <Link
                    :href="`/admin/posts/${type}`"
                    class="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                >
                    <AppIcon name="arrow-left" class="h-5 w-5" />
                </Link>
                <div>
                    <p
                        class="text-xs font-semibold tracking-widest text-slate-500 uppercase dark:text-slate-400"
                    >
                        Website
                    </p>
                    <h1
                        class="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50"
                    >
                        Edit {{ typeLabel.toLowerCase() }}
                    </h1>
                    <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        {{ post.title_en }}
                    </p>
                </div>
            </header>

            <div
                v-if="flash"
                class="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
            >
                {{ flash }}
            </div>

            <form @submit.prevent="submit" class="space-y-8">
                <section
                    class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                    <h2
                        class="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100"
                    >
                        Details
                    </h2>

                    <div class="grid gap-6 sm:grid-cols-2">
                        <div>
                            <label for="title_en" :class="labelClass">
                                Title (English)
                                <span class="text-rose-500">*</span>
                            </label>
                            <input
                                id="title_en"
                                v-model="form.title_en"
                                type="text"
                                :class="[
                                    inputClass,
                                    { 'border-rose-500': errors.title_en },
                                ]"
                            />
                            <p v-if="errors.title_en" :class="errorClass">
                                {{ errors.title_en }}
                            </p>
                        </div>

                        <div>
                            <label for="title_bn" :class="labelClass">
                                Title (Bangla)
                            </label>
                            <input
                                id="title_bn"
                                v-model="form.title_bn"
                                type="text"
                                :class="[
                                    inputClass,
                                    { 'border-rose-500': errors.title_bn },
                                ]"
                            />
                            <p v-if="errors.title_bn" :class="errorClass">
                                {{ errors.title_bn }}
                            </p>
                        </div>

                        <div class="sm:col-span-2">
                            <label for="body" :class="labelClass">
                                Body <span class="text-rose-500">*</span>
                            </label>
                            <RichTextEditor
                                v-model="form.body"
                                :invalid="Boolean(errors.body)"
                            />
                            <p v-if="errors.body" :class="errorClass">
                                {{ errors.body }}
                            </p>
                        </div>

                        <div>
                            <label for="published_at" :class="labelClass">
                                Published date
                            </label>
                            <input
                                id="published_at"
                                v-model="form.published_at"
                                type="date"
                                :class="[
                                    inputClass,
                                    { 'border-rose-500': errors.published_at },
                                ]"
                            />
                            <p v-if="errors.published_at" :class="errorClass">
                                {{ errors.published_at }}
                            </p>
                        </div>

                        <div class="flex items-center gap-3 sm:mt-6">
                            <input
                                id="is_published"
                                v-model="form.is_published"
                                type="checkbox"
                                class="h-4 w-4 rounded border-slate-300 text-accent-600 focus:ring-accent-500 dark:border-slate-600"
                            />
                            <label for="is_published" :class="labelClass">
                                Published
                            </label>
                        </div>

                        <div class="sm:col-span-2">
                            <label for="cover_image" :class="labelClass">
                                Cover image
                            </label>
                            <div class="mt-2 flex items-start gap-4">
                                <img
                                    v-if="post.cover_image_url"
                                    :src="post.cover_image_url"
                                    alt="Current cover image"
                                    class="h-16 w-24 rounded-md border border-slate-200 object-cover dark:border-slate-700"
                                />
                                <div class="flex-1 space-y-2">
                                    <input
                                        id="cover_image"
                                        type="file"
                                        accept="image/*"
                                        class="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200 dark:text-slate-400 dark:file:bg-slate-800 dark:file:text-slate-300 dark:hover:file:bg-slate-700"
                                        @change="onCoverImageChange"
                                    />
                                    <p
                                        v-if="errors.cover_image"
                                        :class="errorClass"
                                    >
                                        {{ errors.cover_image }}
                                    </p>
                                    <div
                                        v-if="post.cover_image_url"
                                        class="flex items-center gap-2"
                                    >
                                        <input
                                            id="remove_cover_image"
                                            v-model="form.remove_cover_image"
                                            type="checkbox"
                                            class="h-4 w-4 rounded border-slate-300 text-accent-600 focus:ring-accent-500 dark:border-slate-600"
                                        />
                                        <label
                                            for="remove_cover_image"
                                            class="text-sm text-slate-600 dark:text-slate-400"
                                        >
                                            Remove current cover image
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="sm:col-span-2">
                            <label for="attachment" :class="labelClass">
                                Downloadable attachment (PDF / Word)
                            </label>
                            <div class="mt-2 space-y-2">
                                <p
                                    v-if="post.attachment_name"
                                    class="text-sm text-slate-600 dark:text-slate-400"
                                >
                                    Current:
                                    <a
                                        v-if="post.attachment_download_url"
                                        :href="post.attachment_download_url"
                                        class="font-medium text-accent-600 hover:underline"
                                        target="_blank"
                                        rel="noopener"
                                    >
                                        {{ post.attachment_name }}
                                    </a>
                                    <span v-else>{{ post.attachment_name }}</span>
                                </p>
                                <input
                                    id="attachment"
                                    type="file"
                                    accept=".pdf,.doc,.docx,application/pdf"
                                    class="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200 dark:text-slate-400 dark:file:bg-slate-800 dark:file:text-slate-300 dark:hover:file:bg-slate-700"
                                    @change="onAttachmentChange"
                                />
                                <p v-if="errors.attachment" :class="errorClass">
                                    {{ errors.attachment }}
                                </p>
                                <div
                                    v-if="post.attachment_name"
                                    class="flex items-center gap-2"
                                >
                                    <input
                                        id="remove_attachment"
                                        v-model="form.remove_attachment"
                                        type="checkbox"
                                        class="h-4 w-4 rounded border-slate-300 text-accent-600 focus:ring-accent-500 dark:border-slate-600"
                                    />
                                    <label
                                        for="remove_attachment"
                                        class="text-sm text-slate-600 dark:text-slate-400"
                                    >
                                        Remove current attachment
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <div class="flex items-center gap-3">
                    <button
                        type="submit"
                        class="inline-flex items-center gap-1.5 rounded-md bg-accent-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-700"
                    >
                        <AppIcon name="check" class="h-4 w-4" />
                        Save changes
                    </button>
                    <Link
                        :href="`/admin/posts/${type}`"
                        class="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    </div>
</template>
