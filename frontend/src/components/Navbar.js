import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import API from '../api';

const roleLabel = {
  employee: 'موظف',
  supervisor: 'رئيس مباشر',
  monitor: 'مراقب',
  admin: 'رئيس الشؤون الإدارية'
};

export default function Navbar({ onNotifClick }) {
  const { user, logout } = useAuth();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await API.get('/notifications');
        setUnread(res.data.filter(n => !n.is_read).length);
      } catch {}
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="navbar">
      <div className="brand">🏛️ نظام نسيان البصمة - وزارة الإعلام</div>
      <div className="user-info">
        <span>{user?.full_name}</span>
        <span style={{ opacity: 0.7, fontSize: 12 }}>({roleLabel[user?.role]})</span>
        <div className="notif-bell" onClick={onNotifClick}>
          🔔
          {unread > 0 && <span className="notif-count">{unread}</span>}
        </div>
        <button className="logout-btn" onClick={logout}>خروج</button>
      </div>
    </nav>
  );
}
