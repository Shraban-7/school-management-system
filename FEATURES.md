# Feature Checklist — Bangladesh School Management System

Gap analysis against what a typical Bangladeshi school (English/Bangla
medium, up to SSC/HSC) needs, based on the codebase as of 2026-07-17.
Status legend: ✅ built · 🟡 partially built · ❌ not started.

## Core / already solid

| Feature | Status | Notes |
|---|---|---|
| School profile (EIIN, board, MPO, contact, about, headmaster speech) | ✅ | Single-school mode — edit at `/admin/settings/school` |
| Public school website | ✅ | Fully dynamic: school profile + nav/CTAs/sections/facility cards editable in admin; fees from Fee structures; notices/blog/activities/syllabus/teachers/staff from DB |
| Academic sessions/years | ✅ | |
| Classes & sections, medium (Bangla/English), group/stream | ✅ | |
| Student admission with BD-specific fields | ✅ | NID, birth cert no., religion, blood group, bilingual name |
| Teacher records | ✅ | Public Teachers vs Staff split by designation |
| Subjects with full/pass marks | ✅ | |
| Exams | ✅ | |
| Marks entry (written/MCQ/practical, grade point, grade letter) | ✅ | Auto-calculated on save using each subject's `full_marks`/`pass_marks`; see `GradeScale` + `ResultService` |
| Attendance (daily) | ✅ | Marking exists; no analytics/reports yet |
| Role-based access (admin/headmaster/teacher/student/staff) | ✅ | |
| Phone-based auth with rate limiting | ✅ | |
| Root route → public homepage | ✅ | `/` is the school website; login at `/login` |
| **Parent/guardian role & login** | ✅ | |
| **Result / gradesheet generation** | ✅ | Tabulation, merit list, PDF, student/parent views |
| **Fee / payment management** | ✅ | Manual ledger; bKash/Nagad/Rocket/bank ref tracking (no gateway) |
| **Website CMS (notices, blog, activities, syllabus)** | ✅ | Admin CRUD; syllabus PDF force-download; notice PDF/Word attachments |

## Missing — recommended priority order

### High priority (core to daily school operation)

1. **Class routine / timetable** ❌
   - Weekly routine per class/section, per subject, per teacher
   - **Note the BD weekend is Friday–Saturday**, not Saturday–Sunday — any
     day-of-week logic (routine, attendance defaults, "school days this
     month" calculations) must account for this, not assume a Western week

### Medium priority

5. **SMS notifications** ❌
   - Very standard in BD schools — parents expect SMS on absence, fee due,
     exam results. Would need a local SMS gateway (e.g. a BD SMS API
     provider) — flag this as a paid third-party integration decision for
     the owner, not something to build blind.

6. **Homework / assignment tracking** ❌
   - Teacher posts homework per class/subject; students/parents view it

7. **Leave application** ❌
   - Student and teacher leave requests with approval workflow

8. **ID card generation** ❌
   - Printable student/teacher ID cards, typically a simple PDF template
     pulling from existing `Student`/`Teacher`/`Institution` data — low
     effort once print skill/template is in place

### Lower priority / confirm scope before building

9. **Library management** ❌ — confirm the school actually needs this
   before investing in it; not every institution tracks this digitally.
10. **Transport management** ❌ — same; only relevant if the school runs
    its own buses/vans.
11. **Bangla (bn) UI locale toggle** ✅
   - EN / বাং switcher on public + dashboard navbars
   - Session locale; public chrome, login, profile, sidebar translated
   - Bilingual school fields (`name_en`/`name_bn`, about, etc.) follow locale

## Suggested next step

Recommended order: **Class routine / timetable** (BD Fri–Sat weekend) →
then confirm scope for SMS / homework / leave / ID cards with the owner.

