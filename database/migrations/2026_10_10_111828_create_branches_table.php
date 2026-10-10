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
        Schema::create('branches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('district_id')->constrained('districts')->cascadeOnDelete();
            $table->string('brand_name');
            $table->string('branch_name');
            $table->string('slug')->unique();
            $table->text('full_address');
            $table->string('benchmark_notes')->nullable();
            $table->string('kelurahan');
            $table->string('postal_code')->nullable();
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->string('phone_number')->nullable();
            $table->string('whatsapp_number');
            $table->string('instagram_handle')->nullable();
            $table->text('gmaps_url')->nullable();
            $table->decimal('rating', 3, 1)->default(4.8);
            $table->unsignedInteger('review_count')->default(42);
            $table->string('open_hour')->default('09:00');
            $table->string('close_hour')->default('21:00');
            $table->boolean('is_open_weekend')->default(true);
            $table->boolean('is_pickup_available')->default(true);
            $table->string('pickup_coverage')->nullable();
            $table->text('image_url')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('branches');
    }
};
