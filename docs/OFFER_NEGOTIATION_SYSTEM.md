# Sistema de Negociación de Ofertas

## 🎯 Cambios Implementados

### 1. **Concepto de "Aceptar" Actualizado**

**Antes:** "Aceptar Oferta" → Sonaba como firma de contrato final

**Ahora:** "Aceptar Proceso de Contratación" → Clarifica que es solo el inicio del proceso

#### Cambios en el Modal de Aceptación:
- ✅ Título: "Aceptar Proceso de Contratación"
- ✅ Descripción clara: "Al aceptar entrar al proceso:"
  - Iniciarás el proceso formal de contratación
  - La empresa preparará tu contrato
  - Recibirás documentos para revisión y firma
  - Se coordinará tu fecha de inicio
  - Podrás revisar términos antes de firmar
- ✅ Nota importante: "Esto NO es una firma de contrato, solo confirmas tu interés en continuar"
- ✅ Botón: "Continuar al Proceso" (en lugar de "Sí, Aceptar")

#### Cambios en el Modal de Éxito:
- ✅ Título: "¡Proceso Iniciado!" (en lugar de "¡Oferta Aceptada!")
- ✅ Mensaje: "Has aceptado entrar al proceso de contratación con [Empresa]"
- ✅ Próximos pasos actualizados para reflejar el proceso

#### Cambios en OfferCard:
- ✅ Botón: "Aceptar Proceso" (en lugar de "Aceptar Oferta")

---

### 2. **Sistema de Mensajes de Negociación**

#### Nuevos Tipos Agregados:

```typescript
export interface NegotiationMessage {
  id: string;
  sender: 'candidate' | 'company';
  message: string;
  timestamp: Date;
  read: boolean;
}

export interface JobOffer {
  // ... campos existentes
  negotiationMessages?: NegotiationMessage[];
  awaitingCandidateResponse?: boolean; // true cuando la empresa responde
}
```

#### Funcionalidad del Sistema:

**Cuando el candidato inicia negociación:**
1. Se crea un nuevo mensaje con `sender: 'candidate'`
2. El mensaje se agrega al array `negotiationMessages`
3. `awaitingCandidateResponse` se establece en `false`
4. Estado cambia a `'negotiating'`

**Cuando la empresa responde:**
1. Se agrega un nuevo mensaje con `sender: 'company'`
2. `awaitingCandidateResponse` se establece en `true`
3. Los botones de acción se habilitan nuevamente

---

### 3. **Modal de Negociación Mejorado**

#### Características:

**Historial de Mensajes:**
- ✅ Muestra todos los mensajes previos en un contenedor scrolleable
- ✅ Mensajes del candidato: fondo azul, alineados a la derecha
- ✅ Mensajes de la empresa: fondo verde, alineados a la izquierda
- ✅ Cada mensaje muestra:
  - Emisor (👤 Tú / 🏢 Empresa)
  - Fecha y hora
  - Contenido del mensaje

**Interfaz Adaptativa:**
- ✅ Si no hay mensajes: "¿Qué te gustaría negociar?"
- ✅ Si hay mensajes: "Tu respuesta:"
- ✅ Botón cambia: "Enviar Propuesta" → "Enviar Respuesta"

**Ejemplo de Historial:**
```
┌─────────────────────────────────────┐
│ 💬 Historial de Negociación        │
├─────────────────────────────────────┤
│ ┌───────────────────────────┐      │
│ │ 👤 Tú - 5 ene, 10:30     │      │
│ │ Me gustaría negociar...   │      │
│ └───────────────────────────┘      │
│      ┌───────────────────────────┐ │
│      │ 🏢 Empresa - 7 ene, 14:20│ │
│      │ Podemos ofrecerte...     │ │
│      └───────────────────────────┘ │
└─────────────────────────────────────┘
```

---

### 4. **Estados de Negociación en OfferCard**

