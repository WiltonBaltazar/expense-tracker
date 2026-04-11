<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SavingsTransfer extends Model
{
    protected $fillable = [
        'user_id',
        'amount',
        'note',
        'transferred_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'transferred_at' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function goalAllocations(): HasMany
    {
        return $this->hasMany(GoalSavingsAllocation::class);
    }
}
