export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  VERIFY_EMAIL: '/verify-email',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  LINK_ACCOUNTS: '/link-accounts',
  DASHBOARD: '/dashboard',
  GAMES_AI: '/games/ai',
  GAMES_MATCH: '/games/match',
  GAMES_REALTIME: (id = ':gameId') => `/games/realtime/${id}`,
  CHALLENGES: '/challenges',
  PUZZLES: '/puzzles',
  LEADERBOARDS: '/leaderboards',
  ACHIEVEMENTS: '/achievements',
  PROFILE: '/profile',
  SETTINGS: '/settings',
};

export const APP = {
  NAME: 'Chess Learner Helper',
  VERSION: '0.1.0'
};
