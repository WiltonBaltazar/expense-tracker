<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdminDomain
{
    public function handle(Request $request, Closure $next): Response
    {
        $expectedDomain = strtolower((string) config('admin.domain'));

        if ($expectedDomain === '') {
            return $next($request);
        }

        $currentHost = strtolower($request->getHost());
        $localDomains = array_map('strtolower', (array) config('admin.local_domains', []));

        if ($currentHost === $expectedDomain || in_array($currentHost, $localDomains, true)) {
            return $next($request);
        }

        if (! $request->isMethod('GET')) {
            abort(403, 'Ação permitida apenas no domínio administrativo.');
        }

        $scheme = $request->isSecure() ? 'https' : 'http';
        $path = $request->getPathInfo();
        $query = $request->getQueryString();
        $targetUrl = sprintf('%s://%s%s%s', $scheme, $expectedDomain, $path, $query ? '?'.$query : '');

        return redirect()->away($targetUrl);
    }
}
