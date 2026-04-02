import { Request, Response, NextFunction } from 'express';

type Role = 'VIEWER' | 'ANALYST' | 'ADMIN';

export interface AuthRequest extends Request {
  userRole?: Role;
}

const VALID_ROLES: Role[] = ['VIEWER', 'ANALYST', 'ADMIN'];

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const role = req.headers['x-user-role'] as string;

  if (!role || !VALID_ROLES.includes(role as Role)) {
    res.status(401).json({ error: 'Missing or invalid X-User-Role header' });
    return;
  }

  req.userRole = role as Role;
  next();
}

export function requireRole(...roles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }
    next();
  };
}
