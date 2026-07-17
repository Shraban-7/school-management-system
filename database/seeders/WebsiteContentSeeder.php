<?php

namespace Database\Seeders;

use App\Enums\PostType;
use App\Enums\UserRole;
use App\Models\AcademicSession;
use App\Models\ClassesAndSection;
use App\Models\Post;
use App\Models\Syllabus;
use App\Models\User;
use Illuminate\Database\Seeder;

class WebsiteContentSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::query()->where('role', UserRole::ADMIN)->first();

        $posts = [
            [
                'type' => PostType::NOTICE,
                'title_en' => 'Half-yearly exam schedule published',
                'title_bn' => 'অর্ধবার্ষিক পরীক্ষার সময়সূচি প্রকাশ',
                'body' => "The half-yearly examination will begin on 1 May. Students must bring their admit cards. Detailed routine is available on the notice board and from class teachers.",
            ],
            [
                'type' => PostType::NOTICE,
                'title_en' => 'Parent-teacher meeting — Class 9 & 10',
                'title_bn' => 'অভিভাবক সভা — নবম ও দশম শ্রেণি',
                'body' => "A parent-teacher meeting will be held on Thursday at 10:00 AM in the multipurpose hall. Guardians of Classes 9 and 10 are requested to attend.",
            ],
            [
                'type' => PostType::NOTICE,
                'title_en' => 'Eid holiday notice',
                'title_bn' => 'ঈদের ছুটির নোটিশ',
                'body' => "The school will remain closed for Eid-ul-Fitr from the announced date. Classes will resume as per the academic calendar.",
            ],
            [
                'type' => PostType::BLOG,
                'title_en' => 'Why morning assembly shapes character',
                'title_bn' => 'সকালের সমাবেশ কেন চরিত্র গঠনে সাহায্য করে',
                'body' => "Our daily assembly is more than a routine — it is a shared moment of discipline, national anthem, and quiet reflection. Teachers share short moral stories, and students lead prayers and announcements. Over time, this rhythm builds punctuality, respect, and belonging.",
            ],
            [
                'type' => PostType::BLOG,
                'title_en' => 'Science fair highlights from this year',
                'title_bn' => 'এ বছরের বিজ্ঞান মেলা',
                'body' => "Students presented projects on water purification, solar cookers, and traffic safety apps. Judges from neighbouring colleges praised the practical focus. Congratulations to all participants.",
            ],
            [
                'type' => PostType::ACTIVITY,
                'title_en' => 'Annual sports day',
                'title_bn' => 'বার্ষিক ক্রীড়া দিবস',
                'body' => "Track and field events, cricket, and badminton filled the grounds. House teams competed with spirit. Medals were awarded by the headmaster in the closing ceremony.",
            ],
            [
                'type' => PostType::ACTIVITY,
                'title_en' => 'Cultural week & debate competition',
                'title_bn' => 'সাংস্কৃতিক সপ্তাহ ও বিতর্ক প্রতিযোগিতা',
                'body' => "Students performed Bangla poetry, folk songs, and dramas. The inter-class debate on digital learning drew a full house. Winners received certificates at the prize-giving ceremony.",
            ],
        ];

        foreach ($posts as $data) {
            $post = new Post;
            $post->forceFill([
                'type' => $data['type'],
                'title_en' => $data['title_en'],
                'title_bn' => $data['title_bn'],
                'body' => $data['body'],
                'slug' => Post::uniqueSlug($data['title_en']),
                'is_published' => true,
                'published_at' => now()->subDays(random_int(1, 20)),
                'created_by' => $admin?->id,
            ])->save();
        }

        $session = AcademicSession::query()->where('is_active', true)->first()
            ?? AcademicSession::query()->first();
        $classes = ClassesAndSection::query()->orderBy('id')->limit(4)->get();

        foreach ($classes as $class) {
            $syllabus = new Syllabus;
            $syllabus->forceFill([
                'class_id' => $class->id,
                'academic_session_id' => $session?->id,
                'title' => trim($class->class_level.' '.$class->section_name).' syllabus',
                'description' => 'Subject-wise syllabus outline for the current academic session. Collect the printed copy from the class teacher if needed.',
            ])->save();
        }
    }
}
