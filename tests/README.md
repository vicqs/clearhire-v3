# 🧪 ClearHire ATS - Testing Suite

## Estructura de Pruebas

```
/tests
├── /unit                 # Pruebas unitarias (80%+ cobertura)
├── /integration         # Pruebas de integración con Supabase
├── /load               # Pruebas de carga y rendimiento
├── /e2e                # Pruebas end-to-end (opcional)
├── /postman            # Colección de Postman para API
├── /fixtures           # Datos de prueba
└── /utils              # Utilidades compartidas
```

## 🚀 Configuración Inicial

### Instalar Dependencias

```bash
npm install --save-dev vitest @vitest/ui @vitest/coverage-v8 jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event msw
```

### Variables de Entorno para Testing

Crear `.env.test`:
```env
VITE_SUPABASE_URL=https://vzcuumrnilzeufizyfei.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_USE_SUPABASE=true
NODE_ENV=test
```

## 📋 Comandos de Ejecución

```bash
# Pruebas unitarias
npm run test:unit

# Pruebas con cobertura
npm run test:coverage

# Pruebas de integración
npm run test:integration

# Pruebas de carga
npm run test:load

# Todas las pruebas
npm run test:all

# Modo watch
npm run test:watch

# UI de pruebas
npm run test:ui
```

## 🎯 Objetivos de Cobertura

- **Mínimo**: 80% cobertura de código
- **Objetivo**: 90%+ en funciones críticas
- **Servicios**: 95%+ cobertura
- **Componentes**: 85%+ cobertura

## 📊 Métricas de Rendimiento

### Tiempos de Respuesta Objetivo
- API calls: < 200ms (p95)
- Carga de página: < 1s
- Interacciones UI: < 100ms

### Carga de Trabajo
- Usuarios concurrentes: 100+
- Requests/segundo: 50+
- Duración de prueba: 10 minutos

## 🔧 Configuración por Tipo

### Unit Tests
- Framework: Vitest
- Mocking: vi.mock()
- DOM: jsdom
- Testing Library: React Testing Library

### Integration Tests
- Base de datos: Supabase (ambiente test)
- Autenticación: Usuario de prueba
- Cleanup: Automático después de cada test

### Load Tests
- Herramienta: k6
- Escenarios: Ramping, Stress, Spike
- Reportes: HTML + JSON

### E2E Tests (Opcional)
- Framework: Playwright
- Browsers: Chromium, Firefox, Safari
- Parallelización: Habilitada

## 🛠️ Configuración de CI/CD

Las pruebas se ejecutan automáticamente en:
- Pull Requests
- Push a main/develop
- Releases

### Pipeline de Pruebas
1. Unit Tests (paralelo)
2. Integration Tests
3. Build & Deploy to staging
4. E2E Tests en staging
5. Load Tests (opcional)

## 📝 Convenciones

### Nomenclatura
- Unit: `*.test.ts`
- Integration: `*.integration.test.ts`
- E2E: `*.e2e.test.ts`

### Estructura de Test
```typescript
describe('ComponentName', () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  describe('when condition', () => {
    it('should do something', () => {
      // Test implementation
    });
  });
});
```

## 🐛 Debugging

### Ejecutar test específico
```bash
npm run test -- --grep "test name"
```

### Debug con breakpoints
```bash
npm run test:debug
```

### Ver cobertura detallada
```bash
npm run test:coverage -- --reporter=html
```

## 📚 Recursos

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [k6 Documentation](https://k6.io/docs/)
- [Playwright Documentation](https://playwright.dev/)