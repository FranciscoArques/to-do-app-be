import { db } from '../db/firebaseService';
import { HealthCheckDTO } from '../models/health-checks.models';

export class HealthCheckService {
  public static ping(): HealthCheckDTO['pingResponse'] {
    return { message: 'pong' };
  }

  public static async pingDb(): Promise<HealthCheckDTO['pingDbResponse']> {
    const docRef = db.collection('test').doc('ping-db-response');
    const doc = await docRef.get();
    const result = doc.data();
    return result;
  }
}
