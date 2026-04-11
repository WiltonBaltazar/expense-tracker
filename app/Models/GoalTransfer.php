<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GoalTransfer extends Model
{
    protected $fillable = [
        'user_id',
        'goal_id',
        'type',
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

    public function goal(): BelongsTo
    {
        return $this->belongsTo(Goal::class);
    }
}
