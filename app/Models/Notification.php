<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;
    public $timestamps = true;

    protected $fillable = [
        'user_id',
        'recipient_id',
        'role',
        'message',
        'status',
        'reason',
        'read_at',
        'updated_at',
        'progress_update_id',
        'type',
    ];

    public function progressUpdate()
    {
        return $this->belongsTo(ProgressUpdate::class, 'progress_update_id');
    }
}
