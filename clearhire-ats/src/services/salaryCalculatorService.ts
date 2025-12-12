import type { 
  SalaryBreakdown, 
  TaxCalculation, 
  TaxConfig, 
  Benefit, 
  BenefitCatalog
} from '../types/salary';

// Configuración de impuestos por país (datos aproximados para demo)
const taxConfigs: Record<string, TaxConfig> = {
  CR: { // Costa Rica
    country: 'CR',
    currency: 'CRC',
    exemptAmount: 929000, // ₡929,000 exento mensual (aprox)
    incomeTaxBrackets: [
      { min: 0, max: 929000, rate: 0 },
      { min: 929001, max: 1363000, rate: 10 },
      { min: 1363001, max: 2392000, rate: 15 },
      { min: 2392001, max: Infinity, rate: 20 }
    ],
    socialSecurityRate: 10.5, // CCSS + otros
    otherDeductionsRate: 1 // Otros descuentos menores
  },
  MX: { // México
    country: 'MX',
    currency: 'MXN',
    exemptAmount: 8952, // $8,952 MXN exento mensual (aprox)
    incomeTaxBrackets: [
      { min: 0, max: 8952, rate: 0 },
      { min: 8953, max: 75984, rate: 6.4 },
      { min: 75985, max: 133536, rate: 10.88 },
      { min: 133537, max: 155229, rate: 16 },
      { min: 155230, max: Infinity, rate: 21.36 }
    ],
    socialSecurityRate: 4, // IMSS empleado
    otherDeductionsRate: 1.5
  },
  CO: { // Colombia
    country: 'CO',
    currency: 'COP',
    exemptAmount: 2340000, // $2,340,000 COP exento mensual (aprox)
    incomeTaxBrackets: [
      { min: 0, max: 2340000, rate: 0 },
      { min: 2340001, max: 4070000, rate: 19 },
      { min: 4070001, max: 8590000, rate: 28 },
      { min: 8590001, max: Infinity, rate: 33 }
    ],
    socialSecurityRate: 8, // Salud + pensión empleado
    otherDeductionsRate: 1
  },
  BR: { // Brasil
    country: 'BR',
    currency: 'BRL',
    exemptAmount: 2112, // R$2,112 exento mensual (aprox)
    incomeTaxBrackets: [
      { min: 0, max: 2112, rate: 0 },
      { min: 2112.01, max: 2826.65, rate: 7.5 },
      { min: 2826.66, max: 3751.05, rate: 15 },
      { min: 3751.06, max: 4664.68, rate: 22.5 },
      { min: 4664.69, max: Infinity, rate: 27.5 }
    ],
    socialSecurityRate: 11, // INSS
    otherDeductionsRate: 2
  },
  US: { // Estados Unidos (para comparación)
    country: 'US',
    currency: 'USD',
    exemptAmount: 1100, // $1,100 USD exento mensual (aprox)
    incomeTaxBrackets: [
      { min: 0, max: 1100, rate: 0 },
      { min: 1101, max: 4200, rate: 10 },
      { min: 4201, max: 16950, rate: 12 },
      { min: 16951, max: 40525, rate: 22 },
      { min: 40526, max: Infinity, rate: 24 }
    ],
    socialSecurityRate: 7.65, // Social Security + Medicare
    otherDeductionsRate: 2
  }
};

