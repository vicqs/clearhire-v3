# Requirements Document

## Introduction

ClearHire es un Applicant Tracking System (ATS) diseñado específicamente para el mercado latinoamericano que revoluciona el proceso de reclutamiento mediante transparencia radical. A diferencia de sistemas opacos tradicionales, ClearHire implementa una arquitectura "GlassBox" que permite a los candidatos rastrear el estado exacto de sus postulaciones con el mismo nivel de detalle que el rastreo de paquetes de FedEx. El sistema prioriza la privacidad por diseño, cumpliendo con regulaciones como LGPD (Brasil) y LFPDPPP (México), mientras se adapta a las preferencias culturales de LATAM mediante integración con WhatsApp y un tono cercano y empático.

## Glossary

- **ClearHire System**: La aplicación web progresiva (PWA) completa que incluye todos los componentes de frontend y backend
- **Application Tracker**: El componente central que visualiza el estado de postulaciones en formato de línea de tiempo
- **GlassBox Architecture**: Arquitectura de transparencia radical que expone cada sub-etapa del proceso de reclutamiento
- **Timeline Card**: Componente que muestra una etapa específica del proceso con detalles granulares
- **Status Badge**: Indicador visual del estado actual de una etapa (Completado, En Proceso, Rechazado)
- **Feedback Card**: Componente que proporciona retroalimentación constructiva cuando una postulación es rechazada
- **Gamification Panel**: Panel que muestra métricas de progreso, insignias y opciones premium
- **Privacy Controls**: Controles que permiten al candidato ejercer sus derechos de privacidad
- **Fast Pass Widget**: Componente premium que permite ver el ranking exacto del candidato
- **Scheduler Interface**: Interfaz para agendar entrevistas y gestionar comunicaciones
- **LGPD**: Lei Geral de Proteção de Dados (Ley General de Protección de Datos de Brasil)
- **LFPDPPP**: Ley Federal de Protección de Datos Personales en Posesión de los Particulares (México)
- **Derecho al Olvido**: Derecho legal del usuario a solicitar el borrado completo de sus datos personales
- **Node Runtime**: Node.js versión 16.20.2 utilizada como entorno de ejecución para el proyecto

## Requirements

### Requirement 1: Rastreo Granular de Postulaciones

**User Story:** Como candidato, quiero ver el estado exacto y detallado de mi postulación en tiempo real, para entender dónde está mi aplicación en el proceso y cuánto tiempo puede tomar cada etapa.

#### Acceptance Criteria

1. WHEN the Application Tracker loads, THE ClearHire System SHALL display a timeline with all sub-stages of the recruitment process including stage names, responsible recruiter information, and estimated time for completion
2. WHILE a stage is in progress, THE Status Badge SHALL display a pulsating blue indicator with the text "En Proceso"
3. WHEN a stage is completed, THE Status Badge SHALL display a green indicator with the text "Completado"
4. THE Timeline Card SHALL display the full name and avatar of the assigned recruiter for the current active stage
5. THE Timeline Card SHALL display the estimated time remaining for the current stage based on historical data with format "Tiempo estimado en esta etapa: X días"

### Requirement 2: Feedback Constructivo en Rechazos

**User Story:** Como candidato rechazado, quiero recibir retroalimentación específica y constructiva sobre las razones del rechazo, para poder mejorar mis habilidades y tener éxito en futuras postulaciones.

#### Acceptance Criteria

1. WHEN a postulation status changes to "Rechazado", THE ClearHire System SHALL display the Feedback Card component with detailed rejection information
2. THE Feedback Card SHALL display a read-only dropdown showing the legal category of rejection such as "Brecha de Habilidades Técnicas"
3. THE Feedback Card SHALL display an empathetic AI-generated explanation that avoids robotic language and provides context for the rejection
4. THE Feedback Card SHALL display a list of at least three actionable growth recommendations specific to the identified skill gaps
5. WHEN a skill gap is identified (such as React knowledge), THE Feedback Card SHALL suggest specific learning resources like "Curso Avanzado de Hooks"

### Requirement 3: Cumplimiento de Privacidad y Derecho al Olvido

