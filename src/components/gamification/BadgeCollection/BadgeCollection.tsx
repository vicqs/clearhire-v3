import React, { useState } from 'react';
import { Award, Sunrise, Star } from 'lucide-react';
import type { Badge } from '../../../types/profile';
import Card from '../../core/Card';

export interface BadgeCollectionProps {
  badges: Badge[];
  className?: string;
}

const BadgeCollection: React.FC<BadgeCollectionProps> = ({ badges, className = '' }) => {
  const [hoveredBadge, setHoveredBadge] = useState<string | null>(null);

  const getIcon = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      sunrise: <Sunrise className="w-8 h-8" />,
      award: <Award className="w-8 h-8" />,
      star: <Star className="w-8 h-8" />,
    };
    return icons[iconName] || <Award className="w-8 h-8" />;
  };

  const getRarityColor = (rarity: Badge['rarity']) => {
    const colors = {
      common: 'from-slate-400 to-slate-500',
      rare: 'from-primary-400 to-primary-600',
      epic: 'from-gold-400 to-gold-600',
    };
    return colors[rarity];
  };

  return (
    <Card variant="glass" className={className}>
      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-4">Insignias Ganadas</h3>
        
        {badges.length === 0 ? (
          <div className="text-center py-8">
            <Award className="w-16 h-16 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600">Aún no has ganado insignias</p>
            <p className="text-sm text-slate-500 mt-1">Completa acciones para desbloquearlas</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className="relative"
                onMouseEnter={() => setHoveredBadge(badge.id)}
                onMouseLeave={() => setHoveredBadge(null)}
              >
                <div
                  className={`
                    p-4 rounded-xl bg-gradient-to-br ${getRarityColor(badge.rarity)}
                    text-white flex flex-col items-center justify-center
                    transform transition-all duration-300 hover:scale-105 hover:shadow-xl
                    cursor-pointer
                  `}
                >
                  {getIcon(badge.icon)}
                  <p className="text-sm font-bold mt-2 text-center">{badge.name}</p>
                </div>

                {/* Tooltip */}
                {hoveredBadge === badge.id && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-10">
                    <div className="bg-slate-900 text-white text-xs rounded-lg p-3 shadow-xl max-w-xs">
                      <p className="font-semibold mb-1">{badge.name}</p>
                      <p className="text-slate-300 mb-2">{badge.description}</p>
                      <p className="text-slate-400 text-xs">
                        Ganada: {new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' }).format(badge.earnedAt)}
                      </p>
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-slate-900" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default BadgeCollection;
