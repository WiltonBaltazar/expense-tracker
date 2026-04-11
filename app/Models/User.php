<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Carbon\Carbon;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    protected static function booted(): void
    {
        static::created(function (User $user): void {
            $user->ensureDefaultSubscription();
        });
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'subscribed_at',
        'is_super_admin',
        'admin_domain',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'subscribed_at' => 'datetime',
            'is_super_admin' => 'boolean',
            'password' => 'hashed',
        ];
    }

    public function incomes(): HasMany
    {
        return $this->hasMany(Income::class);
    }

    public function expenses(): HasMany
    {
        return $this->hasMany(Expense::class);
    }

    public function goals(): HasMany
    {
        return $this->hasMany(Goal::class);
    }

    public function setting(): HasOne
    {
        return $this->hasOne(UserSetting::class);
    }

    public function savingsTransfers(): HasMany
    {
        return $this->hasMany(SavingsTransfer::class);
    }

    public function goalSavingsAllocations(): HasMany
    {
        return $this->hasMany(GoalSavingsAllocation::class);
    }

    public function goalTransfers(): HasMany
    {
        return $this->hasMany(GoalTransfer::class);
    }

    public function subscription(): HasOne
    {
        return $this->hasOne(UserSubscription::class);
    }

    public function subscriptionEvents(): HasMany
    {
        return $this->hasMany(SubscriptionEvent::class);
    }

    public function subscriptionStartMonth(): Carbon
    {
        $date = $this->subscribed_at ?? $this->created_at;

        return Carbon::parse($date)->startOfMonth();
    }

    public function isSuperAdmin(): bool
    {
        return (bool) $this->is_super_admin;
    }

    /**
     * @return array<string, bool>
     */
    public static function defaultPlanFeatures(): array
    {
        $featureKeys = collect(config('subscriptions.features', []))
            ->filter(fn (array $meta) => ($meta['assignable'] ?? true) && (($meta['audience'] ?? 'user') === 'user'))
            ->keys()
            ->values()
            ->all();

        if (empty($featureKeys)) {
            $featureKeys = [
                'dashboard',
                'incomes',
                'expenses',
                'goals',
                'savings_wallet',
            ];
        }

        return array_fill_keys($featureKeys, true);
    }

    public function ensureDefaultSubscription(?string $planCode = null): void
    {
        if ($this->subscription()->exists()) {
            return;
        }

        $plan = null;

        if ($planCode) {
            $plan = SubscriptionPlan::query()
                ->where('code', $planCode)
                ->where('is_active', true)
                ->first();
        }

        $plan ??= SubscriptionPlan::query()
            ->where('code', 'gratis')
            ->first();

        if (! $plan) {
            return;
        }

        $subscription = $this->subscription()->create([
            'subscription_plan_id' => $plan->id,
            'status' => 'active',
            'started_at' => $this->subscribed_at ?? $this->created_at ?? now(),
        ]);

        $this->subscriptionEvents()->create([
            'subscription_plan_id' => $plan->id,
            'event_type' => 'default_plan_assigned',
            'status' => 'active',
            'amount' => (float) ($plan->price_monthly ?? 0),
            'currency' => $plan->currency,
            'occurred_at' => $subscription->started_at ?? now(),
            'note' => 'Plano padrão atribuído automaticamente.',
            'metadata' => [
                'source' => 'automatic_default_assignment',
                'plan_code' => $plan->code,
            ],
        ]);
    }

    public function subscriptionPlan(): ?SubscriptionPlan
    {
        $this->loadMissing('subscription.plan');

        return $this->subscription?->plan;
    }

    public function planCode(): string
    {
        return $this->subscriptionPlan()?->code ?? 'gratis';
    }

    /**
     * @return array<string, bool>
     */
    public function planFeatures(): array
    {
        $features = $this->subscriptionPlan()?->features;

        if (! is_array($features) || empty($features)) {
            return self::defaultPlanFeatures();
        }

        return $features;
    }

    public function hasFeature(string $feature): bool
    {
        $features = $this->planFeatures();

        return array_key_exists($feature, $features)
            ? (bool) $features[$feature]
            : true;
    }
}
