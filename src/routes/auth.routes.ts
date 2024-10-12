import { Router, Request, Response, NextFunction } from 'express';
import { Regex } from '../utils/secrets/envs-manager';
import { AuthService } from '../services/auth.service';
import { HttpError } from '../utils/errors/http-error';
import { catchErrorHandlerController } from '../utils/errors/catch-error-handlers';

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
    if (!Regex.userName.test(name.trim())) {
      return next(new HttpError(400, 'Inavlid Name.'));
    }
    if (password1 !== password2) {
      return next(new HttpError(400, 'Both passwords must be the same.'));
    }
    if (!Regex.userPassword.test(password1.trim())) {
      return next(new HttpError(400, 'Invalid Password.'));
    }
    try {
      const { uid } = await AuthService.createUser(name.trim(), email.trim().toLowerCase(), password1.trim());
      if (!uid) {
        return next(new HttpError(404, 'Bad Request.'));
      }
      return res.status(201).json({ uid });
    } catch (error) {
      return next(catchErrorHandlerController(error));
    }
  }

  private async loginUserController(req: Request, res: Response, next: NextFunction) {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new HttpError(400, 'Missing Body.'));
    }
    try {
      const { iv, userToken } = await AuthService.loginUser(email, password);
      if (!iv || !userToken) {
        return next(new HttpError(404, 'Bad Request.'));
      }
      res.setHeader('iv', iv);
      return res.status(200).json({ userToken });
    } catch (error) {
      return next(catchErrorHandlerController(error));
    }
  }
}
