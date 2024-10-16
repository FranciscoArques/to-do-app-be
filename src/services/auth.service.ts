import jwt from 'jsonwebtoken';
import moment from 'moment';
import { adminInstance, auth, db } from '../db/firebase-service';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { AuthDTO } from '../models/auth.models';
import { sendEmailInstances } from '../utils/send-email';
import { HttpError } from '../utils/errors/http-error';
import { catchErrorHandler } from '../utils/errors/catch-error-handlers';
import { Config } from '../utils/secrets/envs-manager';
import { EncryptationProcesses } from '../utils/secrets/encryptation-processes';

export class AuthService {
  public static async createUser(name: string, email: string, password: string, isAdmin: boolean = false): Promise<AuthDTO['createUserResponse']> {
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
        role: isAdmin ? 'admin' : 'client',
        creationDate: moment().format('DD-MM-YYYY HH:mm:ss'),
        lastConnection: moment().format('DD-MM-YYYY HH:mm:ss'),
        tasksCreated: 0,
        tasksCompleted: 0,
        tasksDroped: 0,
        isUserDisabled: false,
        isUserDeleted: false
      };
      await db.collection('users').doc(userRecord.uid).set(userData);
      const { acceptedEmail } = await sendEmailInstances('register-user', email);
      if (!acceptedEmail) {
        throw new HttpError(404, 'createUser: send email rejected.');
      }
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
      const userToken = jwt.sign({ encryptedData }, Config.jwtSecretKey, { expiresIn: '3h' });
      if (!userToken) {
        throw new HttpError(400, 'loginUser: failed jsonwebtoken.');
      }
      return { iv, userToken };
    } catch (error: unknown) {
      return catchErrorHandler('loginUser', error);
    }
  }

  public static async emailChangePassword(email: string): Promise<AuthDTO['emailChangePasswordResponseDTO']> {
    try {
      const snapshot = await db.collection('users').where('email', '==', email).get();
      if (snapshot.empty) {
        throw new HttpError(404, 'emailChangePassword: email not found.');
      }
      const { acceptedEmail } = await sendEmailInstances('send-email-change-password-user', email);
      if (!acceptedEmail) {
        throw new HttpError(404, 'emailChangePassword: send email rejected.');
      }
      const uid = snapshot.docs[0].data().uid || '';
      const { iv, encryptedData } = EncryptationProcesses.encyptData(uid);
      const payload = `${iv}:${encryptedData}`;
      const userToken = jwt.sign({ payload }, Config.jwtSecretKey, { expiresIn: '15m' });
      return { message: 'email sent', userToken };
    } catch (error: unknown) {
      return catchErrorHandler('emailChangePassword', error);
    }
  }

  public static async changePassword(token: string, newPassword: string): Promise<AuthDTO['changePasswordResponseDTO']> {
    try {
      const decodedToken = jwt.verify(token, Config.jwtSecretKey);
      const [iv, encryptedData] = decodedToken.split(':');
      const { uid } = EncryptationProcesses.decryptData(iv, encryptedData);
      if (!uid) {
        throw new HttpError(404, 'changePassword: uid not found.');
      }
      await adminInstance.auth().updateUser(uid, { password: newPassword });
      return { message: 'password successfully changed' };
    } catch (error: unknown) {
      return catchErrorHandler('changePassword', error);
    }
  }

  public static async disableUser(uid: string): Promise<AuthDTO['disableUserResponseDTO']> {
    try {
      await adminInstance.auth().updateUser(uid, { disabled: true });
      await db
        .collection('users')
        .doc(uid)
        .update({ isUserDisabled: moment().format('DD-MM-YYYY HH:mm:ss') });
      return { message: 'user is now disabled' };
    } catch (error: unknown) {
      return catchErrorHandler('disableUser', error);
    }
  }

  public static async enableUser(uid: string): Promise<AuthDTO['enabledUserResponseDTO']> {
    try {
      await adminInstance.auth().updateUser(uid, { disabled: false });
      await db.collection('users').doc(uid).update({ isUserDisabled: false });
      return { message: 'user is now enabled' };
    } catch (error: unknown) {
      return catchErrorHandler('enableUser', error);
    }
  }

  public static async deleteUser(uid: string): Promise<AuthDTO['deleteUserResponseDTO']> {
    try {
      const userData = await db
        .collection('users')
        .doc(uid)
        .get()
        .then((doc) => (doc.exists ? doc.data() : ''));
      if (!userData) {
        throw new HttpError(404, 'deleteUser: user not found on db.');
      }
      if (userData.isUserDeleted) {
        throw new HttpError(409, 'deleteUser: user already deleted.');
      }
      await adminInstance.auth().updateUser(uid, { disabled: true });
      await db
        .collection('users')
        .doc(uid)
        .update({ isUserDeleted: moment().format('DD-MM-YYYY HH:mm:ss') });
      return { message: 'user is now deleted' };
    } catch (error: unknown) {
      return catchErrorHandler('deleteUser', error);
    }
  }

  public static async restoreUser(uid: string): Promise<AuthDTO['restoreUserResponseDTO']> {
    try {
      const userData = await db
        .collection('users')
        .doc(uid)
        .get()
        .then((doc) => (doc.exists ? doc.data() : ''));
      if (!userData) {
        throw new HttpError(404, 'restoreUser: user not found on db.');
      }
      if (!userData.isUserDeleted) {
        throw new HttpError(409, 'restoreUser: user already restored.');
      }
      await adminInstance.auth().updateUser(uid, { disabled: false });
      await db.collection('users').doc(uid).update({ isUserDeleted: false });
      return { message: 'user is now restored' };
    } catch (error: unknown) {
      return catchErrorHandler('restoreUser', error);
    }
  }

  public static async deleteAdmin(): Promise<AuthDTO['deleteAdminResponseDTO']> {
    const usersUids: string[] = [];
    const thirtyDaysAgo = moment().subtract(30, 'days').format('DD-MM-YYYY HH:mm:ss');
    try {
      const snapshot = await db.collection('users').where('isUserDeleted', '<=', thirtyDaysAgo).get();
      if (!snapshot.empty) {
        snapshot.forEach((doc) => {
          usersUids.push(doc.id);
        });
      }
      const deleteUserDoc = usersUids.map((uid) => db.collection('users').doc(uid).delete());
      const deleteUserAuth = usersUids.map((uid) => adminInstance.auth().deleteUser(uid));
      await Promise.all([...deleteUserDoc, ...deleteUserAuth]);
      return { message: 'users in db deleted permanently', usersDeleted: usersUids.length };
    } catch (error: unknown) {
      return catchErrorHandler('deleteAdmin', error);
    }
  }
}
