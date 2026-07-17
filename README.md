# School Management System (SMS)

A **single-school management system** for Bangladeshi schools (Bangla / English medium, up to SSC), with a public school website and an admin portal.

Built with Laravel, Inertia.js, and Vue 3.

## Features

- **Public school website** — home, about, admission, fees, facilities, syllabus downloads, notices (with attachments), teachers, staff, activities, blog, contact
- **School profile CMS** — EIIN, logo, bilingual content, headmaster speech, nav/CTAs/sections editable from admin
- **Academic management** — sessions, classes & sections, subjects, teachers, students (BD fields: NID, birth certificate, religion, blood group, bilingual names)
- **Exams & results** — marks (written / MCQ / practical), BD grade scale, tabulation, merit list, PDF gradesheets
- **Fees** — structures (admission, monthly tuition, session, exam), invoices, manual payments (cash, bKash, Nagad, Rocket, bank)
- **Attendance** — daily marking
- **Roles** — admin, headmaster, teacher, student, staff, parent/guardian
- **Auth** — phone-number login (email optional)
- **Bilingual UI** — English / বাংলা locale switcher

See [FEATURES.md](FEATURES.md) for the full checklist and roadmap.

## Stack

| Layer | Technology |
|---|---|
| Backend | PHP 8.3+, Laravel 13 |
| Frontend | Inertia.js v3, Vue 3, Tailwind CSS v4 |
| Icons / editor | Lucide, TipTap rich text |
| Database | MySQL (SQLite OK for local demo) |
| PDF | barryvdh/laravel-dompdf |
| Tests | Pest 4 |

## Requirements

- PHP 8.3+
- Composer
- Node.js 20+ / npm
- MySQL 8+ (or SQLite for quick local setup)

## Quick start

```bash
git clone https://github.com/Shraban-7/school-management-system.git
cd school-management-system

composer install
cp .env.example .env
php artisan key:generate

# Optional: switch to MySQL in .env (DB_CONNECTION=mysql, etc.)
# Default .env.example uses SQLite.

php artisan migrate --seed
php artisan storage:link

npm install
npm run build   # or: npm run dev

php artisan serve
```

Then open `http://127.0.0.1:8000`.

- Public site: `/`
- Login: `/login`

## Demo logins (after seeding)

Password for all seeded users: `password`

| Role | Phone | Email |
|---|---|---|
| Admin | `+8801100000000` | `admin@example.com` |
| Headmaster | `+8801100000001` | `headmaster@example.com` |
| Teacher | `+8801100000002` | `teacher@example.com` |
| Student | `+8801100000003` | `student@example.com` |
| Staff | `+8801100000004` | `staff@example.com` |
| Parent | `+8801100000005` | `parent@example.com` |

Login uses **phone number**. Parent accounts linked to students are also created by `GuardianSeeder` from student guardian phones.

## Useful commands

```bash
# Frontend (Vite HMR)
npm run dev

# Tests
php artisan test

# Code style
vendor/bin/pint

# Rebuild frontend for production
npm run build
```

## Project docs

| File | Purpose |
|---|---|
| [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) | Stack, domain model, conventions |
| [FEATURES.md](FEATURES.md) | Feature status and backlog |

## License

MIT
