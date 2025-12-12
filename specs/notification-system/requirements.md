# Requirements Document

## Introduction

El Sistema de Notificaciones Automáticas y Explicativas es un componente crítico del ClearHire ATS que garantiza que los candidatos reciban comunicación oportuna, transparente y empática sobre cambios en el estado de sus postulaciones. Este sistema implementa notificaciones multicanal (WhatsApp, email, push) con mensajes personalizados y explicativos que mantienen a los candidatos informados en tiempo real, reduciendo la ansiedad y mejorando la experiencia del usuario durante todo el proceso de reclutamiento.

## Glossary

- **Notification System**: El sistema completo que gestiona el envío automático de notificaciones multicanal
- **Status Change Event**: Evento que se dispara cuando el estado de una postulación cambia (avance o rechazo)
- **Notification Template**: Plantilla de mensaje personalizable según el tipo de cambio de estado
- **Delivery Channel**: Canal de entrega de notificaciones (WhatsApp, email, push notification)
- **Notification Queue**: Cola de notificaciones pendientes de envío con sistema de reintentos
- **Candidate Preferences**: Configuración del candidato sobre qué notificaciones recibir y por qué canales
- **Notification History**: Historial completo de todas las notificaciones enviadas a un candidato
- **Auto-Explanation Engine**: Motor que genera explicaciones automáticas contextuales para cambios de estado
- **Delivery Status**: Estado de entrega de una notificación (enviada, entregada, leída, fallida)
- **Notification Analytics**: Métricas sobre efectividad y engagement de las notificaciones
- **Escalation Rules**: Reglas para reenvío automático si una notificación no es leída en tiempo determinado
- **Personalization Engine**: Motor que personaliza mensajes según el perfil y historial del candidato

## Requirements

### Requirement 1: Detección Automática de Cambios de Estado

**User Story:** Como sistema automatizado, quiero detectar inmediatamente cuando el estado de una postulación cambia (avance o rechazo), para disparar las notificaciones correspondientes sin intervención manual.

#### Acceptance Criteria

1. WHEN an application status changes from any state to another, THE Notification System SHALL automatically detect the change within 5 seconds
2. THE Notification System SHALL identify the type of change: advancement (positive), rejection (negative), or neutral update
3. THE Notification System SHALL capture contextual information including previous status, new status, stage name, recruiter responsible, and timestamp
4. THE Notification System SHALL queue the notification for processing with priority based on change type (rejections = high priority, advancements = medium priority, updates = low priority)
5. THE Notification System SHALL prevent duplicate notifications by checking if the same status change has already been processed for the same application

### Requirement 2: Notificaciones Multicanal Inteligentes

**User Story:** Como candidato, quiero recibir notificaciones sobre cambios en mi postulación a través de mis canales preferidos (WhatsApp, email, push), para estar siempre informado usando los medios de comunicación que más uso.

#### Acceptance Criteria

1. THE Notification System SHALL support three delivery channels: WhatsApp, email, and push notifications
2. THE Notification System SHALL respect candidate preferences for each channel stored in their profile settings
3. WHEN a candidate has WhatsApp enabled, THE Notification System SHALL send messages using WhatsApp Business API with formatted text and emojis
4. WHEN a candidate has email enabled, THE Notification System SHALL send HTML-formatted emails with ClearHire branding and responsive design
5. WHEN a candidate has push notifications enabled, THE Notification System SHALL send browser push notifications with action buttons
6. THE Notification System SHALL attempt delivery in order of preference: WhatsApp first, then email, then push notifications
7. THE Notification System SHALL implement fallback delivery: if primary channel fails, automatically try secondary channels

### Requirement 3: Mensajes Explicativos y Empáticos

**User Story:** Como candidato que recibe una notificación de cambio de estado, quiero entender claramente qué pasó, por qué pasó, y cuáles son mis próximos pasos, para reducir mi ansiedad y saber cómo proceder.

#### Acceptance Criteria

1. THE Auto-Explanation Engine SHALL generate contextual explanations for each type of status change using predefined templates
2. WHEN a candidate advances to the next stage, THE notification message SHALL include: congratulations, new stage name, what to expect, estimated timeline, and next actions required
3. WHEN a candidate is rejected, THE notification message SHALL include: empathetic opening, reason category, specific feedback, growth recommendations, and encouragement for future opportunities
4. THE notification messages SHALL use warm, human language avoiding corporate jargon or robotic phrasing
5. THE notification messages SHALL be personalized with candidate name, position title, company name, and relevant stage-specific information
6. THE notification messages SHALL include clear call-to-action buttons or links directing candidates to relevant sections in the app
7. THE notification messages SHALL be culturally appropriate for LATAM market with Spanish/Portuguese language support

