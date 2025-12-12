# ClearHire ATS - El "FedEx" del Reclutamiento

![ClearHire Logo](https://via.placeholder.com/800x200/3B82F6/FFFFFF?text=ClearHire+ATS)

## 🌟 Descripción

ClearHire es un **Applicant Tracking System (ATS)** revolucionario diseñado específicamente para el mercado latinoamericano. A diferencia de sistemas opacos tradicionales, ClearHire implementa una **arquitectura "GlassBox"** que permite a los candidatos rastrear el estado exacto de sus postulaciones con el mismo nivel de detalle que el seguimiento de paquetes de FedEx.

### Características Principales

✨ **Transparencia Radical**
- Rastreo granular de cada sub-etapa del proceso de reclutamiento
- Información del reclutador asignado con avatar y nombre
- Tiempos estimados basados en datos históricos

🎮 **Gamificación Inteligente**
- Medidor de completitud de perfil (0-100%)
- Sistema de insignias (Early Bird, Skill Master, Perfect Profile)
- Fast Pass Premium ($5/mes) para ver ranking exacto

💬 **Feedback Constructivo**
- Explicaciones empáticas generadas por IA
- Recomendaciones accionables con recursos específicos
- Categorías legales de rechazo transparentes

🔒 **Privacidad por Diseño**
- Cumplimiento LGPD (Brasil) y LFPDPPP (México)
- Derecho al Olvido implementado
- Exportación de datos en PDF

📱 **Mobile-First & PWA**
- Diseño responsive optimizado para móviles
- Glassmorphism y Bento Grid layout
- Animaciones suaves y micro-interacciones

🌎 **Cultura LATAM**
- Integración con WhatsApp para notificaciones
- Tono cercano y empático en español
- Datos mock realistas (Colombia, México, Brasil)

## 🚀 Tecnologías

- **Framework**: React 18.2.0 + TypeScript 5.0.x
- **Build Tool**: Vite 4.x
- **Styling**: Tailwind CSS 3.x
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **PWA**: Vite Plugin PWA + Workbox

## 📋 Requisitos del Sistema

- **Node.js**: 16.20.2 (requerido)
- **npm**: 8.19.4 o superior

## 🛠️ Instalación

```bash
# Verificar versión de Node
node --version
# Debe mostrar: v16.20.2

# Clonar el repositorio
git clone <repository-url>
cd clearhire-ats

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El servidor estará disponible en `http://localhost:5173/`

## 📦 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo

# Producción
npm run build        # Construye para producción
npm run preview      # Preview del build de producción

# Calidad de Código
npm run lint         # Ejecuta ESLint
npm run format       # Formatea código con Prettier
npm run type-check   # Verifica tipos TypeScript
```

## 🏗️ Estructura del Proyecto

```
clearhire-ats/
├── src/
│   ├── components/
│   │   ├── core/              # Componentes reutilizables
│   │   ├── application/       # Rastreador de postulaciones
│   │   ├── feedback/          # Sistema de feedback
│   │   ├── gamification/      # Gamificación y badges
│   │   ├── profile/           # Perfil del candidato
│   │   ├── scheduler/         # Agendamiento de entrevistas
│   │   ├── notifications/     # Sistema de notificaciones
│   │   ├── salary/            # Calculadora de salarios
│   │   └── privacy/           # Controles de privacidad
│   ├── hooks/                 # Custom React hooks
│   ├── services/              # API y mock data
│   ├── types/                 # TypeScript types
│   ├── utils/                 # Utilidades
│   └── styles/                # Estilos globales y animaciones
├── docs/                      # 📚 Documentación técnica completa
├── public/                    # Assets estáticos
└── package.json
```

## 📚 Documentación

Toda la documentación técnica del proyecto está organizada en la carpeta [`docs/`](./docs/):

- **[INDEX.md](./docs/INDEX.md)** - Índice completo de toda la documentación
- Implementaciones de características
- Correcciones y mejoras
- Flujos end-to-end
- Auditorías de calidad

Para más detalles, consulta el [índice de documentación](./docs/INDEX.md).

## 🎨 Sistema de Diseño

### Paleta de Colores

- **Primary**: #3B82F6 (Azul Confianza)
- **Success**: #10B981 (Verde Progreso)
- **Warning**: #F59E0B (Amarillo Atención)
- **Danger**: #EF4444 (Rojo Rechazo)
- **Background**: #F8FAFC (Limpio/Clínico)

### Tipografía

- **Font Family**: Inter, Plus Jakarta Sans
- **Escala**: 12px - 36px con line-heights optimizados

### Componentes Core

- **Button**: 5 variantes (primary, success, danger, ghost, premium)
- **Card**: 3 variantes (glass, solid, elevated)
- **Modal**: Con glassmorphism backdrop
- **BottomSheet**: Para móvil (sliding drawer)
- **SkeletonLoader**: Con animación shimmer

## 📊 Mock Data

El proyecto incluye datos de ejemplo realistas para LATAM:

- **Empresas**: Fintech Andina S.A. (Colombia), Desarrollos Monterrey (México), Tech Solutions Brasil
- **Aplicaciones**: 3 ejemplos (activa, rechazada con feedback, aprobada)
- **Reclutadores**: Perfiles con nombres en español/portugués
- **Feedback**: Recomendaciones para Docker, CI/CD, React Hooks

## 🔐 Cumplimiento Legal

ClearHire cumple con las principales regulaciones de privacidad de LATAM:

- **LGPD** (Brasil): Lei Geral de Proteção de Dados
- **LFPDPPP** (México): Ley Federal de Protección de Datos Personales

### Funcionalidades de Privacidad

- Derecho al Olvido (borrado completo de datos)
- Exportación de datos en PDF
- Avisos de privacidad en lenguaje claro
- Consentimiento explícito para notificaciones

## 🌐 Internacionalización

- **Idioma Principal**: Español (es-MX, es-CO, es-AR)
- **Futuro**: Português (pt-BR), English (en-US)
- Formato de fechas localizado
- Números de teléfono con código de país

## ✅ Estado del Proyecto: COMPLETADO

### Fase 1 - Frontend Completo ✅ (100%)
- ✅ Componentes core y sistema de diseño glassmorphism
- ✅ Application Tracker con rastreo granular
- ✅ Sistema de feedback constructivo con IA
- ✅ Gamificación con badges y Fast Pass
- ✅ Formulario de perfil completo con auto-save
- ✅ Scheduler de entrevistas con WhatsApp
- ✅ Historial de múltiples postulaciones
- ✅ Controles de privacidad (exportar/eliminar datos)
- ✅ PWA con offline support
- ✅ Accesibilidad WCAG 2.2 AA
- ✅ Responsive design (mobile/tablet/desktop)
- ✅ Animaciones y micro-interacciones
- ✅ Mock data realista para LATAM
- ✅ Testing y documentación completa

**Total: 22 tareas principales completadas**

### Fase 2 - Backend Integration (Futuro)
- [ ] API REST con Node.js/Express
- [ ] Base de datos PostgreSQL
- [ ] Autenticación JWT
- [ ] Integración real con WhatsApp Business API
- [ ] WebSockets para updates en tiempo real
- [ ] Dashboard para reclutadores
- [ ] Analytics y reportes

### Fase 3 - Features Avanzados (Futuro)
- [ ] Dark mode
- [ ] Soporte multiidioma (portugués)
- [ ] Video entrevistas integradas
- [ ] Chat en tiempo real
- [ ] Notificaciones push
- [ ] A/B testing
- [ ] Machine Learning para matching

## 🤝 Contribución

Este proyecto sigue las mejores prácticas de desarrollo:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Equipo

Desarrollado con ❤️ para revolucionar el reclutamiento en LATAM.

## 📞 Contacto

- **Website**: [clearhire.com](https://clearhire.com)
- **Email**: contact@clearhire.com
- **Twitter**: [@ClearHireATS](https://twitter.com/ClearHireATS)

---

**ClearHire © 2025** - Arquitectura GlassBox para LATAM 🌎
