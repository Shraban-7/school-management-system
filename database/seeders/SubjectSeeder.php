<?php

namespace Database\Seeders;

use App\Models\Subject;
use Illuminate\Database\Seeder;

class SubjectSeeder extends Seeder
{
    public function run(): void
    {
        $subjects = [];
        $institutions = [1];
        $common = [
            ['name_en' => 'Bangla', 'name_bn' => 'বাংলা', 'code' => 'BAN'],
            ['name_en' => 'English', 'name_bn' => 'ইংরেজি', 'code' => 'ENG'],
            ['name_en' => 'Mathematics', 'name_bn' => 'গণিত', 'code' => 'MATH'],
            ['name_en' => 'Science', 'name_bn' => 'বিজ্ঞান', 'code' => 'SCI'],
            ['name_en' => 'Bangladesh & Global Studies', 'name_bn' => 'বাংলাদেশ ও বিশ্বপরিচয়', 'code' => 'BGS'],
            ['name_en' => 'Religious Studies', 'name_bn' => 'ধর্ম শিক্ষা', 'code' => 'REL'],
            ['name_en' => 'Information & Communication Technology', 'name_bn' => 'তথ্য ও যোগাযোগ প্রযুক্তি', 'code' => 'ICT'],
        ];
        $higher = [
            ['name_en' => 'Physics', 'name_bn' => 'পদার্থবিজ্ঞান', 'code' => 'PHY'],
            ['name_en' => 'Chemistry', 'name_bn' => 'রসায়ন', 'code' => 'CHEM'],
            ['name_en' => 'Biology', 'name_bn' => 'জীববিজ্ঞান', 'code' => 'BIO'],
            ['name_en' => 'Higher Mathematics', 'name_bn' => 'উচ্চতর গণিত', 'code' => 'HMATH'],
        ];

        foreach ($institutions as $instId) {
            foreach ($common as $sub) {
                $subjects[] = [
                    'institution_id' => $instId,
                    'name_en' => $sub['name_en'],
                    'name_bn' => $sub['name_bn'],
                    'code' => $sub['code'],
                    'class_level' => 'Class 6',
                    'group_stream' => null,
                    'subject_type' => 'compulsory',
                    'full_marks' => 100,
                    'pass_marks' => 33,
                    'is_active' => true,
                ];
            }
            foreach ($higher as $sub) {
                $subjects[] = [
                    'institution_id' => $instId,
                    'name_en' => $sub['name_en'],
                    'name_bn' => $sub['name_bn'],
                    'code' => $sub['code'],
                    'class_level' => 'Class 9',
                    'group_stream' => 'Science',
                    'subject_type' => 'compulsory',
                    'full_marks' => 100,
                    'pass_marks' => 33,
                    'is_active' => true,
                ];
            }
        }

        Subject::insert($subjects);
    }
}
