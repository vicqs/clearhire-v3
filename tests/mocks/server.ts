import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Configurar servidor MSW para pruebas
export const server = setupServer(...handlers);