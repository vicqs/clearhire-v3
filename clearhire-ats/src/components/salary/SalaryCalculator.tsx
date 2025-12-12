import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  DollarSign, 
  Gift, 
  Info, 
  ChevronDown, 
  ChevronUp,
  Receipt,
  Wallet,
  Target
} from 'lucide-react';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';
import { salaryCalculatorService } from '../../services/salaryCalculatorService';
import type { SalaryBreakdown, Benefit, JobOffer } from '../../types/salary';

interface SalaryCalculatorProps {
  offer: JobOffer;
  className?: string;
}

const SalaryCalculator: React.FC<SalaryCalculatorProps> = ({
  offer,
  className = ''
}) => {
  const { triggerHaptic } = useHapticFeedback();
  const [selectedSalary, setSelectedSalary] = useState<number>(0);
  const [breakdown, setBreakdown] = useState<SalaryBreakdown | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showBenefitsDetail, setShowBenefitsDetail] = useState(false);

  // Inicializar con el salario medio del rango o salario fijo
  useEffect(() => {
    let initialSalary = 0;
    
    if (offer.fixedSalary) {
      initialSalary = offer.fixedSalary;
    } else if (offer.salaryRange) {
      initialSalary = (offer.salaryRange.min + offer.salaryRange.max) / 2;
    }
    
    setSelectedSalary(initialSalary);
  }, [offer]);

  // Calcular breakdown cuando cambia el salario
  useEffect(() => {
    if (selectedSalary > 0) {
      const calculatedBreakdown = salaryCalculatorService.calculateSalaryBreakdown(
        selectedSalary,
        offer.benefits,
        offer.country
      );
      setBreakdown(calculatedBreakdown);
    }
  }, [selectedSalary, offer.benefits, offer.country]);

  const handleSalaryChange = (value: number) => {
    triggerHaptic('light');
    setSelectedSalary(value);
  };

  const toggleDetails = () => {
    triggerHaptic('light');
    setShowDetails(!showDetails);
  };

  const toggleBenefitsDetail = () => {
    triggerHaptic('light');
    setShowBenefitsDetail(!showBenefitsDetail);
  };

  const formatCurrency = (amount: number) => {
    return salaryCalculatorService.formatCurrency(amount, offer.currency, offer.country);
  };



  const getBenefitIcon = (category: Benefit['category']) => {
    const icons = {
      health: '🏥',
      wellness: '💪',
      transport: '🚗',
      food: '🍽️',
      education: '📚',
      time_off: '🏖️',
      financial: '💰',
      other: '🎁'
    };
    return icons[category] || '🎁';
  };

  if (!breakdown) {
    return (
      <div className={`bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <Calculator className="w-6 h-6 text-primary-600" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Calculadora de Salario
          </h3>
        </div>
        <p className="text-slate-600 dark:text-slate-400">
          Cargando información salarial...
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-900/30 dark:to-emerald-800/30 rounded-xl flex items-center justify-center">
          <Calculator className="w-5 h-5 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Tu Compensación Total
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Salario neto + beneficios valorados
          </p>
        </div>
      </div>

      {/* Salary Range Selector (si hay rango) */}
      {offer.salaryRange && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Ajusta el salario dentro del rango ofrecido:
          </label>
          <div className="space-y-3">
            <input
              type="range"
              min={offer.salaryRange.min}
              max={offer.salaryRange.max}
              value={selectedSalary}
              onChange={(e) => handleSalaryChange(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
              <span>{formatCurrency(offer.salaryRange.min)}</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {formatCurrency(selectedSalary)}
              </span>
              <span>{formatCurrency(offer.salaryRange.max)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Results */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Salario Neto */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">Neto Mensual</span>
          </div>
          <p className="text-2xl font-bold text-green-800 dark:text-green-200">
            {formatCurrency(breakdown.netSalary)}
          </p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
            En tu cuenta bancaria
          </p>
        </div>

        {/* Beneficios */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Beneficios</span>
          </div>
          <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
            {formatCurrency(breakdown.totalBenefitsValue)}
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            Valor estimado mensual
          </p>
        </div>

        {/* Total */}
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Paquete Total</span>
          </div>
          <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">
            {formatCurrency(breakdown.totalCompensation)}
          </p>
          <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
            Salario + beneficios
          </p>
        </div>
      </div>

      {/* Summary Message */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/10 dark:to-blue-900/10 rounded-xl p-4 mb-6 border border-green-200 dark:border-green-800">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
            <DollarSign className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
              💰 Con este salario recibirías:
            </h4>
            <p className="text-green-800 dark:text-green-200 text-sm leading-relaxed">
              <strong>{formatCurrency(breakdown.netSalary)}</strong> netos al mes en tu cuenta, 
              más <strong>{formatCurrency(breakdown.totalBenefitsValue)}</strong> en beneficios valorados. 
              Tu paquete total vale <strong>{formatCurrency(breakdown.totalCompensation)}</strong> mensuales.
            </p>
          </div>
        </div>
      </div>

      {/* Benefits Detail */}
      {breakdown.benefits.length > 0 && (
        <div className="mb-6">
          <button
            onClick={toggleBenefitsDetail}
            className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span className="font-medium text-slate-900 dark:text-slate-100">
                Desglose de Beneficios ({breakdown.benefits.length})
              </span>
            </div>
            {showBenefitsDetail ? (
              <ChevronUp className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            )}
          </button>

          {showBenefitsDetail && (
            <div className="mt-3 space-y-2">
              {breakdown.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{getBenefitIcon(benefit.category)}</span>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {benefit.name}
                      </p>
                      {benefit.description && (
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          {benefit.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      {benefit.isPercentage 
                        ? `${benefit.percentageValue}%`
                        : formatCurrency(benefit.estimatedValue)
                      }
                    </p>
                    {benefit.isPercentage && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {formatCurrency(selectedSalary * (benefit.percentageValue! / 100))}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tax Breakdown */}
      <div>
        <button
          onClick={toggleDetails}
          className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span className="font-medium text-slate-900 dark:text-slate-100">
              Desglose de Impuestos y Descuentos
            </span>
          </div>
          {showDetails ? (
            <ChevronUp className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          )}
        </button>

        {showDetails && (
          <div className="mt-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Salario Bruto</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {formatCurrency(breakdown.taxCalculation.grossSalary)}
                </span>
              </div>
              
              <div className="border-t border-slate-200 dark:border-slate-700 pt-3 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-red-600 dark:text-red-400">- Impuesto sobre la Renta</span>
                  <span className="text-red-600 dark:text-red-400">
                    -{formatCurrency(breakdown.taxCalculation.incomeTax)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-red-600 dark:text-red-400">- Seguridad Social</span>
                  <span className="text-red-600 dark:text-red-400">
                    -{formatCurrency(breakdown.taxCalculation.socialSecurity)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-red-600 dark:text-red-400">- Otros Descuentos</span>
                  <span className="text-red-600 dark:text-red-400">
                    -{formatCurrency(breakdown.taxCalculation.otherDeductions)}
                  </span>
                </div>
              </div>
              
              <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-green-700 dark:text-green-300">Salario Neto</span>
                  <span className="font-bold text-green-700 dark:text-green-300">
                    {formatCurrency(breakdown.taxCalculation.netSalary)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info Footer */}
      <div className="mt-6 flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-blue-700 dark:text-blue-300">
          <p className="font-medium mb-1">Información importante:</p>
          <p>
            Los cálculos son estimaciones basadas en las regulaciones fiscales actuales de {offer.country === 'CR' ? 'Costa Rica' : offer.country === 'MX' ? 'México' : offer.country === 'CO' ? 'Colombia' : offer.country === 'BR' ? 'Brasil' : 'Estados Unidos'}. 
            Los valores de beneficios son aproximaciones del mercado. Consulta con la empresa para detalles específicos.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SalaryCalculator;