// Salary Calculator Types

export interface SalaryRange {
  min: number;
  max: number;
  currency: 'CRC' | 'USD' | 'MXN' | 'COP' | 'BRL';
}

export interface Benefit {
  id: string;
  name: string;
  category: 'health' | 'wellness' | 'transport' | 'food' | 'education' | 'time_off' | 'financial' | 'other';
  estimatedValue: number; // Valor monetario estimado mensual
  currency: 'CRC' | 'USD' | 'MXN' | 'COP' | 'BRL';
  description?: string;
  isPercentage?: boolean; // Si es un porcentaje del salario
  percentageValue?: number; // Valor del porcentaje (ej: 10 para 10%)
}

export interface TaxCalculation {
  grossSalary: number;
  incomeTax: number;
  socialSecurity: number;
  otherDeductions: number;
  netSalary: number;
  currency: 'CRC' | 'USD' | 'MXN' | 'COP' | 'BRL';
  country: 'CR' | 'US' | 'MX' | 'CO' | 'BR';
}

export interface SalaryBreakdown {
  baseSalary: number;
  benefits: Benefit[];
  totalBenefitsValue: number;
  totalCompensation: number;
  netSalary: number;
  taxCalculation: TaxCalculation;
  currency: 'CRC' | 'USD' | 'MXN' | 'COP' | 'BRL';
  country: 'CR' | 'US' | 'MX' | 'CO' | 'BR';
}

export interface NegotiationMessage {
  id: string;
  sender: 'candidate' | 'company';
  message: string;
  timestamp: Date;
  read: boolean;
}

export interface JobOffer {
  id: string;
  applicationId: string;
  companyName: string;
  positionTitle: string;
  salaryRange?: SalaryRange;
  fixedSalary?: number;
  currency: 'CRC' | 'USD' | 'MXN' | 'COP' | 'BRL';
  country: 'CR' | 'US' | 'MX' | 'CO' | 'BR';
  benefits: Benefit[];
  offerDate: Date;
  expirationDate: Date;
  status: 'pending' | 'accepted' | 'declined' | 'negotiating' | 'expired';
  negotiationNotes?: string;
  negotiationMessages?: NegotiationMessage[];
  awaitingCandidateResponse?: boolean; // true cuando la empresa responde y espera al candidato
}

// Configuración de impuestos por país (simplificada para demo)
export interface TaxConfig {
  country: 'CR' | 'US' | 'MX' | 'CO' | 'BR';
  currency: 'CRC' | 'USD' | 'MXN' | 'COP' | 'BRL';
  incomeTaxBrackets: {
    min: number;
    max: number;
    rate: number; // Porcentaje
  }[];
  socialSecurityRate: number; // Porcentaje
  otherDeductionsRate: number; // Porcentaje (otros descuentos)
  exemptAmount: number; // Monto exento de impuestos
}

// Catálogo de beneficios comunes con valores estimados
export interface BenefitCatalog {
  [key: string]: {
    name: string;
    category: Benefit['category'];
    estimatedValue: Record<string, number>; // Por país/moneda
    description: string;
    isPercentage?: boolean;
    percentageValue?: number;
  };
}