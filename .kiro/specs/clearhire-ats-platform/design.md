# Design Document - ClearHire ATS Platform

## Overview

ClearHire es una Progressive Web App (PWA) construida con React 18, TypeScript, Tailwind CSS y Lucide Icons que revoluciona el reclutamiento en LATAM mediante transparencia radical. La arquitectura "GlassBox" permite a los candidatos rastrear sus postulaciones con el mismo nivel de detalle que el seguimiento de paquetes de FedEx, mientras cumple con regulaciones de privacidad (LGPD/LFPDPPP) y se adapta a las preferencias culturales de la región.

### Principios de Diseño

1. **Transparencia Radical**: Cada sub-etapa del proceso es visible con detalles granulares
2. **Mobile-First**: Optimizado para usuarios que revisan desde transporte público
3. **Privacidad por Diseño**: Cumplimiento LGPD/LFPDPPP con Derecho al Olvido
4. **UX Premium 2025**: Glassmorphism, Bento Grid, micro-interacciones y accesibilidad WCAG 2.2 AA
5. **Cultura LATAM**: Integración WhatsApp, tono empático, datos en español

### Stack Tecnológico

- **Runtime**: Node.js 16.20.2
- **Framework**: React 18.2.0 con TypeScript 4.9.x/5.0.x
- **Build Tool**: Vite 4.x
- **Styling**: Tailwind CSS 3.x
- **Icons**: lucide-react
- **Animations**: CSS Transitions + Framer Motion (opcional)
- **PWA**: Workbox para service workers

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     ClearHire PWA                           │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Candidate  │  │  Recruiter   │  │    Admin     │    │
│  │     View     │  │     View     │  │     View     │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
│         │                  │                  │             │
│         └──────────────────┴──────────────────┘             │
│                            │                                │
│                   ┌────────▼────────┐                       │
│                   │  Core Components │                      │
│                   │   & State Mgmt   │                      │
│                   └────────┬────────┘                       │
│                            │                                │
│         ┌──────────────────┼──────────────────┐            │
│         │                  │                  │             │
│    ┌────▼────┐      ┌─────▼─────┐     ┌─────▼─────┐      │
│    │ Data    │      │ Services  │     │  Utils    │      │
│    │ Layer   │      │ (API/Mock)│     │ (Helpers) │      │
│    └─────────┘      └───────────┘     └───────────┘      │
└─────────────────────────────────────────────────────────────┘
```


### Component Architecture

La aplicación sigue una arquitectura de componentes modulares con separación clara de responsabilidades:

```
src/
├── components/
│   ├── core/                    # Componentes reutilizables base
│   │   ├── Button/
│   │   ├── Card/
│   │   ├── Modal/
│   │   ├── BottomSheet/
│   │   └── SkeletonLoader/
│   ├── application/             # Componentes del rastreador
│   │   ├── ApplicationTracker/
│   │   ├── TimelineCard/
│   │   ├── StatusBadge/
│   │   └── ApplicationHistory/
│   ├── feedback/                # Sistema de feedback
│   │   ├── FeedbackCard/
│   │   ├── RejectionReason/
│   │   ├── AIExplanation/
│   │   └── ActionableGrowth/
│   ├── gamification/            # Gamificación y monetización
│   │   ├── GamificationPanel/
│   │   ├── ProfileMeter/
│   │   ├── BadgeCollection/
│   │   └── FastPassWidget/
│   ├── profile/                 # Perfil del candidato
│   │   ├── ProfileForm/
│   │   ├── PersonalInfoTab/
│   │   ├── ExperienceSection/
│   │   ├── EducationSection/
│   │   ├── SkillsSection/
│   │   └── ReferencesSection/
│   ├── scheduler/               # Agendamiento
│   │   ├── SchedulerInterface/
│   │   ├── CalendarSlots/
│   │   └── WhatsAppToggle/
│   └── privacy/                 # Controles de privacidad
│       ├── PrivacyControls/
│       └── DataExportButton/
├── layouts/
│   ├── BentoGrid/               # Layout principal tipo Bento
│   ├── CandidateLayout/
│   └── RecruiterLayout/
├── hooks/                       # Custom React hooks
│   ├── useApplicationData.ts
│   ├── useProfileCompletion.ts
│   ├── useAutoSave.ts
│   └── useWhatsAppNotifications.ts
├── services/                    # Servicios y API
│   ├── api/
│   │   ├── applications.ts
│   │   ├── profile.ts
│   │   └── scheduler.ts
│   └── mock/
│       └── mockData.ts
├── utils/                       # Utilidades
│   ├── validation.ts
│   ├── formatting.ts
│   ├── pdfGenerator.ts
│   └── dateHelpers.ts
├── types/                       # TypeScript types
│   ├── application.ts
│   ├── profile.ts
│   └── common.ts
└── styles/                      # Estilos globales
    ├── globals.css
    └── animations.css
```


## Components and Interfaces

### 1. Application Tracker (Core Component)

**Responsabilidad**: Visualizar el estado completo de una postulación con rastreo granular estilo FedEx.

**Props Interface**:
```typescript
interface ApplicationTrackerProps {
  applicationId: string;
  onStageClick?: (stageId: string) => void;
  showScore?: boolean;
}
```

**Sub-componentes**:
- `TimelineCard`: Muestra cada etapa con detalles (reclutador, tiempo estimado)
- `StatusBadge`: Indicador visual del estado (Completado/En Proceso/Rechazado)
- `RecruiterInfo`: Avatar y nombre del reclutador asignado
- `StageTimer`: Tiempo estimado y transcurrido en la etapa actual

**Estado Interno**:
```typescript
interface ApplicationState {
  stages: Stage[];
  currentStage: string;
  overallScore?: number;
  availablePositions: number;
}

interface Stage {
  id: string;
  name: string;
  status: 'completed' | 'in_progress' | 'rejected' | 'pending';
  recruiter?: RecruiterInfo;
  estimatedDays: number;
  actualDays?: number;
  score?: number;
  startDate: Date;
  endDate?: Date;
}
```

**Diseño Visual**:
- Glassmorphism: `backdrop-blur-md bg-white/80 border border-white/20`
- Sombras suaves: `shadow-xl shadow-slate-200/50`
- Timeline vertical con líneas conectoras animadas
- Badges pulsantes para estados "En Proceso"


### 2. Feedback Card (Rejection System)

**Responsabilidad**: Proporcionar feedback constructivo y empático cuando una postulación es rechazada.

**Props Interface**:
```typescript
interface FeedbackCardProps {
  applicationId: string;
  rejectionData: RejectionData;
  onActionClick?: (action: string) => void;
}

