<?php

namespace App\Http\Controllers;

use App\Models\ClassesAndSection;
use App\Models\CommunicationLog;
use App\Models\CommunicationSetting;
use App\Models\CommunicationTemplate;
use App\Models\Institution;
use App\Services\CommunicationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Str;

class CommunicationController extends Controller
{
    public function __construct(
        protected CommunicationService $commService
    ) {}

    /**
     * Display the SMS & Email Broadcast & Management Hub.
     */
    public function index(Request $request): Response
    {
        CommunicationTemplate::ensureDefaults();

        $institution = Institution::current();
        $templates = CommunicationTemplate::query()
            ->orderByDesc('is_system')
            ->orderBy('title')
            ->get();

        $classes = ClassesAndSection::query()
            ->orderBy('class_level')
            ->orderBy('section_name')
            ->get(['id', 'class_level', 'section_name', 'version']);

        $logs = CommunicationLog::query()
            ->with('sender:id,name,role')
            ->orderByDesc('id')
            ->limit(30)
            ->get();

        $settings = CommunicationSetting::current();

        $stats = [
            'total_sms' => CommunicationLog::query()->where('channel', 'sms')->where('status', 'sent')->count(),
            'total_email' => CommunicationLog::query()->where('channel', 'email')->where('status', 'sent')->count(),
            'today_total' => CommunicationLog::query()->whereDate('created_at', now()->toDateString())->count(),
            'sms_enabled' => (bool) $settings->sms_enabled,
            'email_enabled' => (bool) $settings->email_enabled,
        ];

        return Inertia::render('Admin/Communication/Index', [
            'sidebar' => app(DashboardController::class)->adminSidebar(),
            'school' => $institution->toPublicArray(),
            'templates' => $templates,
            'classes' => $classes,
            'logs' => $logs,
            'settings' => $settings,
            'stats' => $stats,
            'preselectedAudience' => $request->query('audience', 'all_guardians'),
            'preselectedClassId' => $request->query('class_id') ? (int) $request->query('class_id') : null,
            'preselectedDate' => $request->query('date', now()->toDateString()),
        ]);
    }

    /**
     * Dispatch an SMS and/or Custom Email broadcast.
     */
    public function send(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'channel' => ['required', 'string', 'in:sms,email,both'],
            'audience' => ['required', 'string', 'in:all_guardians,class,absent_today,teachers,custom'],
            'class_id' => ['nullable', 'integer', 'exists:classes_and_sections,id'],
            'date' => ['nullable', 'date'],
            'custom_recipient' => ['required_if:audience,custom', 'nullable', 'string', 'max:255'],
            'subject' => ['nullable', 'string', 'max:255'],
            'message' => ['required', 'string'],
            'amount' => ['nullable', 'string', 'max:50'],
        ]);

        if (in_array($validated['channel'], ['email', 'both'], true) && empty($validated['subject'])) {
            $validated['subject'] = 'Notification from '.Institution::current()->name_en;
        }

        $result = $this->commService->broadcast($validated, $request->user());

        $msg = sprintf(
            'Broadcast sent successfully! Delivered to %d recipient(s) (%d SMS, %d Emails).',
            $result['total_recipients'],
            $result['sent_sms'],
            $result['sent_email']
        );

        if ($result['failed'] > 0) {
            $msg .= ' Warning: '.$result['failed'].' transmission(s) encountered delivery errors.';
        }

        return back()->with('flash.message', $msg);
    }

    /**
     * Save a new custom template.
     */
    public function storeTemplate(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:100'],
            'type' => ['required', 'string', 'in:sms,email,both'],
            'subject' => ['nullable', 'string', 'max:255'],
            'body' => ['required', 'string'],
        ]);

        $slug = Str::slug($validated['title']).'-'.Str::random(5);

        CommunicationTemplate::forceCreate([
            'institution_id' => Institution::current()->id,
            'title' => $validated['title'],
            'slug' => $slug,
            'type' => $validated['type'],
            'subject' => $validated['subject'],
            'body' => $validated['body'],
            'is_system' => false,
            'is_active' => true,
        ]);

        return back()->with('flash.message', 'Communication template created successfully.');
    }

    /**
     * Update an existing communication template.
     */
    public function updateTemplate(Request $request, CommunicationTemplate $template): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:100'],
            'type' => ['required', 'string', 'in:sms,email,both'],
            'subject' => ['nullable', 'string', 'max:255'],
            'body' => ['required', 'string'],
            'is_active' => ['boolean'],
        ]);

        $template->forceFill($validated)->save();

        return back()->with('flash.message', 'Template updated successfully.');
    }

    /**
     * Delete a non-system template.
     */
    public function destroyTemplate(CommunicationTemplate $template): RedirectResponse
    {
        abort_if($template->is_system, 403, 'System templates cannot be deleted.');

        $template->delete();

        return back()->with('flash.message', 'Template deleted successfully.');
    }

    /**
     * Update SMS and Email gateway configuration.
     */
    public function updateSettings(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'sms_provider' => ['required', 'string', 'max:50'],
            'sms_api_key' => ['nullable', 'string'],
            'sms_sender_id' => ['nullable', 'string', 'max:50'],
            'sms_api_url' => ['nullable', 'string', 'max:255'],
            'sms_enabled' => ['boolean'],
            'mail_mailer' => ['required', 'string', 'max:30'],
            'mail_host' => ['nullable', 'string', 'max:255'],
            'mail_port' => ['required', 'integer', 'min:1', 'max:65535'],
            'mail_username' => ['nullable', 'string', 'max:255'],
            'mail_password' => ['nullable', 'string'],
            'mail_encryption' => ['nullable', 'string', 'max:20'],
            'mail_from_address' => ['nullable', 'email', 'max:255'],
            'mail_from_name' => ['nullable', 'string', 'max:255'],
            'email_enabled' => ['boolean'],
        ]);

        $validated['sms_enabled'] = $request->boolean('sms_enabled');
        $validated['email_enabled'] = $request->boolean('email_enabled');

        $settings = CommunicationSetting::current();
        $settings->forceFill($validated)->save();

        return back()->with('flash.message', 'SMS & Email gateway configuration saved successfully.');
    }
}
