import { adminInstance } from '../db/firebaseService';
import { AuthDTO } from '../models/auth.models';

export class AuthService {
  public static async createUser(name: string, email: string, password: string): Promise<AuthDTO['createUserResponse']> {
    let uid: string | undefined, code: string | undefined, message: string | undefined;
    try {
      const userRecord = await adminInstance.auth().createUser({
        email,
        password,
        displayName: name,
      });
      uid = userRecord.uid;
    } catch (error: unknown) {
      if (error instanceof Error) {
        code = (error as any).code;
        message = error.message;
      }
    }
    const result = { uid, code, message };
    return result
  }
}
