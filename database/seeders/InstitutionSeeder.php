<?php

namespace Database\Seeders;

use App\Models\Institution;
use Illuminate\Database\Seeder;

class InstitutionSeeder extends Seeder
{
    public function run(): void
    {
        Institution::insert([
            [
                'name_en' => 'Dhaka Government Muslim High School',
                'name_bn' => 'ঢাকা সরকারি মুসলিম উচ্চ বিদ্যালয়',
                'eiin_number' => 108201,
                'board_affiliation' => 'Dhaka',
                'mpo_status' => true,
            ],
            [
                'name_en' => 'Chittagong Collegiate School',
                'name_bn' => 'চট্টগ্রাম কলেজিয়েট স্কুল',
                'eiin_number' => 104372,
                'board_affiliation' => 'Chittagong',
                'mpo_status' => true,
            ],
            [
                'name_en' => 'Rajshahi Collegiate School',
                'name_bn' => 'রাজশাহী কলেজিয়েট স্কুল',
                'eiin_number' => 126814,
                'board_affiliation' => 'Rajshahi',
                'mpo_status' => true,
            ],
        ]);
    }
}