interface RejectionData {
  category: string; // "Brecha de Habilidades Técnicas", etc.
  aiExplanation: string;
  recommendations: Recommendation[];
  score: number;
}

interface Recommendation {
  id: string;
  skill: string;
  resource: string;
  resourceUrl: string;
  priority: 'high' | 'medium' | 'low';
}
```

**Sub-componentes**:
- `RejectionReason`: Dropdown de solo lectura con categoría legal
- `AIExplanation`: Texto empático generado por IA
- `ActionableGrowth`: Lista de recomendaciones con enlaces a recursos

**Diseño Visual**:
- Tono empático: Colores cálidos pero profesionales
- Iconos de crecimiento (TrendingUp, BookOpen)
- Cards de recomendaciones con hover effects
- Botón CTA: "Guardar Recomendaciones"


### 3. Gamification Panel

**Responsabilidad**: Motivar al candidato mediante progreso visual, badges y opciones premium.

**Props Interface**:
```typescript
interface GamificationPanelProps {
  userId: string;
  profileCompletion: number;
  badges: Badge[];
  hasFastPass: boolean;
  ranking?: number;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
  rarity: 'common' | 'rare' | 'epic';
}
```

**Sub-componentes**:
- `ProfileMeter`: Barra circular (0-100%) con animación
- `BadgeCollection`: Grid de insignias con tooltips
- `FastPassWidget`: Widget premium destacado

**Diseño Visual**:
- Bento Grid: Bloque cuadrado pequeño en dashboard
- ProfileMeter: Circular progress con gradiente
- Badges: Cards con efecto shimmer al ganar
- FastPass: Estilo premium con gradiente dorado y icono de corona

**Lógica de Gamificación**:
```typescript
const calculateProfileCompletion = (profile: Profile): number => {
  const weights = {
    personalInfo: 20,
    experience: 25,
    education: 20,
    skills: 15,
    languages: 10,
    references: 10
  };
  // Calcular porcentaje basado en campos completados
};
```


### 4. Profile Form (Complete Candidate Profile)

**Responsabilidad**: Gestionar el perfil completo del candidato con auto-guardado y validación en tiempo real.

**Props Interface**:
```typescript
interface ProfileFormProps {
  userId: string;
  initialData?: Profile;
  onUpdate?: (profile: Profile) => void;
}

interface Profile {
  personalInfo: PersonalInfo;
  experience: WorkExperience[];
  education: Education[];
  languages: Language[];
  softSkills: string[];
  trades: string[];
  references: Reference[];
  cv?: File;
}

interface PersonalInfo {
  firstName: string;
  lastName: string;
  country: string; // Combobox
  phone: string; // Validated format
  email: string; // Validated format
}

interface WorkExperience {
  id: string;
  company: string;
  position: string; // Combobox
  startDate: Date;
  endDate?: Date;
  description: string; // "Descripción de las funciones laborales"
  current: boolean;
}

interface Reference {
  id: string;
  name: string;
  email: string; // Validated
  phone: string; // Validated
  attachment?: File;
}
```

**Sub-componentes**:
- `PersonalInfoTab`: Datos básicos con validación
- `ExperienceSection`: Lista ordenada por fecha descendente
- `EducationSection`: Títulos con comboboxes
- `SkillsSection`: Multi-select para idiomas y habilidades blandas
- `ReferencesSection`: Referencias con adjuntos individuales

**Auto-Save Logic**:
```typescript
const useAutoSave = (data: Profile, delay: number = 1000) => {
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSaving(true);
      saveProfile(data).then(() => setIsSaving(false));
    }, delay);
    
    return () => clearTimeout(timer);
  }, [data]);
  
  return { isSaving };
};
```

**Validación**:
- Email: Regex RFC 5322
- Teléfono: Formato internacional con código de país
- Mensajes de error en rojo debajo del campo
- Validación en tiempo real (onChange)


### 5. Scheduler Interface

**Responsabilidad**: Agendar entrevistas y gestionar notificaciones por WhatsApp.

**Props Interface**:
```typescript
interface SchedulerInterfaceProps {
  applicationId: string;
  availableSlots: TimeSlot[];
  onConfirm: (slot: TimeSlot) => void;
  whatsappEnabled: boolean;
  onWhatsAppToggle: (enabled: boolean) => void;
}

interface TimeSlot {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  available: boolean;
  recruiterName: string;
}
```

**Sub-componentes**:
- `CalendarSlots`: Grid de fechas disponibles
- `WhatsAppToggle`: Checkbox prominente con icono
- `ConfirmationModal`: Modal de confirmación de fecha

**Flujo de Agendamiento**:
1. Usuario llega a etapa "Evaluación Técnica"
2. Sistema muestra slots disponibles
3. Usuario selecciona fecha
4. Usuario confirma → Timeline se actualiza
5. Si no confirma antes del deadline → Sistema asigna automáticamente

**Diseño Visual**:
- Calendar: Grid responsive con días disponibles destacados
- WhatsApp Toggle: Verde con icono de WhatsApp
- Bottom Sheet para selección en móvil


### 6. Application History (Multiple Applications)

**Responsabilidad**: Gestionar y visualizar múltiples postulaciones con navegación tipo acordeón.

**Props Interface**:
```typescript
interface ApplicationHistoryProps {
  userId: string;
  applications: Application[];
  selectedId?: string;
  onSelect: (id: string) => void;
}

interface Application {
  id: string;
  company: string;
  position: string;
  status: 'active' | 'approved' | 'rejected';
  appliedDate: Date;
  lastUpdate: Date;
  availablePositions: number;
  currentStage?: string;
  finalScore?: number;
}
```

**Diseño de Acordeón**:
```typescript
// Estado de expansión
const [expandedId, setExpandedId] = useState<string | null>(null);

// Al hacer clic en una aplicación
const handleSelect = (id: string) => {
  setExpandedId(expandedId === id ? null : id);
  onSelect(id);
};
```

**Diseño Visual**:
- Lista colapsable con badges de estado
- Contador de aplicaciones por categoría: "Activas (3)"
- Botón "Volver al Historial" cuando está expandido
- Transiciones suaves con Framer Motion
- Filtros por empresa, posición, fecha

**UX Flow**:
1. Vista inicial: Lista colapsada con resumen
2. Click en aplicación: Expande y colapsa otras
3. Vista expandida: Muestra ApplicationTracker completo
4. Botón volver: Colapsa y regresa a lista


### 7. Privacy Controls

**Responsabilidad**: Permitir al candidato ejercer sus derechos de privacidad (LGPD/LFPDPPP).

**Props Interface**:
```typescript
interface PrivacyControlsProps {
  userId: string;
  onDataExport: () => void;
  onDataDeletion: () => void;
}
```

**Sub-componentes**:
- `DataExportButton`: Botón para descargar datos en PDF
- `DataDeletionButton`: Botón de peligro para Derecho al Olvido
- `PrivacyNotice`: Texto explicativo de políticas

**Flujo de Derecho al Olvido**:
1. Usuario hace clic en "Retirar postulación y olvidar mis datos"
2. Modal de confirmación con advertencia de irreversibilidad
3. Usuario confirma → Sistema simula borrado
4. Mensaje de éxito y redirección

**Exportación de Datos**:
```typescript
interface ExportData {
  profile: Profile;
  applications: {
    active: Application[];
    approved: Application[];
    rejected: Application[];
  };
  generatedAt: Date;
}

