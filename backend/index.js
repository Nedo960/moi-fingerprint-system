require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json({ limit: '5mb' })); // signatures are base64 images
app.use('/public', express.static(path.join(__dirname, 'public'))); // Serve static files

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
      { employee_number: '10001', password: 'demo123', full_name: 'محمد بدر صقر الرشيدي', civil_number: '281122512345', sector: 'قطاع الإعلام', directorate: 'إدارة الشؤون الإدارية', department: 'قسم الموارد البشرية', role: 'employee', email: 'employee1@demo.com' },
      { employee_number: '10002', password: 'demo123', full_name: 'فاطمة علي الرشيدي', civil_number: '290456678901', sector: 'قطاع الإعلام', directorate: 'إدارة الشؤون الإدارية', department: 'قسم الموارد البشرية', role: 'employee', email: 'employee2@demo.com' },
      { employee_number: '20001', password: 'demo123', full_name: 'مشعل ناصر الزمنان', civil_number: '275033411111', sector: 'قطاع الإعلام', directorate: 'إدارة الشؤون الإدارية', department: 'هندسة الاستوديوهات الإذاعية', role: 'supervisor', email: 'supervisor@demo.com' },
      { employee_number: '30001', password: 'demo123', full_name: 'مشعل ناصر الزمنان', civil_number: '268011322222', sector: 'قطاع الإعلام', directorate: 'إدارة الشؤون الإدارية', department: 'هندسة الاستوديوهات الإذاعية', role: 'monitor', email: 'monitor@demo.com' },
      { employee_number: '40001', password: 'demo123', full_name: 'حمد بن حيدر', civil_number: '260099433333', sector: 'قطاع الإعلام', directorate: 'إدارة الشؤون الإدارية', department: 'قسم الشؤون الإدارية', role: 'admin', email: 'admin@demo.com' }
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

// Update existing user names
app.get('/api/update-names', async (req, res) => {
  try {
    await pool.query(`UPDATE users SET full_name = 'محمد بدر صقر الرشيدي' WHERE employee_number = '10001'`);
    await pool.query(`UPDATE users SET full_name = 'مشعل ناصر الزمنان' WHERE employee_number = '20001'`);
    await pool.query(`UPDATE users SET full_name = 'مشعل ناصر الزمنان' WHERE employee_number = '30001'`);
    await pool.query(`UPDATE users SET full_name = 'حمد بن حيدر' WHERE employee_number = '40001'`);
    res.json({ success: true, message: '✅ Names updated successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update demo account details (civil ID, names, clear employee defaults only)
app.get('/api/update-demo-details', async (req, res) => {
  try {
    await pool.query(`UPDATE users SET civil_number = '296102200447', sector = NULL, directorate = NULL, department = NULL WHERE employee_number = '10001'`);
    await pool.query(`UPDATE users SET full_name = 'مشعل سالم سعود الزمانان' WHERE employee_number IN ('20001', '30001')`);
    res.json({ success: true, message: '✅ Demo details updated!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update user departments to new values
app.get('/api/update-departments', async (req, res) => {
  try {
    await pool.query(`UPDATE users SET department = 'هندسة الاستوديوهات الإذاعية' WHERE employee_number IN ('20001', '30001')`);
    await pool.query(`UPDATE users SET department = 'قسم الشؤون الإدارية' WHERE employee_number = '40001'`);
    res.json({ success: true, message: '✅ Departments updated!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Debug: Check database state
app.get('/api/debug-state', async (req, res) => {
  try {
    const users = await pool.query(`SELECT employee_number, full_name, department, role FROM users ORDER BY employee_number`);
    const forms = await pool.query(`SELECT id, employee_id, department, status, date FROM forms ORDER BY submitted_at DESC LIMIT 10`);
    res.json({
      users: users.rows,
      forms: forms.rows,
      message: '✅ Debug data retrieved'
    });
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
