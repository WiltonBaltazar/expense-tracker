<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingController extends Controller
{
    public function edit(Request $request)
    {
        $user = $request->user();
        $setting = $user->setting ?? $user->setting()->firstOrCreate([], [
            'needs_pct' => 50,
            'wants_pct' => 30,
            'savings_pct' => 20,
        ]);

        return Inertia::render('Settings/Edit', [
            'setting' => $setting,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'needs_pct' => 'required|numeric|min:0|max:100',
            'wants_pct' => 'required|numeric|min:0|max:100',
            'savings_pct' => 'required|numeric|min:0|max:100',
        ]);

        $total = $validated['needs_pct'] + $validated['wants_pct'] + $validated['savings_pct'];

        if (abs($total - 100) > 0.01) {
            return redirect()->back()->withErrors([
                'needs_pct' => 'A soma dos percentuais deve ser exatamente 100%.',
            ]);
        }

        $request->user()->setting()->updateOrCreate(
            ['user_id' => $request->user()->id],
            $validated
        );

        return redirect()->back()->with('success', 'Configurações atualizadas com sucesso!');
    }
}
