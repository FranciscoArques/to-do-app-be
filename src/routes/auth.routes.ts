import { Router, Request, Response, NextFunction } from 'express';
import { HttpError } from '../errors/http-error';
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
    const nameRegex = /^[a-zA-Z\d]{2,16}$/;
    if (!nameRegex.test(name.trim())) {
      return next(new HttpError(400, 'Inavlid Name.'));
    }
    if (password1 !== password2) {
      return next(new HttpError(400, 'Both passwords must be the same.'));
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,16}$/;
    if (!passwordRegex.test(password1.trim())) {
      return next(new HttpError(400, 'Invalid Password.'));
    }
    try {
      const { uid, error, code, message } = await AuthService.createUser(name.trim(), email.trim().toLowerCase(), password1.trim());
      if (!uid && error) {
        return next(new HttpError(code ? code : 404, message ? message : 'Bad Request.'));
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
      const { iv, userToken, error, code, message } = await AuthService.loginUser(email, password);
      if (!iv || !userToken || error) {
        return next(new HttpError(code ? code : 404, message ? message : 'Bad Request.'));
      }
      res.setHeader('iv', iv);
      return res.status(200).json({ userToken });
    } catch (error) {
      return next(new HttpError(500, 'Internal Server Error.'));
    }
  }
}
