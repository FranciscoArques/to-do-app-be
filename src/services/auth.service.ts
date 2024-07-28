import jwt from 'jsonwebtoken';
import moment from 'moment';
import { adminInstance, auth, db } from '../db/firebase-service';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { AuthDTO } from '../models/auth.models';
import { catchErrorHandler } from '../errors/catch-error-handler';
import { config } from '../secrets/envs-manager';
import { encyptData, decryptData } from '../secrets/encrypt-process';

export class AuthService {
  public static async createUser(name: string, email: string, password: string): Promise<AuthDTO['createUserResponse']> {
    if (!name || !email || !password) {
      return { error: true, code: 400, message: 'createUser: missing parameters.' };
    }
    try {
      const userRecord = await adminInstance.auth().createUser({
        email,
        password,
        displayName: name
      });
      if (!userRecord) {
        return { error: true, code: 400, message: 'createUser: failed firebase method createUser.' };
      }
      const userData = {
        email,
        name,
        role: 'client',
        creationDate: moment().format('DD-MM-YYYY HH:mm:ss'),
        lastConnection: moment().format('DD-MM-YYYY HH:mm:ss'),
        tasksCreated: 0,
        tasksCompleted: 0,
        tasksDroped: 0,
        isUserDisabled: false,
        isUserDeleted: false
      };
      await db.collection('users').doc(userRecord.uid).set(userData);
      return { uid: userRecord.uid };
    } catch (error: unknown) {
      return catchErrorHandler(error, 'createUser');
    }
  }

  public static async loginUser(email: string, password: string): Promise<AuthDTO['loginUserResponseDTO']> {
    if (!email || !password) {
      return { error: true, code: 400, message: 'loginUser: missing parameters.' };
    }
    try {
      const login = await signInWithEmailAndPassword(auth, email, password);
      const uid = login.user.uid;
      if (!uid) {
        return { error: true, code: 400, message: 'loginUser: failed signInWithEmailAndPassword.' };
      }
      const userDoc = await db.collection('users').doc(uid).get();
      const userData = userDoc.data();
      if (!userDoc.exists || !userData) {
        return { error: true, code: 404, message: 'loginUser: user not found.' };
      }
      if (userData.isUserDisabled) {
        return { error: true, code: 403, message: 'loginUser: user is disbled.' };
      }
      const updatedUserData = {
        ...userData,
        lastConnection: moment().format('DD-MM-YYYY HH:mm:ss')
      };
      await db.collection('users').doc(uid).set(updatedUserData);
      const payload = {
        uid,
        email: userData.email,
        name: userData.name,
        role: userData.role
      };
      const { iv, encryptedData } = encyptData(payload);
      const userToken = jwt.sign({encryptedData}, config.jwtSecretKey, { expiresIn: '3h' });
      if (!userToken) {
        return { error: true, code: 404, message: 'loginUser: failed jsonwebtoken.' };
      }
      return { iv, userToken };
    } catch (error: unknown) {
      return catchErrorHandler(error, 'loginUser');
    }
  }
}
