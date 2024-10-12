import jwt from 'jsonwebtoken';
import moment from 'moment';
import { adminInstance, auth, db } from '../db/firebase-service';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { AuthDTO } from '../models/auth.models';
import { HttpError } from '../utils/errors/http-error';
import { catchErrorHandler } from '../utils/errors/catch-error-handlers';
import { config } from '../utils/secrets/envs-manager';
import { EncryptationProcesses } from '../utils/secrets/encryptation-processes';

export class AuthService {
  public static async createUser(name: string, email: string, password: string): Promise<AuthDTO['createUserResponse']> {
    try {
      const userRecord = await adminInstance.auth().createUser({
        email,
        password,
        displayName: name
      });
      if (!userRecord) {
        throw new HttpError(404, 'createUser: failed firebase method createUser().');
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
      return catchErrorHandler('createUser', error);
    }
  }

  public static async loginUser(email: string, password: string): Promise<AuthDTO['loginUserResponseDTO']> {
    try {
      const login = await signInWithEmailAndPassword(auth, email, password);
      const uid = login.user.uid;
      if (!uid) {
        throw new HttpError(404, 'loginUser: failed signInWithEmailAndPassword.');
      }
      const userData = await db
        .collection('users')
        .doc(uid)
        .get()
        .then((doc) => (doc.exists ? doc.data() : ''));
      if (!userData) {
        throw new HttpError(404, 'loginUser: user not found.');
      }
      if (userData.isUserDisabled || userData.isUserDeleted) {
        throw new HttpError(403, 'loginUser: user is not available.');
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
      const { iv, encryptedData } = EncryptationProcesses.encyptData(payload);
      const userToken = jwt.sign({ encryptedData }, config.jwtSecretKey, { expiresIn: '3h' });
      if (!userToken) {
        throw new HttpError(400, 'loginUser: failed jsonwebtoken.');
      }
      return { iv, userToken };
    } catch (error: unknown) {
      return catchErrorHandler('loginUser', error);
    }
  }
}
