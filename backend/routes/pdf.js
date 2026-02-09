const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/pdf/:id - Generate printable HTML form (no auth required for printing)
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT f.*, u.full_name as employee_name, u.civil_number as employee_civil,
              u.employee_number,
              s.full_name as supervisor_name,
              m.full_name as monitor_name,
              a.full_name as admin_name
       FROM forms f
       JOIN users u ON f.employee_id = u.id
       LEFT JOIN users s ON f.supervisor_id = s.id
       LEFT JOIN users m ON f.monitor_id = m.id
       LEFT JOIN users a ON f.admin_id = a.id
       WHERE f.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) return res.status(404).json({ message: 'النموذج غير موجود' });
    const f = result.rows[0];

    if (f.status !== 'approved') return res.status(400).json({ message: 'النموذج لم يكتمل الاعتماد بعد' });

    const formatDate = (d) => {
      if (!d) return '';
      const date = new Date(d);
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    };

    const sigImg = (sig) => sig ? `<img src="${sig}" style="max-height:60px; max-width:150px;" />` : '';

    const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Arial', sans-serif; font-size: 13px; padding: 30px; direction: rtl; }
  .page { max-width: 800px; margin: auto; border: 2px solid #000; padding: 20px; }
  .header { text-align: center; margin-bottom: 20px; }
  .header img { height: 80px; }
  .header-text { display: inline-block; vertical-align: middle; margin-right: 15px; }
  .header-text .ministry { font-size: 16px; font-weight: bold; }
  .header-text .sub { font-size: 12px; }
  .title-section { text-align: right; margin-bottom: 15px; line-height: 2; }
  .form-title { text-align: center; font-size: 16px; font-weight: bold; text-decoration: underline; margin: 15px 0; }
  .fields { margin: 10px 0; line-height: 2.2; }
  .field-line { border-bottom: 1px dotted #333; margin-bottom: 8px; padding-bottom: 2px; }
  table { width: 100%; border-collapse: collapse; margin: 15px 0; }
  table, th, td { border: 1px solid #000; }
  th, td { padding: 8px 12px; text-align: center; }
  .checkbox-row { display: flex; gap: 40px; margin: 15px 0; }
  .checkbox-item { display: flex; align-items: center; gap: 8px; font-size: 14px; }
  .checkbox-box { width: 20px; height: 20px; border: 1px solid #000; display: inline-flex; align-items: center; justify-content: center; font-size: 16px; }
  .signatures { display: flex; justify-content: space-between; margin-top: 30px; }
  .sig-block { text-align: center; width: 45%; }
  .sig-block .sig-title { font-weight: bold; margin-bottom: 10px; }
  .sig-box { border-bottom: 1px solid #000; min-height: 70px; display: flex; align-items: center; justify-content: center; }
  @media print { body { padding: 0; } .no-print { display: none; } }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <table style="border:none; width:100%;">
      <tr>
        <td style="border:none; text-align:right; width:33%;">
          <div style="font-size:14px; font-weight:bold;">وزارة الإعلام</div>
          <div style="font-size:12px;">Ministry of Information</div>
          <div style="font-size:11px;">دولة الكويت | State of Kuwait</div>
        </td>
        <td style="border:none; text-align:center; width:34%;">
          <div style="width:90px; height:90px; margin:auto; border:2px solid #c09957; border-radius:50%; display:flex; align-items:center; justify-content:center; background:#f9f9f9;">
            <span style="font-size:11px; color:#007a33; font-weight:bold;">شعار دولة الكويت</span>
          </div>
        </td>
        <td style="border:none; text-align:left; width:33%;"></td>
      </tr>
    </table>
  </div>

  <div class="title-section">
    <strong>إدارة الشؤون الإدارية</strong><br>
    مراقبة الدوام الإجازات والبعثات الدراسية<br>
    السيد / مراقب متابعة الدوام والبعثات الدراسية<br>
    المحترم ....
  </div>

  <div style="text-align:center; margin: 10px 0;">تحية طيبة وبعد...</div>

  <div class="form-title">نموذج نسيان بصمة</div>

  <div class="fields">
    <div class="field-line">القطاع: ${f.sector || ''}</div>
    <div class="field-line">الإدارة: ${f.directorate || ''}</div>
    <div class="field-line">القسم: ${f.department || ''}</div>
  </div>

  <table>
    <tr>
      <th>الاسم</th>
      <th>رقم الهوية</th>
      <th>الرقم المدني</th>
    </tr>
    <tr>
      <td>${f.employee_name || ''}</td>
      <td>${f.employee_number || ''}</td>
      <td>${f.employee_civil || ''}</td>
    </tr>
  </table>

  <div class="checkbox-row">
    <div class="checkbox-item">
      <span>بصمة التواجد</span>
      <div class="checkbox-box">${f.fingerprint_presence ? '✓' : ''}</div>
    </div>
    <div class="checkbox-item">
      <span>بصمة الانصراف</span>
      <div class="checkbox-box">${f.fingerprint_departure ? '✓' : ''}</div>
    </div>
  </div>

  <div class="fields">
    <div class="field-line">اليوم: ${f.day_name || ''}</div>
    <div class="field-line">التاريخ: ${formatDate(f.date)}</div>
  </div>

  <div class="signatures">
    <div class="sig-block">
      <div class="sig-title">اعتماد الرئيس المباشر</div>
      <div class="sig-box">${sigImg(f.supervisor_signature)}</div>
      <div style="margin-top:5px; font-size:11px;">${f.supervisor_name || ''}</div>
      <div style="font-size:11px;">${formatDate(f.supervisor_approved_at)}</div>
    </div>
    <div class="sig-block">
      <div class="sig-title">اعتماد المراقب</div>
      <div class="sig-box">${f.monitor_skipped ? '<span style="font-size:11px;">نفس الرئيس المباشر</span>' : sigImg(f.monitor_signature)}</div>
      <div style="margin-top:5px; font-size:11px;">${f.monitor_name || (f.monitor_skipped ? f.supervisor_name : '')}</div>
    </div>
  </div>

  <div style="text-align:center; margin-top:20px;">
    <div class="sig-title">اعتماد رئيس الشؤون الإدارية</div>
    <div class="sig-box" style="width:50%; margin:auto;">${sigImg(f.admin_signature)}</div>
    <div style="margin-top:5px; font-size:11px;">${f.admin_name || ''}</div>
    <div style="font-size:11px;">${formatDate(f.admin_approved_at)}</div>
  </div>

  <div class="no-print" style="text-align:center; margin-top:30px;">
    <button onclick="window.print()" style="padding:10px 30px; font-size:14px; cursor:pointer; background:#1a5276; color:white; border:none; border-radius:5px;">
      طباعة النموذج
    </button>
  </div>
</div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

module.exports = router;
