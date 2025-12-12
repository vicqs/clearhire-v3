# Análisis de Patrones de Diseño y Calidad de Código

## 📋 Resumen Ejecutivo

Este documento analiza los patrones de diseño actuales en el proyecto ClearHire ATS, identifica code smells y propone mejoras arquitectónicas.

---

## ✅ Patrones de Diseño Implementados

### 1. **Singleton Pattern**
**Ubicación**: `services/notificationService.ts`, `services/salaryCalculatorService.ts`

```typescript
// Implementación actual
class NotificationService {
  // ... métodos
}

export const notificationService = new NotificationService();
```

**Ventajas**:
- Una única instancia compartida en toda la aplicación
- Estado centralizado para notificaciones
- Fácil acceso desde cualquier componente

**Mejora Sugerida**: Agregar lazy initialization y thread-safety

```typescript
class NotificationService {
  private static instance: NotificationService;
  
  private constructor() {
    // Constructor privado
  }
  
  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }
}

export const notificationService = NotificationService.getInstance();
```

---

### 2. **Observer Pattern (Event System)**
**Ubicación**: `services/notificationService.ts`

```typescript
private listeners: Map<NotificationEvent, NotificationListener[]> = new Map();

addEventListener(event: NotificationEvent, listener: NotificationListener): void {
  if (!this.listeners.has(event)) {
    this.listeners.set(event, []);
  }
  this.listeners.get(event)!.push(listener);
}
```

**Ventajas**:
- Desacoplamiento entre emisores y receptores de eventos
- Notificaciones en tiempo real
- Fácil extensibilidad

**Estado**: ✅ Bien implementado

---

### 3. **Custom Hooks Pattern (React)**
**Ubicación**: `hooks/`

Hooks implementados:
- `useAutoSave` - Manejo de guardado automático
- `useNotifications` - Gestión de notificaciones
- `useProfileCompletion` - Cálculo de completitud de perfil
- `useHapticFeedback` - Feedback táctil
- `usePullToRefresh` - Actualización por arrastre
- `useReducedMotion` - Accesibilidad de animaciones

**Ventajas**:
- Reutilización de lógica
- Separación de concerns
- Testing más fácil

**Estado**: ✅ Excelente implementación

---

### 4. **Strategy Pattern (Implícito)**
**Ubicación**: `services/salaryCalculatorService.ts`

```typescript
const taxConfigs: Record<string, TaxConfig> = {
  CR: { /* config Costa Rica */ },
  MX: { /* config México */ },
  CO: { /* config Colombia */ },
  // ...
};
```

**Ventajas**:
- Diferentes estrategias de cálculo por país
- Fácil agregar nuevos países

**Mejora Sugerida**: Hacer explícito el patrón Strategy

```typescript
interface TaxStrategy {
  calculateTax(grossSalary: number): TaxCalculation;
  formatCurrency(amount: number): string;
}

class CostaRicaTaxStrategy implements TaxStrategy {
  calculateTax(grossSalary: number): TaxCalculation {
    // Implementación específica para CR
  }
}

class SalaryCalculatorService {
  private strategies: Map<string, TaxStrategy> = new Map();
  
  registerStrategy(country: string, strategy: TaxStrategy): void {
    this.strategies.set(country, strategy);
  }
  
  calculateTaxes(grossSalary: number, country: string): TaxCalculation {
    const strategy = this.strategies.get(country);
    if (!strategy) throw new Error(`No strategy for ${country}`);
    return strategy.calculateTax(grossSalary);
  }
}
```

---

### 5. **Template Method Pattern (Implícito)**
**Ubicación**: `services/notificationService.ts`

```typescript
private async processNotification(notification: Notification): Promise<void> {
  notification.status = 'sending';
  notification.sentAt = new Date();
  
  for (const channel of notification.channels) {
    const result = await this.simulateDelivery(notification, channel);
    // ...
  }
}
```

**Estado**: ✅ Bien implementado para el flujo de notificaciones

---

### 6. **Factory Pattern (Implícito)**
**Ubicación**: `services/notificationService.ts`

