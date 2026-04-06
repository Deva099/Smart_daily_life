import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const DashboardView = ({ setActiveView }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const { user } = useAuth();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Dashboard View</h2>
      <p>Mobile: {isMobile ? 'Yes' : 'No'}</p>
      <p>User: {user?.name || 'Guest'}</p>
    </div>
  );
};

export default DashboardView;
