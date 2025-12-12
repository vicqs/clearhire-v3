// Profile & Candidate Types

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  country: string;
  phone: string;
  email: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  graduationYear: string;
}

export interface Language {
  language: string;
  proficiency: 'Básico' | 'Intermedio' | 'Avanzado' | 'Nativo';
}

export type SoftSkill = string;

export interface FileAttachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: Date;
}

export interface Reference {
  id: string;
  name: string;
  country?: string;
  email: string;
  phone: string;
  attachmentUrl?: string;
}

export interface Profile {
  personalInfo: PersonalInfo;
  experience: WorkExperience[];
  education: Education[];
  languages: Language[];
  softSkills: string[];
  trade: string;
  references: Reference[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
  rarity: 'common' | 'rare' | 'epic';
}

export interface GamificationData {
  profileCompletion: number;
  badges: Badge[];
  hasFastPass: boolean;
  ranking?: number;
  totalApplications: number;
  successRate: number;
}

export interface UserPreferences {
  whatsappNotifications: boolean;
  emailNotifications: boolean;
  language: 'es' | 'pt' | 'en';
  timezone: string;
}

export interface Candidate {
  id: string;
  profile: Profile;
  gamification: GamificationData;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeSlot {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  available: boolean;
  recruiterName: string;
  location?: string;
  type: 'presencial' | 'virtual';
}

export interface InterviewSchedule {
  applicationId: string;
  availableSlots: TimeSlot[];
  selectedSlot?: TimeSlot;
  confirmedAt?: Date;
  deadline: Date;
}
