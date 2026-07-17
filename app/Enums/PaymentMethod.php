<?php

namespace App\Enums;

enum PaymentMethod: string
{
    case CASH = 'cash';
    case BKASH = 'bkash';
    case NAGAD = 'nagad';
    case ROCKET = 'rocket';
    case BANK_TRANSFER = 'bank_transfer';

    public function label(): string
    {
        return match ($this) {
            self::CASH => 'Cash',
            self::BKASH => 'bKash',
            self::NAGAD => 'Nagad',
            self::ROCKET => 'Rocket',
            self::BANK_TRANSFER => 'Bank transfer',
        };
    }

    /** Methods that require a transaction/reference number when recording. */
    public function requiresReference(): bool
    {
        return $this !== self::CASH;
    }
}
