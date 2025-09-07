import React, { useState, useEffect } from 'react';
import UserDashboard from '../components/UserDashboard';
import SimpleLogin from '../components/SimpleLogin';

export default function DashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const authStatus = localStorage.getItem('dashboardAuth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    localStorage.setItem('dashboardAuth', 'true');
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <SimpleLogin onLogin={handleLogin} />;
  }

  return <UserDashboard />;
}