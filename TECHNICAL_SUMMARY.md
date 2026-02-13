# MOI Fingerprint System - Technical Summary

**Last Updated:** February 13, 2026 | **Status:** ✅ Fully Functional Demo

---

## 🚀 Quick Start

**URLs:**
- Frontend: https://lambent-kheer-854b54.netlify.app
- Backend: https://moi-fingerprint-backend.onrender.com
- GitHub: https://github.com/Nedo960/moi-fingerprint-system

**Test Credentials:**
| ID | Password | Role | Name | Department |
|----|----------|------|------|------------|
| 10001 | demo123 | Employee | محمد بدر صقر الرشيدي | (blank - enter manually) |
| 20001 | demo123 | Supervisor | مشعل سالم سعود الزمانان | هندسة الاستوديوهات الإذاعية |
| 40001 | demo123 | Admin | حمد بن حيدر | قسم الشؤون الإدارية |

**Workflow:** Employee submits → Supervisor approves → Monitor auto-skips (same person) → Admin approves → PDF prints

**⚠️ Dashboard Empty?** Employee must enter dept: `هندسة الاستوديوهات الإذاعية`. Debug: `/api/debug-state`

---

## 📁 Project Structure

```
MOI/
├── backend/                    # Node.js + Express API
│   ├── public/
│   │   └── kuwait_emblem.png  # Official Kuwait emblem
│   ├── routes/
│   │   ├── auth.js            # Login endpoint
│   │   ├── forms.js           # Form CRUD + approval logic
│   │   ├── notifications.js   # Notification system
│   │   └── pdf.js             # PDF generation
│   ├── middleware/
│   │   └── auth.js            # JWT verification
│   ├── db.js                  # PostgreSQL pool
│   ├── mailer.js              # Nodemailer config
│   ├── schema.sql             # Database schema
│   ├── seed.js                # Demo account seeder
│   ├── index.js               # Main server file
│   └── package.json
│
├── frontend/                   # React 18 app
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.js              # Login page
│   │   │   ├── Navbar.js             # Top navigation
│   │   │   ├── Dashboard.js          # Main dashboard
│   │   │   ├── SubmitForm.js         # Employee form submission
│   │   │   ├── FormsList.js          # Forms table
│   │   │   ├── ApprovalModal.js      # Signature + approval modal
│   │   │   ├── SignaturePad.js       # Digital signature component
│   │   │   └── Notifications.js      # Notification sidebar
│   │   ├── api.js                    # Axios instance
│   │   ├── AuthContext.js            # Auth state management
│   │   ├── index.css                 # RTL Arabic styles
│   │   └── App.js
│   └── package.json
│
├── README.md                   # User documentation
├── DEPLOYMENT_GUIDE.md         # Arabic deployment steps
├── ADD_EMBLEM.md              # Emblem setup (obsolete)
└── TECHNICAL_SUMMARY.md       # This file
```

---

## 🗄️ Database Schema

### `users` Table
```sql
id SERIAL PRIMARY KEY
employee_number VARCHAR(20) UNIQUE  -- Login username
password_hash VARCHAR(255)          -- Bcrypt hashed
full_name VARCHAR(100)              -- Arabic name
civil_number VARCHAR(20)            -- Kuwait Civil ID
sector VARCHAR(100)
directorate VARCHAR(100)
department VARCHAR(100)
role VARCHAR(20)                    -- employee/supervisor/monitor/admin
email VARCHAR(150)
created_at TIMESTAMP
```

### `forms` Table
```sql
id SERIAL PRIMARY KEY
uuid VARCHAR(36) UNIQUE
employee_id INTEGER → users(id)
sector, directorate, department VARCHAR(100)
day_name VARCHAR(20)                -- e.g., "الأحد"
date DATE
fingerprint_presence BOOLEAN        -- بصمة التواجد
fingerprint_departure BOOLEAN       -- بصمة الانصراف
status VARCHAR(30)                  -- pending_supervisor/pending_monitor/pending_admin/approved/rejected

-- Supervisor approval
supervisor_id INTEGER → users(id)
supervisor_signature TEXT           -- Base64 image
supervisor_approved_at TIMESTAMP
supervisor_rejected_reason TEXT

-- Monitor approval
monitor_id INTEGER → users(id)
monitor_signature TEXT
monitor_approved_at TIMESTAMP
monitor_rejected_reason TEXT
monitor_skipped BOOLEAN             -- True if supervisor=monitor

-- Admin approval
admin_id INTEGER → users(id)
admin_signature TEXT
admin_approved_at TIMESTAMP
admin_rejected_reason TEXT

submitted_at TIMESTAMP
```

### `notifications` Table
```sql
id SERIAL PRIMARY KEY
user_id INTEGER → users(id)
message TEXT
form_id INTEGER → forms(id)
is_read BOOLEAN DEFAULT FALSE
created_at TIMESTAMP
```

---

## 🔐 Authentication

**Method:** JWT tokens stored in localStorage
**Login:** `POST /api/auth/login` with `{employee_number, password}`
**Response:** `{token, user: {...}}`
**Middleware:** `auth.js` verifies JWT on protected routes

---

## 🔄 Approval Workflow