const generatePDF = (data: ExportData): Blob => {
  // Usar jsPDF o similar
  // Formato estándar con secciones claras
  // Nombre: ClearHire_Datos_[Nombre]_[Apellido]_[Fecha].pdf
};
```

**Diseño Visual**:
- Botón "Descargar Mis Datos": Azul con icono Download
- Botón "Retirar y Olvidar": Rojo suave con icono AlertTriangle
- Modal de confirmación: Glassmorphism con backdrop blur


## Data Models

### Core Data Structures

```typescript
// Application & Tracking
interface Application {
  id: string;
  candidateId: string;
  jobId: string;
  company: string;
  position: string;
  availablePositions: number;
  status: ApplicationStatus;
  stages: Stage[];
  currentStageId: string;
  appliedDate: Date;
  lastUpdate: Date;
  finalScore?: number;
  interviewDate?: Date;
  interviewConfirmed: boolean;
}

type ApplicationStatus = 'active' | 'approved' | 'rejected' | 'withdrawn';

interface Stage {
  id: string;
  name: string;
  order: number;
  status: StageStatus;
  recruiter?: RecruiterInfo;
  estimatedDays: number;
  actualDays?: number;
  score?: number;
  startDate: Date;
  endDate?: Date;
  feedback?: StageFeedback;
}

type StageStatus = 'pending' | 'in_progress' | 'completed' | 'rejected';

interface RecruiterInfo {
  id: string;
  name: string;
  avatar: string;
  title: string;
}

interface StageFeedback {
  category: string;
  aiExplanation: string;
  recommendations: Recommendation[];
}

// Profile & Candidate Data
interface Candidate {
  id: string;
  profile: Profile;
  gamification: GamificationData;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

interface Profile {
  personalInfo: PersonalInfo;
  experience: WorkExperience[];
  education: Education[];
  languages: Language[];
  softSkills: string[];
  trades: string[];
  references: Reference[];
  cv?: FileAttachment;
}

interface PersonalInfo {
  firstName: string;
  lastName: string;
  country: string;
  phone: string;
  email: string;
}

interface WorkExperience {
  id: string;
  company: string;
  position: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  description: string;
  order: number; // Para ordenamiento
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  graduationYear: number;
}

interface Language {
  name: string;
  proficiency: 'Básico' | 'Intermedio' | 'Avanzado' | 'Nativo';
}

interface Reference {
  id: string;
  name: string;
  email: string;
  phone: string;
  attachment?: FileAttachment;
}

interface FileAttachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: Date;
}

// Gamification
interface GamificationData {
  profileCompletion: number;
  badges: Badge[];
  hasFastPass: boolean;
  ranking?: number;
  totalApplications: number;
  successRate: number;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
  rarity: 'common' | 'rare' | 'epic';
}

// Preferences & Settings
interface UserPreferences {
  whatsappNotifications: boolean;
  emailNotifications: boolean;
  language: 'es' | 'pt' | 'en';
  timezone: string;
}

// Scheduling
interface InterviewSchedule {
  applicationId: string;
  availableSlots: TimeSlot[];
  selectedSlot?: TimeSlot;
  confirmedAt?: Date;
  deadline: Date;
}

interface TimeSlot {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  available: boolean;
  recruiterName: string;
  location?: string;
  type: 'presencial' | 'virtual';
}
```


## Error Handling

### Error Types

```typescript
enum ErrorType {
  VALIDATION = 'validation',
  NETWORK = 'network',
  AUTH = 'auth',
  NOT_FOUND = 'not_found',
  SERVER = 'server',
  PERMISSION = 'permission'
}

interface AppError {
  type: ErrorType;
  message: string;
  details?: string;
  field?: string; // Para errores de validación
  code?: string;
}
```

### Error Handling Strategy

**1. Validación de Formularios**:
- Validación en tiempo real (onChange)
- Mensajes en español, claros y específicos
- Mostrar debajo del campo con color rojo (#EF4444)
- Ejemplos:
  - "El correo electrónico no es válido"
  - "El teléfono debe incluir código de país (+52, +55, etc.)"
  - "Este campo es obligatorio"

**2. Errores de Red**:
- Toast notifications con auto-dismiss (5 segundos)
- Retry automático para operaciones críticas (3 intentos)
- Mensaje: "No se pudo conectar. Verifica tu conexión."
- Botón "Reintentar" para acciones manuales

**3. Errores de Servidor**:
- Modal con explicación clara
- Opción de reportar el error
- Mensaje: "Algo salió mal. Nuestro equipo ha sido notificado."

**4. Errores de Autenticación**:
- Redirección automática a login
- Preservar estado para retomar después
- Mensaje: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente."

**5. Manejo de Archivos**:
- Validar tamaño antes de subir (CV: 10MB, Referencias: 5MB)
- Validar tipo de archivo (solo PDF)
- Mensajes específicos:
  - "El archivo es demasiado grande. Máximo 10MB."
  - "Solo se permiten archivos PDF."

### Error Boundaries

```typescript
class ErrorBoundary extends React.Component<Props, State> {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log a servicio de monitoreo
    logErrorToService(error, errorInfo);
    
    // Mostrar UI de fallback
    this.setState({ hasError: true });
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback onReset={() => this.setState({ hasError: false })} />;
    }
    return this.props.children;
  }
}
```

### Offline Handling (PWA)

- Detectar estado offline con `navigator.onLine`
- Mostrar banner persistente: "Sin conexión. Los cambios se guardarán cuando vuelvas a estar en línea."
- Queue de operaciones pendientes
- Sincronización automática al recuperar conexión


## Testing Strategy

### Testing Pyramid

```
        ┌─────────────┐
        │   E2E (5%)  │  Cypress/Playwright
        ├─────────────┤
        │ Integration │  React Testing Library
        │    (25%)    │
        ├─────────────┤
        │    Unit     │  Vitest + RTL
        │    (70%)    │
        └─────────────┘
