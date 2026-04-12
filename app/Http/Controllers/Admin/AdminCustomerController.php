<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\Goal;
use App\Models\GoalTransfer;
use App\Models\Income;
use App\Models\SavingsTransfer;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AdminCustomerController extends Controller
{
    public function index(): Response
    {
        $now = Carbon::now();
        $monthStart = $now->copy()->startOfMonth();
        $monthEnd = $now->copy()->endOfMonth();
        $windowStart = $now->copy()->subDays(29)->startOfDay();
        $windowEnd = $now->copy()->endOfDay();

        $totalCustomers = User::query()
            ->where('is_super_admin', false)
            ->count();

        $verifiedCustomers = User::query()
            ->where('is_super_admin', false)
            ->whereNotNull('email_verified_at')
            ->count();

        $newCustomersMonth = User::query()
            ->where('is_super_admin', false)
            ->whereBetween('created_at', [$monthStart, $monthEnd])
            ->count();

        $customersWithGoals = Goal::query()
            ->whereHas('user', fn ($query) => $query->where('is_super_admin', false))
            ->distinct('user_id')
            ->count('user_id');

        $customersWithSavings = SavingsTransfer::query()
            ->whereHas('user', fn ($query) => $query->where('is_super_admin', false))
            ->distinct('user_id')
            ->count('user_id');

        $activeUserIds = collect()
            ->merge(Income::query()->whereBetween('received_at', [$windowStart, $windowEnd])->pluck('user_id')->all())
            ->merge(Expense::query()->whereBetween('spent_at', [$windowStart, $windowEnd])->pluck('user_id')->all())
            ->merge(SavingsTransfer::query()->whereBetween('transferred_at', [$windowStart, $windowEnd])->pluck('user_id')->all())
            ->merge(GoalTransfer::query()->whereBetween('transferred_at', [$windowStart, $windowEnd])->pluck('user_id')->all())
            ->filter()
            ->unique()
            ->values();

        $activeCustomers30d = $activeUserIds->isEmpty()
            ? 0
            : User::query()
                ->where('is_super_admin', false)
                ->whereIn('id', $activeUserIds)
                ->count();

        $users = User::query()
            ->where('is_super_admin', false)
            ->with(['subscription.plan:id,code,name,price_monthly,currency,is_free'])
            ->withCount([
                'incomes',
                'expenses',
                'goals',
                'savingsTransfers',
                'incomes as incomes_30d_count' => fn ($query) => $query->whereBetween('received_at', [$windowStart, $windowEnd]),
                'expenses as expenses_30d_count' => fn ($query) => $query->whereBetween('spent_at', [$windowStart, $windowEnd]),
                'savingsTransfers as savings_30d_count' => fn ($query) => $query->whereBetween('transferred_at', [$windowStart, $windowEnd]),
                'goalTransfers as goal_transfers_30d_count' => fn ($query) => $query->whereBetween('transferred_at', [$windowStart, $windowEnd]),
            ])
            ->latest()
            ->limit(250)
            ->get()
            ->map(function (User $user) {
                $activity30d = (int) $user->incomes_30d_count
                    + (int) $user->expenses_30d_count
                    + (int) $user->savings_30d_count
                    + (int) $user->goal_transfers_30d_count;

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'joined_at' => $user->created_at?->format('Y-m-d H:i'),
                    'email_verified' => (bool) $user->email_verified_at,
                    'plan' => [
                        'code' => $user->subscription?->plan?->code ?? 'gratis',
                        'name' => $user->subscription?->plan?->name ?? 'Gratis',
                        'status' => $user->subscription?->status ?? 'active',
                        'price_monthly' => (float) ($user->subscription?->plan?->price_monthly ?? 0),
                    ],
                    'totals' => [
                        'incomes' => (int) $user->incomes_count,
                        'expenses' => (int) $user->expenses_count,
                        'goals' => (int) $user->goals_count,
                        'savings_deposits' => (int) $user->savings_transfers_count,
                    ],
                    'activity_30d' => $activity30d,
                ];
            })
            ->values()
            ->all();

        $planDistribution = collect($users)
            ->pluck('plan.name')
            ->countBy()
            ->map(fn (int $count, string $name) => [
                'name' => $name,
                'count' => $count,
            ])
            ->values()
            ->all();

        return Inertia::render('Admin/Users', [
            'canDelete' => true,
            'adminDomain' => config('admin.domain'),
            'generatedAt' => $now->toIso8601String(),
            'stats' => [
                'total_customers' => $totalCustomers,
                'verified_customers' => $verifiedCustomers,
                'new_customers_month' => $newCustomersMonth,
                'active_customers_30d' => $activeCustomers30d,
                'engagement_ratio_30d' => $totalCustomers > 0
                    ? round(($activeCustomers30d / $totalCustomers) * 100, 1)
                    : 0.0,
                'customers_with_goals' => $customersWithGoals,
                'customers_with_savings' => $customersWithSavings,
            ],
            'users' => $users,
            'planDistribution' => $planDistribution,
        ]);
    }

    public function destroy(User $user): RedirectResponse
    {
        if ($user->is_super_admin) {
            abort(403, 'Não é possível remover administradores por esta rota.');
        }

        $user->delete();

        return redirect()->back()->with('success', "Utilizador {$user->email} removido com sucesso.");
    }
}
