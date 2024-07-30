import { Router, Request, Response, NextFunction } from 'express';
import { HealthCheckService } from '../services/health-checks.service';
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
  }

  private async pingController(req: Request, res: Response, next: NextFunction) {
    const { message } = HealthCheckService.ping();
    if (!message) {
      return next(new HttpError(404, 'Document Not Found.'));
    }
    res.status(200).json({ message });
  }

  private async pingDbController(req: Request, res: Response, next: NextFunction) {
    try {
      const { result } = await HealthCheckService.pingDb();
      if (!result) {
        return next(new HttpError(404, 'Document Not Found.'));
      }
      res.status(200).json(result);
    } catch (error) {
      return next(catchErrorHandlerController(error));
    }
  }
}
