# Changelog

All notable changes to the MOI Fingerprint System will be documented in this file.

## [2026-02-13] - Dashboard Visibility Fix & Department Updates

### Fixed
- **Supervisor dashboard empty after delete functionality added**
  - Root cause: `/api/update-demo-details` endpoint was clearing `department` field for ALL users (including supervisors), not just employees
  - This broke notification query: `SELECT id FROM users WHERE role='supervisor' AND department=$1` returned 0 results
  - This broke dashboard query: `WHERE f.department=$1 AND u.department IS NULL` returned empty
  - Solution: Modified endpoint to only clear department for employee 10001, preserving supervisor/monitor/admin departments
  - Commit: 4d8dbc1

- **Query logic for supervisor dashboard**
  - Changed from checking `u.department` (user table) to `f.department` (form table)
  - Supervisors now correctly see forms WHERE form.department matches their department
  - Commit: 8447de4

### Added
- **DELETE endpoint for pending requests** (`DELETE /api/forms/:id`)
  - Employees can delete their own requests ONLY when status='pending_supervisor'
  - Once any approval is made, deletion is blocked
  - Validation checks ownership (employee_id) and status before allowing DELETE

- **Date restriction in form submission**
  - Added `max={today}` attribute to date input picker
  - Prevents users from selecting future dates
  - Location: frontend/src/components/SubmitForm.js:109

- **Debug endpoint** (`GET /api/debug-state`)
  - Inspect current users and forms in database
  - Shows employee numbers, names, departments, and recent forms
  - Useful for troubleshooting visibility issues
  - Commit: 1778c02

- **Department update endpoint** (`GET /api/update-departments`)
  - Restores supervisor/monitor/admin department values
  - Sets 20001/30001 → "هندسة الاستوديوهات الإذاعية"
  - Sets 40001 → "قسم الشؤون الإدارية"
  - Commit: 7ae0879

### Changed
- **Demo account data updates**
  - Employee 10001: Civil ID changed to 296102200447
  - Supervisor/Monitor 20001/30001: Name updated to "مشعل سالم سعود الزمانان"
  - Supervisor/Monitor department: Changed from "قسم الموارد البشرية" to "هندسة الاستوديوهات الإذاعية"
  - Admin 40001 department: Changed to "قسم الشؤون الإدارية"
  - Employee department fields: No longer pre-filled, must be entered manually
  - Commit: 15356e5

### Testing
To test the complete workflow after these changes:
1. Employee (10001) submits form with department: "هندسة الاستوديوهات الإذاعية"
2. Supervisor (20001) sees request in dashboard
3. Supervisor approves → monitor auto-skipped (same person) → status='pending_admin'
4. Admin (40001) approves → status='approved'
5. Employee prints PDF with all signatures

---

## [2026-02-09] - Initial System Deployment

### Added
- Complete fingerprint forgetfulness form system for Kuwait Ministry of Information
- 3-step approval workflow: Supervisor → Monitor → Admin
- Auto-skip logic when supervisor and monitor are the same person
- Digital signature capture using signature_pad library
- PDF generation matching official paper form layout
- Email and in-app notifications
- Department-based access control
- JWT authentication with bcrypt password hashing
- Arabic RTL interface
- Demo accounts pre-seeded
- Kuwait emblem in PDF header
- Deployed to Netlify (frontend) and Render (backend + PostgreSQL)

### Known Issues
- Email notifications require EMAIL_USER and EMAIL_PASS environment variables (optional)
- Monitor step only skips if supervisor user has monitor role
