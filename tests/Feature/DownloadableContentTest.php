<?php

use App\Enums\PostType;
use App\Enums\UserRole;
use App\Models\Post;
use App\Models\Syllabus;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

it('lists only syllabuses with downloadable files and exposes download urls', function () {
    Storage::fake('public');
    $institution = makeInstitution();
    $class = makeClass($institution);
    $session = makeAcademicSession();

    $withFile = new Syllabus;
    $path = UploadedFile::fake()->create('class9.pdf', 200, 'application/pdf')->store('syllabus', 'public');
    $withFile->forceFill([
        'class_id' => $class->id,
        'academic_session_id' => $session->id,
        'title' => 'Class 9 Syllabus',
        'description' => 'Full year outline',
        'file_path' => $path,
        'file_original_name' => 'class9-syllabus.pdf',
    ])->save();

    $withoutFile = new Syllabus;
    $withoutFile->forceFill([
        'class_id' => $class->id,
        'academic_session_id' => $session->id,
        'title' => 'Draft syllabus',
        'description' => 'No file yet',
    ])->save();

    $this->get('/syllabus')
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Site/Syllabus')
            ->has('syllabuses', 1)
            ->where('syllabuses.0.title', 'Class 9 Syllabus')
            ->where('syllabuses.0.file_name', 'class9-syllabus.pdf')
            ->where('syllabuses.0.download_url', route('syllabus.download', $withFile))
        );
});

it('force-downloads a syllabus pdf with the original filename', function () {
    Storage::fake('public');
    $institution = makeInstitution();
    $class = makeClass($institution);

    $syllabus = new Syllabus;
    $path = UploadedFile::fake()->create('math.pdf', 100, 'application/pdf')->store('syllabus', 'public');
    $syllabus->forceFill([
        'class_id' => $class->id,
        'title' => 'Mathematics',
        'file_path' => $path,
        'file_original_name' => 'mathematics-syllabus.pdf',
    ])->save();

    $this->get(route('syllabus.download', $syllabus))
        ->assertSuccessful()
        ->assertDownload('mathematics-syllabus.pdf');
});

it('lets admins upload a downloadable syllabus pdf', function () {
    Storage::fake('public');
    $institution = makeInstitution();
    $class = makeClass($institution);
    $admin = User::factory()->create(['role' => UserRole::ADMIN]);

    $this->actingAs($admin)
        ->post('/admin/syllabus', [
            'class_id' => $class->id,
            'title' => 'Class 8 Science',
            'description' => 'Science syllabus',
            'file' => UploadedFile::fake()->create('science.pdf', 120, 'application/pdf'),
        ])
        ->assertRedirect(route('admin.syllabus.index'))
        ->assertSessionHasNoErrors();

    $syllabus = Syllabus::query()->first();

    expect($syllabus)->not->toBeNull()
        ->and($syllabus->file_path)->not->toBeNull()
        ->and($syllabus->file_original_name)->toBe('science.pdf')
        ->and(Storage::disk('public')->exists($syllabus->file_path))->toBeTrue();
});

it('shows school notices with attachment download on the public pages', function () {
    Storage::fake('public');
    makeInstitution();

    $path = UploadedFile::fake()->create('holiday.pdf', 80, 'application/pdf')->store('posts/attachments', 'public');

    $notice = new Post;
    $notice->forceFill([
        'type' => PostType::NOTICE,
        'title_en' => 'Eid holiday notice',
        'title_bn' => 'ঈদ ছুটির নোটিশ',
        'slug' => 'eid-holiday-notice',
        'body' => 'School will remain closed for Eid.',
        'attachment_path' => $path,
        'attachment_original_name' => 'eid-holiday-2026.pdf',
        'is_published' => true,
        'published_at' => now()->subDay(),
    ])->save();

    $this->get('/notices')
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Site/Notices')
            ->where('posts.data.0.title_en', 'Eid holiday notice')
            ->where('posts.data.0.has_attachment', true)
        );

    $this->get('/notices/eid-holiday-notice')
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Site/NoticeShow')
            ->where('post.attachment_name', 'eid-holiday-2026.pdf')
            ->where('post.attachment_download_url', route('notices.download', 'eid-holiday-notice'))
        );

    $this->get(route('notices.download', 'eid-holiday-notice'))
        ->assertSuccessful()
        ->assertDownload('eid-holiday-2026.pdf');
});

it('lets admins attach a pdf to a school notice', function () {
    Storage::fake('public');
    makeInstitution();
    $admin = User::factory()->create(['role' => UserRole::ADMIN]);

    $this->actingAs($admin)
        ->post('/admin/posts/notice', [
            'title_en' => 'Exam schedule',
            'title_bn' => 'পরীক্ষার সময়সূচি',
            'body' => '<p>Please see the attached schedule.</p>',
            'is_published' => true,
            'published_at' => now()->toDateString(),
            'attachment' => UploadedFile::fake()->create('exam-schedule.pdf', 90, 'application/pdf'),
        ])
        ->assertRedirect(route('admin.posts.index', ['type' => 'notice']))
        ->assertSessionHasNoErrors();

    $post = Post::query()->ofType(PostType::NOTICE)->first();

    expect($post)->not->toBeNull()
        ->and($post->attachment_path)->not->toBeNull()
        ->and($post->attachment_original_name)->toBe('exam-schedule.pdf')
        ->and(Storage::disk('public')->exists($post->attachment_path))->toBeTrue();
});

it('does not download unpublished notice attachments', function () {
    Storage::fake('public');
    makeInstitution();

    $path = UploadedFile::fake()->create('draft.pdf', 40, 'application/pdf')->store('posts/attachments', 'public');

    $notice = new Post;
    $notice->forceFill([
        'type' => PostType::NOTICE,
        'title_en' => 'Draft notice',
        'slug' => 'draft-notice',
        'body' => 'Not ready',
        'attachment_path' => $path,
        'attachment_original_name' => 'draft.pdf',
        'is_published' => false,
        'published_at' => null,
    ])->save();

    $this->get(route('notices.download', 'draft-notice'))->assertNotFound();
});
