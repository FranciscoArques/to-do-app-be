import { Router, Request, Response, NextFunction } from 'express';
import { HttpError } from '../errors/http-error';
import { HealthCheckService } from '../services/health-checks.service';

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

  private async pingController(req: Request, res: Response) {
    const result = HealthCheckService.ping();
    res.status(200).json(result);
  }

  private async pingDbController(req: Request, res: Response, next: NextFunction) {
    try {
      const { result, error, code, message } = await HealthCheckService.pingDb();
      if (!result && error) {
        return next(new HttpError(code ? code : 404, message ? message : 'Document Not Found.'));
      }
      res.status(200).json(result);
    } catch (error) {
      return next(new HttpError(500, 'Internal Server Error.'));
    }
  }
}