**User Story:** Como candidato preocupado por mi privacidad, quiero poder ejercer mi derecho al olvido y eliminar completamente mis datos del sistema, para cumplir con mis derechos bajo LGPD y LFPDPPP.

#### Acceptance Criteria

1. THE Privacy Controls SHALL display a danger button labeled "Retirar postulación y olvidar mis datos" with soft red styling
2. WHEN the user clicks the data deletion button, THE ClearHire System SHALL display a confirmation modal explaining the irreversible nature of the action
3. WHEN the user confirms data deletion, THE ClearHire System SHALL simulate the complete removal of all personal data from the system
4. THE Privacy Controls SHALL be accessible from the main dashboard at all times
5. THE ClearHire System SHALL display a privacy notice explaining data retention policies in clear, non-legal language

### Requirement 4: Gamificación y Completitud de Perfil

**User Story:** Como candidato, quiero ver mi progreso de perfil y ganar insignias por completar acciones, para sentirme motivado a mejorar mi perfil y aumentar mis posibilidades de éxito.

#### Acceptance Criteria

1. THE Gamification Panel SHALL display a circular progress meter showing profile completion percentage from 0 to 100
2. WHEN the profile completion is below 100%, THE Gamification Panel SHALL display specific suggestions for improving the profile
3. THE Gamification Panel SHALL display earned badges with visual icons for achievements such as "Early Bird" and "Skill Master"
4. THE Gamification Panel SHALL update the profile meter in real-time when the user completes profile sections
5. THE Gamification Panel SHALL display badges with tooltips explaining how each badge was earned

### Requirement 5: Monetización con Fast Pass Premium

**User Story:** Como candidato competitivo, quiero pagar una suscripción mensual para ver mi ranking exacto frente a otros candidatos, para entender mejor mi posición y ajustar mi estrategia de postulación.

#### Acceptance Criteria

1. THE Gamification Panel SHALL display the Fast Pass Widget with premium styling that differentiates it from free features
2. THE Fast Pass Widget SHALL display the label "Ver mi posición en el ranking" with a price indicator of "$5/mes"
3. WHEN a non-subscribed user clicks the Fast Pass Widget, THE ClearHire System SHALL display a modal explaining the benefits of the premium feature
4. WHERE the user has an active Fast Pass subscription, THE Fast Pass Widget SHALL display the exact numerical ranking among all candidates for the position
5. THE Fast Pass Widget SHALL display a visual indicator (such as a crown icon) to highlight its premium status

### Requirement 6: Agendamiento y Comunicación por WhatsApp

**User Story:** Como candidato latinoamericano, quiero recibir notificaciones de estado por WhatsApp y agendar entrevistas fácilmente, para mantenerme informado usando mi canal de comunicación preferido.

#### Acceptance Criteria

1. THE Scheduler Interface SHALL display available time slots in a calendar format for interview scheduling
2. THE Scheduler Interface SHALL display a prominent checkbox labeled "Recibir actualizaciones de estado por WhatsApp"
3. WHEN the user enables WhatsApp notifications, THE ClearHire System SHALL store the preference and display a confirmation message
4. THE Scheduler Interface SHALL display time slots in the user's local timezone with clear date and time formatting
5. WHEN an interview is scheduled, THE ClearHire System SHALL send a confirmation with calendar integration options

### Requirement 7: Diseño Premium con Estándares UX 2025

**User Story:** Como candidato que revisa mis postulaciones desde el transporte público, quiero que la aplicación funcione perfectamente en mi teléfono móvil con una interfaz visual premium, moderna y accesible, para tener una experiencia profesional y agradable que reduzca mi ansiedad durante el proceso de reclutamiento.

#### Acceptance Criteria

