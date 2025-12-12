export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Valida formato de email
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim() === '') {
    return {
      isValid: false,
      error: 'El correo electrónico es obligatorio',
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: 'El correo electrónico no es válido',
    };
  }

  return { isValid: true };
}

/**
 * Valida formato de teléfono internacional
 * Acepta formatos: +52 1234567890, +1 234 567 8900, etc.
 */
export function validatePhone(phone: string): ValidationResult {
  if (!phone || phone.trim() === '') {
    return {
      isValid: false,
      error: 'El número de teléfono es obligatorio',
    };
  }

  // Regex para formato internacional: +código país seguido de dígitos
  const phoneRegex = /^\+\d{1,3}\s?\d{6,14}$/;
  
  if (!phoneRegex.test(phone.replace(/\s/g, ' '))) {
    return {
      isValid: false,
      error: 'El número de teléfono debe incluir código de país (ej: +52 1234567890)',
    };
  }

  return { isValid: true };
}

/**
 * Valida archivo PDF
 */
export function validateFile(file: File | null): ValidationResult {
  if (!file) {
    return {
      isValid: false,
      error: 'Debe seleccionar un archivo',
    };
  }

  // Validar tipo de archivo
  if (file.type !== 'application/pdf') {
    return {
      isValid: false,
      error: 'Solo se permiten archivos PDF',
    };
  }

  // Validar tamaño (máximo 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB en bytes
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'El archivo no debe superar los 5MB',
    };
  }

  return { isValid: true };
}

/**
 * Valida que la fecha de fin sea posterior a la fecha de inicio
 */
export function validateDateRange(
  startDate: string | Date,
  endDate: string | Date
): ValidationResult {
  if (!startDate || !endDate) {
    return {
      isValid: false,
      error: 'Ambas fechas son obligatorias',
    };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return {
      isValid: false,
      error: 'Las fechas no son válidas',
    };
  }

  if (end <= start) {
    return {
      isValid: false,
      error: 'La fecha de fin debe ser posterior a la fecha de inicio',
    };
  }

  return { isValid: true };
}

/**
 * Valida que un campo requerido no esté vacío
 */
export function validateRequired(value: string | null | undefined, fieldName: string): ValidationResult {
  if (!value || value.trim() === '') {
    return {
      isValid: false,
      error: `${fieldName} es obligatorio`,
    };
  }

  return { isValid: true };
}

/**
 * Valida longitud máxima de un campo de texto
 */
export function validateMaxLength(
  value: string,
  maxLength: number,
  fieldName: string
): ValidationResult {
  if (!value) {
    return { isValid: true };
  }

  if (value.length > maxLength) {
    return {
      isValid: false,
      error: `${fieldName} no debe superar los ${maxLength} caracteres (actual: ${value.length})`,
    };
  }

  return { isValid: true };
}

/**
 * Valida múltiples campos y retorna todos los errores
 */
export function validateMultiple(
  validations: ValidationResult[]
): { isValid: boolean; errors: string[] } {
  const errors = validations
    .filter(v => !v.isValid)
    .map(v => v.error!)
    .filter(Boolean);

  return {
    isValid: errors.length === 0,
    errors,
  };
}
