<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\TokenExpiredException;
use Tymon\JWTAuth\Exceptions\TokenInvalidException;
use Tymon\JWTAuth\Exceptions\JWTException;

class AuthenticateJWT
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        try {
            // Log the authorization header for debugging
            Log::info('Token:', ['token' => $request->header('Authorization')]);

            // Attempt to authenticate the token
            $user = JWTAuth::parseToken()->authenticate();

            // If no user is authenticated, return Unauthorized
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

        } catch (TokenExpiredException $e) {
            Log::error('TokenExpiredException:', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Token has expired'], 401);

        } catch (TokenInvalidException $e) {
            Log::error('TokenInvalidException:', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Token is invalid'], 401);

        } catch (JWTException $e) {
            Log::error('JWTException:', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Token is missing or not provided'], 401);
        }

        return $next($request);
    }
}
