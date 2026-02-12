# MOI Fingerprint System - Technical Summary

**Last Updated:** February 9, 2026
**Status:** ✅ Fully Functional Demo
**Purpose:** Quick reference for AI assistants and developers

---

## 🌐 Deployment URLs

- **Frontend (Netlify):** https://lambent-kheer-854b54.netlify.app
- **Backend (Render):** https://moi-fingerprint-backend.onrender.com
- **GitHub Repo:** https://github.com/Nedo960/moi-fingerprint-system
- **Database:** PostgreSQL on Render (Free tier)

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

- **Language:** Arabic RTL only
- **Theme:** Blue/green government colors
- **Responsive:** Works on mobile (especially for signatures)
- **Signature Pad:** Uses `signature_pad` library (finger/stylus)
- **Notifications:** Bell icon with unread count
- **Forms List:** Different views per role
- **PDF Print:** Opens in new tab with print button

---

## 📋 Demo Accounts

| Employee # | Password | Role | Name |
|-----------|----------|------|------|
| 10001 | demo123 | employee | محمد بدر صقر الرشيدي |
| 10002 | demo123 | employee | فاطمة علي الرشيدي |
| 20001 | demo123 | supervisor | مشعل ناصر الزمنان |
| 30001 | demo123 | monitor | مشعل ناصر الزمنان |
| 40001 | demo123 | admin | حمد بن حيدر |

**Note:** 20001 (supervisor) and 30001 (monitor) are the same person, so monitor step auto-skips.

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - Login with employee_number + password

### Forms
- `GET /api/forms` - Get forms (filtered by user role)
- `POST /api/forms` - Submit new form (employee only)
- `GET /api/forms/:id` - Get single form details
- `POST /api/forms/:id/approve` - Approve with signature
- `POST /api/forms/:id/reject` - Reject with reason

### Notifications
- `GET /api/notifications` - Get user's notifications
- `PUT /api/notifications/:id/read` - Mark single as read
- `PUT /api/notifications/read-all` - Mark all as read

### PDF
- `GET /api/pdf/:id` - Generate printable HTML (no auth required)

### Setup (Demo Only)
- `GET /api/setup-demo` - Create demo accounts (inserts with ON CONFLICT DO NOTHING)
- `GET /api/update-names` - Update existing demo account names

### Health
- `GET /api/health` - Server status check

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

### Backend (.env)
```env
DATABASE_URL=postgresql://...         # Render PostgreSQL
JWT_SECRET=random_secret_key
NODE_ENV=production
PORT=10000
EMAIL_USER=your_gmail@gmail.com       # Optional
EMAIL_PASS=gmail_app_password         # Optional
```

### Frontend (Netlify)
```env
REACT_APP_API_URL=https://moi-fingerprint-backend.onrender.com/api
```

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

## 🐛 Known Issues & Solutions

### Issue 1: Names not updating
**Solution:** Visit `/api/update-names` endpoint (not /api/setup-demo)

### Issue 2: Emblem not showing
**Solution:** Ensure `kuwait_emblem.png` is in `backend/public/`

### Issue 3: Email not sending
**Solution:** EMAIL_USER and EMAIL_PASS not set (in-app notifications still work)

### Issue 4: Monitor step not skipping
**Solution:** Check if supervisor_id and monitor role user are same person

---

## 🎯 Business Logic

### Department-based Approval
- Supervisors see forms from their department only
- Employee must be in same department as supervisor
- Monitor and Admin see all pending forms

### Signature Validation
- Signature required before approval
- Cannot approve empty signature
- Signatures stored as base64 PNG

### Auto-skip Logic
- If supervisor user has monitor role → skip monitor step
- Implemented in `routes/forms.js` line 58-68

### Status Transitions
```
pending_supervisor → pending_monitor → pending_admin → approved
                  ↘                 ↗
                    (skip if same person)
```

---

## 📦 Dependencies

### Backend
- express (5.2.1) - Web framework
- pg (8.18.0) - PostgreSQL client
- bcryptjs (3.0.3) - Password hashing
- jsonwebtoken (9.0.3) - JWT auth
- nodemailer (8.0.1) - Email sending
- cors (2.8.6) - CORS handling
- dotenv (17.2.4) - Environment vars
- uuid (13.0.0) - UUID generation

### Frontend
- react (18.x) - UI framework
- axios - HTTP client
- signature_pad - Digital signatures
- react-router-dom - Routing

---

## 🔒 Security Features

- ✅ JWT authentication
- ✅ Bcrypt password hashing (10 rounds)
- ✅ SQL injection protection (parameterized queries)
- ✅ CORS enabled for frontend domain
- ✅ 5MB limit on request body (signature images)
- ✅ Token expiration (8 hours)
- ✅ Password never returned in API responses

---

## 🎨 Styling Approach

- **No CSS framework** - Custom CSS in `index.css`
- **RTL Support** - `direction: rtl` on body
- **Colors:**
  - Primary: #1a3a5c (dark blue)
  - Success: #27ae60 (green)
  - Danger: #e74c3c (red)
  - Warning: #d68910 (gold)
- **Fonts:** Arabic-friendly system fonts
- **Icons:** Unicode emoji (🏛️ 🔔 📋 🖨️)

---

## 📝 Form Fields (Arabic)

| Field | Arabic | Type |
|-------|--------|------|
| Sector | القطاع | Text |
| Directorate | الإدارة | Text |
| Department | القسم | Text |
| Name | الاسم | Auto-filled |
| ID Number | رقم الهوية | Auto-filled |
| Civil Number | الرقم المدني | Auto-filled |
| Presence Fingerprint | بصمة التواجد | Checkbox |
| Departure Fingerprint | بصمة الانصراف | Checkbox |
| Day | اليوم | Auto-filled from date |
| Date | التاريخ | Date picker |

---

## 🔮 Future Enhancement Ideas

1. **IT Integration** - Direct API to fingerprint system (no printing)
2. **Analytics Dashboard** - Forms per month, approval times
3. **Multi-language** - Arabic/English toggle
4. **Bulk Approval** - Supervisor approves multiple at once
5. **Deadline Enforcement** - Auto-reject after 3 days
6. **SMS Notifications** - Kuwait SMS gateway integration
7. **Mobile App** - Native iOS/Android apps
8. **Digital Archive** - Long-term form storage
9. **Audit Trail** - Full log of all changes
10. **Advanced Search** - Filter by date range, employee, status

---

## 🆘 Troubleshooting

### Backend won't start
1. Check DATABASE_URL is set
2. Check JWT_SECRET is set
3. Check PostgreSQL is accessible
4. Run `npm install` again

### Frontend API errors
1. Check REACT_APP_API_URL is correct
2. Check backend is running
3. Check CORS is enabled
4. Clear localStorage and re-login

### PDF not generating
1. Check form status is "approved"
2. Check all 3 signatures exist
3. Check emblem file exists at `/public/kuwait_emblem.png`

### Names are wrong
1. Visit `/api/update-names` endpoint
2. Check database directly
3. Re-run seed if needed

---

## 📞 Support

- **GitHub Issues:** https://github.com/Nedo960/moi-fingerprint-system/issues
- **Render Logs:** Check backend service logs for errors
- **Browser Console:** Check for frontend errors

---

**This file should be read by AI assistants BEFORE making any changes to the system.**
