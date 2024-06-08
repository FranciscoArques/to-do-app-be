import { Router, Request, Response, NextFunction } from 'express';
import { HttpError } from '../errors/httpError';
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
    res.status(200).send(result);
  }

  private async pingDbController(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await HealthCheckService.pingDb();
      if (!result) {
        return next(
          new HttpError(404, 'Document Not Found.')
        );
      }
      res.status(200).send(result);
    } catch (error) {
      return next(
        new HttpError(500, 'Internal Server Error.')
      );
    }
  }
}