```

### Unit Testing

**Herramientas**: Vitest + React Testing Library

**Cobertura Objetivo**: 70% de funciones críticas

**Prioridades**:
1. Validación de formularios
2. Cálculo de profile completion
3. Formateo de fechas y datos
4. Lógica de ordenamiento (experiencia laboral)
5. Utilidades de validación (email, teléfono)

**Ejemplo**:
```typescript
describe('ProfileCompletion', () => {
  it('should calculate 100% when all fields are filled', () => {
    const profile = createCompleteProfile();
    expect(calculateProfileCompletion(profile)).toBe(100);
  });
  
  it('should calculate 20% when only personal info is filled', () => {
    const profile = createProfileWithPersonalInfo();
    expect(calculateProfileCompletion(profile)).toBe(20);
  });
});
```

### Integration Testing

**Herramientas**: React Testing Library

**Prioridades**:
1. Flujo completo de perfil (llenar y auto-guardar)
2. Navegación entre aplicaciones en historial
3. Selección y confirmación de entrevista
4. Exportación de datos a PDF
5. Flujo de Derecho al Olvido

**Ejemplo**:
```typescript
describe('Interview Scheduling Flow', () => {
  it('should allow candidate to select and confirm interview date', async () => {
    render(<SchedulerInterface {...props} />);
    
    // Seleccionar fecha
    const slot = screen.getByText('15/12/2025 10:00');
    await userEvent.click(slot);
    
    // Confirmar
    const confirmButton = screen.getByText('Confirmar Fecha');
    await userEvent.click(confirmButton);
    
    // Verificar actualización
    expect(screen.getByText('Fecha confirmada: 15/12/2025 10:00')).toBeInTheDocument();
  });
});
```

### E2E Testing

**Herramientas**: Playwright (preferido por velocidad)

**Escenarios Críticos**:
1. Candidato completa perfil y aplica a posición
2. Candidato ve múltiples postulaciones y navega entre ellas
3. Candidato agenda entrevista y recibe confirmación
4. Candidato ve feedback de rechazo y recomendaciones
5. Candidato exporta sus datos y ejerce Derecho al Olvido

**Ejemplo**:
```typescript
test('Complete candidate journey', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('[name="email"]', 'candidate@test.com');
  await page.click('button[type="submit"]');
  
  // Complete profile
  await page.goto('/profile');
  await page.fill('[name="firstName"]', 'Juan');
  await page.fill('[name="lastName"]', 'Pérez');
  
  // Wait for auto-save
  await page.waitForSelector('text=Guardado automáticamente');
  
  // View applications
  await page.goto('/applications');
  await expect(page.locator('.application-card')).toHaveCount(3);
});
```

### Accessibility Testing

**Herramientas**: axe-core + jest-axe

**Verificaciones**:
- Contraste de colores (WCAG 2.2 AA)
- Navegación por teclado
- Screen reader compatibility
- Touch targets mínimos (44x44px)
- Labels en formularios

**Ejemplo**:
```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('ApplicationTracker should have no accessibility violations', async () => {
  const { container } = render(<ApplicationTracker {...props} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Performance Testing

**Métricas Objetivo**:
- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3.5s
- Cumulative Layout Shift (CLS): < 0.1

**Herramientas**:
- Lighthouse CI en pipeline
- Web Vitals monitoring
- Bundle size analysis (webpack-bundle-analyzer)


## Design System & Visual Guidelines

### Color Palette

```typescript
const colors = {
  // Primary (Confianza)
  primary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    500: '#3B82F6', // Main
    600: '#2563EB',
    700: '#1D4ED8',
  },
  
  // Success (Progreso)
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    500: '#10B981', // Main
    600: '#059669',
  },
  
  // Warning (Atención)
  warning: {
    500: '#F59E0B',
    600: '#D97706',
  },
  
  // Danger (Rechazo/Eliminar)
  danger: {
    50: '#FEF2F2',
    500: '#EF4444',
    600: '#DC2626',
  },
  
  // Neutral (Backgrounds & Text)
  slate: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    500: '#64748B',
    700: '#334155',
    900: '#0F172A',
  },
  
  // Premium (Fast Pass)
  gold: {
    400: '#FBBF24',
    500: '#F59E0B',
  }
};
```

### Typography Scale

```css
/* Tailwind Config */
{
  fontFamily: {
    sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
  },
  fontSize: {
    xs: ['12px', { lineHeight: '16px' }],
    sm: ['14px', { lineHeight: '20px' }],
    base: ['16px', { lineHeight: '24px' }],
    lg: ['18px', { lineHeight: '28px' }],
    xl: ['20px', { lineHeight: '28px' }],
    '2xl': ['24px', { lineHeight: '32px' }],
    '3xl': ['30px', { lineHeight: '36px' }],
    '4xl': ['36px', { lineHeight: '40px' }],
  }
}
```

**Uso**:
- Títulos principales: `text-3xl font-bold text-slate-900`
- Subtítulos: `text-xl font-semibold text-slate-700`
- Body text: `text-base text-slate-700`
- Captions: `text-sm text-slate-500`

### Spacing & Layout

**Bento Grid Configuration**:
```typescript
// Dashboard Layout
const bentoLayout = {
  // Large blocks
  statusCard: 'col-span-2 row-span-2', // 2x2
  timeline: 'col-span-1 row-span-3',   // 1x3
  
  // Medium blocks
  gamification: 'col-span-2 row-span-1', // 2x1
  
  // Small blocks
  badges: 'col-span-1 row-span-1',     // 1x1
  fastPass: 'col-span-1 row-span-1',   // 1x1
};
```

**Spacing System**:
- Container padding: `px-4 md:px-6 lg:px-8`
- Section spacing: `space-y-6 md:space-y-8`
- Card padding: `p-6`
- Button padding: `px-6 py-3`

### Glassmorphism Effects

```css
/* Card Base */
.glass-card {
  @apply backdrop-blur-md bg-white/80 border border-white/20;
  @apply shadow-xl shadow-slate-200/50;
  @apply rounded-2xl;
}

/* Modal Backdrop */
.glass-backdrop {
  @apply backdrop-blur-sm bg-slate-900/20;
}

/* Navigation Bar */
.glass-nav {
  @apply backdrop-blur-lg bg-white/90 border-t border-white/20;
  @apply shadow-lg shadow-slate-200/30;
}
```

### Animations

**Pulsating Badge (In Progress)**:
```css
@keyframes pulse-glow {
  0%, 100% {
    opacity: 1;
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
  }
  50% {
    opacity: 0.8;
    box-shadow: 0 0 0 8px rgba(59, 130, 246, 0);
  }
}

.status-in-progress {
  animation: pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

**Skeleton Loader**:
```css
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.skeleton {
  @apply bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200;
  background-size: 2000px 100%;
  animation: shimmer 2s infinite linear;
}
```

**Confetti Effect (Badge Earned)**:
```typescript
// Usar react-confetti o canvas-confetti
import confetti from 'canvas-confetti';

const celebrateBadge = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#3B82F6', '#10B981', '#F59E0B']
  });
};
```

**Smooth Transitions**:
```css
/* Global transitions */
* {
  @apply transition-colors duration-200 ease-in-out;
}