```typescript
const messageTemplates: Record<string, MessageTemplate> = {
  'active_to_screening': { /* template */ },
  'screening_to_technical_evaluation': { /* template */ },
  // ...
};
```

**Mejora Sugerida**: Crear un NotificationFactory explícito

```typescript
class NotificationFactory {
  createStatusChangeNotification(
    oldStatus: ApplicationStatus,
    newStatus: ApplicationStatus,
    metadata: any
  ): Notification {
    const templateKey = `${oldStatus}_to_${newStatus}`;
    const template = this.getTemplate(templateKey);
    // ... crear notificación
  }
  
  createInterviewReminder(/* params */): Notification {
    // ...
  }
  
  createDeadlineAlert(/* params */): Notification {
    // ...
  }
}
```

---

### 7. **Provider Pattern (React Context)**
**Ubicación**: `components/notifications/NotificationProvider.tsx`

**Ventajas**:
- Estado global sin prop drilling
- Acceso fácil desde cualquier componente

**Estado**: ✅ Implementado correctamente

---

## 🔴 Code Smells Identificados

### 1. **Long Method - `processNotification`**
**Ubicación**: `services/notificationService.ts:456`

**Problema**: Método con más de 50 líneas que hace demasiadas cosas

**Solución**:
```typescript
// Dividir en métodos más pequeños
private async processNotification(notification: Notification): Promise<void> {
  this.markAsSending(notification);
  
  for (const channel of notification.channels) {
    const success = await this.tryDeliverToChannel(notification, channel);
    if (success) break;
  }
  
  this.handleDeliveryResult(notification);
}

private markAsSending(notification: Notification): void {
  notification.status = 'sending';
  notification.sentAt = new Date();
}

private async tryDeliverToChannel(
  notification: Notification, 
  channel: DeliveryChannel
): Promise<boolean> {
  try {
    const result = await this.simulateDelivery(notification, channel);
    if (result.success) {
      this.handleSuccessfulDelivery(notification, result);
      return true;
    }
  } catch (error) {
    this.handleDeliveryError(notification, channel, error);
  }
  return false;
}

private handleSuccessfulDelivery(
  notification: Notification, 
  result: DeliveryResult
): void {
  notification.status = 'delivered';
  notification.deliveredAt = result.deliveredAt;
  this.analytics.totalSent++;
  this.emitEvent('notification_sent', notification);
  this.scheduleAutoRead(notification);
}
```

---

### 2. **Magic Numbers**
**Ubicación**: Múltiples archivos

**Problema**: Números hardcodeados sin constantes nombradas

**Ejemplos**:
```typescript
// ❌ Mal
setTimeout(() => { /* ... */ }, 3000);
const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
```

**Solución**:
```typescript
// ✅ Bien
const TIMEOUTS = {
  SAVED_STATUS_DISPLAY: 3000,
  NOTIFICATION_REFRESH: 30000,
  RETRY_BASE_DELAY: 1000,
} as const;

const DURATIONS = {
  ONE_DAY_MS: 24 * 60 * 60 * 1000,
  THIRTY_DAYS_MS: 30 * 24 * 60 * 60 * 1000,
} as const;

setTimeout(() => { /* ... */ }, TIMEOUTS.SAVED_STATUS_DISPLAY);
const thirtyDaysAgo = new Date(Date.now() - DURATIONS.THIRTY_DAYS_MS);
```

---

### 3. **Primitive Obsession**
**Ubicación**: `services/notificationService.ts`

**Problema**: Uso excesivo de strings y números primitivos

**Ejemplo**:
```typescript
// ❌ Mal
const templateKey = `${oldStatus}_to_${newStatus}`;
```

**Solución**:
```typescript
// ✅ Bien - Crear Value Objects
class StatusTransition {
  constructor(
    public readonly from: ApplicationStatus,
    public readonly to: ApplicationStatus
  ) {}
  
  get key(): string {
    return `${this.from}_to_${this.to}`;
  }
  
  get isRejection(): boolean {
    return this.to === 'rejected';
  }
  
  get isPromotion(): boolean {
    const promotions = ['approved', 'hired', 'offer_accepted'];
    return promotions.includes(this.to);
  }
}

// Uso
const transition = new StatusTransition(oldStatus, newStatus);
const template = messageTemplates[transition.key];
const priority = transition.isRejection || transition.isPromotion ? 'high' : 'medium';
```

