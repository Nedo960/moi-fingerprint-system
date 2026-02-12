import React, { useState, useEffect } from 'react';
import API from '../api';
import { useAuth } from '../AuthContext';
import ApprovalModal from './ApprovalModal';

const statusLabel = {
  pending_supervisor: 'بانتظار الرئيس المباشر',
  pending_monitor: 'بانتظار المراقب',
  pending_admin: 'بانتظار رئيس الشؤون',
  approved: 'مكتمل ✓',
  rejected: 'مرفوض ✗'
};

const statusClass = {
  pending_supervisor: 'badge-pending',
  pending_monitor: 'badge-pending',
  pending_admin: 'badge-pending',
  approved: 'badge-approved',
  rejected: 'badge-rejected'
};

const formatDate = (d) => {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('ar-KW');
};

export default function FormsList({ refresh }) {
  const { user } = useAuth();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedForm, setSelectedForm] = useState(null);

  const fetchForms = async () => {
    try {
      const res = await API.get('/forms');
      setForms(res.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchForms(); }, [refresh]);

  const handleDelete = async (formId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الطلب؟')) return;
    try {
      await API.delete(`/forms/${formId}`);
      fetchForms();
    } catch (err) {
      alert(err.response?.data?.message || 'حدث خطأ أثناء الحذف');
    }
  };

  const handleApproved = () => {
    setSelectedForm(null);
    fetchForms();
  };

  const printForm = (formId) => {
    window.open(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/pdf/${formId}`, '_blank');
  };

  if (loading) return <div className="card" style={{ textAlign: 'center', padding: 40 }}>جاري التحميل...</div>;

  const title = user?.role === 'employee' ? 'نماذجي' :
    user?.role === 'supervisor' ? 'طلبات بانتظار موافقتي (الرئيس المباشر)' :
    user?.role === 'monitor' ? 'طلبات بانتظار موافقتي (المراقب)' :
    'جميع النماذج';

  return (
    <div className="card">
      <div className="card-title">📋 {title}</div>

      {forms.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 30, color: '#999' }}>لا توجد نماذج</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                {user?.role !== 'employee' && <th>الموظف</th>}
                <th>التاريخ</th>
                <th>القسم</th>
                <th>نوع البصمة</th>
                <th>الحالة</th>
                <th>إجراء</th>
              </tr>
            </thead>
            <tbody>
              {forms.map(f => (
                <tr key={f.id}>
                  {user?.role !== 'employee' && <td>{f.employee_name}</td>}
                  <td>{f.day_name} {formatDate(f.date)}</td>
                  <td>{f.department}</td>
                  <td>
                    {f.fingerprint_presence && <span>التواجد </span>}
                    {f.fingerprint_departure && <span>الانصراف</span>}
                  </td>
                  <td><span className={`badge ${statusClass[f.status]}`}>{statusLabel[f.status]}</span></td>
                  <td>
                    {f.status === 'approved' ? (
                      <button className="btn btn-outline" style={{ padding: '4px 12px', fontSize: 12 }} onClick={() => printForm(f.id)}>
                        🖨️ طباعة
                      </button>
                    ) : user?.role === 'employee' && f.status === 'pending_supervisor' ? (
                      <button className="btn btn-danger" style={{ padding: '4px 12px', fontSize: 12 }} onClick={() => handleDelete(f.id)}>
                        حذف
                      </button>
                    ) : (
                      (user?.role !== 'employee') && (
                        <button className="btn btn-primary" style={{ padding: '4px 12px', fontSize: 12 }} onClick={() => setSelectedForm(f)}>
                          مراجعة
                        </button>
                      )
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedForm && (
        <ApprovalModal
          form={selectedForm}
          onClose={() => setSelectedForm(null)}
          onDone={handleApproved}
        />
      )}
    </div>
  );
}
