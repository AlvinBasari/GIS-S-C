<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class District extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected $casts = [
        'center_lat' => 'float',
        'center_lng' => 'float',
    ];

    /**
     * @return HasMany<Branch>
     */
    public function branches(): HasMany
    {
        return $this->hasMany(Branch::class);
    }
}
