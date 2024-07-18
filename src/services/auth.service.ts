import { adminInstance, auth } from '../db/firebaseService';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { AuthDTO } from '../models/auth.models';

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
      if (error instanceof Error) {
        const code = (error as any).code;
        const message = error.message;
        return { code, message }
      }
      return { code: -1, message: 'Catch createUser Error' }
    }
  }

  public static async loginUser(email: string, password: string): Promise<AuthDTO['loginUserResponseDTO']> {
    try {
      const login = await signInWithEmailAndPassword(auth, email, password);
      return { login }
    } catch(error) {
      if (error instanceof Error) {
        const code = (error as any).code;
        const message = error.message;
        return { code, message }
      }
      return { code: -1, message: 'Catch loginUser Error' }
    }
  }
}
