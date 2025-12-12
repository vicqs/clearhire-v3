import React from 'react';
import type { StageFeedback } from '../../../types/application';
import RejectionReason from '../RejectionReason';
import AIExplanation from '../AIExplanation';
import ActionableGrowth from '../ActionableGrowth';
import Card from '../../core/Card';

export interface FeedbackCardProps {
  feedback: StageFeedback;
  score?: number;
  className?: string;
}

const FeedbackCard: React.FC<FeedbackCardProps> = ({ feedback, score, className = '' }) => {
  return (
    <Card variant="glass" className={className}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Retroalimentación Constructiva</h2>
          <p className="text-slate-600">
            Hemos preparado información detallada para ayudarte a mejorar y tener éxito en futuras oportunidades.
          </p>
        </div>

        {/* Score */}
        {score !== undefined && (
          <div className="p-4 bg-slate-100 rounded-xl">
            <p className="text-sm text-slate-600 mb-1">Calificación Final</p>
            <p className="text-3xl font-bold text-slate-900">{score}%</p>
          </div>
        )}

        {/* Rejection Reason */}
        <RejectionReason category={feedback.category} />

        {/* AI Explanation */}
        <AIExplanation explanation={feedback.aiExplanation} />

        {/* Actionable Growth */}
        <ActionableGrowth recommendations={feedback.recommendations} />
      </div>
    </Card>
  );
};

export default FeedbackCard;
