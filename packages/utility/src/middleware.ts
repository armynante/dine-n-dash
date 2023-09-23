/* eslint-disable @typescript-eslint/no-namespace */
import { Request, Response, NextFunction } from 'express';
import { IncomingHttpHeaders } from 'http';
import jwt, { JwtPayload } from 'jsonwebtoken';

// Extend the Request interface to include the 'token' property
declare global {
  namespace Express {
    interface Request {
      token?: JwtPayload;
    }
  }
}

// Middleware to verify JWT token
export function verifyToken(req: Request, res: Response, next: NextFunction) {
    const secretKey = process.env.JWT_SECRET;
    

    if (!secretKey) {
        throw new Error('Missing JWT_SECRET environment variable');
    }
    const headers = req.headers as IncomingHttpHeaders;
    const token = headers.authorization;
  

    if (!token) {
        return res.status(401).json({ message: 'Token not provided' });
    }

    // Verify the token using the secret key
    jwt.verify(token, secretKey!, (err:unknown, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }

        // Store the decoded user data in the request for later use
        req.token = decoded as JwtPayload;
        next();
    });
}
