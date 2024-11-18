import { db } from '../db/firebase-service';
import { FriendsDTO } from '../models/friends.models';
import { catchErrorHandler } from '../utils/errors/catch-error-handlers';
import { HttpError } from '../utils/errors/http-error';

export class FriendsService {
  public static async searchUser(userVisibleId?: string, userName?: string): Promise<FriendsDTO['filteredUsersDTO']> {
    const query = userVisibleId
      ? db.collection('users').where('visibleId', '==', userVisibleId)
      : userName
        ? db.collection('users').where('name', '==', userName)
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
