<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'needs_pct',
        'wants_pct',
        'savings_pct',
    ];

    protected $casts = [
        'needs_pct' => 'decimal:2',
        'wants_pct' => 'decimal:2',
        'savings_pct' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
