<?php

namespace App\Models;

use App\Enums\UserRole;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Guarded(['*'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => UserRole::class,
        ];
    }

    public function hasRole(UserRole $role): bool
    {
        return $this->role === $role;
    }

    public function dashboardRoute(): string
    {
        return match ($this->role) {
            UserRole::ADMIN => route('admin.dashboard'),
            UserRole::HEADMASTER => route('headmaster.dashboard'),
            UserRole::TEACHER => route('teacher.dashboard'),
            UserRole::STUDENT => route('student.dashboard'),
            UserRole::STAFF => route('staff.dashboard'),
            default => route('home'),
        };
    }
}