1. THE ClearHire System SHALL implement glassmorphism aesthetic with backdrop-blur effects on floating cards, modals, and navigation bars to reinforce the "GlassBox" transparency concept
2. THE ClearHire System SHALL use soft diffused shadows (box-shadow with low opacity) instead of hard borders for visual hierarchy
3. THE ClearHire System SHALL apply subtle translucent borders (border-white/20) to define glass surface boundaries
4. THE Dashboard SHALL use a Bento Grid layout with modular rectangular blocks of varying sizes that fit together seamlessly
5. THE Bento Grid SHALL allocate a large square block for "Status Actual", a vertical rectangular block for "Timeline", and small square blocks for "Badges" and "Fast Pass"
6. THE ClearHire System SHALL position all primary action buttons (CTAs) in the bottom third of the screen for thumb-driven mobile ergonomics
7. THE ClearHire System SHALL use bottom sheets or sliding drawers instead of centered modals for displaying quick details
8. WHEN a user completes a task or earns a badge, THE ClearHire System SHALL display a subtle confetti animation or shimmer effect across the card
9. THE ClearHire System SHALL replace all loading spinners with animated skeleton loaders that mimic the final content structure
10. WHEN progress bars update, THE ClearHire System SHALL animate state transitions smoothly without abrupt jumps using layout animations
11. THE ClearHire System SHALL ensure WCAG 2.2 AA compliance with text color slate-900 on light backgrounds for proper contrast
12. THE ClearHire System SHALL ensure all interactive elements have a minimum touch target area of 44x44 pixels
13. THE ClearHire System SHALL use a geometric sans-serif font (Inter or Plus Jakarta Sans) with a clear typographic scale and bold titles
14. THE ClearHire System SHALL render all components with mobile-first responsive design using Tailwind CSS breakpoints
15. THE ClearHire System SHALL use a clean color palette with primary color #3B82F6, action color #10B981, and background color #F8FAFC
16. THE ClearHire System SHALL load as a Progressive Web App (PWA) with offline capabilities and app-like experience

### Requirement 8: Animaciones y Transiciones Suaves

**User Story:** Como usuario, quiero experimentar transiciones visuales suaves y animaciones pulidas, para tener una experiencia de uso profesional y agradable.

#### Acceptance Criteria

1. WHEN a Status Badge changes state, THE ClearHire System SHALL animate the transition with a smooth fade effect lasting 300 milliseconds
2. WHILE a stage is in progress, THE Status Badge SHALL display a continuous pulsating animation
3. WHEN the Profile Meter updates, THE ClearHire System SHALL animate the progress bar with a smooth fill animation
4. THE ClearHire System SHALL use CSS transitions or Framer Motion for all interactive elements with duration between 200-400 milliseconds
5. WHEN modals appear or disappear, THE ClearHire System SHALL use fade and scale animations for smooth entry and exit

### Requirement 9: Sistema de Calificación y Evaluación

**User Story:** Como candidato, quiero ver mi calificación o nota final en el proceso de reclutamiento, para entender objetivamente mi desempeño tanto en casos de aprobación como de rechazo.

#### Acceptance Criteria

1. THE Application Tracker SHALL display the candidate's current score or final grade with numerical format (0-100) or letter grade (A-F)
2. WHEN a postulation is rejected, THE Feedback Card SHALL display the final score with a breakdown of evaluation criteria
3. WHEN a postulation is approved, THE Application Tracker SHALL display the final score prominently with a congratulatory message
4. THE Timeline Card SHALL display intermediate scores for each completed stage when available
5. THE ClearHire System SHALL display score trends with visual indicators showing improvement or decline across stages

### Requirement 10: Confirmación de Entrevistas

**User Story:** Como candidato, quiero seleccionar y confirmar una fecha de entrevista de las opciones disponibles, para que el reclutador sepa cuándo asistiré y el sistema refleje correctamente mi elección en el seguimiento.

#### Acceptance Criteria

1. WHEN the application reaches "Evaluación Técnica" stage, THE Scheduler Interface SHALL enable interview scheduling with available dates provided by the recruiting company
2. WHEN the user selects a date from available options, THE Scheduler Interface SHALL display a confirmation button labeled "Confirmar Fecha"
3. WHEN the user confirms the selected date, THE Application Tracker SHALL update to display the confirmed date with format "Fecha confirmada: DD/MM/YYYY HH:MM"
4. WHEN the user confirms a date, THE Timeline Card SHALL update to show "Confirmado por candidato" status with a green checkmark icon
5. WHEN the deadline passes without candidate confirmation, THE ClearHire System SHALL automatically assign the most convenient date for the recruiting company and notify the candidate
6. WHILE awaiting candidate date selection, THE Application Tracker SHALL display a warning message "Pendiente: Selecciona tu fecha de entrevista"
7. THE Scheduler Interface SHALL allow the user to cancel or reschedule with at least 24 hours notice

