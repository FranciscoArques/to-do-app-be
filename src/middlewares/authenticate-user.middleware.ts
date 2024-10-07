import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { db } from '../db/firebase-service';
import { EncryptationProcesses } from '../utils/secrets/encryptation-processes';
import { HttpError } from '../utils/errors/http-error';
import { catchErrorHandlerController } from '../utils/errors/catch-error-handlers';
import { config } from '../utils/secrets/envs-manager';

declare global {
  namespace Express {
    interface Request {
      userSession?: any;
    }
  }
}

export const authenticateUser = (isClientNotAllowed: boolean = false) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userToken = req.header('Authorization');
      const iv = req.header('iv');
      if (!userToken || !iv) {
        throw new HttpError(404, 'authenticateUser: userToken not found.');
      }
      const parsedUserToken = userToken.replace('Bearer ', '');
      const decodedUserToken = jwt.verify(parsedUserToken, config.jwtSecretKey);
      if (!decodedUserToken || typeof decodedUserToken === 'string') {
        throw new HttpError(400, 'authenticateUser: failed jsonwebtoken.');
      }
      const { uid, email, name, role } = EncryptationProcesses.decryptData(iv, decodedUserToken.encryptedData);
      if (!uid || !email || !name || !role) {
        throw new HttpError(400, 'authenticateUser: failed decryptData.');
      }
      const userDoc = await db.collection('users').doc(uid).get();
      const userData = userDoc.data();
      if (!userDoc.exists || !userData) {
        throw new HttpError(404, 'authenticateUser: user not found.');
      }
      if (isClientNotAllowed && role === 'client') {
        throw new HttpError(403, 'authenticateUser: insufficient permissions.');
      }
      req.userSession = userData;
      next();
    } catch (error) {
      return next(catchErrorHandlerController(error));
    }
  };
};
