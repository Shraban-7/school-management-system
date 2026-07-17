<?php

namespace Database\Seeders;

use App\Models\Institution;
use Illuminate\Database\Seeder;

class InstitutionSeeder extends Seeder
{
    public function run(): void
    {
        $attributes = [
            'name_en' => 'Dhaka Government Muslim High School',
            'name_bn' => 'ঢাকা সরকারি মুসলিম উচ্চ বিদ্যালয়',
            'board_affiliation' => 'Dhaka',
            'mpo_status' => true,
            'address' => '15 Bakshi Bazar Road, Dhaka-1211, Bangladesh',
            'phone' => '+8802-9661234',
            'email' => 'info@dgmhs.edu.bd',
            'website' => 'https://dgmhs.edu.bd',
            'established_year' => 1874,
            'hero_tagline' => 'Nurturing minds since 1874 — knowledge, character, and service.',
            'about_en' => "Dhaka Government Muslim High School is one of Bangladesh's historic secondary schools, committed to academic excellence and the holistic development of every student. We offer Bangla and English medium pathways under the Dhaka Education Board, with a tradition of disciplined learning, cultural pride, and community service.",
            'about_bn' => 'ঢাকা সরকারি মুসলিম উচ্চ বিদ্যালয় বাংলাদেশের ঐতিহ্যবাহী মাধ্যমিক শিক্ষাপ্রতিষ্ঠানগুলোর একটি। আমরা ঢাকা শিক্ষা বোর্ডের অধীনে বাংলা ও ইংরেজি মাধ্যমে শিক্ষা প্রদান করি এবং প্রতিটি শিক্ষার্থীর সার্বিক বিকাশে প্রতিশ্রুতিবদ্ধ।',
            'headmaster_name_en' => 'Md. Abdul Karim',
            'headmaster_name_bn' => 'মোঃ আব্দুল করিম',
            'headmaster_speech' => "Dear students, parents, and well-wishers,\n\nWelcome to our school family. Education here is not only about grades — it is about building character, curiosity, and courage to serve the nation. Together with our teachers and guardians, we strive to create a safe, disciplined, and inspiring environment where every child can flourish.\n\nMay Allah bless our journey of learning.\n\nMd. Abdul Karim\nHeadmaster",
            'admission_info' => "Classes open: Play to Class 10 (Bangla & English medium).\n\nOffice hours: Sunday–Thursday, 9:00 AM – 3:00 PM (Friday–Saturday weekend).\n\nCollect the admission form from the school office. For queries, call or visit during office hours.",
            'admission_guidelines' => "1. Collect the admission form from the school office (or download if announced).\n2. Submit with required documents:\n   - Birth certificate (student)\n   - Passport-size photographs (4 copies)\n   - Previous school transfer certificate (if applicable)\n   - Guardian NID photocopy\n3. Pay the admission fee at the accounts desk (see Fees page).\n4. Appear for the admission test (Class 3 and above) on the announced date.\n5. Selected candidates complete enrolment and pay the first month's tuition + session fee.\n\nNote: Incomplete forms or missing documents will not be accepted. Admission is subject to seat availability and school rules.",
            'lab_facilities' => "Science laboratory — Physics, Chemistry, and Biology practicals for Classes 9–10 with standard board-prescribed equipment.\n\nComputer / ICT lab — networked PCs for ICT classes, with multimedia projector support.\n\nLanguage support — Bangla and English reading corners with dictionaries and reference materials.",
            'school_facilities' => "Spacious classrooms with blackboards and adequate seating.\n\nMultipurpose hall for assemblies, cultural programmes, and parent meetings.\n\nLibrary with Bangla and English books, newspapers, and exam guides.\n\nPlayground for football, cricket, and annual sports.\n\nPrayer room and clean drinking water / washroom facilities.\n\nCCTV-covered campus for student safety.\n\nFirst-aid corner managed by designated staff.",
            'fee_notes' => "Fees are payable in Bangladeshi Taka (৳) at the school accounts office. Monthly tuition is due by the 10th of each month. Session (annual) fees are collected at the start of the academic year. Admission fees apply only to newly enrolled students. Exam fees are charged before each major exam. Keep your payment slip as proof. For concessions or late payment, contact the accounts office.",
            'office_hours' => "Sunday–Thursday, 9:00 AM – 3:00 PM\nFriday–Saturday: Closed (weekend)",
            'contact_intro' => "Visit the school office, call, or email us. Guardians are welcome during office hours for admission and fee queries.",
            'footer_tagline' => 'Knowledge, character, and service since 1874.',
            'nav_menu' => Institution::defaultNavMenu(),
            'home_ctas' => Institution::defaultHomeCtas(),
            'home_sections' => Institution::defaultHomeSections(),
            'facility_items' => [
                [
                    'title' => 'Science laboratory',
                    'body' => 'Physics, Chemistry, and Biology practicals for Classes 9–10 with board-prescribed equipment.',
                    'category' => 'lab',
                ],
                [
                    'title' => 'Computer / ICT lab',
                    'body' => 'Networked PCs for ICT classes with multimedia projector support.',
                    'category' => 'lab',
                ],
                [
                    'title' => 'Library & reading',
                    'body' => 'Bangla and English books, newspapers, exam guides, and quiet study space.',
                    'category' => 'school',
                ],
                [
                    'title' => 'Playground & hall',
                    'body' => 'Football and cricket ground, multipurpose hall for assemblies and cultural programmes.',
                    'category' => 'school',
                ],
            ],
        ];

        $school = Institution::query()->orderBy('id')->first();

        if ($school === null) {
            $school = new Institution;
            $attributes['eiin_number'] = 108201;
            $school->forceFill($attributes)->save();
        } else {
            $school->forceFill($attributes)->save();
        }

        Institution::forgetCurrentCache();
    }
}
