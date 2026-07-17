<?php

use App\Enums\UserRole;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('shows the public school homepage at the root route for guests', function () {
    makeInstitution();

    $this->get('/')
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page->component('Site/Home'));
});

it('keeps authenticated users on the public homepage at the root route', function (string $role) {
    makeInstitution();
    $user = User::factory()->create(['role' => $role]);

    $this->actingAs($user)
        ->get('/')
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page->component('Site/Home'));
})->with([
    'admin',
    'teacher',
    'parent',
]);

it('lets each role load its own dashboard', function (string $role) {
    $user = User::factory()->create(['role' => $role]);

    $this->actingAs($user)
        ->get(route("{$role}.dashboard"))
        ->assertSuccessful();
})->with([
    'admin',
    'headmaster',
    'teacher',
    'student',
    'staff',
    'parent',
]);

it('lets an admin load the teacher and student management pages', function () {
    $institution = makeInstitution();
    $class = makeClass($institution);
    $student = makeStudent($institution, ['class_id' => $class->id]);

    $admin = User::factory()->create(['role' => UserRole::ADMIN]);

    $this->actingAs($admin)->get('/admin/teachers')->assertSuccessful();
    $this->actingAs($admin)->get('/admin/teachers/create')->assertSuccessful();
    $this->actingAs($admin)->get('/admin/students')->assertSuccessful();
    $this->actingAs($admin)->get("/admin/students/{$student->id}")->assertSuccessful();
    $this->actingAs($admin)->get("/admin/students/{$student->id}/edit")->assertSuccessful();
});

it('redirects unauthorized roles back to their dashboard with a flash error', function (string $role) {
    $user = User::factory()->create(['role' => $role]);

    $this->actingAs($user)
        ->get('/admin/users')
        ->assertRedirect(route("{$role}.dashboard"))
        ->assertSessionHas('flash.error');
})->with([
    'headmaster',
    'teacher',
    'student',
    'staff',
    'parent',
]);

it('shows the full menu in every role sidebar', function (string $role) {
    $user = User::factory()->create(['role' => $role]);

    $this->actingAs($user)
        ->get(route("{$role}.dashboard"))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Dashboard')
            ->where('sidebar.0.items.0.href', "/{$role}/dashboard")
            ->where('sidebar', fn ($sidebar) => collect($sidebar)
                ->pluck('items')
                ->flatten(1)
                ->pluck('href')
                ->contains('/admin/users'))
        );
})->with([
    'admin',
    'headmaster',
    'teacher',
    'student',
    'staff',
    'parent',
]);

it('shows a parent their linked children on the dashboard', function () {
    $institution = makeInstitution();
    $class = makeClass($institution);
    $student = makeStudent($institution, [
        'class_id' => $class->id,
        'name_en' => 'Karim Rahman',
        'name_bn' => 'করিম রহমান',
    ]);

    $parent = User::factory()->create(['role' => UserRole::PARENT]);

    $student->guardians()->attach($parent->id, [
        'relation' => 'Father',
        'is_primary_contact' => true,
    ]);

    $this->actingAs($parent)
        ->get(route('parent.dashboard'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Dashboard')
            ->where('role', 'parent')
            ->where('stats.0.value', 1)
            ->where('cards.0.items.0.label', 'Karim Rahman')
        );
});
