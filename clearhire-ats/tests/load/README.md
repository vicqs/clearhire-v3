# 🚀 Pruebas de Carga - ClearHire ATS

## Descripción

Las pruebas de carga evalúan el rendimiento de la aplicación bajo diferentes niveles de tráfico de usuarios concurrentes.

## Herramientas

- **k6**: Framework de pruebas de carga moderno
- **Grafana**: Visualización de métricas (opcional)
- **InfluxDB**: Almacenamiento de métricas (opcional)

## Tipos de Pruebas

### 1. Prueba de Carga Normal (`load-test.js`)
- **Objetivo**: Verificar rendimiento bajo carga esperada
- **Usuarios**: 10-50 usuarios concurrentes
- **Duración**: 20 minutos
- **Escenarios**: Flujo completo de usuario

### 2. Prueba de Estrés
- **Objetivo**: Encontrar límites del sistema
- **Usuarios**: Hasta 200 usuarios concurrentes
- **Duración**: 35 minutos
- **Escenarios**: Carga progresiva hasta el punto de quiebre

### 3. Prueba de Picos (Spike)
- **Objetivo**: Evaluar respuesta a aumentos súbitos de tráfico
- **Usuarios**: Picos de 10 a 100 usuarios
- **Duración**: 8 minutos
- **Escenarios**: Cambios abruptos de carga

## Métricas Monitoreadas

### Rendimiento
- **Tiempo de respuesta**: p50, p95, p99
- **Throughput**: Requests por segundo
- **Tasa de error**: Porcentaje de requests fallidos

### Específicas de la Aplicación
- **Tiempo de carga de perfil**: < 1.5s (p95)
- **Tiempo de guardado de perfil**: < 3s (p95)
- **Tiempo de autenticación**: < 1s (p95)

## Configuración

### Variables de Entorno

```bash
# URL de la aplicación
export BASE_URL=http://localhost:5173

# Configuración de Supabase
export SUPABASE_URL=https://vzcuumrnilzeufizyfei.supabase.co
export SUPABASE_KEY=your-supabase-anon-key
```

### Usuarios de Prueba

Crear usuarios de prueba en Supabase:
```sql
-- Crear usuarios para pruebas de carga
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at)
VALUES 
  ('load-test-1', 'load-test-1@clearhire.com', crypt('test123456', gen_salt('bf')), NOW()),
  ('load-test-2', 'load-test-2@clearhire.com', crypt('test123456', gen_salt('bf')), NOW()),
  ('load-test-3', 'load-test-3@clearhire.com', crypt('test123456', gen_salt('bf')), NOW()),
  ('load-test-4', 'load-test-4@clearhire.com', crypt('test123456', gen_salt('bf')), NOW()),
  ('load-test-5', 'load-test-5@clearhire.com', crypt('test123456', gen_salt('bf')), NOW());
```

## Ejecución

### Prueba Básica
```bash
k6 run tests/load/load-test.js
```

### Prueba con Configuración Personalizada
```bash
k6 run --vus 20 --duration 5m tests/load/load-test.js
```

### Prueba de Estrés
```bash
k6 run --config stress-test tests/load/load-test.js
```

### Con Salida a InfluxDB
```bash
k6 run --out influxdb=http://localhost:8086/k6 tests/load/load-test.js
```

## Interpretación de Resultados

### Métricas Clave

#### ✅ Resultados Aceptables
- **http_req_duration (p95)**: < 2000ms
- **http_req_failed**: < 5%
- **profile_load_time (p95)**: < 1500ms
- **profile_save_time (p95)**: < 3000ms

#### ⚠️ Resultados de Advertencia
- **http_req_duration (p95)**: 2000-5000ms
- **http_req_failed**: 5-10%
- Degradación gradual del rendimiento

#### ❌ Resultados Críticos
- **http_req_duration (p95)**: > 5000ms
- **http_req_failed**: > 10%
- Errores de timeout o conexión

### Análisis de Cuellos de Botella

#### Base de Datos (Supabase)
- Tiempo alto en `profile_save_time`
- Errores 500 en endpoints de API
- **Solución**: Optimizar queries, índices

#### Frontend (React)
- Tiempo alto en carga inicial
- Errores de JavaScript
- **Solución**: Code splitting, lazy loading

#### Red/CDN
- Tiempo alto en recursos estáticos
- Errores de timeout
- **Solución**: CDN, compresión

## Escenarios de Prueba

### Flujo de Usuario Típico
1. **Cargar página principal** (0.5s pausa)
2. **Autenticación** (login)
3. **Cargar perfil** (0.3s pausa)
4. **Actualizar perfil** (0.5s pausa)
5. **Cargar aplicaciones** (0.2s pausa)
6. **Pausa de reflexión** (1-4s)

### Distribución de Carga
- **70%**: Operaciones de lectura (GET)
- **25%**: Operaciones de escritura (POST/PUT)
- **5%**: Operaciones de autenticación

## Monitoreo en Tiempo Real

### Dashboard de k6
```bash
# Terminal 1: Ejecutar prueba
k6 run --out web-dashboard tests/load/load-test.js

# Terminal 2: Ver dashboard
open http://localhost:5665
```

### Métricas del Sistema
```bash
# CPU y memoria
top -p $(pgrep node)

# Conexiones de red
netstat -an | grep :5173

# Logs de la aplicación
tail -f logs/app.log
```

## Optimizaciones Recomendadas

### Basadas en Resultados

#### Si `profile_load_time` es alto:
- Implementar caché en Redis
- Optimizar queries de Supabase
- Usar paginación

#### Si `profile_save_time` es alto:
- Implementar batch updates
- Optimizar transacciones
- Usar queue para operaciones pesadas

#### Si hay muchos errores 5xx:
- Implementar circuit breaker
- Agregar retry logic
- Escalar recursos de Supabase

## Automatización

### CI/CD Integration
```yaml
# .github/workflows/load-test.yml
name: Load Tests
on:
  schedule:
    - cron: '0 2 * * *'  # Diario a las 2 AM
  workflow_dispatch:

jobs:
  load-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Load Tests
        run: |
          k6 run tests/load/load-test.js
          # Enviar resultados a sistema de monitoreo
```

### Alertas
- **Slack/Teams**: Notificar si las pruebas fallan
- **PagerDuty**: Alertas críticas de rendimiento
- **Email**: Reportes semanales de tendencias