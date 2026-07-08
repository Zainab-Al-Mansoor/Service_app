import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader, JwtPayload } from '../utils/jwt';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const token = extractTokenFromHeader(req.headers.authorization);

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.',
    });
    return;
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token.',
    });
    return;
  }

  req.user = decoded;
  next();
};

export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Access denied. User not authenticated.',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.roleName)) {
      res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.',
      });
      return;
    }

    next();
  };
};

export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
  const token = extractTokenFromHeader(req.headers.authorization);

  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      req.user = decoded;
    }
  }

  next();
};
