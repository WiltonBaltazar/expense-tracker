<?php

namespace App\Http\Controllers;

use App\Models\BudgetLimit;
use Illuminate\Http\Request;

class BudgetLimitController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'category' => 'required|string|max:255',
            'monthly_limit' => 'required|numeric|min:1',
        ]);

        // Upsert — one limit per category per user
        $request->user()->budgetLimits()->updateOrCreate(
            ['category' => $validated['category']],
            ['monthly_limit' => $validated['monthly_limit']]
        );

        return redirect()->back()->with('success', 'Limite definido com sucesso!');
    }

    public function update(Request $request, BudgetLimit $budgetLimit)
    {
        $this->authorize('update', $budgetLimit);

        $validated = $request->validate([
            'monthly_limit' => 'required|numeric|min:1',
        ]);

        $budgetLimit->update($validated);

        return redirect()->back()->with('success', 'Limite atualizado!');
    }

    public function destroy(BudgetLimit $budgetLimit)
    {
        $this->authorize('delete', $budgetLimit);

        $budgetLimit->delete();

        return redirect()->back()->with('success', 'Limite removido!');
    }
}
