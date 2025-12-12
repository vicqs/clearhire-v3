import React from 'react';
import type { Profile, Badge } from '../../../types/profile';
import BadgeCollection from '../BadgeCollection';
import FastPassWidget from '../FastPassWidget';

export interface GamificationPanelProps {
  profile: Profile;
  badges: Badge[];
  hasFastPass: boolean;
  ranking?: number;
  onSubscribe?: () => void;
  className?: string;
}

const GamificationPanel: React.FC<GamificationPanelProps> = ({
  badges,
  hasFastPass,
  ranking,
  onSubscribe,
  className = '',
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Fast Pass Widget */}
      <FastPassWidget
        hasFastPass={hasFastPass}
        ranking={ranking}
        onSubscribe={onSubscribe}
      />

      {/* Badge Collection */}
      <BadgeCollection badges={badges} />
    </div>
  );
};

export default GamificationPanel;
