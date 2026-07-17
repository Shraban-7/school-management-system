# Project Context — SMS App (School Management System, Bangladesh)

This file exists so any future session (human or AI) can pick this project up
without re-discovering the stack, conventions, and domain decisions from
scratch. Read this before `FEATURES.md` and `SETUP.md`.

## What this is

A single-school management system for a Bangladeshi school, built with:

- **Backend:** Laravel (PHP 8.3+ syntax — uses `#[Guarded]`/`#[Hidden]`
  attributes and native enums, so Laravel 11+)
- **Frontend:** Inertia.js + Vue 3 (`resources/js/pages`, lowercase `pages`
  dir, not `Pages`)
- **DB:** MySQL (per project owner; `database.sqlite` in the repo is a local
  dev leftover, not the deployment target)
- **Auth:** Custom `AuthController`, **phone-number based** (not email) —
  this matches how Bangladeshi schools actually operate; email is optional
  on the `users` table.
- **Routing helpers:** `resources/js/routes` and `resources/js/wayfinder`
  exist, suggesting [Laravel Wayfinder](https://github.com/laravel/wayfinder)
  is in use for typed route helpers on the frontend — check `composer.json`
  (not included in this upload) to confirm before assuming Ziggy instead.

## Domain model as of this session

| Model | Purpose | Notable BD-specific fields |
|---|---|---|
| `Institution` | The single school (site settings / public profile) | `eiin_number`, board, MPO, address/phone/email, about, headmaster speech, admission_info, logo |
| `Post` | Public notices, blog posts, co-curricular activities | `PostType` enum; slug; published flag |
| `Syllabus` | Class syllabus PDFs for the public site | linked to class + optional session |
| `AcademicSession` | School year | — |
| `ClassesAndSection` | e.g. Class 9, Section A | `version` (Bangla/English medium), `group_stream` (Science/Commerce/Arts for 9-12) |
| `Student` | Enrolled student | `name_en`/`name_bn`, `birth_certificate_number`, `father_nid`/`mother_nid`, `religion`, `blood_group`, `guardian_*` fields |
| `Teacher` | Staff who teach | linked to `User` optionally |
| `Subject` | Subject taught | `full_marks`, `pass_marks` |
| `Exam` | An exam/term | `is_published` |
| `Mark` | A student's marks in one subject/exam | `written_marks`, `mcq_marks`, `practical_marks`, `total_marks`, `grade_point`, `grade_letter`, `is_absent` — this is already shaped for **SSC/HSC-style GPA grading**, it just has no calculation/report-generation logic wired up yet |
| `AttendanceRecord` | Daily attendance | — |
| `User` | Login account | `role` enum, `phone` (unique, login identifier), `is_active` |

### Roles (`app/Enums/UserRole.php`)

`admin`, `headmaster`, `teacher`, `student`, `staff`, and **`parent`** (added
this session — see below).

## Changes made in this session (2026-07-17)

1. **Root route (`/`) is the public school homepage.** Guests and
   authenticated users both see the public site. Login remains at `/login`;
   dashboards are reached from the public navbar or after login.
2. **`parent` role added** — was missing even though guardians are one of
   the four core user types for this school. Added:
   - `UserRole::PARENT` case
   - `student_guardians` pivot migration (`user_id` ↔ `student_id`, with
     `relation` and `is_primary_contact` columns) — a parent can be linked
     to more than one child; a student can have more than one guardian
     account (father + mother, for example)
   - `User::children()` / `Student::guardians()` relationships
   - `/parent/dashboard` route + `role:parent` middleware group
   - `DashboardController::parentData()` — shows linked children, attendance
     avg, latest published exam GPA; fees still stubbed pending step 3
   - `GuardianSeeder` — creates a parent login for each seeded student using
     the existing `guardian_phone`/`father_phone` data, password `password`
3. **Bug fixed: invalid `->nullable()` on Eloquent relationships.**
   `Student::class()`, `Student::user()`, `Student::academicSession()`,
   `Teacher::user()`, and `AttendanceRecord::takenBy()` each ended their
   `belongsTo(...)` chain with `->nullable()`, which is **not** a valid
   relationship method. Eloquent surfaces the resulting `BadMethodCallException`
   as `RelationNotFoundException: Call to undefined relationship [class]`
   whenever the relation is eager-loaded. This 500'd the parent dashboard
   (`with(['class', 'institution'])`) and would have 500'd the exam marks
   page too (`with('class:...')`). Fix: removed `->nullable()` — a
   `belongsTo` on a nullable FK already returns `null` when unmatched, so no
   replacement method is needed. Regression coverage added in
   `tests/Feature/RoleRedirectTest.php`.
4. **Result / gradesheet generation completed.**
   - `app/Helpers/GradeScale.php` — BD scale with per-subject `pass_marks` check
   - `app/Services/ResultService.php` — per-student report, tabulation, merit ranking
   - `ResultController` — admin tabulation/merit/PDF; student + parent read-only views
   - Vue pages under `Admin/Results/`, `Student/Results/`, `Parent/Results/`
   - Shared `ReportCard.vue` component + `resources/views/pdf/gradesheet.blade.php`
   - PDF via `barryvdh/laravel-dompdf`
   - Parent dashboard wired: attendance avg + latest published exam GPA per child
   - Parent/student sidebars now include a Results link
5. **Bugs fixed while building results:**
   - `ExamController::updateMarks` / `AttendanceController::store` used
     `updateOrCreate`/`firstOrNew` on `#[Guarded(['*'])]` models — replaced
     with find-or-new + `forceFill()->save()`
   - Marks entry Vue page posted `{ records }` with wrong field names; fixed
     to `{ marks }` with `written_marks`/`mcq_marks`/`practical_marks`
   - Marks load key mismatch (`student_subject` vs `student-subject`) and
     prop shape (`written` vs `written_marks`) fixed in `ExamController::marks`
   - Model casts `'decimal'` → `'decimal:1'` / `'decimal:2'` (Laravel 13 requirement)
   - `MarkSeeder` now grades against each subject's `full_marks`/`pass_marks`
6. **Tests added:** `tests/Feature/RoleRedirectTest.php` (14 cases),
   `tests/Feature/ResultTest.php` (21 cases), `tests/Feature/FeeTest.php`
   (2 cases) — **39 tests total, all passing**.
7. **Fee / payment management completed** (owner confirmed: manual ledger
   only; bKash and Nagad accepted offline with reference numbers, no gateway
   integration). Added:
   - `fee_structures`, `fee_invoices`, `fee_payments` tables
   - `FeeType`, `PaymentMethod`, `InvoiceStatus` enums
   - `FeeService` — invoice generation, payment recording, defaulters, reports
   - Admin `/admin/fees/structures`, `/admin/fees/invoices`
   - Parent `/parent/fees`, `/parent/children/{student}/fees`
   - Parent dashboard "Fees due" stat wired to real data
   - `FeeSeeder` for demo data
8. **Bug fixed: `TeacherController` called nonexistent
   `DashboardController::getSidebar()`** (crashed `/admin/teachers` pages).
   Replaced with the standard `app(DashboardController::class)->adminSidebar()`
   pattern. Also fixed `StudentController` show/edit eager-loading a
   nonexistent `session` relation (correct name: `academicSession`).
9. **Unified sidebar + "not authorized" modal (owner request).**
   - Every role now sees the **full menu** (`DashboardController::fullSidebar()`);
     nothing is hidden based on role. Student/parent roles get their own
     extra groups (My results / Children) on top.
   - Any 403 for an authenticated web user (role middleware or controller
     `abort(403)`) is converted in `bootstrap/app.php` into a redirect to the
     user's own dashboard with a `flash.error`, which `DashboardLayout.vue`
     displays as a "Not authorized" popup modal instead of Laravel's 403 page.
   - Bug fixed along the way: `HandleInertiaRequests` read
     `session('message')` but controllers flash `flash.message`, so success
     flashes never reached the frontend. Now reads `flash.message` and the
     new `flash.error`.
10. **Single-school mode + public school website.**
    - Institutions CRUD removed; one school row edited at
      `/admin/settings/school` (`SchoolProfileController`).
    - `Institution::current()` helper (cached) injects `institution_id` on
      create/update — admin forms no longer show an institution picker.
    - Public site (`SiteController` + `PublicLayout.vue`): Home, About,
      Headmaster speech, Admission, Syllabus, Notices, Blog, Activities,
      Teachers, Staff, Contact.
    - CMS: `posts` (`notice`/`blog`/`activity`) + `syllabuses` with admin
      CRUD under the Website sidebar group.
    - Dashboard notice stats wired to published notice count.
    - Seeders reduced to one school; `WebsiteContentSeeder` adds demo posts.

## Conventions to follow when extending this project

- **Bilingual fields:** anywhere a name is stored, store both `_en` and
  `_bn` variants (see `Student.name_en`/`name_bn`, `Institution.name_en`/
  `name_bn`). Follow this pattern for any new person/entity name field.
- **Phone, not email, is the identity field.** `email` is nullable
  everywhere. Don't build features assuming email is present.
- **Route naming:** `{role}.{resource}.{action}`, e.g.
  `admin.students.index`. Admin resource routes explicitly list all route
  names via `->names([...])` rather than relying on Laravel's defaults —
  keep doing this for consistency even though it's more verbose.
- **Guarded, not fillable:** models use `#[Guarded(['*'])]` and rely on
  Form Request validation classes for mass-assignment safety, not
  `$fillable`. Follow this pattern in new models.
- **Role middleware:** `role:xyz` middleware (`EnsureUserHasRole`) checks
  `UserRole::from($role)` — if you add a new role string anywhere in a
  route, it must exist in the `UserRole` enum or it will throw, not
  silently 403.

## Open questions to confirm with the project owner before building further

- Multi-institution: **resolved (2026-07-17)** — single-school deployment.
  `institution_id` FKs remain for schema stability; UI treats one school only.
- Bangla UI: is a `bn` locale toggle actually required for this school's
  users, or is English-only UI with Bangla *data* (names, addresses)
  sufficient? This changes the size of the i18n work substantially.
- Fee collection: **confirmed with owner (2026-07-17)** — manual/cash ledger
  only. bKash and Nagad are accepted payment methods but recorded offline by
  admin with a transaction reference number; no live gateway integration.
- Grading rules: confirm the BD scale in `GradeScale` matches this school's
  board exactly. The optional/4th-subject grace-point adjustment used by
  some public boards is **not** implemented — add only if the owner confirms.
