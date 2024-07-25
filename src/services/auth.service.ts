import { adminInstance, auth } from '../db/firebaseService';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { AuthDTO } from '../models/auth.models';
import { catchErrorHandler } from '../errors/catchErrorHandler';

export class AuthService {
  public static async createUser(name: string, email: string, password: string): Promise<AuthDTO['createUserResponse']> {
    try {
      const userRecord = await adminInstance.auth().createUser({
        email,
        password,
        displayName: name,
      });
      return { uid: userRecord.uid }
    } catch(error: unknown) {
      return catchErrorHandler(error, 'createUser');
    }
  }

  public static async loginUser(email: string, password: string): Promise<AuthDTO['loginUserResponseDTO']> {
    try {
      const login = await signInWithEmailAndPassword(auth, email, password);
      return { login }
    } catch(error: unknown) {
      return catchErrorHandler(error, 'loginUser');
    }
  }
}
