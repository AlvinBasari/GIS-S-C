<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    public const STATUS_PENDING_CONFIRMATION = 'PENDING_CONFIRMATION';

    public const STATUS_OUT_FOR_PICKUP = 'OUT_FOR_PICKUP';

    public const STATUS_PICKED_UP = 'PICKED_UP';

    public const STATUS_INTAKE_VERIFIED = 'INTAKE_VERIFIED';

    public const STATUS_IN_PROGRESS = 'IN_PROGRESS';

    public const STATUS_READY_FOR_DELIVERY = 'READY_FOR_DELIVERY';

    public const STATUS_READY_FOR_PICKUP = 'READY_FOR_PICKUP';

    public const STATUS_COMPLETED = 'COMPLETED';

    public const STATUS_CANCELLED = 'CANCELLED';

    // Legacy statuses alias support
    public const STATUS_BOOKED = 'BOOKED';

    public const STATUS_READY = 'READY';

    protected $guarded = ['id'];

    protected $casts = [
        'pickup_lat' => 'float',
        'pickup_lng' => 'float',
        'pair_count' => 'integer',
        'total_price' => 'float',
        'pickup_time' => 'datetime',
        'completed_at' => 'datetime',
        'warranty_until' => 'datetime',
    ];

    /**
     * @return BelongsTo<Branch, Order>
     */
    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    /**
     * @return HasMany<OrderItem>
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Check if 3-day guarantee/warranty is still active.
     */
    public function isWarrantyActive(): bool
    {
        return $this->status === self::STATUS_COMPLETED
            && $this->warranty_until !== null
            && $this->warranty_until->isFuture();
    }
}
