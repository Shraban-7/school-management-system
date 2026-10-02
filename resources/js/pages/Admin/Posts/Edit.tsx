import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState, FormEvent, ChangeEvent } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import AppIcon from '@/components/AppIcon';
import RichTextEditor from '@/components/RichTextEditor';
import { useSidebarStack } from '@/composables/useNavStack';
import type { SidebarConfig } from '@/types/sidebar';

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

interface Props {
    sidebar: SidebarConfig;
    type: string;
    typeLabel: string;
    post: Post;
}

export default function Edit({ sidebar, type, typeLabel, post }: Props) {
    const sidebarStack = useSidebarStack();
    useEffect(() => {
        sidebarStack.set(sidebar);
    }, [sidebar]);

    const { flash } = usePage<{ flash?: { message?: string } }>().props;

    const [form, setForm] = useState({
        title_en: post.title_en,
        title_bn: post.title_bn ?? '',
        body: post.body,
        is_published: post.is_published,
        published_at: post.published_at ?? '',
        remove_cover_image: false,
        remove_attachment: false,
    });

    const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
    const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    function onCoverImageChange(event: ChangeEvent<HTMLInputElement>) {
        setCoverImageFile(event.target.files?.[0] ?? null);
    }

    function onAttachmentChange(event: ChangeEvent<HTMLInputElement>) {
        setAttachmentFile(event.target.files?.[0] ?? null);
    }

    function submit(e: FormEvent) {
        e.preventDefault();
        router.post(
            `/admin/posts/${type}/${post.id}`,
            {
                _method: 'put',
                title_en: form.title_en,
                title_bn: form.title_bn,
                body: form.body,
                is_published: form.is_published,
                published_at: form.published_at || null,
                cover_image: coverImageFile,
                remove_cover_image: form.remove_cover_image,
                attachment: attachmentFile,
                remove_attachment: form.remove_attachment,
            },
            {
                forceFormData: true,
                onError: (err) => {
                    setErrors(err);
                },
                onSuccess: () => {
                    setErrors({});
                    setCoverImageFile(null);
                    setAttachmentFile(null);
                    setForm((prev) => ({
                        ...prev,
                        remove_cover_image: false,
                        remove_attachment: false,
                    }));
                },
            },
        );
    }

    const inputClass =
        'mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100';
    const labelClass =
        'block text-sm font-medium text-slate-700 dark:text-slate-300';
    const errorClass = 'mt-1 text-xs text-rose-500';

    return (
        <DashboardLayout>
            <Head title={`Edit ${typeLabel}`} />

            <div className="space-y-6">
                <header className="flex items-center gap-4">
                    <Link
                        href={`/admin/posts/${type}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                    >
                        <AppIcon name="arrow-left" className="h-5 w-5" />
                    </Link>
                    <div>
                        <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase dark:text-slate-400">
                            Communication
                        </p>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
                            Edit {typeLabel.toLowerCase()}
                        </h1>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            {post.title_en}
                        </p>
                    </div>
                </header>

                {flash?.message && (
                    <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
                        {flash.message}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-8">
                    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
                            Details
                        </h2>

                        <div className="grid gap-6 sm:grid-cols-2">
                            <div>
                                <label htmlFor="title_en" className={labelClass}>
                                    Title (English) <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    id="title_en"
                                    value={form.title_en}
                                    onChange={(e) =>
                                        setForm({ ...form, title_en: e.target.value })
                                    }
                                    type="text"
                                    className={`${inputClass} ${
                                        errors.title_en ? 'border-rose-500' : ''
                                    }`}
                                />
                                {errors.title_en && (
                                    <p className={errorClass}>{errors.title_en}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="title_bn" className={labelClass}>
                                    Title (Bangla)
                                </label>
                                <input
                                    id="title_bn"
                                    value={form.title_bn}
                                    onChange={(e) =>
                                        setForm({ ...form, title_bn: e.target.value })
                                    }
                                    type="text"
                                    className={`${inputClass} ${
                                        errors.title_bn ? 'border-rose-500' : ''
                                    }`}
                                />
                                {errors.title_bn && (
                                    <p className={errorClass}>{errors.title_bn}</p>
                                )}
                            </div>

                            <div className="sm:col-span-2">
                                <label htmlFor="body" className={labelClass}>
                                    Body <span className="text-rose-500">*</span>
                                </label>
                                <RichTextEditor
                                    value={form.body}
                                    onChange={(html) => setForm({ ...form, body: html })}
                                    invalid={Boolean(errors.body)}
                                />
                                {errors.body && (
                                    <p className={errorClass}>{errors.body}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="published_at" className={labelClass}>
                                    Published date
                                </label>
                                <input
                                    id="published_at"
                                    value={form.published_at}
                                    onChange={(e) =>
                                        setForm({ ...form, published_at: e.target.value })
                                    }
                                    type="date"
                                    className={`${inputClass} ${
                                        errors.published_at ? 'border-rose-500' : ''
                                    }`}
                                />
                                {errors.published_at && (
                                    <p className={errorClass}>{errors.published_at}</p>
                                )}
                            </div>

                            <div className="flex items-center gap-3 sm:mt-6">
                                <input
                                    id="is_published"
                                    checked={form.is_published}
                                    onChange={(e) =>
                                        setForm({ ...form, is_published: e.target.checked })
                                    }
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-slate-300 text-accent-600 focus:ring-accent-500 dark:border-slate-600"
                                />
                                <label htmlFor="is_published" className={labelClass}>
                                    Published
                                </label>
                            </div>

                            <div className="sm:col-span-2">
                                <label htmlFor="cover_image" className={labelClass}>
                                    Cover image
                                </label>
                                <div className="mt-2 flex items-start gap-4">
                                    {post.cover_image_url && (
                                        <img
                                            src={post.cover_image_url}
                                            alt="Current cover image"
                                            className="h-16 w-24 rounded-md border border-slate-200 object-cover dark:border-slate-700"
                                        />
                                    )}
                                    <div className="flex-1 space-y-2">
                                        <input
                                            id="cover_image"
                                            type="file"
                                            accept="image/*"
                                            className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200 dark:text-slate-400 dark:file:bg-slate-800 dark:file:text-slate-300 dark:hover:file:bg-slate-700"
                                            onChange={onCoverImageChange}
                                        />
                                        {errors.cover_image && (
                                            <p className={errorClass}>{errors.cover_image}</p>
                                        )}
                                        {post.cover_image_url && (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    id="remove_cover_image"
                                                    checked={form.remove_cover_image}
                                                    onChange={(e) =>
                                                        setForm({
                                                            ...form,
                                                            remove_cover_image: e.target.checked,
                                                        })
                                                    }
                                                    type="checkbox"
                                                    className="h-4 w-4 rounded border-slate-300 text-accent-600 focus:ring-accent-500 dark:border-slate-600"
                                                />
                                                <label
                                                    htmlFor="remove_cover_image"
                                                    className="text-sm text-slate-600 dark:text-slate-400"
                                                >
                                                    Remove current cover image
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="sm:col-span-2">
                                <label htmlFor="attachment" className={labelClass}>
                                    Downloadable attachment (PDF / Word)
                                </label>
                                <div className="mt-2 space-y-2">
                                    {post.attachment_name && (
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            Current:{' '}
                                            {post.attachment_download_url ? (
                                                <a
                                                    href={post.attachment_download_url}
                                                    className="font-medium text-accent-600 hover:underline"
                                                    target="_blank"
                                                    rel="noopener"
                                                >
                                                    {post.attachment_name}
                                                </a>
                                            ) : (
                                                <span>{post.attachment_name}</span>
                                            )}
                                        </p>
                                    )}
                                    <input
                                        id="attachment"
                                        type="file"
                                        accept=".pdf,.doc,.docx,application/pdf"
                                        className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200 dark:text-slate-400 dark:file:bg-slate-800 dark:file:text-slate-300 dark:hover:file:bg-slate-700"
                                        onChange={onAttachmentChange}
                                    />
                                    {errors.attachment && (
                                        <p className={errorClass}>{errors.attachment}</p>
                                    )}
                                    {post.attachment_name && (
                                        <div className="flex items-center gap-2">
                                            <input
                                                id="remove_attachment"
                                                checked={form.remove_attachment}
                                                onChange={(e) =>
                                                    setForm({
                                                        ...form,
                                                        remove_attachment: e.target.checked,
                                                    })
                                                }
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-slate-300 text-accent-600 focus:ring-accent-500 dark:border-slate-600"
                                            />
                                            <label
                                                htmlFor="remove_attachment"
                                                className="text-sm text-slate-600 dark:text-slate-400"
                                            >
                                                Remove current attachment
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="flex items-center gap-3">
                        <button
                            type="submit"
                            className="inline-flex items-center gap-1.5 rounded-md bg-accent-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-700"
                        >
                            <AppIcon name="check" className="h-4 w-4" />
                            Save changes
                        </button>
                        <Link
                            href={`/admin/posts/${type}`}
                            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
