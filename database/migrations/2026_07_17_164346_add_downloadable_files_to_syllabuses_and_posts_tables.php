<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('syllabuses', function (Blueprint $table) {
            $table->string('file_original_name')->nullable()->after('file_path');
        });

        Schema::table('posts', function (Blueprint $table) {
            $table->string('attachment_path')->nullable()->after('cover_image_path');
            $table->string('attachment_original_name')->nullable()->after('attachment_path');
        });
    }

    public function down(): void
    {
        Schema::table('syllabuses', function (Blueprint $table) {
            $table->dropColumn('file_original_name');
        });

        Schema::table('posts', function (Blueprint $table) {
            $table->dropColumn(['attachment_path', 'attachment_original_name']);
        });
    }
};