---

### 4. **Data Clumps**
**Ubicación**: Múltiples archivos

**Problema**: Grupos de datos que siempre aparecen juntos

**Ejemplo**:
```typescript
// ❌ Mal - Estos parámetros siempre van juntos
function sendNotification(
  candidateName: string,
  positionTitle: string,
  companyName: string,
  recruiterName: string
) { /* ... */ }
```

**Solución**:
```typescript
// ✅ Bien - Crear objetos de datos
interface NotificationContext {
  candidateName: string;
  positionTitle: string;
  companyName: string;
  recruiterName?: string;
}

function sendNotification(context: NotificationContext) {
  // ...
}
```

---

### 5. **Long Parameter List**
**Ubicación**: `services/notificationService.ts`

**Problema**: Métodos con más de 3-4 parámetros

**Ejemplo**:
```typescript
// ❌ Mal
async detectStatusChange(
  candidateId: string,
  applicationId: string,
  oldStatus: ApplicationStatus,
  newStatus: ApplicationStatus,
  metadata: { /* ... */ }
): Promise<void>
```

**Solución**:
```typescript
// ✅ Bien
interface StatusChangeEvent {
  candidateId: string;
  applicationId: string;
  transition: StatusTransition;
  context: NotificationContext;
}

async detectStatusChange(event: StatusChangeEvent): Promise<void> {
  // ...
}
```

---

### 6. **Duplicated Code - Currency Formatting**
**Ubicación**: `services/salaryCalculatorService.ts`

**Problema**: Lógica de formateo repetida

**Solución**:
```typescript
// Crear un servicio de internacionalización
class I18nService {
  private formatters: Map<string, Intl.NumberFormat> = new Map();
  
  constructor() {
    this.initializeFormatters();
  }
  
  private initializeFormatters(): void {
    const configs = [
      { country: 'CR', locale: 'es-CR', currency: 'CRC' },
      { country: 'MX', locale: 'es-MX', currency: 'MXN' },
      // ...
    ];
    
    configs.forEach(({ country, locale, currency }) => {
      this.formatters.set(country, new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 0
      }));
    });
  }
  
  formatCurrency(amount: number, country: string): string {
    const formatter = this.formatters.get(country);
    if (!formatter) throw new Error(`No formatter for ${country}`);
    return formatter.format(amount);
  }
}
```

---

### 7. **Feature Envy**
**Ubicación**: `hooks/useNotifications.ts`

**Problema**: El hook hace demasiadas llamadas al servicio

**Solución**: Mover más lógica al servicio o crear un facade

```typescript
// Crear un NotificationFacade
class NotificationFacade {
  constructor(private service: NotificationService) {}
  
  async handleStatusChange(params: StatusChangeParams): Promise<void> {
    await this.service.detectStatusChange(/* ... */);
    // Lógica adicional de coordinación
  }
  
  getNotificationState(candidateId: string): NotificationState {
    return {
      notifications: this.service.getNotificationHistory(candidateId),
      unreadCount: this.service.getUnreadCount(candidateId),
      analytics: this.service.getAnalytics(candidateId),
      preferences: this.service.getPreferences(candidateId)
    };
  }
}
```

---

## 🎯 Patrones Sugeridos para Implementar

### 1. **Repository Pattern**
Para abstraer el acceso a datos (cuando se implemente backend)

```typescript
interface NotificationRepository {
  findById(id: string): Promise<Notification | null>;
  findByCandidate(candidateId: string): Promise<Notification[]>;
  save(notification: Notification): Promise<void>;
  delete(id: string): Promise<void>;
}

class InMemoryNotificationRepository implements NotificationRepository {
  private notifications: Map<string, Notification> = new Map();
  
  async findById(id: string): Promise<Notification | null> {
    return this.notifications.get(id) || null;
  }
  
  // ... otros métodos
}

class ApiNotificationRepository implements NotificationRepository {
  constructor(private apiClient: ApiClient) {}
  
  async findById(id: string): Promise<Notification | null> {
    return this.apiClient.get(`/notifications/${id}`);
  }
  
  // ... otros métodos
}
```

