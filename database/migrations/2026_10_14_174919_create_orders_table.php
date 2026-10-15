<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_code')->unique();
            $table->foreignId('branch_id')->constrained('branches')->cascadeOnDelete();
            $table->string('customer_name');
            $table->string('customer_phone');
            $table->text('pickup_address');
            $table->decimal('pickup_lat', 10, 7)->nullable();
            $table->decimal('pickup_lng', 10, 7)->nullable();
            $table->string('service_type')->default('SAC_GO');
            $table->string('status')->default('BOOKED');
            $table->unsignedInteger('pair_count')->default(1);
            $table->string('shoe_type')->default('Sneakers Casual');
            $table->decimal('total_price', 12, 2)->default(0);
            $table->string('before_photo_url')->nullable();
            $table->string('after_photo_url')->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('pickup_time')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
