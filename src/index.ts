import { Router } from 'express';
import { HealthCheckRoutes } from './routes/health-checks.routes';
import { AuthRoutes } from './routes/auth.routes';
import { TasksRoutes } from './routes/tasks.routes';

const healthCheckRoutes = new HealthCheckRoutes();
const authRoutes = new AuthRoutes();
const tasksRoutes = new TasksRoutes();

export class MainRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.init();
  }

  private init(): void {
    this.router.use('/healtchecks', healthCheckRoutes.router);
    this.router.use('/auth', authRoutes.router);
    this.router.use('/tasks', tasksRoutes.router);
  }
}
