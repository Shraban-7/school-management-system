<?php

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;

it('shows the profile page for any authenticated role', function (string $role) {
    $user = User::factory()->create(['role' => $role]);

    $this->actingAs($user)
        ->get('/profile')
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Profile/Edit')
            ->where('profile.name', $user->name)
            ->where('profile.phone', $user->phone)
        );
})->with([
    'admin',
    'teacher',
    'parent',
]);

it('updates the profile information', function () {
    $user = User::factory()->create(['role' => UserRole::TEACHER]);

    $this->actingAs($user)
        ->put('/profile', [
            'name' => 'Updated Name',
            'email' => 'updated@example.com',
            'phone' => '+8801711112222',
        ])
        ->assertRedirect()
        ->assertSessionHas('flash.message');

    $user->refresh();

    expect($user->name)->toBe('Updated Name')
        ->and($user->email)->toBe('updated@example.com')
        ->and($user->phone)->toBe('+8801711112222');
});

it('rejects a phone number already used by another user', function () {
    $other = User::factory()->create(['role' => UserRole::STAFF, 'phone' => '+8801700000001']);
    $user = User::factory()->create(['role' => UserRole::TEACHER]);

    $this->actingAs($user)
        ->put('/profile', [
            'name' => $user->name,
            'email' => null,
            'phone' => $other->phone,
        ])
        ->assertSessionHasErrors('phone');
});

it('changes the password with the correct current password', function () {
    $user = User::factory()->create(['role' => UserRole::TEACHER, 'password' => 'old-password']);

    $this->actingAs($user)
        ->put('/profile/password', [
            'current_password' => 'old-password',
            'password' => 'new-password-123',
            'password_confirmation' => 'new-password-123',
        ])
        ->assertRedirect()
        ->assertSessionHas('flash.message');

    expect(Hash::check('new-password-123', $user->refresh()->password))->toBeTrue();
});

it('rejects a password change with a wrong current password', function () {
    $user = User::factory()->create(['role' => UserRole::TEACHER, 'password' => 'old-password']);

    $this->actingAs($user)
        ->put('/profile/password', [
            'current_password' => 'wrong-password',
            'password' => 'new-password-123',
            'password_confirmation' => 'new-password-123',
        ])
        ->assertSessionHasErrors('current_password');

    expect(Hash::check('old-password', $user->refresh()->password))->toBeTrue();
});