/* Layout animations */
.accordion-content {
  @apply transition-all duration-300 ease-in-out;
}

/* Progress bar */
.progress-fill {
  @apply transition-all duration-500 ease-out;
}
```

### Component Patterns

**Button Variants**:
```typescript
const buttonVariants = {
  primary: 'bg-primary-500 hover:bg-primary-600 text-white',
  success: 'bg-success-500 hover:bg-success-600 text-white',
  danger: 'bg-danger-500 hover:bg-danger-600 text-white',
  ghost: 'bg-transparent hover:bg-slate-100 text-slate-700',
  premium: 'bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-500 hover:to-gold-600 text-white',
};
```

**Card Variants**:
```typescript
const cardVariants = {
  glass: 'backdrop-blur-md bg-white/80 border border-white/20 shadow-xl',
  solid: 'bg-white border border-slate-200 shadow-lg',
  elevated: 'bg-white shadow-2xl shadow-slate-200/50',
};
```

**Touch Targets**:
```css
/* Minimum 44x44px for mobile */
.touch-target {
  @apply min-h-[44px] min-w-[44px];
  @apply flex items-center justify-center;
}
```


## Mobile-First Responsive Design

### Breakpoints

```typescript
const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
};
```

### Layout Adaptations

**Dashboard (Bento Grid)**:
```typescript
// Mobile (< 768px): Single column
<div className="grid grid-cols-1 gap-4">
  
// Tablet (768px - 1024px): 2 columns
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
  
// Desktop (> 1024px): 3 columns with custom spans
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
```

**Navigation**:
- Mobile: Bottom navigation bar (thumb zone)
- Desktop: Side navigation or top bar

**Modals vs Bottom Sheets**:
```typescript
const useResponsiveModal = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  return isMobile ? 'bottom-sheet' : 'modal';
};
```

### Touch Optimization

**Thumb Zone Mapping**:
```
┌─────────────────┐
│                 │ ← Hard to reach
│                 │
│                 │ ← Natural reach
│                 │
│   [CTA Button]  │ ← Easy reach (Thumb zone)
│   [Navigation]  │ ← Easy reach
└─────────────────┘
```

**Implementation**:
- Primary CTAs: Bottom 1/3 of screen
- Secondary actions: Middle area
- Informational content: Top area (scrollable)

### Performance Optimizations

**Image Loading**:
```typescript
// Lazy loading con blur placeholder
<img 
  src={avatar} 
  loading="lazy"
  className="blur-sm transition-all duration-300"
  onLoad={(e) => e.target.classList.remove('blur-sm')}
/>
```

**Code Splitting**:
```typescript
// Route-based splitting
const ProfileForm = lazy(() => import('./components/profile/ProfileForm'));
const ApplicationHistory = lazy(() => import('./components/application/ApplicationHistory'));

// Component-based splitting for heavy components
const PDFGenerator = lazy(() => import('./utils/pdfGenerator'));
```

**Bundle Size Targets**:
- Initial bundle: < 200KB (gzipped)
- Total bundle: < 500KB (gzipped)
- Lazy-loaded chunks: < 50KB each


## State Management

### Strategy

**Local State**: React useState/useReducer para componentes individuales

**Shared State**: Context API para datos globales (usuario, preferencias)

**Server State**: Custom hooks con fetch/cache para datos de API

### Context Structure

```typescript
// User Context
interface UserContextValue {
  user: Candidate | null;
  isAuthenticated: boolean;
  login: (credentials: Credentials) => Promise<void>;
  logout: () => void;
  updateProfile: (profile: Partial<Profile>) => Promise<void>;
}

// Application Context
interface ApplicationContextValue {
  applications: Application[];
  selectedApplication: Application | null;
  selectApplication: (id: string) => void;
  refreshApplications: () => Promise<void>;
}

// Preferences Context
interface PreferencesContextValue {
  preferences: UserPreferences;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
}
```

### Custom Hooks

```typescript
// Fetch application data
const useApplicationData = (applicationId: string) => {
  const [data, setData] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    fetchApplication(applicationId)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [applicationId]);
  
  return { data, loading, error, refetch: () => fetchApplication(applicationId) };
};

// Auto-save profile
const useAutoSave = <T>(data: T, saveFn: (data: T) => Promise<void>, delay = 1000) => {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSaving(true);
      saveFn(data)
        .then(() => {
          setLastSaved(new Date());
          setIsSaving(false);
        })
        .catch((error) => {
          console.error('Auto-save failed:', error);
          setIsSaving(false);
        });
    }, delay);
    
    return () => clearTimeout(timer);
  }, [data, delay]);
  
  return { isSaving, lastSaved };
};

// Profile completion calculation
const useProfileCompletion = (profile: Profile): number => {
  return useMemo(() => {
    const weights = {
      personalInfo: 20,
      experience: 25,
      education: 20,
      skills: 15,
      languages: 10,
      references: 10,
    };
    
    let score = 0;
    
    // Personal info
    if (profile.personalInfo.firstName && profile.personalInfo.lastName) {
      score += weights.personalInfo;
    }
    
    // Experience
    if (profile.experience.length > 0) {
      score += weights.experience;
    }
    
    // Education
    if (profile.education.length > 0) {
      score += weights.education;
    }
    
    // Skills
    if (profile.softSkills.length > 0) {
      score += weights.skills;
    }
    
    // Languages
    if (profile.languages.length > 0) {
      score += weights.languages;
    }
    
    // References
    if (profile.references.length > 0) {
      score += weights.references;
    }
    
    return score;
  }, [profile]);
};

// WhatsApp notifications
const useWhatsAppNotifications = () => {
  const { preferences, updatePreferences } = usePreferences();
  
  const toggle = useCallback(() => {
    updatePreferences({
      whatsappNotifications: !preferences.whatsappNotifications
    });
  }, [preferences, updatePreferences]);
  
  return {
    enabled: preferences.whatsappNotifications,
    toggle
  };
};
```


## API Design & Mock Data

### API Endpoints (Future Backend)

```typescript
// Applications
GET    /api/applications              // List all applications for user
GET    /api/applications/:id          // Get specific application details
POST   /api/applications              // Create new application
PATCH  /api/applications/:id          // Update application
DELETE /api/applications/:id          // Withdraw application

