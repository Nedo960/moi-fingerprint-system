const pool = require('./db');
const bcrypt = require('bcryptjs');

async function seed() {
  const hash = async (pw) => bcrypt.hash(pw, 10);

  const users = [
    {
      employee_number: '10001',
      password: 'demo123',
      full_name: 'محمد بدر صقر الرشيدي',
      civil_number: '281122512345',
      sector: 'قطاع الإعلام',
      directorate: 'إدارة الشؤون الإدارية',
      department: 'قسم الموارد البشرية',
      role: 'employee',
      email: 'employee1@demo.com'
    },
    {
      employee_number: '10002',
      password: 'demo123',
      full_name: 'فاطمة علي الرشيدي',
      civil_number: '290456678901',
      sector: 'قطاع الإعلام',
      directorate: 'إدارة الشؤون الإدارية',
      department: 'قسم الموارد البشرية',
      role: 'employee',
      email: 'employee2@demo.com'
    },
    {
      employee_number: '20001',
      password: 'demo123',
      full_name: 'مشعل ناصر الزمنان',
      civil_number: '275033411111',
      sector: 'قطاع الإعلام',
      directorate: 'إدارة الشؤون الإدارية',
      department: 'قسم الموارد البشرية',
      role: 'supervisor',
      email: 'supervisor@demo.com'
    },
    {
      employee_number: '30001',
      password: 'demo123',
      full_name: 'مشعل ناصر الزمنان',
      civil_number: '268011322222',
      sector: 'قطاع الإعلام',
      directorate: 'إدارة الشؤون الإدارية',
      department: 'قسم الموارد البشرية',
      role: 'monitor',
      email: 'monitor@demo.com'
    },
    {
      employee_number: '40001',
      password: 'demo123',
      full_name: 'حمد بن حيدر',
      civil_number: '260099433333',
      sector: 'قطاع الإعلام',
      directorate: 'إدارة الشؤون الإدارية',
      department: 'قسم الموارد البشرية',
      role: 'admin',
      email: 'admin@demo.com'
    }
  ];

  for (const u of users) {
    const hash_pw = await hash(u.password);
    await pool.query(
      `INSERT INTO users (employee_number, password_hash, full_name, civil_number, sector, directorate, department, role, email)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (employee_number) DO NOTHING`,
      [u.employee_number, hash_pw, u.full_name, u.civil_number, u.sector, u.directorate, u.department, u.role, u.email]
    );
  }

  console.log('✅ Demo accounts seeded successfully');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
