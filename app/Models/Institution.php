<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Cache;
use RuntimeException;

#[Guarded(['*'])]
class Institution extends Model
{
    private const CACHE_KEY = 'institution.current';

    private static ?self $currentInstance = null;

    protected function casts(): array
    {
        return [
            'eiin_number' => 'integer',
            'mpo_status' => 'boolean',
            'established_year' => 'integer',
            'nav_menu' => 'array',
            'home_ctas' => 'array',
            'home_sections' => 'array',
            'facility_items' => 'array',
        ];
    }

    public function classesAndSections(): HasMany
    {
        return $this->hasMany(ClassesAndSection::class);
    }

    /**
     * Single-school mode: always the first (and only) institution row.
     *
     * Memoized per request only — persisting the serialized model in the
     * cache store broke with __PHP_Incomplete_Class after code changes.
     */
    public static function current(): self
    {
        if (self::$currentInstance !== null) {
            return self::$currentInstance;
        }

        $institution = static::query()->orderBy('id')->first();

        if ($institution === null) {
            throw new RuntimeException('No school profile has been seeded yet.');
        }

        return self::$currentInstance = $institution;
    }

    public static function forgetCurrentCache(): void
    {
        self::$currentInstance = null;

        // Also drop the legacy persistent cache entry from older builds.
        Cache::forget(self::CACHE_KEY);
    }

    public function logoUrl(): ?string
    {
        return $this->logo_path ? asset('storage/'.$this->logo_path) : null;
    }

    public function headmasterPhotoUrl(): ?string
    {
        return $this->headmaster_photo_path
            ? asset('storage/'.$this->headmaster_photo_path)
            : null;
    }

    /**
     * @return list<array{label: string, href: string, enabled: bool}>
     */
    public static function defaultNavMenu(): array
    {
        return [
            ['label' => 'Home', 'href' => '/', 'enabled' => true],
            ['label' => 'About', 'href' => '/about', 'enabled' => true],
            ['label' => 'Admission', 'href' => '/admission', 'enabled' => true],
            ['label' => 'Fees', 'href' => '/fees', 'enabled' => true],
            ['label' => 'Facilities', 'href' => '/facilities', 'enabled' => true],
            ['label' => 'Syllabus', 'href' => '/syllabus', 'enabled' => true],
            ['label' => 'Notices', 'href' => '/notices', 'enabled' => true],
            ['label' => 'Teachers', 'href' => '/teachers', 'enabled' => true],
            ['label' => 'Staff', 'href' => '/staff', 'enabled' => true],
            ['label' => 'Activities', 'href' => '/activities', 'enabled' => true],
            ['label' => 'Blog', 'href' => '/blog', 'enabled' => true],
            ['label' => 'Contact', 'href' => '/contact', 'enabled' => true],
        ];
    }

    /**
     * @return list<array{label: string, href: string}>
     */
    public static function defaultHomeCtas(): array
    {
        return [
            ['label' => 'Apply for Admission', 'href' => '/admission'],
            ['label' => 'Fee structure', 'href' => '/fees'],
            ['label' => 'Facilities', 'href' => '/facilities'],
            ['label' => 'School blog', 'href' => '/blog'],
        ];
    }

    /**
     * @return array{stats: bool, speech: bool, notices: bool, activities: bool, blog: bool}
     */
    public static function defaultHomeSections(): array
    {
        return [
            'stats' => true,
            'speech' => true,
            'notices' => true,
            'activities' => true,
            'blog' => true,
        ];
    }

    /**
     * @return list<array{label: string, href: string}>
     */
    public function resolvedNavMenu(): array
    {
        $items = is_array($this->nav_menu) && $this->nav_menu !== []
            ? $this->nav_menu
            : self::defaultNavMenu();

        return collect($items)
            ->filter(fn ($item) => ($item['enabled'] ?? true) && filled($item['href'] ?? null) && filled($item['label'] ?? null))
            ->map(fn ($item) => [
                'label' => (string) $item['label'],
                'href' => (string) $item['href'],
            ])
            ->values()
            ->all();
    }

