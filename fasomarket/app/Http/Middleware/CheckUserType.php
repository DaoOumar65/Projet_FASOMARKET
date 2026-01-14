<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckUserType
{
    public function handle(Request $request, Closure $next, $type)
    {
        if (!auth()->check()) {
            return response()->json(['message' => 'Non authentifié'], 401);
        }

        if (auth()->user()->type_utilisateur !== $type) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        return $next($request);
    }
}