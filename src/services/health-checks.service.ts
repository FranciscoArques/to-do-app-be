import { db } from '../db/firebaseService';
import { HealthCheckDTO } from '../models/health-checks.models';
import { catchErrorHandler } from '../errors/catchErrorHandler';

export class HealthCheckService {
  public static ping(): HealthCheckDTO['pingResponse'] {
    return { message: 'pong' };
  }

  public static async pingDb(): Promise<HealthCheckDTO['pingDbResponse']> {
    try {
      const docRef = db.collection('test').doc('ping-db-response');
      const doc = await docRef.get();
      const result = doc.data();
      if (!result) {
        return { code: -1, message: 'pingDb: Firebase Fetch Error' };
      }
      return result;
    } catch (error: unknown) {
      return catchErrorHandler(error, 'pingDb');
    }
  }
}