#### Estado 1: Esperando Respuesta de la Empresa
**Cuando:** `status === 'negotiating' && !awaitingCandidateResponse`

```
┌─────────────────────────────────────┐
│ 💬 Negociación en Proceso          │
│ Esperando respuesta de la empresa  │
├─────────────────────────────────────┤
│ Último mensaje enviado:             │
│ "Me gustaría negociar..."          │
└─────────────────────────────────────┘
```

**Características:**
- ✅ Fondo azul
- ✅ Muestra último mensaje del candidato
- ✅ NO muestra botones de acción
- ✅ Indica que se está esperando respuesta

#### Estado 2: La Empresa Respondió
**Cuando:** `status === 'negotiating' && awaitingCandidateResponse`

```
┌─────────────────────────────────────┐
│ 💬 ¡La empresa ha respondido!      │
│ Revisa su mensaje y decide         │
├─────────────────────────────────────┤
│ Último mensaje de la empresa:       │
│ "Podemos ofrecerte ₡2,550,000..."  │
└─────────────────────────────────────┘
│                                     │
│ [Aceptar Proceso] [Seguir Negociando] [X] │
└─────────────────────────────────────┘
```

**Características:**
- ✅ Fondo verde con animación pulse
- ✅ Muestra último mensaje de la empresa
- ✅ **Botones habilitados nuevamente:**
  - "Aceptar Proceso" - Para aceptar la propuesta
  - "Seguir Negociando" - Para enviar contrapropuesta
  - "X" - Para rechazar
- ✅ Destaca visualmente que requiere acción

---

### 5. **Ejemplos en Datos Mock**

#### Ejemplo 1: Negociación Iniciada (Esperando Empresa)
```typescript
{
  id: 'offer_5',
  companyName: 'Gorilla Logic',
  status: 'negotiating',
  negotiationMessages: [
    {
      sender: 'candidate',
      message: 'Me gustaría negociar el salario a ₡3,200,000...',
      timestamp: pastDate(3)
    }
  ],
  awaitingCandidateResponse: false // Esperando respuesta de empresa
}
```

#### Ejemplo 2: Empresa Respondió (Esperando Candidato)
```typescript
{
  id: 'offer_8',
  companyName: 'Encora',
  status: 'negotiating',
  negotiationMessages: [
    {
      sender: 'candidate',
      message: 'Me gustaría negociar el salario a ₡2,700,000...',
      timestamp: pastDate(4)
    },
    {
      sender: 'company',
      message: 'Podemos ofrecerte ₡2,550,000 más bono trimestral...',
      timestamp: pastDate(1)
    }
  ],
  awaitingCandidateResponse: true // Esperando respuesta del candidato
}
```

---

## 🔄 Flujos de Usuario

### Flujo 1: Iniciar Negociación
```
1. Usuario ve oferta "pending"
2. Hace clic en "Negociar"
3. Modal se abre (sin historial)
4. Escribe su propuesta
5. Hace clic en "Enviar Propuesta"
6. Estado → "negotiating"
7. awaitingCandidateResponse → false
8. Card muestra "Esperando respuesta de la empresa"
9. NO hay botones de acción
```

### Flujo 2: Empresa Responde
```
1. Sistema recibe respuesta de empresa (simulado en mock)
2. Se agrega mensaje con sender: 'company'
3. awaitingCandidateResponse → true
4. Card muestra "¡La empresa ha respondido!" (verde, animado)
5. Muestra último mensaje de la empresa
6. BOTONES HABILITADOS:
   - Aceptar Proceso
   - Seguir Negociando
   - Rechazar
```

### Flujo 3: Continuar Negociación
```
1. Usuario hace clic en "Seguir Negociando"
2. Modal se abre CON historial de mensajes
3. Ve toda la conversación previa
4. Escribe su respuesta
5. Hace clic en "Enviar Respuesta"
6. Se agrega nuevo mensaje del candidato
7. awaitingCandidateResponse → false
8. Vuelve a estado "Esperando respuesta de la empresa"
9. Botones se deshabilitan
```

