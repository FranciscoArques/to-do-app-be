import { Router } from 'express';
import { HealthCheckRoutes } from './routes/health-checks.routes';
import { AuthRoutes } from './routes/auth.routes';
import { TasksRoutes } from './routes/tasks.routes';
import { FriendsRoutes } from './routes/friends.routes';

export class MainRoutes {
  public router: Router;
  private healthCheckRoutes = new HealthCheckRoutes();
  private authRoutes = new AuthRoutes();
  private tasksRoutes = new TasksRoutes();
  private friendsRoutes = new FriendsRoutes();

  constructor() {
    this.router = Router();
    this.init();
  }

  private init(): void {
    this.router.use('/healtchecks', this.healthCheckRoutes.router);
    this.router.use('/auth', this.authRoutes.router);
    this.router.use('/tasks', this.tasksRoutes.router);
    this.router.use('/friends', this.friendsRoutes.router);
  }
}
