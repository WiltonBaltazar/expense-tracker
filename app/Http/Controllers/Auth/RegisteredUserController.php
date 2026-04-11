<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(Request $request): Response
    {
        $selectedPlan = null;

        if ($request->filled('plan')) {
            $plan = \App\Models\SubscriptionPlan::query()
                ->where('code', $request->input('plan'))
                ->where('is_active', true)
                ->first();

            if ($plan) {
                $selectedPlan = [
                    'code'          => $plan->code,
                    'name'          => $plan->name,
                    'price_monthly' => (float) $plan->price_monthly,
                    'currency'      => $plan->currency,
                    'is_free'       => (bool) $plan->is_free,
                    'duration_months' => (int) ($plan->duration_months ?? 1),
                ];
            }
        }

        return Inertia::render('Auth/Register', [
            'selectedPlan' => $selectedPlan,
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name'      => 'required|string|max:255',
            'email'     => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password'  => ['required', 'confirmed', Rules\Password::defaults()],
            'plan_code' => ['nullable', 'string', 'max:64'],
        ]);

        $user = User::create([
            'name'          => $request->name,
            'email'         => $request->email,
            'password'      => Hash::make($request->password),
            'subscribed_at' => now(),
        ]);

        $user->ensureDefaultSubscription($request->input('plan_code') ?: null);

        event(new Registered($user));

        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }
}
