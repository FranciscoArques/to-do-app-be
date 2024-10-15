import jwt from 'jsonwebtoken';
import moment from 'moment';
import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db/firebase-service';
import { authenticateUser } from '../middlewares/authenticate-user.middleware';
import { EncryptationProcesses } from '../utils/secrets/encryptation-processes';
import { HttpError } from '../utils/errors/http-error';
import { catchErrorHandler, catchErrorHandlerController } from '../utils/errors/catch-error-handlers';
import { Config, Regex } from '../utils/secrets/envs-manager';
import type { TokenMiddlewareDTO, DecodedToken } from '../models/token.middleware.models';

export class TokenMiddleware {
  public router: Router;

  constructor() {
    this.router = Router();
    this.init();
  }

  private init(): void {
    this.router.post('/get-token', this.getTokenController.bind(this));
    this.router.post('/register-token', authenticateUser(true), this.registerTokenController.bind(this));
    this.router.patch('/disable', authenticateUser(true), this.disableTokenController.bind(this));
    this.router.patch('/enable', authenticateUser(true), this.enableTokenController.bind(this));
    this.router.delete('/delete', authenticateUser(true), this.deleteTokenController.bind(this));
  }

  public isTokenAuthenticated = () => {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const reqToken = req.header('authenticate-token');
        if (!reqToken) {
          throw new HttpError(404, 'isTokenAuthenticated: token not found.');
        }
        const [iv, token] = reqToken.replace('Bearer ', '').split(':');
        const decodedToken = jwt.verify(token, Config.jwtSecretKey) as DecodedToken;
        if (!decodedToken) {
          throw new HttpError(400, 'isTokenAuthenticated: failed jsonwebtoken.');
        }
        const { uid, email } = EncryptationProcesses.decryptData(iv, decodedToken.encryptedData);
        if (!uid || !email) {
          throw new HttpError(400, 'isTokenAuthenticated: failed decryptData.');
        }
        const tokenData = await db
          .collection('token')
          .doc(uid)
          .get()
          .then((doc) => (doc.exists ? doc.data() : ''));
        if (!tokenData) {
          throw new HttpError(404, 'isTokenAuthenticated: token not found.');
        }
        if (tokenData.email !== email) {
          throw new HttpError(403, 'isTokenAuthenticated: credentials mismatch.');
        }
        if (tokenData.isTokenDisabled) {
          throw new HttpError(403, 'isTokenAuthenticated: token not available.');
        }
        next();
      } catch (error) {
        return next(catchErrorHandlerController(error));
      }
    };
  };

  private async getTokenController(req: Request, res: Response, next: NextFunction) {
    const contentType = req.headers['content-type'];
    if (!contentType || contentType !== 'application/x-www-form-urlencoded') {
      return next(new HttpError(400, 'Only urlencoded data accepted.'));
    }
    const uid = req.headers['uid'] as string;
    const { email, password } = req.body;
    if (!uid || !email || !password) {
      return next(new HttpError(400, 'Missing Body.'));
    }
    try {
      const { token } = await this.getTokenService(uid, email, password);
      if (!token) {
        return next(new HttpError(400, 'Cannot get Token.'));
      }
      return res.status(201).json({ token, expiresIn: '1 hour' });
    } catch (error) {
      return next(catchErrorHandlerController(error));
    }
  }

  private async registerTokenController(req: Request, res: Response, next: NextFunction) {
    const contentType = req.headers['content-type'];
    if (!contentType || contentType !== 'application/x-www-form-urlencoded') {
      return next(new HttpError(400, 'Only urlencoded data accepted.'));
    }
    const { name, email, password1, password2 } = req.body;
    if (!name || !email || !password1 || !password2) {
      return next(new HttpError(400, 'Missing Body.'));
    }
    if (!Regex.userName.test(name.trim())) {
      return next(new HttpError(400, 'Inavlid Name.'));
    }
    if (!Regex.userEmail.test(email.trim())) {
      return next(new HttpError(400, 'Inavlid Email.'));
    }
    if (password1 !== password2) {
      return next(new HttpError(400, 'Both passwords must be the same.'));
    }
    if (!Regex.userPassword.test(password1.trim())) {
      return next(new HttpError(400, 'Invalid Password.'));
    }
    try {
      const checkEmailDB = await db.collection('token').where('email', '==', email).get();
      if (!checkEmailDB?.empty) {
        return next(new HttpError(409, 'Token Already Registered.'));
      }
      const { message, tokenUid } = await this.registerTokenService(name.trim(), email.trim().toLowerCase(), password1.trim());
      if (!message || !tokenUid) {
        return next(new HttpError(404, 'Bad Request.'));
      }
      return res.status(201).json({ message, tokenUid });
    } catch (error) {
      return next(catchErrorHandlerController(error));
    }
  }

  private async disableTokenController(req: Request, res: Response, next: NextFunction) {
    const { uid } = req.body;
    if (!uid) {
      return next(new HttpError(400, 'Missing Body. '));
    }
    try {
      const { message } = await this.disableTokenService(uid);
      if (!message) {
        return next(new HttpError(400, 'Could Not Disable Token.'));
      }
      return res.status(200).json({ message });
    } catch (error) {
      return next(catchErrorHandlerController(error));
    }
  }

  private async enableTokenController(req: Request, res: Response, next: NextFunction) {
    const { uid } = req.body;
    if (!uid) {
      return next(new HttpError(400, 'Missing Body. '));
    }
    try {
      const { message } = await this.enableTokenService(uid);
      if (!message) {
        return next(new HttpError(400, 'Could Not Enable Token.'));
      }
      return res.status(200).json({ message });
    } catch (error) {
      return next(catchErrorHandlerController(error));
    }
  }

  private async deleteTokenController(req: Request, res: Response, next: NextFunction) {
    try {
      const { message, tokensDeleted } = await this.deleteToken();
      if (!message) {
        return next(new HttpError(400, 'Could Not Run Delete Token.'));
      }
      return res.status(200).json({ message: tokensDeleted ? message : 'no token to delete', tokensDeleted });
    } catch (error) {
      return next(catchErrorHandlerController(error));
    }
  }

  private getTokenService = async (uid: string, email: string, password: string): Promise<TokenMiddlewareDTO['getTokenResponseDTO']> => {
    try {
      const tokenData = await db
        .collection('token')
        .doc(uid)
        .get()
        .then((doc) => (doc.exists ? doc.data() : ''));
      if (!tokenData) {
        throw new HttpError(404, 'getTokenService: token not found in db.');
      }
      const { email: dbEmail, password: dbPassword, isTokenDisabled } = tokenData;
      if (!dbEmail || !dbPassword) {
        throw new HttpError(400, 'getTokenService: missing data in db.');
      }
      const isSamePassword = await EncryptationProcesses.comparePassword(password, dbPassword);
      if (!isSamePassword || email !== dbEmail) {
        throw new HttpError(400, 'getTokenService: credentials mismatch.');
      }
      if (isTokenDisabled) {
        throw new HttpError(400, 'getTokenService: token not available.');
      }
      const updatedTokenData = {
        ...tokenData,
        lastConnection: moment().format('DD-MM-YYYY HH:mm:ss')
      };
      await db.collection('token').doc(uid).set(updatedTokenData);
      const { iv, encryptedData } = EncryptationProcesses.encyptData({ uid, email });
      const jwToken = jwt.sign({ encryptedData }, Config.jwtSecretKey, { expiresIn: '1h' });
      const token = `${iv}:${jwToken}`;
      return { token };
    } catch (error) {
      return catchErrorHandler('getTokenService', error);
    }
  };

  private async registerTokenService(name: string, email: string, password: string): Promise<TokenMiddlewareDTO['registerTokenResponseDTO']> {
    try {
      const hashedPassword = await EncryptationProcesses.hashPassword(password);
      const tokenData = {
        email,
        name,
        password: hashedPassword,
        creationDate: moment().format('DD-MM-YYYY HH:mm:ss'),
        lastConnection: moment().format('DD-MM-YYYY HH:mm:ss'),
        isTokenDisabled: false
      };
      const tokenRef = await db.collection('token').add(tokenData);
      const tokenUid = tokenRef.id;
      return { message: 'token created', tokenUid };
    } catch (error: unknown) {
      return catchErrorHandler('createUser', error);
    }
  }

  private async disableTokenService(uid: string): Promise<TokenMiddlewareDTO['disableTokenResponseDTO']> {
    try {
      await db
        .collection('token')
        .doc(uid)
        .update({ isTokenDisabled: moment().format('DD-MM-YYYY HH:mm:ss') });
      return { message: 'token is now disabled' };
    } catch (error: unknown) {
      return catchErrorHandler('disableTokenService', error);
    }
  }

  private async enableTokenService(uid: string): Promise<TokenMiddlewareDTO['enableTokenResponseDTO']> {
    try {
      await db.collection('token').doc(uid).update({ isTokenDisabled: false });
      return { message: 'token is now enabled' };
    } catch (error: unknown) {
      return catchErrorHandler('enableTokenService', error);
    }
  }

  public async deleteToken(): Promise<TokenMiddlewareDTO['deleteTokenResponseDTO']> {
    const tokensUids: string[] = [];
    const thirtyDaysAgo = moment().subtract(30, 'days').format('DD-MM-YYYY HH:mm:ss');
    try {
      const snapshot = await db.collection('token').where('isTokenDisabled', '<=', thirtyDaysAgo).get();
      if (!snapshot.empty) {
        snapshot.forEach((doc) => {
          tokensUids.push(doc.id);
        });
      }
      const deleteTokens = tokensUids.map((uid) => db.collection('token').doc(uid).delete());
      await Promise.all(deleteTokens);
      return { message: 'tokens in db deleted permanently', tokensDeleted: tokensUids.length };
    } catch (error: unknown) {
      return catchErrorHandler('deleteToken', error);
    }
  }
}