// Profile
GET    /api/profile                   // Get user profile
PATCH  /api/profile                   // Update profile (auto-save)
POST   /api/profile/export            // Export profile data as PDF

// Scheduling
GET    /api/applications/:id/slots    // Get available interview slots
POST   /api/applications/:id/schedule // Confirm interview slot

// Privacy
POST   /api/profile/delete            // Exercise right to be forgotten
GET    /api/profile/data-export       // Download all user data

// Gamification
GET    /api/gamification/badges       // Get user badges
GET    /api/gamification/ranking      // Get ranking (Fast Pass only)
```

### Mock Data Structure

```typescript
// mockData.ts
export const mockCompanies = [
  {
    id: '1',
    name: 'Fintech Andina S.A.',
    country: 'Colombia',
    logo: '/logos/fintech-andina.png',
  },
  {
    id: '2',
    name: 'Desarrollos Monterrey',
    country: 'México',
    logo: '/logos/desarrollos-monterrey.png',
  },
  {
    id: '3',
    name: 'Tech Solutions Brasil',
    country: 'Brasil',
    logo: '/logos/tech-solutions.png',
  },
];

export const mockRecruiters = [
  {
    id: '1',
    name: 'María González',
    title: 'Reclutadora Senior',
    avatar: '/avatars/maria.jpg',
  },
  {
    id: '2',
    name: 'Carlos Rodríguez',
    title: 'Tech Lead',
    avatar: '/avatars/carlos.jpg',
  },
  {
    id: '3',
    name: 'Ana Silva',
    title: 'HR Manager',
    avatar: '/avatars/ana.jpg',
  },
];

export const mockApplications: Application[] = [
  {
    id: 'app-1',
    candidateId: 'user-1',
    jobId: 'job-1',
    company: 'Fintech Andina S.A.',
    position: 'Desarrollador Full Stack Senior',
    availablePositions: 2,
    status: 'active',
    appliedDate: new Date('2025-11-20'),
    lastUpdate: new Date('2025-12-01'),
    interviewConfirmed: false,
    currentStageId: 'stage-3',
    stages: [
      {
        id: 'stage-1',
        name: 'Recibido',
        order: 1,
        status: 'completed',
        estimatedDays: 1,
        actualDays: 1,
        startDate: new Date('2025-11-20'),
        endDate: new Date('2025-11-21'),
        score: 100,
      },
      {
        id: 'stage-2',
        name: 'Revisión Técnica',
        order: 2,
        status: 'completed',
        recruiter: mockRecruiters[1],
        estimatedDays: 5,
        actualDays: 4,
        startDate: new Date('2025-11-21'),
        endDate: new Date('2025-11-25'),
        score: 85,
      },
      {
        id: 'stage-3',
        name: 'Evaluación Técnica',
        order: 3,
        status: 'in_progress',
        recruiter: mockRecruiters[1],
        estimatedDays: 7,
        startDate: new Date('2025-11-25'),
      },
      {
        id: 'stage-4',
        name: 'Entrevista Cultural',
        order: 4,
        status: 'pending',
        recruiter: mockRecruiters[0],
        estimatedDays: 3,
      },
      {
        id: 'stage-5',
        name: 'Oferta',
        order: 5,
        status: 'pending',
        estimatedDays: 2,
      },
    ],
  },
  {
    id: 'app-2',
    candidateId: 'user-1',
    jobId: 'job-2',
    company: 'Desarrollos Monterrey',
    position: 'Frontend Developer React',
    availablePositions: 1,
    status: 'rejected',
    appliedDate: new Date('2025-11-10'),
    lastUpdate: new Date('2025-11-18'),
    finalScore: 65,
    currentStageId: 'stage-2',
    stages: [
      {
        id: 'stage-1',
        name: 'Recibido',
        order: 1,
        status: 'completed',
        estimatedDays: 1,
        actualDays: 1,
        startDate: new Date('2025-11-10'),
        endDate: new Date('2025-11-11'),
        score: 100,
      },
      {
        id: 'stage-2',
        name: 'Revisión Técnica',
        order: 2,
        status: 'rejected',
        recruiter: mockRecruiters[2],
        estimatedDays: 5,
        actualDays: 7,
        startDate: new Date('2025-11-11'),
        endDate: new Date('2025-11-18'),
        score: 65,
        feedback: {
          category: 'Brecha de Habilidades Técnicas',
          aiExplanation: 'Hemos revisado cuidadosamente tu perfil y experiencia. Si bien demuestras un buen conocimiento de JavaScript, identificamos que la posición requiere experiencia más profunda en React avanzado, específicamente en hooks personalizados, optimización de rendimiento y arquitectura de aplicaciones a gran escala. Esto no refleja tu potencial, sino que la posición actual busca un perfil con más años de experiencia específica en React.',
          recommendations: [
            {
              id: 'rec-1',
              skill: 'React Hooks Avanzados',
              resource: 'Curso Avanzado de React Hooks',
              resourceUrl: 'https://example.com/react-hooks',
              priority: 'high',
            },
            {
              id: 'rec-2',
              skill: 'Optimización de Rendimiento',
              resource: 'React Performance Optimization',
              resourceUrl: 'https://example.com/react-performance',
              priority: 'high',
            },
            {
              id: 'rec-3',
              skill: 'Arquitectura de Aplicaciones',
              resource: 'Patrones de Diseño en React',
              resourceUrl: 'https://example.com/react-patterns',
              priority: 'medium',
            },
          ],
        },
      },
    ],
  },
  {
    id: 'app-3',
    candidateId: 'user-1',
    jobId: 'job-3',
    company: 'Tech Solutions Brasil',
    position: 'DevOps Engineer',
    availablePositions: 3,
    status: 'approved',
    appliedDate: new Date('2025-10-15'),
    lastUpdate: new Date('2025-11-05'),
    finalScore: 92,
    interviewDate: new Date('2025-10-28T10:00:00'),
    interviewConfirmed: true,
    currentStageId: 'stage-5',
    stages: [
      {
        id: 'stage-1',
        name: 'Recibido',
        order: 1,
        status: 'completed',
        estimatedDays: 1,
        actualDays: 1,
        startDate: new Date('2025-10-15'),
        endDate: new Date('2025-10-16'),
        score: 100,
      },
      {
        id: 'stage-2',
        name: 'Revisión Técnica',
        order: 2,
        status: 'completed',
        recruiter: mockRecruiters[1],
        estimatedDays: 5,
        actualDays: 3,
        startDate: new Date('2025-10-16'),
        endDate: new Date('2025-10-19'),
        score: 95,
      },
      {
        id: 'stage-3',
        name: 'Evaluación Técnica',
        order: 3,
        status: 'completed',
        recruiter: mockRecruiters[1],
        estimatedDays: 7,
        actualDays: 6,
        startDate: new Date('2025-10-19'),
        endDate: new Date('2025-10-25'),
        score: 90,
      },
      {
        id: 'stage-4',
        name: 'Entrevista Cultural',
        order: 4,
        status: 'completed',
        recruiter: mockRecruiters[0],
        estimatedDays: 3,
        actualDays: 3,
        startDate: new Date('2025-10-25'),
        endDate: new Date('2025-10-28'),
        score: 88,
      },
      {
        id: 'stage-5',
        name: 'Oferta',
        order: 5,
        status: 'completed',
        estimatedDays: 2,
        actualDays: 8,
        startDate: new Date('2025-10-28'),
        endDate: new Date('2025-11-05'),
        score: 92,
      },
    ],
  },
];

