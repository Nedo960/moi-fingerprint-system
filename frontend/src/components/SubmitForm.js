import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import API from '../api';

const DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export default function SubmitForm({ onSubmitted }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    sector: '',
    directorate: '',
    department: '',
    day_name: '',
    date: '',
    fingerprint_presence: false,
    fingerprint_departure: false
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDateChange = (e) => {
    const dateVal = e.target.value;
    if (dateVal) {
      const d = new Date(dateVal);
      setForm({ ...form, date: dateVal, day_name: DAYS[d.getDay()] });
    } else {
      setForm({ ...form, date: dateVal, day_name: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.fingerprint_presence && !form.fingerprint_departure) {
      setError('يرجى تحديد نوع البصمة المنسية (التواجد أو الانصراف)');
      return;
    }

    setLoading(true);
    try {
      await API.post('/forms', form);
      setSuccess('تم تقديم النموذج بنجاح! سيتم إشعار الرئيس المباشر للمراجعة.');
      setForm({
        sector: user?.sector || '',
        directorate: user?.directorate || '',
        department: user?.department || '',
        day_name: '',
        date: '',
        fingerprint_presence: false,
        fingerprint_departure: false
      });
      if (onSubmitted) onSubmitted();
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ، يرجى المحاولة مجدداً');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-title">📝 تقديم نموذج نسيان بصمة</div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group">
            <label>القطاع</label>
            <input
              type="text"
              value={form.sector}
              onChange={e => setForm({ ...form, sector: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>الإدارة</label>
            <input
              type="text"
              value={form.directorate}
              onChange={e => setForm({ ...form, directorate: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>القسم</label>
          <input
            type="text"
            value={form.department}
            onChange={e => setForm({ ...form, department: e.target.value })}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group">
            <label>التاريخ</label>
            <input
              type="date"
              value={form.date}
              onChange={handleDateChange}
              required
            />
          </div>
          <div className="form-group">
            <label>اليوم</label>
            <input type="text" value={form.day_name} readOnly style={{ background: '#f5f5f5' }} />
          </div>
        </div>

        <div className="form-group">
          <label>نوع البصمة المنسية</label>
          <div className="checkbox-group" style={{ marginTop: 8 }}>
            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={form.fingerprint_presence}
                onChange={e => setForm({ ...form, fingerprint_presence: e.target.checked })}
              />
              بصمة التواجد
            </label>
            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={form.fingerprint_departure}
                onChange={e => setForm({ ...form, fingerprint_departure: e.target.checked })}
              />
              بصمة الانصراف
            </label>
          </div>
        </div>

        <div style={{ background: '#f8f9fa', padding: 12, borderRadius: 6, marginBottom: 16, fontSize: 13 }}>
          <strong>بيانات الموظف:</strong><br />
          الاسم: {user?.full_name} | رقم الهوية: {user?.employee_number} | الرقم المدني: {user?.civil_number}
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'جاري الإرسال...' : 'تقديم النموذج'}
        </button>
      </form>
    </div>
  );
}
