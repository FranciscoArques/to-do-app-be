import { Router, Request, Response, NextFunction } from 'express';
import { Regex } from '../utils/secrets/envs-manager';
import { AuthService } from '../services/auth.service';
import { authenticateUser } from '../middlewares/authenticate-user.middleware';
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
    this.router.post('/register-admin', authenticateUser(true), this.createAdminController.bind(this));
    this.router.post('/login', this.loginUserController.bind(this));
    // this.router.patch('/change-password', this.changePasswordUserController.bind(this));
    this.router.patch('/disable', authenticateUser(), this.disableUserController.bind(this));
    this.router.patch('/enable', authenticateUser(), this.enableUserController.bind(this));
    this.router.patch('/delete', authenticateUser(true), this.deleteUserController.bind(this));
    this.router.patch('/restore', authenticateUser(true), this.restoreUserController.bind(this));
    this.router.delete('/delete-admin', authenticateUser(true), this.deleteAdminController.bind(this));
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

  private async createAdminController(req: Request, res: Response, next: NextFunction) {
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
      const { uid } = await AuthService.createUser(name.trim(), email.trim().toLowerCase(), password1.trim(), true);
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

  private async disableUserController(req: Request, res: Response, next: NextFunction) {
    const { uid, isUserDisabled } = req.userSession;
    if (!uid) {
      return next(new HttpError(401, 'No User Data on Session for Client. '));
    }
    if (isUserDisabled) {
      return next(new HttpError(409, 'User Already Disabled.'));
    }
    try {
      const { message } = await AuthService.disableUser(uid);
      if (!message) {
        return next(new HttpError(400, 'Could Not Disable User.'));
      }
      return res.status(200).json({ message });
    } catch (error) {
      return next(catchErrorHandlerController(error));
    }
  }

  private async deleteUserController(req: Request, res: Response, next: NextFunction) {
    const { uid } = req.body;
    if (!uid) {
      return next(new HttpError(400, 'Missing Body.'));
    }
    try {
      const { message } = await AuthService.deleteUser(uid);
      if (!message) {
        return next(new HttpError(400, 'Could Not Delete User.'));
      }
      return res.status(200).json({ message });
    } catch (error) {
      return next(catchErrorHandlerController(error));
    }
  }

  private async enableUserController(req: Request, res: Response, next: NextFunction) {
    const { uid, isUserDisabled } = req.userSession;
    if (!uid) {
      return next(new HttpError(401, 'No User Data on Session for Client. '));
    }
    if (!isUserDisabled) {
      return next(new HttpError(409, 'User Already Enabled.'));
    }
    try {
      const { message } = await AuthService.enableUser(uid);
      if (!message) {
        return next(new HttpError(400, 'Could Not Enable User.'));
      }
      return res.status(200).json({ message });
    } catch (error) {
      return next(catchErrorHandlerController(error));
    }
  }

  private async restoreUserController(req: Request, res: Response, next: NextFunction) {
    const { uid } = req.body;
    if (!uid) {
      return next(new HttpError(400, 'Missing Body.'));
    }
    try {
      const { message } = await AuthService.restoreUser(uid);
      if (!message) {
        return next(new HttpError(400, 'Could Not Restore User.'));
      }
      return res.status(200).json({ message });
    } catch (error) {
      return next(catchErrorHandlerController(error));
    }
  }

  private async deleteAdminController(req: Request, res: Response, next: NextFunction) {
    try {
      const { message, usersDeleted } = await AuthService.deleteAdmin();
      if (!message) {
        return next(new HttpError(400, 'Could Not Run Delete Admin.'));
      }
      return res.status(200).json({ message: usersDeleted ? message : 'no user to delete', usersDeleted });
    } catch (error) {
      return next(catchErrorHandlerController(error));
    }
  }
}
