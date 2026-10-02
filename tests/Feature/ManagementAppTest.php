<?php

use App\Enums\PostType;
use App\Enums\UserRole;
use App\Models\Post;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('redirects guests visiting the root route to the login page', function () {
    makeInstitution();

    $this->get('/')
        ->assertRedirect(route('login'));
});

it('redirects authenticated users from the root route to their role dashboard', function (string $role) {
    makeInstitution();
    $user = User::factory()->create(['role' => $role]);

    $this->actingAs($user)
        ->get('/')
        ->assertRedirect(route("{$role}.dashboard"));
})->with([
    'admin',
    'headmaster',
    'teacher',
    'student',
    'staff',
    'parent',
]);

it('returns 404 for removed public school frontend pages', function (string $path) {
    makeInstitution();

    $this->get($path)->assertNotFound();
})->with([
    '/about',
    '/headmaster',
    '/admission',
    '/facilities',
    '/contact',
    '/blog',
    '/activities',
    '/teachers',
    '/staff',
]);

it('redirects to the login page on logout', function () {
    $user = User::factory()->create(['role' => UserRole::ADMIN]);

    $this->actingAs($user)
        ->post('/logout')
        ->assertRedirect(route('login'));

    $this->assertGuest();
});

it('allows authenticated users to view the institutional notice board in dashboard layout', function () {
    makeInstitution();
    $student = User::factory()->create(['role' => UserRole::STUDENT]);

    $notice = new Post;
    $notice->forceFill([
        'type' => PostType::NOTICE,
        'title_en' => 'Sports day schedule',
        'title_bn' => 'ক্রীড়া দিবসের সময়সূচি',
        'slug' => 'sports-day-schedule',
        'body' => 'Sports day will be held on Friday.',
        'is_published' => true,
        'published_at' => now()->subDay(),
    ])->save();

    $this->actingAs($student)
        ->get('/notices')
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('NoticeBoard/Index')
            ->has('posts.data', 1)
            ->where('posts.data.0.title_en', 'Sports day schedule')
        );

    $this->actingAs($student)
        ->get('/notices/sports-day-schedule')
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('NoticeBoard/Show')
            ->where('post.title_en', 'Sports day schedule')
        );
});

it('organizes sidebar navigation under total management categories without website group', function () {
    makeInstitution();
    $admin = User::factory()->create(['role' => UserRole::ADMIN]);

    $this->actingAs($admin)
        ->get('/admin/dashboard')
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Dashboard')
            ->where('sidebar', function ($sidebar) {
                $titles = collect($sidebar)->pluck('title')->all();

                // Ensure "Website" group is removed
                expect($titles)->not->toContain('Website');

                // Ensure Communication and Academic are present
                expect(collect($sidebar)->pluck('items')->flatten(1)->pluck('href'))
                    ->toContain('/notices')
                    ->toContain('/admin/posts/notice')
                    ->toContain('/admin/syllabus')
                    ->toContain('/admin/students')
                    ->toContain('/admin/teachers');

                return true;
            })
        );
});
