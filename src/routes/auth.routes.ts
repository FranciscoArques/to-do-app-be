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
  }

  private async createUserController(req: Request, res: Response, next: NextFunction) {
    const {name, email, password1, password2} = req.body;
    if(!name || !email || !password1 || !password2) {
      return next(
        new HttpError(400, 'Missing Body.')
      );
    }
    if (password1 !== password2){
      return next(
        new HttpError(400, 'Both passwords must be the same.')
      );
    }
    try {
      const { ...result } = await AuthService.createUser(name, email, password1);
      if (!result || result.code || !result.uid) {
        return next(
          new HttpError(
            400,
            result.message ? result.message : 'Bad Request.')
        );
      }
      return res.status(201).json({ uid: result.uid })
    } catch (error) {
      return next(
        new HttpError(500, 'Internal Server Error.')
      );
    }
  }
}