### Requirement 4: Notificaciones de Avance con Información Útil

**User Story:** Como candidato que avanza a la siguiente etapa, quiero recibir una notificación que me explique qué significa esta nueva etapa, qué debo hacer, y cuánto tiempo tomará, para prepararme adecuadamente.

#### Acceptance Criteria

1. WHEN a candidate advances to "Revisión de CV", THE notification SHALL explain that their resume is being reviewed by HR and provide an estimated timeline of 3-5 business days
2. WHEN a candidate advances to "Evaluación Técnica", THE notification SHALL explain the technical assessment process, provide preparation tips, and include scheduling instructions
3. WHEN a candidate advances to "Entrevista con RH", THE notification SHALL explain the HR interview format, typical questions, and provide scheduling options
4. WHEN a candidate advances to "Entrevista Técnica", THE notification SHALL explain the technical interview format, suggest preparation resources, and include scheduling instructions
5. WHEN a candidate advances to "Entrevista Final", THE notification SHALL explain this is the final decision stage, who they'll meet, and what to expect
6. THE advancement notifications SHALL include estimated duration for each stage based on historical company data
7. THE advancement notifications SHALL include preparation tips and resources specific to each stage type

### Requirement 5: Notificaciones de Rechazo con Feedback Constructivo

**User Story:** Como candidato rechazado, quiero recibir una notificación que me explique las razones específicas del rechazo y me proporcione recomendaciones concretas para mejorar, para aprender de la experiencia y tener éxito en futuras postulaciones.

#### Acceptance Criteria

1. WHEN a candidate is rejected at "Revisión de CV" stage, THE notification SHALL explain common CV issues and provide improvement suggestions
2. WHEN a candidate is rejected at "Evaluación Técnica" stage, THE notification SHALL include specific skill gaps identified and recommend learning resources
3. WHEN a candidate is rejected at interview stages, THE notification SHALL provide feedback on interview performance and communication tips
4. THE rejection notifications SHALL include at least 3 specific, actionable recommendations for improvement
5. THE rejection notifications SHALL suggest relevant courses, certifications, or resources available in Spanish/Portuguese
6. THE rejection notifications SHALL maintain an encouraging tone emphasizing growth opportunities rather than failure
7. THE rejection notifications SHALL include information about reapplication policies and future opportunities with the company

### Requirement 6: Sistema de Preferencias de Notificación

**User Story:** Como candidato, quiero controlar qué tipos de notificaciones recibo y por qué canales, para personalizar mi experiencia de comunicación según mis preferencias y disponibilidad.

#### Acceptance Criteria

1. THE Candidate Preferences SHALL allow enabling/disabling notifications for: status changes, interview reminders, deadline alerts, and promotional messages
2. THE Candidate Preferences SHALL allow selecting delivery channels independently for each notification type
3. THE Candidate Preferences SHALL include quiet hours settings to prevent notifications during specified time ranges
4. THE Candidate Preferences SHALL allow setting notification frequency: immediate, daily digest, or weekly summary
5. THE Candidate Preferences SHALL include language preference for notification content (Spanish, Portuguese, English)
6. THE Candidate Preferences SHALL be accessible from the main settings page with intuitive toggle controls
7. THE Candidate Preferences SHALL save changes automatically and display confirmation messages

### Requirement 7: Historial y Seguimiento de Notificaciones

**User Story:** Como candidato, quiero ver un historial completo de todas las notificaciones que he recibido sobre mis postulaciones, para revisar información pasada y verificar que no me perdí ninguna comunicación importante.

#### Acceptance Criteria

1. THE Notification History SHALL display all notifications sent to the candidate in chronological order (most recent first)
2. THE Notification History SHALL show notification type, delivery channel, timestamp, delivery status, and message preview
3. THE Notification History SHALL allow filtering by: notification type, delivery channel, date range, and application
4. THE Notification History SHALL indicate read/unread status with visual indicators
5. THE Notification History SHALL allow expanding notifications to view full message content
6. THE Notification History SHALL show delivery confirmation for WhatsApp and email notifications
7. THE Notification History SHALL be accessible from the main dashboard with a notifications icon and unread count badge

### Requirement 8: Notificaciones Push Interactivas

**User Story:** Como candidato que recibe notificaciones push en mi dispositivo, quiero poder tomar acciones rápidas directamente desde la notificación, para responder eficientemente sin tener que abrir la aplicación completa.

