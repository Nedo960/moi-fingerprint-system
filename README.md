# نظام نموذج نسيان البصمة - وزارة الإعلام
# MOI Fingerprint Forgetfulness Form System

Electronic system to replace paper-based fingerprint forgetfulness forms in Kuwait Ministry of Information.

## 🚀 Live Demo

- **Frontend:** https://lambent-kheer-854b54.netlify.app
- **Backend API:** https://moi-fingerprint-backend.onrender.com

## 👥 Demo Accounts

| Role | Employee # | Password | Name |
|------|-----------|----------|------|
| موظف (Employee) | 10001 | demo123 | محمد بدر صقر الرشيدي |
| رئيس مباشر (Supervisor) | 20001 | demo123 | مشعل ناصر الزمنان |
| مراقب (Monitor) | 30001 | demo123 | مشعل ناصر الزمنان |
| رئيس الشؤون (Admin) | 40001 | demo123 | حمد بن حيدر |

## ✨ Features

- ✅ Arabic RTL interface
- ✅ Electronic signature with finger/stylus
- ✅ 3-step approval workflow (Supervisor → Monitor → Admin)
- ✅ Automatic skip if supervisor = monitor
- ✅ In-app + email notifications
- ✅ Printable PDF matching official form
- ✅ Mobile-responsive for supervisor signatures on phone
- ✅ Kuwait emblem on official documents

## 🏗️ Architecture

### Frontend
- React 18
- Axios for API calls
- signature_pad for digital signatures
- Hosted on Netlify

### Backend
- Node.js + Express
- PostgreSQL database
- JWT authentication
- Nodemailer for email notifications
- Hosted on Render

### Database Schema
- `users` - Employee accounts with roles
- `forms` - Fingerprint absence forms
- `notifications` - In-app notification system

## 📋 Workflow

1. **Employee** logs in and submits form (date, fingerprint type: presence/departure)
2. **Supervisor** receives notification → reviews → signs electronically
3. **Monitor** receives notification → reviews → signs (auto-skipped if same as supervisor)
4. **Admin (Director)** receives notification → final approval → signs
5. **PDF generated** with all signatures for printing and submission to IT

## 🔧 Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### Setup

1. **Clone repository**
```bash
git clone https://github.com/Nedo960/moi-fingerprint-system.git
cd moi-fingerprint-system
```

2. **Backend setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run seed  # Create demo accounts
npm start
```

3. **Frontend setup**
```bash
cd frontend
npm install
npm start
```

## 🌐 Deployment

### Backend (Render)
1. Create PostgreSQL database on Render
2. Create Web Service connected to GitHub repo
3. Set root directory: `backend`
4. Add environment variables:
   - `DATABASE_URL` - from database
   - `JWT_SECRET` - random secret
   - `NODE_ENV=production`
   - `EMAIL_USER` - Gmail account
   - `EMAIL_PASS` - Gmail app password

### Frontend (Netlify)
1. New site from Git → select repository
2. Base directory: `frontend`
3. Build command: `npm run build`
4. Publish directory: `frontend/build`
5. Environment variable:
   - `REACT_APP_API_URL=https://your-backend.onrender.com/api`

## 📝 API Endpoints

### Authentication
- `POST /api/auth/login` - Login with employee number + password

### Forms
- `GET /api/forms` - Get forms (filtered by role)
- `POST /api/forms` - Submit new form
- `GET /api/forms/:id` - Get single form
- `POST /api/forms/:id/approve` - Approve with signature
- `POST /api/forms/:id/reject` - Reject form

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark as read

### PDF
- `GET /api/pdf/:id` - Generate printable PDF

### Setup (Demo)
- `GET /api/setup-demo` - Create demo accounts
- `GET /api/update-names` - Update demo names

## 🔐 Security

- JWT-based authentication
- Bcrypt password hashing
- CORS enabled for frontend domain
- SQL injection protection via parameterized queries
- File size limits on uploads

## 📱 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android)

## 🎨 Design Decisions

1. **Arabic-first RTL design** - Primary interface language
2. **Signature instead of PIN** - More official feel
3. **Auto-skip duplicate approvers** - Handles organizational structure
4. **PDF matches paper form** - Easy transition from paper
5. **Mobile-responsive** - Supervisors can approve on phone

## 🔮 Future Enhancements

- Direct IT system integration (no printing needed)
- Advanced analytics dashboard
- Multi-language support (Arabic/English toggle)
- Bulk approval for supervisors
- Automated deadline enforcement
- SMS notifications via Kuwait SMS gateway

## 📄 License

MIT License - Free for government use

## 🤝 Support

For issues or questions: https://github.com/Nedo960/moi-fingerprint-system/issues

---

Built with ❤️ for Kuwait Ministry of Information
