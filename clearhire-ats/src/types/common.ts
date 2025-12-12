// Common Types

export enum ErrorType {
  VALIDATION = 'validation',
  NETWORK = 'network',
  AUTH = 'auth',
  NOT_FOUND = 'not_found',
  SERVER = 'server',
  PERMISSION = 'permission'
}

export interface AppError {
  type: ErrorType;
  message: string;
  details?: string;
  field?: string;
  code?: string;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface ExportData {
  profile: any;
  applications: {
    active: any[];
    approved: any[];
    rejected: any[];
  };
  generatedAt: Date;
}
