<?php

namespace Database\Seeders;

use App\Models\Teacher;
use Illuminate\Database\Seeder;

class TeacherSeeder extends Seeder
{
    public function run(): void
    {
        $people = [
            ['en' => 'Prof. Abdur Rahman', 'bn' => 'অধ্যাপক আব্দুর রহমান', 'designation' => 'Principal', 'subject' => 'Mathematics', 'qualification' => 'M.Sc', 'gender' => 'Male'],
            ['en' => 'Mrs. Fatima Begum', 'bn' => 'মিসেস ফাতিমা বেগম', 'designation' => 'Senior Teacher', 'subject' => 'English', 'qualification' => 'M.A', 'gender' => 'Female'],
            ['en' => 'Md. Kamal Hossain', 'bn' => 'মোঃ কামাল হোসেন', 'designation' => 'Assistant Teacher', 'subject' => 'Bangla', 'qualification' => 'B.Sc (Hons)', 'gender' => 'Male'],
            ['en' => 'Ms. Shahnaz Parvin', 'bn' => 'মিসেস শাহনাজ পারভীন', 'designation' => 'Assistant Teacher', 'subject' => 'Science', 'qualification' => 'M.Sc', 'gender' => 'Female'],
            ['en' => 'Md. Rafiqul Islam', 'bn' => 'মোঃ রফিকুল ইসলাম', 'designation' => 'Demonstrator', 'subject' => 'ICT', 'qualification' => 'M.Sc', 'gender' => 'Male'],
            ['en' => 'Mr. Jahangir Alam', 'bn' => 'জনাব জাহাঙ্গীর আলম', 'designation' => 'Librarian', 'subject' => null, 'qualification' => 'B.A', 'gender' => 'Male'],
            ['en' => 'Ms. Nasrin Akter', 'bn' => 'মিসেস নাসরিন আক্তার', 'designation' => 'Clerk', 'subject' => null, 'qualification' => 'HSC', 'gender' => 'Female'],
            ['en' => 'Md. Sohel Rana', 'bn' => 'মোঃ সোহেল রানা', 'designation' => 'Accountant', 'subject' => null, 'qualification' => 'B.Com', 'gender' => 'Male'],
        ];

        foreach ($people as $i => $person) {
            $teacher = new Teacher;
            $teacher->forceFill([
                'institution_id' => 1,
                'name_en' => $person['en'],
                'name_bn' => $person['bn'],
                'father_name' => 'Mr. Rahman',
                'mother_name' => 'Mrs. Begum',
                'date_of_birth' => now()->subYears(30 + $i)->subDays(10),
                'gender' => $person['gender'],
                'religion' => 'Islam',
                'mobile' => '+8801'.(300000000 + $i),
                'email' => 'staff'.$i.'@school.edu.bd',
                'nid_number' => (string) (1000000000 + $i),
                'qualification' => $person['qualification'],
                'designation' => $person['designation'],
                'subject_specialization' => $person['subject'],
                'joining_date' => now()->subYears(max(1, 8 - $i)),
                'is_active' => true,
            ])->save();
        }
    }
}
