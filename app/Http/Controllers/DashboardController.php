<?php

namespace App\Http\Controllers;

use App\Services\FinancialSplitterService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __construct(
        private FinancialSplitterService $splitter
    ) {}

    public function index(Request $request)
    {
        $user = $request->user();
        $user->load(['incomes', 'expenses', 'goals', 'setting', 'savingsTransfers']);

        $month = $request->query('month')
            ? Carbon::parse($request->query('month'))
            : Carbon::now();

        // Clamp to subscription start month
        $subscriptionStart = $user->subscriptionStartMonth();
        if ($month->lt($subscriptionStart)) {
            $month = $subscriptionStart;
        }

        $startOfMonth = $month->copy()->startOfMonth();
        $endOfMonth   = $month->copy()->endOfMonth();

        $allocations  = $this->splitter->getBucketAllocations($user);
        $bucketStatus = $this->splitter->getBucketStatus($user, $month);
        $topWants     = $this->splitter->getTopWantsExpenses($user, $month);
        $weeklyBudget = $this->splitter->getWeeklyBudget($user);

        // Income received this month
        $monthIncome = $this->splitter->getIncomeForMonth($user, $month);

        $activeGoals = $user->goals->where('completed', false);

        $goals = $activeGoals->map(function ($goal) use ($user) {
            $eta = $this->splitter->calculateGoalEta($user, $goal->remainingAmount(), (float) $goal->savings_pct);
            return [
                ...$goal->toArray(),
                'progresso' => round($goal->progressPercentage(), 1),
                'restante' => $goal->remainingAmount(),
                'eta' => $eta,
            ];
        })->values();

        $savingsTransfers = $user->savingsTransfers()
            ->whereBetween('transferred_at', [$startOfMonth, $endOfMonth])
            ->orderByDesc('transferred_at')
            ->get();

        // Recent expenses for this month (one-time + recurring)

        $oneTimeExpenses = $user->expenses()
            ->where('is_recurring', false)
            ->whereBetween('spent_at', [$startOfMonth, $endOfMonth])
            ->orderByDesc('spent_at')
            ->limit(10)
            ->get();

        $recurringExpenses = $user->expenses()
            ->where('is_recurring', true)
            ->where('spent_at', '<=', $endOfMonth)
            ->get()
            ->filter(fn ($e) => $e->appliesInMonth($month))
            ->values();

        $recentExpenses = $oneTimeExpenses->concat($recurringExpenses)
            ->sortByDesc('spent_at')
            ->take(10)
            ->values();

        return Inertia::render('Dashboard', [
            'allocations'      => $allocations,
            'bucketStatus'     => $bucketStatus,
            'goals'            => $goals,
            'recentExpenses'   => $recentExpenses,
            'topWants'         => $topWants,
            'monthIncome'      => $monthIncome,
            'weeklyBudget'      => $weeklyBudget,
            'savingsTransfers'  => $savingsTransfers,
            'currentMonth'     => $month->format('Y-m'),
            'currentMonthLabel' => $month->translatedFormat('F Y'),
        ]);
    }
}
