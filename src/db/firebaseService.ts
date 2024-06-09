import * as admin from 'firebase-admin';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import serviceAccount from './firebase.json';

class FirebaseService {
  private adminInstance: admin.app.App;
  private dbInstance: Firestore;

  constructor() {
    this.adminInstance = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
    });
    this.dbInstance = getFirestore(this.adminInstance);
  }

  public getAdmin(): admin.app.App {
    return this.adminInstance;
  }

  public getDb(): Firestore {
    return this.dbInstance;
  }
}

const firebaseServiceInstance = new FirebaseService();

export const adminInstance = firebaseServiceInstance.getAdmin();
export const db = firebaseServiceInstance.getDb();
