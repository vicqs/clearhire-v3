# Implementation Plan - ClearHire ATS Platform

- [x] 1. Configuración inicial del proyecto

- [x] 1.1 Crear proyecto React con Vite y TypeScript


  - Ejecutar `npm create vite@4 clearhire-ats -- --template react-ts`
  - Configurar package.json con engines para Node 16.20.2
  - Instalar dependencias base: React 18.2.0, TypeScript 5.0.x
  - _Requirements: 15.1, 15.6_

- [x] 1.2 Configurar Tailwind CSS y sistema de diseño


  - Instalar Tailwind CSS 3.x, PostCSS y Autoprefixer
  - Crear tailwind.config.js con paleta de colores personalizada (#3B82F6, #10B981, #F8FAFC)
  - Configurar fuentes (Inter o Plus Jakarta Sans)
  - Crear globals.css con estilos base y clases de glassmorphism
  - _Requirements: 7.1, 7.2, 7.3, 7.13_

- [x] 1.3 Instalar y configurar dependencias adicionales



  - Instalar lucide-react para iconos
  - Instalar framer-motion para animaciones
  - Configurar estructura de carpetas (components, hooks, services, types, utils)
  - _Requirements: 7.8, 7.9, 7.10_

- [x] 2. Crear modelos de datos TypeScript y mock data

- [x] 2.1 Definir interfaces y tipos base


  - Crear types/application.ts con Application, Stage, RecruiterInfo, StageFeedback
  - Crear types/profile.ts con Profile, PersonalInfo, WorkExperience, Education, Language, Reference
  - Crear types/common.ts con tipos compartidos (ApplicationStatus, StageStatus, ErrorType)
  - _Requirements: 1.1, 2.1, 9.1, 11.1_

- [x] 2.2 Crear mock data realista para LATAM


  - Crear services/mock/mockData.ts con empresas latinoamericanas (Fintech Andina S.A., Desarrollos Monterrey, Tech Solutions Brasil)
  - Incluir reclutadores con nombres en español/portugués
  - Crear 3 aplicaciones de ejemplo: activa, rechazada, aprobada
  - Incluir feedback de rechazo con recomendaciones (Docker, CI/CD)
  - Agregar perfil completo de candidato con experiencia y educación
  - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.6_


- [x] 3. Implementar componentes core reutilizables

- [x] 3.1 Crear componente Button con variantes


  - Implementar Button.tsx con props para variant (primary, success, danger, ghost, premium)
  - Aplicar estilos Tailwind con touch targets mínimos de 44x44px
  - Agregar estados hover y disabled
  - _Requirements: 7.12_

- [x] 3.2 Crear componente Card con efecto glassmorphism


  - Implementar Card.tsx con backdrop-blur-md y bordes translúcidos
  - Agregar variantes: glass, solid, elevated
  - Aplicar sombras suaves y difusas
  - _Requirements: 7.1, 7.2, 7.3_

- [x] 3.3 Crear componente Modal y BottomSheet


  - Implementar Modal.tsx con glassmorphism backdrop
  - Implementar BottomSheet.tsx para móvil (sliding drawer desde abajo)
  - Agregar animaciones de entrada/salida con Framer Motion
  - Usar hook useMediaQuery para decidir entre modal o bottom sheet
  - _Requirements: 7.6, 7.7, 7.8_

- [x] 3.4 Crear componente SkeletonLoader


  - Implementar SkeletonLoader.tsx con animación shimmer
  - Crear variantes para diferentes tipos de contenido (text, card, avatar)
  - Aplicar gradiente animado con keyframes CSS
  - _Requirements: 7.9_

- [x] 4. Implementar Application Tracker (componente principal)

- [x] 4.1 Crear componente StatusBadge


  - Implementar StatusBadge.tsx con estados: completed, in_progress, rejected, pending
  - Agregar animación pulsante para estado "in_progress"
  - Usar colores del sistema: verde (completado), azul pulsante (en proceso), rojo (rechazado)
  - _Requirements: 1.2, 1.3_

- [x] 4.2 Crear componente TimelineCard



  - Implementar TimelineCard.tsx para mostrar cada etapa del proceso
  - Mostrar nombre de etapa, reclutador asignado (avatar y nombre), tiempo estimado
  - Agregar líneas conectoras verticales entre etapas
  - Mostrar score de la etapa si está disponible
  - _Requirements: 1.1, 1.4, 1.5, 9.1, 9.4_

- [x] 4.3 Crear componente ApplicationTracker completo


  - Implementar ApplicationTracker.tsx que integra TimelineCard y StatusBadge
  - Mostrar todas las etapas del proceso en timeline vertical
  - Mostrar score general y plazas disponibles en header
  - Aplicar glassmorphism y Bento Grid layout
  - _Requirements: 1.1, 9.1, 9.2, 13.1, 13.2_

- [x] 5. Implementar sistema de Feedback para rechazos

- [x] 5.1 Crear componente RejectionReason


  - Implementar RejectionReason.tsx con dropdown de solo lectura
  - Mostrar categoría legal del rechazo (ej. "Brecha de Habilidades Técnicas")
  - _Requirements: 2.2_

- [x] 5.2 Crear componente AIExplanation


  - Implementar AIExplanation.tsx con texto empático
  - Usar tono cercano y constructivo, evitar lenguaje robótico
  - _Requirements: 2.3_

- [x] 5.3 Crear componente ActionableGrowth


  - Implementar ActionableGrowth.tsx con lista de recomendaciones
  - Mostrar skill, recurso sugerido y enlace
  - Agregar iconos de prioridad (high, medium, low)
  - _Requirements: 2.4, 2.5_

- [x] 5.4 Integrar FeedbackCard completo


  - Implementar FeedbackCard.tsx que integra los 3 sub-componentes
  - Mostrar solo cuando status es "rejected"
  - Aplicar diseño con colores cálidos pero profesionales
  - _Requirements: 2.1_


- [x] 6. Implementar sistema de Gamificación


- [x] 6.1 Crear hook useProfileCompletion


  - Implementar useProfileCompletion.ts que calcula porcentaje de completitud
  - Usar pesos: personalInfo (20%), experience (25%), education (20%), skills (15%), languages (10%), references (10%)
  - Retornar número de 0-100
  - _Requirements: 4.1, 4.2_

- [x] 6.2 Crear componente ProfileMeter


  - Implementar ProfileMeter.tsx con barra circular de progreso
  - Usar gradiente de colores según porcentaje
  - Agregar animación suave al actualizar
  - Mostrar sugerencias cuando < 100%
  - _Requirements: 4.1, 4.2, 4.4_

- [x] 6.3 Crear componente BadgeCollection


  - Implementar BadgeCollection.tsx con grid de insignias
  - Mostrar badges con iconos de lucide-react
  - Agregar tooltips con descripción y fecha
  - Aplicar efecto shimmer al ganar nueva insignia
  - _Requirements: 4.3, 4.5_

- [x] 6.4 Crear componente FastPassWidget


  - Implementar FastPassWidget.tsx con estilo premium
  - Usar gradiente dorado y icono de corona
  - Mostrar precio "$5/mes" y label "Ver mi posición en el ranking"
  - Mostrar ranking si usuario tiene suscripción activa
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 6.5 Integrar GamificationPanel completo


  - Implementar GamificationPanel.tsx que integra ProfileMeter, BadgeCollection y FastPassWidget
  - Aplicar Bento Grid layout (bloques de diferentes tamaños)
  - _Requirements: 4.1_

- [ ] 7. Implementar formulario de perfil completo

- [x] 7.1 Crear hook useAutoSave


  - Implementar useAutoSave.ts con debounce de 1 segundo
  - Guardar automáticamente al modificar cualquier campo
  - Retornar estado isSaving, lastSaved y error
  - Mostrar indicador visual de guardado ("Guardando...", "Guardado", "Error al guardar")
  - _Requirements: 11.9_

- [x] 7.2 Crear utilidades de validación completas


  - Implementar utils/validation.ts con validateEmail, validatePhone
  - Usar regex para formato internacional de teléfono (+código país)
  - Crear validateFile para PDFs con límites de tamaño (máx 5MB)
  - Agregar validateDateRange para verificar que fecha fin > fecha inicio
  - Agregar validateRequired para campos obligatorios
  - Agregar validateMaxLength para campos de texto largo
  - _Requirements: 11.10_

- [x] 7.3 Crear componente PersonalInfoTab


  - Implementar PersonalInfoTab.tsx con campos: firstName, lastName, country (combobox), phone, email
  - Aplicar validación en tiempo real con mensajes en rojo
  - Integrar auto-save con useAutoSave hook
  - Mostrar indicador de guardado en la esquina del tab
  - _Requirements: 11.1, 11.9, 11.10_

- [x] 7.4 Crear componente ExperienceItem editable


  - Implementar ExperienceItem.tsx para mostrar/editar una experiencia individual
  - Incluir modos: vista (collapsed), edición (expanded)
  - Campos: company, position (combobox), startDate, endDate, description
  - Botones: Editar, Eliminar, Guardar, Cancelar
  - Validar que endDate > startDate
  - _Requirements: 11.2, 11.3_

- [x] 7.5 Crear componente ExperienceSection con CRUD completo


  - Implementar ExperienceSection.tsx con lista de ExperienceItem
  - Botón "Agregar Experiencia" que abre formulario vacío
  - Ordenar por fecha descendente (más reciente primero)
  - Permitir editar experiencias existentes
  - Permitir eliminar con confirmación
  - Agregar nueva experiencia en la parte superior
  - _Requirements: 11.2, 11.3_

- [x] 7.6 Crear componente EducationItem editable


  - Implementar EducationItem.tsx para mostrar/editar educación individual
  - Incluir modos: vista, edición
  - Campos: institution, degree (combobox), fieldOfStudy (combobox), graduationYear
  - Botones: Editar, Eliminar, Guardar, Cancelar
  - _Requirements: 11.4_

- [x] 7.7 Crear componente EducationSection con CRUD completo


  - Implementar EducationSection.tsx con lista de EducationItem
  - Botón "Agregar Educación" que abre formulario vacío
  - Permitir editar y eliminar títulos existentes
  - Ordenar por año de graduación descendente
  - _Requirements: 11.4_

- [x] 7.8 Crear componente SkillsSection con edición


  - Implementar SkillsSection.tsx con multi-select para idiomas y habilidades blandas
  - Idiomas con niveles: Básico, Intermedio, Avanzado, Nativo
  - Permitir editar nivel de idioma existente
  - Permitir eliminar idiomas y habilidades
  - Combobox para oficios con valores predeterminados
  - Auto-save al modificar cualquier skill
  - _Requirements: 11.5, 11.6, 11.7_

- [x] 7.9 Crear componente ReferenceItem editable


  - Implementar ReferenceItem.tsx para mostrar/editar referencia individual
  - Incluir modos: vista, edición
  - Campos: name, email (validado), phone (validado), attachment (PDF upload)
  - Validar formatos de email y teléfono
  - Validar tamaño de archivo (máx 5MB)
  - Botones: Editar, Eliminar, Guardar, Cancelar
  - _Requirements: 11.8, 11.10_

- [x] 7.10 Crear componente ReferencesSection con CRUD completo


  - Implementar ReferencesSection.tsx con lista de ReferenceItem
  - Botón "Agregar Referencia" que abre formulario vacío
  - Permitir editar y eliminar referencias existentes
  - Mostrar preview del archivo adjunto si existe
  - _Requirements: 11.8, 11.10_

- [x] 7.11 Crear componente SaveIndicator


  - Implementar SaveIndicator.tsx para mostrar estado de guardado
  - Estados: "Guardando..." (spinner), "Guardado" (checkmark verde), "Error" (icono rojo)
  - Auto-ocultar después de 3 segundos en estado "Guardado"
  - Posicionar en esquina superior derecha del formulario
  - _Requirements: 11.9_

- [ ] 7.12 Integrar ProfileForm completo con actualización de ProfileMeter



  - Implementar ProfileForm.tsx con tabs para cada sección
  - Integrar todos los sub-componentes (PersonalInfo, Experience, Education, Skills, References)
  - Agregar botón "Exportar Datos" (sin botón "Guardar" manual)
  - Calcular y actualizar ProfileMeter en tiempo real al modificar cualquier sección
  - Integrar SaveIndicator en cada tab
  - Validar que todos los cambios se guarden automáticamente
  - _Requirements: 11.9, 11.11, 11.12_


- [x] 8. Implementar sistema de agendamiento de entrevistas

- [x] 8.1 Crear componente CalendarSlots

  - Implementar CalendarSlots.tsx con grid de fechas disponibles
  - Mostrar slots con fecha, hora, tipo (virtual/presencial) y reclutador
  - Deshabilitar slots no disponibles
  - Aplicar diseño responsive para móvil
  - _Requirements: 6.1_

- [x] 8.2 Crear componente WhatsAppToggle

  - Implementar WhatsAppToggle.tsx con checkbox prominente
  - Usar color verde y icono de WhatsApp
  - Label: "Recibir actualizaciones de estado por WhatsApp"
  - _Requirements: 6.2, 6.3_

- [x] 8.3 Integrar SchedulerInterface completo

  - Implementar SchedulerInterface.tsx que integra CalendarSlots y WhatsAppToggle
  - Habilitar solo cuando aplicación está en etapa "Evaluación Técnica"
  - Mostrar mensaje "Pendiente: Selecciona tu fecha de entrevista" si no ha confirmado
  - Al confirmar, actualizar Timeline con fecha confirmada
  - Implementar lógica de asignación automática si pasa deadline
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_

- [x] 9. Implementar historial de múltiples postulaciones

- [x] 9.1 Crear componente ApplicationHistory

  - Implementar ApplicationHistory.tsx con lista colapsable tipo acordeón
  - Agrupar aplicaciones por estado: Activas, Aprobadas, Rechazadas
  - Mostrar contador de aplicaciones por categoría (ej. "Activas (3)")
  - Al expandir una aplicación, colapsar las demás
  - _Requirements: 12.1, 12.2, 12.3, 12.6_

- [x] 9.2 Agregar navegación y filtros

  - Implementar botón "Volver al Historial" en vista expandida
  - Agregar filtros por empresa, posición y rango de fechas
  - Aplicar transiciones suaves con Framer Motion
  - _Requirements: 12.4, 12.5, 12.7_

- [x] 10. Implementar controles de privacidad

- [x] 10.1 Crear utilidad de generación de PDF

  - Implementar utils/pdfGenerator.ts para exportar datos
  - Incluir secciones: Información Personal, Experiencia, Educación, Habilidades, Historial de Postulaciones
  - Formato estándar con branding de ClearHire
  - Nombre de archivo: ClearHire_Datos_[Nombre]_[Apellido]_[Fecha].pdf
  - _Requirements: 14.2, 14.3, 14.4, 14.5, 14.6_

- [x] 10.2 Crear componente DataExportButton

  - Implementar DataExportButton.tsx con icono de descarga
  - Al hacer clic, generar y descargar PDF con todos los datos
  - Mostrar loading state durante generación
  - _Requirements: 14.1_

- [x] 10.3 Crear componente DataDeletionButton

  - Implementar botón "Retirar postulación y olvidar mis datos" con estilo de peligro (rojo suave)
  - Mostrar modal de confirmación con advertencia de irreversibilidad
  - Simular borrado completo de datos
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 10.4 Integrar PrivacyControls completo

  - Implementar PrivacyControls.tsx con DataExportButton y DataDeletionButton
  - Agregar texto explicativo de políticas de privacidad
  - Hacer accesible desde dashboard principal
  - _Requirements: 3.4, 3.5_


- [x] 11. Implementar layouts y navegación

- [x] 11.1 Crear componente BentoGrid

  - Implementar BentoGrid.tsx con grid modular responsive
  - Configurar bloques de diferentes tamaños: 2x2 (status), 1x3 (timeline), 2x1 (gamification), 1x1 (badges, fastpass)
  - Aplicar responsive breakpoints: mobile (1 col), tablet (2 cols), desktop (3 cols)
  - _Requirements: 7.4, 7.5_

- [x] 11.2 Crear navegación móvil (bottom bar)

  - Implementar navegación inferior para móvil en zona del pulgar
  - Incluir: Dashboard, Postulaciones, Perfil, Configuración
  - Aplicar glassmorphism con backdrop-blur
  - _Requirements: 7.6_

- [x] 11.3 Crear CandidateLayout principal

  - Implementar CandidateLayout.tsx que integra BentoGrid y navegación
  - Incluir OfflineBanner para detectar pérdida de conexión
  - Aplicar padding y spacing consistente
  - _Requirements: 7.14, 7.15_

- [x] 12. Implementar animaciones y micro-interacciones

- [x] 12.1 Crear animaciones CSS personalizadas

  - Implementar styles/animations.css con keyframes para pulse-glow, shimmer
  - Agregar transiciones globales suaves (200-400ms)
  - Crear animación de progress bar con ease-out
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 12.2 Agregar efecto confetti para badges

  - Integrar canvas-confetti o react-confetti
  - Disparar animación al ganar nueva insignia
  - Usar colores del sistema (#3B82F6, #10B981, #F59E0B)
  - _Requirements: 7.8_

- [x] 12.3 Implementar transiciones de acordeón

  - Agregar animaciones de expansión/colapso en ApplicationHistory
  - Usar Framer Motion para layout animations
  - _Requirements: 8.5_

- [x] 13. Configurar PWA y service workers

- [x] 13.1 Configurar Vite PWA plugin


  - Instalar vite-plugin-pwa
  - Configurar manifest.json con nombre, iconos, colores (#3B82F6, #F8FAFC)
  - Configurar service worker con Workbox
  - _Requirements: 7.16_

- [x] 13.2 Implementar estrategias de caching

  - Cache-first para app shell (HTML, CSS, JS)
  - Network-first para API data
  - Cache-first para imágenes y assets
  - _Requirements: 7.16_

- [x] 13.3 Crear hook useOnlineStatus

  - Implementar useOnlineStatus.ts para detectar conexión
  - Escuchar eventos online/offline
  - _Requirements: 7.16_

- [x] 13.4 Crear componente OfflineBanner

  - Implementar OfflineBanner.tsx que se muestra cuando no hay conexión
  - Mensaje: "Sin conexión. Los cambios se guardarán cuando vuelvas a estar en línea."
  - Posicionar en top con z-index alto
  - _Requirements: 7.16_


- [x] 14. Implementar manejo de errores

- [x] 14.1 Crear tipos y utilidades de error

  - Implementar types/error.ts con ErrorType enum y AppError interface
  - Crear utils/errorHandling.ts con funciones helper
  - _Requirements: 2.1_

- [x] 14.2 Crear componente ErrorBoundary

  - Implementar ErrorBoundary.tsx para capturar errores de React
  - Mostrar UI de fallback amigable
  - Incluir botón "Reintentar"
  - _Requirements: 2.1_

- [x] 14.3 Crear componente Toast para notificaciones

  - Implementar Toast.tsx para mensajes de error/éxito
  - Auto-dismiss después de 5 segundos
  - Posicionar en esquina superior derecha
  - _Requirements: 2.1_

- [x] 14.4 Agregar validación de formularios con mensajes

  - Implementar mensajes de error en rojo debajo de campos
  - Mensajes específicos en español: "El correo electrónico no es válido", "Este campo es obligatorio"
  - Validación en tiempo real (onChange)
  - _Requirements: 11.10_

- [x] 15. Implementar servicios y capa de datos

- [x] 15.1 Crear service layer para aplicaciones

  - Implementar services/api/applications.ts con getAll, getById, update
  - Usar mock data por ahora, preparar para API real
  - Incluir manejo de errores y retry logic
  - _Requirements: 1.1_

- [x] 15.2 Crear service layer para perfil

  - Implementar services/api/profile.ts con get, update, export, delete
  - Integrar con auto-save
  - _Requirements: 11.9_

- [x] 15.3 Crear service layer para scheduling

  - Implementar services/api/scheduler.ts con getSlots, confirmSlot
  - _Requirements: 10.1_

- [x] 16. Implementar Context API para estado global

- [x] 16.1 Crear UserContext

  - Implementar contexts/UserContext.tsx con user, isAuthenticated, login, logout, updateProfile
  - Proveer en nivel raíz de la aplicación
  - _Requirements: 11.1_

- [x] 16.2 Crear ApplicationContext

  - Implementar contexts/ApplicationContext.tsx con applications, selectedApplication, selectApplication
  - Integrar con ApplicationHistory
  - _Requirements: 12.1_

- [x] 16.3 Crear PreferencesContext

  - Implementar contexts/PreferencesContext.tsx con preferences, updatePreferences
  - Incluir whatsappNotifications, emailNotifications, language, timezone
  - _Requirements: 6.3_


- [x] 17. Crear páginas y rutas principales

- [x] 17.1 Configurar React Router

  - Instalar react-router-dom compatible con Node 16.20.2
  - Configurar rutas: /, /applications, /profile, /settings
  - Implementar lazy loading para code splitting
  - _Requirements: 7.14_

- [x] 17.2 Crear página Dashboard

  - Implementar pages/Dashboard.tsx con BentoGrid layout
  - Integrar ApplicationTracker, GamificationPanel
  - Mostrar aplicación activa principal
  - _Requirements: 7.4, 7.5_

- [x] 17.3 Crear página Applications

  - Implementar pages/Applications.tsx con ApplicationHistory
  - Mostrar todas las postulaciones con filtros
  - _Requirements: 12.1_

- [x] 17.4 Crear página Profile

  - Implementar pages/Profile.tsx con ProfileForm completo
  - Incluir tabs para cada sección
  - _Requirements: 11.1_

- [x] 17.5 Crear página Settings

  - Implementar pages/Settings.tsx con PrivacyControls y preferencias
  - Incluir toggle para notificaciones WhatsApp
  - _Requirements: 3.1, 6.2_

- [x] 18. Optimizaciones de rendimiento

- [x] 18.1 Implementar code splitting por rutas

  - Usar React.lazy() para páginas principales
  - Agregar Suspense con SkeletonLoader
  - _Requirements: 7.14_

- [x] 18.2 Optimizar imágenes

  - Implementar lazy loading para avatares y logos
  - Agregar blur placeholder durante carga
  - _Requirements: 7.14_

- [x] 18.3 Configurar bundle size limits

  - Configurar Vite para alertar si bundle > 200KB (gzipped)
  - Analizar bundle con rollup-plugin-visualizer
  - _Requirements: 7.14_

- [x] 19. Accesibilidad (A11y)

- [x] 19.1 Verificar contraste de colores

  - Asegurar WCAG 2.2 AA compliance
  - Usar slate-900 sobre fondos claros
  - Verificar con herramientas de contraste
  - _Requirements: 7.11_

- [x] 19.2 Agregar navegación por teclado

  - Asegurar que todos los elementos interactivos sean accesibles con Tab
  - Agregar focus visible styles
  - _Requirements: 7.11_

- [x] 19.3 Agregar labels y ARIA attributes

  - Incluir labels en todos los campos de formulario
  - Agregar aria-label donde sea necesario
  - Agregar role attributes apropiados
  - _Requirements: 7.11_


- [x] 20. Testing y calidad de código

- [x] 20.1 Configurar Vitest y React Testing Library

  - Instalar vitest, @testing-library/react, @testing-library/jest-dom
  - Configurar vitest.config.ts
  - Crear setup file para testing-library
  - _Requirements: Testing Strategy_

- [x] 20.2 Escribir tests unitarios para utilidades

  - Test para calculateProfileCompletion
  - Test para validateEmail y validatePhone
  - Test para formatDate y formatRelativeTime
  - _Requirements: Testing Strategy_

- [x] 20.3 Escribir tests de integración para flujos principales

  - Test para flujo de agendamiento de entrevista
  - Test para flujo de auto-save en perfil
  - Test para navegación en historial de aplicaciones
  - _Requirements: Testing Strategy_

- [x] 20.4 Configurar ESLint y Prettier

  - Instalar y configurar ESLint con reglas para React y TypeScript
  - Configurar Prettier para formateo consistente
  - Agregar scripts de lint y format en package.json
  - _Requirements: 15.1_

- [x] 20.5 Configurar Lighthouse CI

  - Agregar Lighthouse CI al pipeline
  - Verificar métricas: FCP < 1.5s, LCP < 2.5s, TTI < 3.5s, CLS < 0.1
  - _Requirements: Testing Strategy_

- [x] 21. Documentación y deployment

- [x] 21.1 Crear README.md

  - Documentar requisitos del sistema (Node 16.20.2)
  - Incluir instrucciones de instalación y ejecución
  - Documentar estructura del proyecto
  - Agregar screenshots de la aplicación
  - _Requirements: 15.8_

- [x] 21.2 Crear variables de entorno

  - Crear .env.example con todas las variables necesarias
  - Documentar cada variable en README
  - _Requirements: Deployment_

- [x] 21.3 Configurar build para producción

  - Optimizar configuración de Vite para producción
  - Verificar que bundle cumple con límites de tamaño
  - Probar build localmente con `npm run preview`
  - _Requirements: 15.1_

- [x] 21.4 Crear guía de contribución

  - Documentar convenciones de código
  - Explicar flujo de trabajo con Git
  - Incluir guía de testing
  - _Requirements: Documentation_

- [x] 22. Integración final y pulido






- [x] 22.1 Integrar todos los componentes en Dashboard



  - Conectar ApplicationTracker con datos reales de mock
  - Integrar GamificationPanel con cálculo de profile completion
  - Asegurar que todas las interacciones funcionen correctamente
  - _Requirements: 1.1, 4.1, 7.4_

- [x] 22.2 Verificar responsive design en todos los breakpoints



  - Probar en móvil (< 768px), tablet (768-1024px), desktop (> 1024px)
  - Verificar que Bento Grid se adapta correctamente
  - Asegurar que bottom navigation funciona en móvil
  - _Requirements: 7.14_

- [x] 22.3 Verificar flujos completos end-to-end



  - Flujo: Ver postulación → Agendar entrevista → Confirmar
  - Flujo: Completar perfil → Ver progreso → Ganar badge
  - Flujo: Ver rechazo → Leer feedback → Ver recomendaciones
  - Flujo: Exportar datos → Ejercer derecho al olvido
  - _Requirements: All_

- [x] 22.4 Pulir animaciones y transiciones



  - Verificar que todas las animaciones son suaves (200-400ms)
  - Asegurar que pulse animation funciona en badges "En Proceso"
  - Verificar que confetti se dispara al ganar badges
  - Probar skeleton loaders en todos los componentes
  - _Requirements: 7.8, 7.9, 7.10, 8.1, 8.2, 8.3_

- [x] 22.5 Realizar pruebas de accesibilidad final



  - Ejecutar axe-core en todas las páginas
  - Verificar navegación completa por teclado
  - Probar con screen reader
  - Verificar contraste de colores en todos los componentes
  - _Requirements: 7.11, 7.12_