### Requirement 11: Perfil Completo del Candidato

**User Story:** Como candidato, quiero crear y mantener un perfil completo con toda mi información profesional y personal con validación automática y guardado en tiempo real, para que los reclutadores tengan acceso a mis datos actualizados sin preocuparme por perder información.

#### Acceptance Criteria

1. THE profile form SHALL include a "Información Personal" tab with fields for nombre, apellidos, país (combobox with predefined values), número de teléfono (validated format), and correo electrónico (validated email format)
2. THE profile form SHALL include an "Experiencia Laboral" section with fields for company name, cargo (combobox with predefined positions), start date, end date, and "Descripción de las funciones laborales"
3. WHEN a new work experience is added, THE profile form SHALL insert the entry at the top of the list and sort all entries in descending order by end date (most recent first)
4. THE profile form SHALL include a "Educación" section with combobox fields for título and campo de estudio with predefined values from the recruiting company
5. THE profile form SHALL include a multi-select field for idiomas with proficiency levels (Básico, Intermedio, Avanzado, Nativo)
6. THE profile form SHALL include a multi-select field for habilidades blandas such as "Trabajo en Equipo", "Liderazgo", "Comunicación"
7. THE profile form SHALL include a combobox field for oficios with predefined values from the recruiting company
8. THE profile form SHALL include a "Referencias" section where each reference includes fields for name, correo (validated email format), teléfono (validated phone format), and an attachment upload field
9. WHEN any field is modified, THE ClearHire System SHALL automatically save the changes without requiring a manual save action
10. WHEN any field contains invalid data, THE ClearHire System SHALL display a red error message below the field with specific validation feedback
11. THE profile form SHALL include an "Exportar Datos" button that generates a PDF with all profile information in a standard formatted layout
12. WHEN profile sections are completed, THE Gamification Panel SHALL update the profile completion percentage in real-time

### Requirement 12: Historial y Gestión de Múltiples Postulaciones

**User Story:** Como candidato con múltiples postulaciones, quiero ver un historial organizado de todas mis aplicaciones (activas, aprobadas, rechazadas) y poder navegar entre ellas fácilmente, para gestionar eficientemente mi búsqueda de empleo sin perderme en la interfaz.

#### Acceptance Criteria

1. THE ClearHire System SHALL display a "Historial de Postulaciones" view showing all applications grouped by status: Activas, Aprobadas, and Rechazadas
2. WHEN viewing the history, THE ClearHire System SHALL display each application as a collapsible card showing company name, position, and current status
3. WHEN a user selects a specific application, THE ClearHire System SHALL expand that application's details and collapse all other applications in accordion style
4. WHEN an application is expanded, THE ClearHire System SHALL display the full Application Tracker with timeline and all relevant details
5. THE ClearHire System SHALL provide a "Volver al Historial" button within expanded application view to return to the collapsed list view
6. THE ClearHire System SHALL display a count badge showing the number of applications in each status category (e.g., "Activas (3)")
7. THE ClearHire System SHALL allow filtering applications by company name, position, or date range

### Requirement 13: Visualización de Plazas Disponibles

**User Story:** Como candidato, quiero ver cuántas plazas están disponibles para la posición a la que apliqué, para entender mejor la competitividad y mis probabilidades de éxito.

#### Acceptance Criteria

1. THE Application Tracker SHALL display the number of available positions with format "Plazas disponibles: X"
2. THE Application Tracker SHALL display this information prominently near the job title and company name
3. WHEN there is only one position available, THE ClearHire System SHALL display "Plaza disponible: 1" in singular form
4. WHEN there are multiple positions, THE ClearHire System SHALL display "Plazas disponibles: X" in plural form
5. THE Application Tracker SHALL update the available positions count in real-time as positions are filled

### Requirement 14: Exportación de Datos Personales

**User Story:** Como candidato, quiero exportar mis datos personales y el historial completo de mis postulaciones en formato PDF, para tener un registro personal o cumplir con requisitos de otras aplicaciones.

