<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Expense extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'description',
        'amount',
        'category',
        'bucket',
        'spent_at',
        'is_recurring',
        'frequency',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'spent_at' => 'date',
        'is_recurring' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function monthlyAmount(): float
    {
        if (!$this->is_recurring) {
            return (float) $this->amount;
        }

        return match ($this->frequency) {
            'semanal' => (float) $this->amount * 4,
            'quinzenal' => (float) $this->amount * 2,
            'mensal' => (float) $this->amount,
            'bimestral' => (float) $this->amount / 2,
            'trimestral' => (float) $this->amount / 3,
            'semestral' => (float) $this->amount / 6,
            'anual' => (float) $this->amount / 12,
            default => (float) $this->amount,
        };
    }

    public function appliesInMonth(\Carbon\Carbon $month): bool
    {
        $startDate = $this->spent_at;
        $monthStart = $month->copy()->startOfMonth();
        $monthEnd = $month->copy()->endOfMonth();

        if (!$this->is_recurring) {
            return $startDate->between($monthStart, $monthEnd);
        }

        if ($startDate->isAfter($monthEnd)) {
            return false;
        }

        return match ($this->frequency) {
            'semanal', 'quinzenal', 'mensal' => true,
            'bimestral' => $startDate->diffInMonths($monthStart) % 2 === 0,
            'trimestral' => $startDate->diffInMonths($monthStart) % 3 === 0,
            'semestral' => $startDate->diffInMonths($monthStart) % 6 === 0,
            'anual' => $startDate->month === $monthStart->month,
            default => true,
        };
    }
}
