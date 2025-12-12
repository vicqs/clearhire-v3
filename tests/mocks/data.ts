import type { Profile, Badge } from '../../src/types/profile';
import type { Application } from '../../src/types/application';

export const mockProfile: Profile = {
  personalInfo: {
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'test@clearhire.com',
    phone: '+52 55 1234 5678',
    country: 'México',
  },
  experience: [
    {
      id: '1',
      company: 'Tech Startup MX',
      position: 'Desarrollador Full Stack',
      startDate: '2022-01-01',
      endDate: '2025-11-01',
      description: 'Desarrollo de aplicaciones web con React, Node.js y PostgreSQL.',
    },
  ],
  education: [
    {
      id: '1',
      institution: 'Universidad Nacional Autónoma de México',
      degree: 'Ingeniería en Computación',
      fieldOfStudy: 'Ciencias de la Computación',
      graduationYear: '2020',
    },
  ],
  languages: [
    { language: 'Español', proficiency: 'Nativo' },
    { language: 'Inglés', proficiency: 'Avanzado' },
  ],
  softSkills: ['Trabajo en Equipo', 'Liderazgo', 'Comunicación'],
  trade: 'Desarrollo de Software',
  references: [
    {
      id: '1',
      name: 'María López',
      email: 'maria.lopez@techstartup.mx',
      phone: '+52 55 9876 5432',
    },
  ],
};

export const mockApplications: Application[] = [
  {
    id: '1',
    candidateId: '9a0ee8bb-7651-4149-ba8c-5b9e62d7e6ff',
    jobTitle: 'Desarrollador Frontend Senior',
    company: 'TechCorp',
    status: 'in_progress',
    appliedAt: '2025-01-01T00:00:00Z',
    lastUpdated: '2025-01-10T00:00:00Z',
    stages: [
      {
        id: '1',
        name: 'Aplicación Enviada',
        status: 'completed',
        completedAt: '2025-01-01T00:00:00Z',
      },
      {
        id: '2',
        name: 'Revisión de CV',
        status: 'in_progress',
        completedAt: null,
      },
    ],
    notes: 'Candidato prometedor con experiencia en React',
  },
];

export const mockBadges: Badge[] = [
  {
    id: '1',
    name: 'Early Bird',
    description: 'Aplicaste en las primeras 24 horas',
    icon: 'sunrise',
    earnedAt: '2025-01-01T00:00:00Z',
    rarity: 'common',
  },
  {
    id: '2',
    name: 'Perfect Profile',
    description: 'Alcanzaste 100% de completitud de perfil',
    icon: 'star',
    earnedAt: '2025-01-05T00:00:00Z',
    rarity: 'epic',
  },
];