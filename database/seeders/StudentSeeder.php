<?php

namespace Database\Seeders;

use App\Models\Student;
use Illuminate\Database\Seeder;

class StudentSeeder extends Seeder
{
    public function run(): void
    {
        $institutions = [1, 2, 3];
        $classIdsByInst = [
            1 => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
            2 => [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
            3 => [31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45],
        ];

        $firstNames = [
            'Md. Ariful', 'Md. Sohel', 'Ms. Jannatul', 'Md. Sajib', 'Ms. Tania',
            'Md. Rakib', 'Ms. Sumaiya', 'Md. Fahim', 'Ms. Nusrat', 'Md. Al Amin',
            'Ms. Sadia', 'Md. Masum', 'Ms. Israt', 'Md. Saiful', 'Ms. Sharmin',
            'Md. Tanvir', 'Ms. Mitu', 'Md. Joynal', 'Ms. Nasrin', 'Md. Hasan',
        ];
        $lastNames = ['Islam', 'Hossain', 'Begum', 'Mia', 'Khan', 'Rahman', 'Akter', 'Hasan', 'Kabir', 'Sultana'];

        $religions = ['Islam', 'Hinduism', 'Buddhism', 'Christianity'];
        $bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
        $guardianRelations = ['Father', 'Mother', 'Uncle', 'Grandfather'];

        $students = [];

        foreach ($institutions as $instId) {
            $classIds = $classIdsByInst[$instId];
            $roll = 1;

            foreach ($classIds as $classId) {
                $count = rand(3, 6);
                for ($i = 0; $i < $count; $i++) {
                    $gender = fake()->randomElement(['Male', 'Female']);
                    $fname = fake()->randomElement($firstNames);
                    $lname = fake()->randomElement($lastNames);
                    $isMale = $gender === 'Male';
                    $prefix = $isMale ? '' : 'Ms. ';
                    $guardianIsMale = fake()->boolean(70);

                    $students[] = [
                        'institution_id' => $instId,
                        'session_id' => 3,
                        'class_id' => $classId,
                        'roll_number' => (string) $roll,
                        'name_en' => $prefix.$fname.' '.$lname,
                        'name_bn' => $prefix.$fname.' '.$lname,
                        'date_of_birth' => now()->subYears(rand(10, 18))->subDays(rand(1, 365)),
                        'gender' => $gender,
                        'blood_group' => fake()->randomElement($bloodGroups),
                        'religion' => fake()->randomElement($religions),
                        'nationality' => 'Bangladeshi',
                        'birth_certificate_number' => (string) rand(1000000000000, 9999999999999),
                        'father_name_en' => 'Md. '.fake()->lastName().' '.fake()->lastName(),
                        'father_name_bn' => 'মোঃ '.fake()->lastName().' '.fake()->lastName(),
                        'father_nid' => (string) rand(1000000000, 9999999999),
                        'father_phone' => '+8801'.rand(300000000, 399999999),
                        'father_occupation' => fake()->randomElement(['Service', 'Business', 'Teacher', 'Farmer', 'Doctor', 'Lawyer']),
                        'mother_name_en' => 'Mrs. '.fake()->lastName().' '.fake()->lastName(),
                        'mother_name_bn' => 'মিসেস '.fake()->lastName().' '.fake()->lastName(),
                        'mother_nid' => (string) rand(1000000000, 9999999999),
                        'mother_phone' => '+8801'.rand(300000000, 399999999),
                        'mother_occupation' => fake()->randomElement(['Housewife', 'Teacher', 'Nurse', 'Service']),
                        'guardian_name' => $guardianIsMale ? 'Md. '.fake()->lastName() : 'Mrs. '.fake()->lastName(),
                        'guardian_relation' => fake()->randomElement($guardianRelations),
                        'guardian_phone' => '+8801'.rand(300000000, 399999999),
                        'guardian_address' => fake()->address(),
                        'present_address' => fake()->address(),
                        'permanent_address' => fake()->address(),
                        'previous_school' => fake()->randomElement(['ABC Kindergarten', 'Little Star School', 'Model Academy', 'Sunrise School']),
                        'previous_class' => 'Class '.rand(1, 5),
                        'previous_gpa' => fake()->randomFloat(2, 3.00, 5.00),
                        'academic_year' => '2026',
                        'is_active' => true,
                    ];
                    $roll++;
                }
            }
        }

        foreach ($students as $s) {
            Student::create($s);
        }
    }
}
