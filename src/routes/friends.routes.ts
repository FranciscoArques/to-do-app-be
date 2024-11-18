import { Router, Request, Response, NextFunction } from 'express';
import { FriendsService } from '../services/friends.service';
import { HttpError } from '../utils/errors/http-error';
import { catchErrorHandlerController } from '../utils/errors/catch-error-handlers';

export class FriendsRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.init();
  }

  private init(): void {
    this.router.get('/search-user', this.searchUserController.bind(this));
  }

  private async searchUserController(req: Request, res: Response, next: NextFunction) {
    const { userVisibleId, userName } = req.query;
    try {
      if (!userVisibleId && !userName) {
        throw new HttpError(400, 'Missing Querys.');
      }
      const { users } = await FriendsService.searchUser(
        userVisibleId ? (userVisibleId as string).toLowerCase().trim() : (userName as string).toLowerCase().trim()
      );
      if (!users.length) {
        return next(new HttpError(404, 'User Not Found.'));
      }
      return res.status(200).json({ users });
    } catch (error) {
      return next(catchErrorHandlerController(error));
    }
  }
}
