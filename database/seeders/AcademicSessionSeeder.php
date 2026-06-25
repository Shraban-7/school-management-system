<?php

namespace Database\Seeders;

use App\Models\AcademicSession;
use Illuminate\Database\Seeder;

class AcademicSessionSeeder extends Seeder
{
    public function run(): void
    {
        AcademicSession::insert([
            [
                'session_name' => '2024-2025',
                'start_date' => '2024-01-01',
                'end_date' => '2024-12-31',
                'is_active' => false,
            ],
            [
                'session_name' => '2025-2026',
                'start_date' => '2025-01-01',
                'end_date' => '2025-12-31',
                'is_active' => false,
            ],
            [
                'session_name' => '2026-2027',
                'start_date' => '2026-01-01',
                'end_date' => '2026-12-31',
                'is_active' => true,
            ],
        ]);
    }
}
