<?php

namespace App\Models;

use App\Enums\PostType;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

#[Guarded(['*'])]
class Post extends Model
{
    protected function casts(): array
    {
        return [
            'type' => PostType::class,
            'is_published' => 'boolean',
            'published_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::saving(function (Post $post): void {
            if (blank($post->slug) && filled($post->title_en)) {
                $post->slug = static::uniqueSlug($post->title_en, $post->id);
            }
        });
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query
            ->where('is_published', true)
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now());
    }

    public function scopeOfType(Builder $query, PostType|string $type): Builder
    {
        return $query->where('type', $type instanceof PostType ? $type->value : $type);
    }

    public function coverImageUrl(): ?string
    {
        return $this->cover_image_path
            ? asset('storage/'.$this->cover_image_path)
            : null;
    }

    /**
     * @return array<string, mixed>
     */
    public function toPublicArray(): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type->value,
            'title_en' => $this->title_en,
            'title_bn' => $this->title_bn,
            'slug' => $this->slug,
            'body' => $this->body,
            'cover_image_url' => $this->coverImageUrl(),
            'published_at' => $this->published_at?->toDateString(),
            'excerpt' => Str::limit(strip_tags($this->body), 160),
        ];
    }

    public static function uniqueSlug(string $title, ?int $ignoreId = null): string
    {
        $base = Str::slug($title) ?: 'post';
        $slug = $base;
        $i = 1;

        while (
            static::query()
                ->when($ignoreId, fn (Builder $q) => $q->where('id', '!=', $ignoreId))
                ->where('slug', $slug)
                ->exists()
        ) {
            $slug = $base.'-'.$i++;
        }

        return $slug;
    }
}
