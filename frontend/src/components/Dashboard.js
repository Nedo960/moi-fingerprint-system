import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import SubmitForm from './SubmitForm';
import FormsList from './FormsList';

export default function Dashboard() {
  const { user } = useAuth();
  const [refresh, setRefresh] = useState(0);

  return (
    <div className="main-content">
      {/* Welcome banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1a3a5c, #2471a3)',
        color: 'white', padding: '16px 20px', borderRadius: 10, marginBottom: 20
      }}>
        <div style={{ fontSize: 16, fontWeight: 'bold' }}>مرحباً، {user?.full_name}</div>
        <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>
          {user?.sector} — {user?.directorate} — {user?.department}
        </div>
      </div>

      {/* Employee: show submit form + their list */}
      {user?.role === 'employee' && (
        <>
          <SubmitForm onSubmitted={() => setRefresh(r => r + 1)} />
          <FormsList refresh={refresh} />
        </>
      )}

      {/* Approvers: show pending forms only */}
      {(user?.role === 'supervisor' || user?.role === 'monitor' || user?.role === 'admin') && (
        <FormsList refresh={refresh} />
      )}
    </div>
  );
}
