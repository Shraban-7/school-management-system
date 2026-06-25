<?php

namespace App\Enums;

enum UserRole :string
{
    case ADMIN = 'admin';
    case HEADMASTER = 'headmaster';
    case TEACHER = 'teacher';
    case STUDENT = 'student';
    case STAFF = 'staff';


    public function title(): string
    {
        return match ($this) {
            self::ADMIN => 'Admin',
            self::HEADMASTER => 'Headmaster',
            self::TEACHER => 'Teacher',
            self::STUDENT => 'Student',
            self::STAFF => 'Staff',
        };
    }
}
