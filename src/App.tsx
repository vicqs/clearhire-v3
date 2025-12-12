import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Badges from './pages/Badges';
import Settings from './pages/Settings';
import Offers from './pages/Offers';
import MobileNav from './components/layout/MobileNav';
import { NotificationProvider } from './components/notifications/NotificationProvider';
import { ThemeProvider } from './contexts/ThemeContext';
import { ConnectionAlert } from './components/debug/ConnectionAlert';

import './utils/testSupabaseConnection'; // Herramienta de diagnóstico

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveTab = (): 'dashboard' | 'badges' | 'profile' | 'settings' => {
    const path = location.pathname;
    if (path === '/') return 'dashboard';
    if (path === '/badges') return 'badges';
    if (path === '/profile') return 'profile';
    if (path === '/settings') return 'settings';
    return 'dashboard';
  };

  const handleTabChange = (tab: 'dashboard' | 'badges' | 'profile' | 'settings') => {
    switch (tab) {
      case 'dashboard':
        navigate('/');
        break;
      case 'badges':
        navigate('/badges');
        break;
      case 'profile':
        navigate('/profile');
        break;
      case 'settings':
        navigate('/settings');
        break;
    }
  };

  return (
    <>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/badges" element={<Badges />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/offers" element={<Offers />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <MobileNav activeTab={getActiveTab()} onTabChange={handleTabChange} />
      <ConnectionAlert />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
