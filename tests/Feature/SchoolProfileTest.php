<?php

use App\Enums\UserRole;
use App\Models\Institution;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

function schoolAdmin(): User
{
    return User::factory()->create(['role' => UserRole::ADMIN]);
}

/**
 * @return array<string, mixed>
 */
function schoolPayload(array $overrides = []): array
{
    return array_merge([
        'name_en' => 'Test High School',
        'name_bn' => 'টেস্ট উচ্চ বিদ্যালয়',
        'eiin_number' => 123456,
        'board_affiliation' => 'Dhaka',
        'mpo_status' => true,
    ], $overrides);
}

it('uploads and stores the school logo', function () {
    Storage::fake('public');
    makeInstitution();

    $this->actingAs(schoolAdmin())
        ->put('/admin/settings/school', schoolPayload([
            'logo' => UploadedFile::fake()->image('logo.png', 200, 200),
        ]))
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $school = Institution::current();

    expect($school->logo_path)->not->toBeNull()
        ->and(Storage::disk('public')->exists($school->logo_path))->toBeTrue()
        ->and($school->logoUrl())->toContain('storage/'.$school->logo_path);
});

it('removes the school logo when requested', function () {
    Storage::fake('public');
    makeInstitution();

    $school = Institution::current();
    $path = UploadedFile::fake()->image('logo.png')->store('school', 'public');
    $school->forceFill(['logo_path' => $path])->save();
    Institution::forgetCurrentCache();

    $this->actingAs(schoolAdmin())
        ->put('/admin/settings/school', schoolPayload([
            'remove_logo' => true,
        ]))
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    expect(Institution::current()->logo_path)->toBeNull()
        ->and(Storage::disk('public')->exists($path))->toBeFalse();
});

it('updates the eiin number from the settings form', function () {
    makeInstitution();

    $this->actingAs(schoolAdmin())
        ->put('/admin/settings/school', schoolPayload([
            'eiin_number' => 654321,
        ]))
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    expect(Institution::current()->eiin_number)->toBe(654321);
});

it('shows logo url and eiin on the public home page', function () {
    makeInstitution();

    $school = Institution::current();
    $school->forceFill(['logo_path' => 'school/logo.png'])->save();
    Institution::forgetCurrentCache();

    $this->get('/')
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('Site/Home')
            ->where('school.logo_url', asset('storage/school/logo.png'))
            ->whereNot('school.eiin_number', null)
        );
});
