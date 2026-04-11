<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GoalSavingsAllocation extends Model
{
    protected $fillable = [
        'user_id',
        'goal_id',
        'savings_transfer_id',
        'amount',
        'allocated_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'allocated_at' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function goal(): BelongsTo
    {
        return $this->belongsTo(Goal::class);
    }

    public function savingsTransfer(): BelongsTo
    {
        return $this->belongsTo(SavingsTransfer::class);
    }
}
