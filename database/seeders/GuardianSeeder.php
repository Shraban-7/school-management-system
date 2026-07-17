<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Seeder;

class GuardianSeeder extends Seeder
{
    /**
     * Create one parent/guardian login per seeded student, using the
     * guardian_phone already stored on the student record (falling back
     * to father_phone) so the demo credentials line up with the printed
     * admission form a real guardian would have been given.
     */
    public function run(): void
    {
        Student::query()
            ->whereNotNull('guardian_phone')
            ->orWhereNotNull('father_phone')
            ->get()
            ->each(function (Student $student): void {
                $phone = $student->guardian_phone ?: $student->father_phone;

                if (! $phone) {
                    return;
                }

                $user = User::firstOrCreate(
                    ['phone' => $phone],
                    [
                        'name' => $student->guardian_name ?: $student->father_name_en ?: 'Guardian of '.$student->name_en,
                        'role' => UserRole::PARENT,
                        'password' => bcrypt('password'),
                        'is_active' => true,
                    ]
                );

                $student->guardians()->syncWithoutDetaching([
                    $user->id => [
                        'relation' => $student->guardian_relation ?: 'Father',
                        'is_primary_contact' => true,
                    ],
                ]);
            });
    }
}
