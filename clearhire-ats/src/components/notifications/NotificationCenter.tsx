import React, { useState, useEffect } from 'react';
import { 
  X, Bell, Check, Clock, AlertCircle, Smartphone, Mail, Monitor, Filter, 
  BarChart3, Trash2, Download, Search, Calendar, Star
} from 'lucide-react';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';
import { notificationService } from '../../services/notificationService';
import NotificationAnalytics from './NotificationAnalytics';
import type { Notification, DeliveryChannel, NotificationType } from '../../types/notifications';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  candidateId: string;
  analytics?: any;
  onClearAll?: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  candidateId,
  analytics,
  onClearAll
}) => {
  const { triggerHaptic } = useHapticFeedback();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | NotificationType>('all');
  const [channelFilter, setChannelFilter] = useState<'all' | DeliveryChannel>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'notifications' | 'analytics'>('notifications');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'status'>('date');

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen, candidateId]);

  const loadNotifications = () => {
    const history = notificationService.getNotificationHistory(candidateId);
    setNotifications(history);
  };

  const handleMarkAsRead = (notificationId: string) => {
    triggerHaptic('light');
    notificationService.markAsRead(notificationId);
    loadNotifications();
  };

  const handleMarkAllAsRead = () => {
    triggerHaptic('medium');
    notifications
      .filter(n => n.status !== 'read')
      .forEach(n => notificationService.markAsRead(n.id));
    loadNotifications();
  };

  const handleClearAll = () => {
    triggerHaptic('warning');
    if (confirm('¿Estás seguro de que deseas limpiar todas las notificaciones? Esta acción no se puede deshacer.')) {
      onClearAll?.();
      loadNotifications();
    }
  };

  const handleExport = () => {
    triggerHaptic('light');
    const dataStr = JSON.stringify(notifications, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `notificaciones_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'read':
        return <Check className="w-4 h-4 text-success-500" />;
      case 'sending':
      case 'queued':
        return <Clock className="w-4 h-4 text-warning-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-danger-500" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getChannelIcon = (channel: DeliveryChannel) => {
    switch (channel) {
      case 'whatsapp':
        return <Smartphone className="w-4 h-4 text-green-500" />;
      case 'email':
        return <Mail className="w-4 h-4 text-blue-500" />;
      case 'push':
        return <Monitor className="w-4 h-4 text-purple-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-danger-500 bg-danger-50 dark:bg-danger-900/20';
      case 'medium':
        return 'border-l-warning-500 bg-warning-50 dark:bg-warning-900/20';
      case 'low':
        return 'border-l-slate-500 bg-slate-50 dark:bg-slate-800/50';
      default:
        return 'border-l-slate-300 bg-white dark:bg-slate-800';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `Hace ${minutes}m`;
    if (hours < 24) return `Hace ${hours}h`;
    if (days < 7) return `Hace ${days}d`;
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredNotifications = notifications
    .filter(notification => {
      const typeMatch = filter === 'all' || notification.type === filter;
      const channelMatch = channelFilter === 'all' || notification.channels.includes(channelFilter);
      const searchMatch = searchTerm === '' || 
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.metadata.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.metadata.positionTitle?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return typeMatch && channelMatch && searchMatch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'status':
          return a.status.localeCompare(b.status);
        case 'date':
        default:
          return b.scheduledAt.getTime() - a.scheduledAt.getTime();
      }
    });

  const unreadCount = notifications.filter(n => n.status !== 'read' && n.status !== 'failed').length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-primary-50 to-blue-50 dark:from-slate-800 dark:to-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Centro de Notificaciones
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {notifications.length} notificaciones • {unreadCount} sin leer
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Tabs */}
            <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1 mr-4">
              <button
                onClick={() => setActiveTab('notifications')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'notifications'
                    ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <Bell className="w-4 h-4 inline mr-1" />
                Notificaciones
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'analytics'
                    ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <BarChart3 className="w-4 h-4 inline mr-1" />
                Analytics
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {activeTab === 'notifications' && (
                <>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="p-2 text-slate-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                      title="Marcar todas como leídas"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  
                  <button
                    onClick={handleExport}
                    className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                    title="Exportar notificaciones"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  
                  {notifications.length > 0 && (
                    <button
                      onClick={handleClearAll}
                      className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      title="Limpiar todas"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </>
              )}
              
              <button
                onClick={onClose}
                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'notifications' ? (
          <>
            {/* Filters and Search */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-4 flex-wrap mb-3">
                {/* Search */}
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Buscar notificaciones..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Filtros:</span>
                </div>
                
                {/* Type Filter */}
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="px-3 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                >
                  <option value="all">Todos los tipos</option>
                  <option value="status_change">Cambios de estado</option>
                  <option value="interview_reminder">Recordatorios</option>
                  <option value="deadline_alert">Alertas</option>
                  <option value="feedback_available">Feedback</option>
                </select>

                {/* Channel Filter */}
                <select
                  value={channelFilter}
                  onChange={(e) => setChannelFilter(e.target.value as any)}
                  className="px-3 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                >
                  <option value="all">Todos los canales</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="email">Email</option>
                  <option value="push">Push</option>
                </select>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                >
                  <option value="date">Por fecha</option>
                  <option value="priority">Por prioridad</option>
                  <option value="status">Por estado</option>
                </select>
              </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
              {filteredNotifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-500 dark:text-slate-400">
                    {searchTerm ? 'No se encontraron notificaciones con ese término' : 'No hay notificaciones que mostrar'}
                  </p>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="mt-2 text-sm text-primary-600 hover:text-primary-700"
                    >
                      Limpiar búsqueda
                    </button>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-l-4 ${getPriorityColor(notification.priority)} ${
                        notification.status === 'read' ? 'opacity-75' : ''
                      } hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          {/* Header */}
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className={`font-semibold text-sm ${
                              notification.status === 'read' 
                                ? 'text-slate-600 dark:text-slate-400' 
                                : 'text-slate-900 dark:text-slate-100'
                            }`}>
                              {notification.title}
                            </h3>
                            {notification.status !== 'read' && (
                              <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                            )}
                            {notification.priority === 'high' && (
                              <Star className="w-3 h-3 text-red-500" />
                            )}
                          </div>

                          {/* Message */}
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 leading-relaxed line-clamp-3">
                            {notification.message}
                          </p>

                          {/* Metadata */}
                          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-500 flex-wrap">
                            <div className="flex items-center gap-1">
                              {getStatusIcon(notification.status)}
                              <span className="capitalize">{notification.status}</span>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              {getChannelIcon(notification.channels[0])}
                              <span className="capitalize">{notification.channels[0]}</span>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{formatTime(notification.scheduledAt)}</span>
                            </div>
                            
                            {notification.metadata.companyName && (
                              <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs">
                                {notification.metadata.companyName}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {notification.status !== 'read' && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors"
                              title="Marcar como leída"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          /* Analytics Tab */
          <div className="p-6 overflow-y-auto flex-1">
            {analytics ? (
              <NotificationAnalytics analytics={analytics} />
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <p className="text-slate-500 dark:text-slate-400">
                  Cargando analytics...
                </p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Actualizado automáticamente</span>
            <span>Configurar preferencias en Ajustes</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;