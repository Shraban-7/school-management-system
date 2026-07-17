<?php

use App\Enums\UserRole;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('defaults to english locale', function () {
    makeInstitution();

    $this->get('/')
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->where('locale', 'en')
            ->where('translations.nav.home', 'Home')
        );
});

it('switches locale to bangla and keeps it in the session', function () {
    makeInstitution();

    $this->post('/locale', ['locale' => 'bn'])
        ->assertRedirect();

    $this->get('/')
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->where('locale', 'bn')
            ->where('translations.nav.home', 'হোম')
            ->where('translations.nav.about', 'আমাদের সম্পর্কে')
        );
});

it('rejects unsupported locales', function () {
    $this->post('/locale', ['locale' => 'fr'])
        ->assertSessionHasErrors('locale');
});

it('localizes the sidebar when bangla is selected', function () {
    makeInstitution();
    $user = User::factory()->create(['role' => UserRole::ADMIN]);

    $this->actingAs($user)
        ->withSession(['locale' => 'bn'])
        ->get('/admin/dashboard')
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->where('locale', 'bn')
            ->where('sidebar.0.title', 'সারসংক্ষেপ')
            ->where('sidebar.0.items.0.label', 'ড্যাশবোর্ড')
        );
});
