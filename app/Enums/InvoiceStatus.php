<?php

namespace App\Enums;

enum InvoiceStatus: string
{
    case PENDING = 'pending';
    case PARTIAL = 'partial';
    case PAID = 'paid';
    case OVERDUE = 'overdue';
    case WAIVED = 'waived';

    public function label(): string
    {
        return match ($this) {
            self::PENDING => 'Pending',
            self::PARTIAL => 'Partially paid',
            self::PAID => 'Paid',
            self::OVERDUE => 'Overdue',
            self::WAIVED => 'Waived',
        };
    }
}