#### Acceptance Criteria

1. THE Privacy Controls SHALL display a button labeled "Descargar Mis Datos" with a download icon
2. WHEN the user clicks the download button, THE ClearHire System SHALL generate a PDF document containing all profile information and application history
3. THE generated PDF SHALL include sections for: Información Personal, Experiencia Laboral, Educación, Habilidades, and Historial de Postulaciones
4. THE Historial de Postulaciones section in the PDF SHALL list all applications with status: Activas, Aprobadas (with final scores), and Rechazadas (with feedback summaries)
5. THE PDF SHALL use a professional standard format with clear section headers, proper spacing, and the ClearHire branding
6. THE PDF filename SHALL follow the format "ClearHire_Datos_[Nombre]_[Apellido]_[Fecha].pdf"

### Requirement 15: Compatibilidad con Node 16.20.2

**User Story:** Como desarrollador del equipo, quiero que todas las dependencias y librerías del proyecto sean compatibles con Node 16.20.2, para asegurar que el proyecto pueda ejecutarse en nuestro entorno de producción sin problemas de compatibilidad.

#### Acceptance Criteria

1. THE ClearHire System SHALL use React version 18.2.0 which is compatible with Node 16.20.2
2. THE ClearHire System SHALL use Vite version 4.x or lower that supports Node 16.20.2
3. THE ClearHire System SHALL use Tailwind CSS version 3.x which is compatible with Node 16.20.2
4. THE ClearHire System SHALL use TypeScript version 4.9.x or 5.0.x compatible with Node 16.20.2
5. THE ClearHire System SHALL use lucide-react version compatible with Node 16.20.2
6. THE package.json SHALL specify "engines" field with "node": ">=16.20.2 <17.0.0" to enforce Node version compatibility
7. THE ClearHire System SHALL avoid using any dependencies that require Node 18+ features
8. THE project documentation SHALL include instructions for verifying Node version with "node --version" command

### Requirement 16: Datos Mock Realistas para LATAM

**User Story:** Como desarrollador o evaluador del sistema, quiero ver datos de ejemplo realistas del mercado latinoamericano, para entender cómo funcionará el sistema con información real.

#### Acceptance Criteria

1. THE ClearHire System SHALL include a data.ts file with mock data representing realistic LATAM companies such as "Fintech Andina S.A." (Colombia) or "Desarrollos Monterrey" (México)
2. THE mock data SHALL include average response times showing "Promedio de respuesta: 12 días" to contrast with market average of 24 days
3. THE mock data SHALL include at least one detailed rejection feedback example suggesting skills like "Docker" and "CI/CD"
4. THE mock data SHALL include recruiter profiles with Spanish/Portuguese names and realistic job titles
5. THE mock data SHALL include at least three different application statuses across multiple stages for demonstration purposes
6. THE mock data SHALL include sample candidate profiles with complete information including scores, experience, education, and skills
7. THE mock data SHALL include multiple applications per candidate showing different statuses (active, approved, rejected) for testing the history view
8. THE mock data SHALL include available position counts ranging from 1 to 5 for different job postings


### Requirement 17: Sistema de Estados de Postulación Expandido

**User Story:** Como candidato con múltiples postulaciones activas, quiero entender claramente en qué fase está cada postulación y cuándo debo tomar decisiones críticas sobre ofertas, para gestionar eficientemente mi proceso de búsqueda de empleo y cumplir con las restricciones de exclusividad cuando acepto una oferta.

#### Acceptance Criteria

1. THE ClearHire System SHALL support 17 distinct application statuses organized in 4 phases: Proceso Inicial (6 states), Pre-Oferta (2 states), Oferta (4 states), and Estados Finales (5 states)
2. THE ClearHire System SHALL allow candidates to maintain multiple active applications during "Proceso Inicial" and "Pre-Oferta" phases
3. WHEN a candidate receives a formal offer (status "offer_pending"), THE ClearHire System SHALL display an ExclusivityWarning component explaining that accepting will require withdrawing other applications
4. WHEN a candidate accepts an offer (status "offer_accepted"), THE ClearHire System SHALL mark that application as exclusive and require withdrawal of all other active applications
5. THE ClearHire System SHALL support 11 stage statuses including "awaiting_candidate", "awaiting_company", "passed", and "failed" for granular tracking
6. THE ApplicationHistory SHALL display a gold "Exclusiva" badge on applications with accepted offers
7. THE ClearHire System SHALL use semantic colors for each status: green for exclusive states, yellow/orange for critical states, blue/purple for in-progress states, red for rejections
8. THE ClearHire System SHALL provide helper functions canHaveMultipleApplications(), isInCriticalState(), getStatusLabel(), and getStatusColor() for consistent status handling

