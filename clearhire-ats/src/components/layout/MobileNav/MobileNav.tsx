import React from 'react';
import { Home, Award, User, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface MobileNavProps {
  activeTab?: 'dashboard' | 'badges' | 'profile' | 'settings';
  onTabChange?: (tab: 'dashboard' | 'badges' | 'profile' | 'settings') => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ 
  activeTab = 'dashboard',
  onTabChange 
}) => {
  const navigate = useNavigate();

  const handleTabClick = (tabId: 'dashboard' | 'badges' | 'profile' | 'settings') => {
    onTabChange?.(tabId);
    
    // Navigate to the appropriate page
    switch (tabId) {
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

  const tabs = [
    { id: 'dashboard' as const, label: 'Inicio', icon: Home },
    { id: 'badges' as const, label: 'Insignias', icon: Award },
    { id: 'profile' as const, label: 'Perfil', icon: User },
    { id: 'settings' as const, label: 'Ajustes', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-700 safe-area-inset-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`
                flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl
                transition-all duration-200 min-w-[64px] min-h-[56px]
                active:scale-95
                ${isActive 
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }
              `}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
              <span className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;