// Catálogo de beneficios con valores estimados por país
const benefitCatalog: BenefitCatalog = {
  health_insurance: {
    name: 'Seguro Médico Privado',
    category: 'health',
    description: 'Cobertura médica privada completa',
    estimatedValue: {
      CR: 85000,   // ₡85,000 CRC
      MX: 3500,    // $3,500 MXN
      CO: 350000,  // $350,000 COP
      BR: 450,     // R$450 BRL
      US: 400      // $400 USD
    }
  },
  dental_insurance: {
    name: 'Seguro Dental',
    category: 'health',
    description: 'Cobertura dental completa',
    estimatedValue: {
      CR: 25000,   // ₡25,000 CRC
      MX: 800,     // $800 MXN
      CO: 80000,   // $80,000 COP
      BR: 120,     // R$120 BRL
      US: 50       // $50 USD
    }
  },
  gym_membership: {
    name: 'Membresía de Gimnasio',
    category: 'wellness',
    description: 'Acceso a gimnasio o club deportivo',
    estimatedValue: {
      CR: 35000,   // ₡35,000 CRC
      MX: 1200,    // $1,200 MXN
      CO: 120000,  // $120,000 COP
      BR: 150,     // R$150 BRL
      US: 80       // $80 USD
    }
  },
  meal_vouchers: {
    name: 'Vales de Alimentación',
    category: 'food',
    description: 'Subsidio para comidas',
    estimatedValue: {
      CR: 45000,   // ₡45,000 CRC
      MX: 2000,    // $2,000 MXN
      CO: 200000,  // $200,000 COP
      BR: 300,     // R$300 BRL
      US: 200      // $200 USD
    }
  },
  transport_allowance: {
    name: 'Subsidio de Transporte',
    category: 'transport',
    description: 'Ayuda para gastos de transporte',
    estimatedValue: {
      CR: 30000,   // ₡30,000 CRC
      MX: 1500,    // $1,500 MXN
      CO: 150000,  // $150,000 COP
      BR: 200,     // R$200 BRL
      US: 150      // $150 USD
    }
  },
  education_budget: {
    name: 'Presupuesto de Educación',
    category: 'education',
    description: 'Fondos para cursos y certificaciones',
    estimatedValue: {
      CR: 50000,   // ₡50,000 CRC
      MX: 2500,    // $2,500 MXN
      CO: 250000,  // $250,000 COP
      BR: 300,     // R$300 BRL
      US: 200      // $200 USD
    }
  },
  bonus_13th_salary: {
    name: 'Aguinaldo (13° Salario)',
    category: 'financial',
    description: 'Pago adicional equivalente a un mes de salario',
    isPercentage: true,
    percentageValue: 8.33, // 1/12 del salario mensual
    estimatedValue: {
      CR: 0, MX: 0, CO: 0, BR: 0, US: 0 // Se calcula como porcentaje
    }
  },
  vacation_bonus: {
    name: 'Prima de Vacaciones',
    category: 'financial',
    description: 'Bonificación adicional por vacaciones',
    isPercentage: true,
    percentageValue: 4.17, // Aproximadamente 50% de medio salario
    estimatedValue: {
      CR: 0, MX: 0, CO: 0, BR: 0, US: 0 // Se calcula como porcentaje
    }
  },
  life_insurance: {
    name: 'Seguro de Vida',
    category: 'health',
    description: 'Póliza de seguro de vida',
    estimatedValue: {
      CR: 15000,   // ₡15,000 CRC
      MX: 500,     // $500 MXN
      CO: 50000,   // $50,000 COP
      BR: 80,      // R$80 BRL
      US: 30       // $30 USD
    }
  },
  flexible_hours: {
    name: 'Horario Flexible',
    category: 'time_off',
    description: 'Flexibilidad en horarios de trabajo',
    estimatedValue: {
      CR: 25000,   // ₡25,000 CRC (valor estimado en ahorro de transporte/tiempo)
      MX: 1000,    // $1,000 MXN
      CO: 100000,  // $100,000 COP
      BR: 150,     // R$150 BRL
      US: 100      // $100 USD
    }
  },
  remote_work: {
    name: 'Trabajo Remoto',
    category: 'other',
    description: 'Opción de trabajar desde casa',
    estimatedValue: {
      CR: 40000,   // ₡40,000 CRC (ahorro en transporte + comidas)
      MX: 2000,    // $2,000 MXN
      CO: 200000,  // $200,000 COP
      BR: 250,     // R$250 BRL
      US: 200      // $200 USD
    }
  }
};

class SalaryCalculatorService {
  
  // Calcular impuestos según el país
  calculateTaxes(grossSalary: number, country: string): TaxCalculation {
    const config = taxConfigs[country];
    if (!config) {
      throw new Error(`Tax configuration not found for country: ${country}`);
    }

    let incomeTax = 0;
    let remainingSalary = Math.max(0, grossSalary - config.exemptAmount);

    // Calcular impuesto sobre la renta por tramos
    for (const bracket of config.incomeTaxBrackets) {
      if (remainingSalary <= 0) break;
      
      const taxableInBracket = Math.min(
        remainingSalary, 
        bracket.max === Infinity ? remainingSalary : bracket.max - bracket.min + 1
      );
      
      incomeTax += taxableInBracket * (bracket.rate / 100);
      remainingSalary -= taxableInBracket;
    }

    // Calcular seguridad social
    const socialSecurity = grossSalary * (config.socialSecurityRate / 100);
    
    // Otros descuentos
    const otherDeductions = grossSalary * (config.otherDeductionsRate / 100);
    
    // Salario neto
    const netSalary = grossSalary - incomeTax - socialSecurity - otherDeductions;

    return {
      grossSalary,
      incomeTax: Math.round(incomeTax),
      socialSecurity: Math.round(socialSecurity),
      otherDeductions: Math.round(otherDeductions),
      netSalary: Math.round(netSalary),
      currency: config.currency,
      country: config.country
    };
  }

