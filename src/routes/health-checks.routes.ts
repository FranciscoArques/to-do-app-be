import { Router, Request, Response, NextFunction } from 'express';
import { HealthCheckService } from '../services/health-checks.service';
import { authenticateUser } from '../middlewares/authenticate-user.middleware';
import { HttpError } from '../utils/errors/http-error';
import { catchErrorHandlerController } from '../utils/errors/catch-error-handlers';

export class HealthCheckRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.init();
  }

  private init(): void {
    this.router.get('/ping', this.pingController.bind(this));
    this.router.get('/ping-db', this.pingDbController.bind(this));
    this.router.get('/ping-auth-client', authenticateUser(), this.pingAuthClientController.bind(this));
    this.router.get('/ping-auth-admin', authenticateUser(true), this.pingAuthAdminController.bind(this));
  }

  private async pingController(req: Request, res: Response, next: NextFunction) {
    const { message } = HealthCheckService.ping();
    if (!message) {
      return next(new HttpError(404, 'Document Not Found.'));
    }
    return res.status(200).json({ message });
  }

  private async pingDbController(req: Request, res: Response, next: NextFunction) {
    try {
      const { data } = await HealthCheckService.pingDb();
      if (!data) {
        return next(new HttpError(404, 'Document Not Found.'));
      }
      return res.status(200).json(data);
    } catch (error) {
      return next(catchErrorHandlerController(error));
    }
  }

  private async pingAuthClientController(req: Request, res: Response, next: NextFunction) {
    try {
      const { userSession } = req;
      if (!userSession) {
        return next(new HttpError(401, 'No User Data on Session for Client.'));
      }
      return res.status(200).json({ userSession });
    } catch (error) {
      return next(catchErrorHandlerController(error));
    }
  }

  private async pingAuthAdminController(req: Request, res: Response, next: NextFunction) {
    try {
      const { userSession } = req;
      if (!userSession) {
        return next(new HttpError(401, 'No User Data on Session for Admin.'));
      }
      return res.status(200).json({ userSession });
    } catch (error) {
      return next(catchErrorHandlerController(error));
    }
  }
}
