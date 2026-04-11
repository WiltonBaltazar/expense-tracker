<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Goal extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'target_amount',
        'current_amount',
        'deadline',
        'completed',
        'savings_pct',
    ];

    protected $casts = [
        'target_amount' => 'decimal:2',
        'current_amount' => 'decimal:2',
        'deadline' => 'date',
        'completed' => 'boolean',
        'savings_pct' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function savingsAllocations(): HasMany
    {
        return $this->hasMany(GoalSavingsAllocation::class);
    }

    public function transfers(): HasMany
    {
        return $this->hasMany(GoalTransfer::class);
    }

    public function remainingAmount(): float
    {
        return (float) $this->target_amount - (float) $this->current_amount;
    }

    public function progressPercentage(): float
    {
        if ((float) $this->target_amount === 0.0) {
            return 100;
        }

        return min(100, ((float) $this->current_amount / (float) $this->target_amount) * 100);
    }
}
