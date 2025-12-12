import React from 'react';

export type SkeletonVariant = 'text' | 'card' | 'avatar' | 'button';

export interface SkeletonLoaderProps {
  variant?: SkeletonVariant;
  width?: string;
  height?: string;
  className?: string;
  count?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'text',
  width,
  height,
  className = '',
  count = 1,
}) => {
  const variantClasses: Record<SkeletonVariant, string> = {
    text: 'h-4 rounded',
    card: 'h-48 rounded-2xl',
    avatar: 'w-12 h-12 rounded-full',
    button: 'h-12 rounded-lg',
  };

  const baseClasses = 'skeleton';
  const widthClass = width ? `w-[${width}]` : 'w-full';
  const heightClass = height ? `h-[${height}]` : '';

  const skeletonElement = (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${widthClass} ${heightClass} ${className}`}
      style={{ width, height }}
    />
  );

  if (count === 1) {
    return skeletonElement;
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>{skeletonElement}</div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
