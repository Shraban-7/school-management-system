<?php

namespace App\Enums;

enum FeeType: string
{
    case ADMISSION = 'admission';
    case MONTHLY_TUITION = 'monthly_tuition';
    case EXAM_FEE = 'exam_fee';
    case SESSION_FEE = 'session_fee';

    public function label(): string
    {
        return match ($this) {
            self::ADMISSION => 'Admission fee',
            self::MONTHLY_TUITION => 'Monthly tuition',
            self::EXAM_FEE => 'Exam fee',
            self::SESSION_FEE => 'Session fee',
        };
    }

    public function publicDescription(): string
    {
        return match ($this) {
            self::ADMISSION => 'One-time fee for newly admitted students (ভর্তি ফি).',
            self::MONTHLY_TUITION => 'Charged every month (মাসিক বেতন). Usually due by the 10th of the month.',
            self::SESSION_FEE => 'Annual / session fee collected at the start of the academic year (সেশন ফি).',
            self::EXAM_FEE => 'Collected before major exams / terms (পরীক্ষা ফি).',
        };
    }
}
