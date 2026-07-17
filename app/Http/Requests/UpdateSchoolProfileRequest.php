<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSchoolProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name_en' => ['required', 'string', 'max:255'],
            'name_bn' => ['required', 'string', 'max:255'],
            'eiin_number' => ['required', 'integer'],
            'board_affiliation' => ['required', 'string', 'max:50'],
            'mpo_status' => ['boolean'],
            'address' => ['nullable', 'string'],
            'phone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:255'],
            'website' => ['nullable', 'url', 'max:255'],
            'established_year' => ['nullable', 'integer', 'min:1800', 'max:2100'],
            'about_en' => ['nullable', 'string'],
            'about_bn' => ['nullable', 'string'],
            'headmaster_name_en' => ['nullable', 'string', 'max:255'],
            'headmaster_name_bn' => ['nullable', 'string', 'max:255'],
            'headmaster_speech' => ['nullable', 'string'],
            'admission_info' => ['nullable', 'string'],
            'admission_guidelines' => ['nullable', 'string'],
            'lab_facilities' => ['nullable', 'string'],
            'school_facilities' => ['nullable', 'string'],
            'fee_notes' => ['nullable', 'string'],
            'office_hours' => ['nullable', 'string'],
            'contact_intro' => ['nullable', 'string'],
            'footer_tagline' => ['nullable', 'string', 'max:255'],
            'hero_tagline' => ['nullable', 'string', 'max:255'],
            'logo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'headmaster_photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'remove_logo' => ['boolean'],
            'remove_headmaster_photo' => ['boolean'],
            'nav_menu' => ['nullable', 'array'],
            'nav_menu.*.label' => ['required_with:nav_menu', 'string', 'max:100'],
            'nav_menu.*.href' => ['required_with:nav_menu', 'string', 'max:255'],
            'nav_menu.*.enabled' => ['boolean'],
            'home_ctas' => ['nullable', 'array'],
            'home_ctas.*.label' => ['required_with:home_ctas', 'string', 'max:100'],
            'home_ctas.*.href' => ['required_with:home_ctas', 'string', 'max:255'],
            'home_sections' => ['nullable', 'array'],
            'home_sections.stats' => ['boolean'],
            'home_sections.speech' => ['boolean'],
            'home_sections.notices' => ['boolean'],
            'home_sections.activities' => ['boolean'],
            'home_sections.blog' => ['boolean'],
            'facility_items' => ['nullable', 'array'],
            'facility_items.*.title' => ['required_with:facility_items', 'string', 'max:255'],
            'facility_items.*.body' => ['nullable', 'string'],
            'facility_items.*.category' => ['nullable', 'string', 'in:lab,school'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('nav_menu') && is_array($this->input('nav_menu'))) {
            $this->merge([
                'nav_menu' => collect($this->input('nav_menu'))
                    ->map(fn ($item) => [
                        'label' => $item['label'] ?? '',
                        'href' => $item['href'] ?? '',
                        'enabled' => filter_var($item['enabled'] ?? true, FILTER_VALIDATE_BOOLEAN),
                    ])
                    ->all(),
            ]);
        }

        if ($this->has('home_sections') && is_array($this->input('home_sections'))) {
            $sections = $this->input('home_sections');
            $this->merge([
                'home_sections' => [
                    'stats' => filter_var($sections['stats'] ?? false, FILTER_VALIDATE_BOOLEAN),
                    'speech' => filter_var($sections['speech'] ?? false, FILTER_VALIDATE_BOOLEAN),
                    'notices' => filter_var($sections['notices'] ?? false, FILTER_VALIDATE_BOOLEAN),
                    'activities' => filter_var($sections['activities'] ?? false, FILTER_VALIDATE_BOOLEAN),
                    'blog' => filter_var($sections['blog'] ?? false, FILTER_VALIDATE_BOOLEAN),
                ],
            ]);
        }
    }
}
