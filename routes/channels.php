<?php

use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

Broadcast::routes(['middleware' => ['auth:sanctum']]); 

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('RequestNotification{user_id}', function ($user, $user_id) {
    logger('Authenticating broadcast channel for user:', [$user->id, 'Channel User ID:', $user_id]);
    return (int) $user->id === (int) $user_id || (int) $user->AdminID === (int) $user_id;
});