<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $subscription = null;

        if ($user) {
            $user->loadMissing('subscription.plan');

            $plan = $user->subscription?->plan;

            $subscription = [
                'status' => $user->subscription?->status ?? 'active',
                'started_at' => $user->subscription?->started_at?->toISOString(),
                'plan' => [
                    'code' => $plan?->code ?? 'gratis',
                    'name' => $plan?->name ?? 'Gratis',
                    'price_monthly' => (float) ($plan?->price_monthly ?? 0),
                    'currency' => $plan?->currency ?? 'MZN',
                ],
                'features' => $user->planFeatures(),
            ];
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
                'subscribed_at' => $user?->subscribed_at?->toISOString(),
                'subscription_start_month' => $user?->subscriptionStartMonth()->format('Y-m'),
                'subscription' => $subscription,
            ],
        ];
    }
}
