import React from 'react';

export type ButtonVariant = 'primary' | 'success' | 'danger' | 'ghost' | 'premium';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  children, 
  className = '',
  disabled,
  ...props 
}) => {
  const baseClasses = 'px-6 py-3 rounded-lg font-semibold touch-target transition-all duration-200';
  
  const variantClasses: Record<ButtonVariant, string> = {
    primary: 'bg-primary-500 hover:bg-primary-600 text-white disabled:bg-primary-300',
    success: 'bg-success-500 hover:bg-success-600 text-white disabled:bg-success-300',
    danger: 'bg-danger-500 hover:bg-danger-600 text-white disabled:bg-danger-300',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-700 disabled:text-slate-400',
    premium: 'bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-500 hover:to-gold-600 text-white disabled:opacity-50',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