#### Acceptance Criteria

1. THE push notifications SHALL include action buttons relevant to the notification type
2. WHEN receiving an interview scheduling notification, THE push notification SHALL include "Ver Horarios" and "Confirmar Después" action buttons
3. WHEN receiving a rejection notification, THE push notification SHALL include "Ver Feedback" and "Buscar Recursos" action buttons
4. WHEN receiving an advancement notification, THE push notification SHALL include "Ver Detalles" and "Prepararse" action buttons
5. THE push notification actions SHALL deep-link to relevant sections within the ClearHire app
6. THE push notifications SHALL display rich content including company logo, position title, and status badge
7. THE push notifications SHALL work offline and queue actions for when the device reconnects

### Requirement 9: Escalación y Recordatorios Automáticos

**User Story:** Como candidato ocupado, quiero recibir recordatorios automáticos sobre acciones pendientes importantes (como confirmar entrevistas), para no perder oportunidades por olvido o falta de atención.

#### Acceptance Criteria

1. WHEN a candidate hasn't confirmed an interview within 24 hours, THE Notification System SHALL send a gentle reminder via their preferred channel
2. WHEN a candidate hasn't completed required actions within 48 hours, THE Notification System SHALL escalate to secondary communication channels
3. THE Escalation Rules SHALL send a maximum of 3 reminders with increasing urgency in tone
4. THE reminder notifications SHALL include deadline information and consequences of inaction
5. THE Notification System SHALL stop sending reminders once the required action is completed
6. THE escalation schedule SHALL be configurable per company: 24h, 48h, 72h intervals
7. THE final reminder SHALL include contact information for direct communication with the recruiter

### Requirement 10: Análisis y Métricas de Notificaciones

**User Story:** Como administrador del sistema, quiero ver métricas sobre la efectividad de las notificaciones (tasas de entrega, lectura, y respuesta), para optimizar la comunicación y mejorar la experiencia del candidato.

#### Acceptance Criteria

1. THE Notification Analytics SHALL track delivery rates for each channel: WhatsApp, email, and push notifications
2. THE Notification Analytics SHALL track open rates and read receipts where available
3. THE Notification Analytics SHALL track click-through rates on notification action buttons and links
4. THE Notification Analytics SHALL track response times for actions triggered by notifications (e.g., interview confirmations)
5. THE Notification Analytics SHALL provide insights on optimal sending times based on candidate engagement patterns
6. THE Notification Analytics SHALL identify candidates who consistently don't engage with notifications for targeted outreach
7. THE Notification Analytics SHALL generate weekly reports on notification performance and candidate satisfaction metrics

### Requirement 11: Integración con WhatsApp Business

**User Story:** Como candidato latinoamericano, quiero recibir notificaciones profesionales a través de WhatsApp con formato rico y opciones interactivas, para usar mi canal de comunicación preferido con una experiencia moderna.

#### Acceptance Criteria

1. THE WhatsApp integration SHALL use WhatsApp Business API for professional messaging with verified business account
2. THE WhatsApp messages SHALL include rich formatting: bold text for important information, emojis for visual appeal, and structured layouts
3. THE WhatsApp messages SHALL include interactive buttons for common actions like "Ver en App", "Confirmar", or "Más Info"
4. THE WhatsApp messages SHALL include company branding with business profile information and logo
5. THE WhatsApp messages SHALL support message templates approved by WhatsApp for automated notifications
6. THE WhatsApp integration SHALL handle delivery receipts and read confirmations for tracking purposes
7. THE WhatsApp messages SHALL include opt-out instructions and respect user preferences for future communications

### Requirement 12: Personalización Inteligente de Mensajes

**User Story:** Como candidato con historial en la plataforma, quiero recibir notificaciones personalizadas que consideren mi experiencia previa, preferencias, y comportamiento, para tener una comunicación más relevante y útil.

#### Acceptance Criteria

1. THE Personalization Engine SHALL adapt message tone based on candidate's previous interactions and feedback
2. THE Personalization Engine SHALL reference candidate's specific skills and experience when providing feedback or recommendations
3. THE Personalization Engine SHALL consider candidate's application history to provide contextual advice
4. THE Personalization Engine SHALL adjust message complexity based on candidate's technical background and seniority level
5. THE Personalization Engine SHALL remember candidate preferences for communication style (formal vs. casual)
6. THE Personalization Engine SHALL include relevant company-specific information based on candidate's target roles
7. THE Personalization Engine SHALL avoid repetitive advice by tracking previously sent recommendations and suggestions