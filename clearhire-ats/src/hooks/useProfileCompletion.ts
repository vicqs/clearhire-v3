import { useMemo } from 'react';
import type { Profile } from '../types/profile';

export const useProfileCompletion = (profile: Profile): number => {
  return useMemo(() => {
    const weights = {
      personalInfo: 20,
      experience: 25,
      education: 20,
      skills: 15,
      languages: 10,
      references: 10,
    };

    let score = 0;

    // Personal Info (20%)
    const { personalInfo } = profile;
    if (
      personalInfo.firstName &&
      personalInfo.lastName &&
      personalInfo.country &&
      personalInfo.phone &&
      personalInfo.email
    ) {
      score += weights.personalInfo;
    }

    // Experience (25%)
    if (profile.experience.length > 0) {
      score += weights.experience;
    }

    // Education (20%)
    if (profile.education.length > 0) {
      score += weights.education;
    }

    // Skills (15%)
    if (profile.softSkills.length > 0) {
      score += weights.skills;
    }

    // Languages (10%)
    if (profile.languages.length > 0) {
      score += weights.languages;
    }

    // References (10%)
    if (profile.references.length > 0) {
      score += weights.references;
    }

    return score;
  }, [profile]);
};

export default useProfileCompletion;
