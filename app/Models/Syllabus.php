<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

#[Guarded(['*'])]
class Syllabus extends Model
{
    protected $table = 'syllabuses';

    public function class(): BelongsTo
    {
        return $this->belongsTo(ClassesAndSection::class, 'class_id');
    }

    public function academicSession(): BelongsTo
    {
        return $this->belongsTo(AcademicSession::class);
    }

    public function fileUrl(): ?string
    {
        return $this->file_path ? asset('storage/'.$this->file_path) : null;
    }

    public function downloadUrl(): ?string
    {
        return $this->file_path
            ? route('syllabus.download', $this)
            : null;
    }

    public function downloadFilename(): string
    {
        if (filled($this->file_original_name)) {
            return $this->file_original_name;
        }

        return Str::slug($this->title ?: 'syllabus').'.pdf';
    }

    /**
     * @return array<string, mixed>
     */
    public function toPublicArray(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'file_url' => $this->fileUrl(),
            'download_url' => $this->downloadUrl(),
            'file_name' => $this->file_path ? $this->downloadFilename() : null,
            'class_label' => $this->class
                ? trim($this->class->class_level.' '.$this->class->section_name)
                : null,
            'session_name' => $this->academicSession?->session_name,
        ];
    }
}
