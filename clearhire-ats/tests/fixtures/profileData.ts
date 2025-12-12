import type { Profile, WorkExperience, Education, Language, Reference } from '../../src/types/profile'

export const mockWorkExperience: WorkExperience = {
  id: 'exp-1',
  company: 'Tech Corp',
  position: 'Senior Developer',
  startDate: '2022-01-01',
  endDate: '2024-12-01',
  description: 'Developed web applications using React and Node.js'
}

export const mockEducation: Education = {
  id: 'edu-1',
  institution: 'Universidad de Costa Rica',
  degree: 'Ingeniería en Computación',
  fieldOfStudy: 'Computer Science',
  graduationYear: '2021'
}

export const mockLanguage: Language = {
  language: 'English',
  proficiency: 'Avanzado'
}

export const mockReference: Reference = {
  id: 'ref-1',
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+1234567890',
  country: 'Costa Rica'
}

export const mockProfile: Profile = {
  personalInfo: {
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan@example.com',
    phone: '+50612345678',
    country: 'Costa Rica'
  },
  experience: [mockWorkExperience],
  education: [mockEducation],
  languages: [mockLanguage],
  softSkills: ['Teamwork', 'Leadership', 'Communication'],
  trade: 'Software Development',
  references: [mockReference]
}

export const mockProfileEmpty: Profile = {
  personalInfo: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: ''
  },
  experience: [],
  education: [],
  languages: [],
  softSkills: [],
  trade: '',
  references: []
}

export const mockProfileIncomplete: Profile = {
  personalInfo: {
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane@example.com',
    phone: '',
    country: ''
  },
  experience: [],
  education: [],
  languages: [],
  softSkills: [],
  trade: '',
  references: []
}