<?php

namespace Database\Seeders;

use App\Enums\FeeType;
use App\Models\ClassesAndSection;
use App\Models\FeeStructure;
use App\Models\Institution;
use App\Services\FeeService;
use Illuminate\Database\Seeder;

class FeeSeeder extends Seeder
{
    public function run(): void
    {
        $institution = Institution::query()->first();
        if (! $institution) {
            return;
        }

        $classes = ClassesAndSection::query()
            ->where('institution_id', $institution->id)
            ->limit(5)
            ->get();

        foreach ($classes as $class) {
            $monthly = match (true) {
                str_contains($class->class_level, '9') => 2500,
                str_contains($class->class_level, '10') => 2800,
                default => 2000,
            };

            $this->ensureStructure($institution->id, $class->id, FeeType::MONTHLY_TUITION, 'Monthly tuition', 'মাসিক বেতন', $monthly);
            $this->ensureStructure($institution->id, $class->id, FeeType::ADMISSION, 'Admission fee', 'ভর্তি ফি', 5000);
            $this->ensureStructure($institution->id, $class->id, FeeType::SESSION_FEE, 'Session / annual fee', 'সেশন ফি', 3000);
            $this->ensureStructure($institution->id, $class->id, FeeType::EXAM_FEE, 'Exam fee (per term)', 'পরীক্ষা ফি', 800);
        }

        app(FeeService::class)->generateMonthlyInvoices(
            now()->format('Y-m'),
            $institution->id,
        );
    }

    private function ensureStructure(
        int $institutionId,
        int $classId,
        FeeType $type,
        string $nameEn,
        string $nameBn,
        float $amount,
    ): void {
        $existing = FeeStructure::query()
            ->where('class_id', $classId)
            ->where('fee_type', $type)
            ->whereNull('session_id')
            ->first();

        if ($existing) {
            return;
        }

        $structure = new FeeStructure;
        $structure->forceFill([
            'institution_id' => $institutionId,
            'class_id' => $classId,
            'session_id' => null,
            'fee_type' => $type,
            'name_en' => $nameEn,
            'name_bn' => $nameBn,
            'amount' => $amount,
            'is_active' => true,
        ])->save();
    }
}
