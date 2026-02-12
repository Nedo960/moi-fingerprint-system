const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const pool = require('../db');
const auth = require('../middleware/auth');
const { sendMail } = require('../mailer');

// Helper: notify user in-app + email
async function notify(userId, message, formId) {
  await pool.query(
    'INSERT INTO notifications (user_id, message, form_id) VALUES ($1,$2,$3)',
    [userId, message, formId]
  );
  const userRes = await pool.query('SELECT email FROM users WHERE id = $1', [userId]);
  if (userRes.rows[0]?.email) {
    await sendMail(userRes.rows[0].email, 'نظام نسيان البصمة - إشعار', `<p>${message}</p>`);
  }
}

// POST /api/forms - Employee submits form
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'employee')
    return res.status(403).json({ message: 'فقط الموظفون يمكنهم تقديم النماذج' });

  const { sector, directorate, department, day_name, date, fingerprint_presence, fingerprint_departure } = req.body;

  if (!date || (!fingerprint_presence && !fingerprint_departure))
    return res.status(400).json({ message: 'يرجى تحديد التاريخ ونوع البصمة المنسية' });

  try {
    const uuid = uuidv4();
    const result = await pool.query(
      `INSERT INTO forms (uuid, employee_id, sector, directorate, department, day_name, date, fingerprint_presence, fingerprint_departure, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'pending_supervisor') RETURNING *`,
      [uuid, req.user.id, sector, directorate, department, day_name, date, fingerprint_presence, fingerprint_departure]
    );
    const form = result.rows[0];

    // Notify all supervisors in same department
    const supervisors = await pool.query(
      `SELECT id FROM users WHERE role = 'supervisor' AND department = $1`,
      [department]
    );
    for (const sup of supervisors.rows) {
      await notify(sup.id, `طلب جديد لنسيان البصمة من ${req.user.name} بتاريخ ${date}`, form.id);
    }

    res.status(201).json({ message: 'تم تقديم النموذج بنجاح', form });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// GET /api/forms - Get forms based on role
router.get('/', auth, async (req, res) => {
  try {
    let query, params;
    if (req.user.role === 'employee') {
      query = `SELECT f.*, u.full_name as employee_name FROM forms f
               JOIN users u ON f.employee_id = u.id
               WHERE f.employee_id = $1 ORDER BY f.submitted_at DESC`;
      params = [req.user.id];
    } else if (req.user.role === 'supervisor') {
      query = `SELECT f.*, u.full_name as employee_name FROM forms f
               JOIN users u ON f.employee_id = u.id
               WHERE f.department = $1 AND f.status = 'pending_supervisor' ORDER BY f.submitted_at DESC`;
      params = [req.user.department];
    } else if (req.user.role === 'monitor') {
      query = `SELECT f.*, u.full_name as employee_name FROM forms f
               JOIN users u ON f.employee_id = u.id
               WHERE f.status = 'pending_monitor' ORDER BY f.submitted_at DESC`;
      params = [];
    } else if (req.user.role === 'admin') {
      query = `SELECT f.*, u.full_name as employee_name FROM forms f
               JOIN users u ON f.employee_id = u.id
               ORDER BY f.submitted_at DESC`;
      params = [];
    }
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// GET /api/forms/:id - Get single form
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT f.*, u.full_name as employee_name, u.civil_number as employee_civil
       FROM forms f JOIN users u ON f.employee_id = u.id WHERE f.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'النموذج غير موجود' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// POST /api/forms/:id/approve - Approve with signature
router.post('/:id/approve', auth, async (req, res) => {
  const { signature } = req.body;
  if (!signature) return res.status(400).json({ message: 'التوقيع مطلوب' });

  try {
    const formRes = await pool.query('SELECT * FROM forms WHERE id = $1', [req.params.id]);
    if (formRes.rows.length === 0) return res.status(404).json({ message: 'النموذج غير موجود' });
    const form = formRes.rows[0];

    const employeeRes = await pool.query('SELECT * FROM users WHERE id = $1', [form.employee_id]);
    const employee = employeeRes.rows[0];

    if (req.user.role === 'supervisor' && form.status === 'pending_supervisor') {
      // Check if supervisor same as monitor role — if so skip monitor step
      const monitorRes = await pool.query(`SELECT id FROM users WHERE role = 'monitor'`);
      const monitorIds = monitorRes.rows.map(r => r.id);
      const supervisorIsMonitor = monitorIds.includes(req.user.id);

      const nextStatus = supervisorIsMonitor ? 'pending_admin' : 'pending_monitor';
      await pool.query(
        `UPDATE forms SET supervisor_id=$1, supervisor_signature=$2, supervisor_approved_at=NOW(),
         status=$3, monitor_skipped=$4 WHERE id=$5`,
        [req.user.id, signature, nextStatus, supervisorIsMonitor, form.id]
      );

      // Notify employee
      await notify(form.employee_id, `تمت الموافقة على طلبك من قِبل الرئيس المباشر`, form.id);

      if (supervisorIsMonitor) {
        const admins = await pool.query(`SELECT id FROM users WHERE role = 'admin'`);
        for (const a of admins.rows) await notify(a.id, `طلب نسيان بصمة بانتظار موافقتك - ${employee.full_name}`, form.id);
      } else {
        const monitors = await pool.query(`SELECT id FROM users WHERE role = 'monitor'`);
        for (const m of monitors.rows) await notify(m.id, `طلب نسيان بصمة بانتظار موافقتك - ${employee.full_name}`, form.id);
      }

      return res.json({ message: 'تمت الموافقة بنجاح' });
    }

    if (req.user.role === 'monitor' && form.status === 'pending_monitor') {
      await pool.query(
        `UPDATE forms SET monitor_id=$1, monitor_signature=$2, monitor_approved_at=NOW(), status='pending_admin' WHERE id=$3`,
        [req.user.id, signature, form.id]
      );
      await notify(form.employee_id, `تمت الموافقة على طلبك من قِبل المراقب`, form.id);
      const admins = await pool.query(`SELECT id FROM users WHERE role = 'admin'`);
      for (const a of admins.rows) await notify(a.id, `طلب نسيان بصمة بانتظار موافقتك - ${employee.full_name}`, form.id);
      return res.json({ message: 'تمت الموافقة بنجاح' });
    }

    if (req.user.role === 'admin' && form.status === 'pending_admin') {
      await pool.query(
        `UPDATE forms SET admin_id=$1, admin_signature=$2, admin_approved_at=NOW(), status='approved' WHERE id=$3`,
        [req.user.id, signature, form.id]
      );
      await notify(form.employee_id, `تم اعتماد طلبك نهائياً. يمكنك الآن طباعة النموذج وتسليمه لقسم المعلوماتية`, form.id);
      return res.json({ message: 'تم الاعتماد النهائي بنجاح' });
    }

    return res.status(403).json({ message: 'غير مصرح لك بالموافقة على هذا النموذج' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// POST /api/forms/:id/reject
router.post('/:id/reject', auth, async (req, res) => {
  const { reason } = req.body;
  try {
    const formRes = await pool.query('SELECT * FROM forms WHERE id = $1', [req.params.id]);
    if (formRes.rows.length === 0) return res.status(404).json({ message: 'النموذج غير موجود' });
    const form = formRes.rows[0];

    let updateQuery;
    if (req.user.role === 'supervisor' && form.status === 'pending_supervisor') {
      updateQuery = `UPDATE forms SET status='rejected', supervisor_rejected_reason=$1 WHERE id=$2`;
    } else if (req.user.role === 'monitor' && form.status === 'pending_monitor') {
      updateQuery = `UPDATE forms SET status='rejected', monitor_rejected_reason=$1 WHERE id=$2`;
    } else if (req.user.role === 'admin' && form.status === 'pending_admin') {
      updateQuery = `UPDATE forms SET status='rejected', admin_rejected_reason=$1 WHERE id=$2`;
    } else {
      return res.status(403).json({ message: 'غير مصرح' });
    }

    await pool.query(updateQuery, [reason || 'مرفوض', form.id]);
    await notify(form.employee_id, `تم رفض طلب نسيان البصمة الخاص بك. السبب: ${reason || 'غير محدد'}`, form.id);
    res.json({ message: 'تم رفض النموذج' });
  } catch (err) {
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// DELETE /api/forms/:id - Delete pending form (employee only, before approval)
router.delete('/:id', auth, async (req, res) => {
  try {
    const formRes = await pool.query('SELECT * FROM forms WHERE id = $1', [req.params.id]);
    if (formRes.rows.length === 0) return res.status(404).json({ message: 'النموذج غير موجود' });

    const form = formRes.rows[0];

    // Only employee who owns the form can delete
    if (req.user.role !== 'employee' || form.employee_id !== req.user.id) {
      return res.status(403).json({ message: 'غير مصرح لك بحذف هذا النموذج' });
    }

    // Only allow deletion if still pending supervisor (no approvals yet)
    if (form.status !== 'pending_supervisor') {
      return res.status(400).json({ message: 'لا يمكن حذف النموذج بعد بدء الموافقات' });
    }

    await pool.query('DELETE FROM forms WHERE id = $1', [req.params.id]);
    res.json({ message: 'تم حذف الطلب بنجاح' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

module.exports = router;
