<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MasterTreatment extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected $casts = [
        'default_price' => 'float',
        'is_popular' => 'boolean',
        'is_active' => 'boolean',
    ];

    /**
     * @return HasMany<BranchTreatment>
     */
    public function branchTreatments(): HasMany
    {
        return $this->hasMany(BranchTreatment::class);
    }
}