### Flujo 4: Aceptar Después de Negociar
```
1. Usuario revisa respuesta de la empresa
2. Decide que la propuesta es aceptable
3. Hace clic en "Aceptar Proceso"
4. Modal de aceptación se abre
5. Confirma que quiere entrar al proceso
6. Estado → "accepted"
7. Se muestra modal de éxito
```

---

## 🎨 Diseño Visual

### Colores por Estado:

| Estado | Color | Uso |
|--------|-------|-----|
| Esperando empresa | Azul (`blue-50/100`) | Indica proceso en curso |
| Empresa respondió | Verde (`green-50/100`) | Indica acción requerida |
| Mensajes candidato | Azul claro | Diferencia visual |
| Mensajes empresa | Verde claro | Diferencia visual |

### Animaciones:

- ✅ **Pulse en icono**: Cuando la empresa responde
- ✅ **Scale en botones**: Feedback táctil
- ✅ **Smooth scroll**: En historial de mensajes

---

## 📱 Responsive Design

### Modal de Negociación:
- ✅ `max-h-64` en historial de mensajes
- ✅ `overflow-y-auto` para scroll
- ✅ Mensajes con padding adaptativo
- ✅ Funciona en móvil y desktop

### OfferCard:
- ✅ Botones apilados en móvil si es necesario
- ✅ Texto truncado en mensajes largos
- ✅ Iconos y badges responsive

---

## 🔮 Próximas Mejoras Sugeridas

1. **Notificaciones Push**: Alertar cuando la empresa responde
2. **Contador de mensajes no leídos**: Badge en el filtro "Negociando"
3. **Adjuntar archivos**: Permitir enviar documentos en negociación
4. **Plantillas de mensajes**: Sugerencias de texto para negociar
5. **Historial completo**: Ver toda la conversación en una vista dedicada
6. **Typing indicator**: Mostrar cuando la empresa está escribiendo
7. **Confirmación de lectura**: Marcar mensajes como leídos
8. **Exportar conversación**: Descargar historial en PDF

---

## ✅ Verificación de Funcionalidad

### Casos de Prueba:

- ✅ Iniciar negociación desde oferta "pending"
- ✅ Ver historial de mensajes en modal
- ✅ Enviar mensaje de negociación
- ✅ Ver estado "Esperando empresa" sin botones
- ✅ Ver estado "Empresa respondió" con botones
- ✅ Continuar negociación con respuesta
- ✅ Aceptar proceso después de negociar
- ✅ Rechazar oferta durante negociación
- ✅ Mensajes se muestran correctamente (candidato vs empresa)
- ✅ Timestamps formateados correctamente
- ✅ Scroll funciona en historial largo

---

## 🎓 Conceptos Clave

### Diferencia entre "Aceptar" y "Firmar":
- **Aceptar Proceso**: Confirma interés, inicia trámites
- **Firmar Contrato**: Compromiso legal (paso posterior)

### Estados de Negociación:
- **Iniciada**: Candidato envió primer mensaje
- **En curso**: Esperando respuesta de empresa
- **Activa**: Empresa respondió, esperando candidato
- **Finalizada**: Se aceptó o rechazó la oferta

### Flujo de Comunicación:
```
Candidato → Empresa → Candidato → Empresa → ...
   ↓          ↓          ↓          ↓
 Envía    Responde    Responde   Responde
   ↓          ↓          ↓          ↓
Espera    Espera     Espera     Espera
```

---

## 📊 Métricas Sugeridas

Para futuras implementaciones, considerar trackear:

1. **Tiempo promedio de respuesta** (empresa y candidato)
2. **Número de mensajes** por negociación
3. **Tasa de éxito** (negociaciones que terminan en aceptación)
4. **Razones de rechazo** después de negociar
5. **Salario inicial vs final** en negociaciones exitosas
