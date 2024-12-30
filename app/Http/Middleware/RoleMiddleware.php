<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;

class RoleMiddleware
{
    public function handle($request, Closure $next, $role)
    {
        if (!Auth::check()) {
            return redirect('/');
        }

        $user = Auth::user();

        if ($role === 'admin' && !$user instanceof \App\Models\Admin) {
            return redirect('/')->withErrors('Access Denied');
        }

        if ($role === 'lecturer_supervisor' && !$user instanceof \App\Models\Lecturer) {
            return redirect('/')->withErrors('Access Denied');
        }

        if ($role === 'lecturer_coordinator' && !$user instanceof \App\Models\Lecturer) {
            return redirect('/')->withErrors('Access Denied');
        }

        if ($role === 'lecturer_both' && !$user instanceof \App\Models\Lecturer) {
            return redirect('/')->withErrors('Access Denied');
        }

        if ($role === 'student' && !$user instanceof \App\Models\Student) {
            return redirect('/')->withErrors('Access Denied');
        }

        return $next($request);
    }
}
