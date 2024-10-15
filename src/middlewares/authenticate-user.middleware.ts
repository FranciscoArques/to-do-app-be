import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { db } from '../db/firebase-service';
import { EncryptationProcesses } from '../utils/secrets/encryptation-processes';
import { HttpError } from '../utils/errors/http-error';
import { catchErrorHandlerController } from '../utils/errors/catch-error-handlers';
import { Config } from '../utils/secrets/envs-manager';
import type { DecodedToken } from '../models/token.middleware.models';

declare module 'express-serve-static-core' {
  interface Request {
    userSession: UserSession;
  }
}

type UserSession = {
  uid: string;
  email: string;
  name: string;
  role: 'client' | 'admin';
  creationDate: string;
  lastConnection: string;
  tasksCreated: number;
  tasksCompleted: number;
  tasksDroped: number;
  isUserDisabled: boolean;
  isUserDeleted: boolean;
};

export const authenticateUser = (isClientNotAllowed: boolean = false) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userToken = req.header('Authorization');
      const iv = req.header('iv');
      if (!userToken || !iv) {
        throw new HttpError(404, 'authenticateUser: userToken not found.');
      }
      const decodedToken = jwt.verify(userToken.replace('Bearer ', ''), Config.jwtSecretKey) as DecodedToken;
      const { uid, email, role } = EncryptationProcesses.decryptData(iv, decodedToken.encryptedData);
      const userData = await db
        .collection('users')
        .doc(uid)
        .get()
        .then((doc) => (doc.exists ? doc.data() : ''));
      if (!userData) {
        throw new HttpError(404, 'authenticateUser: user not found.');
      }
      if (userData.email !== email || userData.isUserDisabled || userData.isUserDeleted) {
        throw new HttpError(403, 'authenticateUser: insufficient permissions.');
      }
      if (isClientNotAllowed && role === 'client') {
        throw new HttpError(403, 'authenticateUser: insufficient permissions.');
      }
      req.userSession = { uid, ...userData } as UserSession;
      next();
    } catch (error) {
      return next(catchErrorHandlerController(error));
    }
  };
};
