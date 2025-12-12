import React from 'react';
import { Loader2 } from 'lucide-react';
import { usePullToRefresh } from '../../../hooks/usePullToRefresh';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({ onRefresh, children }) => {
  const { isPulling, isRefreshing, pullDistance } = usePullToRefresh({ onRefresh });

  const getRefreshText = () => {
    if (isRefreshing) return 'Actualizando...';
    if (pullDistance > 80) return 'Suelta para actualizar';
    if (isPulling) return 'Desliza para actualizar';
    return '';
  };

  return (
    <div className="relative">
      {/* Pull to Refresh Indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center transition-all duration-200 overflow-hidden"
        style={{
          height: isPulling || isRefreshing ? `${Math.min(pullDistance, 80)}px` : '0px',
          opacity: isPulling || isRefreshing ? 1 : 0,
        }}
      >
        <div className="flex items-center gap-2 text-blue-600">
          {isRefreshing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <div
              className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full transition-transform"
              style={{
                transform: `rotate(${pullDistance * 3}deg)`,
              }}
            />
          )}
          <span className="text-sm font-medium">{getRefreshText()}</span>
        </div>
      </div>

      {/* Content */}
      <div
        className="transition-transform duration-200"
        style={{
          transform: isPulling || isRefreshing ? `translateY(${Math.min(pullDistance, 80)}px)` : 'translateY(0)',
        }}
      >
        {children}
      </div>
    </div>
  );
};
