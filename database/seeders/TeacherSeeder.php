<?php

namespace Database\Seeders;

use App\Models\Teacher;
use Illuminate\Database\Seeder;

class TeacherSeeder extends Seeder
{
    public function run(): void
    {
        $teachers = [];
        $institutions = [1, 2, 3];
        $names = [
            ['en' => 'Prof. Abdur Rahman', 'bn' => 'অধ্যাপক আব্দুর রহমান'],
            ['en' => 'Mrs. Fatima Begum', 'bn' => 'মিসেস ফাতিমা বেগম'],
            ['en' => 'Md. Kamal Hossain', 'bn' => 'মোঃ কামাল হোসেন'],
            ['en' => 'Ms. Shahnaz Parvin', 'bn' => 'মিসেস শাহনাজ পারভীন'],
            ['en' => 'Md. Rafiqul Islam', 'bn' => 'মোঃ রফিকুল ইসলাম'],
        ];
        $designations = ['Principal', 'Senior Teacher', 'Assistant Teacher', 'Assistant Teacher', 'Demonstrator'];
        $subjects = ['Mathematics', 'English', 'Bangla', 'Science', 'ICT'];

        foreach ($institutions as $instId) {
            foreach ($names as $i => $name) {
                $teachers[] = [
                    'institution_id' => $instId,
                    'name_en' => $name['en'],
                    'name_bn' => $name['bn'],
                    'father_name' => 'Mr. '.fake('en_BD')->firstName().' '.fake('en_BD')->lastName(),
                    'mother_name' => 'Mrs. '.fake('en_BD')->firstName().' '.fake('en_BD')->lastName(),
                    'date_of_birth' => now()->subYears(rand(30, 55))->subDays(rand(1, 365)),
                    'gender' => $i < 2 ? 'Male' : ($i < 4 ? 'Female' : 'Male'),
                    'religion' => 'Islam',
                    'mobile' => '+8801'.rand(300000000, 399999999),
                    'email' => strtolower(str_replace(['.', ' ', '(', ')'], '', str_replace('Prof. ', '', $name['en']))).$instId.'@school.edu.bd',
                    'nid_number' => (string) rand(1000000000, 9999999999),
                    'qualification' => ['M.Sc', 'M.A', 'B.Sc (Hons)', 'M.Sc', 'M.Sc'][$i],
                    'designation' => $designations[$i],
                    'subject_specialization' => $subjects[$i],
                    'joining_date' => now()->subYears(rand(1, 15))->subDays(rand(1, 365)),
                    'is_active' => true,
                ];
            }
        }

        foreach ($teachers as $t) {
            Teacher::create($t);
        }
    }
}
