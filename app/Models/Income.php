<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Income extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'source',
        'amount',
        'frequency',
        'description',
        'received_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'received_at' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function monthlyAmount(): float
    {
        return match ($this->frequency) {
            'semanal' => (float) $this->amount * 4,
            'quinzenal' => (float) $this->amount * 2,
            'mensal' => (float) $this->amount,
            'bimestral' => (float) $this->amount / 2,
            'trimestral' => (float) $this->amount / 3,
            'semestral' => (float) $this->amount / 6,
            'anual' => (float) $this->amount / 12,
            'unico' => (float) $this->amount,
        };
    }
}
