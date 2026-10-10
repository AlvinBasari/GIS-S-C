<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Branch extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'rating' => 'float',
        'review_count' => 'integer',
        'is_open_weekend' => 'boolean',
        'is_pickup_available' => 'boolean',
        'is_active' => 'boolean',
    ];

    /**
     * @return BelongsTo<District, Branch>
     */
    public function district(): BelongsTo
    {
        return $this->belongsTo(District::class);
    }

    /**
     * @return HasMany<BranchTreatment>
     */
    public function treatments(): HasMany
    {
        return $this->hasMany(BranchTreatment::class);
    }

    /**
     * @return HasMany<BranchTreatment>
     */
    public function generalTreatments(): HasMany
    {
        return $this->hasMany(BranchTreatment::class)->where('treatment_type', 'UMUM');
    }

    /**
     * @return HasMany<BranchTreatment>
     */
    public function specialTreatments(): HasMany
    {
        return $this->hasMany(BranchTreatment::class)->where('treatment_type', 'KHUSUS');
    }

    /**
     * @param  Builder<Branch>  $query
     * @return Builder<Branch>
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }
}
