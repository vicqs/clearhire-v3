/**
 * Servicio de Transacciones con Rollback
 * Maneja operaciones atómicas con capacidad de rollback automático
 */

import { auditService } from './auditService';
import type { TransactionStep, TransactionContext } from '../types/tracking';

export interface TransactionConfig {
  maxRetries: number;
  retryDelayMs: number;
  timeoutMs: number;
  enableLogging: boolean;
}

export interface TransactionResult<T = any> {
  success: boolean;
  result?: T;
  error?: string;
  executedSteps: number;
  rollbackExecuted: boolean;
  duration: number;
}

class TransactionService {
  private config: TransactionConfig = {
    maxRetries: 3,
    retryDelayMs: 1000,
    timeoutMs: 30000,
    enableLogging: true
  };

  /**
   * Ejecuta una transacción con rollback automático
   */
  async executeTransaction<T>(
    transactionId: string,
    steps: TransactionStep[],
    context?: Record<string, any>
  ): Promise<TransactionResult<T>> {
    const startTime = Date.now();
    
    if (this.config.enableLogging) {
      console.log(`🔄 Iniciando transacción: ${transactionId} (${steps.length} pasos)`);
    }

    const transactionContext: TransactionContext = {
      steps,
      currentStep: 0,
      rollbackExecuted: false
    };

    try {
      // Ejecutar pasos secuencialmente
      for (let i = 0; i < steps.length; i++) {
        transactionContext.currentStep = i;
        
        if (this.config.enableLogging) {
          console.log(`📝 Ejecutando paso ${i + 1}/${steps.length}: ${steps[i].name}`);
        }

        await this.executeStepWithTimeout(steps[i], transactionId);
      }

      const duration = Date.now() - startTime;
      
      if (this.config.enableLogging) {
        console.log(`✅ Transacción completada: ${transactionId} (${duration}ms)`);
      }

      // Registrar éxito en auditoría
      await this.logTransactionResult(transactionId, 'completed', steps.length, context);

      return {
        success: true,
        executedSteps: steps.length,
        rollbackExecuted: false,
        duration
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      console.error(`❌ Error en transacción ${transactionId}:`, errorMessage);

      // Ejecutar rollback
      const rollbackSuccess = await this.executeRollback(transactionContext, transactionId);
      
      // Registrar fallo en auditoría
      await this.logTransactionResult(transactionId, 'failed', transactionContext.currentStep + 1, context, errorMessage);

      return {
        success: false,
        error: errorMessage,
        executedSteps: transactionContext.currentStep + 1,
        rollbackExecuted: rollbackSuccess,
        duration
      };
    }
  }

  /**
   * Ejecuta rollback de una transacción
   */
  private async executeRollback(
    context: TransactionContext,
    transactionId: string
  ): Promise<boolean> {
    if (context.rollbackExecuted) {
      console.log(`⏭️ Rollback ya ejecutado para transacción: ${transactionId}`);
      return true;
    }

    console.log(`🔄 Ejecutando rollback para transacción: ${transactionId}`);
    
    try {
      // Ejecutar rollback en orden inverso
      for (let i = context.currentStep; i >= 0; i--) {
        const step = context.steps[i];
        
        if (this.config.enableLogging) {
          console.log(`🔙 Rollback paso ${i + 1}: ${step.name}`);
        }

        try {
          await step.rollback();
        } catch (rollbackError) {
          console.error(`❌ Error en rollback del paso ${step.name}:`, rollbackError);
          // Continuar con otros rollbacks aunque uno falle
        }
      }

      context.rollbackExecuted = true;
      
      if (this.config.enableLogging) {
        console.log(`✅ Rollback completado para transacción: ${transactionId}`);
      }

      return true;

    } catch (error) {
      console.error(`❌ Error crítico durante rollback de ${transactionId}:`, error);
      return false;
    }
  }

  /**
   * Ejecuta un paso con timeout
   */
  private async executeStepWithTimeout(
    step: TransactionStep,
    transactionId: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Timeout ejecutando paso ${step.name} en transacción ${transactionId}`));
      }, this.config.timeoutMs);

      step.execute()
        .then(() => {
          clearTimeout(timeout);
          resolve();
        })
        .catch((error) => {
          clearTimeout(timeout);
          reject(error);
        });
    });
  }

  /**
   * Registra resultado de transacción en auditoría
   */
  private async logTransactionResult(
    transactionId: string,
    status: 'completed' | 'failed',
    executedSteps: number,
    context?: Record<string, any>,
    error?: string
  ): Promise<void> {
    try {
      // En implementación real, esto iría a una tabla específica de transacciones
      console.log('📋 Registrando resultado de transacción en auditoría', {
        transactionId,
        status,
        executedSteps,
        context,
        error
      });

    } catch (auditError) {
      console.error('❌ Error registrando transacción en auditoría:', auditError);
      // No fallar la transacción por errores de auditoría
    }
  }

  /**
   * Crea una transacción con reintentos automáticos
   */
  async executeWithRetry<T>(
    transactionId: string,
    steps: TransactionStep[],
    context?: Record<string, any>
  ): Promise<TransactionResult<T>> {
    let lastResult: TransactionResult<T> | null = null;
    
    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      if (this.config.enableLogging && attempt > 1) {
        console.log(`🔄 Intento ${attempt}/${this.config.maxRetries} para transacción: ${transactionId}`);
      }

      lastResult = await this.executeTransaction<T>(transactionId, steps, context);
      
      if (lastResult.success) {
        return lastResult;
      }

      // Si no es el último intento, esperar antes del siguiente
      if (attempt < this.config.maxRetries) {
        const delay = this.config.retryDelayMs * Math.pow(2, attempt - 1); // Backoff exponencial
        
        if (this.config.enableLogging) {
          console.log(`⏳ Esperando ${delay}ms antes del siguiente intento...`);
        }
        
        await this.delay(delay);
      }
    }

    // Todos los intentos fallaron
    if (this.config.enableLogging) {
      console.error(`❌ Transacción ${transactionId} falló después de ${this.config.maxRetries} intentos`);
    }

    return lastResult!;
  }

  /**
   * Crea pasos de transacción con validaciones
   */
  createTransactionStep(
    name: string,
    executeFunction: () => Promise<void>,
    rollbackFunction: () => Promise<void>,
    validation?: () => Promise<boolean>
  ): TransactionStep {
    return {
      name,
      execute: async () => {
        // Ejecutar validación si se proporciona
        if (validation) {
          const isValid = await validation();
          if (!isValid) {
            throw new Error(`Validación falló para paso: ${name}`);
          }
        }

        await executeFunction();
      },
      rollback: rollbackFunction
    };
  }

  /**
   * Agrupa múltiples operaciones en una transacción
   */
  async batch<T>(
    operations: Array<{
      name: string;
      execute: () => Promise<T>;
      rollback: () => Promise<void>;
    }>,
    transactionId?: string
  ): Promise<TransactionResult<T[]>> {
    const id = transactionId || `batch-${Date.now()}`;
    const results: T[] = [];
    
    const steps: TransactionStep[] = operations.map((op, index) => ({
      name: op.name,
      execute: async () => {
        const result = await op.execute();
        results[index] = result;
      },
      rollback: op.rollback
    }));

    const transactionResult = await this.executeTransaction<T[]>(id, steps);
    
    if (transactionResult.success) {
      transactionResult.result = results;
    }

    return transactionResult;
  }

  /**
   * Utilidad para delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Actualiza configuración del servicio
   */
  updateConfig(newConfig: Partial<TransactionConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (this.config.enableLogging) {
      console.log('⚙️ Configuración de transacciones actualizada:', this.config);
    }
  }

  /**
   * Obtiene configuración actual
   */
  getConfig(): TransactionConfig {
    return { ...this.config };
  }
}

// Exportar instancia singleton
export const transactionService = new TransactionService();