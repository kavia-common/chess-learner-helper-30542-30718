export type ApiResponse<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
};

export type JwtPayload = {
  sub: string;
  role: 'LEARNER' | 'ADMIN';
};

export type Role = 'LEARNER' | 'ADMIN';
