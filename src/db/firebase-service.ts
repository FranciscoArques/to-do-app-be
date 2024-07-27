import * as admin from 'firebase-admin';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import serviceAccount from './firebase.json';
import { initializeApp as initializeClientApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import firebaseClientConfig from './firebase.client.json';

class FirebaseService {
  private adminInstance: admin.app.App;
  private dbInstance: Firestore;
  private clientApp: FirebaseApp;
  private clientAuth: Auth;

  constructor() {
    this.adminInstance = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
    });
    this.dbInstance = getFirestore(this.adminInstance);
    this.clientApp = initializeClientApp(firebaseClientConfig);
    this.clientAuth = getAuth(this.clientApp);
  }

  public getAdmin(): admin.app.App {
    return this.adminInstance;
  }

  public getDb(): Firestore {
    return this.dbInstance;
  }

  public getClient(): FirebaseApp {
    return this.clientApp;
  }

  public getClientAuth(): Auth {
    return this.clientAuth;
  }
}

const firebaseServiceInstance = new FirebaseService();

export const adminInstance = firebaseServiceInstance.getAdmin();
export const db = firebaseServiceInstance.getDb();
export const auth = firebaseServiceInstance.getClientAuth();
