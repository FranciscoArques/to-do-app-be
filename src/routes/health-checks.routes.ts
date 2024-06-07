import { Router, Request, Response, NextFunction } from 'express';
import { HttpError } from '../errors/HttpError';
import { pingService, pingDbService } from '../services/health-checks.service';

export class HealthCheckRoutes {
  public router: Router;

  constructor() {
    this.router = Router(),
    this.init();
  }

  private init(): void {
    this.router.get('/ping', pingController),
    this.router.get('/ping-db', pingDbController);
  }
}

const pingController = async (req: Request, res: Response): Promise<void> => {
  const result = await pingService();
  res.status(200).send(result)
};

const pingDbController = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const doc = await pingDbService();
    if (!doc.exists) {
      return next(
        new HttpError(404, 'Document Not Found.')
      )
    }
    res.status(200).send(doc.data());
  } catch (error) {
    return next(
      new HttpError(500, 'Internal Server Error.')
    )
  }
};