### Requirement 18: Resultados de Pruebas Técnicas y Psicométricas

**User Story:** Como candidato que ha completado evaluaciones técnicas o psicométricas, quiero ver mis resultados detallados con puntuaciones, percentiles y desglose por categoría, para entender mi desempeño y áreas de mejora.

#### Acceptance Criteria

1. THE ClearHire System SHALL support 5 types of test results: technical, psychometric, personality, skills, and cognitive
2. THE TestResultsCard SHALL display test name, type, score out of maximum, percentage, and completion date
3. WHERE a test includes percentile data, THE TestResultsCard SHALL display "Percentil X" showing the candidate's ranking
4. WHERE a test includes detailed results, THE TestResultsCard SHALL display a breakdown by category with individual scores
5. WHERE a test certificate is available, THE TestResultsCard SHALL provide a download link with icon
6. THE TestResultsCard SHALL use semantic colors: green for scores ≥80%, yellow for scores ≥60%, red for scores <60%
7. THE TestResultsCard SHALL display test-specific icons: 💻 for technical, 🧠 for psychometric, 🎭 for personality, ⚡ for skills, 🎯 for cognitive
8. THE ApplicationTracker SHALL integrate TestResultsCard components within the timeline when test results are available for a stage

### Requirement 19: Confirmación de Eliminación con Mejores Prácticas PWA

**User Story:** Como candidato editando mi perfil, quiero confirmar la eliminación de elementos importantes (experiencia, educación, referencias) mediante un diálogo moderno y accesible, para evitar eliminaciones accidentales y tener una experiencia consistente con aplicaciones nativas.

#### Acceptance Criteria

1. THE ClearHire System SHALL use a custom ConfirmDialog component instead of native browser confirm() for all deletion confirmations
2. THE ConfirmDialog SHALL display as a bottom sheet on mobile devices with a handle bar for swipe-to-dismiss gesture
3. THE ConfirmDialog SHALL display as a centered modal on desktop devices
4. THE ConfirmDialog SHALL include an icon (AlertTriangle), title, contextual message including the item name, and two action buttons
5. THE ConfirmDialog SHALL provide haptic feedback: medium vibration on confirm, light vibration on cancel
6. THE ConfirmDialog SHALL support three variants: "danger" (red) for deletions, "warning" (yellow) for cautions, "info" (blue) for informational confirmations
7. THE ConfirmDialog SHALL animate smoothly with spring physics: initial y:100 to y:0 on mobile, with 300ms duration
8. THE ConfirmDialog SHALL support dark mode with adapted colors and proper contrast
9. THE ConfirmDialog SHALL be dismissible by clicking backdrop, pressing ESC key, or swiping down on mobile
10. THE ReferenceItem, ExperienceItem, and EducationItem components SHALL use ConfirmDialog with contextual messages like "¿Estás seguro de que deseas eliminar tu experiencia en [Company]? Esta acción no se puede deshacer."

### Requirement 20: Parsing Inteligente de CV

**User Story:** Como candidato nuevo en la plataforma, quiero subir mi CV en formato PDF o Word y que el sistema autocomplete automáticamente mi perfil, para ahorrar tiempo y evitar errores de transcripción manual.

#### Acceptance Criteria

