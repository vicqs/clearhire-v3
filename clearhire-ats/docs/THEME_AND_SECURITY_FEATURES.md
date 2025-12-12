# Sistema de Tema Oscuro y Funcionalidades de Seguridad

## 🎨 Sistema de Tema Oscuro

### Implementación

Se creó un contexto global de tema (`ThemeContext`) que maneja tres modos:

1. **Claro** (`light`) - Tema claro forzado
2. **Oscuro** (`dark`) - Tema oscuro forzado  
3. **Automático** (`system`) - Sigue las preferencias del sistema operativo

### Características

#### ThemeContext (`src/contexts/ThemeContext.tsx`)

```typescript
interface ThemeContextType {
  theme: 'light' | 'dark' | 'system';
  effectiveTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}
```

**Funcionalidades:**
- ✅ Persistencia en `localStorage`
- ✅ Detección automática de preferencias del sistema
- ✅ Listener para cambios en preferencias del sistema
- ✅ Aplicación automática de clases CSS (`light`/`dark`)
- ✅ Hook `useTheme()` para acceso global

#### Integración en la App

```typescript
// App.tsx
<ThemeProvider>
  <NotificationProvider>
    <AppContent />
  </NotificationProvider>
</ThemeProvider>
```

#### Uso en Componentes

```typescript
import { useTheme } from '../contexts/ThemeContext';

const { theme, effectiveTheme, setTheme, toggleTheme } = useTheme();
```

### Toggle de Tema en Settings

El usuario puede cambiar el tema desde **Ajustes → Apariencia → Tema**:

- **Claro** ☀️ - Fondo blanco, texto oscuro
- **Oscuro** 🌙 - Fondo oscuro, texto claro
- **Automático** 💻 - Sigue el sistema operativo

**Ciclo de cambio:** Claro → Oscuro → Automático → Claro...

---

## 🔐 Funcionalidades de Seguridad

### 1. Cambiar Contraseña

**Ubicación:** Ajustes → Privacidad y Seguridad → Cambiar Contraseña

#### Modal de Cambio de Contraseña

**Campos:**
- Contraseña Actual (con toggle show/hide)
- Nueva Contraseña (con toggle show/hide)
- Confirmar Nueva Contraseña (con toggle show/hide)

**Validaciones:**
- ✅ Todos los campos requeridos
- ✅ Nueva contraseña mínimo 8 caracteres
- ✅ Nueva contraseña debe coincidir con confirmación
- ✅ Indicadores visuales de requisitos:
  - Mínimo 8 caracteres
  - Al menos una mayúscula
  - Al menos un número

**Flujo:**
```
1. Usuario hace clic en "Cambiar Contraseña"
2. Modal se abre con formulario
3. Usuario completa los 3 campos
4. Sistema valida requisitos
5. Si todo es correcto → "✅ Contraseña cambiada exitosamente"
6. Si hay errores → Muestra mensaje específico
```

**Características UX:**
- Iconos de ojo para mostrar/ocultar contraseñas
- Indicadores en tiempo real de requisitos cumplidos
- Colores semánticos (verde = cumplido, gris = pendiente)
- Feedback háptico en acciones

---

### 2. Autenticación de Dos Factores (2FA)

**Ubicación:** Ajustes → Privacidad y Seguridad → Autenticación de Dos Factores

#### Modal de 2FA

**Estados:**
- **Desactivada** - Muestra información y permite activar
- **Activada** - Muestra advertencia y permite desactivar

**Flujo de Activación:**
```
1. Usuario hace clic en "Autenticación de Dos Factores"
2. Modal se abre mostrando:
   - Explicación de qué es 2FA
   - Código de verificación demo: 123456
   - Campo para ingresar código
3. Usuario ingresa código "123456"
4. Sistema valida código
5. Si correcto → "✅ Autenticación de dos factores activada"
6. Estado cambia a "Activada" en la lista
```

**Flujo de Desactivación:**
```
1. Usuario hace clic en "Autenticación de Dos Factores" (ya activada)
2. Modal muestra advertencia de seguridad
3. Usuario confirma desactivación
4. "✅ Autenticación de dos factores desactivada"
5. Estado cambia a "Desactivada" en la lista
```

**Características:**
- 🔑 Código demo: `123456` (en producción sería SMS o app autenticadora)
- ⚠️ Advertencias claras sobre seguridad
- 📱 Diseño preparado para integración con apps autenticadoras
- 💚 Feedback visual del estado (Activada/Desactivada)