export const mockProfile: Profile = {
  personalInfo: {
    firstName: 'Juan',
    lastName: 'Pérez',
    country: 'México',
    phone: '+52 55 1234 5678',
    email: 'juan.perez@example.com',
  },
  experience: [
    {
      id: 'exp-1',
      company: 'Tech Startup MX',
      position: 'Desarrollador Full Stack',
      startDate: new Date('2022-01-01'),
      endDate: new Date('2025-11-01'),
      current: false,
      description: 'Desarrollo de aplicaciones web con React, Node.js y PostgreSQL. Implementación de CI/CD con GitHub Actions.',
      order: 1,
    },
    {
      id: 'exp-2',
      company: 'Agencia Digital',
      position: 'Desarrollador Frontend',
      startDate: new Date('2020-06-01'),
      endDate: new Date('2021-12-31'),
      current: false,
      description: 'Creación de sitios web responsivos con HTML, CSS, JavaScript y WordPress.',
      order: 2,
    },
  ],
  education: [
    {
      id: 'edu-1',
      institution: 'Universidad Nacional Autónoma de México',
      degree: 'Ingeniería en Computación',
      fieldOfStudy: 'Ciencias de la Computación',
      graduationYear: 2020,
    },
  ],
  languages: [
    { name: 'Español', proficiency: 'Nativo' },
    { name: 'Inglés', proficiency: 'Avanzado' },
    { name: 'Portugués', proficiency: 'Básico' },
  ],
  softSkills: ['Trabajo en Equipo', 'Liderazgo', 'Comunicación', 'Resolución de Problemas'],
  trades: ['Fotografía', 'Diseño Gráfico'],
  references: [
    {
      id: 'ref-1',
      name: 'María López',
      email: 'maria.lopez@techstartup.mx',
      phone: '+52 55 9876 5432',
    },
  ],
};

export const mockBadges: Badge[] = [
  {
    id: 'badge-1',
    name: 'Early Bird',
    description: 'Aplicaste en las primeras 24 horas',
    icon: 'sunrise',
    earnedAt: new Date('2025-11-20'),
    rarity: 'common',
  },
  {
    id: 'badge-2',
    name: 'Skill Master',
    description: 'Completaste todas las secciones de habilidades',
    icon: 'award',
    earnedAt: new Date('2025-11-22'),
    rarity: 'rare',
  },
  {
    id: 'badge-3',
    name: 'Perfect Profile',
    description: 'Alcanzaste 100% de completitud de perfil',
    icon: 'star',
    earnedAt: new Date('2025-11-25'),
    rarity: 'epic',
  },
];

export const mockTimeSlots: TimeSlot[] = [
  {
    id: 'slot-1',
    date: new Date('2025-12-10'),
    startTime: '10:00',
    endTime: '11:00',
    available: true,
    recruiterName: 'Carlos Rodríguez',
    type: 'virtual',
  },
  {
    id: 'slot-2',
    date: new Date('2025-12-10'),
    startTime: '14:00',
    endTime: '15:00',
    available: true,
    recruiterName: 'Carlos Rodríguez',
    type: 'virtual',
  },
  {
    id: 'slot-3',
    date: new Date('2025-12-12'),
    startTime: '09:00',
    endTime: '10:00',
    available: true,
    recruiterName: 'Carlos Rodríguez',
    type: 'presencial',
    location: 'Oficina Central, Bogotá',
  },
  {
    id: 'slot-4',
    date: new Date('2025-12-12'),
    startTime: '16:00',
    endTime: '17:00',
    available: false,
    recruiterName: 'Carlos Rodríguez',
    type: 'virtual',
  },
];
```

### Data Fetching Strategy

```typescript
// Service layer abstraction
export const applicationService = {
  getAll: async (): Promise<Application[]> => {
    // En producción: return fetch('/api/applications').then(r => r.json())
    return Promise.resolve(mockApplications);
  },
  
  getById: async (id: string): Promise<Application> => {
    const app = mockApplications.find(a => a.id === id);
    if (!app) throw new Error('Application not found');
    return Promise.resolve(app);
  },
  
  update: async (id: string, data: Partial<Application>): Promise<Application> => {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 500));
    return Promise.resolve({ ...mockApplications[0], ...data });
  },
};
```


## PWA Configuration

### Service Worker Strategy

**Caching Strategy**:
- **App Shell**: Cache-first (HTML, CSS, JS)
- **API Data**: Network-first with fallback
- **Images/Assets**: Cache-first with network fallback
- **User Data**: Network-only (sensitive)

### Workbox Configuration

```javascript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';

export default {
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'ClearHire - ATS Transparente',
        short_name: 'ClearHire',
        description: 'Sistema de seguimiento de postulaciones con transparencia radical',
        theme_color: '#3B82F6',
        background_color: '#F8FAFC',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.clearhire\.com\/.*$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 300, // 5 minutes
              },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 2592000, // 30 days
              },
            },
          },
        ],
      },
    }),
  ],
};
```

### Offline Support

```typescript
// Offline detection
const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return isOnline;
};

// Offline banner component
const OfflineBanner = () => {
  const isOnline = useOnlineStatus();
  
  if (isOnline) return null;
  
  return (
    <div className="fixed top-0 left-0 right-0 bg-warning-500 text-white px-4 py-2 text-center z-50">
      Sin conexión. Los cambios se guardarán cuando vuelvas a estar en línea.
    </div>
  );
};
```


## Security Considerations

### Data Privacy (LGPD/LFPDPPP Compliance)

**Principles**:
1. **Consent**: Explicit opt-in for WhatsApp notifications
2. **Transparency**: Clear privacy notices in plain language
3. **Access**: Users can export all their data
4. **Deletion**: Right to be forgotten implementation
5. **Minimization**: Only collect necessary data

**Implementation**:
```typescript
// Privacy consent tracking
interface PrivacyConsent {
  whatsappNotifications: boolean;
  dataProcessing: boolean;
  consentDate: Date;
  ipAddress?: string; // For audit trail
}

