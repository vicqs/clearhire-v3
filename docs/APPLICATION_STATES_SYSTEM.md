# Sistema de Estados de Postulación - Documentación Completa

## 🎯 Objetivo

Implementar un sistema de estados que permita:
1. Múltiples postulaciones activas durante el proceso inicial
2. Restricción a una sola postulación después de aceptar una oferta
3. Estados más específicos para el seguimiento detallado del proceso

## 📊 Fases del Proceso

### Fase 1: Proceso Inicial (Múltiples Postulaciones Permitidas)

Estados donde el candidato puede mantener múltiples postulaciones activas:

| Estado | Descripción | Acción del Candidato |
|--------|-------------|---------------------|
| `active` | Postulación activa en proceso | Esperar respuesta |
| `screening` | En revisión inicial de CV | Esperar respuesta |
| `interview_scheduled` | Entrevista agendada | Prepararse para entrevista |
| `interview_completed` | Entrevista completada | Esperar decisión |
| `technical_evaluation` | En evaluación técnica | Completar pruebas |
| `reference_check` | Verificación de referencias | Proporcionar referencias |

### Fase 2: Pre-Oferta (Múltiples Postulaciones Aún Permitidas)

Estados avanzados pero aún sin compromiso exclusivo:

| Estado | Descripción | Acción del Candidato |
|--------|-------------|---------------------|
| `finalist` | Finalista, empresa decidiendo | Esperar decisión final |
| `background_check` | Verificación de antecedentes | Proporcionar información |

### Fase 3: Oferta (PUNTO CRÍTICO ⚠️)

Estados donde se requiere tomar una decisión crítica:

| Estado | Descripción | Restricción | Acción Requerida |
|--------|-------------|-------------|------------------|
| `offer_pending` | Oferta formal pendiente | ⚠️ Decisión crítica | Aceptar o rechazar |
| `offer_negotiating` | Negociando términos | Múltiples permitidas | Negociar términos |
| `offer_accepted` | ⚠️ OFERTA ACEPTADA | 🔒 SOLO UNA | Retirar otras postulaciones |

**REGLA CRÍTICA**: Una vez que el candidato acepta una oferta (`offer_accepted`), **DEBE** retirar todas sus otras postulaciones activas.

### Fase 4: Estados Finales

Estados que marcan el fin del proceso:

| Estado | Descripción | Es Final |
|--------|-------------|----------|
| `approved` | Aprobado para contratación | ✓ |
| `hired` | Contratado (proceso completado) | ✓ |
| `rejected` | Rechazado por la empresa | ✓ |
| `withdrawn` | Retirado por el candidato | ✓ |
| `on_hold` | En espera (empresa pausó) | ✓ |
| `expired` | Oferta expiró sin respuesta | ✓ |
| `offer_declined` | Oferta rechazada | ✓ |

## 🔒 Sistema de Exclusividad

### Constantes Definidas

```typescript
// Estados que permiten múltiples postulaciones
export const MULTI_APPLICATION_STATES: ApplicationStatus[] = [
  'active',
  'screening',
  'interview_scheduled',
  'interview_completed',
  'technical_evaluation',
  'reference_check',
  'finalist',
  'background_check',
  'offer_negotiating',
];

// Estados que requieren exclusividad
export const EXCLUSIVE_STATES: ApplicationStatus[] = [
  'offer_accepted',
  'approved',
  'hired',
];

// Estados finales
export const FINAL_STATES: ApplicationStatus[] = [
  'hired',
  'rejected',
  'withdrawn',
  'expired',
  'offer_declined',
];
```

### Funciones Auxiliares

#### 1. `canHaveMultipleApplications(applications: Application[]): boolean`

Verifica si un candidato puede tener múltiples postulaciones activas.

```typescript
const canHaveMultipleApplications = (applications: Application[]): boolean => {
  const hasExclusiveApplication = applications.some(app => 
    EXCLUSIVE_STATES.includes(app.status)
  );
  
  return !hasExclusiveApplication;
};
```

**Uso:**
```typescript
if (!canHaveMultipleApplications(userApplications)) {
  showWarning('Ya tienes una oferta aceptada. Debes retirar otras postulaciones.');
}
```

#### 2. `isInCriticalState(status: ApplicationStatus): boolean`

Verifica si una aplicación está en un estado crítico que requiere decisión.

```typescript
const isInCriticalState = (status: ApplicationStatus): boolean => {
  return status === 'offer_pending' || EXCLUSIVE_STATES.includes(status);
};
```

#### 3. `getStatusLabel(status: ApplicationStatus): string`

Obtiene el label en español del estado.

#### 4. `getStatusColor(status: ApplicationStatus): string`

Obtiene las clases de Tailwind para el color del estado.

## 🎨 Componente ExclusivityWarning

Componente para mostrar advertencias al usuario cuando está en un punto crítico.

### Tipos de Advertencia

#### 1. `offer_pending` - Oferta Recibida
```tsx
<ExclusivityWarning
  type="offer_pending"
  companyName="TechCorp"
  otherApplicationsCount={3}
/>
```

**Muestra:**
> 📋 Oferta Formal Recibida
> 
> Has recibido una oferta formal de TechCorp. Si aceptas esta oferta, deberás retirar tus otras 3 postulaciones activas.
> 
> 💡 Tómate el tiempo necesario para revisar los términos antes de decidir.

#### 2. `offer_accepted` - Oferta Aceptada
```tsx
<ExclusivityWarning
  type="offer_accepted"
  companyName="TechCorp"
/>
```

