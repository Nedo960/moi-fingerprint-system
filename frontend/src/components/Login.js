import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import API from '../api';

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ employee_number: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await API.post('/auth/login', form);
      login(res.data.user, res.data.token);
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ، يرجى المحاولة مجدداً');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="logo-area">
          <div style={{ fontSize: 48 }}>🏛️</div>
          <h1>وزارة الإعلام</h1>
          <p>نظام نموذج نسيان البصمة</p>
          <p style={{ color: '#999', fontSize: 11, marginTop: 4 }}>دولة الكويت</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} style={{ marginTop: 20, textAlign: 'right' }}>
          <div className="form-group">
            <label>رقم الموظف</label>
            <input
              type="text"
              placeholder="أدخل رقم الموظف"
              value={form.employee_number}
              onChange={e => setForm({ ...form, employee_number: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>كلمة المرور</label>
            <input
              type="password"
              placeholder="أدخل كلمة المرور"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
            {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>

        <div style={{ marginTop: 24, padding: 12, background: '#f8f9fa', borderRadius: 6, fontSize: 12, textAlign: 'right' }}>
          <strong>حسابات تجريبية:</strong><br />
          موظف: 10001 / demo123<br />
          رئيس مباشر: 20001 / demo123<br />
          مراقب: 30001 / demo123<br />
          رئيس شؤون: 40001 / demo123
        </div>
      </div>
    </div>
  );
}
