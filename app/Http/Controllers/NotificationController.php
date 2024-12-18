<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Notification;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $role = $user->role;

        // Determine the recipient ID
        $recipientId = $role === 'admin' ? 'shared' : $user->id;

        $notifications = Notification::where('recipient_id', $recipientId)
            ->where('role', $role)
            ->orderBy('progress_update_id')
            ->orderByDesc('created_at') // Sort by latest notification per progress_update_id
            ->get()
            ->unique('progress_update_id');

        log::info($notifications);

        return response()->json($notifications);
    }

    public function markNotificationAsRead(Request $request, $progressUpdateId)
    {
        $user = Auth::user();
        $role = $user->role;
        $recipientId = $role === 'admin' ? 'shared' : $user->id;

        // Find the notification associated with this progress update for this recipient
        $notification = Notification::where('progress_update_id', $progressUpdateId)
            ->where('recipient_id', $recipientId)
            ->where('role', $role)
            ->latest('created_at')
            ->first();

        if (!$notification) {
            return response()->json(['message' => 'Notification not found.'], 404);
        }

        $notification->read_at = now();
        $notification->save();

        return response()->json(['message' => 'Notification marked as read.']);
    }

    public function markNotificationAsUnread(Request $request, $progressUpdateId)
    {
        $user = Auth::user();
        $role = $user->role;
        $recipientId = $role === 'admin' ? 'shared' : $user->id;

        $notification = Notification::where('progress_update_id', $progressUpdateId)
            ->where('recipient_id', $recipientId)
            ->where('role', $role)
            ->latest('created_at')
            ->first();

        if (!$notification) {
            return response()->json(['message' => 'Notification not found.'], 404);
        }

        $notification->read_at = null;
        $notification->save();

        return response()->json(['message' => 'Notification marked as unread.']);
    }

    public function getUnreadCount()
    {
        $user = Auth::user();
        $role = $user->role;
        $recipientId = $role === 'admin' ? 'shared' : $user->id;

        // Subquery to get the latest notification ID for each progress_update_id
        $subquery = Notification::selectRaw('progress_update_id, MAX(id) as latest_id')
            ->where('recipient_id', $recipientId)
            ->where('role', $role)
            ->groupBy('progress_update_id');

        // Main query to check if the latest notification is unread
        $unreadCount = Notification::joinSub($subquery, 'latest_notifications', function ($join) {
            $join->on('notifications.id', '=', 'latest_notifications.latest_id');
        })
            ->whereNull('notifications.read_at') // Check if the latest notification is unread
            ->count();

        return response()->json(['unread_count' => $unreadCount]);
    }

    public function getUnreadNotificationsSinceLastLogin(Request $request)
    {
        $user = $request->user(); // Get the authenticated user
        log::info("User: " . $user->id . ", Role: " . $user->role . ", Last Login At: " . $user->last_login_at);

        $query = Notification::query();

        if ($user->role === 'admin') {
            // Fetch notifications targeted to all admins
            $query->where('recipient_id', 'shared');
        } else {
            // Fetch notifications for the specific user
            $query->where('recipient_id', $user->id);
        }

        // Unread notifications only
        $query->whereNull('read_at');

        // If last_login_at exists, fetch notifications created after the last login
        if ($user->last_login_at) {
            $query->where('created_at', '>', $user->last_login_at);
        }

        $notifications = $query->get();

        log::info("Unread Notifications Retrieved:", $notifications->toArray());

        return response()->json($notifications);
    }
}