**Muestra:**
> ⚠️ Oferta Aceptada - Exclusividad Requerida
> 
> Has aceptado la oferta de TechCorp. Debes retirar tus otras postulaciones activas para continuar con este proceso.
> 
> 💡 Esta es una práctica estándar en procesos de contratación profesional.

#### 3. `multiple_offers` - Múltiples Ofertas
```tsx
<ExclusivityWarning
  type="multiple_offers"
  otherApplicationsCount={2}
/>
```

**Muestra:**
> 🎯 Múltiples Ofertas Pendientes
> 
> Tienes 2 ofertas pendientes de respuesta. Solo puedes aceptar una oferta a la vez.
> 
> 💡 Revisa cuidadosamente cada oferta antes de tomar tu decisión.

## 📋 Nuevos Estados de Etapa (StageStatus)

Se agregaron estados adicionales para mayor granularidad:

| Estado | Descripción | Uso |
|--------|-------------|-----|
| `awaiting_candidate` | Esperando acción del candidato | Cuando el candidato debe hacer algo |
| `awaiting_company` | Esperando decisión de la empresa | Cuando la empresa debe decidir |
| `passed` | Pasó esta etapa exitosamente | Etapa completada con éxito |
| `failed` | No pasó esta etapa | Etapa no superada |

## 🔄 Flujo de Ejemplo

### Escenario: Candidato con Múltiples Postulaciones

```
Candidato tiene 3 postulaciones activas:
├── Empresa A: interview_completed ✓ Permitido
├── Empresa B: finalist ✓ Permitido
└── Empresa C: technical_evaluation ✓ Permitido

Empresa B envía oferta:
├── Empresa A: interview_completed ✓ Permitido
├── Empresa B: offer_pending ⚠️ Decisión crítica
└── Empresa C: technical_evaluation ✓ Permitido

Candidato acepta oferta de Empresa B:
├── Empresa A: withdrawn 🔒 Debe retirar
├── Empresa B: offer_accepted ✓ Exclusiva
└── Empresa C: withdrawn 🔒 Debe retirar

Estado final:
└── Empresa B: offer_accepted → approved → hired ✓
```

## 💾 Estructura de Datos

### OfferDetails

```typescript
export interface OfferDetails {
  offeredAt: Date;           // Fecha de la oferta
  expiresAt: Date;           // Fecha de expiración
  salary: number;            // Salario ofrecido
  currency: string;          // Moneda (USD, MXN, BRL, etc.)
  benefits: string[];        // Beneficios
  startDate?: Date;          // Fecha de inicio propuesta
  acceptedAt?: Date;         // Fecha de aceptación
  declinedAt?: Date;         // Fecha de rechazo
  declineReason?: string;    // Razón del rechazo
}
```

### Application (Actualizado)

```typescript
export interface Application {
  // ... campos existentes
  offerDetails?: OfferDetails;  // Detalles de la oferta
  isExclusive?: boolean;        // True si es la única permitida
}
```

## 🎯 Implementación en UI

### Dashboard

```tsx
// Verificar si el candidato puede tener múltiples postulaciones
const canApplyToMore = canHaveMultipleApplications(applications);

// Mostrar advertencia si tiene oferta aceptada
const acceptedOffer = applications.find(app => app.status === 'offer_accepted');
if (acceptedOffer) {
  <ExclusivityWarning
    type="offer_accepted"
    companyName={acceptedOffer.company}
  />
}

// Mostrar advertencia si tiene múltiples ofertas pendientes
const pendingOffers = applications.filter(app => app.status === 'offer_pending');
if (pendingOffers.length > 1) {
  <ExclusivityWarning
    type="multiple_offers"
    otherApplicationsCount={pendingOffers.length}
  />
}
```

### ApplicationHistory

```tsx
// Mostrar badge de "Exclusiva" en aplicaciones con oferta aceptada
{app.isExclusive && (
  <span className="px-2 py-1 rounded-full text-xs font-bold bg-gold-100 text-gold-700">
    Exclusiva
  </span>
)}
```

## 📊 Colores por Estado

Los colores se asignan automáticamente según la fase:

- **Verde**: Estados exclusivos (`offer_accepted`, `approved`, `hired`)
- **Amarillo/Naranja**: Estados críticos (`offer_pending`, `finalist`)
- **Azul/Púrpura**: Estados en proceso
- **Rojo**: Estados de rechazo
- **Gris**: Estados finales neutros

## ✅ Mejores Prácticas

1. **Siempre verificar** `canHaveMultipleApplications()` antes de permitir nuevas postulaciones
2. **Mostrar advertencias claras** cuando el candidato está en un punto crítico
3. **Usar `isInCriticalState()`** para destacar aplicaciones que requieren atención
4. **Actualizar `isExclusive`** cuando una oferta es aceptada
5. **Proporcionar feedback claro** sobre las consecuencias de aceptar una oferta

## 🚀 Próximos Pasos

1. Implementar lógica de auto-retiro de otras postulaciones al aceptar oferta
2. Agregar notificaciones cuando se recibe una oferta
3. Implementar temporizador de expiración de ofertas
4. Agregar historial de decisiones del candidato
5. Implementar sistema de comparación de ofertas

## 📝 Notas Importantes

- El sistema respeta la autonomía del candidato pero establece reglas claras
- Las advertencias son informativas, no bloqueantes (el candidato decide)
- El estado `offer_accepted` es el punto de no retorno
- Las empresas pueden ver si un candidato tiene otras postulaciones activas
- La transparencia es clave en todo el proceso

---

**Versión**: 1.0.0  
**Última actualización**: Diciembre 2024  
**Autor**: Sistema ClearHire ATS
