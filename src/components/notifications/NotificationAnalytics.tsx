import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Smartphone, 
  Mail, 
  Monitor,
  Target
} from 'lucide-react';

interface NotificationAnalyticsProps {
  analytics: {
    totalSent: number;
    totalRead: number;
    totalFailed: number;
    deliveryRates: Record<string, number>;
    readRates: Record<string, number>;
    averageReadTime: number;
    engagementScore: number;
  };
  className?: string;
}

const NotificationAnalytics: React.FC<NotificationAnalyticsProps> = ({
  analytics,
  className = ''
}) => {
  const formatPercentage = (value: number) => `${Math.round(value * 100)}%`;
  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${Math.round(minutes)}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'whatsapp':
        return <Smartphone className="w-4 h-4 text-green-500" />;
      case 'email':
        return <Mail className="w-4 h-4 text-blue-500" />;
      case 'push':
        return <Monitor className="w-4 h-4 text-purple-500" />;
      default:
        return null;
    }
  };

  const getChannelName = (channel: string) => {
    switch (channel) {
      case 'whatsapp':
        return 'WhatsApp';
      case 'email':
        return 'Email';
      case 'push':
        return 'Push';
      default:
        return channel;
    }
  };

  const getEngagementColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
    if (score >= 40) return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30';
    return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Analytics de Notificaciones
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Métricas de engagement y efectividad
          </p>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total enviadas */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Enviadas</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {analytics.totalSent}
          </p>
        </div>

        {/* Total leídas */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Leídas</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {analytics.totalRead}
          </p>
        </div>

        {/* Total fallidas */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Fallidas</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {analytics.totalFailed}
          </p>
        </div>

        {/* Tiempo promedio de lectura */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Tiempo Lectura</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {formatTime(analytics.averageReadTime)}
          </p>
        </div>
      </div>

      {/* Score de engagement */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            <h4 className="font-semibold text-slate-900 dark:text-slate-100">Score de Engagement</h4>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getEngagementColor(analytics.engagementScore)}`}>
            {analytics.engagementScore}%
          </span>
        </div>
        
        {/* Barra de progreso */}
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 mb-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${analytics.engagementScore}%` }}
          />
        </div>
        
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {analytics.engagementScore >= 80 && "¡Excelente! Tus notificaciones tienen muy buen engagement."}
          {analytics.engagementScore >= 60 && analytics.engagementScore < 80 && "Buen engagement. Hay oportunidades de mejora."}
          {analytics.engagementScore >= 40 && analytics.engagementScore < 60 && "Engagement moderado. Considera ajustar tus preferencias."}
          {analytics.engagementScore < 40 && "Engagement bajo. Revisa tus canales de notificación preferidos."}
        </p>
      </div>

      {/* Métricas por canal */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Rendimiento por Canal
        </h4>
        
        <div className="space-y-4">
          {Object.entries(analytics.deliveryRates).map(([channel, deliveryRate]) => {
            const readRate = analytics.readRates[channel] || 0;
            
            return (
              <div key={channel} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  {getChannelIcon(channel)}
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {getChannelName(channel)}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-center">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      {formatPercentage(deliveryRate)}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Entrega</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      {formatPercentage(readRate)}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Lectura</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Insights y recomendaciones */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
          💡 Insights y Recomendaciones
        </h4>
        
        <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          {analytics.readRates.whatsapp > analytics.readRates.email && (
            <p>• WhatsApp tiene mejor tasa de lectura que email. Considera priorizarlo.</p>
          )}
          
          {analytics.averageReadTime < 30 && (
            <p>• Tus notificaciones se leen muy rápido. ¡Excelente relevancia!</p>
          )}
          
          {analytics.averageReadTime > 120 && (
            <p>• Las notificaciones tardan en leerse. Considera horarios más convenientes.</p>
          )}
          
          {analytics.totalFailed > analytics.totalSent * 0.1 && (
            <p>• Alta tasa de fallos. Verifica tus datos de contacto.</p>
          )}
          
          {analytics.engagementScore < 50 && (
            <p>• Bajo engagement. Revisa la frecuencia y tipos de notificaciones habilitadas.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationAnalytics;