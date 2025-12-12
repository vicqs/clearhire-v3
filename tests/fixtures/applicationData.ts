import type { Application } from '../../src/types/application'

export const mockApplication: Application = {
  id: 'app-1',
  candidateId: 'candidate-1',
  jobId: 'job-1',
  company: 'Tech Startup',
  position: 'Frontend Developer',
  availablePositions: 1,
  status: 'active',
  appliedDate: new Date('2024-01-15'),
  lastUpdate: new Date('2024-01-15'),
  interviewConfirmed: false,
  currentStageId: 'stage-1',
  stages: [{
    id: 'stage-1',
    name: 'Initial Review',
    order: 1,
    status: 'pending',
    estimatedDays: 3,
    startDate: new Date('2024-01-15')
  }]
}

export const mockApplicationInProgress: Application = {
  ...mockApplication,
  id: 'app-2',
  status: 'screening',
  currentStageId: 'stage-2',
  stages: [{
    id: 'stage-1',
    name: 'Initial Review',
    order: 1,
    status: 'completed',
    estimatedDays: 3,
    actualDays: 2,
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-01-17')
  }, {
    id: 'stage-2',
    name: 'Technical Interview',
    order: 2,
    status: 'in_progress',
    estimatedDays: 5,
    startDate: new Date('2024-01-17')
  }]
}

export const mockApplicationRejected: Application = {
  ...mockApplication,
  id: 'app-3',
  status: 'rejected',
  finalScore: 65,
  currentStageId: 'stage-final',
  stages: [{
    id: 'stage-1',
    name: 'Initial Review',
    order: 1,
    status: 'completed',
    estimatedDays: 3,
    actualDays: 2,
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-01-17')
  }, {
    id: 'stage-final',
    name: 'Final Decision',
    order: 5,
    status: 'rejected',
    estimatedDays: 1,
    actualDays: 1,
    startDate: new Date('2024-01-20'),
    endDate: new Date('2024-01-21')
  }]
}

export const mockApplications: Application[] = [
  mockApplication,
  mockApplicationInProgress,
  mockApplicationRejected
]