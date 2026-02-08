const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { employee_number, password } = req.body;
  if (!employee_number || !password)
    return res.status(400).json({ message: 'يرجى إدخال رقم الموظف وكلمة المرور' });

  try {
    const result = await pool.query('SELECT * FROM users WHERE employee_number = $1', [employee_number]);
    if (result.rows.length === 0)
      return res.status(401).json({ message: 'رقم الموظف أو كلمة المرور غير صحيحة' });

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid)
      return res.status(401).json({ message: 'رقم الموظف أو كلمة المرور غير صحيحة' });

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.full_name, department: user.department },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        employee_number: user.employee_number,
        full_name: user.full_name,
        role: user.role,
        sector: user.sector,
        directorate: user.directorate,
        department: user.department,
        civil_number: user.civil_number
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

module.exports = router;
