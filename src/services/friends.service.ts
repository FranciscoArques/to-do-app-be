import { db } from '../db/firebase-service';
import { FriendsDTO } from '../models/friends.models';
import { catchErrorHandler } from '../utils/errors/catch-error-handlers';
import { HttpError } from '../utils/errors/http-error';

export class FriendsService {
  public static async searchUser(filter: { userVisibleId?: string; userName?: string }): Promise<FriendsDTO['filteredUsersDTO']> {
    const query = filter.userVisibleId
      ? db.collection('users').where('visibleId', '==', filter.userVisibleId)
      : filter.userName
        ? db.collection('users').where('name', '==', filter.userName)
        : null;
    if (!query) {
      throw new HttpError(404, 'searchUser: missing filters.');
    }
    try {
      const snapshot = await query.get();
      if (snapshot.empty) {
        throw new HttpError(404, 'searchUser: no user found.');
      }
      const users: FriendsDTO['filteredUserDTO'][] = [];
      snapshot.forEach((user) => {
        users.push({
          id: user.id,
          name: user.data().name || '-/-',
          lastConnection: user.data().lastConnection || '-/-'
        });
      });
      return { users };
    } catch (error: unknown) {
      return catchErrorHandler('searchUser', error);
    }
  }
}