---

### 2. **Builder Pattern**
Para construcción compleja de notificaciones

```typescript
class NotificationBuilder {
  private notification: Partial<Notification> = {};
  
  forCandidate(candidateId: string): this {
    this.notification.candidateId = candidateId;
    return this;
  }
  
  withType(type: NotificationType): this {
    this.notification.type = type;
    return this;
  }
  
  withPriority(priority: 'high' | 'medium' | 'low'): this {
    this.notification.priority = priority;
    return this;
  }
  
  withChannels(...channels: DeliveryChannel[]): this {
    this.notification.channels = channels;
    return this;
  }
  
  withMessage(title: string, body: string): this {
    this.notification.title = title;
    this.notification.message = body;
    return this;
  }
  
  build(): Notification {
    // Validar que todos los campos requeridos estén presentes
    if (!this.notification.candidateId) {
      throw new Error('Candidate ID is required');
    }
    // ... más validaciones
    
    return {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'queued',
      scheduledAt: new Date(),
      retryCount: 0,
      maxRetries: 3,
      ...this.notification
    } as Notification;
  }
}

// Uso
const notification = new NotificationBuilder()
  .forCandidate('candidate_123')
  .withType('status_change')
  .withPriority('high')
  .withChannels('whatsapp', 'email')
  .withMessage('¡Felicitaciones!', 'Has sido seleccionado')
  .build();
```

---

### 3. **Command Pattern**
Para operaciones de notificaciones con undo/redo

```typescript
interface Command {
  execute(): Promise<void>;
  undo(): Promise<void>;
}

class SendNotificationCommand implements Command {
  constructor(
    private service: NotificationService,
    private notification: Notification
  ) {}
  
  async execute(): Promise<void> {
    await this.service.send(this.notification);
  }
  
  async undo(): Promise<void> {
    await this.service.cancel(this.notification.id);
  }
}

class CommandInvoker {
  private history: Command[] = [];
  
  async execute(command: Command): Promise<void> {
    await command.execute();
    this.history.push(command);
  }
  
  async undo(): Promise<void> {
    const command = this.history.pop();
    if (command) {
      await command.undo();
    }
  }
}
```

---

### 4. **Decorator Pattern**
Para agregar funcionalidad a notificaciones

```typescript
interface NotificationSender {
  send(notification: Notification): Promise<void>;
}

class BaseNotificationSender implements NotificationSender {
  async send(notification: Notification): Promise<void> {
    // Lógica básica de envío
  }
}

class LoggingDecorator implements NotificationSender {
  constructor(private sender: NotificationSender) {}
  
  async send(notification: Notification): Promise<void> {
    console.log(`Sending notification: ${notification.id}`);
    await this.sender.send(notification);
    console.log(`Notification sent: ${notification.id}`);
  }
}

class RetryDecorator implements NotificationSender {
  constructor(
    private sender: NotificationSender,
    private maxRetries: number = 3
  ) {}
  
  async send(notification: Notification): Promise<void> {
    let attempts = 0;
    while (attempts < this.maxRetries) {
      try {
        await this.sender.send(notification);
        return;
      } catch (error) {
        attempts++;
        if (attempts >= this.maxRetries) throw error;
        await this.delay(Math.pow(2, attempts) * 1000);
      }
    }
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

class AnalyticsDecorator implements NotificationSender {
  constructor(
    private sender: NotificationSender,
    private analytics: AnalyticsService
  ) {}
  
  async send(notification: Notification): Promise<void> {
    const startTime = Date.now();
    try {
      await this.sender.send(notification);
      this.analytics.trackSuccess(notification, Date.now() - startTime);
    } catch (error) {
      this.analytics.trackFailure(notification, error);
      throw error;
    }
  }
}

// Uso
const sender = new AnalyticsDecorator(
  new RetryDecorator(
    new LoggingDecorator(
      new BaseNotificationSender()
    ),
    3
  ),
  analyticsService
);
```

---

