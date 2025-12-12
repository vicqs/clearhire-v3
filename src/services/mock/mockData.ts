import type { Application, RecruiterInfo } from '../../types/application';
import type { Profile, Badge, TimeSlot } from '../../types/profile';

// Mock Companies
export const mockCompanies = [
  {
    id: '1',
    name: 'Fintech Andina S.A.',
    country: 'Colombia',
    logo: '/logos/fintech-andina.png',
  },
  {
    id: '2',
    name: 'Desarrollos Monterrey',
    country: 'México',
    logo: '/logos/desarrollos-monterrey.png',
  },
  {
    id: '3',
    name: 'Tech Solutions Brasil',
    country: 'Brasil',
    logo: '/logos/tech-solutions.png',
  },
];

// Mock Recruiters
export const mockRecruiters: RecruiterInfo[] = [
  {
    id: '1',
    name: 'María González',
    title: 'Reclutadora Senior',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
  },
  {
    id: '2',
    name: 'Carlos Rodríguez',
    title: 'Tech Lead',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
  },
  {
    id: '3',
    name: 'Ana Silva',
    title: 'HR Manager',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana',
  },
];

// Mock Applications - Base data
const baseMockApplications: Application[] = [
  {
    id: 'app-1',
    candidateId: 'user-1',
    jobId: 'job-1',
    company: 'Fintech Andina S.A.',
    position: 'Desarrollador Full Stack Senior',
    availablePositions: 2,
    status: 'active',
    appliedDate: new Date('2025-11-20'),
    lastUpdate: new Date('2025-12-01'),
    interviewConfirmed: false,
    currentStageId: 'stage-3',
    stages: [
      {
        id: 'stage-1',
        name: 'Recibido',
        order: 1,
        status: 'completed',
        estimatedDays: 1,
        actualDays: 1,
        startDate: new Date('2025-11-20'),
        endDate: new Date('2025-11-21'),
        score: 100,
      },
      {
        id: 'stage-2',
        name: 'Revisión Técnica',
        order: 2,
        status: 'completed',
        recruiter: mockRecruiters[1],
        estimatedDays: 5,
        actualDays: 4,
        startDate: new Date('2025-11-21'),
        endDate: new Date('2025-11-25'),
        score: 85,
      },
      {
        id: 'stage-3',
        name: 'Evaluación Técnica',
        order: 3,
        status: 'in_progress',
        recruiter: mockRecruiters[1],
        estimatedDays: 7,
        startDate: new Date('2025-11-25'),
      },
      {
        id: 'stage-4',
        name: 'Entrevista Cultural',
        order: 4,
        status: 'pending',
        recruiter: mockRecruiters[0],
        estimatedDays: 3,
        startDate: new Date('2025-12-05'),
      },
      {
        id: 'stage-5',
        name: 'Oferta',
        order: 5,
        status: 'pending',
        estimatedDays: 2,
        startDate: new Date('2025-12-10'),
      },
    ],
  },
  {
    id: 'app-2',
    candidateId: 'user-1',
    jobId: 'job-2',
    company: 'Desarrollos Monterrey',
    position: 'Frontend Developer React',
    availablePositions: 1,
    status: 'rejected',
    appliedDate: new Date('2025-11-10'),
    lastUpdate: new Date('2025-11-18'),
    finalScore: 65,
    interviewConfirmed: false,
    currentStageId: 'stage-2',
    stages: [
      {
        id: 'stage-1',
        name: 'Recibido',
        order: 1,
        status: 'completed',
        estimatedDays: 1,
        actualDays: 1,
        startDate: new Date('2025-11-10'),
        endDate: new Date('2025-11-11'),
        score: 100,
      },
      {
        id: 'stage-2',
        name: 'Revisión Técnica',
        order: 2,
        status: 'rejected',
        recruiter: mockRecruiters[2],
        estimatedDays: 5,
        actualDays: 7,
        startDate: new Date('2025-11-11'),
        endDate: new Date('2025-11-18'),
        score: 65,
        feedback: {
          category: 'Brecha de Habilidades Técnicas',
          aiExplanation: 'Hemos revisado cuidadosamente tu perfil y experiencia. Si bien demuestras un buen conocimiento de JavaScript, identificamos que la posición requiere experiencia más profunda en React avanzado, específicamente en hooks personalizados, optimización de rendimiento y arquitectura de aplicaciones a gran escala. Esto no refleja tu potencial, sino que la posición actual busca un perfil con más años de experiencia específica en React.',
          recommendations: [
            {
              id: 'rec-1',
              skill: 'React Hooks Avanzados',
              resource: 'Curso Avanzado de React Hooks',
              resourceUrl: 'https://example.com/react-hooks',
              priority: 'high',
            },
            {
              id: 'rec-2',
              skill: 'Optimización de Rendimiento',
              resource: 'React Performance Optimization',
              resourceUrl: 'https://example.com/react-performance',
              priority: 'high',
            },
            {
              id: 'rec-3',
              skill: 'Docker',
              resource: 'Docker para Desarrolladores',
              resourceUrl: 'https://example.com/docker',
              priority: 'medium',
            },
            {
              id: 'rec-4',
              skill: 'CI/CD',
              resource: 'Integración y Despliegue Continuo',
              resourceUrl: 'https://example.com/cicd',
              priority: 'medium',
            },
          ],
        },
      },
    ],
  },
  {
    id: 'app-3',
    candidateId: 'user-1',
    jobId: 'job-3',
    company: 'Tech Solutions Brasil',
    position: 'DevOps Engineer',
    availablePositions: 3,
    status: 'approved',
    appliedDate: new Date('2025-10-15'),
    lastUpdate: new Date('2025-11-05'),
    finalScore: 92,
    interviewDate: new Date('2025-10-28T10:00:00'),
    interviewConfirmed: true,
    currentStageId: 'stage-5',
    stages: [
      {
        id: 'stage-1',
        name: 'Recibido',
        order: 1,
        status: 'completed',
        estimatedDays: 1,
        actualDays: 1,
        startDate: new Date('2025-10-15'),
        endDate: new Date('2025-10-16'),
        score: 100,
      },
      {
        id: 'stage-2',
        name: 'Revisión Técnica',
        order: 2,
        status: 'completed',
        recruiter: mockRecruiters[1],
        estimatedDays: 5,
        actualDays: 3,
        startDate: new Date('2025-10-16'),
        endDate: new Date('2025-10-19'),
        score: 95,
      },
      {
        id: 'stage-3',
        name: 'Evaluación Técnica',
        order: 3,
        status: 'completed',
        recruiter: mockRecruiters[1],
        estimatedDays: 7,
        actualDays: 6,
        startDate: new Date('2025-10-19'),
        endDate: new Date('2025-10-25'),
        score: 90,
      },
      {
        id: 'stage-4',
        name: 'Entrevista Cultural',
        order: 4,
        status: 'completed',
        recruiter: mockRecruiters[0],
        estimatedDays: 3,
        actualDays: 3,
        startDate: new Date('2025-10-25'),
        endDate: new Date('2025-10-28'),
        score: 88,
      },
      {
        id: 'stage-5',
        name: 'Oferta',
        order: 5,
        status: 'completed',
        estimatedDays: 2,
        actualDays: 8,
        startDate: new Date('2025-10-28'),
        endDate: new Date('2025-11-05'),
        score: 92,
      },
    ],
  },
];

