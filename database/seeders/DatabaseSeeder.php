<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        // 1. Users (admins/staff)
        $i = 0;
        foreach (UserRole::cases() as $role) {
            User::factory()->create([
                'name' => $role->title(),
                'email' => $role->value.'@example.com',
                'phone' => '+8801'.str_pad((string) (100000000 + $i++), 9, '0', STR_PAD_LEFT),
                'role' => $role,
            ]);
        }

        // 2. Institution data
        $this->call(InstitutionSeeder::class);
        $this->call(AcademicSessionSeeder::class);
        $this->call(ClassesAndSectionSeeder::class);

        // 3. Subjects & teachers
        $this->call(SubjectSeeder::class);
        $this->call(TeacherSeeder::class);

        // 4. Students
        $this->call(StudentSeeder::class);

        // 4a. Guardian/parent logins linked to students
        $this->call(GuardianSeeder::class);

        // 5. Exams & marks
        $this->call(ExamSeeder::class);
        $this->call(MarkSeeder::class);

        // 6. Attendance
        $this->call(AttendanceRecordSeeder::class);

        // 7. Fees (structures + sample monthly invoices)
        $this->call(FeeSeeder::class);

        // 8. Public website content (notices, blog, activities, syllabus)
        $this->call(WebsiteContentSeeder::class);
    }
}
