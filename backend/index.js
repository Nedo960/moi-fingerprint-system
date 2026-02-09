require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json({ limit: '5mb' })); // signatures are base64 images

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/forms', require('./routes/forms'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/pdf', require('./routes/pdf'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// One-time setup endpoint to seed demo accounts
app.get('/api/setup-demo', async (req, res) => {
  const bcrypt = require('bcryptjs');
  try {
    const hash = async (pw) => bcrypt.hash(pw, 10);
    const users = [
      { employee_number: '10001', password: 'demo123', full_name: 'أحمد محمد العنزي', civil_number: '281122512345', sector: 'قطاع الإعلام', directorate: 'إدارة الشؤون الإدارية', department: 'قسم الموارد البشرية', role: 'employee', email: 'employee1@demo.com' },
      { employee_number: '10002', password: 'demo123', full_name: 'فاطمة علي الرشيدي', civil_number: '290456678901', sector: 'قطاع الإعلام', directorate: 'إدارة الشؤون الإدارية', department: 'قسم الموارد البشرية', role: 'employee', email: 'employee2@demo.com' },
      { employee_number: '20001', password: 'demo123', full_name: 'خالد سعد المطيري', civil_number: '275033411111', sector: 'قطاع الإعلام', directorate: 'إدارة الشؤون الإدارية', department: 'قسم الموارد البشرية', role: 'supervisor', email: 'supervisor@demo.com' },
      { employee_number: '30001', password: 'demo123', full_name: 'محمد عبدالله الحربي', civil_number: '268011322222', sector: 'قطاع الإعلام', directorate: 'إدارة الشؤون الإدارية', department: 'قسم الموارد البشرية', role: 'monitor', email: 'monitor@demo.com' },
      { employee_number: '40001', password: 'demo123', full_name: 'سعود ناصر العجمي', civil_number: '260099433333', sector: 'قطاع الإعلام', directorate: 'إدارة الشؤون الإدارية', department: 'قسم الموارد البشرية', role: 'admin', email: 'admin@demo.com' }
    ];
    for (const u of users) {
      const hash_pw = await hash(u.password);
      await pool.query(
        `INSERT INTO users (employee_number, password_hash, full_name, civil_number, sector, directorate, department, role, email)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT (employee_number) DO NOTHING`,
        [u.employee_number, hash_pw, u.full_name, u.civil_number, u.sector, u.directorate, u.department, u.role, u.email]
      );
    }
    res.json({ success: true, message: '✅ Demo accounts created successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Initialize DB schema
async function initDB() {
  try {
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(schema);
    console.log('✅ Database schema initialized');
  } catch (err) {
    console.error('❌ DB init error:', err.message);
  }
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  await initDB();
  console.log(`✅ Server running on port ${PORT}`);
});
