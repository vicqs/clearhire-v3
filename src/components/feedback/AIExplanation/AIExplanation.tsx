import React from 'react';
import { MessageCircle } from 'lucide-react';
import Card from '../../core/Card';

export interface AIExplanationProps {
  explanation: string;
  className?: string;
}

const AIExplanation: React.FC<AIExplanationProps> = ({ explanation, className = '' }) => {
  return (
    <Card variant="solid" className={`bg-slate-50 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="p-2 bg-primary-100 rounded-lg flex-shrink-0">
          <MessageCircle className="w-6 h-6 text-primary-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-slate-900 mb-2">Explicación Detallada</h3>
          <p className="text-slate-700 leading-relaxed">{explanation}</p>
        </div>
      </div>
    </Card>
  );
};

export default AIExplanation;
