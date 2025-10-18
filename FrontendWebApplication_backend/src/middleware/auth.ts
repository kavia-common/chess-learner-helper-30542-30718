import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload, Role } from '../types/common.js';

export interface AuthedRequest extends Request {
  user?: JwtPayload & { token?: string };
}

// PUBLIC_INTERFACE
export function jwtAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  /** JWT bearer token auth middleware. Expects Authorization: Bearer <token>. */
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  const token = auth.slice('Bearer '.length);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev') as JwtPayload;
    req.user = { ...payload, token };
    return next();
  } catch {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
}

// PUBLIC_INTERFACE
export function requireRole(roles: Role[]) {
  /** Role-based guard middleware for endpoints. */
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    const role = req.user?.role;
    if (!role) return res.status(401).json({ success: false, error: 'Unauthorized' });
    if (!roles.includes(role)) return res.status(403).json({ success: false, error: 'Forbidden' });
    return next();
  };
}
