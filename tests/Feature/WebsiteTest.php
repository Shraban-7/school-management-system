<?php

use App\Enums\PostType;
use App\Enums\UserRole;
use App\Models\Post;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('renders the main public website pages', function (string $path, string $component) {
    makeInstitution([
        'hero_tagline' => 'Learn with honour',
        'about_en' => 'A historic school.',
        'headmaster_speech' => 'Welcome students.',
        'admission_info' => 'Apply at the office.',
    ]);

    $this->get($path)
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page->component($component));
})->with([
    ['/', 'Site/Home'],
    ['/about', 'Site/About'],
    ['/headmaster', 'Site/HeadmasterSpeech'],
    ['/admission', 'Site/Admission'],
    ['/facilities', 'Site/Facilities'],
    ['/fees', 'Site/Fees'],
    ['/syllabus', 'Site/Syllabus'],
    ['/notices', 'Site/Notices'],
    ['/blog', 'Site/Blog'],
    ['/activities', 'Site/Activities'],
    ['/teachers', 'Site/Teachers'],
    ['/staff', 'Site/Staff'],
    ['/contact', 'Site/Contact'],
]);

it('uses dynamic nav menu and home CTAs from school settings', function () {
    makeInstitution([
        'nav_menu' => [
            ['label' => 'Home', 'href' => '/', 'enabled' => true],
            ['label' => 'Fees only', 'href' => '/fees', 'enabled' => true],
            ['label' => 'Hidden', 'href' => '/about', 'enabled' => false],
        ],
        'home_ctas' => [
            ['label' => 'Join us', 'href' => '/admission'],
        ],
        'home_sections' => [
            'stats' => true,
            'speech' => false,
            'notices' => false,
            'activities' => false,
            'blog' => false,
        ],
        'facility_items' => [
            ['title' => 'ICT Lab', 'body' => '20 computers', 'category' => 'lab'],
        ],
        'contact_intro' => 'Call us any weekday.',
        'office_hours' => 'Sun–Thu 9–3',
    ]);

    $this->get('/')
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Site/Home')
            ->where('homeCtas.0.label', 'Join us')
            ->where('homeSections.speech', false)
            ->where('school.nav_menu', fn ($menu) => collect($menu)->pluck('label')->all() === ['Home', 'Fees only'])
        );

    $this->get('/facilities')
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Site/Facilities')
            ->has('facilityItems', 1)
            ->where('facilityItems.0.title', 'ICT Lab')
        );

    $this->get('/contact')
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->where('school.contact_intro', 'Call us any weekday.')
            ->where('school.office_hours', 'Sun–Thu 9–3')
        );
});

it('shows public fee structure grouped by BD fee types', function () {
    $institution = makeInstitution(['fee_notes' => 'Pay by the 10th.']);
    $class = makeClass($institution, ['class_level' => 'Class 9', 'section_name' => 'A']);

    $structure = new \App\Models\FeeStructure;
    $structure->forceFill([
        'institution_id' => $institution->id,
        'class_id' => $class->id,
        'fee_type' => \App\Enums\FeeType::MONTHLY_TUITION,
        'name_en' => 'Monthly tuition',
        'name_bn' => 'মাসিক বেতন',
        'amount' => 2500,
        'is_active' => true,
    ])->save();

    $this->get('/fees')
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Site/Fees')
            ->where('school.fee_notes', 'Pay by the 10th.')
            ->has('feeGroups', 1)
            ->where('feeGroups.0.type', 'monthly_tuition')
            ->where('feeGroups.0.items.0.amount', 2500)
        );
});

it('lets an admin update admission guidelines and facilities', function () {
    makeInstitution();
    $admin = User::factory()->create(['role' => UserRole::ADMIN]);

    $this->actingAs($admin)
        ->put('/admin/settings/school', [
            'name_en' => 'Test School',
            'name_bn' => 'টেস্ট স্কুল',
            'eiin_number' => 108201,
            'board_affiliation' => 'Dhaka',
            'mpo_status' => true,
            'admission_guidelines' => 'Step 1: collect form.',
            'lab_facilities' => 'Science lab available.',
            'school_facilities' => 'Playground and library.',
            'fee_notes' => 'Monthly tuition due by 10th.',
        ])
        ->assertRedirect(route('admin.settings.school.edit'));

    $school = \App\Models\Institution::current()->fresh();
    expect($school->admission_guidelines)->toBe('Step 1: collect form.');
    expect($school->lab_facilities)->toBe('Science lab available.');
});

it('hides unpublished posts from the public site', function () {
    makeInstitution();

    $published = new Post;
    $published->forceFill([
        'type' => PostType::NOTICE,
        'title_en' => 'Published notice',
        'slug' => 'published-notice',
        'body' => 'Visible body',
        'is_published' => true,
        'published_at' => now()->subDay(),
    ])->save();

    $draft = new Post;
    $draft->forceFill([
        'type' => PostType::NOTICE,
        'title_en' => 'Draft notice',
        'slug' => 'draft-notice',
        'body' => 'Hidden body',
        'is_published' => false,
        'published_at' => null,
    ])->save();

    $this->get('/notices')
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Site/Notices')
            ->has('posts.data', 1)
            ->where('posts.data.0.slug', 'published-notice')
        );

    $this->get('/notices/draft-notice')->assertNotFound();
    $this->get('/notices/published-notice')
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page->component('Site/NoticeShow'));
});

it('lets an admin update the school profile', function () {
    makeInstitution(['name_en' => 'Old Name']);
    $admin = User::factory()->create(['role' => UserRole::ADMIN]);

    $this->actingAs($admin)
        ->put('/admin/settings/school', [
            'name_en' => 'New School Name',
            'name_bn' => 'নতুন স্কুল',
            'eiin_number' => 108201,
            'board_affiliation' => 'Dhaka',
            'mpo_status' => true,
            'hero_tagline' => 'Updated tagline',
        ])
        ->assertRedirect(route('admin.settings.school.edit'))
        ->assertSessionHas('flash.message');

    expect(\App\Models\Institution::current()->fresh()->name_en)->toBe('New School Name');
});

it('lets an admin create a published notice', function () {
    makeInstitution();
    $admin = User::factory()->create(['role' => UserRole::ADMIN]);

    $this->actingAs($admin)
        ->post('/admin/posts/notice', [
            'title_en' => 'Fee payment deadline',
            'title_bn' => 'ফি পরিশোধের শেষ তারিখ',
            'body' => 'Please pay by the 10th.',
            'is_published' => true,
            'published_at' => now()->toDateString(),
        ])
        ->assertRedirect(route('admin.posts.index', ['type' => 'notice']));

    $this->get('/notices/fee-payment-deadline')
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Site/NoticeShow')
            ->where('post.title_en', 'Fee payment deadline')
        );
});
