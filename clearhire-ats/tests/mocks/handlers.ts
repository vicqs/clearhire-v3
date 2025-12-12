import { http, HttpResponse } from 'msw';
import { mockProfile, mockApplications, mockBadges } from './data';

export const handlers = [
  // Supabase Auth endpoints
  http.post('https://test.supabase.co/auth/v1/token', () => {
    return HttpResponse.json({
      access_token: 'mock-access-token',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'mock-refresh-token',
      user: {
        id: '9a0ee8bb-7651-4149-ba8c-5b9e62d7e6ff',
        email: 'test@clearhire.com',
      },
    });
  }),

  http.get('https://test.supabase.co/auth/v1/user', () => {
    return HttpResponse.json({
      id: '9a0ee8bb-7651-4149-ba8c-5b9e62d7e6ff',
      email: 'test@clearhire.com',
    });
  }),

  // Supabase REST API endpoints
  http.get('https://test.supabase.co/rest/v1/profiles', () => {
    return HttpResponse.json([mockProfile]);
  }),

  http.post('https://test.supabase.co/rest/v1/profiles', () => {
    return HttpResponse.json(mockProfile, { status: 201 });
  }),

  http.patch('https://test.supabase.co/rest/v1/profiles', () => {
    return HttpResponse.json(mockProfile);
  }),

  http.get('https://test.supabase.co/rest/v1/applications', () => {
    return HttpResponse.json(mockApplications);
  }),

  http.post('https://test.supabase.co/rest/v1/applications', () => {
    return HttpResponse.json(mockApplications[0], { status: 201 });
  }),

  http.get('https://test.supabase.co/rest/v1/badges', () => {
    return HttpResponse.json(mockBadges);
  }),

  // Error scenarios
  http.get('https://test.supabase.co/rest/v1/profiles-error', () => {
    return HttpResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }),
];