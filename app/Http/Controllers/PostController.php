<?php

namespace App\Http\Controllers;

use App\Enums\PostType;
use App\Http\Requests\StorePostRequest;
use App\Http\Requests\UpdatePostRequest;
use App\Models\Post;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PostController extends Controller
{
    public function index(Request $request, string $type): Response
    {
        $postType = $this->resolveType($type);

        $posts = Post::query()
            ->ofType($postType)
            ->orderByDesc('published_at')
            ->orderByDesc('created_at')
            ->paginate(20)
            ->through(fn (Post $post) => [
                'id' => $post->id,
                'title_en' => $post->title_en,
                'title_bn' => $post->title_bn,
                'slug' => $post->slug,
                'is_published' => (bool) $post->is_published,
                'published_at' => $post->published_at?->toDateString(),
                'cover_image_url' => $post->coverImageUrl(),
                'created_at' => $post->created_at?->toDateString(),
            ]);

        return Inertia::render('Admin/Posts/Index', [
            'sidebar' => app(DashboardController::class)->adminSidebar(),
            'type' => $postType->value,
            'typeLabel' => $postType->pluralLabel(),
            'posts' => $posts,
        ]);
    }

    public function create(string $type): Response
    {
        $postType = $this->resolveType($type);

        return Inertia::render('Admin/Posts/Create', [
            'sidebar' => app(DashboardController::class)->adminSidebar(),
            'type' => $postType->value,
            'typeLabel' => $postType->label(),
        ]);
    }

    public function store(StorePostRequest $request, string $type): RedirectResponse
    {
        $postType = $this->resolveType($type);
        $validated = $request->validated();

        $post = new Post;
        $post->forceFill([
            'type' => $postType,
            'title_en' => $validated['title_en'],
            'title_bn' => $validated['title_bn'] ?? null,
            'body' => $validated['body'],
            'is_published' => $request->boolean('is_published'),
            'published_at' => $request->boolean('is_published')
                ? ($validated['published_at'] ?? now())
                : ($validated['published_at'] ?? null),
            'created_by' => $request->user()?->id,
            'slug' => Post::uniqueSlug($validated['title_en']),
        ]);

        if ($request->hasFile('cover_image')) {
            $post->cover_image_path = $request->file('cover_image')->store('posts', 'public');
        }

        $post->save();

        return to_route('admin.posts.index', ['type' => $postType->value])
            ->with('flash.message', $postType->label().' created successfully.');
    }

    public function edit(string $type, Post $post): Response
    {
        $postType = $this->resolveType($type);
        abort_unless($post->type === $postType, 404);

        return Inertia::render('Admin/Posts/Edit', [
            'sidebar' => app(DashboardController::class)->adminSidebar(),
            'type' => $postType->value,
            'typeLabel' => $postType->label(),
            'post' => [
                'id' => $post->id,
                'title_en' => $post->title_en,
                'title_bn' => $post->title_bn,
                'body' => $post->body,
                'is_published' => (bool) $post->is_published,
                'published_at' => $post->published_at?->toDateString(),
                'cover_image_url' => $post->coverImageUrl(),
            ],
        ]);
    }

    public function update(UpdatePostRequest $request, string $type, Post $post): RedirectResponse
    {
        $postType = $this->resolveType($type);
        abort_unless($post->type === $postType, 404);

        $validated = $request->validated();
        $isPublished = $request->boolean('is_published');

        $post->forceFill([
            'title_en' => $validated['title_en'],
            'title_bn' => $validated['title_bn'] ?? null,
            'body' => $validated['body'],
            'is_published' => $isPublished,
            'published_at' => $isPublished
                ? ($validated['published_at'] ?? $post->published_at ?? now())
                : ($validated['published_at'] ?? null),
            'slug' => Post::uniqueSlug($validated['title_en'], $post->id),
        ]);

        if ($request->boolean('remove_cover_image') && $post->cover_image_path) {
            Storage::disk('public')->delete($post->cover_image_path);
            $post->cover_image_path = null;
        }

        if ($request->hasFile('cover_image')) {
            if ($post->cover_image_path) {
                Storage::disk('public')->delete($post->cover_image_path);
            }
            $post->cover_image_path = $request->file('cover_image')->store('posts', 'public');
        }

        $post->save();

        return to_route('admin.posts.index', ['type' => $postType->value])
            ->with('flash.message', $postType->label().' updated successfully.');
    }

    public function destroy(string $type, Post $post): RedirectResponse
    {
        $postType = $this->resolveType($type);
        abort_unless($post->type === $postType, 404);

        if ($post->cover_image_path) {
            Storage::disk('public')->delete($post->cover_image_path);
        }

        $post->delete();

        return to_route('admin.posts.index', ['type' => $postType->value])
            ->with('flash.message', $postType->label().' deleted successfully.');
    }

    private function resolveType(string $type): PostType
    {
        return PostType::tryFrom($type) ?? abort(404);
    }
}
