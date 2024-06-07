import { db } from '../db/firebaseService';

export const pingService = (): object => {
  return { message: 'pong' }
};

export const pingDbService = async (): Promise<any> => {
  const docRef = db.collection('test').doc('RH7TimcfFiBnq1IqgRZj');
  const doc = await docRef.get();
  return doc
};
