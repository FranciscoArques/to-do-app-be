import * as admin from 'firebase-admin';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import serviceAccount from './firebase.json';

class FirebaseService {
  private adminInstance: admin.app.App;
  private dbInstance: Firestore;

  constructor() {
    console.log('\nInitializing Firebase Admin SDK\n');
    this.adminInstance = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
    });
    this.dbInstance = getFirestore(this.adminInstance);
    console.log('Firebase Admin SDK initialized\n');
  }

  public getAdmin(): admin.app.App {
    return this.adminInstance;
  }

  public getDb(): Firestore {
    return this.dbInstance;
  }
}

const firebaseServiceInstance = new FirebaseService();

export const db = firebaseServiceInstance.getDb();