// Runtime applications array - mutable for mock mode
let runtimeApplications: Application[] = [...baseMockApplications];

// Helper functions for runtime management
export const mockApplications = runtimeApplications;

/**
 * Add a new application to the runtime list
 */
export const addMockApplication = (application: Application): void => {
  runtimeApplications.push(application);
  console.log(`✅ Mock application added: ${application.position} at ${application.company}`);
};

/**
 * Get all applications
 */
export const getAllMockApplications = (): Application[] => {
  return runtimeApplications;
};

/**
 * Find application by ID
 */
export const findMockApplicationById = (id: string): Application | undefined => {
  return runtimeApplications.find(app => app.id === id);
};

/**
 * Reset applications to base state (useful for testing)
 */
export const resetMockApplications = (): void => {
  runtimeApplications = [...baseMockApplications];
  console.log('🔄 Mock applications reset to base state');
};

// Mock Profile
export const mockProfile: Profile = {
  id: 'mock-profile-1',
  personalInfo: {
    firstName: 'Juan',
    lastName: 'Pérez',
    country: 'México',
    phone: '+52 55 1234 5678',
    email: 'juan.perez@example.com',
  },
  experience: [
    {
      id: 'exp-1',
      company: 'Tech Startup MX',
      position: 'Desarrollador Full Stack',
      startDate: '2022-01-01',
      endDate: '2025-11-01',
      description: 'Desarrollo de aplicaciones web con React, Node.js y PostgreSQL. Implementación de CI/CD con GitHub Actions.',
    },
    {
      id: 'exp-2',
      company: 'Agencia Digital',
      position: 'Desarrollador Frontend',
      startDate: '2020-06-01',
      endDate: '2021-12-31',
      description: 'Creación de sitios web responsivos con HTML, CSS, JavaScript y WordPress.',
    },
  ],
  education: [
    {
      id: 'edu-1',
      institution: 'Universidad Nacional Autónoma de México',
      degree: 'Ingeniería en Computación',
      fieldOfStudy: 'Ciencias de la Computación',
      graduationYear: '2020',
    },
  ],
  languages: [
    { language: 'Español', proficiency: 'Nativo' },
    { language: 'Inglés', proficiency: 'Avanzado' },
    { language: 'Portugués', proficiency: 'Básico' },
  ],
  softSkills: ['Trabajo en Equipo', 'Liderazgo', 'Comunicación', 'Resolución de Problemas'],
  trade: 'Desarrollo de Software',
  references: [
    {
      id: 'ref-1',
      name: 'María López',
      email: 'maria.lopez@techstartup.mx',
      phone: '+52 55 9876 5432',
    },
  ],
};

