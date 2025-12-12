import type { JobOffer, Benefit } from '../../types/salary';
import { salaryCalculatorService } from '../salaryCalculatorService';

// Ofertas mock enfocadas en el mercado costarricense con empresas y salarios realistas
// Fechas calculadas dinámicamente para que siempre estén vigentes
const today = new Date();
const futureDate = (days: number) => new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
const pastDate = (days: number) => new Date(today.getTime() - days * 24 * 60 * 60 * 1000);

export const mockJobOffers: JobOffer[] = [
  // OFERTA NUEVA - Para aceptar o rechazar
  {
    id: 'offer_1',
    applicationId: 'app_1',
    companyName: 'Banco Nacional de Costa Rica',
    positionTitle: 'Desarrollador Full Stack Senior',
    salaryRange: {
      min: 1850000, // ₡1,850,000 CRC
      max: 2400000, // ₡2,400,000 CRC
      currency: 'CRC'
    },
    currency: 'CRC',
    country: 'CR',
    benefits: [
      salaryCalculatorService.getBenefitFromCatalog('health_insurance', 'CR')!,
      salaryCalculatorService.getBenefitFromCatalog('dental_insurance', 'CR')!,
      salaryCalculatorService.getBenefitFromCatalog('life_insurance', 'CR')!,
      salaryCalculatorService.getBenefitFromCatalog('meal_vouchers', 'CR')!,
      salaryCalculatorService.getBenefitFromCatalog('transport_allowance', 'CR')!,
      salaryCalculatorService.getBenefitFromCatalog('education_budget', 'CR')!,
      salaryCalculatorService.getBenefitFromCatalog('bonus_13th_salary', 'CR')!,
      salaryCalculatorService.getBenefitFromCatalog('vacation_bonus', 'CR')!,
      salaryCalculatorService.getBenefitFromCatalog('flexible_hours', 'CR')!
    ],
    offerDate: pastDate(2), // Hace 2 días
    expirationDate: futureDate(12), // Expira en 12 días
    status: 'pending',
    negotiationNotes: 'Oferta inicial - Puedes aceptar, rechazar o negociar el salario'
  },
  // OFERTA NUEVA - Para negociar
  {
    id: 'offer_2',
    applicationId: 'app_2',
    companyName: 'Grupo Mutual Alajuela La Vivienda',
    positionTitle: 'Desarrollador Frontend React',
    fixedSalary: 1650000, // ₡1,650,000 CRC
    currency: 'CRC',
    country: 'CR',
    benefits: [
      salaryCalculatorService.getBenefitFromCatalog('health_insurance', 'CR')!,
      salaryCalculatorService.getBenefitFromCatalog('dental_insurance', 'CR')!,
      salaryCalculatorService.getBenefitFromCatalog('meal_vouchers', 'CR')!,
      salaryCalculatorService.getBenefitFromCatalog('transport_allowance', 'CR')!,
      salaryCalculatorService.getBenefitFromCatalog('bonus_13th_salary', 'CR')!,
      salaryCalculatorService.getBenefitFromCatalog('vacation_bonus', 'CR')!,
      salaryCalculatorService.getBenefitFromCatalog('remote_work', 'CR')!
    ],
    offerDate: pastDate(1), // Hace 1 día
    expirationDate: futureDate(13), // Expira en 13 días
    status: 'pending',
    negotiationNotes: 'Oferta reciente - Considera negociar si el salario no cumple tus expectativas'
  },
  // OFERTA NUEVA - Para aceptar
  {
    id: 'offer_3',
    applicationId: 'app_3',
    companyName: 'Accenture Costa Rica',
    positionTitle: 'UX/UI Designer Senior',
    salaryRange: {
      min: 1950000, // ₡1,950,000 CRC
      max: 2650000, // ₡2,650,000 CRC
      currency: 'CRC'
    },
    currency: 'CRC',
    country: 'CR',
    benefits: [
      salaryCalculatorService.getBenefitFromCatalog('health_insurance', 'CR')!,
      salaryCalculatorService.getBenefitFromCatalog('dental_insurance', 'CR')!,
      salaryCalculatorService.getBenefitFromCatalog('gym_membership', 'CR')!,
      salaryCalculatorService.getBenefitFromCatalog('meal_vouchers', 'CR')!,
      salaryCalculatorService.getBenefitFromCatalog('transport_allowance', 'CR')!,
      salaryCalculatorService.getBenefitFromCatalog('education_budget', 'CR')!,
      salaryCalculatorService.getBenefitFromCatalog('life_insurance', 'CR')!,
      salaryCalculatorService.getBenefitFromCatalog('bonus_13th_salary', 'CR')!,
      salaryCalculatorService.getBenefitFromCatalog('vacation_bonus', 'CR')!,
      salaryCalculatorService.getBenefitFromCatalog('flexible_hours', 'CR')!,
      salaryCalculatorService.getBenefitFromCatalog('remote_work', 'CR')!
    ],
    offerDate: today, // Hoy
    expirationDate: futureDate(14), // Expira en 14 días
    status: 'pending',
    negotiationNotes: 'Excelente paquete de beneficios - Oferta muy competitiva'
  },
  // OFERTA ACEPTADA - Ya firmada
  {
    id: 'offer_4',
    applicationId: 'app_4',
    companyName: 'Intel Costa Rica',
    positionTitle: 'Ingeniero de Software Backend',
    fixedSalary: 2200000, // ₡2,200,000 CRC
    currency: 'CRC',
    country: 'CR',
    benefits: [
      salaryCalculatorService.getBenefitFromCatalog('health_insurance', 'CR')!,
      salaryCalculatorService.getBenefitFromCatalog('dental_insurance', 'CR')!,
      salaryCalculatorService.getBenefitFromCatalog('life_insurance', 'CR')!,
      salaryCalculatorService.getBenefitFromCatalog('gym_membership', 'CR')!,
      salaryCalculatorService.getBenefitFromCatalog('meal_vouchers', 'CR')!,
      salaryCalculatorService.getBenefitFromCatalog('transport_allowance', 'CR')!,
      salaryCalculatorService.getBenefitFromCatalog('education_budget', 'CR')!,
      salaryCalculatorService.getBenefitFromCatalog('bonus_13th_salary', 'CR')!,
      salaryCalculatorService.getBenefitFromCatalog('vacation_bonus', 'CR')!,
      salaryCalculatorService.getBenefitFromCatalog('flexible_hours', 'CR')!,
      salaryCalculatorService.getBenefitFromCatalog('remote_work', 'CR')!
    ],
    offerDate: pastDate(10), // Hace 10 días
    expirationDate: futureDate(5), // Expira en 5 días (pero ya está aceptada)
    status: 'accepted',
    negotiationNotes: 'Contrato firmado - Inicio: 1 de febrero'
  },
  // OFERTA EN NEGOCIACIÓN - Esperando respuesta de la empresa
  {
    id: 'offer_5',
    applicationId: 'app_5',
    companyName: 'Gorilla Logic',
    positionTitle: 'Tech Lead Full Stack',
    salaryRange: {
      min: 2800000, // ₡2,800,000 CRC
      max: 3500000, // ₡3,500,000 CRC
      currency: 'CRC'
    },
    currency: 'CRC',
    country: 'CR',
    benefits: [
      salaryCalculatorService.getBenefitFromCatalog('health_insurance', 'CR')!,
      salaryCalculatorService.getBenefitFromCatalog('dental_insurance', 'CR')!,
      salaryCalculatorService.getBenefitFromCatalog('life_insurance', 'CR')!,
      salaryCalculatorService.getBenefitFromCatalog('gym_membership', 'CR')!,
      salaryCalculatorService.getBenefitFromCatalog('meal_vouchers', 'CR')!,
      salaryCalculatorService.getBenefitFromCatalog('education_budget', 'CR')!,
      salaryCalculatorService.getBenefitFromCatalog('bonus_13th_salary', 'CR')!,
      salaryCalculatorService.getBenefitFromCatalog('vacation_bonus', 'CR')!,
      salaryCalculatorService.getBenefitFromCatalog('flexible_hours', 'CR')!,
      salaryCalculatorService.getBenefitFromCatalog('remote_work', 'CR')!
    ],
    offerDate: pastDate(5), // Hace 5 días
    expirationDate: futureDate(9), // Expira en 9 días
    status: 'negotiating',
    negotiationNotes: 'En negociación - Esperando respuesta de la empresa',
    negotiationMessages: [
      {
        id: 'msg_1',
        sender: 'candidate',
        message: 'Hola, muchas gracias por la oferta. Me gustaría negociar el salario a ₡3,200,000 mensuales considerando mi experiencia de 8 años en desarrollo full stack y liderazgo de equipos. También me gustaría confirmar si hay posibilidad de trabajo remoto 100%.',
        timestamp: pastDate(3),
        read: true
      }
    ],
    awaitingCandidateResponse: false
  },
  // OFERTA EN NEGOCIACIÓN - La empresa respondió, esperando respuesta del candidato
  {
    id: 'offer_8',
    applicationId: 'app_8',
    companyName: 'Encora',
    positionTitle: 'Senior DevOps Engineer',
    fixedSalary: 2400000, // ₡2,400,000 CRC
    currency: 'CRC',
    country: 'CR',
    benefits: [
      salaryCalculatorService.getBenefitFromCatalog('health_insurance', 'CR')!,
      salaryCalculatorService.getBenefitFromCatalog('dental_insurance', 'CR')!,
      salaryCalculatorService.getBenefitFromCatalog('life_insurance', 'CR')!,
      salaryCalculatorService.getBenefitFromCatalog('meal_vouchers', 'CR')!,
      salaryCalculatorService.getBenefitFromCatalog('transport_allowance', 'CR')!,
      salaryCalculatorService.getBenefitFromCatalog('education_budget', 'CR')!,
      salaryCalculatorService.getBenefitFromCatalog('bonus_13th_salary', 'CR')!,
      salaryCalculatorService.getBenefitFromCatalog('vacation_bonus', 'CR')!,
      salaryCalculatorService.getBenefitFromCatalog('flexible_hours', 'CR')!
    ],
    offerDate: pastDate(7), // Hace 7 días
    expirationDate: futureDate(7), // Expira en 7 días
    status: 'negotiating',
    negotiationNotes: 'La empresa ha respondido - Revisa su propuesta',
    negotiationMessages: [
      {
        id: 'msg_2_1',
        sender: 'candidate',
        message: 'Gracias por la oferta. Me interesa mucho la posición, pero me gustaría negociar el salario a ₡2,700,000 y la posibilidad de trabajo remoto al menos 3 días a la semana.',
        timestamp: pastDate(4),
        read: true
      },
      {
        id: 'msg_2_2',
        sender: 'company',
        message: 'Hola! Gracias por tu interés. Hemos revisado tu solicitud y podemos ofrecerte ₡2,550,000 mensuales más un bono de desempeño trimestral de hasta ₡200,000. En cuanto al trabajo remoto, podemos ofrecerte 2 días a la semana de forma permanente. ¿Qué te parece esta propuesta?',
        timestamp: pastDate(1),
        read: false
      }
    ],
    awaitingCandidateResponse: true
  },
  // OFERTA EXPIRADA - Ya no se puede aceptar
  {
    id: 'offer_6',
    applicationId: 'app_6',
    companyName: 'Avantica Technologies',
    positionTitle: 'Desarrollador Mobile (React Native)',
    fixedSalary: 1750000, // ₡1,750,000 CRC
    currency: 'CRC',
    country: 'CR',
    benefits: [
      salaryCalculatorService.getBenefitFromCatalog('health_insurance', 'CR')!,
      salaryCalculatorService.getBenefitFromCatalog('dental_insurance', 'CR')!,
      salaryCalculatorService.getBenefitFromCatalog('gym_membership', 'CR')!,
      salaryCalculatorService.getBenefitFromCatalog('meal_vouchers', 'CR')!,
      salaryCalculatorService.getBenefitFromCatalog('transport_allowance', 'CR')!,
      salaryCalculatorService.getBenefitFromCatalog('education_budget', 'CR')!,
      salaryCalculatorService.getBenefitFromCatalog('bonus_13th_salary', 'CR')!,
      salaryCalculatorService.getBenefitFromCatalog('vacation_bonus', 'CR')!,
      salaryCalculatorService.getBenefitFromCatalog('remote_work', 'CR')!
    ],
    offerDate: pastDate(20), // Hace 20 días
    expirationDate: pastDate(5), // Expiró hace 5 días
    status: 'expired',
    negotiationNotes: 'Oferta expirada - No respondiste a tiempo'
  },
  // OFERTA RECHAZADA - Ya rechazada
  {
    id: 'offer_7',
    applicationId: 'app_7',
    companyName: 'Prodigious Latin America',
    positionTitle: 'Desarrollador Java Spring Boot',
    fixedSalary: 1550000, // ₡1,550,000 CRC
    currency: 'CRC',
    country: 'CR',
    benefits: [
      salaryCalculatorService.getBenefitFromCatalog('health_insurance', 'CR')!,
      salaryCalculatorService.getBenefitFromCatalog('meal_vouchers', 'CR')!,
      salaryCalculatorService.getBenefitFromCatalog('bonus_13th_salary', 'CR')!,
      salaryCalculatorService.getBenefitFromCatalog('vacation_bonus', 'CR')!,
      salaryCalculatorService.getBenefitFromCatalog('remote_work', 'CR')!
    ],
    offerDate: pastDate(8), // Hace 8 días
    expirationDate: futureDate(6), // Expiraría en 6 días (pero ya fue rechazada)
    status: 'declined',
    negotiationNotes: 'Oferta rechazada - Salario no cumplía expectativas'
  }
];