---

### 3. Cerrar Sesión

**Ubicación:** Ajustes → Cuenta → Cerrar Sesión

#### Modal de Cerrar Sesión

**Contenido:**
- Icono naranja de logout
- Título: "Cerrar Sesión"
- Mensaje: "Tendrás que iniciar sesión nuevamente para acceder a tu cuenta"
- Botones: Cancelar / Cerrar Sesión

**Flujo:**
```
1. Usuario hace clic en "Cerrar Sesión"
2. Modal de confirmación se abre
3. Usuario confirma
4. "👋 Sesión cerrada exitosamente"
5. Redirección a /login (simulado)
```

**Características:**
- ⚠️ Confirmación antes de cerrar sesión
- 🔄 Feedback háptico
- 🚪 Redirección automática
- 💾 En producción: Limpieza de tokens y datos locales

---

### 4. Eliminar Cuenta

**Ubicación:** Ajustes → Cuenta → Eliminar Cuenta

#### Modal de Eliminar Cuenta

**Contenido:**
- Icono rojo de papelera
- Título: "Eliminar Cuenta"
- Subtítulo: "Esta acción es permanente"
- Advertencia destacada con lista de consecuencias
- Botones: Cancelar / Eliminar Cuenta

**Advertencias:**
- ⚠️ Esta acción NO se puede deshacer
- 🗑️ Se eliminarán todos tus datos personales
- 📋 Perderás acceso a todas tus aplicaciones
- 💼 Se cancelarán tus ofertas activas
- 🚫 No podrás recuperar tu cuenta

**Flujo:**
```
1. Usuario hace clic en "Eliminar Cuenta"
2. Modal con advertencias se abre
3. Usuario lee las consecuencias
4. Usuario confirma eliminación
5. "❌ Cuenta eliminada permanentemente"
6. Redirección a página principal (simulado)
```

**Características:**
- 🔴 Color rojo para indicar peligro
- ⚠️ Múltiples advertencias claras
- 📝 Lista detallada de consecuencias
- 🛡️ Doble confirmación (modal + botón)
- 💥 Feedback háptico de advertencia

---

## 🎯 Diseño de Modales

### Estructura Común

Todos los modales siguen el mismo patrón de diseño:

```tsx
<div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm">
  <div className="min-h-screen px-4 flex items-center justify-center py-8">
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full">
      {/* Header con icono y título */}
      {/* Contenido específico */}
      {/* Botones de acción */}
    </div>
  </div>
</div>
```

### Características de Diseño

**Colores por Tipo:**
| Acción | Color | Uso |
|--------|-------|-----|
| Cambiar Contraseña | Azul | Acción informativa |
| 2FA | Verde | Acción de seguridad |
| Cerrar Sesión | Naranja | Acción de advertencia |
| Eliminar Cuenta | Rojo | Acción peligrosa |

**Elementos Comunes:**
- ✅ Fondo oscuro con blur (`backdrop-blur-sm`)
- ✅ Modal centrado y scrolleable
- ✅ Iconos contextuales en header
- ✅ Botones con gradientes
- ✅ Feedback háptico en todas las acciones
- ✅ Click fuera del modal para cerrar
- ✅ Responsive (móvil y desktop)
- ✅ Soporte para tema oscuro

---

## 📱 Responsive Design

### Modales
- `max-w-md` - Ancho máximo 448px
- `px-4` - Padding horizontal en móvil
- `py-8` - Padding vertical para scroll
- `overflow-y-auto` - Scroll si el contenido es largo

### Inputs
- Tamaño de toque mínimo: 44px
- Iconos de toggle visibles y accesibles
- Texto legible en pantallas pequeñas

---

## 🔄 Estados y Persistencia

### Tema
- **Persistencia:** `localStorage.setItem('theme', value)`
- **Carga inicial:** Lee de localStorage o usa 'system'
- **Sincronización:** Escucha cambios en preferencias del sistema

### 2FA
- **Estado:** Guardado en componente (en producción: backend)
- **Persistencia:** Simulada (en producción: base de datos)

### Sesión
- **Logout:** Limpia datos locales (simulado)
- **Delete:** Elimina cuenta y datos (simulado)

---

## 🎨 Clases Tailwind para Tema Oscuro

### Patrón de Uso

