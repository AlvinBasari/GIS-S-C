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
        Schema::create('master_treatments', function (Blueprint $table) {
            $table->id();
            $table->string('category');
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description');
            $table->decimal('default_price', 12, 2);
            $table->string('est_duration');
            $table->string('icon')->default('Sparkles');
            $table->boolean('is_popular')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('master_treatments');
    }
};