// Data deletion workflow
const deleteUserData = async (userId: string, reason: string) => {
  // 1. Log deletion request
  await auditLog.create({
    userId,
    action: 'DATA_DELETION_REQUESTED',
    reason,
    timestamp: new Date(),
  });
  
  // 2. Anonymize applications (keep for company records)
  await anonymizeApplications(userId);
  
  // 3. Delete profile data
  await deleteProfile(userId);
  
  // 4. Delete authentication
  await deleteAuth(userId);
  
  // 5. Log completion
  await auditLog.create({
    userId,
    action: 'DATA_DELETION_COMPLETED',
    timestamp: new Date(),
  });
};
```

### Input Validation

**Client-Side**:
```typescript
// Email validation
const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Phone validation (international format)
const validatePhone = (phone: string): boolean => {
  const regex = /^\+\d{1,3}\s?\d{1,14}$/;
  return regex.test(phone);
};

// File validation
const validateFile = (file: File, maxSize: number, allowedTypes: string[]): ValidationResult => {
  if (file.size > maxSize) {
    return { valid: false, error: `El archivo es demasiado grande. Máximo ${maxSize / 1024 / 1024}MB.` };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Solo se permiten archivos PDF.' };
  }
  
  return { valid: true };
};
```

**Server-Side** (Future):
- Sanitize all inputs
- Validate file types by content, not just extension
- Rate limiting on API endpoints
- CSRF protection
- SQL injection prevention (parameterized queries)

### Authentication & Authorization

**Future Implementation**:
```typescript
// JWT-based authentication
interface AuthToken {
  userId: string;
  role: 'candidate' | 'recruiter' | 'admin';
  exp: number;
}

// Protected routes
const ProtectedRoute = ({ children, requiredRole }: Props) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" />;
  }
  
  return children;
};
```

### XSS Prevention

```typescript
// Sanitize user-generated content
import DOMPurify from 'dompurify';

const SafeHTML = ({ html }: { html: string }) => {
  const sanitized = DOMPurify.sanitize(html);
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
};
```


## Internationalization (i18n)

### Language Support

**Initial**: Español (es-MX, es-CO, es-AR)
**Phase 2**: Português (pt-BR)
**Phase 3**: English (en-US)

### Implementation

```typescript
// i18n configuration
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      es: {
        translation: {
          application: {
            tracker: {
              title: 'Seguimiento de Postulación',
              stages: {
                received: 'Recibido',
                technical_review: 'Revisión Técnica',
                technical_evaluation: 'Evaluación Técnica',
                cultural_interview: 'Entrevista Cultural',
                offer: 'Oferta',
              },
              status: {
                completed: 'Completado',
                in_progress: 'En Proceso',
                rejected: 'Rechazado',
                pending: 'Pendiente',
              },
            },
          },
          profile: {
            completion: 'Completitud del Perfil',
            personal_info: 'Información Personal',
            experience: 'Experiencia Laboral',
            education: 'Educación',
            skills: 'Habilidades',
          },
          buttons: {
            save: 'Guardar',
            cancel: 'Cancelar',
            confirm: 'Confirmar',
            export: 'Exportar Datos',
            delete: 'Retirar postulación y olvidar mis datos',
          },
        },
      },
      pt: {
        translation: {
          application: {
            tracker: {
              title: 'Acompanhamento de Candidatura',
              stages: {
                received: 'Recebido',
                technical_review: 'Revisão Técnica',
                technical_evaluation: 'Avaliação Técnica',
                cultural_interview: 'Entrevista Cultural',
                offer: 'Oferta',
              },
            },
          },
        },
      },
    },
    lng: 'es',
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false,
    },
  });

// Usage in components
const { t } = useTranslation();
<h1>{t('application.tracker.title')}</h1>
```

### Date & Number Formatting

```typescript
// Date formatting by locale
const formatDate = (date: Date, locale: string = 'es-MX'): string => {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

// Relative time
const formatRelativeTime = (date: Date, locale: string = 'es-MX'): string => {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const diffInDays = Math.floor((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return rtf.format(diffInDays, 'day');
};
```


## Deployment & DevOps

### Build Configuration

```json
// package.json
{
  "name": "clearhire-ats",
  "version": "1.0.0",
  "engines": {
    "node": ">=16.20.2 <17.0.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "format": "prettier --write \"src/**/*.{ts,tsx,css}\"",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "^0.263.1",
    "framer-motion": "^10.16.4"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.0.0",
    "typescript": "^5.0.2",
    "vite": "^4.4.5",
    "vite-plugin-pwa": "^0.16.4",
    "tailwindcss": "^3.3.3",
    "autoprefixer": "^10.4.14",
    "postcss": "^8.4.27",
    "vitest": "^0.34.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^5.16.5",
    "eslint": "^8.45.0",
    "prettier": "^3.0.0"
  }
}
```

### Environment Variables

```bash
# .env.example
VITE_API_URL=https://api.clearhire.com
VITE_WHATSAPP_API_KEY=your_whatsapp_api_key
VITE_ANALYTICS_ID=your_analytics_id
VITE_SENTRY_DSN=your_sentry_dsn
VITE_ENV=production
```

### CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '16.20.2'
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm run test:coverage
      - run: npm run build

  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            https://staging.clearhire.com
          uploadArtifacts: true
```

### Performance Monitoring

```typescript
// Web Vitals tracking
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

const sendToAnalytics = (metric: Metric) => {
  // Send to analytics service
  console.log(metric);
};

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

### Error Tracking

```typescript
// Sentry integration (future)
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_ENV,
  tracesSampleRate: 0.1,
});
```

## Summary

Este diseño proporciona una arquitectura completa y escalable para ClearHire, con:

1. **Componentes modulares** organizados por funcionalidad
2. **Modelos de datos** TypeScript completos y tipados
3. **Sistema de diseño** con Glassmorphism y Bento Grid
4. **Estrategia de testing** con pirámide de pruebas
5. **Manejo de errores** robusto y user-friendly
6. **PWA configuration** para experiencia offline
7. **Seguridad y privacidad** con cumplimiento LGPD/LFPDPPP
8. **Internacionalización** lista para LATAM
9. **DevOps** con CI/CD y monitoreo

La arquitectura está optimizada para Node 16.20.2 y prioriza la experiencia móvil, transparencia radical y cumplimiento regulatorio.
