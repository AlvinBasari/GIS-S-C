<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BranchTreatment extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected $casts = [
        'price' => 'float',
        'is_available' => 'boolean',
        'is_featured' => 'boolean',
    ];

    /**
     * @return BelongsTo<Branch, BranchTreatment>
     */
    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    /**
     * @return BelongsTo<MasterTreatment, BranchTreatment>
     */
    public function masterTreatment(): BelongsTo
    {
        return $this->belongsTo(MasterTreatment::class);
    }
}
