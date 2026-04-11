<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSubscriptionFeature
{
    public function handle(Request $request, Closure $next, string $feature): Response
    {
        $user = $request->user();

        if (! $user || $user->isSuperAdmin() || $user->hasFeature($feature)) {
            return $next($request);
        }

        if ($request->expectsJson()) {
            abort(403, 'Feature not available for your plan.');
        }

        return redirect()
            ->route('settings.edit')
            ->with('error', 'Esta funcionalidade não está disponível no seu plano.');
    }
}
