import { Router, Request, Response, NextFunction } from 'express';
import { HttpError } from '../errors/httpError';
import { AuthService } from '../services/auth.service';

export class AuthRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.init();
  }

  private init(): void {
    this.router.post('/register', this.createUserController.bind(this));
    this.router.post('/login', this.loginUserController.bind(this));
  }

  private async createUserController(req: Request, res: Response, next: NextFunction) {
    const { name, email, password1, password2 } = req.body;
    if (!name || !email || !password1 || !password2) {
      return next(new HttpError(400, 'Missing Body.'));
    }
    if (password1 !== password2) {
      return next(new HttpError(400, 'Both passwords must be the same.'));
    }
    try {
      const { uid, code, message } = await AuthService.createUser(name, email, password1);
      if (code || !uid) {
        return next(new HttpError(400, message ? message : 'Bad Request.'));
      }
      return res.status(201).json({ uid });
    } catch (error) {
      return next(new HttpError(500, 'Internal Server Error.'));
    }
  }

  private async loginUserController(req: Request, res: Response, next: NextFunction) {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new HttpError(400, 'Missing Body.'));
    }
    try {
      const { login, code, message } = await AuthService.loginUser(email, password);
      if (code || !login) {
        return next(new HttpError(400, message ? message : 'Bad Request.'));
      }
      return res.status(200).json({ login });
    } catch (error) {
      return next(new HttpError(500, 'Internal Server Error.'));
    }
  }
}