// Función para obtener oferta por ID de aplicación
export const getOfferByApplicationId = (applicationId: string): JobOffer | undefined => {
  return mockJobOffers.find(offer => offer.applicationId === applicationId);
};

// Función para obtener todas las ofertas de un candidato
export const getOffersByCandidateId = (_candidateId: string): JobOffer[] => {
  // En una implementación real, esto filtrarían por candidateId
  // Por ahora retornamos todas las ofertas mock
  return mockJobOffers;
};

// Función para crear una nueva oferta
export const createMockOffer = (
  applicationId: string,
  companyName: string,
  positionTitle: string,
  salary: number | { min: number; max: number },
  currency: 'CRC' | 'USD' | 'MXN' | 'COP' | 'BRL',
  country: 'CR' | 'US' | 'MX' | 'CO' | 'BR',
  benefitKeys: string[] = []
): JobOffer => {
  const benefits = benefitKeys
    .map(key => salaryCalculatorService.getBenefitFromCatalog(key, country))
    .filter(Boolean) as Benefit[];

  const offer: JobOffer = {
    id: `offer_${Date.now()}`,
    applicationId,
    companyName,
    positionTitle,
    currency,
    country,
    benefits,
    offerDate: new Date(),
    expirationDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 días
    status: 'pending'
  };

  if (typeof salary === 'number') {
    offer.fixedSalary = salary;
  } else {
    offer.salaryRange = {
      min: salary.min,
      max: salary.max,
      currency
    };
  }

  return offer;
};