    /**
     * @return list<array{label: string, href: string}>
     */
    public function resolvedHomeCtas(): array
    {
        $items = is_array($this->home_ctas) && $this->home_ctas !== []
            ? $this->home_ctas
            : self::defaultHomeCtas();

        return collect($items)
            ->filter(fn ($item) => filled($item['href'] ?? null) && filled($item['label'] ?? null))
            ->map(fn ($item) => [
                'label' => (string) $item['label'],
                'href' => (string) $item['href'],
            ])
            ->values()
            ->all();
    }

    /**
     * @return array{stats: bool, speech: bool, notices: bool, activities: bool, blog: bool}
     */
    public function resolvedHomeSections(): array
    {
        return array_merge(self::defaultHomeSections(), is_array($this->home_sections) ? $this->home_sections : []);
    }

    /**
     * @return list<array{title: string, body: string, category: string}>
     */
    public function resolvedFacilityItems(): array
    {
        if (is_array($this->facility_items) && $this->facility_items !== []) {
            return collect($this->facility_items)
                ->filter(fn ($item) => filled($item['title'] ?? null))
                ->map(fn ($item) => [
                    'title' => (string) $item['title'],
                    'body' => (string) ($item['body'] ?? ''),
                    'category' => (string) ($item['category'] ?? 'school'),
                ])
                ->values()
                ->all();
        }

        $fallback = [];

        if (filled($this->lab_facilities)) {
            $fallback[] = [
                'title' => 'Lab facilities',
                'body' => (string) $this->lab_facilities,
                'category' => 'lab',
            ];
        }

        if (filled($this->school_facilities)) {
            $fallback[] = [
                'title' => 'School facilities',
                'body' => (string) $this->school_facilities,
                'category' => 'school',
            ];
        }

        return $fallback;
    }

    /**
     * Full payload for public pages + shared Inertia props (includes admin editors).
     *
     * @return array<string, mixed>
     */
    public function toPublicArray(): array
    {
        return [
            'id' => $this->id,
            'name_en' => $this->name_en,
            'name_bn' => $this->name_bn,
            'eiin_number' => $this->eiin_number,
            'board_affiliation' => $this->board_affiliation,
            'mpo_status' => (bool) $this->mpo_status,
            'address' => $this->address,
            'phone' => $this->phone,
            'email' => $this->email,
            'website' => $this->website,
            'established_year' => $this->established_year,
            'logo_url' => $this->logoUrl(),
            'about_en' => $this->about_en,
            'about_bn' => $this->about_bn,
            'headmaster_name_en' => $this->headmaster_name_en,
            'headmaster_name_bn' => $this->headmaster_name_bn,
            'headmaster_photo_url' => $this->headmasterPhotoUrl(),
            'headmaster_speech' => $this->headmaster_speech,
            'admission_info' => $this->admission_info,
            'admission_guidelines' => $this->admission_guidelines,
            'lab_facilities' => $this->lab_facilities,
            'school_facilities' => $this->school_facilities,
            'fee_notes' => $this->fee_notes,
            'office_hours' => $this->office_hours,
            'contact_intro' => $this->contact_intro,
            'footer_tagline' => $this->footer_tagline,
            'hero_tagline' => $this->hero_tagline,
            'nav_menu' => $this->resolvedNavMenu(),
            'home_ctas' => $this->resolvedHomeCtas(),
            'home_sections' => $this->resolvedHomeSections(),
            'facility_items' => $this->resolvedFacilityItems(),
        ];
    }

    /**
     * Payload for the admin school-profile editor (raw JSON + paths).
     *
     * @return array<string, mixed>
     */
    public function toAdminArray(): array
    {
        return [
            ...$this->toPublicArray(),
            'logo_path' => $this->logo_path,
            'headmaster_photo_path' => $this->headmaster_photo_path,
            'nav_menu_raw' => is_array($this->nav_menu) && $this->nav_menu !== []
                ? $this->nav_menu
                : self::defaultNavMenu(),
            'home_ctas_raw' => is_array($this->home_ctas) && $this->home_ctas !== []
                ? $this->home_ctas
                : self::defaultHomeCtas(),
            'home_sections_raw' => $this->resolvedHomeSections(),
            'facility_items_raw' => is_array($this->facility_items) && $this->facility_items !== []
                ? $this->facility_items
                : $this->resolvedFacilityItems(),
        ];
    }
}
