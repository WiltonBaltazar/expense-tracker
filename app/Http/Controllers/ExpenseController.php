<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExpenseController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $month = $request->query('month')
            ? Carbon::parse($request->query('month'))
            : Carbon::now();

        // Clamp to subscription start month
        $subscriptionStart = $user->subscriptionStartMonth();
        if ($month->lt($subscriptionStart)) {
            $month = $subscriptionStart;
        }

        $startOfMonth = $month->copy()->startOfMonth();
        $endOfMonth = $month->copy()->endOfMonth();

        // One-time expenses for this month
        $oneTimeExpenses = $user->expenses()
            ->where('is_recurring', false)
            ->whereBetween('spent_at', [$startOfMonth, $endOfMonth])
            ->orderByDesc('spent_at')
            ->get();

        // Recurring expenses that started on or before this month
        $recurringExpenses = $user->expenses()
            ->where('is_recurring', true)
            ->where('spent_at', '<=', $endOfMonth)
            ->orderByDesc('spent_at')
            ->get()
            ->filter(fn ($expense) => $expense->appliesInMonth($month))
            ->values();

        // Monthly totals for summary
        $allExpenses = $oneTimeExpenses->concat($recurringExpenses);
        $monthTotal = $allExpenses->sum('amount');
        $byBucket = [
            'necessidades' => $allExpenses->where('bucket', 'necessidades')->sum('amount'),
            'desejos' => $allExpenses->where('bucket', 'desejos')->sum('amount'),
        ];

        return Inertia::render('Expenses/Index', [
            'expenses' => $oneTimeExpenses,
            'recurringExpenses' => $recurringExpenses,
            'monthTotal' => $monthTotal,
            'byBucket' => $byBucket,
            'currentMonth' => $month->format('Y-m'),
            'currentMonthLabel' => $month->translatedFormat('F Y'),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'description' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0.01',
            'category' => 'required|string|max:255',
            'bucket' => 'required|in:necessidades,desejos',
            'spent_at' => 'required|date',
            'is_recurring' => 'boolean',
            'frequency' => 'required_if:is_recurring,true|nullable|in:semanal,quinzenal,mensal,bimestral,trimestral,semestral,anual',
        ]);

        $validated['is_recurring'] = $validated['is_recurring'] ?? false;
        if (!$validated['is_recurring']) {
            $validated['frequency'] = null;
        }

        $request->user()->expenses()->create($validated);

        return redirect()->back()->with('success', 'Despesa registrada com sucesso!');
    }

    public function update(Request $request, Expense $expense)
    {
        $this->authorize('update', $expense);

        $validated = $request->validate([
            'description' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0.01',
            'category' => 'required|string|max:255',
            'bucket' => 'required|in:necessidades,desejos',
            'spent_at' => 'required|date',
            'is_recurring' => 'boolean',
            'frequency' => 'required_if:is_recurring,true|nullable|in:semanal,quinzenal,mensal,bimestral,trimestral,semestral,anual',
        ]);

        $validated['is_recurring'] = $validated['is_recurring'] ?? false;
        if (!$validated['is_recurring']) {
            $validated['frequency'] = null;
        }

        $expense->update($validated);

        return redirect()->back()->with('success', 'Despesa atualizada com sucesso!');
    }

    public function destroy(Expense $expense)
    {
        $this->authorize('delete', $expense);

        $expense->delete();

        return redirect()->back()->with('success', 'Despesa removida com sucesso!');
    }
}