// Mock Badges
export const mockBadges: Badge[] = [
  {
    id: 'badge-1',
    name: 'Early Bird',
    description: 'Aplicaste en las primeras 24 horas',
    icon: 'sunrise',
    earnedAt: new Date('2025-11-20'),
    rarity: 'common',
  },
  {
    id: 'badge-2',
    name: 'Skill Master',
    description: 'Completaste todas las secciones de habilidades',
    icon: 'award',
    earnedAt: new Date('2025-11-22'),
    rarity: 'rare',
  },
  {
    id: 'badge-3',
    name: 'Perfect Profile',
    description: 'Alcanzaste 100% de completitud de perfil',
    icon: 'star',
    earnedAt: new Date('2025-11-25'),
    rarity: 'epic',
  },
];

// Mock Time Slots
export const mockTimeSlots: TimeSlot[] = [
  {
    id: 'slot-1',
    date: new Date('2025-12-10'),
    startTime: '10:00',
    endTime: '11:00',
    available: true,
    recruiterName: 'Carlos Rodríguez',
    type: 'virtual',
  },
  {
    id: 'slot-2',
    date: new Date('2025-12-10'),
    startTime: '14:00',
    endTime: '15:00',
    available: true,
    recruiterName: 'Carlos Rodríguez',
    type: 'virtual',
  },
  {
    id: 'slot-3',
    date: new Date('2025-12-12'),
    startTime: '09:00',
    endTime: '10:00',
    available: true,
    recruiterName: 'Carlos Rodríguez',
    type: 'presencial',
    location: 'Oficina Central, Bogotá',
  },
  {
    id: 'slot-4',
    date: new Date('2025-12-12'),
    startTime: '16:00',
    endTime: '17:00',
    available: false,
    recruiterName: 'Carlos Rodríguez',
    type: 'virtual',
  },
];

// Predefined values for comboboxes
export const predefinedValues = {
  countries: ['México', 'Colombia', 'Brasil', 'Argentina', 'Chile', 'Perú', 'Costa Rica'],
  positions: [
    'Desarrollador Frontend',
    'Desarrollador Backend',
    'Desarrollador Full Stack',
    'DevOps Engineer',
    'QA Engineer',
    'Product Manager',
    'UX/UI Designer',
    'Data Scientist',
  ],
  degrees: [
    'Ingeniería en Computación',
    'Ingeniería en Sistemas',
    'Licenciatura en Informática',
    'Técnico en Programación',
    'Maestría en Ciencias de la Computación',
  ],
  fieldsOfStudy: [
    'Ciencias de la Computación',
    'Ingeniería de Software',
    'Sistemas de Información',
    'Inteligencia Artificial',
    'Seguridad Informática',
  ],
  trades: [
    'Electricista',
    'Plomero',
    'Carpintero',
    'Mecánico',
    'Soldador',
    'Diseño Gráfico',
    'Fotografía',
    'Edición de Video',
  ],
};
