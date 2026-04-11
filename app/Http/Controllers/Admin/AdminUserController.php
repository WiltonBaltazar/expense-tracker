<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class AdminUserController extends Controller
{
    public function index(): Response
    {
        $adminUsers = User::query()
            ->where('is_super_admin', true)
            ->select(['id', 'name', 'email', 'admin_domain', 'created_at'])
            ->latest()
            ->get()
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'admin_domain' => $user->admin_domain,
                'created_at' => $user->created_at?->format('Y-m-d H:i'),
            ])
            ->values()
            ->all();

        $domains = collect($adminUsers)
            ->pluck('admin_domain')
            ->map(fn (?string $domain) => $domain ?: config('admin.domain'))
            ->countBy()
            ->map(fn (int $count, string $domain) => [
                'domain' => $domain,
                'count' => $count,
            ])
            ->values()
            ->all();

        return Inertia::render('Admin/AdminUsers', [
            'adminDomain' => config('admin.domain'),
            'generatedAt' => now()->toIso8601String(),
            'adminUsers' => $adminUsers,
            'adminDomains' => $domains,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'admin_domain' => 'nullable|string|max:255',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'email_verified_at' => now(),
            'is_super_admin' => true,
            'admin_domain' => $validated['admin_domain'] ?: config('admin.domain'),
        ]);

        $user->ensureDefaultSubscription();

        return redirect()->back()->with('success', 'Novo administrador criado com sucesso.');
    }
}
