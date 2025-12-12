import React from 'react';
import { AlertCircle } from 'lucide-react';

export interface RejectionReasonProps {
  category: string;
  className?: string;
}

const RejectionReason: React.FC<RejectionReasonProps> = ({ category, className = '' }) => {
  return (
    <div className={`p-4 bg-danger-50 border border-danger-200 rounded-xl ${className}`}>
      <div className="flex items-start gap-3">
        <AlertCircle className="w-6 h-6 text-danger-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-danger-900 mb-1">Categoría del Rechazo</p>
          <p className="text-lg font-bold text-danger-700">{category}</p>
        </div>
      </div>
    </div>
  );
};

export default RejectionReason;
