import type { Notification } from '../../types/notifications';

// Notificaciones mock para demostración
export const mockNotifications: Notification[] = [
  {
    id: 'notif_1',
    candidateId: 'candidate_1',
    applicationId: 'app_1',
    type: 'status_change',
    priority: 'high',
    title: '🎉 ¡Avanzaste a Evaluación Técnica!',
    message: 'Excelente noticia María! Tu CV fue aprobado para Desarrollador Full Stack en TechCorp LATAM. Ahora pasarás a la evaluación técnica. Te recomendamos repasar: React, Node.js, y bases de datos. Recibirás las instrucciones pronto. ¡Mucho éxito!',
    channels: ['whatsapp'],
    status: 'read',
    scheduledAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
    sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 2000),
    deliveredAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 3000),
    readAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // Leída hace 1 hora
    retryCount: 0,
    maxRetries: 3,
    metadata: {
      previousStatus: 'screening',
      newStatus: 'technical_evaluation',
      stageName: 'Evaluación Técnica',
      recruiterName: 'Ana García',
      companyName: 'TechCorp LATAM',
      positionTitle: 'Desarrollador Full Stack'
    }
  },
  {
    id: 'notif_2',
    candidateId: 'candidate_1',
    applicationId: 'app_2',
    type: 'status_change',
    priority: 'high',
    title: 'Resultado de tu Evaluación Técnica',
    message: 'Hola María, queremos agradecerte por el tiempo dedicado a la evaluación técnica para Frontend Developer. Aunque demostraste conocimientos sólidos, identificamos algunas áreas donde otros candidatos tuvieron un desempeño más alineado con nuestras necesidades actuales.\n\n🎯 Áreas de mejora identificadas:\n• Optimización de algoritmos y complejidad temporal\n• Patrones de diseño en aplicaciones escalables\n• Testing automatizado y TDD\n\n📚 Recursos recomendados:\n• "Clean Code" de Robert Martin\n• Curso de Algoritmos en Coursera\n• Práctica en HackerRank/CodeSignal\n\nTu dedicación es admirable. ¡Sigue creciendo y postúlate nuevamente pronto!',
    channels: ['whatsapp', 'email'],
    status: 'delivered',
    scheduledAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 día atrás
    sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000 + 1500),
    deliveredAt: new Date(Date.now() - 24 * 60 * 60 * 1000 + 2500),
    retryCount: 0,
    maxRetries: 3,
    metadata: {
      previousStatus: 'technical_evaluation',
      newStatus: 'rejected',
      stageName: 'Rechazado',
      recruiterName: 'Carlos Mendoza',
      companyName: 'StartupXYZ',
      positionTitle: 'Frontend Developer'
    }
  },
  {
    id: 'notif_3',
    candidateId: 'candidate_1',
    applicationId: 'app_1',
    type: 'interview_reminder',
    priority: 'medium',
    title: '⏰ Recordatorio: Entrevista Técnica Mañana',
    message: 'Hola María, te recordamos que tienes tu entrevista técnica mañana a las 10:00 AM para Desarrollador Full Stack en TechCorp LATAM. El enlace de la videollamada llegará 30 minutos antes. ¡Prepárate bien y mucho éxito!',
    channels: ['whatsapp', 'push'],
    status: 'sent',
    scheduledAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutos atrás
    sentAt: new Date(Date.now() - 30 * 60 * 1000 + 1000),
    retryCount: 0,
    maxRetries: 3,
    metadata: {
      recruiterName: 'Ana García',
      companyName: 'TechCorp LATAM',
      positionTitle: 'Desarrollador Full Stack'
    }
  },
  {
    id: 'notif_4',
    candidateId: 'candidate_1',
    applicationId: 'app_3',
    type: 'status_change',
    priority: 'high',
    title: '🎊 ¡FELICITACIONES! Has sido seleccionada',
    message: '¡Increíbles noticias María! Después de un proceso muy competitivo, has sido seleccionada para UX/UI Designer en DesignStudio Pro. El equipo quedó impresionado con tu desempeño. Pronto recibirás los detalles de la oferta formal. ¡Bienvenida al equipo!',
    channels: ['whatsapp', 'email', 'push'],
    status: 'delivered',
    scheduledAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 días atrás
    sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 2000),
    deliveredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 3500),
    readAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000), // Leída 5 min después
    retryCount: 0,
    maxRetries: 3,
    metadata: {
      previousStatus: 'interview_completed',
      newStatus: 'approved',
      stageName: 'Aprobado',
      recruiterName: 'Laura Rodríguez',
      companyName: 'DesignStudio Pro',
      positionTitle: 'UX/UI Designer'
    }
  }
];

// Función para inicializar notificaciones mock en el servicio
export const initializeMockNotifications = () => {
  // Esta función se puede llamar al inicializar la app para cargar datos de demostración
  console.log('📱 Notificaciones mock inicializadas');
};