1. THE CVUploader component SHALL accept PDF (.pdf) and Microsoft Word (.doc, .docx) file formats
2. THE CVUploader SHALL validate file size with maximum limit of 10MB and display error message if exceeded
3. WHEN a valid CV is uploaded, THE CVUploader SHALL display "Analizando CV..." with animated spinner for 2 seconds simulating AI processing
4. THE CVUploader SHALL extract and parse: personal information (name, email, phone, country), work experience (company, position, dates, description), education (institution, degree, field, year), languages with proficiency levels, soft skills, and trade/specialty
5. WHEN parsing completes successfully, THE CVUploader SHALL display "¡CV Analizado!" with green checkmark and success message
6. THE ProfileForm SHALL merge parsed data with existing profile: overwriting personal info, replacing arrays only if new data exists, preserving existing data if CV has no information
7. THE CVUploader SHALL display security message "🔒 Tu CV es procesado de forma segura y no se almacena" for privacy assurance
8. WHEN parsing fails, THE CVUploader SHALL display error state with red alert icon and message "Intenta con otro archivo"
9. THE CVUploader SHALL be positioned at the top of ProfileForm before the tab navigation for immediate visibility
10. THE CVUploader SHALL support dark mode with adapted colors and maintain accessibility standards

### Requirement 21: Jerarquía Visual Mejorada para Postulaciones

**User Story:** Como candidato navegando entre múltiples postulaciones, quiero ver claramente que los paneles de seguimiento (scheduler, feedback) están dentro de la postulación seleccionada, para entender mejor la estructura de la información y no confundirme sobre qué elementos pertenecen a qué postulación.

#### Acceptance Criteria

1. THE Dashboard SHALL wrap the selected application in a prominent container with gradient background (from-white/50 to-slate-50/50), 2px primary border, rounded-3xl corners, and shadow-xl
2. THE selected application container SHALL display an animated pulsing dot (w-3 h-3 bg-primary-500 animate-pulse) next to the title to indicate active selection
3. THE nested panels (SchedulerInterface, FeedbackCard) SHALL be indented with ml-4 pl-6 and connected by a 4px vertical border line (border-l-4 border-primary-300)
4. THE nested panels SHALL display connection dots (w-4 h-4 rounded-full) positioned on the vertical line with semantic colors: primary-400 for Scheduler, danger-400 for Feedback
5. THE connection dots SHALL have 4px white border (border-4 border-white) to stand out from the background
6. THE nested panels container SHALL use space-y-6 for consistent vertical spacing between elements
7. THE visual hierarchy SHALL follow depth levels: Level 0 (page background) → Level 1 (main container with border+shadow) → Level 2 (ApplicationTracker) → Level 3 (nested panels with line+dots) → Level 4 (panel content)
8. THE design SHALL apply Gestalt principles: proximity (related elements grouped), continuity (vertical line connects panels), and hierarchy (size/color indicate importance)
9. THE visual hierarchy SHALL be responsive: maintaining structure on mobile with adjusted padding and smaller connection dots
10. THE design SHALL support dark mode with adapted colors: dark:from-slate-800/50, dark:border-primary-800, dark:border-primary-700 for line

### Requirement 22: Modal Posicionado en Parte Superior

**User Story:** Como usuario que abre modales (como Fast Pass Premium), quiero que aparezcan en la parte superior de la pantalla en lugar de estar centrados verticalmente, para tener mejor visibilidad y una experiencia más natural especialmente en pantallas grandes.

#### Acceptance Criteria

1. THE Modal component SHALL use items-start instead of items-center for vertical alignment to position at top
2. THE Modal container SHALL include pt-20 (80px padding-top) to provide space from the top edge of the screen
3. THE Modal container SHALL include overflow-y-auto to allow scrolling when content exceeds viewport height
4. THE Modal animation SHALL enter from top with initial y:-20 transitioning to y:0 instead of entering from center
5. THE Modal animation SHALL use 300ms duration with easeOut timing function for smooth appearance
6. THE Modal content SHALL have max-h-[calc(80vh-8rem)] to limit height and ensure scrollability
7. THE Modal inner container SHALL use my-auto for flexible vertical centering when content is small
8. THE Modal SHALL maintain responsive behavior: top-aligned on all screen sizes with appropriate padding
9. THE Modal SHALL support dark mode with backdrop-blur-sm and adapted background colors
10. THE Modal SHALL maintain z-index hierarchy: backdrop at z-[9998], modal at z-[9999] to ensure proper layering

