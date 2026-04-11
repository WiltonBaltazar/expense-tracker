<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SubscriptionPlan extends Model
{
    protected $fillable = [
        'code',
        'name',
        'description',
        'price_monthly',
        'currency',
        'billing_interval',
        'duration_months',
        'is_active',
        'is_free',
        'features',
    ];

    protected $casts = [
        'price_monthly' => 'decimal:2',
        'duration_months' => 'integer',
        'is_active' => 'boolean',
        'is_free' => 'boolean',
        'features' => 'array',
    ];

    public function subscriptions(): HasMany
    {
        return $this->hasMany(UserSubscription::class);
    }

    public function events(): HasMany
    {
        return $this->hasMany(SubscriptionEvent::class);
    }
}
