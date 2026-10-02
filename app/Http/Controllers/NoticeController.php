<?php

namespace App\Http\Controllers;

use App\Enums\PostType;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class NoticeController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Post::query()
            ->ofType(PostType::NOTICE)
            ->published()
            ->latest('published_at');

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title_en', 'like', "%{$search}%")
                    ->orWhere('title_bn', 'like', "%{$search}%")
                    ->orWhere('body', 'like', "%{$search}%");
            });
        }

        $posts = $query->paginate(15)
            ->through(fn (Post $post) => $post->toPublicArray())
            ->withQueryString();

        return Inertia::render('NoticeBoard/Index', [
            'posts' => $posts,
            'filters' => [
                'search' => $request->query('search', ''),
            ],
        ]);
    }

    public function show(string $slug): Response
    {
        $post = Post::query()
            ->ofType(PostType::NOTICE)
            ->published()
            ->where('slug', $slug)
            ->firstOrFail();

        return Inertia::render('NoticeBoard/Show', [
            'post' => $post->toPublicArray(),
        ]);
    }

    public function downloadNoticeAttachment(string $slug): StreamedResponse
    {
        $post = Post::query()
            ->ofType(PostType::NOTICE)
            ->published()
            ->where('slug', $slug)
            ->firstOrFail();

        abort_unless(
            filled($post->attachment_path) && Storage::disk('public')->exists($post->attachment_path),
            404,
        );

        return Storage::disk('public')->download(
            $post->attachment_path,
            $post->attachmentDownloadFilename(),
        );
    }
}