```tsx
className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
```

**Colores Principales:**
- Fondo: `bg-white` / `dark:bg-slate-800`
- Texto: `text-slate-900` / `dark:text-slate-100`
- Bordes: `border-slate-200` / `dark:border-slate-700`
- Hover: `hover:bg-slate-100` / `dark:hover:bg-slate-700`

---

## ✅ Checklist de Funcionalidades

### Tema Oscuro
- ✅ Contexto global de tema
- ✅ Tres modos (claro, oscuro, automático)
- ✅ Persistencia en localStorage
- ✅ Detección de preferencias del sistema
- ✅ Toggle en Settings
- ✅ Aplicación en toda la app

### Cambiar Contraseña
- ✅ Modal con formulario completo
- ✅ Campos con show/hide
- ✅ Validaciones en tiempo real
- ✅ Indicadores de requisitos
- ✅ Feedback de éxito/error

### 2FA
- ✅ Modal de activación/desactivación
- ✅ Código de verificación demo
- ✅ Explicación clara de 2FA
- ✅ Advertencias de seguridad
- ✅ Estado visible en lista

### Cerrar Sesión
- ✅ Modal de confirmación
- ✅ Mensaje claro
- ✅ Redirección simulada
- ✅ Feedback háptico

### Eliminar Cuenta
- ✅ Modal con advertencias
- ✅ Lista de consecuencias
- ✅ Confirmación doble
- ✅ Feedback visual de peligro
- ✅ Redirección simulada

---

## 🔮 Próximas Mejoras

### Tema
1. **Transiciones suaves** entre temas
2. **Personalización de colores** (accent colors)
3. **Modo alto contraste** para accesibilidad
4. **Preview en tiempo real** antes de aplicar

### Seguridad
1. **Integración real con backend** para cambio de contraseña
2. **Apps autenticadoras** (Google Authenticator, Authy)
3. **SMS verification** para 2FA
4. **Backup codes** para recuperación de 2FA
5. **Historial de sesiones** activas
6. **Notificaciones de seguridad** (login desde nuevo dispositivo)
7. **Período de gracia** para recuperar cuenta eliminada (30 días)
8. **Exportar datos** antes de eliminar cuenta

---

## 🎓 Conceptos Clave

### Tema Oscuro
- **System preference:** Respeta la configuración del OS
- **Persistencia:** Guarda la preferencia del usuario
- **Accesibilidad:** Reduce fatiga visual en ambientes oscuros

### 2FA
- **Segundo factor:** Algo que tienes (teléfono) además de algo que sabes (contraseña)
- **TOTP:** Time-based One-Time Password (códigos que expiran)
- **Backup codes:** Códigos de respaldo para emergencias

### Seguridad de Contraseñas
- **Longitud mínima:** 8 caracteres (recomendado: 12+)
- **Complejidad:** Mayúsculas, minúsculas, números, símbolos
- **No reutilizar:** Contraseña única por servicio
- **Gestor de contraseñas:** Recomendado para usuarios

---

## 📊 Métricas Sugeridas

Para futuras implementaciones, considerar trackear:

1. **Uso de tema:**
   - % usuarios en modo claro vs oscuro vs automático
   - Hora del día de cambios de tema
   
2. **Seguridad:**
   - % usuarios con 2FA activado
   - Frecuencia de cambios de contraseña
   - Intentos fallidos de login
   
3. **Retención:**
   - Tasa de cuentas eliminadas
   - Razones de eliminación
   - Tiempo promedio antes de eliminar

---

## 🛠️ Código de Ejemplo

### Usar el Tema en un Componente

```typescript
import { useTheme } from '../contexts/ThemeContext';

function MyComponent() {
  const { theme, effectiveTheme, setTheme, toggleTheme } = useTheme();
  
  return (
    <div>
      <p>Tema actual: {theme}</p>
      <p>Tema efectivo: {effectiveTheme}</p>
      
      <button onClick={toggleTheme}>
        Toggle Tema
      </button>
      
      <button onClick={() => setTheme('dark')}>
        Modo Oscuro
      </button>
    </div>
  );
}
```

### Aplicar Estilos con Tema

```typescript
<div className={`
  p-4 rounded-lg
  ${effectiveTheme === 'dark' 
    ? 'bg-slate-800 text-white' 
    : 'bg-white text-slate-900'
  }
`}>
  Contenido adaptativo
</div>
```
