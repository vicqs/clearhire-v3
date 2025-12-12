# Calculador de Salario Neto y Beneficios - Implementación Completa

## 🎯 Funcionalidad Implementada

### **Calculador de Salario Inteligente**
Un sistema completo que permite a los candidatos ver exactamente cuánto recibirían en su cuenta bancaria y el valor monetario real de sus beneficios, adaptado específicamente para el mercado LATAM.

## 💰 Características Principales

### **1. Cálculo de Salario Neto por País**
- **Costa Rica (CRC)**: Impuestos progresivos + CCSS (10.5%)
- **México (MXN)**: ISR + IMSS (4%) + otros descuentos
- **Colombia (COP)**: Renta + Salud/Pensión (8%)
- **Brasil (BRL)**: IR + INSS (11%) + otros
- **Estados Unidos (USD)**: Federal tax + Social Security (7.65%)

### **2. Valorización Monetaria de Beneficios**
Cada beneficio tiene un valor estimado realista por país:

#### **Beneficios de Salud**
- **Seguro Médico Privado**: ₡85,000 (CR) | $3,500 (MX) | $350,000 (CO) | R$450 (BR)
- **Seguro Dental**: ₡25,000 (CR) | $800 (MX) | $80,000 (CO) | R$120 (BR)
- **Seguro de Vida**: ₡15,000 (CR) | $500 (MX) | $50,000 (CO) | R$80 (BR)

#### **Beneficios de Bienestar**
- **Membresía Gimnasio**: ₡35,000 (CR) | $1,200 (MX) | $120,000 (CO) | R$150 (BR)
- **Vales de Alimentación**: ₡45,000 (CR) | $2,000 (MX) | $200,000 (CO) | R$300 (BR)

#### **Beneficios Financieros**
- **Aguinaldo (13° Salario)**: 8.33% del salario mensual
- **Prima de Vacaciones**: 4.17% del salario mensual
- **Subsidio de Transporte**: Valores fijos por país

#### **Beneficios Modernos**
- **Trabajo Remoto**: ₡40,000 (CR) - Ahorro en transporte y comidas
- **Horario Flexible**: ₡25,000 (CR) - Valor en ahorro de tiempo
- **Presupuesto Educación**: ₡50,000 (CR) - Cursos y certificaciones

### **3. Interfaz Intuitiva y Explicativa**

#### **Mensaje Principal**
```
💰 Con este salario recibirías:
₡1,850,000 netos al mes en tu cuenta, más ₡320,000 en beneficios valorados.
Tu paquete total vale ₡2,170,000 mensuales.
```

#### **Desglose Visual**
- **Salario Neto**: Lo que llega a tu cuenta bancaria
- **Beneficios Valorados**: Estimación monetaria mensual
- **Paquete Total**: Compensación real completa

#### **Calculadora Interactiva**
- **Slider para rangos salariales**: Ajusta dentro del rango ofrecido
- **Cálculo en tiempo real**: Actualización automática
- **Desglose de impuestos**: Transparencia total en descuentos

## 🏗️ Arquitectura Técnica

### **Servicios Implementados**

#### **SalaryCalculatorService**
```typescript
// Cálculo de impuestos por país
calculateTaxes(grossSalary: number, country: string): TaxCalculation

// Valorización de beneficios
calculateBenefitsValue(benefits: Benefit[], baseSalary: number, country: string): number

// Desglose completo
calculateSalaryBreakdown(baseSalary: number, benefits: Benefit[], country: string): SalaryBreakdown
```

#### **Configuración de Impuestos**
```typescript
const taxConfigs = {
  CR: {
    exemptAmount: 929000, // ₡929,000 exento
    incomeTaxBrackets: [
      { min: 0, max: 929000, rate: 0 },
      { min: 929001, max: 1363000, rate: 10 },
      { min: 1363001, max: 2392000, rate: 15 },
      { min: 2392001, max: Infinity, rate: 20 }
    ],
    socialSecurityRate: 10.5
  }
  // ... otros países
}
```

### **Componentes React**

#### **SalaryCalculator**
- Calculadora principal con slider interactivo
- Desglose visual de salario neto vs beneficios
- Expansión de detalles de impuestos
- Información contextual por país

#### **OfferCard**
- Tarjeta de oferta con calculadora integrada
- Acciones (aceptar, rechazar, negociar)
- Alertas de expiración
- Desglose de beneficios

#### **Offers Page**
- Lista completa de ofertas del candidato
- Filtros por estado (pendiente, aceptada, etc.)
- Estadísticas de ofertas
- Integración con calculadora

