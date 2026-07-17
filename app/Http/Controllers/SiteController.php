<?php

namespace App\Http\Controllers;

use App\Enums\FeeType;
use App\Enums\PostType;
use App\Models\FeeStructure;
use App\Models\Institution;
use App\Models\Post;
use App\Models\Student;
use App\Models\Syllabus;
use App\Models\Teacher;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class SiteController extends Controller
{
    /** @var list<string> */
    private const TEACHING_DESIGNATIONS = [
        'Principal',
        'Vice Principal',
        'Assistant Teacher',
        'Senior Teacher',
        'Lecturer',
        'Demonstrator',
    ];

    public function home(): Response
    {
        $school = Institution::current();

        return Inertia::render('Site/Home', [
            'school' => $school->toPublicArray(),
            'stats' => [
                'students' => Student::query()->where('is_active', true)->count(),
                'teachers' => Teacher::query()->where('is_active', true)->whereIn('designation', self::TEACHING_DESIGNATIONS)->count(),
                'notices' => Post::query()->ofType(PostType::NOTICE)->published()->count(),
            ],
            'notices' => Post::query()->ofType(PostType::NOTICE)->published()->latest('published_at')->limit(4)->get()->map->toPublicArray(),
            'blogs' => Post::query()->ofType(PostType::BLOG)->published()->latest('published_at')->limit(3)->get()->map->toPublicArray(),
            'activities' => Post::query()->ofType(PostType::ACTIVITY)->published()->latest('published_at')->limit(3)->get()->map->toPublicArray(),
            'speechExcerpt' => $school->headmaster_speech
                ? Str::limit(strip_tags($school->headmaster_speech), 320)
                : null,
            'homeCtas' => $school->resolvedHomeCtas(),
            'homeSections' => $school->resolvedHomeSections(),
        ]);
    }

    public function about(): Response
    {
        $school = Institution::current();

        return Inertia::render('Site/About', [
            'school' => $school->toPublicArray(),
            'stats' => [
                'students' => Student::query()->where('is_active', true)->count(),
                'teachers' => Teacher::query()->where('is_active', true)->whereIn('designation', self::TEACHING_DESIGNATIONS)->count(),
                'classes' => $school->classesAndSections()->count(),
            ],
            'speechExcerpt' => $school->headmaster_speech
                ? Str::limit(strip_tags($school->headmaster_speech), 220)
                : null,
        ]);
    }

    public function headmasterSpeech(): Response
    {
        return Inertia::render('Site/HeadmasterSpeech', [
            'school' => Institution::current()->toPublicArray(),
        ]);
    }

    public function admission(): Response
    {
        return Inertia::render('Site/Admission', [
            'school' => Institution::current()->toPublicArray(),
        ]);
    }

    public function facilities(): Response
    {
        $school = Institution::current();

        return Inertia::render('Site/Facilities', [
            'school' => $school->toPublicArray(),
            'facilityItems' => $school->resolvedFacilityItems(),
        ]);
    }

    public function fees(): Response
    {
        $school = Institution::current();

        $structures = FeeStructure::query()
            ->with('class:id,class_level,section_name')
            ->where('institution_id', $school->id)
            ->where('is_active', true)
            ->orderBy('fee_type')
            ->orderBy('class_id')
            ->get()
            ->map(fn (FeeStructure $s) => [
                'id' => $s->id,
                'fee_type' => $s->fee_type->value,
                'fee_type_label' => $s->fee_type->label(),
                'name_en' => $s->name_en,
                'name_bn' => $s->name_bn,
                'amount' => (float) $s->amount,
                'class_label' => $s->class
                    ? trim($s->class->class_level.' '.$s->class->section_name)
                    : 'All classes',
            ]);

        $grouped = [];
        foreach (FeeType::cases() as $type) {
            $items = $structures->where('fee_type', $type->value)->values()->all();
            if ($items !== []) {
                $grouped[] = [
                    'type' => $type->value,
                    'label' => $type->label(),
                    'description' => $type->publicDescription(),
                    'items' => $items,
                ];
            }
        }

        return Inertia::render('Site/Fees', [
            'school' => $school->toPublicArray(),
            'feeGroups' => $grouped,
        ]);
    }

    public function syllabus(): Response
    {
        $items = Syllabus::query()
            ->with(['class:id,class_level,section_name', 'academicSession:id,session_name'])
            ->orderBy('class_id')
            ->get()
            ->map->toPublicArray();

        return Inertia::render('Site/Syllabus', [
            'school' => Institution::current()->toPublicArray(),
            'syllabuses' => $items,
        ]);
    }

    public function notices(): Response
    {
        return $this->postIndex(PostType::NOTICE, 'Site/Notices');
    }

    public function noticeShow(string $slug): Response
    {
        return $this->postShow(PostType::NOTICE, $slug, 'Site/NoticeShow');
    }

    public function blog(): Response
    {
        return $this->postIndex(PostType::BLOG, 'Site/Blog');
    }

    public function blogShow(string $slug): Response
    {
        return $this->postShow(PostType::BLOG, $slug, 'Site/BlogShow');
    }

    public function activities(): Response
    {
        return $this->postIndex(PostType::ACTIVITY, 'Site/Activities');
    }

    public function activityShow(string $slug): Response
    {
        return $this->postShow(PostType::ACTIVITY, $slug, 'Site/ActivityShow');
    }

    public function teachers(): Response
    {
        return Inertia::render('Site/Teachers', [
            'school' => Institution::current()->toPublicArray(),
            'people' => $this->people(teaching: true),
        ]);
    }

    public function staff(): Response
    {
        return Inertia::render('Site/Staff', [
            'school' => Institution::current()->toPublicArray(),
            'people' => $this->people(teaching: false),
        ]);
    }

    public function contact(): Response
    {
        return Inertia::render('Site/Contact', [
            'school' => Institution::current()->toPublicArray(),
        ]);
    }

    private function postIndex(PostType $type, string $component): Response
    {
        $posts = Post::query()
            ->ofType($type)
            ->published()
            ->latest('published_at')
            ->paginate(12)
            ->through(fn (Post $post) => $post->toPublicArray());

        return Inertia::render($component, [
            'school' => Institution::current()->toPublicArray(),
            'posts' => $posts,
        ]);
    }

    private function postShow(PostType $type, string $slug, string $component): Response
    {
        $post = Post::query()
            ->ofType($type)
            ->published()
            ->where('slug', $slug)
            ->firstOrFail();

        return Inertia::render($component, [
            'school' => Institution::current()->toPublicArray(),
            'post' => $post->toPublicArray(),
        ]);
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function people(bool $teaching): array
    {
        $query = Teacher::query()->where('is_active', true)->orderBy('name_en');

        if ($teaching) {
            $query->whereIn('designation', self::TEACHING_DESIGNATIONS);
        } else {
            $query->whereNotIn('designation', self::TEACHING_DESIGNATIONS);
        }

        return $query->get()->map(fn (Teacher $t) => [
            'id' => $t->id,
            'name_en' => $t->name_en,
            'name_bn' => $t->name_bn,
            'designation' => $t->designation,
            'qualification' => $t->qualification,
            'subject_specialization' => $t->subject_specialization,
            'mobile' => $t->mobile,
            'email' => $t->email,
        ])->all();
    }
}
