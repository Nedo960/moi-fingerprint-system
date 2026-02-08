import React, { useState, useEffect } from 'react';
import API from '../api';

export default function Notifications({ onClose }) {
  const [notifs, setNotifs] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await API.get('/notifications');
        setNotifs(res.data);
        await API.put('/notifications/read-all');
      } catch {}
    };
    fetch();
  }, []);

  const formatTime = (d) => {
    if (!d) return '';
    const date = new Date(d);
    return date.toLocaleString('ar-KW');
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', display: 'flex',
      alignItems: 'flex-start', justifyContent: 'flex-end', zIndex: 1000
    }} onClick={onClose}>
      <div style={{
        background: 'white', width: 340, maxHeight: '100vh',
        overflowY: 'auto', padding: 0, boxShadow: '-4px 0 20px rgba(0,0,0,0.15)'
      }} onClick={e => e.stopPropagation()}>
        <div style={{
          padding: '16px 20px', background: '#1a3a5c', color: 'white',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <strong>الإشعارات</strong>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', fontSize: 18, cursor: 'pointer' }}>✕</button>
        </div>

        {notifs.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>لا توجد إشعارات</div>
        ) : (
          notifs.map(n => (
            <div key={n.id} style={{
              padding: '12px 16px',
              borderBottom: '1px solid #eee',
              background: n.is_read ? 'white' : '#e8f4f8',
              fontSize: 13
            }}>
              <div>{n.message}</div>
              <div style={{ color: '#999', fontSize: 11, marginTop: 4 }}>{formatTime(n.created_at)}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