```
1. Employee submits form
   ↓
2. Status: "pending_supervisor"
   → Notifies all supervisors in same department
   ↓
3. Supervisor approves with signature
   → If supervisor_id = monitor (same person):
      - Set monitor_skipped = true
      - Status → "pending_admin"
   → Else:
      - Status → "pending_monitor"
   ↓
4. Monitor approves (if not skipped)
   → Status → "pending_admin"
   ↓
5. Admin approves
   → Status → "approved"
   ↓
6. PDF becomes available for printing
```

---

## 🎨 UI Features

Arabic RTL, responsive design, signature pad (touch/stylus), notifications bell, delete requests (pending only), date picker (max=today)

---

## 🔌 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/login | Login | ✗ |
| GET | /api/forms | List forms (role-filtered) | ✓ |
| POST | /api/forms | Submit form | Employee |
| DELETE | /api/forms/:id | Delete pending | Employee |
| POST | /api/forms/:id/approve | Approve + signature | Approver |
| POST | /api/forms/:id/reject | Reject + reason | Approver |
| GET | /api/notifications | List notifications | ✓ |
| PUT | /api/notifications/:id/read | Mark read | ✓ |
| GET | /api/pdf/:id | Generate printable HTML | ✗ |
| GET | /api/setup-demo | Create demo accounts | ✗ |
| GET | /api/update-departments | Fix supervisor depts | ✗ |
| GET | /api/debug-state | Inspect DB state | ✗ |

---

## 📄 PDF Generation

**File:** `backend/routes/pdf.js`
**Method:** Server-rendered HTML with inline CSS
**Features:**
- Kuwait emblem from `/public/kuwait_emblem.png`
- All form fields in Arabic
- Three signature sections (supervisor, monitor, admin)
- Print button (hidden when printing)
- Matches original paper form layout

**Key Elements:**
- Header: Ministry name + Kuwait emblem
- Body: Form fields + employee data table
- Checkboxes: بصمة التواجد / بصمة الانصراف
- Signatures: Base64 images embedded in `<img>` tags
- Footer: Print button

---

## 🔧 Environment Variables

| Service | Variable | Required | Example |
|---------|----------|----------|---------|
| Backend | DATABASE_URL | ✓ | postgresql://... |
| Backend | JWT_SECRET | ✓ | random_string |
| Backend | EMAIL_USER | ✗ | gmail@gmail.com |
| Frontend | REACT_APP_API_URL | ✓ | https://backend.com/api |

---

## 🚀 Deployment Commands

### Backend (Render)
```bash
npm install
npm start
```

### Frontend (Netlify)
```bash
cd frontend
npm install
npm run build
# Publish: frontend/build
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Supervisor dashboard empty | Employee must enter dept: `هندسة الاستوديوهات الإذاعية`. Run `/api/update-departments` if needed |
| Emblem not showing | Ensure `kuwait_emblem.png` in `backend/public/` |
| Email not sending | Set EMAIL_USER/EMAIL_PASS (in-app notifications work regardless) |
| Monitor step not skipping | Verify supervisor user has monitor role (auto-skip in forms.js:128-134) |
| Cannot delete request | Only allowed when status=pending_supervisor |
| Future dates selectable | Fixed: max=today in SubmitForm.js:109 |

---

## 🎯 Business Logic

### Department-based Approval
- Supervisors see forms WHERE form.department = user.department AND status='pending_supervisor'
- Monitors see forms WHERE status='pending_monitor' (all departments)
- Admins see ALL forms regardless of status or department
- Employee department is NOT pre-filled - must be entered manually each time
- Query logic fixed in commit 8447de4: Changed from `u.department` to `f.department`

### Signature Validation
- Signature required before approval
- Cannot approve empty signature
- Signatures stored as base64 PNG

### Auto-skip Logic
- If supervisor user has monitor role → skip monitor step
- Implemented in `routes/forms.js` line 128-134
- Sets `monitor_skipped = true` and jumps to `pending_admin`

### Delete Request Logic
- Employees can delete their own requests ONLY when status='pending_supervisor'
- Once any approval is made, deletion is blocked
- Validation: Check ownership (employee_id) and status before allowing DELETE

### Status Transitions
```
pending_supervisor → pending_monitor → pending_admin → approved
                  ↘                 ↗
                    (skip if same person)

Employee can DELETE only at pending_supervisor stage
```

---


## 📦 Dependencies

**Backend:** express, pg, bcryptjs, jsonwebtoken, nodemailer, cors, dotenv, uuid
**Frontend:** react 18, axios, signature_pad, react-router-dom

---

## 🔒 Security

JWT auth (8h expiry), bcrypt hashing, parameterized SQL queries, CORS, 5MB body limit, no password exposure in responses

---

## 🎨 Styling

Custom CSS (no framework), RTL support, blue/green/red/gold palette, Arabic fonts, emoji icons

---

## 📝 Form Fields

القطاع (sector), الإدارة (directorate), القسم (department), الاسم (name), الرقم المدني (civil), بصمة التواجد/الانصراف (checkboxes), التاريخ (date picker, max=today)

---

## 🔮 Future Enhancements

IT integration (no printing), analytics dashboard, AR/EN toggle, bulk approval, auto-reject deadlines, SMS notifications, mobile apps, digital archive, audit trail, advanced search

---

**This file should be read by AI assistants BEFORE making any changes to the system.**
