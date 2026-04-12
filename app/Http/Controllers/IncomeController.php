<?php

namespace App\Http\Controllers;

use App\Models\Income;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class IncomeController extends Controller
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

        $incomes = $user->incomes()
            ->whereBetween('received_at', [$startOfMonth, $endOfMonth])
            ->orderByDesc('received_at')
            ->get();

        $monthTotal = $incomes->sum('amount');

        return Inertia::render('Incomes/Index', [
            'incomes' => $incomes,
            'monthTotal' => $monthTotal,
            'currentMonth' => $month->format('Y-m'),
            'currentMonthLabel' => $month->translatedFormat('F Y'),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'source' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0.01',
            'frequency' => 'required|in:semanal,quinzenal,mensal,bimestral,trimestral,semestral,anual,unico',
            'description' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:500',
            'payment_method' => 'nullable|in:dinheiro,mpesa,emola,mkesh,banco',
            'received_at' => 'required|date',
        ]);

        $request->user()->incomes()->create($validated);

        return redirect()->back()->with('success', 'Renda adicionada com sucesso!');
    }

    public function update(Request $request, Income $income)
    {
        $this->authorize('update', $income);

        $validated = $request->validate([
            'source' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0.01',
            'frequency' => 'required|in:semanal,quinzenal,mensal,bimestral,trimestral,semestral,anual,unico',
            'description' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:500',
            'payment_method' => 'nullable|in:dinheiro,mpesa,emola,mkesh,banco',
            'received_at' => 'required|date',
        ]);

        $income->update($validated);

        return redirect()->back()->with('success', 'Renda atualizada com sucesso!');
    }

    public function destroy(Income $income)
    {
        $this->authorize('delete', $income);

        $income->delete();

        return redirect()->back()->with('success', 'Renda removida com sucesso!');
    }
}
