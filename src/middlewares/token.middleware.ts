import jwt from 'jsonwebtoken';
import moment from 'moment';
import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db/firebase-service';
import { EncryptationProcesses } from '../utils/secrets/encryptation-processes';
import { HttpError } from '../utils/errors/http-error';
import { catchErrorHandler, catchErrorHandlerController } from '../utils/errors/catch-error-handlers';
import { config } from '../utils/secrets/envs-manager';

interface TokenMiddlewareDTO {
  registerTokenService: RegisterTokenService;
}

type RegisterTokenService = {
  message: 'token created';
  tokenUid: string;
};

export class TokenMiddleware {
  public router: Router;

  constructor() {
    this.router = Router();
    this.init();
  };

  private init(): void {
    this.router.post('/get-token', this.getTokenController.bind(this));
    this.router.post('/register-token', this.registerTokenController.bind(this));
  };

  public isTokenAuthenticated = () => {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const reqToken = req.header('authenticate-token');
        if (!reqToken) {
          throw new HttpError(404, 'isTokenAuthenticated: token not found.');
        }
        const parsedToken = reqToken.replace('Bearer ', '');
        const parsedTokenSplited = parsedToken.split(':');
        if (parsedTokenSplited.length !== 2) {
          throw new HttpError(400, 'isTokenAuthenticated: invalid token format.');
        }  
        const [iv, token] = parsedTokenSplited;
        const decodedToken = jwt.verify(token, config.jwtSecretKey);
        if (!decodedToken || typeof decodedToken === 'string') {
          throw new HttpError(400, 'isTokenAuthenticated: failed jsonwebtoken.');
        }
        const { uid, email } = EncryptationProcesses.decryptData(iv, decodedToken.encryptedData);
        if (!uid || !email) {
          throw new HttpError(400, 'isTokenAuthenticated: failed decryptData.');
        }
        const tokenDoc = await db.collection('token').doc(uid).get();
        const tokenData = tokenDoc.data();
        if (!tokenDoc.exists || !tokenData) {
          throw new HttpError(404, 'isTokenAuthenticated: token not found.');
        }
        if (email !== tokenData.email) {
          throw new HttpError(403, 'isTokenAuthenticated: credentials mismatch.');
        }
        if (tokenData.isTokenDisabled || tokenData.isTokenDeleted) {
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
    const uid = Array.isArray(req.headers['uid']) ? req.headers['uid'][0] : req.headers['uid'];
    const { email, password } = req.body;
    if (!uid || !email || !password) {
      return next(new HttpError(400, 'Missing Body.'));
    }
    try {
      const token = await this.getTokenService(uid, email, password);
      if(!token) {
        return next(new HttpError(400, 'Cannot get Token.'));
      }
      return res.status(201).json({ token, expiresIn: '1 hour' });
    } catch (error) {
      return next(catchErrorHandlerController(error));
    }
  };

  private async registerTokenController(req: Request, res: Response, next: NextFunction) {
    const contentType = req.headers['content-type'];
    if (!contentType || contentType !== 'application/x-www-form-urlencoded') {
      return next(new HttpError(400, 'Only urlencoded data accepted.'));
    }
    const { name, email, password1, password2 } = req.body;
    if (!name || !email || !password1 || !password2) {
      return next(new HttpError(400, 'Missing Body.'));
    }
    const nameRegex = /^[a-zA-Z\d]{2,16}$/;
    if (!nameRegex.test(name.trim())) {
      return next(new HttpError(400, 'Inavlid Name.'));
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return next(new HttpError(400, 'Inavlid Email.'));
    }
    if (password1 !== password2) {
      return next(new HttpError(400, 'Both passwords must be the same.'));
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,16}$/;
    if (!passwordRegex.test(password1.trim())) {
      return next(new HttpError(400, 'Invalid Password.'));
    }
    try {
      const checkEmailDB = await db.collection('token').where('email', '==', email).get();
      const isAlreadyToken = !checkEmailDB?.empty;
      if(isAlreadyToken) {
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
  };

  private getTokenService = async (uid: string, email: string, password: string): Promise<string> => {
    if (!uid || !email || !password) {
      throw new HttpError(400, 'getTokenService: missing parameters.');
    }
    try {
      const docRef = await db.collection('token').doc(uid).get();
      const tokenData = docRef.data();
      if(!tokenData) {
        throw new HttpError(404, 'getTokenService: token not found in db.');
      }
      const { email: dbEmail, password: dbPassword, isTokenDisabled, isTokenDeleted } = tokenData;
      if(!dbEmail || !dbPassword) {
        throw new HttpError(400, 'getTokenService: missing data in db.');
      }
      const isSamePassword = await EncryptationProcesses.comparePassword(password, dbPassword);
      if(!isSamePassword || email !== dbEmail) {
        throw new HttpError(400, 'getTokenService: credentials mismatch.');
      }
      if(isTokenDisabled || isTokenDeleted) {
        throw new HttpError(400, 'getTokenService: token not available.');
      }
      const updateTokenData = {
        ...tokenData,
        lastConnection: moment().format('DD-MM-YYYY HH:mm:ss')
      };
      await db.collection('token').doc(uid).set(updateTokenData);
      const { iv, encryptedData } = EncryptationProcesses.encyptData({ uid, email });
      const token = jwt.sign({ encryptedData }, config.jwtSecretKey, { expiresIn: '1h' });
      const result = `${iv}:${token}`;
      return result
    } catch (error) {
      return catchErrorHandler('getTokenService', error);
    }
  };

  private async registerTokenService(name: string, email: string, password: string): Promise<TokenMiddlewareDTO['registerTokenService']> {
    if (!name || !email || !password) {
      throw new HttpError(400, 'registerTokenService: missing parameters.');
    }
    try {
      const hashedPassword = await EncryptationProcesses.hashPassword(password);
      const tokenData = {
        email,
        name,
        password: hashedPassword,
        creationDate: moment().format('DD-MM-YYYY HH:mm:ss'),
        lastConnection: moment().format('DD-MM-YYYY HH:mm:ss'),
        isTokenDisabled: false,
        isTokenDeleted: false
      };
      const tokenRef = await db.collection('token').add(tokenData);
      const tokenUid = tokenRef.id;
      return { message: 'token created', tokenUid };
    } catch (error: unknown) {
      return catchErrorHandler('createUser', error);
    }
  }
};
