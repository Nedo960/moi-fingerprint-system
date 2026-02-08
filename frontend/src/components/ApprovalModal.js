import React, { useRef, useState } from 'react';
import API from '../api';
import SignaturePad from './SignaturePad';
const formatDate = (d) => d ? new Date(d).toLocaleDateString('ar-KW') : '-';

export default function ApprovalModal({ form, onClose, onDone }) {
  const sigRef = useRef(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const getStepStatus = (step) => {
    const order = ['pending_supervisor', 'pending_monitor', 'pending_admin', 'approved'];
    const idx = order.indexOf(form.status);
    const stepIdx = { supervisor: 0, monitor: 1, admin: 2 }[step];
    if (idx > stepIdx) return 'done';
    if (idx === stepIdx) return 'active';
    return 'pending';
  };

  const handleApprove = async () => {
    if (sigRef.current?.isEmpty()) {
      setError('يرجى التوقيع أولاً قبل الاعتماد');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const signature = sigRef.current.toDataURL();
      await API.post(`/forms/${form.id}/approve`, { signature });
      onDone();
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setError('');
    setLoading(true);
    try {
      await API.post(`/forms/${form.id}/reject`, { reason: rejectReason });
      onDone();
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16
    }}>
      <div style={{
        background: 'white', borderRadius: 12, padding: 24,
        width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ color: '#1a3a5c' }}>مراجعة نموذج نسيان بصمة</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>✕</button>
        </div>

        {/* Steps */}
        <div className="steps">
          <div className="step">
            <div className={`step-dot ${getStepStatus('supervisor')}`}>1</div>
            <span>الرئيس المباشر</span>
          </div>
          <div className={`step-line ${getStepStatus('supervisor') === 'done' ? 'done' : ''}`}></div>
          <div className="step">
            <div className={`step-dot ${getStepStatus('monitor')}`}>2</div>
            <span>المراقب</span>
          </div>
          <div className={`step-line ${getStepStatus('monitor') === 'done' ? 'done' : ''}`}></div>
          <div className="step">
            <div className={`step-dot ${getStepStatus('admin')}`}>3</div>
            <span>رئيس الشؤون</span>
          </div>
        </div>

        {/* Form Details */}
        <div style={{ background: '#f8f9fa', padding: 14, borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div><strong>الموظف:</strong> {form.employee_name}</div>
            <div><strong>التاريخ:</strong> {form.day_name} {formatDate(form.date)}</div>
            <div><strong>القطاع:</strong> {form.sector}</div>
            <div><strong>الإدارة:</strong> {form.directorate}</div>
            <div><strong>القسم:</strong> {form.department}</div>
            <div>
              <strong>البصمة:</strong>
              {form.fingerprint_presence && ' التواجد'}
              {form.fingerprint_departure && ' الانصراف'}
            </div>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {!rejectMode ? (
          <>
            <SignaturePad ref={sigRef} label="التوقيع الإلكتروني (وقّع للاعتماد)" />
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button className="btn btn-success" onClick={handleApprove} disabled={loading} style={{ flex: 1 }}>
                {loading ? 'جاري الحفظ...' : '✓ اعتماد'}
              </button>
              <button className="btn btn-danger" onClick={() => setRejectMode(true)} disabled={loading} style={{ flex: 1 }}>
                ✗ رفض
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="form-group">
              <label>سبب الرفض</label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="أدخل سبب الرفض..."
                style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 6, fontFamily: 'inherit', direction: 'rtl' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-danger" onClick={handleReject} disabled={loading} style={{ flex: 1 }}>
                {loading ? 'جاري الحفظ...' : 'تأكيد الرفض'}
              </button>
              <button className="btn btn-secondary" onClick={() => setRejectMode(false)} disabled={loading} style={{ flex: 1 }}>
                إلغاء
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
