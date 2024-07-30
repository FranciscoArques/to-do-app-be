import { Router, Request, Response, NextFunction } from 'express';
import { HttpError } from '../utils/errors/http-error';

export class TasksRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.init();
  }

  private init(): void {
    this.router.post('/task', this.createTaskController.bind(this));
  }

  private async createTaskController(req: Request, res: Response, next: NextFunction) {}
}
