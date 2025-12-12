import React from 'react';

export type CardVariant = 'glass' | 'solid' | 'elevated';

export interface CardProps {
  variant?: CardVariant;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ 
  variant = 'glass', 
  children, 
  className = '',
  onClick 
}) => {
  const variantClasses: Record<CardVariant, string> = {
    glass: 'backdrop-blur-md bg-white/80 border border-white/20 shadow-xl shadow-slate-200/50',
    solid: 'bg-white border border-slate-200 shadow-lg',
    elevated: 'bg-white shadow-2xl shadow-slate-200/50',
  };

  const baseClasses = 'rounded-2xl p-6';
  const interactiveClasses = onClick ? 'cursor-pointer hover:shadow-2xl transition-shadow duration-300' : '';

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${interactiveClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;