### 5. **Chain of Responsibility**
Para procesamiento de notificaciones por canal

```typescript
abstract class NotificationHandler {
  protected next: NotificationHandler | null = null;
  
  setNext(handler: NotificationHandler): NotificationHandler {
    this.next = handler;
    return handler;
  }
  
  async handle(notification: Notification): Promise<boolean> {
    const handled = await this.process(notification);
    
    if (!handled && this.next) {
      return this.next.handle(notification);
    }
    
    return handled;
  }
  
  protected abstract process(notification: Notification): Promise<boolean>;
}

class WhatsAppHandler extends NotificationHandler {
  protected async process(notification: Notification): Promise<boolean> {
    if (!notification.channels.includes('whatsapp')) {
      return false;
    }
    
    try {
      await this.sendViaWhatsApp(notification);
      return true;
    } catch (error) {
      console.error('WhatsApp failed:', error);
      return false;
    }
  }
  
  private async sendViaWhatsApp(notification: Notification): Promise<void> {
    // Implementación
  }
}

class EmailHandler extends NotificationHandler {
  protected async process(notification: Notification): Promise<boolean> {
    if (!notification.channels.includes('email')) {
      return false;
    }
    
    try {
      await this.sendViaEmail(notification);
      return true;
    } catch (error) {
      console.error('Email failed:', error);
      return false;
    }
  }
  
  private async sendViaEmail(notification: Notification): Promise<void> {
    // Implementación
  }
}

class PushHandler extends NotificationHandler {
  protected async process(notification: Notification): Promise<boolean> {
    if (!notification.channels.includes('push')) {
      return false;
    }
    
    try {
      await this.sendViaPush(notification);
      return true;
    } catch (error) {
      console.error('Push failed:', error);
      return false;
    }
  }
  
  private async sendViaPush(notification: Notification): Promise<void> {
    // Implementación
  }
}

// Configurar la cadena
const whatsappHandler = new WhatsAppHandler();
const emailHandler = new EmailHandler();
const pushHandler = new PushHandler();

whatsappHandler.setNext(emailHandler).setNext(pushHandler);

// Uso
await whatsappHandler.handle(notification);
```

---

## 📊 Métricas de Calidad Actuales

### Complejidad Ciclomática
- `NotificationService.processNotification`: **8** (Alto - Refactorizar)
- `SalaryCalculatorService.calculateTaxes`: **5** (Medio - Aceptable)
- `useAutoSave`: **3** (Bajo - Excelente)

### Líneas de Código por Archivo
- `notificationService.ts`: **880 líneas** (Muy alto - Dividir)
- `salaryCalculatorService.ts`: **350 líneas** (Aceptable)
- `ApplicationAccordion.tsx`: **450 líneas** (Alto - Considerar dividir)

### Acoplamiento
- **Bajo**: Hooks personalizados
- **Medio**: Servicios
- **Alto**: Algunos componentes grandes

---

## 🎯 Plan de Refactorización Prioritario

### Prioridad Alta (Hacer ahora)
1. ✅ Extraer constantes mágicas
2. ✅ Dividir `processNotification` en métodos más pequeños
3. ✅ Crear Value Objects para StatusTransition
4. ✅ Implementar Builder Pattern para Notifications

### Prioridad Media (Próxima iteración)
5. Implementar Strategy Pattern explícito para cálculos de impuestos
6. Crear NotificationFactory
7. Implementar Chain of Responsibility para canales
8. Refactorizar componentes grandes (>400 líneas)

### Prioridad Baja (Futuro)
9. Implementar Repository Pattern (cuando haya backend)
10. Agregar Decorator Pattern para logging/analytics
11. Implementar Command Pattern para undo/redo
12. Crear sistema de plugins extensible

---

## 📚 Recursos Recomendados

- **Libro**: "Refactoring" de Martin Fowler
- **Libro**: "Design Patterns" (Gang of Four)
- **Libro**: "Clean Code" de Robert Martin
- **Web**: https://refactoring.guru/design-patterns
- **Web**: https://sourcemaking.com/design-patterns

---

**Última actualización**: Diciembre 2025
**Próxima revisión**: Enero 2026