  // Calcular valor de beneficios
  calculateBenefitsValue(benefits: Benefit[], baseSalary: number, _country: string): number {
    return benefits.reduce((total, benefit) => {
      if (benefit.isPercentage && benefit.percentageValue) {
        // Beneficio calculado como porcentaje del salario
        return total + (baseSalary * (benefit.percentageValue / 100));
      } else {
        // Beneficio con valor fijo
        return total + benefit.estimatedValue;
      }
    }, 0);
  }

  // Obtener beneficio del catálogo
  getBenefitFromCatalog(benefitKey: string, country: string): Benefit | null {
    const catalogBenefit = benefitCatalog[benefitKey];
    if (!catalogBenefit) return null;

    const estimatedValue = catalogBenefit.estimatedValue[country] || 0;
    const currency = taxConfigs[country]?.currency || 'USD';

    return {
      id: benefitKey,
      name: catalogBenefit.name,
      category: catalogBenefit.category,
      estimatedValue,
      currency,
      description: catalogBenefit.description,
      isPercentage: catalogBenefit.isPercentage,
      percentageValue: catalogBenefit.percentageValue
    };
  }

  // Calcular desglose completo de salario
  calculateSalaryBreakdown(
    baseSalary: number,
    benefits: Benefit[],
    country: string
  ): SalaryBreakdown {
    const currency = taxConfigs[country]?.currency || 'USD';
    
    // Calcular valor total de beneficios
    const totalBenefitsValue = this.calculateBenefitsValue(benefits, baseSalary, country);
    
    // Compensación total (salario + beneficios)
    const totalCompensation = baseSalary + totalBenefitsValue;
    
    // Calcular impuestos sobre el salario base
    const taxCalculation = this.calculateTaxes(baseSalary, country);
    
    return {
      baseSalary,
      benefits,
      totalBenefitsValue: Math.round(totalBenefitsValue),
      totalCompensation: Math.round(totalCompensation),
      netSalary: taxCalculation.netSalary,
      taxCalculation,
      currency,
      country: country as any
    };
  }

  // Formatear moneda según el país
  formatCurrency(amount: number, _currency: string, country: string): string {
    const formatters: Record<string, Intl.NumberFormat> = {
      CR: new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', minimumFractionDigits: 0 }),
      MX: new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 }),
      CO: new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }),
      BR: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }),
      US: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })
    };

    const formatter = formatters[country] || formatters.US;
    return formatter.format(amount);
  }

  // Obtener símbolo de moneda
  getCurrencySymbol(currency: string): string {
    const symbols: Record<string, string> = {
      CRC: '₡',
      MXN: '$',
      COP: '$',
      BRL: 'R$',
      USD: '$'
    };
    return symbols[currency] || '$';
  }

  // Obtener todos los beneficios disponibles para un país
  getAvailableBenefits(country: string): Benefit[] {
    return Object.keys(benefitCatalog).map(key => 
      this.getBenefitFromCatalog(key, country)
    ).filter(Boolean) as Benefit[];
  }

  // Calcular rango de salario (mínimo y máximo)
  calculateSalaryRange(minSalary: number, maxSalary: number, benefits: Benefit[], country: string) {
    const minBreakdown = this.calculateSalaryBreakdown(minSalary, benefits, country);
    const maxBreakdown = this.calculateSalaryBreakdown(maxSalary, benefits, country);
    
    return {
      min: minBreakdown,
      max: maxBreakdown,
      currency: taxConfigs[country]?.currency || 'USD'
    };
  }

  // Generar mensaje explicativo para el candidato
  generateSalaryMessage(breakdown: SalaryBreakdown, country: string): string {
    const netFormatted = this.formatCurrency(breakdown.netSalary, breakdown.currency, country);
    const totalFormatted = this.formatCurrency(breakdown.totalCompensation, breakdown.currency, country);
    const benefitsFormatted = this.formatCurrency(breakdown.totalBenefitsValue, breakdown.currency, country);

    let message = `💰 **Tu compensación total sería:**\n\n`;
    message += `• **Salario neto mensual:** ${netFormatted} en tu cuenta\n`;
    message += `• **Valor de beneficios:** ${benefitsFormatted} mensuales\n`;
    message += `• **Paquete total:** ${totalFormatted}\n\n`;

    if (breakdown.benefits.length > 0) {
      message += `🎁 **Beneficios incluidos:**\n`;
      breakdown.benefits.forEach(benefit => {
        const value = benefit.isPercentage 
          ? `${benefit.percentageValue}% del salario`
          : this.formatCurrency(benefit.estimatedValue, benefit.currency, country);
        message += `• ${benefit.name}: ${value}\n`;
      });
    }

    return message;
  }
}

// Instancia singleton del servicio
export const salaryCalculatorService = new SalaryCalculatorService();
export default SalaryCalculatorService;