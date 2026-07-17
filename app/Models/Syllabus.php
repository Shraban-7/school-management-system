<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
            'class_label' => $this->class
                ? trim($this->class->class_level.' '.$this->class->section_name)
                : null,
            'session_name' => $this->academicSession?->session_name,
        ];
    }
}
