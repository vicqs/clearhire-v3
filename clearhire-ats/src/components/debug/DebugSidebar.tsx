/**
 * Sidebar de Debug Desplegable
 * Panel lateral que contiene herramientas de desarrollo
 */
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Settings, Database, Bell, Wifi, Activity, ToggleLeft, Search } from 'lucide-react';
import { AuthDebugPanel } from '../auth/AuthDebugPanel';
import { NotificationDemo } from './NotificationDemo';
import { SupabaseStatus } from './SupabaseStatus';
import { ConnectionTest } from './ConnectionTest';
import { SupabaseToggle } from './SupabaseToggle';
import { SupabaseDiagnostic } from './SupabaseDiagnostic';
import { SupabaseProjectChecker } from './SupabaseProjectChecker';

interface DebugSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  component: React.ReactNode;
}

interface DebugSidebarProps {
  onSimulateStatusChange?: (status: string) => void;
  onScheduleInterviewReminder?: () => void;
  onSendDeadlineAlert?: () => void;
  onSendFeedbackNotification?: () => void;
}

export const DebugSidebar: React.FC<DebugSidebarProps> = ({
  onSimulateStatusChange,
  onScheduleInterviewReminder,
  onSendDeadlineAlert,
  onSendFeedbackNotification
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const sections: DebugSection[] = [
    {
      id: 'status',
      title: 'Estado General',
      icon: <Activity className="w-4 h-4" />,
      component: <ConnectionTest />
    },
    {
      id: 'diagnostic',
      title: 'Diagnóstico CORS',
      icon: <Search className="w-4 h-4" />,
      component: <SupabaseDiagnostic />
    },
    {
      id: 'project-checker',
      title: 'Verificar Proyecto',
      icon: <Database className="w-4 h-4" />,
      component: <SupabaseProjectChecker />
    },
    {
      id: 'toggle',
      title: 'Control de Modo',
      icon: <ToggleLeft className="w-4 h-4" />,
      component: <SupabaseToggle />
    },
    {
      id: 'supabase',
      title: 'Estado Supabase',
      icon: <Wifi className="w-4 h-4" />,
      component: <SupabaseStatus />
    },
    {
      id: 'auth',
      title: 'Autenticación',
      icon: <Database className="w-4 h-4" />,
      component: <AuthDebugPanel />
    },
    {
      id: 'notifications',
      title: 'Notificaciones',
      icon: <Bell className="w-4 h-4" />,
      component: (
        <NotificationDemo
          onSimulateStatusChange={onSimulateStatusChange}
          onScheduleInterviewReminder={onScheduleInterviewReminder}
          onSendDeadlineAlert={onSendDeadlineAlert}
          onSendFeedbackNotification={onSendFeedbackNotification}
        />
      )
    }
  ];

  const toggleSection = (sectionId: string) => {
    if (activeSection === sectionId) {
      setActiveSection(null);
    } else {
      setActiveSection(sectionId);
      if (!isOpen) {
        setIsOpen(true);
      }
    }
  };

  return (
    <>
      {/* Overlay para cerrar en móvil */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed right-0 top-0 h-full bg-white border-l border-gray-200 shadow-lg z-50 transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        
        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`absolute -left-12 top-4 bg-gradient-to-l from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-l-lg p-3 shadow-lg hover:shadow-xl transition-all duration-300 group ${
            isOpen ? 'translate-x-0' : 'translate-x-1'
          }`}
          title={isOpen ? 'Cerrar panel debug' : 'Abrir panel debug'}
        >
          <div className="flex items-center gap-1">
            {isOpen ? (
              <ChevronRight className="w-4 h-4 group-hover:scale-110 transition-transform" />
            ) : (
              <>
                <Settings className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                <ChevronLeft className="w-3 h-3 group-hover:scale-110 transition-transform" />
              </>
            )}
          </div>
          
          {/* Indicador de modo */}
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse" 
               title="Modo desarrollo activo" />
        </button>

        {/* Sidebar Content */}
        <div className="w-80 md:w-96 h-full flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-600" />
              <h2 className="font-semibold text-gray-800">Panel de Debug</h2>
            </div>
            <p className="text-xs text-gray-600 mt-1">Solo visible en desarrollo</p>
          </div>

          {/* Sections */}
          <div className="flex-1 overflow-y-auto">
            {sections.map((section) => (
              <div key={section.id} className="border-b border-gray-200">
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-colors flex items-center justify-between ${
                    activeSection === section.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {section.icon}
                    <span className="font-medium text-gray-700">{section.title}</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${
                    activeSection === section.id ? 'rotate-90' : ''
                  }`} />
                </button>

                {/* Section Content */}
                {activeSection === section.id && (
                  <div className="p-4 bg-gray-50 border-t border-gray-100">
                    {section.component}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="text-xs text-gray-500 text-center">
              <p>ClearHire ATS v1.0.0</p>
              <p>Modo Desarrollo</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};