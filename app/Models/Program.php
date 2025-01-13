<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Program extends Model
{
    use HasFactory;
    protected $fillable = ['name'];
    public $timestamps = true;

    public function intakes()
    {
        return $this->hasMany(Intake::class);
    }

    public function students()
    {
        return $this->hasMany(Student::class);
    }
}
