import React, { useState } from 'react';
import './index.css';
import { AuthProvider, useAuth } from './AuthContext';
import Login from './components/Login';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Notifications from './components/Notifications';

function AppContent() {
  const { user } = useAuth();
  const [showNotifs, setShowNotifs] = useState(false);

  if (!user) return <Login />;

  return (
    <div className="app-container">
      <Navbar onNotifClick={() => setShowNotifs(true)} />
      <Dashboard />
      {showNotifs && <Notifications onClose={() => setShowNotifs(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
