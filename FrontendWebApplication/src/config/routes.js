export const ROUTES = {
  ROOT: '/',
  HOME: '/',
  LESSONS: '/lessons',
  QUIZZES: '/quizzes',
  PRACTICE: '/practice',
  PRACTICE_AI: '/practice/ai',
  PRACTICE_REALTIME: '/practice/realtime',
  HISTORY: '/history',
  PROFILE: '/profile',
  ADMIN: '/admin',

  // Gamification
  CHALLENGES: '/challenges',
  PUZZLES: '/puzzles',
  TIMED_QUIZZES: '/quizzes/timed',
  LEADERBOARDS: '/leaderboards',
  ACHIEVEMENTS: '/achievements',

  // Auth routes
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  VERIFY_EMAIL: '/auth/verify-email',
  RESET_PASSWORD: '/auth/reset-password',

  // Onboarding flow
  ONBOARDING: '/onboarding',

  NOT_FOUND: '*'
};

export default ROUTES;
