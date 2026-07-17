<?php

namespace App\Helpers;

class GradeScale
{
    /**
     * Bangladesh National Curriculum grading system.
     *
     * @return array<int, array{grade: string, point: float, min: float, max: float}>
     */
    public static function all(): array
    {
        return [
            ['grade' => 'A+', 'point' => 5.00, 'min' => 80, 'max' => 100],
            ['grade' => 'A',  'point' => 4.00, 'min' => 70, 'max' => 79],
            ['grade' => 'A-', 'point' => 3.50, 'min' => 60, 'max' => 69],
            ['grade' => 'B',  'point' => 3.00, 'min' => 50, 'max' => 59],
            ['grade' => 'C',  'point' => 2.00, 'min' => 40, 'max' => 49],
            ['grade' => 'D',  'point' => 1.00, 'min' => 33, 'max' => 39],
            ['grade' => 'F',  'point' => 0.00, 'min' => 0,  'max' => 32],
        ];
    }

    /**
     * Resolve a subject grade from raw marks.
     *
     * When $passMarks is supplied, scoring below it is an automatic F/0.00
     * regardless of the percentage band — this is the Bangladesh board rule
     * (a student who fails a subject cannot earn a grade point in it).
     *
     * @return array{grade: string, point: float, percentage: float}
     */
    public static function calculate(float $marks, float $fullMarks = 100, ?float $passMarks = null): array
    {
        $percentage = ($marks / max($fullMarks, 1)) * 100;
        $result = ['grade' => 'F', 'point' => 0.00, 'percentage' => round($percentage, 2)];

        if ($passMarks !== null && $marks < $passMarks) {
            return $result;
        }

        foreach (self::all() as $level) {
            if ($percentage >= $level['min'] && $percentage <= $level['max']) {
                $result['grade'] = $level['grade'];
                $result['point'] = $level['point'];
                break;
            }
        }

        return $result;
    }

    /**
     * Map a computed GPA (average of subject grade points) to a letter grade,
     * using the standard Bangladesh GPA bands.
     */
    public static function letterFromGpa(float $gpa): string
    {
        return match (true) {
            $gpa >= 5.00 => 'A+',
            $gpa >= 4.00 => 'A',
            $gpa >= 3.50 => 'A-',
            $gpa >= 3.00 => 'B',
            $gpa >= 2.00 => 'C',
            $gpa >= 1.00 => 'D',
            default => 'F',
        };
    }
}
