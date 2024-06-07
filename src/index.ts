import { Router } from 'express';
import { HealthCheckRoutes } from './routes/health-checks.routes';

const healthCheckRoutes = new HealthCheckRoutes();

export class MainRoutes {
  public router: Router;

  constructor() {
    this.router = Router(),
    this.init();
  }

  private init(): void {
    this.router.use('/healtchecks', healthCheckRoutes.router);
  }
}
