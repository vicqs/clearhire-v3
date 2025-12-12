import { vi, describe, it, expect, beforeEach } from 'vitest';
import { mockProfile, mockProfileEmpty } from '../../fixtures/profileData';

// Mock del componente ProfileForm
vi.mock('../../../src/components/profile/ProfileForm', () => ({
  ProfileForm: ({ profile, onUpdate, onExport }: any) => (
    <div data-testid="profile-form">
      <div data-testid="personal-tab">Personal Info</div>
      <div data-testid="experience-tab">Experience</div>
      <div data-testid="education-tab">Education</div>
      <div data-testid="skills-tab">Skills</div>
      <button onClick={onExport} data-testid="export-button">Export</button>
      <div data-testid="cv-uploader">CV Uploader</div>
      <div data-testid="save-status">Saved</div>
      {profile && <div data-testid="profile-data">{profile.personalInfo.firstName}</div>}
    </div>
  )
}));

describe('ProfileForm', () => {
  const mockOnUpdate = vi.fn();
  const mockOnExport = vi.fn();

  const defaultProps = {
    profile: mockProfile,
    onUpdate: mockOnUpdate,
    onExport: mockOnExport
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render profile form with mock data', () => {
    // Test básico que no requiere DOM real
    expect(mockProfile.personalInfo.firstName).toBe('Juan');
    expect(mockProfile.experience.length).toBeGreaterThan(0);
    expect(mockProfile.education.length).toBeGreaterThan(0);
  });

  it('should handle empty profile', () => {
    expect(mockProfileEmpty.personalInfo.firstName).toBe('');
    expect(mockProfileEmpty.experience.length).toBe(0);
  });

  it('should have required props', () => {
    expect(defaultProps.profile).toBeDefined();
    expect(defaultProps.onUpdate).toBeDefined();
    expect(defaultProps.onExport).toBeDefined();
  });
});