## 📊 Datos Mock Realistas

### **Ofertas por País**
1. **Costa Rica**: ₡1,800,000 - ₡2,500,000 + 10 beneficios
2. **México**: $45,000 MXN fijo + 6 beneficios
3. **Colombia**: $8,000,000 - $12,000,000 COP + 8 beneficios
4. **Brasil**: R$12,000 fijo + 9 beneficios
5. **Estados Unidos**: $8,500 - $12,000 USD + 8 beneficios

### **Beneficios Incluidos**
- Seguros médicos y dentales
- Vales de alimentación y transporte
- Aguinaldo y prima vacacional
- Presupuesto educativo
- Trabajo remoto y horario flexible
- Membresía de gimnasio

## 🎨 Experiencia de Usuario

### **Flujo Principal**
1. **Candidato recibe oferta** → Ve salario bruto
2. **Abre calculadora** → "💰 Calcular mi salario neto"
3. **Ajusta salario** → Slider si hay rango
4. **Ve resultado** → Mensaje explicativo claro
5. **Explora detalles** → Desglose de impuestos y beneficios

### **Mensajes Contextuales**
- **Rango salarial**: "Ajusta el salario dentro del rango ofrecido"
- **Beneficios**: "🎁 Beneficios incluidos: Seguro médico, vales..."
- **Impuestos**: "Desglose de impuestos y descuentos"
- **País específico**: "Cálculos basados en regulaciones de Costa Rica"

### **Alertas Inteligentes**
- **Oferta próxima a expirar**: "⚠️ Esta oferta expira pronto"
- **Oferta expirada**: "❌ Esta oferta expiró el [fecha]"
- **Información legal**: "Los cálculos son estimaciones..."

## 🚀 Integración con ClearHire

### **Navegación**
- **Dashboard**: Card "Ofertas Recibidas" con contador
- **Ruta dedicada**: `/offers` con lista completa
- **Integración móvil**: Responsive y touch-friendly

### **Notificaciones**
- Compatible con sistema de notificaciones existente
- Alertas de nuevas ofertas
- Recordatorios de expiración

### **Datos Persistentes**
- Ofertas almacenadas por candidato
- Historial de decisiones
- Preferencias de cálculo

## 💡 Valor Diferencial

### **Para Candidatos**
- **Transparencia total**: Saben exactamente qué recibirán
- **Comparación real**: Pueden comparar ofertas por valor total
- **Educación financiera**: Entienden impuestos y beneficios
- **Toma de decisiones**: Información completa para decidir

### **Para Empresas**
- **Diferenciación**: Muestran el valor real de sus ofertas
- **Transparencia**: Genera confianza con candidatos
- **Competitividad**: Destacan beneficios valorados
- **Menos negociación**: Candidatos ven valor completo

### **Para ClearHire**
- **Funcionalidad única**: No existe en otros ATS
- **Valor agregado**: Justifica suscripciones premium
- **Engagement**: Candidatos pasan más tiempo en la plataforma
- **Datos valiosos**: Insights sobre expectativas salariales

## 🔮 Extensiones Futuras

### **Funcionalidades Avanzadas**
1. **Comparador de ofertas**: Tabla comparativa lado a lado
2. **Simulador de negociación**: "¿Qué pasa si pido X más?"
3. **Calculadora de costo de vida**: Ajuste por ciudad
4. **Proyección anual**: Vista de compensación anual completa
5. **Exportación**: PDF con desglose completo

### **Integraciones**
1. **APIs de bancos**: Tasas de cambio en tiempo real
2. **Datos gubernamentales**: Actualizaciones automáticas de impuestos
3. **Benchmarking**: Comparación con mercado
4. **Calculadoras de préstamos**: "¿Qué casa puedo comprar?"

### **Analytics**
1. **Patrones salariales**: Insights por industria/posición
2. **Efectividad de beneficios**: Qué valoran más los candidatos
3. **Tendencias de mercado**: Evolución de compensaciones
4. **Predicciones**: ML para sugerir rangos competitivos

---

## ✨ Resultado Final

El Calculador de Salario Neto y Beneficios transforma la experiencia de evaluación de ofertas de trabajo, proporcionando:

- **Transparencia radical** en compensaciones
- **Educación financiera** práctica
- **Toma de decisiones informada**
- **Diferenciación competitiva** para ClearHire

Esta funcionalidad posiciona a ClearHire como el ATS más transparente y útil del mercado LATAM, proporcionando valor real tanto a candidatos como a empresas. 🎉