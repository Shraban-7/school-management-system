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

    public static function calculate(float $marks, float $fullMarks = 100): array
    {
        $percentage = ($marks / max($fullMarks, 1)) * 100;
        $scale = self::all();
        $result = ['grade' => 'F', 'point' => 0.00, 'percentage' => round($percentage, 2)];

        foreach ($scale as $level) {
            if ($percentage >= $level['min'] && $percentage <= $level['max']) {
                $result['grade'] = $level['grade'];
                $result['point'] = $level['point'];
                break;
            }
        }

        return $result;
    }
}
