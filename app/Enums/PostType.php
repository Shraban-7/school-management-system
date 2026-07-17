<?php

namespace App\Enums;

enum PostType: string
{
    case NOTICE = 'notice';
    case BLOG = 'blog';
    case ACTIVITY = 'activity';

    public function label(): string
    {
        return match ($this) {
            self::NOTICE => 'Notice',
            self::BLOG => 'Blog',
            self::ACTIVITY => 'Activity',
        };
    }

    public function pluralLabel(): string
    {
        return match ($this) {
            self::NOTICE => 'Notices',
            self::BLOG => 'Blog',
            self::ACTIVITY => 'Activities',
        };
    }
}
